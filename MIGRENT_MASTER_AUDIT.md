# MIGRENT MASTER AUDIT

**Audit date:** 1 October 2026
**Code audited:** branch `feat/public-redesign` at commit `29c0601` (identical to the live `main` deployment)
**Live site:** https://migrent.vercel.app (Vercel, Sydney functions) and API https://migrent-ai-backend.onrender.com (Render)
**Database:** Supabase project `nsnwwfbidishftlrimer` (Sydney), inspected read-only

**Companion files**

| File | What is in it |
|---|---|
| `MIGRENT_MASTER_AUDIT.md` (this file) | Executive summary, platform map, every issue in full, permissions matrix, user journeys, master action table, roadmap |
| [MIGRENT_LAUNCH_CHECKLIST.md](MIGRENT_LAUNCH_CHECKLIST.md) | Renter, landlord, property manager, admin, security, mobile, accessibility, SEO and performance checklists |
| [MIGRENT_ROUTE_AUDIT.md](MIGRENT_ROUTE_AUDIT.md) | Page-by-page review of every route, plus the API surface |
| [MIGRENT_SECURITY_AUDIT.md](MIGRENT_SECURITY_AUDIT.md) | Security findings with evidence and fixes |
| [MIGRENT_UX_AUDIT.md](MIGRENT_UX_AUDIT.md) | First-time visitor, renter, landlord, PM and admin experience; trust; content; responsive; themes; accessibility; performance; SEO; microcopy; navigation; competition |

## How this audit was done

| Activity | What was actually done |
|---|---|
| Codebase | Read the routing, proxy, Next config, every backend router and its auth dependency (246 API routes enumerated programmatically), migrations-era DB objects, content data files, email code |
| Build checks | `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm audit`, production `next build`, Playwright e2e + axe (desktop + Pixel 7), backend `pytest` |
| Live site | Every public route requested and status-checked; key pages read and clicked in a real browser; malformed search inputs; route sweep of legacy URLs; security headers; CORS; API docs exposure; DNS |
| Automated live checks | Playwright against production: SEO metadata on 35 routes; axe WCAG 2.2 AA on 32 pages in light and dark; mobile performance on 7 pages (Pixel 7, 1.6 Mbps / 150 ms, 4x CPU); WebKit (iPhone 13, desktop Safari) and Firefox smoke tests on 6 pages in light and dark; overflow check at 320 px on 22 pages |
| Signed-in roles | Production has no listings and I did not create accounts on production. Renter, owner and admin journeys were run by hand on the production build against the project's mock API (`npm run preview:e2e`, fixture accounts), plus the 251-test Playwright suite that covers renter, tenant, owner and admin journeys |
| Database | Read-only SQL: table counts, grants, RLS policies, trigger source, extensions; Supabase security and performance advisors |

**Limits, stated plainly:** no write was made to production; no real email delivery or real card payment was tested; "Safari" means the WebKit engine in Playwright, not a physical iPhone; no legal claim in the site's content was verified as correct (items needing a lawyer are flagged as such); two owner-side facts could not be checked from here (whether leaked keys were rotated and whether the GitHub repo was ever public; Render plan and start command).

---

## 1. Executive Summary

### Overall state

Migrent is a well-engineered product with an empty shelf and a few holes in the floor.

The code quality, design system, accessibility and honesty of the copy are well above a typical pre-launch startup: builds are clean, 584 automated tests pass, axe finds one colour-contrast issue across 32 pages in two themes, suburb data is sourced line by line, and the Hub covers the full rental lifecycle (Rental Profile, applications, inspections, messages, tenancy, rent record, repairs, moderation). But:

1. **There is nothing to rent.** Production has **0 listings, 0 properties, 0 mentors, 0 messages and 11 users**. The homepage's "Available now - Rooms you can move into" section renders no rooms, and search says "No rooms match your search. Try removing some filters" with no filters applied.
2. **The trust promise can be forged.** Any signed-in user can mark their own government ID as approved through Supabase's REST API, which produces the public "ID-checked host" badge and passes the publish gate. A suspended user can lift their own suspension, and most API routes ignore suspension anyway.
3. **The legal pages describe a different business.** The Terms of Service, Disclaimer, Community Guidelines, Dispute Resolution and ABN pages describe a "$99 per successful match" fee, a "$19 seeker verification fee" and an "AI-powered matching service", while Stripe is live and the product charges $99 once per property for stays only.
4. **Migrent has no domain identity.** migrent.com.au has no DNS records at all; every support, legal and safety contact is a Gmail address; transactional email is sent from Gmail (via Mailjet) and from Resend's test sender.
5. **There is no measurement.** Vercel Web Analytics is not enabled on the project (its script 404s on every page), no product events are tracked, Sentry is off.

### What is already strong

- **Hub (signed-in app):** complete renter, owner, tenant and admin flows; applications with a frozen profile snapshot; inspections in the property's timezone; street address released only on booking; audited admin actions with written reasons.
- **Public data contract:** listing JSON hides street address, exact coordinates and owner IDs (except the legacy routes in MIG-004).
- **Security basics:** strict hash-based CSP, HSTS preload, locked CORS, hidden API docs, upload sniffing and EXIF stripping, signed Stripe webhooks, admin checks from the database, 187 backend tests including an authorisation matrix.
- **Suburb guides:** all 15,334 ABS suburbs and localities, every figure labelled with source and date, honest about what it does not know (no fake walk scores or commute times).
- **Honest, plain-English copy** on the redesigned public pages and Help Centre; migrant-aware Rental Profile ("This is my first rental in Australia", "You never need to share your nationality, visa, religion or age").
- **Accessibility:** WCAG 2.2 AA clean except one chip colour; skip link; labelled controls; keyboard order logical.
- **Responsive:** no horizontal overflow on 22 pages at 320 px; WebKit and Firefox render cleanly with no script errors.

### Biggest weaknesses

1. Supply: zero listings and zero mentors (MIG-005).
2. Database-level trust and enforcement bypasses through the Supabase REST API (MIG-001, MIG-002, MIG-018).
3. Legacy API surface still live and leaking private listing data (MIG-004, MIG-020).
4. Legal documents out of step with the product, and an unconfirmed legal entity (MIG-006).
5. No domain, no professional email, no analytics, no monitoring (MIG-014, MIG-015).
6. Trust features that exist in the design but not in practice: reviews cannot be created (MIG-011), the public listing page has no Report button (MIG-009), approved listings can be edited without review (MIG-010), suspension does not stop messaging (MIG-002).
7. Broken pieces on high-traffic surfaces: every suburb page says room data is unavailable (MIG-007); the host card's Message button lands on an empty inbox (MIG-008); the support panel is clipped on every phone (MIG-012).

### Launch blockers (must be fixed before public launch)

P0: MIG-001, MIG-002, MIG-003, MIG-004, MIG-005.
P1 launch-critical: MIG-006 (legal), MIG-007, MIG-008, MIG-009, MIG-010, MIG-012, MIG-013, MIG-014 (domain/email), MIG-015 (analytics), MIG-016, MIG-017 (bond), MIG-018 (mentors), MIG-019, MIG-020, MIG-021, MIG-065 (contact form). MIG-011 (reviews) can ship as "coming" if the empty Reviews UI is removed.

### Strongest opportunities

1. **Be the anti-scam rental platform.** Migrent already has the pieces (ID-checked hosts, address-after-inspection, bond-goes-to-the-state messaging). Close the bypasses, add scam-pattern warnings in messages, a Report button everywhere, and verified reviews tied to real tenancies, and say so loudly.
2. **Newcomer-ready listings.** A per-listing "No Australian rental history needed / overseas income OK / student visa OK" signal plus a move-in cost line (bond + rent in advance) is something no competitor shows.
3. **Languages.** The audience reads English as a second language; the i18n plumbing exists but ships English only. Key flows (search, listing, safety, Rental Profile) in Mandarin, Hindi, Nepali, Vietnamese and Arabic would be a genuine moat.
4. **Suburb guides as the SEO engine.** 15,334 honest, sourced pages are an asset no Facebook group has; connect them to live rooms ("Rooms in Parramatta") once supply exists.
5. **Founding-host supply programme** in two or three migrant-dense Sydney suburbs (Parramatta, Strathfield, Burwood) before broad launch.

---

## 2. Platform Map

### Architecture

| Layer | What it is |
|---|---|
| Frontend | Next.js 16.3.6 Pages Router, React 19, Tailwind 4, framer-motion, Lenis, MapLibre 6 (MapTiler tiles), i18next (English only enabled), Vercel `syd1` |
| Edge | `frontend/proxy.ts` (Next 16 "proxy"): Hub session guard, `/admin` DB-claim check, private site pages to sign-in |
| Signed-in app | "Migrent Hub" at `/hub/*` (`pages/hub`, `components/hub`, `lib/hub`), own shell, stale-while-revalidate cache |
| Backend | FastAPI (Python 3.12) on Render, 37 routers, 246 routes; service-role Supabase client; slowapi in-memory rate limits; JSON logs with redaction |
| Database | Supabase Postgres (Sydney), 56 public tables, RLS on all; views `public_listings`, `public_profiles`, `public_verification`; triggers guard publish and profile privilege columns |
| Auth | Supabase Auth: email + password (10+ chars), magic link, Google OAuth, optional TOTP MFA, invisible hCaptcha on sign-in/up/forgot |
| Roles | renter (`profiles.role='seeker'`), owner (`'owner'`, `owner_kind` individual or property_manager), admin (`is_admin` or admin role, granted in DB) |
| Storage | Supabase buckets: listing photos (public, re-encoded WebP), owner ID documents, `renter-documents`, message attachments, `maintenance-photos` (private, signed URLs) |
| Payments | Stripe live: $99 host fee per property at first confirmed stay; mentor sessions via Connect destination charges (30% platform fee); $19 renter check disabled |
| Email | Backend: Mailjet with `FROM_EMAIL` defaulting to `migrentau@gmail.com`; support/report emails via Resend from `onboarding@resend.dev`; frontend React Email via `lib/resend-client.ts`; Supabase Auth emails |
| Notifications | `notifications` table (Hub Activity) + email by preference group; web push via service worker + FCM |
| Search | `/listings/search` with ~30 URL-synced filters; map with WebGL fallback; Hub Discover with map |
| Suburb data | `frontend/data/suburbs/*` generated from ABS 2021 Census + OpenStreetMap, read with `fs` at build/ISR |
| Analytics/monitoring | Speed Insights loads; Web Analytics not enabled on Vercel; Sentry wired but no DSN; no uptime monitor confirmed |
| Scheduled jobs | `/internal/cron/*` with `X-Cron-Secret` (saved-search alerts, inspection reminders, expiry); `pg_cron` is not installed |

### Routes

Status key: ✅ Working · ⚠️ Needs improvement · ❌ Broken · 🚧 Incomplete. Every route has its own section in [MIGRENT_ROUTE_AUDIT.md](MIGRENT_ROUTE_AUDIT.md).

**Public site**

| Route | Purpose | User role | Status |
|---|---|---|---|
| `/` | Homepage, doll's-house configurator, value proposition | All | ⚠️ empty "Available now" section, unbacked claims, help bubble covers search on phones |
| `/seeker/search` | Room search with filters and map | All | ⚠️ misleading empty state, noindex, sort hydration mismatch |
| `/listing/[id]` | Public listing detail | All | ⚠️ host Message button broken (❌ MIG-008), no Report, no bond |
| `/how-renting-works` | Renter explainer (merged pages) | All | ✅ |
| `/for-owners` | Owner pitch + earnings estimate | All | ✅ |
| `/pricing` | Fees | All | ⚠️ stays vs tenancies unexplained; contradicts legal pages |
| `/guides` | Guides hub | All | ⚠️ thin (4 articles) |
| `/guides/rental-laws` | Rental law by state | All | ⚠️ unsourced, undated, no boarders/lodgers |
| `/guides/[id]` | Long-form guides | All | 🚧 all 8 hidden (404 or temporary redirects) |
| `/blog/[slug]` | 4 articles | All | ✅ |
| `/help`, `/help/[slug]`, `/help/category/[slug]` | Help Centre | All | ✅ accurate; one stale reference to a Report button the public page lacks |
| `/suburbs` | Suburb directory, 15,334 places | All | ✅ |
| `/suburb/[state]/[slug]` | Suburb guide | All | ⚠️ "Live room data is temporarily unavailable" on every page (❌ MIG-007) |
| `/suburb/[name]` (file `[state].tsx`) | Old URL resolver (301 / chooser / 404) | All | ✅ |
| `/mentors` | Mentor search | All | ⚠️ 0 mentors; not ID-checked |
| `/mentor/[id]` | Mentor profile | All | ⚠️ unknown id returns 200 + indexable |
| `/become-mentor` | Mentor sign-up | Signed-in | ⚠️ no ID check; client-rendered |
| `/users/profile/[id]` | Public host profile (legacy) | All | ⚠️ unknown id returns 200 + indexable; only place with Block |
| `/about` | Company story, careers, press | All | ⚠️ no named people or entity |
| `/contact` | Contact form | All | ❌ messages never reach the Admin panel (MIG-065); Gmail address |
| `/legal` + 12 policy pages | Legal centre | All | ❌ fee model and service description wrong (MIG-006) |
| `/support/tickets`, `/support/tickets/[id]` | Customer's support requests | Signed-in | ✅ (lint warnings) |
| `/booking-success`, `/booking-cancelled` | Stripe return pages (host fee) | Signed-in | ✅ |
| `/mentor-session-success` | Stripe return (mentor) | Signed-in | ✅ |
| `/verification-success`, `/verification-cancelled` | $19 renter check returns | Signed-in | 🚧 feature disabled; pages orphaned |
| `/reviews/[dealId]` | Leave a review for a deal | Signed-in | ❌ deals retired, can never be used (MIG-011) |
| `/auth/callback` | Legacy auth callback (Supabase Site URL fallback) | All | ✅ |
| `/404`, `/500` | Error pages | All | ✅ |
| `/sitemap.xml`, `/sitemap-suburbs.xml`, `/robots.txt` | SEO | Crawlers | ✅ (listings capped at 100) |
| `/api/suburbs/search`, `/api/suburbs/region` | Suburb autocomplete data | All | ✅ |
| `/api/emails/send` | Internal email relay (secret header) | Server | ✅ |
| `/api/emails/welcome-suite` | Welcome emails | Signed-in | 🚧 never called by Hub sign-up |
| `/api/admin/verify` | Old AdminGate passphrase | Admin | 🚧 dead code |
| `/admin/*` (11 files) | Old admin console | Admin | 🚧 unreachable (307 to Hub); dead code |
| ~40 legacy URLs (`/dashboard`, `/owner/*`, `/signin`, `/faq`, `/features`, ...) | Redirects | All | ✅ (see route audit) |

**Migrent Hub (all require sign-in; `noindex`)**

| Route | Purpose | User role | Status |
|---|---|---|---|
| `/hub/sign-in`, `/hub/sign-up`, `/hub/forgot-password`, `/hub/reset-password`, `/hub/auth/callback`, `/hub/verify-mfa` | Auth | Guest | ✅ (sign-up slow on mobile) |
| `/hub/welcome` | Role, name, 18+ and terms | New user | ✅ |
| `/hub` | Role-specific home | All | ✅ |
| `/hub/discover` | Search with map | Renter | ✅ |
| `/hub/homes/[id]` | Listing detail in Hub (Report, Share, Compare) | Renter | ✅ |
| `/hub/compare` | Compare saved homes | Renter | ✅ |
| `/hub/saved` | Saved homes and searches | Renter | ✅ |
| `/hub/profile` | Rental Profile | Renter | ✅ |
| `/hub/apply/[listingId]` | Application | Renter | ✅ |
| `/hub/applications`, `/hub/applications/[id]` | Applications (both sides) | Renter, Owner | ✅ |
| `/hub/inspections` | Inspection slots and bookings | Renter, Owner | ✅ |
| `/hub/messages/[[...key]]` | Inbox | All | ⚠️ ignores `?listing=&to=` (MIG-008); no Block |
| `/hub/my-home`, `/hub/tenancies`, `/hub/tenancies/[id]`, `/hub/maintenance/[id]` | Tenancy, rent record, repairs | Tenant, Owner | ✅ |
| `/hub/properties`, `/hub/properties/new`, `/hub/properties/[id]` | Portfolio, 6-step wizard | Owner | ⚠️ weak location validation; no PM tooling |
| `/hub/listings/[id]`, `/hub/listings/[id]/edit` | Manage a listing | Owner | ⚠️ edits skip re-review (MIG-010) |
| `/hub/insights` | Views, saves, enquiries (recorded only) | Owner | ✅ |
| `/hub/activity` | Notifications | All | ✅ |
| `/hub/settings`, `/hub/me` | Account, security, privacy, delete | All | ⚠️ deletion leaves files (MIG-016) |
| `/hub/locked` | After 3 wrong admin passwords | Admin | ✅ |
| `/hub/admin`, `/listings`, `/id-checks`, `/reviews`, `/reports`, `/support`, `/people`, `/audit` | Admin panel | Admin | ⚠️ works; tooling gaps (MIG-024, MIG-025) |

**Backend API:** 246 routes in 37 routers. About 45 have no caller in the current frontend, not counting the server-to-server cron and Stripe webhook routes (legacy seeker, owner, visa, matches, deals, referrals, password/magic/cross-device auth, geocode, validate, legacy messages read endpoints). Full list and auth per route in the route audit.

---

## 3. Critical Launch Blockers and all issues

Priority definitions: **P0** critical (security, data exposure, core journey impossible), **P1** high (broken important flow, legal/trust blocker), **P2** medium (confusing UX, incomplete features, weak validation), **P3** low (polish).

### P0 - Critical

### MIG-001 - Any signed-in user can mark their own government ID as approved

**Severity:** Critical (P0)
**Area:** Security / Trust & Safety
**Location:** Supabase table `owner_verification` (policies "Users can insert own verification", "Users can update own verification"; trigger `sync_profile_verification`; `guard_listing_publish`; view `public_verification`)

**Problem:** Signed-in users hold INSERT and UPDATE on all 18 columns of `owner_verification`, including `id_status` and `fully_verified`, and there is no guard trigger. Setting `id_status='approved'` flows (via a SECURITY DEFINER trigger) into `profiles.identity_verified`, the public "ID-checked host" / "Government ID checked" badge, and the database rule that allows a listing to be published. The core promise on the homepage ("Every host is ID-checked before a room goes live") can be forged by anyone with a browser console. `phone_otp_code` is also user-readable.

**How to reproduce (on a branch database, never production):**
1. Create an owner account; copy the session token from the browser.
2. `PATCH /rest/v1/owner_verification?user_id=eq.<own id>` with the public anon key, the token and `{"id_status":"approved","fully_verified":true,"email_verified":true}`.
3. Reload the owner's public profile: "Government ID checked" shows; their listing passes the publish gate; the admin ID-check queue never shows them.

**Expected behaviour:** only Migrent staff (backend service role) can change verification state.
**Current behaviour:** the user can.
**Recommended fix:** revoke client write grants on `owner_verification`, drop the two write policies, add a column guard trigger, hide OTP columns, audit `verification_audit_log` for owner-made approvals, add a regression test. Details in the security audit.
**Estimated effort:** S

### MIG-002 - Suspension can be lifted by the user and is ignored outside the Hub; trust-signal fields are user-writable

**Severity:** Critical (P0)
**Area:** Security / Admin / Trust & Safety
**Location:** `profiles` grants and `guard_profile_privilege_columns()`; `backend/hub_common.py:135`; routes using `get_current_user` (`routes_messages.py`, `routes_listings.py`, `routes_bookings.py`, `routes_reports.py`, `routes_reviews.py`, `routes_mentors.py`, `routes_profiles.py`, `routes_owner_verification.py`, `routes_support_tickets.py`)

**Problem:** (a) `profiles.disabled_at` is not in the protected-column list, so a suspended user can clear it through the REST API. (b) Only `/hub/*` endpoints check it; `POST /messages/send`, `POST/PATCH /listings`, `POST /bookings`, reports, reviews and mentor routes accept suspended accounts. (c) Suspended owners' listings stay live. (d) `badges` (shown publicly as "Hosts 3+ homes"/"Hosts 10+ homes"), `response_rate`, `response_time`, `months_hosting`, `email_verified`, `two_factor_enabled` and `onboarding_completed` are also user-editable.

**How to reproduce:** suspend a test account in Admin > People; from that account call `POST /messages/send` (succeeds) or `PATCH /rest/v1/profiles?id=eq.<id>` with `{"disabled_at":null}` (reinstated).
**Expected behaviour:** suspension blocks every write and message, hides listings and cannot be self-reversed; trust signals are system-computed only.
**Current behaviour:** suspension is advisory.
**Recommended fix:** extend the guard (or revoke column UPDATE broadly), add a `get_active_user` dependency to all non-Hub write routes (or retire them), exclude suspended owners from `public_listings` and auto-pause on suspension.
**Estimated effort:** M

### MIG-003 - Secrets committed to git history; rotation unconfirmed

**Severity:** Critical (P0) until rotation is confirmed
**Area:** Security / Configuration
**Location:** git history of `/.env`: `4a84a68` (Supabase service-role key, 2026-02-07), `702cdad` (Mailjet key and secret), present until `d4c6b9e` (2026-05-31) with Stripe test secret, webhook secret and Pinecone key

**Problem:** the Supabase service-role key bypasses all RLS. Anyone who has cloned the repository has had it for months.
**How to reproduce:** `git show d4c6b9e^:.env` (values not reproduced here).
**Expected behaviour:** no live secret ever recoverable from git.
**Current behaviour:** unknown whether rotated; unknown whether the repo was ever public.
**Recommended fix (owner):** move Supabase to new API keys and disable legacy JWT keys (or rotate the JWT secret); rotate Mailjet, Stripe test and webhook secrets; delete the Pinecone project; add secret scanning in CI; optionally purge history after rotating.
**Estimated effort:** S

### MIG-004 - Legacy endpoints return private listing data to any signed-in user

**Severity:** Critical (P0)
**Area:** Security / Privacy
**Location:** `backend/routes_seeker.py`, `backend/routes_visa_matching.py`, `backend/routes_matches.py`, `backend/routes_owner.py`; `models.ProfileUpdate.wishlist`

**Problem:** `GET /seeker/recommended` and `/visa/recommended` return listings of every status (draft, rejected, deleted) with full street address and owner UUID, `/visa/recommended` adds exact coordinates, `/matches` returns `select *`, and `/seeker/wishlist` returns any listing whose ID the user writes into their own `wishlist`. None is used by the current site. This breaks the "street address after inspection" promise.
**How to reproduce:** sign in, call `GET /seeker/recommended?limit=20` with the Bearer token.
**Expected behaviour:** only the public contract leaves the API for non-owners.
**Current behaviour:** raw rows (0 rows today only because production has 0 listings).
**Recommended fix:** remove the four routers and the dead client functions; drop `wishlist` from `ProfileUpdate`; add tests that no non-owner response contains `address`, `latitude`, `longitude` or `owner_id`.
**Estimated effort:** S

### MIG-005 - The marketplace is empty in production

**Severity:** Critical (P0) - business/operational
**Area:** Renter / Landlord / Growth
**Location:** production database; `components/home/RoomsNow.tsx`; `pages/seeker/search.tsx` empty state; `/mentors`

**Problem:** 0 listings, 0 properties, 0 mentors, 0 messages, 0 bookings, 11 users. The homepage section "AVAILABLE NOW - Rooms you can move into." renders no cards; search shows "No rooms match your search. Try removing some filters" without filters; the homepage promotes mentors that do not exist.
**How to reproduce:** open https://migrent.vercel.app and https://migrent.vercel.app/seeker/search; `GET /listings/search` returns `[]`.
**Expected behaviour:** a renter can find at least a handful of real rooms in the launch suburbs; empty areas are honest and convert to alerts.
**Current behaviour:** every renter journey ends at an empty result.
**Recommended fix:** run a founding-host programme (25-50 listings concentrated in 2-3 Sydney suburbs) before public launch; until then hide "Available now" and the mentors teaser, replace the empty search state with "We are onboarding the first hosts in Sydney - get an alert" plus saved-search sign-up; launch to a waitlist rather than the open public.
**Estimated effort:** L (business), S (code)

### P1 - High

### MIG-006 - Legal pages describe a different fee model and service than the product

**Severity:** High (P1) - legal launch blocker
**Area:** Legal / Content / Payments
**Location:** `/terms-of-service` (section 5), `/disclaimer` (section 3), `/rules-community-guidelines`, `/support-disputes`, `/abn-terms`; source pages under `frontend/pages/*.tsx`

**Problem:** Terms say "Owners agree to pay a one-time AUD $99 platform fee per successful match... at the time a deal is confirmed" and "Seekers may be presented with an optional one-time AUD $19 verification fee". The ABN page calls Migrent "an AI-powered matching service" with a "Deal Confirmation Fee" and a $19 verification fee, and lists entity type "Being confirmed". All legal pages say "Last updated: March 2026" (before the Hub and the current fee model). The product charges $99 once per property at the first confirmed stay, nothing for long-term tenancies, nothing to renters, and has no AI matching. Stripe is live. `docs/hub.md` also records the per-property vs per-listing fee as an open decision.
**How to reproduce:** compare `/pricing` with `/terms-of-service#5` and `/abn-terms`.
**Expected behaviour:** one fee model, stated identically everywhere, in terms a lawyer has reviewed, with a version date.
**Current behaviour:** contradictory; potential misleading-conduct exposure under the Australian Consumer Law and an unclear contract for the fee being charged.
**Recommended fix:** decide the fee model; rewrite all legal pages from one source (`lib/siteIdentity.ts` already centralises fees); confirm the legal entity; have Australian counsel review Terms, Privacy, Disclaimer and the introduction-service positioning; record the accepted terms version per user.
**Estimated effort:** M (+ counsel)

### MIG-007 - Every suburb page says "Live room data is temporarily unavailable"

**Severity:** High (P1)
**Area:** Suburbs / SEO / Renter
**Location:** `frontend/lib/suburbs/listings.server.ts` `fetchActiveListings()`; `pages/suburb/[state]/[slug].tsx:152`; `/suburbs`

**Problem:** the function queries the `listings` table with the anon key. Migration 042 removed anon SELECT on `listings` (confirmed: only `authenticated` has SELECT), so the query errors and the function returns `null` on all 15,334 pages, permanently.
**How to reproduce:** open https://migrent.vercel.app/suburb/nsw/parramatta (also carlton, perth, adelaide, hobart...).
**Expected behaviour:** "No verified rooms in Parramatta yet" (or the real count).
**Current behaviour:** an error message on the site's largest SEO surface.
**Recommended fix:** query the `public_listings` view (anon has SELECT) or the backend `/listings/search`; add a unit test with a mocked permission error.
**Estimated effort:** XS

### MIG-008 - "Message {host}" on the public listing page opens an empty inbox

**Severity:** High (P1)
**Area:** Renter
**Location:** `frontend/components/listings/OwnerCard.tsx:23`; `pages/hub/messages/[[...key]].tsx`

**Problem:** the host card links to `/messages?listing=<id>&to=<public_id>`. That redirects to `/hub/messages?...`, which ignores both parameters and shows "Pick a conversation".
**How to reproduce:** as a signed-in renter, open a listing, click "Message {name}" in the host card (verified on the production build with the mock API).
**Expected behaviour:** a conversation with that host about that home opens, ready to type (as the bottom "Message" button does via `/hub/homes/[id]?intent=message`).
**Current behaviour:** empty inbox; the renter cannot tell what went wrong.
**Recommended fix:** point the host card at the same `intent=message` route, or teach the inbox to start an enquiry from `?listing=`.
**Estimated effort:** XS

### MIG-009 - Public listing page has no Report button and no payment-safety warning; guests cannot report

**Severity:** High (P1)
**Area:** Trust & Safety / Renter
**Location:** `pages/listing/[id].tsx`; `backend/routes_reports.py` (requires sign-in)

**Problem:** the only report path on the public listing is the footer link "Report a safety issue" (a policy page with a Gmail address). The Hub version of the same listing has "Report this listing" and "Never pay rent or a deposit before you have inspected and signed"; the public version has neither. The Help Centre tells people to "use Report on the listing page".
**Expected behaviour:** one-tap Report on every listing, profile and message for everyone, with the safety warning next to the contact buttons.
**Current behaviour:** missing on the page most renters land on from search and Google.
**Recommended fix:** reuse `components/hub/ReportDialog.tsx` on the public page (sign-in or a captcha-protected guest report), add the warning panel.
**Estimated effort:** S

### MIG-010 - Approved listings can be changed without re-moderation

**Severity:** High (P1)
**Area:** Trust & Safety / Landlord
**Location:** `backend/routes_listings.py` `update_listing()`; used by `pages/hub/listings/[id]/edit.tsx`

**Problem:** title, description, photos, price and address can be edited on a live listing; the spam score is recalculated but never acted on and the status stays `approved`.
**Expected behaviour:** material edits go back through review (or the old version stays live while the change is reviewed).
**Current behaviour:** bait-and-switch is possible after approval.
**Recommended fix:** see security audit; add a "Changes waiting for review" state in the owner UI.
**Estimated effort:** S-M

### MIG-011 - Reviews can never be created

**Severity:** High (P1)
**Area:** Trust / Renter / Landlord
**Location:** `backend/routes_reviews.py` `create_review()` (requires a completed `deals` row); `routes_deals.py` deal creation returns 410; `pages/reviews/[dealId].tsx`; `components/listings/ReviewsSection.tsx`

**Problem:** reviews require a completed deal; deals were retired, so no review can ever exist. Listing pages render a "Reviews" heading with nothing under it.
**Expected behaviour:** verified reviews after a real tenancy or stay, or no reviews UI at all.
**Current behaviour:** a dead feature visible on every listing.
**Recommended fix:** short term, hide the Reviews section. Then tie reviews to `tenancies` (after move-in or at the end) and confirmed stay bookings, both directions, with moderation.
**Estimated effort:** M

### MIG-012 - Support panel is clipped on every phone and the help bubble covers the search field

**Severity:** High (P1)
**Area:** Mobile / Support
**Location:** `frontend/components/support/SupportWidget.tsx` (`fixed bottom-24 right-6 w-[28rem] h-[38rem]`)

**Problem:** the panel is a fixed 448 px wide: at 320 px its left edge is at -152 px, at 375 px about -97 px, at 430 px about -42 px, so the header and text are cut off on every iPhone. The closed bubble sits over the homepage "Suburb, city or postcode" field and the search page's suburb chips at phone widths.
**How to reproduce:** open the homepage at 375 px, tap the blue chat bubble.
**Expected behaviour:** a full-width bottom sheet on phones; the bubble never covers primary inputs.
**Current behaviour:** clipped panel, obscured search.
**Recommended fix:** `w-[min(28rem,calc(100vw-2rem))]` and `inset-x-4` below `sm`, or a full-screen sheet; hide the bubble while a search input is focused or move it above the bottom nav.
**Estimated effort:** XS

### MIG-013 - Support "AI Assistant" is keyword matching over a knowledge base with false claims

**Severity:** High (P1)
**Area:** Content / Trust / Legal
**Location:** `frontend/components/support/SupportWidget.tsx`, `frontend/data/supportKB.ts`

**Problem:** the widget is labelled "AI Assistant" and "Online" but matches keywords. Its answers describe features that do not exist: AI matching that "learns your preferences", a Superhost programme with criteria and "higher placement in search", promotional pricing badges, a phone-verified badge, a Dashboard in a bottom navigation bar, ID review "within 24 to 48 hours", "our team typically responds within 24 hours". The Help Centre (`lib/helpData.ts`) is accurate and contradicts it.
**Expected behaviour:** support answers match the product.
**Current behaviour:** a site-wide widget repeats retired claims (the same claims removed elsewhere in the June honesty pass).
**Recommended fix:** replace the KB with a search over `lib/helpData.ts`, label it "Quick answers", remove "Online", align response-time wording with "one business day".
**Estimated effort:** S

### MIG-014 - No domain, no professional email, unreliable email delivery

**Severity:** High (P1)
**Area:** Configuration / Trust / Email
**Location:** DNS for migrent.com.au; `FROM_EMAIL` (backend `email_bookings.py:16`, `email_verification.py:15`, frontend `lib/resend-client.ts:28`); `routes_support*.py`/`routes_reports.py` sender `onboarding@resend.dev`; every page that prints `migrentau@gmail.com`

**Problem:** migrent.com.au has no NS, A, MX or TXT records (checked today). The site is `*.vercel.app`. Support, safety, legal and privacy contacts are a Gmail address (privacy policy 4x, terms 3x, listing page "Help by email"). Notifications are sent from a Gmail address through Mailjet, which cannot pass DMARC alignment, so they will often land in spam. Support and report emails use Resend's shared test sender, which only delivers to the Resend account owner. Three email providers are in use.
**Expected behaviour:** migrent.com.au live, `support@`/`privacy@`/`legal@` mailboxes, one transactional provider with SPF, DKIM and DMARC on the domain.
**Current behaviour:** looks unofficial to a cautious renter, and booking/inspection emails are unreliable.
**Recommended fix (owner + small code change):** connect the domain in Vercel and set DNS; Google Workspace or Fastmail MX; verify the domain in one provider (Resend or Mailjet), set `FROM_EMAIL`; replace all printed addresses from `lib/siteIdentity.ts`; set `NEXT_PUBLIC_SITE_ORIGIN`, `FRONTEND_URL`, `HUB_BASE_URL`; update Supabase redirect URLs.
**Estimated effort:** M

### MIG-015 - No analytics, error tracking or uptime monitoring

**Severity:** High (P1)
**Area:** Analytics & Observability
**Location:** Vercel project settings (Web Analytics off: `/_vercel/insights/script.js` 404s on every page); `frontend/lib/analytics.ts` (not imported anywhere); Sentry DSN unset; no uptime monitor confirmed

**Problem:** Migrent cannot answer how many people visited, searched, signed up, created a listing or enquired, or whether the API is down.
**Expected behaviour:** page analytics, a handful of funnel events, error tracking front and back, an uptime ping on `/health`.
**Current behaviour:** only Vercel Speed Insights. (Database counts can answer user/listing totals; nothing answers behaviour.)
**Recommended fix:** enable Web Analytics in Vercel; wire `lib/analytics.ts` events (search, listing_view, save, enquiry_start/send, inspection_booked, application_started/submitted, signup_started/completed, listing_wizard_step, listing_submitted); set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`; UptimeRobot on the API; a simple admin metrics card from the DB.
**Estimated effort:** S

### MIG-016 - Account deletion leaves identity documents behind and erases the other party's evidence

**Severity:** High (P1)
**Area:** Privacy / Security / Trust
**Location:** `backend/routes_account.py`

**Problem:** no Storage objects are removed (ID images, renter documents, attachments, photos), while both sides' messages, reviews about the user and reports they filed are hard-deleted; no re-authentication.
**Expected behaviour:** the deleting user's personal data and files are removed or anonymised; the counterparty keeps their record; safety evidence is held for a defined period.
**Recommended fix:** see security audit; counsel to set retention periods.
**Estimated effort:** M

### MIG-017 - Bond and move-in costs are not shown on the public listing; bond is unvalidated free text

**Severity:** High (P1)
**Area:** Renter / Landlord / Australian context
**Location:** `pages/listing/[id].tsx` (no bond output); `pages/hub/homes/[id].tsx:410` (shows `Bond: {text}` only when set); wizard `components/hub/wizard/Steps.tsx:334` (`Bond` optional, free text, max 60, placeholder "e.g. 4 weeks")

**Problem:** the number a new arrival most needs ("how much do I need on day one?") is missing on the public page and optional elsewhere. Free text cannot be checked against state bond limits or summed into a move-in cost. "Bills not included - budget extra" gives no estimate.
**Expected behaviour:** bond (weeks or AUD) and rent-in-advance required for long-term listings; a "Move-in cost" line (e.g. "4 weeks bond $1,280 + 2 weeks rent $640 = $1,920") with a link to the state bond authority; a bills estimate when not included.
**Recommended fix:** structured `bond_weeks`/`bond_amount` and `rent_in_advance_weeks`; server-side check against a per-state table maintained with legal review; show on public and Hub pages and on cards.
**Estimated effort:** M

### MIG-018 - Mentor marketplace has no safety checks and user-writable trust data

**Severity:** High (P1)
**Area:** Trust & Safety / Payments
**Location:** `pages/become-mentor.tsx` ("Your profile is listed straight away"); `/mentors` copy ("they are not ID-checked"); `mentors` and `mentor_sessions` grants; `backend/routes_mentors.py`

**Problem:** anyone can become a paid mentor for in-person meetings with new arrivals without an ID check, while Migrent keeps 30%. Mentor `verified`, `rating`, `review_count`, `active`, Stripe fields and session `status`/`amount` are writable through REST. Stripe Connect must be enabled on the live account or mentor onboarding fails (owner TODO from 2026-10-01, not re-verified). The homepage promotes mentors while there are none.
**Expected behaviour:** ID-checked mentors, admin approval before listing, server-only writes, honest promotion.
**Recommended fix:** require the same ID check as hosts and an admin approval step; revoke client writes; hide the homepage mentor teaser until there are live mentors; enable Connect.
**Estimated effort:** M

### MIG-019 - MFA is not enforced by the API; admins do not need MFA

**Severity:** High (P1)
**Area:** Security / Admin
**Location:** `backend/auth_utils.py` (no `aal` check); `frontend/lib/hub/session.tsx:100`; `backend/admin_panel.py` (shared panel password)
**Problem / fix:** see security audit. **Estimated effort:** M

### MIG-020 - Unused legacy auth endpoints bypass captcha and allow session fixation

**Severity:** High (P1)
**Area:** Security
**Location:** `backend/routes_auth.py`, `backend/routes_magic_auth.py`, table `cross_device_tokens`
**Problem / fix:** see security audit. Remove the routers and the table. **Estimated effort:** S

### MIG-021 - Homepage claims that are not true today

**Severity:** High (P1)
**Area:** Content / Trust / Legal
**Location:** `components/home/RoomsNow.tsx` ("AVAILABLE NOW", "New rooms are added every week"), `components/home/GuidesAndMentors.tsx` ("Talk to someone who has made the move... Meet the mentors"), `components/home/TrustStrip.tsx` ("Real people when you need help")

**Problem:** with 0 listings and 0 mentors these read as false. "Real people when you need help" is a Gmail inbox plus a keyword bot.
**Recommended fix:** make each claim conditional on live data (render only when count > 0) or reword ("We're adding the first rooms in Sydney now").
**Estimated effort:** XS

### MIG-065 - Contact-form messages never reach the Admin panel, and the sender gets no confirmation

**Severity:** High (P1)
**Area:** Support / Admin / Renter / Landlord
**Location:** `frontend/pages/contact.tsx` → `lib/api.ts submitSupportRequest()` → `backend/routes_support.py POST /support/contact` → table `support_requests`; Admin panel Support reads only `tickets` (`backend/routes_hub_admin.py:704,737`)

**Problem:** the public Contact page saves into `support_requests`, a table no screen reads. The only alert is an email to `SUPPORT_EMAIL` (default `migrentau@gmail.com`) sent from Resend's shared test sender, and only if `RESEND_API_KEY` is set. The person who wrote in gets no confirmation email and no ticket they can follow. Separately, the form accepts any non-empty message, but the API requires at least 10 characters, so a short message ("Call me") fails with the generic "We could not send your message just now".
**How to reproduce:** submit the Contact form (on a non-production environment); look for it in Admin panel > Support: it is not there.
**Expected behaviour:** every contact message becomes a ticket in Admin > Support with an emailed confirmation and a link to follow it.
**Current behaviour:** messages sit in an unread table; delivery of the alert email is uncertain (MIG-014).
**Recommended fix:** make `/support/contact` create a `tickets` row + first `ticket_messages` row (as the help-widget path does) and send the confirmation from the domain sender; migrate existing `support_requests` rows; align the 10-character minimum in the form.
**Estimated effort:** S

### P2 - Medium

Each entry: severity, area, location, problem and how to reproduce, expected vs current, fix, effort.

**MIG-022 - Search empty state is misleading and has no alert option** · P2 · Renter · `pages/seeker/search.tsx` empty state. Repro: open `/seeker/search` with no filters. Current: "No rooms match your search. Try removing some filters" and "Popular suburbs: Kellyville, Parramatta, Blacktown, Liverpool, Chatswood, Bankstown" (all Sydney; Kellyville only because of the founder's old listing). Expected: distinguish "no rooms on Migrent yet" from "no rooms match"; offer "Alert me when rooms appear here" (saved search) right there; popular suburbs per city. Fix: S.

**MIG-023 - Suburb, state and postcode are not checked against each other; no suburb autocomplete in the wizard** · P2 · Landlord / Data · `components/hub/wizard/Steps.tsx`, `backend/routes_geocode.py:182`. Repro (mock build): enter "Parramatta", state VIC, postcode 9999; the Property step is marked done. The backend check only runs when a geocoding key answers and never checks the state. The repo already ships ABS data for 15,334 suburbs with postcodes (`/api/suburbs/search`). Expected: autocomplete from that data, server-side consistency check, clear error. Fix: S-M.

**MIG-024 - Admin tooling gaps** · P2 · Admin · `pages/hub/admin/*`, `backend/routes_hub_admin.py`. Reports offer only "Take this" and "Close report", with no pause-listing, suspend-user or view-conversation action; People requires typing a search (no list, filters by role, status, join date); no person detail page (their listings, reports, ID status, audit history); no metrics view (retired as fake); no bulk moderation; no canned rejection reasons; no way to email a user from the panel. Fix: L.

**MIG-025 - 30-second admin idle lock with police lights and siren** · P2 · Admin UX · `lib/hub/adminPanel.ts`, `components/hub/admin/AdminIdleAlarm.tsx`. Reading an ID document or a long report without moving the mouse for 30 seconds triggers a full-screen alarm. Expected: 5-15 minute idle lock, quiet re-auth prompt; keep the alarm for wrong-password lockouts only. Fix: S.

**MIG-026 - Property manager support is a label only** · P2 · Property manager · `pages/hub/settings.tsx:265`, `pages/hub/properties/index.tsx`. No agency name or licence number, no team or staff seats, no portfolio search/filter/sort, no bulk pause/renew, no CSV import/export, no record of the landlord's authority for a managed property. Fix: L (phase it).

**MIG-027 - Search sort menu causes a hydration mismatch for signed-in users** · P2 · Performance · `pages/seeker/search.tsx:816` (`{session && <option value="best_match">}`). Server renders without the option, client with it; React discards the server HTML (seen in dev; will happen in production for signed-in users). Fix: render the option after mount or always render it disabled. XS.

**MIG-028 - Sign-up page is slow on mobile** · P2 · Performance / Conversion · `/hub/sign-up`. Throttled Pixel 7: LCP 3.9 s, ~3.7 s of long tasks (hCaptcha + Supabase client). Fix: load hCaptcha on first field focus, defer Supabase until submit. S.

**MIG-029 - API latency from the US** · P2 · Performance · Render service (US) + Supabase (Sydney). From Australia: `/health` 0.20 s, empty `/listings/search` 1.0 s. Render plan unknown (free tier sleeps after 15 minutes). Fix (owner): paid Render plan in Singapore, or move the API to a Sydney host. S.

**MIG-030 - Email links point to a 404 and to legacy addresses** · P2 · Email · `backend/email_bookings.py` links `{FRONTEND_URL}/support` (404) twice, plus `/dashboard/owner`, `/dashboard/seeker`, `/owner/listings`, `/owner/listings/edit/...`; `email_verification.py` links `/owner/listings/new`, `/account/settings?tab=verification`. They work through redirects but bounce through sign-in. Fix: use `hubAbsoluteUrl` equivalents; `/support` to `/contact`. XS.

**MIG-031 - No unsubscribe link or List-Unsubscribe header** · P2 · Email / Compliance · `backend/email_bookings.py`, `notification_service.py`. Saved-search alerts are likely commercial electronic messages under the Spam Act 2003, which require a functional unsubscribe. Fix: footer link to Settings > Email notifications plus a one-click unsubscribe token; header. Needs legal confirmation. S.

**MIG-032 - Blocking is hard to reach and fails open** · P2 · Trust & Safety · see security audit. S.

**MIG-033 - No scam-pattern detection or warnings in messages** · P2 · Trust & Safety · `backend/routes_messages.py`. Listings are scanned for "Western Union", "deposit before", "WhatsApp only"; messages are not. Fix: run the same patterns on messages; show an in-thread warning to the recipient ("This message asks for money before an inspection. Migrent will never ask you to...") and flag to admin. M.

**MIG-034 - Stay payments happen off-platform** · P2 · Strategy / Trust · `/help/request-to-book` ("how and when you pay the host is between you and them"). That is the exact moment scams happen. Fix: consider Stripe-held first payment for stays (released at check-in) after legal advice on holding money. L.

**MIG-035 - Rental-law content needs professional review** · P2 · Content / Legal · `data/rentalLaws.ts`, `pages/guides/rental-laws.tsx`. Specific per-state bond caps and rent-in-advance limits are stated without sources or a review date; nothing explains boarders and lodgers (many rooms in owner-occupied homes fall outside residential tenancy laws, which changes bond and eviction rights). I did not verify the figures. Fix: lawyer or tenants' union review, cite each state authority, add "last reviewed", add a boarders and lodgers section. M.

**MIG-036 - Supabase hygiene** · P2 · Security / Database · see security audit (grants, `admin_users_view`, SECURITY DEFINER functions, leaked-password protection, backup table) and the performance advisor (45 RLS policies re-evaluate `auth.uid()` per row, 49 duplicate permissive policies, 20 unindexed foreign keys, 64 unused indexes, a duplicate index on `favorites`). M.

**MIG-037 - Search is not indexable and there are no "rooms in suburb" landing pages** · P2 · SEO / Growth · `/seeker/search` sends `noindex,nofollow`; listings are discoverable only via `sitemap.xml`, which fetches `limit=100`. Queries like "rooms for rent Parramatta" have no landing page. Fix: indexable `/rooms/[state]/[suburb]` pages (server-rendered, canonical, linked from suburb guides) once supply exists; `noindex,follow` at minimum on search; paginate the listing sitemap. M.

**MIG-038 - Language switcher offers only English** · P2 · Migrant UX · `components/ui/LanguageSwitcher.tsx`, `NEXT_PUBLIC_ENABLED_LOCALES=en`. A globe menu with one option is dead UI. Fix: hide until a second language ships; then translate key flows (see opportunities). S to hide, L to translate.

**MIG-039 - Mobile: search is below the fold and hidden behind Filters; no suburb autocomplete** · P2 · Mobile / Renter · Homepage at 320-375 px: the doll's house fills the first screen; the location field is below it and covered by the help bubble. `/seeker/search` on iPhone: no visible location input until "Filters" is opened. On every device the homepage and search location fields have no suggestions: typing "Parra" and pressing "Show matching rooms" searches for `suburb=Parra` (verified live), although `/api/suburbs/search` already returns matches. Fix: a compact "Where?" field above the illustration on phones and at the top of mobile search, backed by the existing suburb autocomplete. S.

**MIG-040 - Terminology borrowed from short-stay apps** · P2 · Content · search "Guests: Adults (18+), Children (2-17), Infants (0-2)", listing "Max 2 guests", "check-in/check-out", "Stay bookings" vs "tenancies" (never explained to renters; pricing mentions stays without defining them). Fix: "People moving in", "Up to 2 people"; a one-line definition of "short stay (weeks)" vs "lease (months)" wherever fees or booking appear. S.

**MIG-041 - Guest support tickets can be abused** · P2 · Security · see security audit. S.

**MIG-042 - Scheduled jobs unverified** · P2 · Operations · `pg_cron` is not installed in the database; saved-search alerts, inspection reminders and listing expiry reminders depend on Render cron jobs calling `/internal/cron/*` with `CRON_SECRET`. I could not confirm they exist. The homepage promises saved-search alerts. Fix (owner): confirm or create the four jobs (docs/runbooks/scheduled-jobs.md). S.

**MIG-043 - Two different listing detail pages** · P2 · Information architecture · `/listing/[id]` (public) and `/hub/homes/[id]` (Hub) show the same home with different features (Report, Share, Compare, safety warning and bond only in the Hub). Fix: one listing component used in both places. M.

**MIG-044 - Guides hub is thin** · P2 · Content / SEO · all 8 long-form guides are withdrawn (`HIDDEN_GUIDES`); `/guides` has 4 articles and the state law page. Missing newcomer essentials: how applications and inspections work here, condition reports, bond lodgement and refund, notice periods, share houses vs boarding, rights by visa type, budgeting the first month. M.

**MIG-045 - No filter for lease type or newcomer friendliness** · P2 · Renter · `lib/search/searchQuery.ts` has `minStay` but no "long-term lease / short stay" filter, and listings carry no "no Australian rental history needed" or "students welcome" signal (the homepage uses "No rental history needed" as a chip). Fix: `listing_purpose` filter; owner checkbox "Happy to rent to new arrivals without local history". S.

**MIG-046 - Rate limits are per process** · P2 · Security · see security audit. S.

**MIG-047 - One role per account** · P2 · Renter / Landlord · `/hub/settings` "What you use Migrent for"; switching from owner to renter is refused while listings are live. A migrant who rents a room and sublets another (common) cannot do both. Fix: allow both roles with a mode switch. M.

### P3 - Low

**MIG-048 - Dead and duplicate code** · P3 · Code health · Frontend: `pages/admin/*` (11 pages, unreachable), `components/AdminGate.tsx`, `AdminLayout.tsx`, `pages/api/admin/verify.ts`, `pages/reviews/[dealId].tsx`, `pages/verification-*`, ~65 never-imported exports in `lib/api.ts`, 11 never-imported modules (`AvatarWithVerification`, `content/Breadcrumb`, `ui/primitives/index`, hooks `useCalculator`, `useLanguage`, `useOwner`, `useTopListings`, `lib/analytics` (see MIG-015), `lib/profanityFilter`, `emails/index`, `data/suburbs.ts`). Backend: unused routers (`routes_deals`, `routes_matches`, `routes_visa_matching`, `routes_seeker`, `routes_owner`, `routes_referrals`, `routes_validation`, `routes_stations`, legacy auth), `routes_verification_codes.py` is not even mounted, `routes_account` deletes from a `matches` table that does not exist. Database: overlapping `bookings`/`deals`/`applications`, `favorites` vs `profiles.wishlist`, `tickets` vs `support_requests`, `_backup_042_profile_badges`. Dependencies: `recharts` is only imported by the dead `pages/admin/analytics.tsx` and `revenue.tsx`; the `resend` npm package is not imported at all (`lib/resend-client.ts` actually sends through Mailjet, so its name misleads). Fix: delete in one reviewed PR after MIG-004/MIG-020. M.

**MIG-049 - Lint and deprecation warnings** · P3 · `npm run lint`: 0 errors, 116 warnings (34 `no-explicit-any`, 24 unused vars, 23 `set-state-in-effect`, 20 `@next/next`, 5 `immutability`, 5 `exhaustive-deps`); pytest: FastAPI `regex=` deprecated (`routes_admin.py:120,184`, `routes_spam_moderation.py:49,53`), `datetime.utcnow()` deprecated (`routes_messages.py:142`). S.

**MIG-050 - Soft 404s** · P3 · SEO · `/mentor/<unknown id>` returns 200, `index,follow`, title "Rooms for new arrivals in Australia", no H1; `/users/profile/<junk>` returns 200, `index,follow`, title "Host profile", no canonical. Fix: `notFound: true`. XS.

**MIG-051 - Missing structured data and a client-only page** · P3 · SEO · homepage has no `Organization`/`WebSite` JSON-LD; `/become-mentor` renders an empty `<main>` on the server. XS.

**MIG-052 - One colour-contrast failure** · P3 · Accessibility · light-blue chip (`#365df3` on `#dde5ff`, 4.16:1, needs 4.5:1) on `/cookie-policy` (light and dark) and the suburb page in dark mode (axe `color-contrast`, 5 nodes). XS.

**MIG-053 - Small footer tap targets on phones** · P3 · Mobile · footer links are 18-19 px tall (WCAG 2.2 target-size minimum is 24 px unless spaced). XS.

**MIG-054 - Light-rail stop labelled "Nearest train station"** · P3 · Suburb data · Parramatta shows "Robin Thomas, 310 m" (Parramatta Light Rail) as the nearest train station; OSM station tags include light rail. Fix: label "Nearest station or stop" or filter to heavy rail/metro. XS.

**MIG-055 - "6 min to Kellyville" drops the travel mode** · P3 · Renter · `pages/seeker/search.tsx:1057` splits off "walk". Fix: "6 min walk to Kellyville station". XS.

**MIG-056 - Welcome email never sent for Hub sign-ups** · P3 · Email · `/api/emails/welcome-suite` is only called by legacy `pages/auth/callback`; Hub uses `/hub/auth/callback`. XS.

**MIG-057 - Listing images accept any URL** · P3 · Security · see security audit. XS.

**MIG-058 - Public geocode and help-vote endpoints** · P3 · Security / Cost · see security audit. XS.

**MIG-059 - Mentors empty state** · P3 · Copy · "Try a nearby suburb, or be the first here" when there are no mentors anywhere. XS.

**MIG-060 - NSW short-stay code shown as the general code of conduct** · P3 · Content · `/code-of-conduct` is the "NSW STRA Code of Conduct"; Migrent covers all states and mostly long-term rooms. XS (content), with legal review.

**MIG-061 - Hub hydration error and console noise** · P3 · DX · every hard-loaded Hub page throws a hydration error (React #418, dynamic `HubSessionProvider`). First seen in `next dev`; on 2026-10-01 it was confirmed in a production build too (signed in, mock API), so React throws away the server HTML on every Hub page load. framer-motion warns about a static scroll container. S.

**MIG-062 - Stray duplicate env file** · P3 · Hygiene · `frontend/.env.production 2.local` (sync-tool copy containing secrets) and `* 2.*` duplicates in `.next`. XS.

**MIG-063 - Sign-in form polish** · P3 · UX · no show-password toggle; invalid email says "Enter the email address you signed up with" instead of "That is not an email address"; focus is not moved to the first error. XS.

**MIG-064 - Doll's house is mouse/touch only** · P3 · Accessibility · SVG rooms are not focusable; the panel controls provide the same options, so this is acceptable, but add `aria-hidden` to the decorative SVG or make rooms buttons. XS.

---

## 4. Role-specific checklists

See [MIGRENT_LAUNCH_CHECKLIST.md](MIGRENT_LAUNCH_CHECKLIST.md) (renter, landlord, property manager, admin, security, mobile, accessibility, SEO, performance).

## 5. Page-by-page review

See [MIGRENT_ROUTE_AUDIT.md](MIGRENT_ROUTE_AUDIT.md). Every route has its own section.

---

## 6. Authentication and permissions matrix

Generated from `proxy.ts`, `next.config.ts` redirects, `hub_common.require_owner/require_admin_actor`, `auth_utils.require_admin` and RLS. ❌ marks an incorrect permission.

| Feature | Guest | Renter | Landlord / PM | Admin |
|---|---|---|---|---|
| Browse search, listing, suburb, guides | Yes | Yes | Yes | Yes |
| See street address | No | After booking an inspection or finalised application | Own listings | Yes (panel) |
| Save a listing / saved search | Sign-in required | Yes | No (renter role only) | As their role |
| Message a host | Sign-in required | Yes | Reply only; DM by direct link | As their role |
| Apply / book inspection | Sign-in required | Yes | No | As their role |
| Create / edit listing | No | No (must switch role) | Yes | As their role |
| Publish listing | No | No | Only after ID approved + Migrent review | Approve/reject |
| Approve own ID check | No | ❌ **Yes, via REST (MIG-001)** | ❌ **Yes, via REST** | Yes (panel) |
| Lift own suspension | n/a | ❌ **Yes, via REST (MIG-002)** | ❌ **Yes** | Yes |
| Read unpublished listings / addresses | No | ❌ **Yes, via /seeker/recommended (MIG-004)** | ❌ **Yes** | Yes |
| Edit live listing without review | No | No | ❌ **Yes (MIG-010)** | Yes |
| Rate self / verify self as mentor | No | ❌ **Yes, via REST (MIG-018)** | ❌ **Yes** | Yes |
| Report listing | No (MIG-009) | Hub view only | Hub view only | Yes |
| Block a user | No | Legacy profile page only | Legacy profile page only | As their role |
| Admin panel `/hub/admin/*` | No (sign-in) | 404/403 | 404/403 | Yes + panel password |
| Admin APIs | 401 | 403 | 403 | 423 until unlocked, then yes |
| Old `/admin/*` URLs | Redirect to sign-in | 404 | 404 | Redirect to Hub panel |
| Cron endpoints | 401 | 401 | 401 | 401 (secret only) |
| Delete own account | No | Yes (blocked while an application or tenancy is open) | Same | Database only |

Server-side protection for admin is solid (verified by code and by `test_authz_matrix.py`, `test_admin_panel.py`, `hub.spec.ts`). The incorrect permissions are all at the Supabase REST layer or on legacy routes.

---

## 7. User journeys

Friction points are marked ⚠️, breaks ❌.

### Guest to renter (tested on live, then the production build with the mock API)

1. **Homepage** - headline and subline clear within 5 seconds ("Find a home. Feel at home. Every host is ID-checked..."). ⚠️ "Migrent" + "AU" is the only sign it is Australian until the body copy; ⚠️ on phones the search is below the illustration and under the help bubble (MIG-039, MIG-012); ⚠️ "AVAILABLE NOW" shows nothing (MIG-005).
2. **Search** - ❌ production: zero results with a misleading message (MIG-022). Mock: 26 rooms, rich filters, URL-synced, malformed input handled safely. ⚠️ Airbnb-style "guests/infants" (MIG-040).
3. **Listing** - clear photos, suburb-level location, ID-checked host explanation including what it does not mean (excellent). ⚠️ no bond or move-in cost (MIG-017); ⚠️ no Report (MIG-009); ⚠️ empty "Reviews" heading (MIG-011); ❌ host card "Message" goes to an empty inbox (MIG-008); ✅ bottom CTAs route through sign-in with the intent preserved.
4. **Sign up** - clear, 10-character password rule, terms checkbox, captcha invisible. ⚠️ slow on mobile (MIG-028); ⚠️ no welcome email (MIG-056); ⚠️ notification emails come from Gmail (MIG-014).
5. **Welcome** - role choice, 18+ confirmation, terms. ✅
6. **Save / contact** - save works and returns to the listing with intent; enquiry via the Hub works. ✅
7. **Dashboard (Hub home)** - excellent: next inspection, unfinished application, unread messages, Rental Profile completion. ✅

### Guest to landlord (production build with mock)

1. **Homepage "I'm hosting" / "List a property"** - clear; listing is free. ⚠️ fees only for "stays" with no definition (MIG-040).
2. **Sign up / welcome** - "I own it / I manage it". ✅
3. **Create property (6-step wizard)** - autosaves, free navigation, Review lists what is missing. ⚠️ accepts mismatched suburb/state/postcode (MIG-023); ⚠️ bond optional free text (MIG-017).
4. **ID check** - upload in Settings; listing waits as draft until approved. ❌ can be self-approved via REST (MIG-001).
5. **Preview / publish** - "How it looks in search" preview on Review; "Send for review". ✅
6. **Dashboard** - portfolio, needs-attention items, applications, inspections, insights with honest "counting since". ✅ ⚠️ later edits skip review (MIG-010).

### Returning renter

Sign in ✅ (clear errors, non-enumerating) → Saved ✅ (price-drop note "$20 less since saved", gone listings separated) → Search ✅ → Enquiry ✅ (from Hub) / ❌ (from public host card) → Messages ✅ (context of home and application alongside; Archive, Mute, Report; ⚠️ no Block).

### Returning landlord

Sign in ✅ → Hub home ✅ → Properties ✅ (⚠️ no search/filter for many) → Applications ✅ (side-by-side snapshot, private notes, shortlist) → Reply ✅ (templates). ⚠️ No email if Gmail-sent notifications land in spam (MIG-014).

### Administrator

Sign in ✅ → Admin panel password ✅ → Overview counts ✅ → Listings queue with tabs ✅ → ID checks with 5-minute document links ✅ → Reports ⚠️ (no inline actions, MIG-024) → People ⚠️ (search-only) → Suspend with reason ✅ but ❌ not enforced (MIG-002) → Audit log ✅. ⚠️ 30-second siren lock (MIG-025).

---

## 8. Build check

| Check | Command | Result |
|---|---|---|
| Install / dependency audit | `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| Lint | `npm run lint` | ✅ 0 errors, ⚠️ 116 warnings (MIG-049) |
| Typecheck | `npm run typecheck` | ✅ clean |
| Unit tests | `npm run test:unit` (Vitest) | ✅ 146/146 |
| Production build | `NEXT_DIST_DIR=.next-e2e npm run build:test` | ✅ 139 pages; one expected warning about custom Cache-Control on `/_next/static` |
| E2E + axe | `npx playwright test --workers=3` | ✅ 251 passed, 37 skipped (intentional desktop-only/mobile-only splits), 0 failed |
| Backend tests | `venv/bin/python -m pytest tests -q` | ✅ 187 passed, ⚠️ 12 deprecation warnings |

Note: the suites run against an in-memory Supabase fake and a mock API; none of them exercise the Supabase REST layer where MIG-001/002/018 live, which is why those bugs passed.

---

## 9. Data model

- 56 tables, RLS enabled on all; `listings` has 90 columns and `profiles` 69 (wide, overlapping legacy fields: `verified`, `is_verified`, `identity_verified`, `wishlist` vs `favorites`).
- Overlapping models: `bookings` (stays) vs `applications` + `tenancies` (long-term) vs retired `deals`; `tickets` + `ticket_messages` vs `support_requests`; `reviews` tied to `deals` (dead, MIG-011).
- Missing timestamps: `application_documents`, `ticket_tags`, `ticket_tag_links`, `uni_locations`, `visa_types` have no `created_at`; several logs have no `updated_at` (fine for append-only).
- Performance advisor: 20 unindexed foreign keys, 45 per-row `auth.uid()` RLS evaluations, 49 duplicate permissive policies, a duplicate unique index on `favorites`, 64 unused indexes.
- Cascades: account deletion relies on application code ordering rather than FK `ON DELETE` rules and leaves Storage objects (MIG-016).
- Scalability: listings sitemap capped at 100; owner insights read up to 20,000 `listing_events` rows into Python per request; `routes_owner` and `routes_seeker` do N+1 queries (moot once removed). The schema can scale well beyond a demo once the legacy tables are retired.

## 10. Emails and notifications

| Event | In-app | Email | Status |
|---|---|---|---|
| Account created / confirm email | - | Supabase Auth | ✅ (Supabase sender) |
| Welcome | - | `/api/emails/welcome-suite` | ❌ never triggered for Hub sign-ups (MIG-056) |
| Password reset, magic link | - | Supabase Auth | ✅ |
| Message received | ✅ | ✅ (preference "Messages") | ⚠️ Gmail sender |
| Enquiry sent / received | ✅ | ✅ | ⚠️ Gmail sender |
| Application submitted / status / changes / finalised / withdrawn | ✅ | ✅ | ⚠️ |
| Inspection booked / changed / cancelled / reminder | ✅ | ✅ (reminder needs cron, MIG-042) | ⚠️ |
| Listing submitted / published / rejected / changes requested | ✅ | ✅ | ⚠️ |
| Listing expiring | ✅ | via cron | ⚠️ unverified |
| Saved-search match | ✅ | via cron, preference per search | ⚠️ unverified; no unsubscribe (MIG-031) |
| Report submitted | - | admin email from `onboarding@resend.dev` | ❌ reporter gets no confirmation; admin email may not deliver |
| Support ticket | - | confirmation from `onboarding@resend.dev` | ❌ likely undelivered (MIG-014) |
| ID approved / rejected | ✅ | ✅ | ⚠️ |
| Admin lockout | ✅ | ✅ push + email | ✅ |

Preferences: Settings > Email notifications with four groups (messages, applications, inspections, saved-search alerts); security emails always sent. Missing: unsubscribe links in emails.

## 11. Analytics and observability

| Question | Answerable today? |
|---|---|
| Users registered, renter vs owner | Yes, by SQL only (11 users: 10 with the renter role, 1 owner; 1 account is an admin) |
| Listings created / active | Yes, by SQL (0) |
| Searches, most searched suburbs | No |
| Listing views, saves, enquiries | Partly (`listing_events` per owner insights) |
| Enquiry and application conversion | Partly (DB), no funnel |
| Sign-up and listing-wizard abandonment | No |
| Front-end errors | No (Sentry off) |
| Failed API requests | Render logs only (7 days) |
| Uptime | No monitor confirmed |

---

## 12. Competitive position (summary; detail in the UX audit)

| Alternative | Why someone uses it | Where Migrent can win |
|---|---|---|
| realestate.com.au / Domain | All whole-home supply, agent-run | Rooms and share houses; no local rental history needed; plain-English process; suburb context for newcomers |
| Flatmates.com.au | Biggest room supply, paid "Early Bird" messaging | Free messaging; ID-checked hosts; structured Rental Profile; address privacy; scam warnings |
| Facebook Marketplace / groups | Free, huge, community language groups | Accountability (ID, reports, moderation), no fake listings, languages, safety education |
| Airbnb | Short stays, payment protection | Medium-term (weeks to months) at weekly rent, bond rules explained; consider held payments for stays (MIG-034) |

---

## 13. Master action table

Sorted P0, P1, P2, P3; most important first within each. Status as of branch `fix/phase-a-launch-blockers` (1 October 2026): "Fixed on branch" means written and tested, not yet deployed.

| ID | Priority | Issue | Role | Page | Effort | Dependency | Status |
|---|---|---|---|---|---|---|---|
| MIG-001 | P0 | Self-approval of host ID via Supabase REST | Security | DB `owner_verification` | S | Backend uploads stay via API | Fixed on branch (migration 046, not applied) |
| MIG-003 | P0 | Secrets in git history; rotate | Security | repo / Supabase / Stripe / Mailjet | S | Owner | Open (unverified) |
| MIG-002 | P0 | Suspension self-reversible and unenforced; trust fields writable | Security / Admin | DB `profiles`, legacy routes | M | MIG-048 helps | Fixed on branch (code + migration 046) |
| MIG-004 | P0 | Legacy endpoints leak addresses and unpublished listings | Security | `/seeker/*`, `/visa/*`, `/matches` | S | - | Fixed on branch (routes removed) |
| MIG-005 | P0 | Zero listings and mentors in production | Business | `/`, `/seeker/search`, `/mentors` | L | MIG-001, MIG-014 before outreach | Code part fixed on branch; supply is owner work |
| MIG-006 | P1 | Legal pages contradict fee model; entity unconfirmed | Legal | `/terms-of-service` +5 | M | Fee decision, counsel | Wording fixed on branch; counsel review open |
| MIG-014 | P1 | No domain DNS; Gmail support; unreliable email | Config | site-wide | M | Owner | Open |
| MIG-007 | P1 | Suburb pages show "data unavailable" | Renter / SEO | `/suburb/*` | XS | - | Fixed on branch |
| MIG-008 | P1 | Host card Message opens empty inbox | Renter | `/listing/[id]` | XS | - | Fixed on branch |
| MIG-009 | P1 | No Report / safety warning on public listing | Trust | `/listing/[id]` | S | MIG-043 | Fixed on branch |
| MIG-010 | P1 | Live listing edits skip moderation | Trust | `PATCH /listings/{id}` | S | - | Fixed on branch |
| MIG-019 | P1 | MFA not enforced by API; admins without MFA | Security | backend auth | M | - | Fixed on branch |
| MIG-020 | P1 | Legacy auth endpoints (captcha bypass, session fixation) | Security | `/auth/*` | S | - | Fixed on branch |
| MIG-018 | P1 | Mentors unchecked; writable ratings/status | Trust | `/mentors`, DB | M | Stripe Connect | Fixed on branch (ID check + approval, migration 046) |
| MIG-016 | P1 | Deletion leaves ID files; erases evidence | Privacy | `/account/delete` | M | Counsel on retention | Files, fresh sign-in, open-report hold fixed on branch; message retention open |
| MIG-015 | P1 | No analytics, Sentry, uptime | Ops | site-wide | S | Owner toggles | Events wired on branch; owner must enable Analytics/Sentry |
| MIG-012 | P1 | Support panel clipped on phones, covers search | Mobile | site-wide | XS | - | Fixed on branch |
| MIG-013 | P1 | "AI Assistant" KB with false claims | Content | site-wide widget | S | - | Fixed on branch |
| MIG-017 | P1 | Bond / move-in cost missing; bond free text | Renter | listing, wizard | M | Legal table of caps | Fixed on branch (bond in weeks, capped 4 weeks' bond and 2 weeks in advance by owner decision, 1 week in advance in TAS and NT where the law allows one rent period; migration 047, not applied) |
| MIG-065 | P1 | Contact-form messages invisible to admins; no confirmation | Support | `/contact` | S | MIG-014 | Fixed on branch (old messages moved by migration 046) |
| MIG-021 | P1 | Homepage claims not true today | Content | `/` | XS | MIG-005 | Fixed on branch |
| MIG-011 | P1 | Reviews cannot be created | Trust | listings, `/reviews` | M | Tenancy model | Fixed on branch (both ways after a tenancy or stay, blind until both or 14 days, host reviews of renters only for later hosts; migration 048, not applied) |
| MIG-042 | P2 | Scheduled jobs unverified | Ops | Render cron | S | Owner | Open |
| MIG-022 | P2 | Misleading search empty state, no alert CTA | Renter | `/seeker/search` | S | - | Fixed on branch (alert link carries the search and opens Save) |
| MIG-039 | P2 | Mobile search below fold / hidden | Mobile | `/`, `/seeker/search` | S | MIG-012 | Fixed on branch (Where box first on phones, suburb suggestions) |
| MIG-033 | P2 | No scam detection in messages | Trust | messages | M | - | Fixed on branch (warning to the recipient, report to admins) |
| MIG-024 | P2 | Admin tooling gaps | Admin | `/hub/admin/*` | L | MIG-002 | Fixed on branch (act from a report: pause listing, read conversation, suspend; People lists everyone with filters; person page; Numbers; common reasons). No bulk moderation or emailing users from the panel |
| MIG-023 | P2 | Location consistency not validated | Landlord | wizard | S-M | - | Fixed on branch (ABS suburb check, suggestions in the wizard) |
| MIG-045 | P2 | No lease-type / newcomer filters | Renter | search | S | - | Fixed on branch (migration 047) |
| MIG-040 | P2 | Short-stay terminology on rentals | Content | search, listing, pricing | S | - | Fixed on branch |
| MIG-035 | P2 | Rental-law content needs review; boarders/lodgers | Content / Legal | `/guides/rental-laws` | M | Counsel | Figures checked against official sources on branch (2 October 2026), with sources and a boarders/lodgers section; counsel review open |
| MIG-037 | P2 | Search noindex; no suburb room pages | SEO | `/seeker/search` | M | MIG-005, MIG-007 | Fixed on branch (`/rooms/[state]/[suburb]` pages, noindex when empty; search noindex,follow; paged sitemap with room pages) |
| MIG-036 | P2 | Supabase grants, advisors | Security | DB | M | MIG-001 migration | Open |
| MIG-031 | P2 | No unsubscribe in emails | Compliance | email | S | MIG-014 | Fixed on branch (signed footer link and List-Unsubscribe one-click headers); counsel to confirm which emails are commercial |
| MIG-030 | P2 | Email links to 404 / legacy | Email | backend emails | XS | - | Fixed on branch |
| MIG-032 | P2 | Block hard to reach, fails open | Trust | messages | S | - | Fixed on branch |
| MIG-041 | P2 | Guest ticket abuse | Security | `/support/tickets` | S | MIG-014 | Fixed on branch (limits, email required, spam trap, escaped email) |
| MIG-046 | P2 | In-memory rate limits; Render flags | Security | backend | S | Owner | Code on branch (shared Redis store when `RATE_LIMIT_STORAGE_URI` is set, memory fallback); owner: create Redis (e.g. Upstash) and set the variable; Render flags open |
| MIG-029 | P2 | API latency (US region) | Performance | API | S | Owner | Open (owner: Render plan and region) |
| MIG-028 | P2 | Slow sign-up on mobile | Performance | `/hub/sign-up` | S | - | Captcha loads on first use on branch; Supabase client still loads with the Hub session |
| MIG-027 | P2 | Search sort hydration mismatch | Performance | `/seeker/search` | XS | - | Fixed on branch |
| MIG-043 | P2 | Two listing detail pages | IA | listing | M | - | Same features on both on branch (move-in cost, safety, report, share, compare); pages not merged |
| MIG-025 | P2 | 30-second siren idle lock | Admin | admin panel | S | MIG-019 | Won't do: owner kept the 30-second lock with lights and siren (2026-10-02) |
| MIG-026 | P2 | Property manager is a label only | PM | owner Hub | L | - | Basics on branch (agency name and licence shown to renters, migration 049; search, status filter, bulk pause/resume/renew). No staff seats or CSV (owner decision 2026-10-02) |
| MIG-047 | P2 | One role per account | Renter / Landlord | settings | M | - | Won't do: owner kept one role per account (2026-10-01) |
| MIG-034 | P2 | Off-platform stay payments | Strategy | stays | L | Counsel | Decision (2026-10-02): payments stay direct; safe-payment warnings on branch; held payments after legal advice |
| MIG-044 | P2 | Guides hub thin | Content | `/guides` | M | - | Three newcomer guides on branch (applying and inspecting, condition report, getting your bond back); more to write |
| MIG-038 | P2 | Language switcher English-only | Migrant UX | header | S / L | - | Menu hidden on branch until a second language is switched on; translation open |
| MIG-048 | P3 | Dead and duplicate code | Code | many | M | MIG-004, MIG-020 | Open: removing the old admin pages and unused files was not approved in this session; list in this entry |
| MIG-050 | P3 | Soft 404s | SEO | `/mentor/[id]`, `/users/profile/[id]` | XS | - | Fixed on branch |
| MIG-052 | P3 | One contrast failure | A11y | `/cookie-policy`, suburb dark | XS | - | Fixed on branch (cookie policy, disputes) |
| MIG-056 | P3 | No welcome email | Email | sign-up | XS | MIG-014 | Fixed on branch (sent once on first Hub onboarding) |
| MIG-054 | P3 | Light rail labelled train | Suburbs | suburb pages | XS | - | Fixed on branch |
| MIG-055 | P3 | Transit label drops mode | Renter | search cards | XS | - | Fixed on branch |
| MIG-051 | P3 | No Organization JSON-LD; client-only page | SEO | `/`, `/become-mentor` | XS | - | Fixed on branch |
| MIG-053 | P3 | Small footer tap targets | Mobile | footer | XS | - | Fixed on branch |
| MIG-057 | P3 | Image URLs not allow-listed | Security | listings | XS | - | Fixed on branch |
| MIG-058 | P3 | Public geocode / vote endpoints | Security | API | XS | - | Fixed on branch (geocoder needs sign-in; votes rate-limited) |
| MIG-059 | P3 | Mentors empty-state copy | Copy | `/mentors` | XS | - | Fixed on branch |
| MIG-060 | P3 | NSW STRA code as general code | Content | `/code-of-conduct` | XS | Counsel | Page now says it covers NSW short stays only; counsel review open |
| MIG-063 | P3 | Sign-in form polish | UX | `/hub/sign-in` | XS | - | Fixed on branch |
| MIG-064 | P3 | Doll's house keyboard | A11y | `/` | XS | - | Already fixed (decorative SVG hidden) |
| MIG-049 | P3 | Lint and deprecation warnings | Code | many | S | - | Backend deprecations fixed on branch; frontend lint warnings remain |
| MIG-061 | P3 | Hub hydration error (also in production builds) | DX | Hub | S | - | Fixed on branch (Hub session provider handed to _app without a lazy import) |
| MIG-062 | P3 | Stray duplicate env file | Hygiene | `frontend/` | XS | - | Open (owner: delete the duplicate env file by hand) |

---

## 14. Recommended development roadmap

### Phase A - Launch blockers (security and honesty first, then supply)

1. One migration + backend deploy: MIG-001, MIG-002 (columns + `get_active_user`), MIG-018 (mentor writes), MIG-036 (grants). Remove legacy routers MIG-004 and MIG-020 in the same release.
2. Owner: rotate keys (MIG-003); domain, DNS, mailboxes, email sender (MIG-014); enable Vercel Web Analytics, Sentry DSN, uptime monitor (MIG-015); confirm cron jobs (MIG-042) and Render start flags (MIG-046).
3. Fee decision, legal rewrite and counsel review (MIG-006).
4. Quick fixes: MIG-007, MIG-008, MIG-012, MIG-013, MIG-021, MIG-065 (all XS-S).
5. Trust gaps: MIG-009 Report everywhere, MIG-010 re-review on edit, MIG-016 deletion, MIG-019 MFA.
6. Supply: founding-host programme (MIG-005), waitlist launch.

Dependencies: 1 before outreach to hosts (otherwise the ID badge is forgeable); 2 before any email-based flow is relied on; 3 before taking the first live $99.

### Phase B - Core experience

MIG-017 bond and move-in cost, MIG-022 empty states and alerts, MIG-039 mobile search, MIG-023 location validation, MIG-045 filters, MIG-040 terminology, MIG-043 one listing page, MIG-047 dual role, MIG-027/028/029 performance.

### Phase C - Trust and safety

MIG-011 verified reviews on tenancies, MIG-033 scam detection in messages, MIG-032 block in the Hub, MIG-018 mentor ID checks, MIG-035 legal content review, MIG-034 held payments for stays (decision), MIG-041 ticket abuse.

### Phase D - Admin and operations

MIG-024 admin tooling (report actions, people browser, person detail, metrics), MIG-025 idle lock, MIG-031 unsubscribe, MIG-030 email links, MIG-046 shared rate limits, MIG-026 property manager features.

### Phase E - Growth

MIG-037 indexable suburb room pages, MIG-044 guides, MIG-038 languages, MIG-051 structured data, newcomer-ready listing signal, suburb-to-rooms linking, referral programme (rebuilt, not the legacy endpoints).

### Phase F - Polish

MIG-048 dead code, MIG-049 warnings, MIG-050, MIG-052 to MIG-064.

---

## 15. Totals

**Total issues identified:** 65
**P0 Critical:** 5
**P1 High:** 17
**P2 Medium:** 26
**P3 Low:** 17
**Pages/routes audited:** 106 page files (67 public-site routes incl. 11 legacy admin pages and 2 sitemaps, 39 Hub routes), 5 Next.js API routes, ~40 legacy redirect URLs, and all 246 backend API routes reviewed for authorisation
**User journeys tested:** 5 by hand (guest to renter, guest to landlord, returning renter, returning landlord, administrator) plus the 251-test Playwright suite (signed-out redirects, renter, tenant, owner, admin, admin-panel lockout, axe in light and dark)
**Build status:** green. Lint 0 errors (116 warnings), typecheck clean, 146 unit, 251 e2e, 187 backend tests passing, production build succeeds, 0 npm vulnerabilities.
**Launch readiness:** not ready for a public launch. The code is close; the blockers are (1) four database/API security holes that undermine the ID-checked promise and admin enforcement, (2) leaked keys to rotate, (3) legal pages that describe the wrong fees, (4) no domain or working email identity, (5) no analytics, and above all (6) zero listings. With Phase A done (roughly 2-3 focused engineering weeks plus owner tasks and counsel), Migrent is ready for a waitlisted soft launch in two or three Sydney suburbs with founding hosts.
