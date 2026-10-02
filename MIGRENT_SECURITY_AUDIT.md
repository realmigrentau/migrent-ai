# MIGRENT SECURITY AUDIT

Audit date: 1 October 2026. Branch `feat/public-redesign` at `29c0601` (same code as live `main`).
Scope: FastAPI backend (246 routes), Next.js frontend (106 page files, 5 API routes, edge proxy), Supabase production database (56 tables, RLS policies, grants, triggers, advisors), live site https://migrent.vercel.app and API https://migrent-ai-backend.onrender.com.

Method: code reading of every route module and its auth dependency; read-only SQL against production (grants, policies, trigger source, counts); Supabase security and performance advisors; live HTTP checks (headers, CORS, exposed docs, route status); the project's own test suites. **Nothing destructive was run against production, and none of the findings below were exploited on production.** Database findings are proven from grants, policies and trigger source code, not by attempting the write.

Related: [MIGRENT_MASTER_AUDIT.md](MIGRENT_MASTER_AUDIT.md) (all issue IDs), [MIGRENT_LAUNCH_CHECKLIST.md](MIGRENT_LAUNCH_CHECKLIST.md).

---

## 1. Summary

The application layer is in good shape. The FastAPI Hub endpoints check ownership on every record, admin endpoints are protected server-side twice (database admin claim plus a separate panel password), the public data contract strips addresses and owner IDs, uploads are sniffed and re-encoded, the Stripe webhook verifies signatures and amounts, CORS is locked to Migrent's origins, API docs are hidden in production, and the site sends a strict hash-based Content Security Policy with HSTS preload. 187 backend tests (including an authorisation matrix) pass.

The serious problems sit **one layer below the API**: the Supabase REST API that every browser can reach with the public anon key plus its own sign-in token. Several older RLS policies still let a signed-in user write directly to tables that drive trust and enforcement, bypassing everything the backend checks. There are also legacy API routes, unused by the current frontend, that still return raw listing rows.

| ID | Severity | Finding |
|---|---|---|
| MIG-001 | **P0 Critical** | Any signed-in user can mark their own government ID as approved (forged "ID-checked host" badge, passes the publish gate) |
| MIG-002 | **P0 Critical** | A suspended user can lift their own suspension; most endpoints ignore suspension anyway; trust-signal profile fields are user-writable |
| MIG-003 | **P0 Critical** | Supabase service-role key, Stripe, Mailjet and Pinecone secrets are in git history; rotation not confirmed |
| MIG-004 | **P0 Critical** | Legacy endpoints return private listing data (street address, exact coordinates, owner IDs, unpublished listings) to any signed-in user |
| MIG-019 | P1 High | Two-step verification (MFA) is only enforced in the browser; the API accepts single-factor sessions, including admin |
| MIG-020 | P1 High | Unused legacy auth endpoints bypass hCaptcha and allow session fixation |
| MIG-016 | P1 High | Account deletion leaves ID documents and renter documents in storage; deletes the other party's evidence |
| MIG-018 | P1 High | Mentor and mentor-session rows are user-writable (ratings, "verified", status/amount) |
| MIG-010 | P1 High | Approved listings can be edited without re-moderation (bait-and-switch) |
| MIG-041 | P2 Medium | Guest support tickets: no rate limit or captcha, unescaped subject in HTML email, anon can insert tickets directly |
| MIG-032 | P2 Medium | User blocking is only reachable from a legacy page, is written straight from the browser, and fails open |
| MIG-036 | P2 Medium | Supabase hygiene: over-broad grants, `admin_users_view`, SECURITY DEFINER functions callable by anon, leaked-password protection off |
| MIG-046 | P2 Medium | Rate limits are in-process memory; Render start flags need confirming |
| MIG-057, MIG-058 | P3 Low | Listing image URLs not allow-listed; public geocode endpoint and help-vote endpoint can be abused |

---

## 2. Critical findings in detail

### MIG-001 - Host ID verification can be self-approved through the Supabase REST API

**Severity:** P0 Critical. **Area:** Security, Trust & Safety.
**Location:** table `public.owner_verification`; RLS policies `Users can insert own verification`, `Users can update own verification`; triggers `owner_verification_sync_profile` (`sync_profile_verification()`, SECURITY DEFINER) and `listings_require_verified_owner` (`guard_listing_publish()`); view `public.public_verification`.

**Evidence (production, read-only queries):**
- `authenticated` (and `anon`) hold `INSERT, UPDATE, DELETE, SELECT` on `owner_verification`; `authenticated` has UPDATE on all 18 columns including `id_status`, `fully_verified`, `email_verified`, `phone_verified`, `id_reviewed_by`, `id_reviewed_at`, `phone_otp_code`.
- UPDATE policy: `USING (auth.uid() = user_id)`, no `WITH CHECK`, no column guard. There is a guard trigger on `profiles` but **none on `owner_verification`**.
- `sync_profile_verification()` copies `id_status = 'approved' AND email_verified` into `profiles.identity_verified` as SECURITY DEFINER.
- `guard_listing_publish()` lets a listing go to `pending_approval`/`approved` when `owner_verification.fully_verified AND id_status = 'approved'`.
- `public_verification.government_id_verified` is `id_status = 'approved'`; this is what renders "ID-checked host" / "Government ID checked" on listings and profiles.

**How to reproduce (do NOT run against production; use a branch database):**
1. Sign up as a new owner. In the browser console, take the session access token.
2. `PATCH https://<project>.supabase.co/rest/v1/owner_verification?user_id=eq.<own id>` with headers `apikey: <public anon key>`, `Authorization: Bearer <own token>` and body `{"id_status":"approved","fully_verified":true,"email_verified":true}` (or `POST` a row if none exists).
3. The owner's profile now shows ID verified, the admin ID-check queue never sees them, and their listing passes the publish gate.

**Expected:** only Migrent staff (service role, via `routes_owner_verification.py` / Hub admin) can change verification state.
**Current:** any signed-in user can. `phone_otp_code` is also readable and writable by the user, so phone verification can be bypassed the same way.

**Recommended fix (migration):**
1. `REVOKE INSERT, UPDATE, DELETE ON public.owner_verification FROM anon, authenticated;` and drop the two user write policies. The upload flow already runs through the backend with the service role.
2. Add a BEFORE INSERT OR UPDATE guard (same pattern as `guard_profile_privilege_columns`) that rejects changes to `id_status, fully_verified, email_verified, phone_verified, id_reviewed_by, id_reviewed_at, phone_otp_*` unless `current_user` is `service_role`/`postgres`.
3. Stop exposing `phone_otp_code` to the user (`REVOKE SELECT (phone_otp_code, phone_otp_expires_at)` or move OTPs to a service-only table).
4. Audit: `select * from verification_audit_log where actor_type = 'owner' and new_status = 'approved'` and reset any self-approvals.
5. Add a backend test that asserts the anon/authenticated roles cannot write this table (extend `tests/test_authz_matrix.py` or a SQL test).

**Estimated effort:** S.

### MIG-002 - Suspension can be undone by the user and is ignored by most endpoints; trust-signal columns are user-writable

**Severity:** P0 Critical. **Area:** Security, Admin, Trust & Safety.
**Location:** `profiles` grants and trigger `guard_profile_privilege_columns()`; `backend/hub_common.py:135` (`hub_actor` is the only place `disabled_at` is checked); every route that uses `auth_utils.get_current_user` directly.

**Evidence:**
- `authenticated` has UPDATE on 69 `profiles` columns. The guard trigger protects only `role, is_admin, public_id, over_18_confirmed_at, verified, is_verified, identity_verified, identity_verification_url, verified_date, verification_method, average_rating, reviews_count`.
- Not protected, and therefore self-editable through REST: `disabled_at` (the suspension flag), `badges` (shown publicly; e.g. "Mega Host" displays as "Hosts 10+ homes"), `response_rate`, `response_time`, `months_hosting`, `email_verified`, `two_factor_enabled`, `onboarding_completed`, `legal_accepted_at`, `hub_onboarded_at`, `owner_kind`, `wishlist`, `recovery_password_hash`.
- `grep disabled_at backend/*.py` finds it only in `hub_common.py`, `routes_hub_admin.py` and a private-field list in `public_dto.py`. These endpoints accept a suspended account: `POST /messages/send`, `POST /listings`, `PATCH /listings/{id}`, `POST /listings/{id}/submit|resume|renew`, `POST /bookings`, `POST /reports`, `POST /reviews`, `POST /mentors`, `POST /mentors/sessions`, `PATCH /profiles/me`, `POST /owner-verification/id/upload`, `POST /support/tickets`.
- A suspended owner's listings stay published and searchable (docs/hub.md says so deliberately: "their listings are not changed").

**How to reproduce:** admin suspends account A in Admin panel > People. A sends `PATCH /rest/v1/profiles?id=eq.<A>` with `{"disabled_at": null}` and is reinstated. Without even doing that, A can keep calling `POST /messages/send` to message renters.

**Expected:** suspension stops all writes and messaging, hides the user's listings, and cannot be lifted by the user.
**Recommended fix:**
1. Add every admin- or system-controlled column to the guard (at least `disabled_at, badges, response_rate, response_time, months_hosting, email_verified, two_factor_enabled, onboarding_completed, onboarding_completed_at, hub_onboarded_at, legal_accepted_at`), or better: revoke column UPDATE broadly and grant back only the handful of self-service columns the browser still writes (if any; the Hub writes through the API).
2. One backend dependency, e.g. `get_active_user()`, that wraps `get_current_user` and rejects `disabled_at`; use it in every non-Hub write route (or retire those routes, see MIG-048).
3. Exclude listings whose owner is suspended from search, listing detail and sitemap (`public_listings` view join on `profiles.disabled_at is null`), and auto-pause them on suspension with an audit row.

**Estimated effort:** M.

### MIG-003 - Secrets in git history, rotation not confirmed

**Severity:** P0 Critical (until rotation is confirmed). **Area:** Security, Configuration.
**Location:** git history of `.env` at repo root: commit `4a84a68` (2026-02-07) added `SUPABASE_SERVICE_ROLE_KEY` (legacy JWT); `702cdad` (2026-03-15) added Mailjet API key and secret; `.env` stayed tracked until `d4c6b9e` (2026-05-31) with `STRIPE_SECRET_KEY` (test), `STRIPE_WEBHOOK_SECRET`, `PINECONE_API_KEY`.

**Why it matters:** the service-role key bypasses all RLS: full read/write of every table, every user's documents and messages. Anyone who has ever cloned the repository has it.

**What I could not verify:** whether these keys were rotated, and whether the GitHub repository is or was public. (I did not compare the historical values with the current ones.)

**Recommended fix (owner):**
1. In Supabase, rotate to the new API keys (`sb_secret_...`) and **disable the legacy JWT-based service_role and anon keys**, or rotate the JWT secret. Update Render and Vercel env vars.
2. Rotate the Mailjet key pair, the Pinecone key (or delete the Pinecone project; nothing uses it now), and roll the Stripe test secret and webhook secret.
3. If the repository was ever public or shared, treat all historical data as exposed and review Supabase logs.
4. Optionally purge history with `git filter-repo` (only after rotation; rotation is what actually fixes it).
5. Add secret scanning (GitHub secret scanning / gitleaks in CI).

**Estimated effort:** S (owner, about an hour).

### MIG-004 - Legacy endpoints return private listing data to any signed-in user

**Severity:** P0 Critical. **Area:** Security, Privacy.
**Location:** `backend/routes_seeker.py` (`GET /seeker/recommended`, `GET /seeker/wishlist`, `/seeker/bookings`, `/seeker/metrics`), `backend/routes_visa_matching.py` (`GET /visa/recommended`, `/visa/score`), `backend/routes_matches.py` (`GET /matches`), `backend/routes_owner.py`. None has a caller in the current frontend (the functions in `frontend/lib/api.ts` that call them are never imported).

**Evidence:**
- `/seeker/recommended` selects `address, owner_id, description, ...` from `listings` with **no `moderation_status` filter**: drafts, pending, rejected, paused, expired and deleted listings, with the full street address and the owner's account UUID.
- `/visa/recommended` does the same and adds exact `latitude, longitude`.
- `/matches` returns `select("*")` of approved listings: exact coordinates, owner UUID, spam score and reasons, moderation notes.
- `/seeker/wishlist` fetches listings by the IDs in `profiles.wishlist`, which the user can set to any listing ID (via `PATCH /profiles/me`, field `wishlist`, or REST), so any listing's street address can be read by ID.

This contradicts the public promise "Street addresses are shown once you book an inspection" and `docs/security/public-data-contract.md`.

**How to reproduce:** sign in, then `GET https://migrent-ai-backend.onrender.com/seeker/recommended?limit=20` with the Bearer token. (Production currently has 0 listings, so today it returns nothing; it leaks as soon as listings exist.)

**Recommended fix:** delete these routers from `main.py` (and the dead client functions), or, if any is wanted, rebuild it on `public_dto.to_public_listing` with the same filters as `/listings/search`. Remove `wishlist` from `ProfileUpdate`. Add authz-matrix tests asserting no endpoint other than owner/admin views returns `address`, `latitude`, `longitude` or `owner_id`.
**Estimated effort:** S.

---

## 3. High findings in detail

### MIG-019 - MFA is enforced only in the browser; admins are not required to use it

**Location:** `frontend/lib/hub/session.tsx:100` decides `needs-mfa`; the backend never checks the token's `aal` claim (`grep aal backend/*.py` finds only a read in `routes_hub.py:122`). `backend/admin_panel.py` uses one shared panel password for all admins.

**Impact:** a stolen password for an account that enrolled an authenticator still gets a full API session (aal1); the "Two-step verification" setting gives a false sense of protection. Admin accounts can operate without MFA at all.
**Fix:** in `get_current_user`/`hub_actor`, reject aal1 tokens for users who have a verified factor (Supabase sets `aal` in the JWT; factor existence via `auth.mfa_factors`), and require aal2 for every admin request. Replace the shared panel password with per-admin MFA (keep the panel lock as a UI convenience only). **Effort:** M.

### MIG-020 - Unused legacy auth endpoints bypass captcha and allow session fixation

**Location:** `backend/routes_auth.py` (`POST /auth/register`, `POST /auth/login`), `backend/routes_magic_auth.py` (`/auth/magic-signup`, `/auth/magic-login`, `/auth/cross-device/store`, `/auth/cross-device/poll`). No frontend callers.

- `/auth/register` and `/auth/magic-signup` create accounts from the server without the hCaptcha token the Hub sign-up sends (only an in-memory 3-5/min per-IP limit). If Supabase's server-side captcha enforcement is on, they fail; if it is off, they are an open bot sign-up and email-bombing path from Migrent's auth sender.
- `/auth/login` is a password-guessing oracle at 10/min per IP.
- `/auth/cross-device/store` is unauthenticated and **upserts** `access_token`/`refresh_token` under any client-chosen `polling_id`; `/poll` hands them to whoever asks. That is a session-fixation primitive and stores live tokens in a table.
**Fix:** remove these routers and drop `cross_device_tokens` (purge first). Confirm captcha enforcement is ON in Supabase Auth settings. **Effort:** S.

### MIG-016 - Account deletion: orphaned identity documents, destroyed evidence

**Location:** `backend/routes_account.py` `delete_account()`.
- Deletes rows but never removes Storage objects: owner ID document images, `renter-documents`, message attachments, listing photos and `maintenance-photos` remain. `docs/security/retention-and-deletion.md` lists ID deletion as "not yet automated".
- Deletes **both sides'** messages, all reviews written about the user and reports the user filed. A host who scams someone can delete the account and erase the conversation the victim needs for police or a tribunal, and wipe negative reviews before re-registering.
- No re-authentication step and no cooling-off period.
**Fix:** delete Storage objects by owner prefix; soft-delete with a retention hold (e.g. 90 days, or longer when there is an open report) for messages, reports and audit data, anonymising the deleted party instead of erasing the counterparty's copy; require recent sign-in (or password/MFA) before deletion; have counsel confirm retention periods under the Privacy Act (APP 11.2). **Effort:** M.

### MIG-018 - Mentor data is user-writable

**Location:** `mentors` and `mentor_sessions` grants/policies. `authenticated` can UPDATE `mentors.verified, rating, review_count, active, hourly_rate, stripe_account_id, stripe_onboarding_complete` on their own row (no WITH CHECK), and participants can UPDATE `mentor_sessions.status, amount, platform_fee, mentor_payout, stripe_session_id`.
**Impact:** a mentor can give themselves a "verified" flag and a 5-star rating with 999 reviews; a renter can mark a session paid without paying (the backend fix from 2026-10-01 only covers the API path).
**Fix:** revoke direct INSERT/UPDATE/DELETE from anon/authenticated on both tables; all writes through the API. **Effort:** S.

### MIG-010 - Approved listings can be changed without re-moderation

**Location:** `backend/routes_listings.py` `update_listing()` (line ~978). Content edits recompute `spam_score` but never call `apply_spam_result` or change `moderation_status`. The Hub edit page uses this endpoint.
**Impact:** a scammer gets a genuine listing approved, then swaps photos, price, address or description ("pay a holding deposit by bank transfer to secure"), and it stays live with the ID-checked badge.
**Fix:** treat edits to title, description, images, weekly_price, address/suburb/postcode or bond as material: send the listing back to `pending_approval` (or keep the old version live and queue the diff for review), and apply the spam action on rescan. **Effort:** S-M.

---

## 4. Medium and low findings

| ID | Finding | Location | Fix |
|---|---|---|---|
| MIG-041 | `POST /support/tickets` accepts guests with no rate limit and no captcha; `body.subject` is interpolated unescaped into the confirmation email HTML; RLS policy `tickets_user_insert` lets anon insert tickets directly. Sender is `onboarding@resend.dev` (Resend's test sender, which only delivers to the account owner). | `backend/routes_support_tickets.py:100-176`; `tickets` grants | Rate-limit + captcha for guests, `html.escape` all user text, revoke anon INSERT, move to the domain sender. |
| MIG-032 | Blocking lives only on legacy `/users/profile/[id]`; `blockUser()` inserts into `blocked_users` straight from the browser with a fresh Supabase client; Hub conversations offer Archive/Mute/Report but not Block; the block check in `send_message` logs and continues on error. | `frontend/lib/api.ts:756`, `backend/routes_messages.py:87-103` | Hub API endpoint for block/unblock, button in Conversation menu, fail closed. |
| MIG-036 | `admin_users_view` exposes `auth.users` (email, last sign-in) - rows are filtered by `is_superadmin()` so non-admins get none, but `authenticated` holds INSERT/UPDATE/DELETE/TRUNCATE grants on it; 38 tables visible in GraphQL to anon, 41 to authenticated (RLS still protects rows); SECURITY DEFINER functions `handle_new_user`, `is_superadmin`, `audit_owner_verification`, `sync_*` executable by anon; leaked-password protection disabled; `_backup_042_profile_badges` left in `public`; `btree_gist` in `public`. | Supabase advisors | Drop or move the view to a private schema; revoke table grants the browser does not need (the Hub never reads these tables directly); revoke EXECUTE from anon on trigger-only functions; enable leaked-password protection; drop the backup table. |
| MIG-046 | slowapi limits are per-process memory: reset on every deploy, not shared between instances. `Procfile` sets `--proxy-headers --forwarded-allow-ips="*"`, but Render uses the dashboard start command, not the Procfile. If the dashboard command lacks the flags, every user shares one rate-limit bucket. | `backend/limiter.py`, `backend/Procfile` | Confirm the Render start command; move limits to Redis (Upstash) before scaling. |
| MIG-057 | Listing `images` accept any URL string; nothing restricts them to Migrent storage. CSP blocks rendering of foreign hosts, so the effect is broken images and hotlinking. | `models.ListingCreate/Update` | Allow-list the Supabase storage prefix. |
| MIG-058 | `POST /geocode/address` is public (per-IP limit only) and proxies a paid geocoder; `POST /support/help/articles/{id}/vote` is public with no limit. | `routes_geocode.py`, `routes_support_tickets.py:525` | Require sign-in for geocoding; rate-limit or drop the vote endpoint (the help centre no longer uses the table). |

---

## 5. Authorisation review by surface

| Surface | Server-side control | Verdict |
|---|---|---|
| Hub endpoints (`/hub/*`, 120+ routes) | `hub_actor()` resolves the user, checks suspension and view-as; each record checked against `actor.id` (applications `_viewer_kind` returns 404 to non-parties; documents, tenancies, inspections, inbox keys all scoped) | ✅ Good. Tests in `test_hub.py`, `test_authz_matrix.py`. |
| Admin (`/hub/admin/*`, `/admin/*`, `/admin/spam/*`, owner-ID review, report queue) | `require_admin` (DB `is_admin`/role, never user_metadata) + live session check + panel unlock token (423 without) | ✅ Good server-side. ⚠️ No MFA requirement (MIG-019). |
| Old `/admin` pages | 307 redirect to Hub before rendering; `proxy.ts` 404s non-admins | ✅ |
| Listings owner actions (`PATCH/DELETE /listings/{id}`, pause/resume/renew/submit) | ownership check `owner_id == user` | ✅ IDOR-safe. ⚠️ No suspension check (MIG-002), no re-review (MIG-010). |
| Messages (`/messages/send`, threads) | sender must equal token user; listing context must belong to the conversation; attachments namespaced by sender | ✅ ⚠️ suspension ignored. |
| Bookings | party checks (`test_authz_matrix`) | ✅ |
| Profiles public | `PUBLIC_PROFILE_COLUMNS` allow-list, opaque `public_id` | ✅ |
| Legacy seeker/visa/matches/owner endpoints | token only, raw rows | ❌ MIG-004 |
| Supabase REST (anon key + user token) | RLS policies and grants | ❌ MIG-001, MIG-002, MIG-018; ⚠️ MIG-036 |
| Cron (`/internal/cron/*`) | `X-Cron-Secret` (401 without, even for admin) | ✅ |
| Stripe webhook | signature, idempotency on `payment_events`, amount/session match | ✅ `test_webhook.py` |
| Next API `/api/emails/send` | `INTERNAL_EMAIL_SECRET`, constant-time compare | ✅ |
| Next API `/api/emails/welcome-suite` | recipient from session only, per-instance dedupe | ✅ (never called by the Hub flow, see MIG-056) |
| Next API `/api/admin/verify` | session + constant-time + per-instance limit | ✅ but dead (legacy AdminGate) |

## 6. Things verified as secure (keep them)

- **Headers (live):** CSP with script-src hash and no `unsafe-inline`/`unsafe-eval`, `frame-ancestors 'self'`, HSTS 2 years + preload, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP.
- **CORS (live):** preflight from `https://evil.example` gets 400 with no `Access-Control-Allow-Origin`; only Migrent origins are echoed.
- **API docs (live):** `/docs` and `/openapi.json` return 404 in production.
- **Token checks:** local ES256 verification against JWKS with issuer/audience/expiry; admins re-verified live on every request so a forced sign-out bites immediately.
- **Admin claim:** from `profiles.is_admin`/role under the service role, never from user_metadata (tested).
- **RLS enabled on all 56 public tables**; the six RLS-off tables from the July scan are fixed. `listings`, `messages`, `reports`, `reviews`, `deals`, `referrals` have no client write grants.
- **Uploads:** magic-byte sniffing, size/dimension limits, re-encode to WebP (strips EXIF/GPS), private buckets with signed URLs for documents and attachments.
- **Public data contract:** `public_dto.py` strips street address, exact coordinates (rounded ~100 m), owner UUID and moderation fields from public listing JSON (except the legacy routes in MIG-004).
- **Redirect safety:** `lib/safeRedirect.ts` and the proxy only accept same-origin relative `next`/`return` targets.
- **XSS:** messages stored and rendered as plain text; no `dangerouslySetInnerHTML` with user data (the two uses are the font CSS and theme bootstrap constants).
- **Dependencies:** `npm audit --omit=dev` reports 0 vulnerabilities (Next 16.3.6 and MapLibre 6.11.2 were upgraded for the critical advisories on 2026-09).
- **Stripe:** live keys, webhook signature + idempotency + amount verification, mentor payouts via destination charges.

## 7. Owner actions that only you can do

1. Rotate the leaked keys (MIG-003) and confirm whether the GitHub repository was ever public.
2. Supabase Auth: turn on leaked-password protection; confirm captcha protection is enforced server-side.
3. Render: confirm the start command includes `--proxy-headers --forwarded-allow-ips="*"`; set `SENTRY_DSN`; confirm `CRON_SECRET` and the four scheduled jobs exist.
4. Approve and apply the RLS/grant migration for MIG-001, MIG-002, MIG-018, MIG-036 (backend deploy first, then migration, per the usual order).
5. Decide retention periods with counsel (MIG-016).
