# Public data contract

What an anonymous visitor (or any user who is not the owner or an admin) can
receive from MigRent, and what they can never receive. Enforced in three
places that must stay in sync:

| Layer | Where | What it does |
|---|---|---|
| API serialiser | `backend/public_dto.py` | Builds every public listing/owner payload from an explicit allow-list. Anything not listed is dropped. |
| Database view | `public_listings`, `public_profiles`, `public_verification` (migration 042) | The only listing/profile objects `anon` and `authenticated` may read directly. `anon` has no grant on `listings` at all. |
| Tests | `backend/tests/test_public_dto.py`, `test_listings_public.py`, `frontend/tests/e2e/search.spec.ts` | Assert forbidden fields never appear, in the API and in rendered HTML. |

## Never public

- Street address, `geocoded_address`, exact `latitude` / `longitude`. The public payload carries `location.approx_lat/approx_lng` (deterministic jitter inside ~400 m, rounded to 3 dp) and `display_address` = suburb + postcode.
- The owner's auth UUID. Owners are addressed by `profiles.public_id` (12 hex chars). Security never depends on IDs being secret: every read and write is authorised from the session token.
- `moderation_status`, notes, reason, moderator id, `moderated_at`, spam score/reasons, `flagged_at`, `reviewed_*`, `delete_*`, `hidden_at`, `content_hash`, `expiry_notified_at`, `listing_fee_paid_at`.
- Weapons disclosure fields (shared with the owner and admins only).
- Profile: email, phone(s), residential address, emergency contact, recovery hash, ID document URL, age/DOB, visa type, budget, move-in date, preferred suburbs, admin flag, role, the paid `verified` flag, legal name, wishlist, notification settings.
- Messages, applications, bookings, payment identifiers, storage paths.

## Trust state

`verification_summary()` derives `status` (verified / pending / unverified) and per-check booleans from `owner_verification` only. The free-text `profiles.badges` array cannot carry a trust word (database trigger `profiles_guard_badges`), and the UI renders trust through one component, `components/VerificationBadge.tsx`, which always shows the API's disclaimer and links to `/safety-verification`.

## When the exact address is released

Only to the owner, to admins, and (product decision pending, see `docs/legal/identity-and-claims.md`) to a seeker whose booking the owner has accepted. Today the owner and admin views are the only ones that include `street_address` and `exact_location`.

## Changing the contract

1. Add the column to `PUBLIC_LISTING_FIELDS` in `public_dto.py` **and** to the `public_listings` view in a new migration.
2. If it must stay private, add it to `FORBIDDEN_PUBLIC_LISTING_FIELDS` so the tests fail if it ever leaks.
