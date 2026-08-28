# MIGRENT COMPLETE AUDIT

**Date:** 2026-08-29
**Branch audited:** `fix/launch-hardening` (commit `2c8c373`)
**Scope:** full repository - Next.js 16 / React 19 frontend (98 pages), FastAPI backend (127 routes, 28 modules), Supabase Postgres (42 migrations, ~28 tables)
**Method:** static reading of every route, component, migration and policy. Where a claim could not be confirmed without a running database or a rendered browser, it is marked **NEEDS VERIFICATION**.

> **One caveat on method.** I started a `next build` to check for type and lint errors and to confirm that the malformed CSS classes emit no CSS. It was still running when this report was finished, so **the build was not verified as passing**. The malformed-class finding rests on Tailwind's arbitrary-value grammar (`bg-[...]` followed by a stray `0` before the opacity modifier is not a parseable utility), which is high confidence but worth confirming against the compiled stylesheet. Run `npx next build` and grep the output CSS for `accent-soft)]0` to close it out.

---

## 1. Executive Summary

Migrent is further along than most pre-launch marketplaces. The design system is genuinely good, the code is unusually clean for its age, the FastAPI layer does real authorisation work, and several earlier honesty passes (the API-docs page, the matching engine, the mentors page) left honest artefacts behind. Somebody has been careful here.

But the project is **not close to being safe to put real users on**, and the reason is structural rather than cosmetic.

The core architectural problem: **the FastAPI backend is treated as the security boundary, while the database simultaneously hands the browser equivalent write access.** Every rule the backend enforces - owner verification before listing, moderation before publishing, "only participants in a completed deal may review", "only the owner may accept a booking", "only admins may see the user table" - can be bypassed by talking to Supabase PostgREST directly with the public anon key. The backend checks are real, but they are optional.

On top of that sit two things that are not engineering problems at all: the site advertises **bond escrow that does not exist anywhere in the codebase**, and the booking checkout **charges the renter the owner's $99 fee** while the pricing page promises renters pay $0 forever.

### Scores

| Dimension | Score | Why |
|---|---|---|
| **Overall quality** | **5.0 / 10** | Strong foundations undercut by a security model that does not hold and product claims that are not true. |
| **UI / UX** | **6.5 / 10** | The "Sand & Ocean" system is coherent, well-tokenised and genuinely attractive. Undercut by ~296 malformed CSS classes, 8 dead nav links, and dead controls on key pages. |
| **Functionality** | **5.0 / 10** | The happy paths mostly work. Password reset does not exist. Two owner dashboards. Listing deletion destroys paid bookings. No double-booking guard. |
| **Code quality** | **6.5 / 10** | Genuinely good: 1 `console.log`, 1 TODO, 67 `any` across ~33k lines. Held back by ~1,900 lines of duplicated pages, 12 dead components, and a 62k-line `api.ts`. |
| **Mobile** | **6.0 / 10** | Responsive classes are present and considered throughout; the navbar has a real mobile tree. Several specific risks identified below. Partly **NEEDS VERIFICATION** - I read code, not rendered viewports. |
| **Security** | **2.0 / 10** | Unauthenticated read of every user's phone, home address and emergency contact. Two independent paths from any signed-up account to full admin. Stored XSS to account takeover. |
| **Performance** | **5.0 / 10** | Good instincts (dynamic maps, image compression on upload, `optimizePackageImports`). Undone by 0 uses of `next/image` across 25 raw `<img>` tags and 95 of 98 pages being client-only. |
| **Launch readiness** | **2.0 / 10** | Nine hard blockers. None are large; most are half a day each. But they are absolute. |

**The honest one-line summary:** this is roughly six to eight focused working days away from being defensible, and almost all of that work is closing holes rather than building features.

---

## 2. Top 10 Most Important Problems

### 1. Every user's phone number, home address and emergency contact is readable by anyone on the internet

* **Problem:** Migration `015_fix_profiles_public_read.sql` creates `CREATE POLICY profiles_select ON profiles FOR SELECT USING (true)` with **no role restriction**, and follows it with `GRANT SELECT ON profiles TO anon`. RLS policies are OR'd, so this permissive policy overrides the own-row-or-superadmin policy from migration 013. Migration 019 then also adds `profiles_public_read USING (true)`.
* **Severity:** 🔴 **P0 - Critical**
* **Location:** [015_fix_profiles_public_read.sql:9](backend/migrations/015_fix_profiles_public_read.sql:9), [019_security_rls_fixes.sql:29](backend/migrations/019_security_rls_fixes.sql:29)
* **Impact:** Anyone holding the publishable anon key - which ships in the client bundle by design - can run `supabase.from('profiles').select('*')` and receive **every column of every row**: `phone`, `phones[]`, `residential_address` (JSONB street address), `emergency_contact` (JSONB), `recovery_password_hash`, `identity_verification_url`, `age`, `visa_type`, `budget_min/max`, `move_in_date`. The user base is migrants and international students - among the most vulnerable renter cohorts in Australia. This is a notifiable data breach under the Privacy Act's NDB scheme the moment a real user signs up. Migration 038, the launch-hardening pass, did not touch `profiles`.
* **Fix:** Drop both permissive policies. Create a `public_profiles` view exposing only `id, name, preferred_name, about_me, custom_pfp, occupation, verified, badges, average_rating, reviews_count`, grant `SELECT` on that view to `anon`/`authenticated`, and `REVOKE SELECT ON profiles FROM anon, authenticated` entirely - the backend uses the service role and does not need the grant. Move `recovery_password_hash` out of `profiles` altogether.
* **Complexity:** Small (one migration, ~40 lines) + Medium (audit the ~30 frontend call sites that read `profiles` directly).

### 2. Any registered user can make themselves a superadmin - two independent ways

* **Problem (path A, backend):** `_require_admin` checks `user.user_metadata.get("role")` **first**, before any database lookup. Supabase `user_metadata` is user-writable: `supabase.auth.updateUser({ data: { role: 'superadmin' } })` from the browser console.
* **Problem (path B, database):** the `profiles_update_own` RLS policy is column-unrestricted, and `profiles_role_check` permits `'superadmin'`. So `supabase.from('profiles').update({ role: 'superadmin' }).eq('id', myId)` succeeds. `is_superadmin()` then returns true, which unlocks `admin_users_view` (every user's email and last sign-in), and the backend's fallback branch also grants admin.
* **Severity:** 🔴 **P0 - Critical**
* **Location:** [routes_admin.py:34-46](backend/routes_admin.py:34), [019_security_rls_fixes.sql:38](backend/migrations/019_security_rls_fixes.sql:38), [013_complete_superadmin_fix.sql:11](backend/migrations/013_complete_superadmin_fix.sql:11)
* **Impact:** Full access to all 10 admin pages: the user table with emails, listing moderation, revenue, spam moderation, verification approval, reports. Note that `AdminGate.tsx` - the username/password prompt on `/admin` - is client-side only and is decorative; the real gate is `_require_admin`, and it is broken.
* **Fix:** Delete the `user_metadata` branch from `_require_admin` entirely; read the role only from the database under the service role. Add a `BEFORE UPDATE` trigger on `profiles` that raises if `NEW.role IS DISTINCT FROM OLD.role` and the caller is not the service role. Better still, move admin status to a separate `admin_users` table that `authenticated` has no grant on at all.
* **Complexity:** Small.

### 3. The site advertises bond escrow that does not exist

* **Problem:** "Your bond is held in independent escrow, never in the landlord's account" appears in ~25 places including the homepage hero chips, the how-it-works panel, the pricing page's included-features list, `for-seekers`, `for-owners`, the sign-in and sign-up pages, the footer, the booking form, and **three meta descriptions**. `grep -ri escrow backend/` returns **zero matches**. There is no escrow provider, no bond-holding code, no bond field on `bookings`.
* **Severity:** 🔴 **P0 - Critical (legal, not technical)**
* **Location:** [pages/index.tsx:119,406,420,445,451,460](frontend/pages/index.tsx:119), [pages/pricing.tsx:32,42,50](frontend/pages/pricing.tsx:32), [components/SiteFooter.tsx:74](frontend/components/SiteFooter.tsx:74), [components/bookings/RequestToBookForm.tsx:225](frontend/components/bookings/RequestToBookForm.tsx:225)
* **Impact:** Misleading conduct under s18 of the Australian Consumer Law, aimed at a cohort with limited local legal recourse. It is compounded by a fabricated testimonial - "Lucas, São Paulo → Surry Hills: *The bond went into escrow, not my landlord's account. That felt huge.*" - which is a fake customer endorsement of a feature that does not exist. Separately: in NSW, VIC and QLD residential bonds must be lodged with the state authority (Rental Bonds Online / RTBA / RTA), so "we hold your bond in escrow" would be unlawful even if you built it.
* **Fix:** Remove every escrow claim today. If bond protection is the intended differentiator, the compliant version is "we walk you through lodging your bond with [state authority] and hold the receipt" - which is a genuinely good product and much cheaper to build. Remove the three fabricated testimonials (`Aisha`, `Lucas`, `Mei` at [index.tsx:444-447](frontend/pages/index.tsx:444)) or replace them with real, consented quotes.
* **Complexity:** Small.

### 4. The renter is charged the owner's $99 fee

* **Problem:** `create_booking_checkout` builds one Stripe session containing **both** line items - "MigRent Owner Service Fee" ($99) and "MigRent Seeker Service Fee" ($19) - and that single session URL is handed to the **seeker**: returned to the seeker's browser on instant book, and emailed to the seeker via `send_booking_accepted_to_seeker` on request-to-book. The owner is never charged anything.
* **Severity:** 🔴 **P0 - Critical**
* **Location:** [routes_bookings.py:40-72](backend/routes_bookings.py:40), [routes_bookings.py:300-370](backend/routes_bookings.py:300)
* **Impact:** The renter pays **$118 AUD** at a checkout the pricing page describes as "$0, forever - Renters never pay MigRent a service fee." That is a direct, documented contradiction of published pricing at the point of payment. It is also a business-model failure: the owner-side revenue never arrives.
* **Fix:** Split into two Stripe sessions, or use Stripe Connect so the $99 is collected from the owner's payment method. If the intent is genuinely that the renter pays $118, then the pricing page, `for-seekers`, the footer and three meta descriptions must be rewritten first.
* **Complexity:** Medium.

### 5. Stored XSS in messages leading to account takeover

* **Problem:** `MessageBubble.tsx:192` renders `message.message_html` through `dangerouslySetInnerHTML`. The only sanitiser is `_sanitize_html = re.sub(r"<[^>]+>", "", html)`, a regex tag-stripper, and it can be reached around two ways: (a) the regex requires a closing `>`, so `<img src=x onerror=alert(1)` passes through untouched and the browser auto-closes it; (b) the `messages` RLS policy grants `INSERT` directly to `authenticated` scoped only on `sender_id = auth.uid()`, so an attacker can write the row through PostgREST and never touch the backend at all.
* **Severity:** 🔴 **P0 - Critical**
* **Location:** [components/messages/MessageBubble.tsx:192](frontend/components/messages/MessageBubble.tsx:192), [routes_messages.py:37-42](backend/routes_messages.py:37), [019_security_rls_fixes.sql:134](backend/migrations/019_security_rls_fixes.sql:134)
* **Impact:** Script executes in the recipient's session. Supabase stores the session in `localStorage`, so the payload exfiltrates the access token - full account takeover of anyone you can message. The CSP that would have blunted this ships as `Content-Security-Policy-Report-Only`, so it blocks nothing. Note the irony: because the sanitiser strips *all* tags on the honest path, the rich-text feature (`[&_strong]:font-bold` etc.) never actually works. The feature is simultaneously broken and dangerous.
* **Fix:** Stop rendering `message_html`. Render `message_text` as plain text - the component already has that branch. If rich text is wanted later, do it with a real allowlist sanitiser server-side and revoke the direct `INSERT` grant.
* **Complexity:** Small.

### 6. The backend's business rules are all optional

* **Problem:** Migration 019 grants `authenticated` direct `INSERT`/`UPDATE`/`DELETE` on `profiles`, `listings`, `deals`, `messages`, `reports` and `referrals`, and migration 024 does the same for `bookings`. Every rule the FastAPI layer enforces has a PostgREST bypass.
* **Severity:** 🔴 **P0 - Critical**
* **Location:** [019_security_rls_fixes.sql](backend/migrations/019_security_rls_fixes.sql), [024_bookings_system.sql:80-100](backend/migrations/024_bookings_system.sql:80), [021_reviews_system.sql:52](backend/migrations/021_reviews_system.sql:52)
* **Impact, concretely:**
  * **Bookings:** `bookings_update_owner` permits `auth.uid() = owner_id OR auth.uid() = seeker_id` with no `WITH CHECK` on columns, so a **seeker can set their own booking to `status = 'PAID'`** without paying, which fires the "booking confirmed" emails to the owner.
  * **Reviews:** `reviews_insert_own` only checks `reviewer_id = auth.uid()`. `deal_id` is nullable and `UNIQUE(deal_id, reviewer_id)` does not constrain NULLs, so **unlimited fake 5-star reviews about any user or listing** can be injected. The careful deal-completion checks in `routes_reviews.py` are bypassed entirely.
  * **Listings:** direct insert with `owner_id = self` bypasses the owner-verification gate, the spam scoring, and `moderation_status = 'pending_approval'` - the attacker just sets `'approved'`.
  * **Profiles:** self-update of `verified`, `is_verified`, `identity_verified`, `average_rating`, `reviews_count`, `badges`.
* **Fix:** Revoke `INSERT`/`UPDATE`/`DELETE` on all of these from `authenticated`. Route every write through the backend, which already exists and already does the checks correctly. Keep read policies (correctly narrowed per #1). This is the single highest-leverage change in the whole audit.
* **Complexity:** Medium (one migration; then fix the frontend call sites that currently write directly - `useWishlist`, `useSettingsData`, `adminApi`).

### 7. Deleting a listing destroys paid bookings and all message history

* **Problem:** `delete_listing` performs a hard `DELETE`. `bookings.listing_id` and `messages.listing_id` are both `REFERENCES listings(id) ON DELETE CASCADE`.
* **Severity:** 🔴 **P0 - Critical**
* **Location:** [routes_listings.py:690](backend/routes_listings.py:690), [024_bookings_system.sql:33](backend/migrations/024_bookings_system.sql:33), [002_add_messages_and_extended_profiles.sql:9](backend/migrations/002_add_messages_and_extended_profiles.sql:9)
* **Impact:** One owner clicking "delete listing" silently destroys every booking on it - including `PAID` ones with a real Stripe charge - and the entire conversation history between that owner and every renter who contacted them. You cannot reconcile a Stripe payment to a booking that no longer exists, and you cannot adjudicate a dispute with no messages. Reviews orphan too (`reviews.listing_id` has no FK at all).
* **Fix:** Soft-delete: set `moderation_status = 'deleted'` (the read paths at [routes_listings.py:556](backend/routes_listings.py:556) already expect this - though note `'deleted'` is **not in the CHECK constraint**, so that write would currently fail: `CHECK (moderation_status IN ('pending_approval','approved','rejected','changes_requested'))`). Change the FKs to `ON DELETE RESTRICT` for bookings and `SET NULL` for messages.
* **Complexity:** Small.

### 8. There is no password reset

* **Problem:** `resetPasswordForEmail` appears nowhere in the codebase. There is no forgot-password page. The "Forgot password?" link on the sign-in page points at `/magic-link-login`.
* **Severity:** 🔴 **P0 - Critical**
* **Location:** [pages/signin/index.tsx:156](frontend/pages/signin/index.tsx:156), [lib/helpData.ts:413](frontend/lib/helpData.ts:413)
* **Impact:** A user who forgets their password can never set a new one - they are permanently on magic links. The help centre actively documents a flow that does not exist: *"go to the sign-in page and click Forgot password. Enter your email address and we'll send you a reset link."* That article will generate support tickets from day one.
* **Fix:** Either build the reset flow (Supabase gives you `resetPasswordForEmail` plus a `/reset-password` page - about two hours), or commit to magic-link-only, relabel the link "Sign in with a link instead", and correct the two help articles.
* **Complexity:** Small.

### 9. Listing detail pages have no server-rendered HTML, and are not in the sitemap

* **Problem:** 95 of 98 pages are client-only. `pages/listing/[id].tsx` fetches in `useEffect` and **returns early on the loading branch before `SEOHead` renders**, so the pre-rendered HTML for every listing contains a skeleton and zero page-specific metadata. The sitemap's own comment concedes the point and lists no listing URLs at all.
* **Severity:** 🟠 **P1 - High**
* **Location:** [pages/listing/[id].tsx:44-115](frontend/pages/listing/[id].tsx:44), [pages/sitemap.xml.tsx:9](frontend/pages/sitemap.xml.tsx:9)
* **Impact:** For a rental marketplace, listing pages are *the* organic asset - "room for rent Carlton" is the query that matters. Today they have no title, no description, no canonical, no Open Graph, no JSON-LD in the initial response, and they are not submitted for crawling. Sharing a listing on WhatsApp - the dominant channel for this audience - produces an unfurled grey box.
* **Fix:** Convert `listing/[id]` to `getServerSideProps` (or ISR). The `SEOHead` component already accepts a `listing` prop and emits `Accommodation` JSON-LD - it is just never reached. Add approved listing URLs to the sitemap.
* **Complexity:** Medium.

### 10. All eight "Features" links in the primary navigation are dead

* **Problem:** `navData.ts` points the Features mega-menu at `/features#ai-matching`, `#verified-hosts`, `#instant-booking`, `#suburb-reports`, `#smart-filters`, `#superhost`, `#support`, `#mentor-network`. `pages/features.tsx` contains exactly one `id`, and it is `id="more"`.
* **Severity:** 🟠 **P1 - High**
* **Location:** [lib/navData.ts:33-91](frontend/lib/navData.ts:33), [pages/features.tsx](frontend/pages/features.tsx)
* **Impact:** The most-used menu in the site. Eight items that look like deep links all dump the visitor at the top of the same page with nothing highlighted. It reads as broken on first contact.
* **Fix:** Add the eight `id` attributes to the matching sections in `features.tsx`, or flatten the menu to a single "Features" link.
* **Complexity:** Small.

---

## 3. Bugs

| Priority | Bug | Location | Impact | Recommended Fix | Complexity |
|---|---|---|---|---|---|
| 🔴 P0 | Seeker can self-approve a booking to `PAID` without paying | `024_bookings_system.sql:88` | Free "confirmed" bookings; owner receives a confirmation email for a payment that never happened | Revoke `UPDATE` on `bookings` from `authenticated`; route through `/bookings/{id}/respond` | Small |
| 🔴 P0 | Fake reviews injectable client-side | `021_reviews_system.sql:52` | Review bombing / self-rating; the whole trust signal is worthless | Revoke `INSERT` on `reviews` from `authenticated` | Small |
| 🔴 P0 | Hard delete cascades to paid bookings + all messages | `routes_listings.py:690` | Irrecoverable loss of financial and dispute records | Soft delete + `ON DELETE RESTRICT` | Small |
| 🔴 P0 | No password reset exists; help centre documents one | `pages/signin/index.tsx:156`, `lib/helpData.ts:413` | Permanent lockout; guaranteed support load | Build reset flow, or relabel + fix docs | Small |
| 🔴 P0 | Renter charged the owner's $99 fee | `routes_bookings.py:40-72` | Contradicts published pricing at the payment step; owner revenue never collected | Split checkout sessions | Medium |
| 🟠 P1 | **Unapproved and rejected listings are publicly viewable by direct URL** - `GET /listings/{id}` never filters `moderation_status` | `routes_listings.py:404-413` | Moderation only hides listings from search. A rejected scam listing stays live, linkable and bookable | Filter to `approved`, or `approved` + owner-is-viewer | Small |
| 🟠 P1 | `create_booking` never checks `moderation_status`, `available_from`/`available_to` | `routes_bookings.py:83-160` | A pending or rejected listing can be booked and charged | Add the checks | Small |
| 🟠 P1 | **No double-booking guard** - no overlap check on `bookings` | `routes_bookings.py:145` | Two renters can pay for the same room on the same dates | Add an overlap query before insert; ideally a `tstzrange` exclusion constraint | Medium |
| 🟠 P1 | ~296 malformed Tailwind classes across 99 files (`dark:bg-[var(--color-accent-soft)]0/10` - stray `0` after `]`) | 99 files; worst: `contact.tsx` (9), `cookie-policy.tsx` (5), `support-disputes.tsx` (3) | Invalid class names emit no CSS. ~250 dark-mode surfaces and ~25 light-mode backgrounds silently render unstyled. Includes the **step-indicator progress line in `ListingForm.tsx:320`** | Find/replace: `)]0` → `)]` and re-derive the intended opacity | Small |
| 🟠 P1 | 8 dead anchor links in primary nav | `lib/navData.ts:33-91` | Core navigation appears broken | Add `id`s to `features.tsx` | Small |
| 🟠 P1 | Two live owner dashboards, reachable by different entry points | `pages/owner/dashboard.tsx` (454 ln) vs `pages/dashboard/owner.tsx` (187 ln); `owner/setup.tsx:23,45` sends users to the second, all marketing CTAs to the first | Owners see a different dashboard depending on how they arrived | Keep `/owner/dashboard`; redirect the other | Medium |
| 🟠 P1 | Two live seeker-profile pages and two owner-profile pages | `seeker/profile.tsx` (607) vs `dashboard/seeker-profile.tsx` (480); `owner/profile.tsx` (566) vs `dashboard/owner-profile.tsx` (135) | ~1,800 lines of divergent duplicate UI; edits land in one and not the other | Consolidate to one each | Medium |
| 🟠 P1 | Listing "address" is only `"Suburb, Postcode"` - a street address is never collected | `pages/owner/listings/new.tsx:37` | Owners cannot distinguish two listings in one suburb; JSON-LD `name` reads "Carlton, 3053"; address search is meaningless | Collect a real address; store it privately and display suburb only | Medium |
| 🟠 P1 | Photo upload silently discards invalid files | `hooks/usePhotoUpload.ts:74-76` | Drop a 12MB photo or a HEIC (iPhone default) and nothing happens, with no message | Collect rejections and surface "3 photos skipped: over 10MB" | Small |
| 🟠 P1 | `getListingDetail` returns `null` for both 404 and network failure | `lib/api.ts:1604-1616`, `pages/listing/[id].tsx:120` | Backend outage shows "Listing not found" - the user believes the room is gone | Distinguish 404 from transport failure; add a retry state | Small |
| 🟡 P2 | "Remember this device" checkbox is `defaultChecked` with no state and no handler | `pages/signin/index.tsx:153` | Dead control on the sign-in page | Wire it or remove it | Small |
| 🟡 P2 | Homepage "Move-in / Any time" is a static `<div>` styled to look like a field | `pages/index.tsx:503-506` | Looks interactive, is not; it sits inside the primary hero search | Make it a date picker or drop the column | Small |
| 🟡 P2 | Homepage hero "City" is a free-text input with no autocomplete or validation | `pages/index.tsx:497-500` | Typo → zero results with no suggestion. `StationAutocomplete` already exists and is unused here | Reuse the autocomplete | Small |
| 🟡 P2 | `moderation_status = 'deleted'` is read but violates the CHECK constraint | `routes_listings.py:556` vs `029_admin_moderation.sql:7` | The soft-delete read path can never match anything | Add `'deleted'` to the CHECK | Small |
| 🟡 P2 | Four client-side redirect stubs render a blank page then `router.replace` | `seeker/room/[id].tsx`, `account/messages.tsx`, `seeker/dashboard.tsx`, `seeker/saved.tsx` | Soft-404s for crawlers; a flash of blank for users. The other dedup'd routes correctly use `next.config.ts` redirects | Move all four into `next.config.ts` `redirects()` | Small |
| 🟡 P2 | `uploadAll` reorders photos after a partial failure | `hooks/usePhotoUpload.ts:206-215` | Retrying a failed photo can move the hero image | Return URLs in `photos` array order | Small |
| 🟡 P2 | Webhook has no idempotency key on `stripe_session_id` | `routes_deals.py:284-344`, `006:44` | A duplicate Stripe delivery re-sends confirmation emails and double-inserts `payment_events` | Unique index on `payment_events.stripe_session_id`; check-then-act | Small |
| 🟡 P2 | `delete_listing` accepts client-asserted `{"oauth_confirmed": true}` and skips confirmation | `routes_listings.py:669-670` | The "requires password" control is theatre for anyone holding a token | Verify a recent re-auth server-side, or drop the pretence | Small |
| 🟢 P3 | `theme-color` is `#0d9488` - a colour from a retired palette | `components/SEOHead.tsx:88` | Mobile browser chrome does not match the brand | Set to `--color-primary` `#1d6475` | Small |
| 🟢 P3 | Map marker hardcoded `#f43f5e` (rose-500), off-palette | `components/listings/KeyDetails.tsx:128` | Visual inconsistency on the listing map | Use `var(--color-coral-500)` | Small |
| 🟢 P3 | `next.config 2.ts`, `components/listings/ListingHero 2.tsx` on disk | repo root, components | Finder duplicates; gitignored but confusing locally | Delete | Small |

---

## 4. UI/UX Problems

| Priority | Problem | Page | Why It Is Bad | Recommendation |
|---|---|---|---|---|
| 🟠 P1 | Hero search has three controls, one of which is dead and one of which is a bare text input | Homepage | The single most important interaction on the site is half-broken. A visitor's first act is typing a city with no autocomplete, then clicking a "Move-in" field that does nothing | Suburb autocomplete + a real date picker, or reduce to one field: "Where do you want to live?" |
| 🟠 P1 | The page makes six promises before showing a single room | Homepage | Hero chips, trust bar, six "offerings", a marquee, a comparison table, four FAQs - all before listings. With one listing in the database, the promise-to-proof ratio is extreme | Move featured listings above the "everything you get" grid. Trust is better demonstrated than asserted |
| 🟠 P1 | Fabricated testimonials with named people and cities | Homepage `index.tsx:444` | Fake endorsements, one of which vouches for a feature that does not exist | Remove until you have real, consented quotes. An empty section is more credible than a fake one |
| 🟠 P1 | No `moderation_status` badge for the owner on their own listing detail view | `listing/[id].tsx` | An owner whose listing is pending or rejected sees a page that looks live. `ModerationStatusBanner.tsx` exists but is not used here | Render the banner when `isOwner` |
| 🟠 P1 | Listing creation is 6 steps with no draft persistence | `ListingForm.tsx:79` | Refresh, tab close, or a phone call mid-flow loses everything including uploaded photos. This is the highest-value conversion in the product | Persist form state to `localStorage` on each step change; restore with "Continue your listing" |
| 🟠 P1 | No preview step before publish | `ListingForm.tsx` | Owners publish blind, then discover cropping and copy problems on the live page | Add step 7: "This is how renters will see it" |
| 🟡 P2 | Five different property-card implementations | `index.tsx:69` (HomeListingCard), `ListingCard.tsx`, `OwnerMarquee.tsx`, `wishlist/WishlistCard.tsx`, inline in `seeker/search.tsx` | Card height, badge placement, price formatting and hover behaviour drift between surfaces | Consolidate to one `<ListingCard variant="grid" \| "compact" \| "marquee">` |
| 🟡 P2 | Two `ReviewCard`s and two generic `Card` primitives | `listings/ReviewsSection.tsx:34` + `reviews/ReviewCard.tsx`; `ui/GlassCard.tsx` + `ui/primitives/Card.tsx` | Same story, smaller stakes | Consolidate |
| 🟡 P2 | Three overlapping verification concepts on `profiles`: `verified`, `is_verified`, `identity_verified` | schema + 196 frontend references | Nobody can tell which badge means what. Different components read different columns | Pick one. Derive display state from the `owner_verification` table |
| 🟡 P2 | Paying $19 sets `profiles.verified = true` | `routes_deals.py:363` | "Verified" is purchasable, while the homepage says it means "government ID plus proof they control the property" | Rename this field to `payment_tier` or similar; reserve "verified" for the real ID check |
| 🟡 P2 | Dead nav item: "Developer API" links to a "coming soon" page | `navData.ts:133` | Advertising a non-product in the primary nav. (The page itself is admirably honest) | Remove from nav until the API ships |
| 🟡 P2 | Two rules pages with overlapping content | `rules.tsx` (134 ln), `rules-community-guidelines.tsx` (171 ln) | Users cannot tell which is authoritative | Merge; redirect one |
| 🟡 P2 | Search result count reads `12+ rooms found` from the loaded page size | `seeker/search.tsx:834` | Not a real total; "12+" on a 12-result set is misleading | Return a true count from the backend, or say "Showing 12" |
| 🟢 P3 | 20-second inactivity lockout with a flashing red/blue full-screen overlay | `AdminGate.tsx:5,150` | 20 seconds is unusable for any real moderation work, and the flashing overlay is an accessibility hazard (photosensitivity) | Raise to 15 minutes; remove the flashing animation |
| 🟢 P3 | `og-default.png` is the OG image for every page including listings | `SEOHead.tsx:24` | Every share looks identical | Generate per-listing OG images once listings are server-rendered |

---

## 5. Mobile Problems

The codebase takes mobile seriously - responsive prefixes are used consistently, the navbar has a real `lg:hidden` mobile tree, and the listing page has a sticky mobile CTA driven by an `IntersectionObserver`. The issues below are specific risks read from the code. Items marked **NEEDS VERIFICATION** require rendering at width.

* 🟠 **P1 - Homepage hero grid.** `grid lg:grid-cols-[1.05fr_0.95fr]` with an `h1` at `text-[44px]` at the smallest breakpoint. At 320px, 44px display type in Fraunces with `[overflow-wrap:anywhere]` will break mid-word on "Australia". Consider `clamp()` down to ~34px. ([index.tsx:487](frontend/pages/index.tsx:487))
* 🟠 **P1 - Search page.** 1,098 lines containing a filter sidebar, a calendar, a results grid and a dynamically-imported MapLibre map. The map is the heaviest thing on the site and mobile users on a migrant budget are frequently on metered data. Confirm the map is not mounted at all below `lg`. **NEEDS VERIFICATION**
* 🟠 **P1 - `ListingForm` step indicator.** Six steps rendered as circles plus connector lines in a single row. At 320px that is ~6 circles + 5 connectors; the connector uses one of the malformed classes so it is invisible, which may be masking an overflow. ([ListingForm.tsx:296-322](frontend/components/ListingForm.tsx:296))
* 🟡 **P2 - Booking form date inputs.** `grid grid-cols-2 gap-3` with an icon absolutely positioned inside each. Two native date inputs side by side at 320px is roughly 140px each, which truncates the placeholder on iOS. Stack below `sm`. ([RequestToBookForm.tsx:113](frontend/components/bookings/RequestToBookForm.tsx:113))
* 🟡 **P2 - Modals.** 20 components use `fixed inset-0`. Only 2 declare `aria-modal`, and I found no scroll-lock on `body`. On iOS Safari a `fixed inset-0` overlay without scroll-lock lets the page scroll behind the modal.
* 🟡 **P2 - `ScrollMarquee`** uses `text-[clamp(2rem,5vw,4rem)]` on a `w-max` flex row translated by scroll progress. It is `overflow-hidden` on the section so it should not cause horizontal page scroll - but confirm on iOS, where `overflow-hidden` on a transformed child is historically unreliable. **NEEDS VERIFICATION** ([index.tsx:175](frontend/pages/index.tsx:175))
* 🟡 **P2 - Admin pages** are laid out for desktop tables with no mobile treatment. Acceptable for an internal tool, but moderation-from-phone will not work.
* 🟢 **P3 - Touch targets.** The homepage card save button is `w-[32px] h-[32px]`; the filter-chip remove button is a `w-3 h-3` icon in a small button. Both are below the 44×44px WCAG 2.5.5 target. ([index.tsx:82](frontend/pages/index.tsx:82), [seeker/search.tsx:98](frontend/pages/seeker/search.tsx:98))

---

## 6. Security Problems

Ordered by severity. Items 1-6 are covered in detail in section 2 and summarised here.

**🔴 CRITICAL**

1. **Unauthenticated PII disclosure on `profiles`.** *Risk:* every user's phone, street address, emergency contact and visa type readable with the public anon key; notifiable data breach. *Fix:* drop the two `USING (true)` policies, revoke the `anon`/`authenticated` grants, expose a narrow view. `015:9`, `019:29`
2. **Privilege escalation via `user_metadata`.** *Risk:* any user self-promotes to superadmin through `auth.updateUser`. *Fix:* delete the `user_metadata` branch in `_require_admin`. `routes_admin.py:34`
3. **Privilege escalation via `profiles.role` self-update.** *Risk:* same outcome through RLS. *Fix:* trigger blocking non-service-role `role` changes. `019:38`
4. **Stored XSS → account takeover.** *Risk:* token exfiltration from `localStorage` via `dangerouslySetInnerHTML` on unsanitised message HTML. *Fix:* render plain text. `MessageBubble.tsx:192`
5. **Business-logic bypass via direct PostgREST writes.** *Risk:* free bookings, fake reviews, unmoderated listings, self-granted verification badges. *Fix:* revoke write grants from `authenticated`. `019`, `021`, `024`
6. **Data destruction via cascade.** *Risk:* paid bookings and dispute evidence deleted by an owner action. *Fix:* soft delete + `RESTRICT`. `routes_listings.py:690`

**🟠 HIGH**

7. **CSP is Report-Only.** *Risk:* the header is present and well-constructed, but enforces nothing - so it does not mitigate finding #4. *Fix:* the config comment says "once the console is clean for a week, enforce it." That week has passed; enforce it. `next.config.ts:79`
8. **IDOR on listing detail.** *Risk:* pending/rejected listings readable and bookable by direct URL. *Fix:* filter `moderation_status`. `routes_listings.py:404`
9. **No rate limit on the write paths that matter.** *Risk:* `POST /listings`, `POST /bookings`, `GET /listings/search` are unlimited; 36 of 127 routes carry a limiter. Booking spam and listing spam are free. *Fix:* add `@limiter.limit` to booking creation, listing creation and search.
10. **Rate limiting may not work at all behind Render's proxy.** `slowapi`'s `get_remote_address` reads `request.client.host`. Behind a reverse proxy that is the proxy's IP unless uvicorn is started with `--proxy-headers --forwarded-allow-ips=*`. The `Procfile` sets neither. If so, all users share one bucket. **NEEDS VERIFICATION** - test by hitting `/auth/login` 6 times from two different machines. `Procfile`, `limiter.py`

**🟡 MEDIUM**

11. **`recovery_password_hash` stored on `profiles`.** *Risk:* a credential-equivalent secret sitting in the same table as public profile data, exposed by finding #1. *Fix:* move to a separate table with no `authenticated` grant. `002:41`
12. **Client-asserted delete confirmation.** `{"oauth_confirmed": true}` skips password verification. `routes_listings.py:669`
13. **No webhook idempotency.** Duplicate Stripe deliveries re-send emails and duplicate `payment_events`. `routes_deals.py:284`
14. **`sign_in_with_password` used as a password *check*** inside `delete_listing`, which mints a real session as a side effect and burns an auth rate-limit slot. `routes_listings.py:676`
15. **Broad `Exception` swallowing around notification and email paths** (`except Exception: pass` appears ~15 times in `routes_bookings.py` alone). Correct instinct - do not fail the booking because email failed - but nothing is logged, so silent email failure is undetectable. *Fix:* `logger.exception` in every one.

**🟢 LOW**

16. `.env` contains a live `PINECONE_API_KEY` and a `SUPABASE_SERVICE_ROLE_KEY`. Correctly gitignored and never committed (verified: only `.env.example` is tracked). Pinecone is not in `requirements.txt` and is unused - rotate and delete the key.
17. `frontend/.env.local` holds Mailjet credentials while the app ships `resend`. Dead credentials; remove.
18. `robots.txt` does not disallow `/seeker/` or `/dashboard/`. They redirect to sign-in, so this is crawl-budget waste rather than exposure.

---

## 7. Database Problems

The schema is workable and does **not** need a rewrite. The problems are accumulated policy drift and a `profiles` table that has become a junk drawer.

* 🔴 **RLS policy archaeology.** Migrations 003, 007, 008, 009, 010, 012, 013, 015, 019 and 036 each rewrite the `profiles` policies, and 008 disables RLS entirely "for testing". Because policies are additive, the effective posture is the **union** of everything that survived, not the last file you read. This is exactly how findings #1 and #3 happened. *Fix:* write one migration that enumerates and drops every policy on `profiles` by name, then creates the intended four. Then add a CI check that dumps `pg_policies` and diffs it against a checked-in expected file.
* 🔴 **`ON DELETE CASCADE` on financial and evidentiary records.** `bookings.listing_id` and `messages.listing_id`. See finding #7.
* 🟠 **`profiles` has ~60 columns** spanning identity, preferences, seeker search criteria, owner host stats, social links, notification settings, verification state and a password hash. *Fix:* split into `profiles` (identity), `seeker_preferences`, `owner_stats`. Not urgent, but every new feature makes it worse.
* 🟠 **Three verification booleans** (`verified`, `is_verified`, `identity_verified`) plus a separate `owner_verification` table. No single source of truth.
* 🟠 **Denormalised aggregates with no maintaining trigger:** `reviews_count`, `average_rating`, `months_hosting`, `response_rate`, `rooms_owned`, `properties_owned`. `response_time` even defaults to the string `'within 24h'` - a claim shown to renters that nothing computes. The `listing_review_stats` / `user_review_stats` views already do this correctly. *Fix:* delete the columns, read the views.
* 🟠 **`moderation_status` CHECK omits `'deleted'`** while `routes_listings.py:556` queries for it.
* 🟡 **No overlap constraint on `bookings`.** *Fix:* `EXCLUDE USING gist (listing_id WITH =, daterange(check_in_date, check_out_date) WITH &&) WHERE (status IN ('OWNER_ACCEPTED','PAID'))`.
* 🟡 **`reviews.listing_id` has no foreign key.** Reviews orphan when a listing goes.
* 🟡 **Duplicate migration numbers:** `003`, `010`, `012`, `013`, `024` each exist twice with different content. Ordering is filename-alphabetical and therefore ambiguous. *Fix:* renumber; adopt a timestamp convention.
* 🟡 **`profiles.move_in_date` is `date` in migration 001 and `TEXT` in migration 009.** Whichever ran last wins, and nothing in the code knows which. **NEEDS VERIFICATION** against the live schema.
* 🟡 **`bookings.owner_fee` / `seeker_fee` columns are never written** - `booking_row` omits them, so every row carries the defaults. If the fee ever changes, historical bookings silently misreport.
* 🟢 **`suburbs` has no provenance columns.** `safety_score`, `vacancy_rate`, `migrant_pct` and the demographic splits are published as authoritative on 16 SEO pages with no source and no as-at date. Add `data_source` and `data_as_at`, cite ABS/state data on-page, or reframe the numbers as estimates. This is the same "no invented metrics" rule that `design.md` sets out.
* 🟢 **Missing indexes** on `listings(suburb)`, `listings(city)`, `listings(weekly_price)` - the three columns every search filters on. `moderation_status` is indexed; these are not.

---

## 8. Code Quality Problems

Credit where it is due. Across ~33,000 lines of frontend code: **1 `console.log`, 1 TODO comment, 0 commented-out code blocks, 67 `any` annotations.** That is better hygiene than most funded startups. `apiBase.ts` in particular is thoughtful defensive engineering, and the comments throughout explain *why* rather than *what*. The problems below are structural, not sloppiness.

* 🟠 **`lib/api.ts` is 62,731 bytes with 86 exported functions** covering listings, bookings, profiles, owners, seekers, mentors, reviews, referrals, support and admin. Every page importing one function pulls the module. *Fix:* split into `lib/api/listings.ts`, `lib/api/bookings.ts`, etc. Mechanical, low risk.
* 🟠 **~1,900 lines of duplicated pages** across the four duplicate pairs (owner dashboard, owner profile, seeker profile, rules). Bug fixes land in one copy.
* 🟠 **`pages/seeker/search.tsx` is 1,098 lines** holding filter state, calendar rendering, map integration, result mapping, pagination and URL sync. *Fix:* extract `useSearchFilters`, `<SearchCalendar>`, `<ResultsGrid>`.
* 🟠 **`components/ListingForm.tsx` is 1,019 lines** with all six steps inline. *Fix:* one component per step, driven by a step array.
* 🟡 **12 unreferenced components:** `MicrosoftSignInButton`, `DealForm`, `SearchFilters`, `ProfileCard`, `OwnerMarquee`, `TrueCostCalculator`, `OwnerBookingsTable`, `CodeBlock`, `AddressForm`, `SeekerView`, `PricingHero`, `PricingTables`. Note `SearchFilters.tsx` and `AddressForm.tsx` are dead while the search page and listing form each reimplement that logic inline.
* 🟡 **~129 orphaned gradient classes:** `bg-[var(--color-x)] from-... to-...` without `bg-gradient-to-*`. The `from-`/`to-` do nothing - residue from a gradient-based design that was correctly flattened.
* 🟡 **~572 raw Tailwind palette utilities** (`text-slate-500`, `bg-red-50`, `text-teal-600`) bypassing the token system. **Important caveat: ~520 of these are inside `/admin` and `components/admin/`**, which is an internal tool and a defensible scope decision. Only about 20 leak into user-facing components (`ui/Toast.tsx`, `support/TicketList.tsx`, `profile/ListingsGrid.tsx`). Fix those 20; leave admin alone.
* 🟡 **`useDashboard` and `useDashboardData` coexist** (7,030 and 12,492 bytes) with overlapping responsibility. Same for `useProfile` / `useProfileData` / `useUserProfile`, and `useNotifications` / `useNotificationCenter`.
* 🟡 **`hooks/usePalette.ts` still exists** although `design.md` states the swappable-palette system was removed. Dead hook implementing a retired concept.
* 🟢 **`README.md` is fiction.** It advertises "Semantic search powered by Pinecone", "Claude AI integration" and "AI-powered document processing". None exist; Pinecone and Anthropic are absent from `requirements.txt`. `matching_engine.py` is explicit and honest that it is rules-based. The README is the first thing a new contributor or investor reads.
* 🟢 **Brand name is inconsistent:** "MigRent" in `design.md`, the homepage title and the wordmark; "MigRent AI" in the 404 title, `about.tsx`, the FastAPI app title and the blog author role. Pick one.

---

## 9. Performance Problems

* 🟠 **P1 - Zero use of `next/image` across 25 raw `<img>` tags.** `next.config.ts` configures AVIF/WebP, a one-week cache TTL and the correct `remotePatterns` - and nothing uses it. For a photo-led marketplace this is the largest single performance lever available. *Fix:* replace `<img>` with `<Image>` in `ListingCard`, `ListingHero`, `WishlistCard`, `OwnerCard`, `MessageBubble`, `AvatarWithVerification`.
* 🟠 **P1 - 95 of 98 pages are client-rendered.** Every page ships an empty shell, then JS, then a fetch, then content. That is three round trips before first meaningful paint, on connections that are frequently poor for the target audience. It also causes the SEO problem in finding #9.
* 🟠 **P1 - Search over-fetches by 10×.** For best-match sort, `search_listings` pulls `min(limit * 10, 200)` rows, scores them in Python, then slices to 20. With 200 rows × ~60 columns that is a large payload for a 20-row page. *Fix:* score in SQL, or narrow the `select("*")` to the columns the card needs.
* 🟠 **P1 - N+1 queries in `GET /bookings/me`.** For each booking, two additional queries (listing, then profile). 20 bookings = 41 round trips to Supabase. *Fix:* one `in_()` query per related table.
* 🟡 **P2 - `recharts` is statically imported by `components/suburb/DemographicsCharts.tsx`**, which renders on the suburb pages - the only server-rendered, SEO-critical pages you have. Recharts is one of the heaviest deps in the tree. *Fix:* `next/dynamic` with `ssr: false`.
* 🟡 **P2 - `firebase` (^12.11.0) is a top-level dependency** for push notifications. `lib/firebase.ts` and `lib/messaging.ts` import it. Confirm it is code-split and not in the main bundle. **NEEDS VERIFICATION**
* 🟡 **P2 - `Lenis` smooth scroll runs site-wide** via `components/SmoothScroll.tsx` in `Layout`. Momentum scroll hijacking costs main-thread time on every page and is a known accessibility irritant. It suits marketing pages; it does not suit the dashboard or the search results list.
* 🟡 **P2 - `canvas-confetti` fires seven times on `/payment-success`.** Seven cannon calls on a page whose job is to confirm a payment. One is plenty.
* 🟡 **P2 - `AnimatePresence` page transitions in `_app.tsx`** add 150ms to every navigation and force a full remount of the incoming page.
* 🟢 **P3 - No blur placeholders on listing images** → layout shift as photos load into `photo-placeholder` divs.
* 🟢 **P3 - Fonts load from `fonts.googleapis.com`** rather than `next/font`, which would self-host and eliminate the render-blocking third-party request. Three families × multiple weights.

---

## 10. Accessibility Problems

* 🔴 **P0 - `AdminGate` lockout screen flashes red-to-blue every 0.5s indefinitely** (`animation: flash-bg 0.5s infinite`). This is a WCAG 2.3.1 failure and a genuine seizure risk. Remove it. ([AdminGate.tsx:150-157](frontend/components/AdminGate.tsx:150))
* 🟠 **P1 - `<html lang>` never changes.** `_document.tsx` hardcodes `lang="en" dir="ltr"`; `useLanguage.ts:16` mutates `documentElement.dir` client-side only. So screen readers announce Arabic, Hindi and Chinese content with English pronunciation rules, and the server-rendered `dir` is wrong for Arabic. *Fix:* set both from the detected language; for real correctness use Next.js i18n routing (see section 11).
* 🟠 **P1 - Modal accessibility is largely absent.** 20 components use `fixed inset-0`; 2 declare `aria-modal`. No focus trap, no `role="dialog"`, no restore-focus-on-close, no `Escape` handler that I could find, no `body` scroll lock. Keyboard and screen-reader users cannot escape a modal. *Fix:* one `<Modal>` primitive that does all five things; migrate the 20 call sites.
* 🟠 **P1 - Icon-only buttons mostly lack labels.** 24 `aria-label`s against 495 `onClick` handlers. Some are done well - the homepage save button has `aria-label="Save listing"` and the budget slider has a descriptive label - but the filter-chip remove button, the gallery arrows, the message-attachment controls and the step-indicator buttons have none. *Fix:* sweep every `<button>` whose only child is an icon.
* 🟡 **P2 - Only 9 `role=` attributes site-wide.** Search results are a `div` grid, not a list; the filter panel is not a `region`; there are no landmarks beyond whatever `Layout` provides.
* 🟡 **P2 - Form errors are visual only.** `ListingForm.validateStep` returns a string array rendered as text. No `aria-invalid`, no `aria-describedby` linking error to input, no focus move to the first error. A screen-reader user is told "step did not advance" and nothing more.
* 🟡 **P2 - Heading hierarchy.** The homepage jumps `h1` → `h2` → `h3` correctly, but several pages use `font-serif text-[34px]` on a `div` for what is visually a heading (e.g. `listing/[id].tsx:126` uses `h1` correctly, but the "Listing not found" state is the only `h1` on a page that otherwise has none while loading).
* 🟡 **P2 - Touch targets below 44px** (see section 5).
* 🟢 **P3 - Contrast.** This has clearly been worked on - `design.md` records `--color-ink-3` being darkened specifically for WCAG AA, and the dark palette claims a zero-failure audit. The ~296 malformed classes are a wildcard here: any element that expected a tinted dark background and got a transparent one may now fail contrast. Re-audit after fixing those. **NEEDS VERIFICATION**

---

## 11. SEO Problems

* 🔴 **P0 - Listing pages: no server-rendered metadata, not in the sitemap.** See finding #9. This is the whole ballgame for a rental marketplace.
* 🟠 **P1 - 8 languages, zero indexable multilingual pages.** `SUPPORTED_LANGUAGES` lists 8 locales, `public/locales/*` holds ~645 translated keys each, and the nav has a switcher. But language is a `localStorage` toggle with no URL, no `hreflang`, no locale routing. Google will never see a single non-English page. *Fix:* Next.js i18n routing (`/es/...`) with `hreflang` alternates. The translations already exist - this is plumbing, and it is the highest-value SEO work available given the audience.
* 🟠 **P1 - Translation coverage is a thin shell.** Only 8 of 98 pages plus 3 components call `useTranslation`: `about`, `faq`, `careers`, `press`, `guides`, `resources`, `signup`, `signin`, plus nav/footer/switcher. Search, listing detail, booking, all dashboards and the entire owner flow are English-only. A Spanish-speaking user switches language, sees a translated homepage, then hits an English search page. For a *migrant* product, that is the promise breaking at the exact moment it matters.
* 🟠 **P1 - Help articles and blog posts are client-rendered.** `help/[slug]`, `help/category/[slug]`, `blog/[slug]` and `guides/[id]` all fetch client-side, yet blog and guide URLs *are* in the sitemap. You are submitting empty shells for crawling. *Fix:* `getStaticProps` - the content is static data in `lib/helpData.ts` and `data/blogPosts.ts`, so this is straightforward.
* 🟡 **P2 - Fabricated author bylines on blog posts.** "Priya Sharma, Housing Expert" and "David Chen, Property Analyst" are invented personas on content in your sitemap. Under Google's E-E-A-T guidance, fake authorship on YMYL-adjacent housing advice is an active liability, quite apart from the honesty problem. *Fix:* attribute to "MigRent Team" (already used for some posts) or to a real named person.
* 🟡 **P2 - `SITE_URL` is `https://migrent.vercel.app`.** Correct given `migrent.com.au` has no DNS - but every canonical, OG URL and sitemap entry points at the Vercel domain. The moment the real domain goes live, all accrued authority sits on the wrong host. *Fix:* set up DNS first, then flip `lib/site.ts` and `robots.txt` in one commit.
* 🟡 **P2 - No `BreadcrumbList` or `Organization` structured data.** `Breadcrumb.tsx` renders visually but emits no JSON-LD. Suburb pages do it properly (`FAQPage` + place schema) - extend that pattern.
* 🟡 **P2 - Suburb statistics with no cited source** on 16 pages that are explicitly the SEO strategy. Reviewers and users both discount uncited numbers.
* 🟢 **P3 - Thin `/features` page** carrying 8 inbound nav links to anchors that do not exist.

---

## 12. Unnecessary Features / Components

| Item | Decision | Reason |
|---|---|---|
| Bond escrow messaging (~25 sites) | **REMOVE** | Advertises a feature with zero implementation; likely unlawful in AU even if built. Blocker. |
| Fabricated testimonials (`Aisha`, `Lucas`, `Mei`) | **REMOVE** | Fake endorsements, one vouching for the non-existent escrow. |
| Fabricated blog bylines (`Priya Sharma`, `David Chen`) | **SIMPLIFY** | Reattribute to "MigRent Team" or a real person. Keep the articles - they are decent. |
| `pages/dashboard/owner.tsx` | **MERGE** into `/owner/dashboard` | Two live owner dashboards. |
| `pages/dashboard/owner-profile.tsx` | **MERGE** into `/owner/profile` | Duplicate. |
| `pages/dashboard/seeker-profile.tsx` | **MERGE** into `/seeker/profile` | 480 vs 607 lines of divergent duplicate. |
| `pages/rules.tsx` | **MERGE** into `/rules-community-guidelines` | Overlapping content, ambiguous authority. |
| 12 unreferenced components | **REMOVE** | Dead code. Note `SearchFilters` and `AddressForm` are dead while their logic is reimplemented inline. |
| `hooks/usePalette.ts` | **REMOVE** | Implements the palette-swap system `design.md` says was removed. |
| `data/apiDocsData.ts` | **REMOVE** | The fictional API docs the page correctly stopped rendering. Git history preserves it. |
| "Developer API" nav item | **REMOVE** | Primary nav pointing at a "coming soon" page. |
| `MicrosoftSignInButton` | **REMOVE** | Unused. Google + email + magic link is enough auth for launch. |
| 7 confetti cannons on `/payment-success` | **SIMPLIFY** to 1 | Excess on a transactional confirmation page. |
| `AdminGate` flashing lockout | **REMOVE** | Seizure risk; provides no security (client-side only). |
| `AdminGate` 20-second timeout | **SIMPLIFY** to 15 min | Unusable for real moderation. |
| Lenis smooth scroll on app pages | **SIMPLIFY** | Keep on marketing pages per `design.md`; disable on dashboard/search. |
| `profiles.response_rate` / `response_time` / `months_hosting` | **REMOVE** | Displayed to renters, computed by nothing. `response_time` literally defaults to the string `'within 24h'`. |
| `profiles.most_useless_skill` | **KEEP** | It is charming, it is cheap, and it differentiates from Domain. Genuinely on-brand. |
| Mentor network | **KEEP** | Real backend, real empty states, and it is the clearest non-copyable differentiator you have. |
| Suburb guides | **KEEP** | The best-built pages in the codebase. Add sources. |
| ROI calculator | **KEEP** | Genuine owner-acquisition tool. |
| Visa matching | **KEEP, but SIMPLIFY** | Strong differentiator. Currently only a scoring bonus; make it visible in the UI or it is invisible work. |
| Spam detection (`spam_detection.py`, 19KB) | **KEEP** | Well-built and necessary for a marketplace. |
| 8-language i18n | **KEEP and FINISH** | Half-shipped is worse than either alternative. Either route it properly and translate the core flows, or reduce to English + 2 languages done completely. |

---

## 13. Missing Features

### Must Have Before Launch

1. **Password reset** - or an honest magic-link-only story with corrected help articles.
2. **Double-booking prevention** - two people can pay for the same room on the same dates.
3. **Owner-visible listing status** - an owner cannot currently tell from the listing page whether their listing is approved, pending or rejected.
4. **Real address capture** - you cannot run a rental marketplace where the address is `"Suburb, Postcode"`.
5. **Draft persistence in the listing form** - six steps with no save is an abandonment machine.
6. **Working bond guidance** - replacing the escrow claim. Point owners and renters at the correct state bond authority. This is a day of content work and it is genuinely useful.
7. **A "report this listing" path from the listing page** - `ReportModal.tsx` and `routes_reports.py` both exist; confirm the entry point is actually rendered on `listing/[id]`. **NEEDS VERIFICATION**
8. **Email deliverability** - `FROM_EMAIL` is a Gmail address per the July launch scan. Gmail-from addresses fail DMARC alignment and land in spam. You need a verified sending domain before a single transactional email goes out.

### Should Add After Launch

9. **Saved searches with email alerts.** The highest-retention feature in every rental marketplace, and it directly fits an urgent audience: "tell me when a room under $300 appears in Carlton."
10. **Owner response-time tracking** (computed, not the hardcoded string) - it is the single most useful trust signal a renter has.
11. **Listing expiry / "still available?" nudges.** Stale listings are what kill marketplace credibility. A 30-day prompt costs little.
12. **Basic owner analytics** - views, saves, enquiries per listing. Owners need a reason to return.
13. **In-app enquiry templates** for renters with no rental history - "here is what to say to a host" is exactly the gap Migrent exists to fill.

### Nice to Have Later

14. Map-based search as a first-class view (the map exists; it is secondary).
15. Comparison view for saved listings.
16. Move-in checklist tied to visa type.
17. A real developer API (only if someone actually asks).

**Deliberately not recommended:** identity verification tiers beyond what exists, a rating algorithm, referral gamification, subscription plans, a mobile app, live chat. All are Airbnb features that solve Airbnb-scale problems. With one listing in the database, none of them address your actual constraint.

---

## 14. Page-by-Page Review

### Homepage - `pages/index.tsx` (846 lines)

**Purpose:** Explain what Migrent is to someone who has just landed in Australia, and get them into search.

**What works:** The value proposition is genuinely clear and well-differentiated - "verified rooms, no rental history needed" answers the real fear. The visual system is beautiful: the mood-field hero, Fraunces display type, the scroll marquee and the sideways-scroll showcase read as designed, not generated. Featured listings are fetched from the real API with a proper loading state and a graceful empty path. The "who it's for" section (new migrants / students / working holiday / new families) is well observed.

**What is wrong:** The escrow claim and the three fabricated testimonials. The hero search has a dead "Move-in" field and an unvalidated free-text city input. Six sections of promises arrive before a single room. The card save button is a no-op (`onClick={(e) => e.preventDefault()}`).

**What should change:** Fix the search widget first - it is the primary action. Move featured listings above the offerings grid. Replace the assertion-heavy trust sections with one honest one.

**What should be removed:** Testimonials, escrow chips, one of the two "everything you get" style sections.

**What is missing:** Any indication of inventory. With one listing, a "Rooms in Sydney · Melbourne · Brisbane" section with real counts would be more honest and more useful than a marquee.

**Score: 6.5/10** - the best-looking page in the codebase, telling a story that is partly untrue.

---

### Search - `pages/seeker/search.tsx` (1,098 lines)

**Purpose:** Find a room.

**What works:** A genuinely strong filter set, well chosen for the audience rather than copied: near-station with walk minutes, gender preference, couples OK, pets, bills included, no-rental-history-friendly, furnished, instant book. Filter chips with individual removal. URL-synced state. Best-match sorting with honest, data-backed match reasons from `matching_engine.py`. Correctly public to signed-out visitors. Map is dynamically imported with a loading state.

**What is wrong:** One file doing eight jobs. The result count "12+" is not a real total. Over-fetching 10× on the backend. The card is a fifth reimplementation. Filter panel is not a landmark region.

**What should change:** Extract the calendar, filters and results grid. Return a real total count.

**What should be removed:** Nothing - the filter set is well judged. Resist adding more.

**What is missing:** Saved searches with alerts. A "no results, but here are 3 nearby suburbs" recovery instead of a plain empty state.

**Score: 7/10** - the strongest product thinking in the project.

---

### Listing detail - `pages/listing/[id].tsx` (418 lines)

**Purpose:** Answer every question a renter has, then get an enquiry.

**What works:** Good decomposition (`ListingHero`, `KeyDetails`, `OwnerCard`, `ReviewsSection`, `SimilarListings`, `TrueCostBadge`). A thoughtful loading skeleton that mirrors the real layout. Mobile sticky CTA via `IntersectionObserver`. `TrueCostBadge` - showing what the room actually costs with bills - is a genuinely good idea for this audience. Map is lazily imported.

**What is wrong:** No server rendering, so no SEO and no link previews. Pending and rejected listings are publicly viewable here. A backend outage renders "Listing not found". No status banner for the owner. `handleBooking` has `try/finally` with no `catch`.

**What should change:** Server-render it. Filter `moderation_status`. Distinguish 404 from network failure.

**What should be removed:** Nothing. The page is well composed.

**What is missing:** A visible "report this listing" entry point. Distance-to-things beyond the nearest station (university, CBD). Any indication of when the listing was posted or last updated - critical for judging whether a room is still real.

**Score: 6.5/10** - well built, structurally undermined by being client-only.

---

### List a property - `pages/owner/listings/new.tsx` + `components/ListingForm.tsx` (1,201 lines)

**Purpose:** Get a room online.

**What works:** Six sensible steps (Basics → Details → Hosting → Photos → Rules → Safety). Per-step validation that blocks advancing and re-opens the offending step on submit. Photo upload with client-side compression to WebP, parallel batches of 3, retry-once, progress, and correct owner-scoped storage paths. The verification gate is enforced server-side. The Safety step (cameras, weapons, other) is unusual and genuinely responsible.

**What is wrong:** No draft persistence - a refresh loses six steps of work and the uploaded photos. No preview before publish. No real address field. Invalid photos are silently dropped. The step-indicator connector uses a malformed class and is invisible. 1,019 lines in one component.

**Field classification:**
* **Essential and present:** suburb, postcode, weekly price, title, description, photos, property type, place type, bedrooms/beds/bathrooms, bathroom type, furnished, bills included, available from.
* **Useful but optional, correctly optional:** parking, internet + speed, pets + details, air conditioning, laundry, dishwasher, min stay, gender preference, couples OK, who else lives here, quiet hours, neighbourhood vibe, nearest transport, highlights, discounts.
* **Unnecessary:** `total_other_people` (duplicates `who_else_lives_here`), `weekly_discount`/`monthly_discount` (no pricing engine consumes them), `max_guests` (a room is not a hotel).
* **Missing and important:** street address; bond amount as a number rather than free text; whether the room is currently occupied; lease type (fixed vs periodic); inspection availability; **which state's tenancy rules apply** - it determines everything downstream.

**What should change:** Add draft save and a preview step. These two changes will move completion rate more than anything else in this audit.

**Score: 6/10** - well-structured, one refresh away from losing a user.

---

### Owner dashboard - `pages/owner/dashboard.tsx` (454) *and* `pages/dashboard/owner.tsx` (187)

**Purpose:** Manage listings and respond to bookings.

**What works:** The `/owner/dashboard` version has real metrics, a bookings pipeline, an activity timeline, quick actions and an earnings chart, all fed by real hooks.

**What is wrong:** There are two of them, and which one an owner sees depends on whether they arrived from a marketing CTA (`/owner/dashboard`) or from `/owner/setup` (`/dashboard/owner`). Neither surfaces per-listing moderation status prominently. The earnings chart draws on `bookings`, of which there are presumably none.

**What should change:** Delete one. Lead with "what needs your attention" - pending booking requests, listings awaiting approval, unanswered messages - rather than metrics that are all zero.

**What is missing:** Per-listing views/saves/enquiries. A prompt to refresh stale listings.

**Score: 5/10** - halved by the duplication.

---

### Auth - `pages/signin`, `pages/signup`, `pages/magic-link-*` (250-300 lines each)

**What works:** Email/password, Google OAuth, and magic link. hCaptcha on both signin and signup, correctly optional via `HCAPTCHA_SITE_KEY`. Trust chips reassure at the point of commitment. `proxy.ts` does a real server-side session check for `/dashboard`, `/owner`, `/seeker`, `/account` with a `redirect` param.

**What is wrong:** No password reset. "Forgot password?" goes to magic link without saying so. "Remember this device" is a dead checkbox. The trust chips include the escrow claim. `proxy.ts` falls through permissively on a Supabase error (`catch { return res }`) - defensible for availability, but it means an outage disables route protection.

**What is missing:** Password reset. Email verification enforcement before listing (verification exists in `routes_verification_codes.py` - confirm it gates anything). **NEEDS VERIFICATION**

**Score: 5.5/10**

---

### Pricing - `pages/pricing.tsx`

**What works:** Two clear plans. An earnings calculator, comparison table and FAQ - well-judged owner-acquisition content. The "no lock-in, your lease is between you and your host" line is honest and reassuring.

**What is wrong:** "$0 forever - renters never pay a service fee" is contradicted at checkout, where the renter pays $118. Escrow appears twice.

**Score: 4/10** - the clearest, best-designed statement of a promise the code breaks.

---

### Suburb guides - `pages/suburb/[name].tsx` (308 lines)

**What works:** The only properly built pages in the project. `getStaticProps`/`getStaticPaths`, real `Place` and `FAQPage` JSON-LD, live listing counts, related suburbs, transport calculator, demographics. This is what every content page should look like.

**What is wrong:** Statistics with no cited source or as-at date. `recharts` statically imported.

**Score: 8/10** - the high-water mark. Use it as the template.

---

### Admin - `pages/admin/*` (10 pages)

**What works:** Comprehensive coverage - moderation, users, listings, reports, revenue, spam, verification, support, analytics. The moderation workflow with owner emails on approve/reject/changes-requested is well built.

**What is wrong:** `AdminGate` is client-side only and provides no security. The real gate, `_require_admin`, is bypassable two ways. The 20-second timeout and flashing lockout are unusable and unsafe. `adminApi.ts` queries `admin_users_view` directly from the browser.

**Score: 3/10 for security, 7/10 for functionality.**

---

### Legal & content pages (~20 pages)

**What works:** Unusually thorough for a pre-launch product - ToS, privacy, cookies, disclaimer, anti-discrimination, code of conduct, community guidelines, ABN terms, no-agency, safety-verification, safety-reporting, support-disputes. Someone has thought hard about Australian rental compliance. `/no-agency` and `/abn-terms` in particular show real domain understanding.

**What is wrong:** These pages carry the densest concentration of the ~296 malformed classes, so their dark-mode callouts render unstyled. The privacy policy promises a "right to erasure" - confirm `delete_account` actually erases rather than soft-disables. **NEEDS VERIFICATION** Two rules pages.

**Score: 7/10**

---

### Help centre - `pages/help/*` (~1,100 lines + 44KB `helpData.ts`)

**What works:** Substantial, well-organised, correctly made public.

**What is wrong:** Client-rendered, so invisible to search - and a help centre is one of the highest-intent search surfaces you have. It documents a password reset flow that does not exist.

**Score: 5.5/10**

---

## 15. Recommended Design Improvements

**Do not redesign.** `design.md` is a genuinely good, well-reasoned system - "Sand & Ocean", Fraunces + Hanken Grotesk + Space Mono, ocean-teal primary, sand surfaces, warm-espresso dark. The tokens in `globals.css` are complete and coherent. The anti-slop rules are exactly right, and the document is honest about its own accepted deviations. The problem is **execution drift**, not the system.

**Typography** - keep as specified. One correction: the type scale is applied with arbitrary pixel values (`text-[34px]`, `text-[19px]`, `text-[12.5px]`) at hundreds of call sites. Promote the six sizes you actually use into named utilities (`text-display`, `text-h2`, `text-body`, `text-meta`) so the scale is enforceable rather than remembered.

**Spacing** - the 4-point scale is in place. Section padding varies (`py-20 md:py-28`, `py-12 md:py-16 lg:py-20`, `py-14 md:py-20`). Pick two section rhythms - one for marketing, one for app - and name them.

**Colour** - the palette is right. Three fixes: (1) repair the ~296 malformed classes; (2) replace the ~20 raw Tailwind palette utilities in user-facing components; (3) resolve the accepted deviation `design.md` flags - "verified" currently uses `--color-accent` (the general decoration colour) so it reads as no more trustworthy than a link. Add a dedicated `--color-trust` mapped to sea-green `#208073` and apply it to the ~62 verification badge sites. That is the one place the system genuinely needs to grow.

**Cards** - one `<ListingCard>` with three variants replacing five implementations. Fix card height inconsistency by enforcing `line-clamp-2` on titles and `mt-auto` on the meta row (the homepage card does this correctly - copy it).

**Buttons** - `btn-primary` / `btn-secondary` exist and are used. Add `btn-ghost` and `btn-danger` so the ~20 one-off inline button styles have somewhere to go. Enforce a single control height (44px) to fix the touch-target failures at the same time.

**Forms** - `input-field` exists. Add `input-field--error` with `aria-invalid` wired, plus a standard `<FormField label error hint>` wrapper. This solves a design problem and an accessibility problem in one component.

**Navigation** - the mega-navbar is well built. Cut the Features submenu from 8 dead anchors to either 8 working ones or one link. Remove "Developer API".

**Property cards** - show, in this order: photo (4:3, `next/image`, blur placeholder), suburb + postcode, title (2 lines max), price/week, beds/baths, one differentiating badge (verified / instant book / bills included), and posted date. Nothing else. The current cards are close to right; they just vary between surfaces.

**Mobile behaviour** - keep Lenis and the sideways-scroll showcase on marketing pages only, per `design.md`'s own per-page allowances. Disable both on search, listing detail and dashboards.

---

## 16. Recommended Information Architecture

The current tree has ~98 pages with four duplicate pairs, four client-side redirect stubs and two parallel dashboard hierarchies. Proposed:

```
PUBLIC
  /                        Home
  /search                  Search  (rename from /seeker/search - it is public)
  /listing/[id]            Listing detail  (server-rendered)
  /suburbs, /suburb/[name] Suburb guides
  /guides, /guides/[id]    Guides
  /blog, /blog/[slug]      Blog
  /help, /help/[slug]      Help centre
  /pricing  /for-seekers  /for-owners  /features
  /mentors, /mentor/[id], /become-mentor
  /about  /contact  /careers  /press
  /legal/*                 All legal pages under one prefix

ACCOUNT
  /signin  /signup  /magic-link
  /account/settings        Profile, security, notifications, language
  /account/messages

RENTER
  /saved                   Saved listings  (from /seeker/wishlist)
  /applications            Enquiries and bookings  (does not exist yet - needed)

OWNER
  /owner                   Dashboard  (single, from /owner/dashboard)
  /owner/listings          My listings
  /owner/listings/new      Add
  /owner/listings/[id]/edit
  /owner/bookings          Requests and bookings

ADMIN
  /admin/*                 Unchanged
```

**Changes:** collapse `/dashboard/*` into the role trees (it currently duplicates both); move the four client-side redirect stubs into `next.config.ts`; group legal under `/legal/`; rename `/seeker/search` to `/search` since it is public and the `/seeker/` prefix implies a login wall that does not exist.

---

## 17. Recommended User Flows

### Renter flow

Currently the journey is roughly **11-14 interactions** from landing to enquiry, with two dead controls in the hero and a required sign-in before booking.

```
Home
  └─ type suburb in hero (autocomplete)          1 interaction
     └─ Search results                            0 - lands directly
        └─ optionally refine (1-2 filters)        1-2
           └─ Listing detail                      1
              └─ "Message the host" / "Request to book"  1
                 └─ sign in / sign up (Google one-tap)   1-2
                    └─ send                                1
                       └─ Confirmation + "what happens next"
```

**Target: 6-8 interactions.** Three specific savings: (1) make the hero a single suburb field that goes straight to results; (2) allow the enquiry to be *composed* before sign-in and capture the account at send, rather than bouncing to `/signin` on click as `listing/[id].tsx:71` does today; (3) drop the separate budget step - budget is a filter, not a gate.

**Add:** a confirmation screen that says what happens next and by when. Right now `bookingSuccess` sets a boolean; the renter is told nothing about timelines.

### Owner flow

```
/for-owners
  └─ "Start listing"                              1
     └─ sign up                                   1-2
        └─ Verification  (ID + phone + email)     3-5   ← the real wall
           └─ Listing form, 6 steps                6
              └─ Preview                           1     ← add this
                 └─ Publish
                    └─ "In review, usually within X hours"  ← add this
                       └─ Approved → live
```

**The honest problem:** you require full ID verification *before* an owner may create a listing. That is the right call for trust and the wrong call for supply acquisition when you have one listing. **Recommendation: let owners build and save a listing as a draft immediately, and require verification only to publish.** They invest effort first, then complete verification to see it go live. Same trust guarantee, dramatically better conversion.

**Add:** draft save at every step, a preview step, and a clear post-publish expectation ("in review - most listings are approved within 24 hours").

---

## 18. Technical Debt

Not urgent, but it will compound.

* **`lib/api.ts` at 62KB / 86 functions** - split by domain.
* **`pages/seeker/search.tsx` (1,098) and `components/ListingForm.tsx` (1,019)** - extract sub-components.
* **Overlapping hooks:** `useDashboard`/`useDashboardData`, `useProfile`/`useProfileData`/`useUserProfile`, `useNotifications`/`useNotificationCenter`.
* **`profiles` at ~60 columns** - split into identity / seeker-preferences / owner-stats.
* **Duplicate migration numbers** (003, 010, 012, 013, 024) - renumber to timestamps.
* **No tests anywhere.** Zero test files in either tree. Not a launch blocker, but the moment you fix the RLS grants you will want a test that asserts `authenticated` cannot write to `bookings`. Start there - three or four RLS assertion tests are worth more than any amount of component testing.
* **No CI.** No GitHub Actions workflow. A build-and-typecheck on PR would have caught the malformed classes if paired with a lint rule.
* **~129 orphaned gradient classes** and ~572 raw palette utilities (mostly admin).
* **`instrumentation.ts` / Sentry configured but inert** without `SENTRY_DSN`. Turn it on before launch - you will want the errors.
* **README is fiction** - Pinecone, Claude AI, document processing. Rewrite to describe the actual system.
* **`.env` holds an unused live `PINECONE_API_KEY`** and `frontend/.env.local` holds unused Mailjet credentials, while the app uses Resend. Rotate and delete both.

---

## 19. Launch Blockers

Everything that must be fixed before a real person uses Migrent. Nine items. None are large.

1. **Lock down `profiles` RLS.** Unauthenticated read of every user's phone, home address and emergency contact. *(migration 015/019)*
2. **Close both admin escalation paths.** `user_metadata` in `_require_admin`, and `profiles.role` self-update via RLS.
3. **Revoke direct write grants from `authenticated`** on `bookings`, `reviews`, `listings`, `profiles`, `messages`, `referrals`. This single migration also closes the free-booking and fake-review holes.
4. **Remove every bond-escrow claim** and the three fabricated testimonials.
5. **Fix the checkout so renters are not charged the owner's $99 fee** - or rewrite the pricing page to match reality. One or the other, before any money moves.
6. **Fix the stored XSS** in `MessageBubble` and switch the CSP from Report-Only to enforcing.
7. **Stop hard-deleting listings.** Soft delete; change the cascades that destroy paid bookings and message history.
8. **Ship password reset**, or relabel to magic-link-only and correct the help articles.
9. **Fix email deliverability** - a verified sending domain, not a Gmail `FROM_EMAIL`.

**Also required, but configuration rather than code** (carried forward from the July scan): point `migrent.com.au` DNS at Vercel, move Stripe off test keys, and re-verify RLS on the six tables migration 038 addressed.

---

## 20. Improvement Roadmap

### PHASE 1 - Critical fixes  *(~3 days · do not deploy anything else first)*

1. Write one migration that drops every `profiles` policy by name and recreates the intended four; add a `public_profiles` view; revoke `anon`/`authenticated` grants on `profiles`.
2. Add a `BEFORE UPDATE` trigger on `profiles` blocking non-service-role `role` changes.
3. Delete the `user_metadata` branch from `_require_admin`.
4. Revoke `INSERT`/`UPDATE`/`DELETE` on `bookings`, `reviews`, `listings`, `messages`, `referrals`, `profiles` from `authenticated`; fix the frontend call sites that wrote directly.
5. Render `message_text` as plain text in `MessageBubble`; delete the `message_html` path.
6. Switch the CSP to enforcing.
7. Soft-delete listings; change `bookings`/`messages` cascades to `RESTRICT`/`SET NULL`; add `'deleted'` to the CHECK constraint.
8. Filter `moderation_status` in `GET /listings/{id}` and in `create_booking`.
9. Add the booking-overlap check (and the exclusion constraint).
10. Split the Stripe checkout so the owner pays the owner fee.
11. Remove every escrow claim and the fabricated testimonials.
12. Ship password reset (or relabel + fix docs).
13. Rate-limit `POST /listings`, `POST /bookings`, `GET /listings/search`; verify `--proxy-headers` on Render.
14. Verify the email sending domain.

### PHASE 2 - Core UX  *(~4 days)*

15. Draft persistence in `ListingForm` + a preview step.
16. Let owners create drafts before verification; require verification only to publish.
17. Real street-address capture (stored privately, suburb shown publicly).
18. Fix the homepage hero: suburb autocomplete, real date picker or remove, working save button.
19. Add the eight `id`s to `features.tsx`.
20. Consolidate the four duplicate page pairs; move the four redirect stubs into `next.config.ts`.
21. Owner-visible moderation status on listing and dashboard.
22. Distinguish 404 from network failure on listing detail; add a retry.
23. Surface upload rejections instead of silently dropping files.
24. Post-enquiry and post-publish confirmation screens that state what happens next and by when.

### PHASE 3 - UI polish  *(~2 days)*

25. Find/replace the ~296 malformed `)]0` classes; re-audit dark-mode contrast afterwards.
26. One `<ListingCard>` with three variants; delete the other four.
27. Add `--color-trust` (sea-green) and apply it to the ~62 verification badges.
28. One `<Modal>` primitive with focus trap, `aria-modal`, `Escape`, scroll lock; migrate the 20 call sites.
29. `aria-label` sweep on icon-only buttons; 44px minimum control height.
30. Remove the `AdminGate` flashing animation; raise the timeout to 15 minutes.
31. Delete the 12 unused components, `usePalette`, `apiDocsData`, and the two `* 2.*` files.
32. Named type-scale and spacing utilities.

### PHASE 4 - Product improvements  *(~4 days)*

33. Saved searches with email alerts.
34. Computed owner response time and response rate; delete the fake columns.
35. Listing expiry / "still available?" prompts.
36. Per-listing owner analytics (views, saves, enquiries).
37. Bond guidance content pointing at the correct state authority.
38. Make visa matching visible in the search UI.
39. Enquiry templates for renters with no rental history.

### PHASE 5 - Performance, SEO & accessibility  *(~3 days)*

40. Server-render `listing/[id]`; add listing URLs to the sitemap; per-listing OG images.
41. `getStaticProps` for help, blog and guides.
42. Replace all 25 `<img>` with `next/image`.
43. Next.js i18n routing with `hreflang`; translate search, listing detail and booking - the three pages that decide whether a non-English speaker can actually use Migrent.
44. Fix the N+1 in `GET /bookings/me`; narrow the search `select("*")`; score matches in SQL.
45. Dynamic-import `recharts`; scope Lenis to marketing pages; reduce confetti to one.
46. `next/font` for the three families.
47. Indexes on `listings(suburb, city, weekly_price)`.
48. Add `data_source` / `data_as_at` to `suburbs` and cite sources on-page.
49. Set up DNS, flip `SITE_URL` and `robots.txt`, enable Sentry.

---

## "If Migrent were my startup, these are the 10 things I would do next."

Ranked highest to lowest priority.

**1. Lock the database down before anything else.** One migration: fix the `profiles` policies, revoke the write grants from `authenticated`, add the role-change trigger. It is perhaps 80 lines of SQL and it closes seven of the ten most serious findings in this audit. Nothing else matters until this ships, because everything else you build sits on top of it.

**2. Delete the escrow claims today.** Not this sprint - today. It is a false statement about money, made to migrants, repeated in meta descriptions, and reinforced by a fabricated testimonial. It is the one finding here that carries personal legal exposure for you, and removing it takes twenty minutes.

**3. Decide who pays the $99, then make the code and the page agree.** Right now the renter is charged $118 at a checkout the pricing page says is free. Whichever way you resolve it, resolve it before a single real payment.

**4. Fix the XSS and turn the CSP on.** Account takeover through a message is the kind of incident an early marketplace does not survive reputationally. The fix is deleting one code path.

**5. Stop hard-deleting listings.** An owner clicking "delete" should not destroy paid bookings and the entire message history that would settle a dispute. This will bite you the first time it matters, and by then the data is gone.

**6. Let owners build a listing before they verify.** You have one listing. Full ID verification as a precondition to *creating* anything is the single largest brake on supply, and you can keep every trust guarantee by moving the gate from create to publish. Pair it with draft persistence in the six-step form. This is the highest-leverage growth change available.

**7. Server-render listing pages and put them in the sitemap.** Your organic strategy is suburb guides plus listing pages. Half of it does not exist as far as Google is concerned, and shared links unfurl as grey boxes on WhatsApp - the channel this audience actually uses.

**8. Finish the multilingual promise or withdraw it.** Eight languages in the switcher, 645 translated keys each, and the search page is English-only. A Spanish speaker toggles the language, sees a translated homepage, then hits an English search form. For a migrant product that is the promise breaking at the exact moment it matters. Route i18n properly and translate search, listing detail and booking first.

**9. Delete the duplicates and the dead code.** Four duplicate page pairs, twelve orphan components, two rules pages, 296 malformed classes, a README describing software that does not exist. About a day's work that makes every subsequent day faster and stops bug fixes landing in the copy nobody sees.

**10. Build saved searches with email alerts.** The first genuinely new feature I would add, and only after 1-9. Your users are urgently looking for somewhere to live and there is almost no inventory. "Email me when a room under $300 appears in Carlton" converts a dead-end visit into a returning user, and it is the mechanism that lets your first listings find the people already waiting for them.

---

### Two things worth saying at the end

**What is genuinely good here, and should not be touched:** the design system and `design.md` itself; the suburb guide pages; the search filter set; `matching_engine.py`'s refusal to invent scores; the legal and safety page coverage; the mentor network concept; the honesty of the API-docs placeholder; and the general standard of the code. Several of these are better than what funded competitors ship.

**The pattern worth internalising:** almost every P0 in this audit has the same shape - *a rule is enforced in one layer and left open in another.* The backend verifies owners; the database lets anyone insert a listing. The backend checks deal completion before a review; the database lets anyone insert a review. The admin check reads the database; it also reads a field the user controls. The sanitiser strips tags; the insert path skips the sanitiser. Fixing the specific instances is Phase 1. Adopting the rule that **the database is the security boundary and the API is a convenience** is what stops the next ten from appearing.
