# Access-control matrix

Roles: **anon** (no session), **seeker**, **owner** (of the resource), **other** (signed in, not a party), **admin** (`profiles.is_admin` or role in admin/superadmin, read under the service role; never from `user_metadata`).

| Resource / action | anon | seeker | owner | other | admin |
|---|---|---|---|---|---|
| Search, public listing page, public profile | read (public contract) | read | read | read | read |
| Listing detail owner view (street address, pin, notes) | 404 | 404 | full | 404 | full |
| Create / edit / pause / renew / delete listing | 401 | 403 | ok | 403 | 403 (use admin endpoints) |
| Submit for review | 401 | 403 | ok if ID-verified | 403 | n/a |
| Admin moderation (`/admin/*`, `/owner-verification/admin/*`) | 401 | 403 | 403 | 403 | ok |
| `/admin/*` pages (edge) | redirect to sign-in | 404 | 404 | 404 | ok (+ AdminGate passphrase) |
| Booking create | 401 | ok (published listings only, inside availability) | 400 (own listing) | ok | ok |
| Booking read | 401 | party only | party only | 403 | via admin tools |
| Booking respond (accept/decline) | 401 | 403 | ok | 403 | n/a |
| Booking cancel | 401 | ok (seeker only) | 403 | 403 | n/a |
| Checkout status | 401 | party only | party only | 403 | n/a |
| Messages: read thread | 401 | own threads only (scoped by session) | own | empty | n/a |
| Messages: send | 401 | as self only; listing context must belong to a party; blocked users refused | same | same | n/a |
| Message attachments | 401 | upload namespaced to sender; read via 10-min signed URL for participants | same | 403 | n/a |
| Verification documents | never | own upload only; never readable back | same | never | signed URL, 5 min |
| Profile private fields | never | own only | own only | never | admin dashboard |
| Data export / account delete | 401 | own | own | 403 | n/a |
| Internal cron | 401 | 401 | 401 | 401 | 401 (secret header only) |
| Stripe webhook | signature only | signature only | signature only | signature only | signature only |

Database policies (RLS) mirror the same matrix: `anon` cannot read `listings` (only `public_listings`); `authenticated` can read own rows and public views; all writes on listings, bookings, reviews, messages, deals, reports and referrals go through the API (grants revoked in migration 039). Tests: `backend/tests/test_authz_matrix.py`, `frontend/tests/e2e/security.spec.ts`.
