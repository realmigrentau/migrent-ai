# Public data contract

What an anonymous visitor (or any user who is not the owner or an admin) can
receive from Migrent, and what they can never receive. Enforced in three
places that must stay in sync:

| Layer | Where | What it does |
|---|---|---|
| API serialiser | `backend/public_dto.py` | Builds every public listing/owner payload from an explicit allow-list. Anything not listed is dropped. |
| Database | `public_listings` view and `get_public_profile(lookup)` (migrations 042, 052) | The only listing/profile data the browser may read directly. `public_listings` can be listed; profiles cannot: `get_public_profile` returns one profile for a known public id, without the internal id unless the caller is signed in, and never for a suspended account. Since 052 `anon` and `authenticated` have no grant on any private table, so a row-policy mistake cannot expose data either. |
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

## Accepted Supabase advisor warnings

Checked against the live database on 2026-11-01. These are deliberate. Do not "fix" them without replacing what they do.

| Advisor finding | Why it stays |
|---|---|
| `security_definer_view` (ERROR): `public.public_listings` | It is the only public way into listings. It runs as its owner so it can read `listings` (which `anon` and `authenticated` have no grant on) and it returns only approved, visible, unexpired listings from accounts that are not suspended, with suburb and postcode instead of the street address, coordinates jittered and rounded, and the owner's `public_id` instead of their auth id. Making it `security_invoker` would need a browser grant on `listings`, which is exactly what 052 removed. |
| `anon_security_definer_function_executable` / `authenticated_...`: `public.get_public_profile(lookup text)` | It is how the browser reads one profile. It accepts only a UUID or a 4 to 40 character public id (anything else returns null), reads `public_profiles` (public fields only, `disabled_at IS NULL`, so never a suspended account), and drops the internal `id` for signed-out callers. `public_profiles` itself has no `anon` or `authenticated` grant, so profiles cannot be listed. |
| `authenticated_security_definer_function_executable`: `current_user_is_admin()`, `is_superadmin()` | They answer only about the caller and return a boolean. |
| `pg_graphql_*_table_exposed`: `public_listings`, `help_articles`, `help_article_categories`, `stations`, `suburbs`, `uni_locations`, `visa_types` | Public reference data and the public listings view. Nothing private is exposed. |
| `rls_enabled_no_policy` (INFO) on 50 tables | Intended: RLS on with no policies and no browser grants means the browser cannot read or write them at all. Every read and write goes through the API with the service role. |
