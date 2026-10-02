# Migrent Hub

Migrent Hub is the signed-in application: where renters save homes, apply,
book inspections, message owners and manage the home they rent, and where
owners and property managers list properties, choose renters and manage
tenancies. The public site (migrent.com.au) is for browsing; everything a
person does with an account happens in the Hub.

This page is the engineering reference. For deploying, see
[Deploy order](#deploy-order) and [Environment variables](#environment-variables).

---

## Where it lives

| | Today | Once the Hub has its own host |
|---|---|---|
| Hub address | `https://<site>/hub/...` | `https://hub.migrent.com.au/...` |
| How | pages under `frontend/pages/hub` | same pages; `next.config.ts` rewrites the Hub host's paths to `/hub/*`, and `/hub/*` on the main site 308-redirects there |
| Sign-in shared with the site | yes (same origin) | yes, with `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN=.migrent.com.au` |

Every link into and around the Hub goes through `frontend/lib/hub/routes.ts`
(`hubLink`, `hubUrl`, `hubAbsoluteUrl`, `hubFromSite`), so moving to the Hub
host is configuration only:

1. Add `hub.migrent.com.au` to the Vercel project (Domains) and create the DNS record Vercel shows.
2. Set `NEXT_PUBLIC_HUB_HOST=hub.migrent.com.au`, `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN=.migrent.com.au` and `NEXT_PUBLIC_SITE_ORIGIN=https://migrent.com.au` on Vercel, then redeploy.
3. Set `HUB_BASE_URL=https://hub.migrent.com.au` on Render (emails and notifications link there).
4. In Supabase > Authentication > URL Configuration, add `https://hub.migrent.com.au/**` to the redirect allow-list.

Do not set the cookie domain on `*.vercel.app` - it is a public suffix and browsers refuse the cookie.

---

## Architecture

```
frontend/pages/hub/*          one file per Hub screen (Pages Router)
frontend/components/hub/*     shell, navigation, cards, forms, per-area components
frontend/lib/hub/*            API client, query cache, session, routes, formatting, types
backend/routes_hub*.py        account, home, renter, owner, inbox, admin
backend/routes_applications.py, routes_inspections.py, routes_tenancies.py
backend/hub_common.py         who is asking (HubActor), authorisation helpers, listing cards, notifications
backend/migrations/043_migrent_hub.sql
```

- **One source of truth.** A rentable unit is a row in `listings` whether the public site, search, the Hub or moderation is looking at it. A property with four rooms is one `properties` row and four listings. Saved homes (`favorites`) are the same whether saved from public search or the Hub.
- **The browser never writes Hub tables.** Every table 043 creates has RLS on with no grants for `anon`/`authenticated`. All reads and writes go through the FastAPI backend (service role), which does the authorisation. This is the same model as migration 039.
- **Reads** use a small stale-while-revalidate cache (`lib/hub/query.ts`): screens show the last known data instantly and refresh in the background. Writes call `invalidate(prefix)` or `setQueryData` (optimistic updates).
- **Time zones.** Every timestamp from the API is UTC. Inspection times, repair bookings and anything tied to a property are shown and entered in the property's time zone (`lib/hub/format.ts`: `whenLabel`, `zonedToIso`, `isoToZoned`), so a Perth inspection is at 10:30 in Perth whoever is looking.

---

## Roles and who may do what

| Role | Stored as | How someone gets it |
|---|---|---|
| Renter | `profiles.role = 'seeker'` | chosen at onboarding, or switched in Settings |
| Owner | `profiles.role = 'owner'`, `owner_kind = 'individual'` | chosen at onboarding or in Settings |
| Property manager | `profiles.role = 'owner'`, `owner_kind = 'property_manager'` | same. They can add an agency name and licence number in Settings (`agency_name`, `agency_licence`, migration 049), shown to renters on the owner card of every listing they manage |
| Admin | `profiles.is_admin` or an admin role | **never self-selected**; granted in the database. An admin with a renter or owner role uses the Hub as that role, with an **Admin panel** added to their navigation |

- Every endpoint resolves the caller with `hub_actor()` and checks rights on the server (`require_owner`, `require_admin_actor`, ownership of each record). Hiding a button is never the control.
- Switching from owner to renter is refused while listings are live or in review, or while a tenancy is active, so nothing is stranded.
- **View as (admins, for support):** an admin opens it from People with a written reason. It is read-only (every write returns 403), limited to 60 minutes, and the start, the end and the reason are written to `admin_audit_log`. The customer's data is served by the API under the admin's own session plus the `X-Migrent-View-As` header, which the backend checks against the audit log.

---

## Admin

Everything the Migrent team does happens in the Hub's **Admin panel**. The older `/admin` console is retired and its addresses redirect here (see [Old pages](#old-pages-and-where-they-went)).

### The Admin panel password

Admins sign in like anyone else. The admin tools sit behind a second password, the Admin panel password, checked by the server (`backend/admin_panel.py`):

- **Two-step sign-in first.** The panel opens only on a session signed in with an authenticator code (`aal2` in the access token): `admin_panel.require_admin_mfa` refuses unlocking and every admin request otherwise, and `/hub/admin/panel` reports `mfa_required` so the panel explains how to turn it on (Settings, Sign-in and security). `ADMIN_REQUIRE_MFA=false` switches this off for a local mock only. Any account that has set up an authenticator must also use it on every Hub request (`auth_utils.require_mfa_if_enrolled`, reading `user_mfa_enrolled()` from migration 046).
- It is stored only as a salted PBKDF2 hash in `admin_panel_settings` (migration 044), never in the code. Change it inside the panel (Overview, "Admin password"); the change is audited.
- The right password returns an unlock token, valid for 20 minutes, tied to that admin and that sign-in. The Hub sends it as `X-Migrent-Admin-Unlock`. Every `/hub/admin/*` endpoint, the final review endpoints, admin access to other people's applications, and the older `/admin`, `/admin/spam`, owner ID review and reports-queue endpoints answer **423** to an admin without it. People who are not admins see exactly what they saw before.
- **30 seconds without activity** (mouse, keyboard, touch or scroll; kept at 30 seconds by owner decision, 2026-10-02) locks the panel in the browser and raises the alarm: red and blue police lights over the whole screen, an "Admin panel locked" banner and a siren, until the admin chooses "Unlock again" (`lib/hub/adminPanel.ts`, `components/hub/admin/AdminIdleAlarm.tsx`). "Lock now", signing out, closing the tab, the unlock expiring and any 423 lock it quietly. A reload inside the 30 seconds keeps it open.
- **Three wrong passwords** within 15 minutes lock the panel for that account for 15 minutes, end the account's sign-in sessions everywhere, send every admin a "Potential threat" alert (in the Hub, by email and push), and show the full-screen police lights, "Potential threat / Potential hack" banner and siren at `/locked`.
- **The alarm** (`lib/hub/alarm.ts`, `components/hub/admin/PoliceAlert.tsx`): the siren is made in the browser with Web Audio, wails once a second in step with the lights, can be silenced, and stops by itself after 30 seconds. Browsers only allow sound after a click or key press, so the Unlock button primes it; without that (for example after a fresh page load) the lights show silently. The lights pulse once a second per colour (under the 3-per-second seizure threshold) and stand still with reduced motion.
- Unlocks, wrong passwords, lockouts and password changes are in the audit log; the attempt count is read from it.

| Screen | Hub path | What it is for |
|---|---|---|
| Overview | `/admin` | what is waiting in each queue, the number of accounts and approved listings, and the Admin panel password. Accounts whose only role is admin also see this on `/` |
| Listings | `/admin/listings` | tabs: To review, Flagged (spam check), Hidden, Removal pending, Paused, All listings (search by title, suburb, owner name or email). A side panel shows photos, owner, spam reasons and history, and only the actions the listing's state allows |
| ID checks | `/admin/id-checks` | hosts and mentors waiting for a government ID check: view the document (a five-minute link), approve, or reject with a reason they are emailed |
| Mentors | `/admin/mentors` | mentor sign-ups: listed only after their ID is checked and an admin approves the profile; send back with a reason. An approved mentor who changes their introduction comes back here |
| Final reviews | `/admin/reviews` | owner-approved applications waiting for Migrent |
| Reports | `/admin/reports` | user reports, scam-check flags on messages and emergency repairs. Act without leaving the report: pause a reported listing, read a reported conversation (audited as `view_conversation`), open or suspend the person, hide or restore a review |
| Support | `/admin/support` | tickets from the help button: reply (shown on the customer's ticket page), internal notes, status, priority, topic |
| People | `/admin/people` | everyone, newest first, 50 a page; search by name or email and filter by role, account status, ID check and join date. View as them (read-only), suspend or reinstate |
| Person | `/admin/people/{id}` | one person: ID check, listings, applications and tenancies, reports about them (including their messages) and by them, and every admin action on them and their listings |
| Numbers | `/admin/numbers` | plain counts from the database when the page opens (`GET /hub/admin/metrics`): people, homes, activity, safety and support, with median time to review a listing and to first reply. Nothing is estimated |
| Audit log | `/admin/audit` | every consequential admin action, who took it and why |

- **Endpoints** are in `backend/routes_hub_admin.py`. Listing moderation and ID checks call the same functions as the older `/admin` API (`routes_admin`, `routes_spam_moderation`, `routes_owner_verification`), so owner emails, the listing's moderation history and the audit rows are identical either way.
- **Audit first.** Each action writes `admin_audit_log` before it changes anything; if the write fails, nothing happens. Actions and target types must be in the CHECK constraints (migration 043, actions extended in 044) (`backend/tests/conftest.py` enforces them in tests, and `frontend/tests/unit/hubAdmin.test.ts` checks every one has a label). Support tickets keep their own history in `support_events`.
- **Reasons.** Rejecting, asking for changes, pausing, hiding and starting a removal need a written reason; so do rejecting an ID and suspending or reinstating an account. "Common reasons" offers ready-made wording to start from (`READY_REASONS` in `lib/hub/admin.ts`); it fills the box and can still be edited.
- **Removal is two steps**: start it (the listing stays offline in Removal pending), then confirm it. The row is kept (`moderation_status = 'deleted'`).
- **Suspending** sets `profiles.disabled_at`. Every Hub request from that account is then refused, the routes outside the Hub refuse its writes (`auth_utils.get_active_user`: messages, listings, bookings, reviews, mentor actions, profile edits), and its listings drop out of search, listing pages, Hub cards and `public_listings`. Nothing is deleted and listing statuses are untouched, so reinstating brings everything back. Support, reports, pausing or deleting their own listing and deleting the account stay open. The account cannot clear the flag itself (migration 046). Admin accounts can only be changed in the database.
- **Retired:** Analytics (its "visited" number was invented; Numbers replaces it with real counts), Revenue (it read a `payments` table that does not exist; Stripe is the record of money) and the Help articles form (the public Help Centre reads `lib/helpData.ts`, not that table).

---

## Journeys

### Applications

```
draft -> submitted -> under_review (owner opened it) -> shortlisted
                   \-> changes_requested (owner or Migrent asks) -> submitted / migrent_review
owner approves -> migrent_review -> finalised (tenancy created) | changes_requested | not_proceeding
owner declines -> declined          renter withdraws -> withdrawn
```

- An owner can never finalise; only Migrent's final review can, and each admin decision is audited with its reason.
- The owner sees a snapshot of the Rental Profile taken at submission, never the live profile. Income is only in the snapshot if the renter ticked "share my income" on that application. Documents are shared per application and their links expire.
- One approved applicant per home at a time. Finalising creates the tenancy, marks the listing occupied and pauses it.

### Inspections

Owners open times (in the property's time zone) with a capacity; renters book, change or cancel; owners can move a time (everyone booked is told) and mark attendance. The street address is released to a renter once they book.

### Messages

Every conversation is keyed by home and person (`<listing_id>_<other_user_id>`, or `direct_<id>`), and shows the application status and any booked inspection beside it. Owners have editable reply templates. Conversations can be archived, muted and reported.

- **Scam signs** (`backend/message_safety.py`): money before an inspection, a payment to hold the room, gift cards / crypto / money transfer services, bank details, "WhatsApp only", keys by post. The message is delivered (owner decision, 2026-10-02); the recipient sees a warning above it with a Report link, and the spam check files one report per sender per day in the admin Reports queue (`reports.source = 'system'`, migration 048).
- **Blocking** (`backend/blocks.py`, `/hub/blocks`): from the conversation menu; unblock there or in Settings > Blocked people. Either side's block stops messages, enquiries, applications, inspection bookings and stay requests between them, and the check fails closed. The person blocked is not told; their conversation just closes.

### Reviews

Both ways, after something real (`backend/reviews_core.py`, `routes_hub_reviews.py`, migration 048):

- A renter reviews the home and host, and a host reviews the renter, once each per tenancy (from 30 days in, or when it ends) or stay (after check-out), until 60 days after it ended.
- Neither sees the other's first: a review shows once both have written one, or 14 days after it was written.
- Renters' reviews are public (listing page, first name only). Hosts' reviews of a renter are never public: only a host deciding on that renter's application sees them, on the application.
- Pending reviews show on the Hub home and the tenancy page; `POST /internal/cron/review-prompts` emails a reminder (docs/runbooks/scheduled-jobs.md).
- Anyone can report a review (`/reviews/{id}/flag` or the report form); it stays up until an admin hides it from the Reports queue (`hide_review`, audited). The person reviewed cannot hide a review by flagging it.

### Tenancies, rent and repairs

- **Rent record, not rent collection.** Migrent never takes rent or bond. The owner sets up rent dates from the lease and records what arrived; the renter sees the same record.
- **Repairs:** routine / urgent / emergency. Emergencies show the "call 000" guidance and the state tenancy authority before the request is even sent, and appear in the admin Emergencies queue until work starts. Owners can add private notes the renter never sees.

### Listing wizard

Six steps (property, space, details, photos, rent and dates, review) with free navigation and autosave to `listing_drafts`. Nothing is gated behind a Next button; the review step lists what is missing and links to it. Submitting creates the listing through the same `create_listing` path the old form used, so moderation, verification and spam checks are unchanged. Owners whose ID is not checked yet can save; the listing waits as a draft until the check is done.

- **Money up front.** Bond and rent in advance are whole weeks of rent (`bond_weeks`, `rent_in_advance_weeks`, migration 047), capped at 4 and 2 weeks in every state (owner decision, 2026-10-01; `backend/listing_rules.py`). A lease must state both (zero is an answer); a short stay may leave bond out and never takes rent in advance. Hosts can add a weekly bills estimate when bills are not included. Renters see the total as "to move in" on the listing (`components/listings/MoveInCost.tsx`), on search cards and in Compare. The old free-text `bond` column is read only for older listings.
- **Where it is.** Suburb, state and postcode are checked against the ABS suburbs and localities (`backend/data/suburb_postcodes.json`, rebuilt by `frontend/scripts/abs/build-backend-index.mjs` at the end of every suburb data build). A suburb that is not in the chosen state, or a postcode from another state that the ABS does not map onto that suburb, is refused; anything less certain is a hint. The wizard suggests suburbs as you type and checks live (`GET /hub/location-check`).
- **New arrivals.** "Happy to rent to people new to Australia" (`newcomer_friendly`) shows on the listing and is a search filter.

### Many listings (property managers)

Properties (`/properties`) has a search box (address, suburb, nickname or title) and a status filter once an owner has more than one listing, and a "Manage several listings" list: select listings, then Pause, Bring back or Renew until a date. `POST /hub/listings/bulk` (up to 50 at a time) runs each through the same rules as its own page (`renew_for_owner`, `pause_for_owner`, `resume_for_owner` in `routes_listings.py`) and reports each one; any that could not change are named. There are no staff seats or CSV import (owner decision, 2026-10-02).

---

## Money

| Charge | Amount | When | Status |
|---|---|---|---|
| Host fee | AUD 99 per property, once | when the owner accepts the first stay booked through Migrent at that property | live code, needs live Stripe keys |
| Renter ID check | AUD 19, optional | when the renter chooses it | switched off (`SEEKER_VERIFICATION_ENABLED`) until it checks something real |
| New-renter fee | AUD 99, owner pays | once per new renter for an owner, charged to the owner's saved card after the renter's move-in payment goes through | built, off until `MOVE_IN_PAYMENTS_ENABLED=true` and Stripe Connect is on |

### Move-in payments (`backend/move_in.py`, migration 050)

Owner decisions, 2 October 2026. Off unless `MOVE_IN_PAYMENTS_ENABLED=true` and Stripe Connect is switched on for Migrent's Stripe account.

1. **Owner setup** (Hub > Settings > Payments): connect a bank through Stripe (an Express account; `profiles.stripe_account_id`) and save a card for Migrent's fee (Checkout in setup mode).
2. **The renter pays** the rent in advance from the tenancy page: the listing's `rent_in_advance_weeks`, or one week. It is a destination charge on behalf of the owner, so Stripe sends it straight to the owner and Migrent never holds it. **The renter pays the card fee on top** (a second line on the Stripe page, `card_fee_cents`, grossed up so Stripe's cut of the whole payment is covered); Migrent keeps it as the application fee and the owner receives the full rent. Australian law caps a card surcharge at the cost of taking the card, so `MOVE_IN_CARD_FEE_PERCENT` and `MOVE_IN_CARD_FEE_FIXED_CENTS` must match Stripe's price.
3. **The green light**: the Stripe webhook (`fee_type=move_in`) marks it paid, adds it to the rent ledger, and emails both receipts. The renter's shows the owner and the property; the owner's shows the renter.
4. **The fee**: if the owner has not had this renter through Migrent before, their saved card is charged AUD 99 off-session. A decline is shown to the owner (update card, try again) and to admins.
5. **Both confirm**: the owner taps "I've received the payment", the renter "I've moved in and have the keys". Then Migrent's receipt is complete and admins are told (Admin panel > Move-ins).
6. **The security code**: one 10-character code (no 0/O or 1/I) on all three receipts, so the renter and owner can check each other when they meet.

The bond is never paid through Migrent: the renter pays it to their state's bond authority.

`backend/billing.py` reports `payments_mode()` as `off`, `test` or `live` from the Stripe key, and the Hub says so wherever money is mentioned ("test mode: nothing is charged"). There is no fake checkout.

**Open decision:** the product brief describes the $99 as a *per-listing* fee. The code charges it *per property, at the first confirmed stay booking* (`FEE_MODEL=per_property`), and the long-term application path (apply -> Migrent final review -> tenancy) does not charge anything today. Decide the model before taking live payments.

---

## Notifications and email

`notify_user()` (hub_common.py) writes the in-app notification (Activity) and sends the email unless the person turned that group off in Settings (`EMAIL_PREFERENCE_GROUP` in notification_service.py). Links point at the Hub page (`HUB_BASE_URL` once set). Security and account emails have no switch.

**Unsubscribe.** Every email that can be switched off carries a footer link to `/unsubscribe` (asks once, then switches that kind of email off without signing in) and `List-Unsubscribe` / `List-Unsubscribe-Post` headers so mail apps can show their own button (`backend/unsubscribe.py`, `POST /email/unsubscribe`). The link is signed with an HMAC of the person and the email kind, so it cannot be forged for someone else.

Scheduled jobs (all `POST`, header `X-Cron-Secret`), see also [runbooks/scheduled-jobs.md](runbooks/scheduled-jobs.md):

| Endpoint | Suggested schedule |
|---|---|
| `/internal/cron/saved-search-alerts?cadence=instant` | every 15 minutes |
| `/internal/cron/saved-search-alerts?cadence=daily` | daily, 08:00 AEST |
| `/internal/cron/saved-search-alerts?cadence=weekly` | Mondays, 08:00 AEST |
| `/internal/cron/inspection-reminders` | daily, 09:00 AEST |
| `/internal/cron/review-prompts` | daily, 10:00 AEST |

---

## Listing insights

Views are recorded in `listing_events` from the public listing page and the Hub; the owner's own visits are not counted; visitor ids are hashed with `ANALYTICS_SALT`. Insights only ever show recorded counts. There are no estimates, benchmarks or invented numbers, and pages say when counting started.

---

## AI listing help

Off unless `AI_LISTING_ASSIST_ENABLED=true` **and** an Anthropic credential is set. It drafts a title and description from the details the owner entered (never the street address), it is only a suggestion the owner can use, edit or discard, and it never publishes anything or makes any decision about renters. Model: `AI_LISTING_MODEL` (default `claude-opus-5`), with the API's server-side refusal fallback enabled (`fallbacks="default"`).

---

## Environment variables

**Vercel (frontend)**

| Variable | Needed | What |
|---|---|---|
| `NEXT_PUBLIC_HUB_HOST` | only for the Hub host | e.g. `hub.migrent.com.au`; unset serves the Hub at `/hub` |
| `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` | with the Hub host | `.migrent.com.au` so both hosts share the sign-in |
| `NEXT_PUBLIC_SITE_ORIGIN` | with the Hub host | `https://migrent.com.au`, for links from the Hub back to the site |

**Render (backend)**

| Variable | Needed | What |
|---|---|---|
| `HUB_BASE_URL` | with the Hub host | origin used in email and notification links |
| `CRON_SECRET` | yes | shared secret for the scheduled jobs |
| `ANALYTICS_SALT` | recommended | any long random string; hashes visitor ids in listing insights |
| `AI_LISTING_ASSIST_ENABLED` | optional | `true` to offer the writing help |
| `ANTHROPIC_API_KEY` | with AI help | the key the writing help uses |
| `AI_LISTING_MODEL` | optional | defaults to `claude-opus-5` |
| `FEE_MODEL` | optional | `per_property` (default) |
| `STRIPE_SECRET_KEY` | for payments | `sk_live_...` to take real payments; `sk_test_...` shows "test mode" |
| `RATE_LIMIT_STORAGE_URI` | recommended | a Redis URL (for example Upstash, `rediss://...`) so rate limits are shared by every server process; unset keeps them per process. If Redis is unreachable the limits fall back to memory rather than failing requests |
| `UNSUBSCRIBE_SECRET` | recommended | any long random string; signs unsubscribe links (falls back to a key derived from the service key) |
| `API_PUBLIC_URL` | optional | this API's public address for one-click unsubscribe; Render's `RENDER_EXTERNAL_URL` is used when unset |

---

## Deploy order

1. **Backend (Render)** from this commit. The Hub endpoints answer "not set up yet" until step 2; nothing existing changes.
2. **Migration 043** in Supabase (SQL editor or `apply_migration`). Additive and idempotent; it also creates the private `renter-documents` and `maintenance-photos` buckets. **Applied to production on 2026-09-28** (version `20260928094712`), ahead of the backend: the current backend ignores the new tables and columns, so the order is safe either way.
3. **Frontend (Vercel)** from this commit. The old dashboard, owner, wishlist, messages and account pages now redirect into the Hub.
4. **Scheduled jobs** on Render (table above).
5. Later: the Hub host (see [Where it lives](#where-it-lives)).

---

## Old pages and where they went

| Old | Hub |
|---|---|
| `/dashboard`, `/dashboard/owner`, `/dashboard/seeker` | `/` (role-specific home) |
| `/dashboard/notifications` | `/activity` |
| `/dashboard/seeker-profile`, `/seeker/profile` | `/profile` (Rental Profile) |
| `/dashboard/owner-profile`, `/owner/profile` | `/settings` |
| `/owner/listings`, `/owner/listings/new`, `/owner/listings/:id`, `/owner/listings/edit/:id` | `/properties`, `/properties/new`, `/listings/:id`, `/listings/:id/edit` |
| `/seeker/wishlist`, `/seeker/saved` | `/saved` |
| `/messages`, `/account/messages/:userId` | `/messages`, `/messages/direct_:userId` |
| `/account/settings` | `/settings` |
| `/onboarding` | `/welcome` |
| `/signin`, `/signup`, `/magic-link-*`, `/forgot-password`, `/reset-password` | Hub equivalents |
| `/admin`, `/admin/overview`, `/admin/analytics`, `/admin/revenue` | `/admin` (Admin panel overview) |
| `/admin/moderation`, `/admin/spam-moderation`, `/admin/listings` | `/admin/listings` (To review, Flagged, All listings) |
| `/admin/verification` | `/admin/id-checks` |
| `/admin/users` | `/admin/people` |
| `/admin/reports`, `/admin/support`, any other `/admin/...` | the same path in the Hub |

Redirects are temporary (307) and never apply on the Hub's own host. Old notification links are routed the same way in the Activity page.

---

## Testing

```bash
cd backend && source venv/bin/activate && python -m pytest -q       # API, incl. tests/test_hub.py
cd frontend && npx vitest run                                       # unit
cd frontend && NEXT_DIST_DIR=.next-e2e npm run build:test          # production build against the mock
cd frontend && NEXT_DIST_DIR=.next-e2e npx playwright test --workers=2
```

- `tests/e2e/hub-mock.mjs` is an in-memory Supabase Auth plus every Hub endpoint. Fixture accounts (they exist only in the mock, password `hub-test-pass-1`): `renter@example.test`, `owner@example.test`, `tenant@example.test`, `admin@example.test`, `new@example.test`, `newowner@example.test` (an owner waiting for an ID check), `boss@example.test` (an owner who is also an admin) and `grace@example.test` (a renter who is also an admin; the lockout test uses her). The mock's Admin panel password is `panel-test-pass-1`. The admin fixtures also include a listing to review, a spam-flagged listing and three support tickets.
- `npm run dev:mock` runs the site against the mock for local work (http://localhost:3200); `npm run preview:e2e` serves the Playwright build (http://localhost:3100).
- `tests/e2e/hub.spec.ts` covers the signed-out redirects and intents, renter, tenant, owner and admin journeys (the Admin panel password, the 30-second lock and the three-strike lockout, moderation, ID checks, suspending, support, the old `/admin` redirects), and axe checks in light and dark. `backend/tests/test_hub_admin.py` covers the admin API and `backend/tests/test_admin_panel.py` the panel password.
