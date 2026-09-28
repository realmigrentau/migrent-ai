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
| Property manager | `profiles.role = 'owner'`, `owner_kind = 'property_manager'` | same |
| Admin | `profiles.is_admin` or an admin role | **never self-selected**; granted in the database |

- Every endpoint resolves the caller with `hub_actor()` and checks rights on the server (`require_owner`, `require_admin_actor`, ownership of each record). Hiding a button is never the control.
- Switching from owner to renter is refused while listings are live or in review, or while a tenancy is active, so nothing is stranded.
- **View as (admins, for support):** an admin opens it from People with a written reason. It is read-only (every write returns 403), limited to 60 minutes, and the start, the end and the reason are written to `admin_audit_log`. The customer's data is served by the API under the admin's own session plus the `X-Migrent-View-As` header, which the backend checks against the audit log.

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

### Tenancies, rent and repairs

- **Rent record, not rent collection.** Migrent never takes rent or bond. The owner sets up rent dates from the lease and records what arrived; the renter sees the same record.
- **Repairs:** routine / urgent / emergency. Emergencies show the "call 000" guidance and the state tenancy authority before the request is even sent, and appear in the admin Emergencies queue until work starts. Owners can add private notes the renter never sees.

### Listing wizard

Six steps (property, space, details, photos, rent and dates, review) with free navigation and autosave to `listing_drafts`. Nothing is gated behind a Next button; the review step lists what is missing and links to it. Submitting creates the listing through the same `create_listing` path the old form used, so moderation, verification and spam checks are unchanged. Owners whose ID is not checked yet can save; the listing waits as a draft until the check is done.

---

## Money

| Charge | Amount | When | Status |
|---|---|---|---|
| Host fee | AUD 99 per property, once | when the owner accepts the first stay booked through Migrent at that property | live code, needs live Stripe keys |
| Renter ID check | AUD 19, optional | when the renter chooses it | switched off (`SEEKER_VERIFICATION_ENABLED`) until it checks something real |

`backend/billing.py` reports `payments_mode()` as `off`, `test` or `live` from the Stripe key, and the Hub says so wherever money is mentioned ("test mode: nothing is charged"). There is no fake checkout.

**Open decision:** the product brief describes the $99 as a *per-listing* fee. The code charges it *per property, at the first confirmed stay booking* (`FEE_MODEL=per_property`), and the long-term application path (apply -> Migrent final review -> tenancy) does not charge anything today. Decide the model before taking live payments.

---

## Notifications and email

`notify_user()` (hub_common.py) writes the in-app notification (Activity) and sends the email unless the person turned that group off in Settings (`EMAIL_PREFERENCE_GROUP` in notification_service.py). Links point at the Hub page (`HUB_BASE_URL` once set). Security and account emails have no switch.

Scheduled jobs (all `POST`, header `X-Cron-Secret`), see also [runbooks/scheduled-jobs.md](runbooks/scheduled-jobs.md):

| Endpoint | Suggested schedule |
|---|---|
| `/internal/cron/saved-search-alerts?cadence=instant` | every 15 minutes |
| `/internal/cron/saved-search-alerts?cadence=daily` | daily, 08:00 AEST |
| `/internal/cron/saved-search-alerts?cadence=weekly` | Mondays, 08:00 AEST |
| `/internal/cron/inspection-reminders` | daily, 09:00 AEST |

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

Redirects are temporary (307) and never apply on the Hub's own host. Old notification links are routed the same way in the Activity page.

---

## Testing

```bash
cd backend && source venv/bin/activate && python -m pytest -q       # API, incl. tests/test_hub.py
cd frontend && npx vitest run                                       # unit
cd frontend && NEXT_DIST_DIR=.next-e2e npm run build:test          # production build against the mock
cd frontend && NEXT_DIST_DIR=.next-e2e npx playwright test --workers=2
```

- `tests/e2e/hub-mock.mjs` is an in-memory Supabase Auth plus every Hub endpoint. Fixture accounts (they exist only in the mock, password `hub-test-pass-1`): `renter@example.test`, `owner@example.test`, `tenant@example.test`, `admin@example.test`, `new@example.test`.
- `npm run dev:mock` runs the site against the mock for local work (http://localhost:3200); `npm run preview:e2e` serves the Playwright build (http://localhost:3100).
- `tests/e2e/hub.spec.ts` covers the signed-out redirects and intents, renter, tenant, owner and admin journeys, and axe checks in light and dark.
