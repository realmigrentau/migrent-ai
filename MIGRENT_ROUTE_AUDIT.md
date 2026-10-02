# MIGRENT ROUTE AUDIT

Page-by-page review of every route, 1 October 2026. Issue IDs refer to [MIGRENT_MASTER_AUDIT.md](MIGRENT_MASTER_AUDIT.md).

**How each route was checked:** live status code and metadata (Playwright against production), page content read in a browser, interactive elements clicked where they do not submit data to production, axe WCAG 2.2 AA in light and dark (public pages), 320 px overflow check (public pages), and the source file. Signed-in routes were exercised on the production build with the mock API (renter, owner, admin fixture accounts) and by the Playwright suite.

Status: ✅ Working · ⚠️ Needs improvement · ❌ Broken · 🚧 Incomplete

Contents: [Public site](#public-site) · [Legal centre](#legal-centre) · [Account-adjacent site pages](#account-adjacent-site-pages) · [Migrent Hub](#migrent-hub) · [Hub admin panel](#hub-admin-panel) · [Legacy pages and redirects](#legacy-pages-and-redirects) · [Next.js API routes](#nextjs-api-routes) · [Backend API surface](#backend-api-surface) · [Permissions matrix](#permissions-matrix)

---

## Public site

## `/` - Homepage ⚠️

**What works**
- Headline "Find a home. Feel at home." plus "Every host is ID-checked before a room goes live. Searching and applying are free." explains the offer in under 10 seconds.
- Interactive doll's-house configurator with "I'm looking / I'm hosting"; choices carry through to search filters or the listing wizard.
- Clear four-step "How it works", a trust section that says what is and is not checked, an owner teaser, suburb marquee, guides, FAQ.
- No horizontal overflow at 320 px; axe clean in light and dark; LCP 2.66 s on throttled mobile; CLS 0.009.
- Keyboard order is logical; all controls labelled.

**Problems**
- "AVAILABLE NOW - Rooms you can move into." shows no rooms (production has 0 listings) and claims "New rooms are added every week" (MIG-005, MIG-021).
- Promotes mentors ("Talk to someone who has made the move") while 0 exist (MIG-021).
- "Real people when you need help" is backed by a Gmail inbox and a keyword bot (MIG-021, MIG-013).

**Missing**
- Anything that says Australia beyond "AU" next to the logo until the body; cities served; a real person or company behind it.
- Organization/WebSite structured data (MIG-051).

**UX improvements**
- On phones, put a compact "Where do you want to live?" field above the illustration (MIG-039).
- Make the trust strip claims data-driven (counts of ID-checked hosts and live rooms once they exist).

**Bugs**
- The chat bubble covers the search input at 320-430 px (MIG-012).

**Mobile issues**
- The illustration fills the first screen at 320x700; the search panel starts below the fold.
- Footer links 18-19 px tall (MIG-053).

**Recommended changes:** hide empty sections behind live counts; mobile-first search placement; fix the bubble; add Organization JSON-LD.

## `/seeker/search` - Room search ⚠️

**What works**
- About 30 URL-synced filters (location by suburb/postcode/address/near me, price, room type, property type, dates, furnished, bills, pets, parking, air con, couples, near station, private bathroom, lockable door, no cameras, verified owner, min bedrooms, min stay); sorting; pagination.
- Server-rendered results, WebGL detection with a map fallback, offline and error states.
- Malformed input handled safely: emoji, `<script>` text, 3,000-character suburb, negative or reversed price range, invalid postcode, negative page and unknown sort all return 200 with no errors.

**Problems**
- With no filters and no inventory it says "No rooms match your search. Try removing some filters" (MIG-022).
- "Popular suburbs" is a fixed Sydney list including Kellyville (MIG-022).
- `noindex,nofollow` (MIG-037).
- Signed-in users trigger a hydration mismatch from the "Best match" sort option (MIG-027).

**Missing**
- "Alert me when rooms appear" in the empty state (the homepage has it).
- A lease-type filter (long-term vs short stay) and a newcomer-friendly signal (MIG-045).
- Validation feedback when min price > max price.

**UX improvements**
- Rename "Guests: Adults, Children, Infants" to "People moving in" (MIG-040).
- Show the transport mode on cards ("6 min walk to Kellyville station") (MIG-055).

**Bugs:** hydration mismatch (MIG-027).

**Mobile issues**
- On iPhone, there is no visible location field until "Filters" is opened (MIG-039); the chat bubble covers suburb chips (MIG-012).

**Recommended changes:** honest empty state with alert sign-up; mobile location field at the top; lease-type filter; fix the sort option.

## `/listing/[id]` - Public listing ⚠️ (production has none; tested on the mock build)

**What works**
- Title, suburb and postcode, price per week, photo gallery with full-screen view, amenities, availability window, minimum stay, approximate area map with "exact address after you book an inspection".
- Host card with ID-checked explanation including "It is not a guarantee of safety or suitability" (excellent).
- Bottom CTAs (Apply, Book an inspection, Message, Save) send guests through sign-in and keep the intent.
- "What will this really cost you?" commute-cost helper.
- Good SEO: unique title, description, canonical, OG image, `Accommodation` JSON-LD; unknown IDs return 404, expired listings 410.

**Problems**
- Host card "Message {name}" opens an empty Hub inbox (MIG-008).
- No bond, rent in advance or move-in total (MIG-017).
- "Reviews" heading with nothing under it (MIG-011).
- Support contact shows `migrentau@gmail.com` (MIG-014).
- "Max 2 guests" wording (MIG-040).

**Missing**
- Report this listing, Share, and the "Never pay before you inspect" warning, all of which exist on the Hub version (MIG-009, MIG-043).
- Lease type (short stay vs lease), house rules summary, who lives there, safety items (cameras, lockable door) when set, bills estimate.
- "Newcomers welcome / no local rental history needed" flag (MIG-045).

**UX improvements:** one shared listing component for public and Hub (MIG-043); move-in cost box near the price.

**Bugs:** MIG-008.

**Mobile issues:** CTAs are reachable; check sticky CTA does not collide with the chat bubble.

**Recommended changes:** fix the message link, add Report + warning + bond, hide Reviews until real.

## `/how-renting-works` - How renting works ✅

**What works:** clear steps; explains ID checks and their limits; bond goes to the state authority; safety advice; "What Migrent is not". Merged from three older pages with redirects in place. Axe clean; LCP 2.38 s.
**Problems:** step 4 says "Migrent has reviewed the application" before terms are agreed, without explaining that Migrent's final review exists or how long it takes.
**Missing:** boarders and lodgers vs tenants (MIG-035); typical documents to prepare; what to expect at an Australian inspection; links to each state's bond authority.
**UX improvements:** a short glossary (bond, condition report, lease, break fee, notice period).
**Bugs / Mobile issues:** none found.
**Recommended changes:** add glossary and documents checklist; link state authorities.

## `/for-owners` - For owners ✅

**What works:** four-step hosting flow, Hub features, earnings estimate that only adds Migrent's fees, FAQ; honest ("No estimates and no invented benchmarks").
**Problems:** "Stay bookings $99 once per property" is not defined against "long-term tenancy fee $0" (MIG-040); the legal pages say otherwise (MIG-006).
**Missing:** what a landlord's legal obligations are (lodging bond, condition report, smoke alarms, minimum standards by state); who the renters are (demographics) once there is data; property manager specifics (MIG-026).
**UX improvements:** a "Short stay or lease?" explainer.
**Bugs / Mobile issues:** none found.
**Recommended changes:** define stays vs leases; obligations checklist by state.

## `/pricing` - Pricing ⚠️

**What works:** clear $0 for renters, $99 per property for hosts, no commission, FAQ; honest test-mode wording elsewhere.
**Problems:** contradicts the Terms ("$99 per successful match", "$19 seeker fee") (MIG-006); "only for stays" undefined (MIG-040); open internal decision on per-property vs per-listing.
**Missing:** refund policy for the $99; what happens if the stay falls through; GST status (the ABN page says not registered).
**Bugs / Mobile issues:** none found.
**Recommended changes:** settle the model, then make Pricing the single source the legal pages quote.

## `/guides` - Guides hub ⚠️

**What works:** clean hub with "Start here" (scams article), four articles, state law page, suburb guides and earnings links; BreadcrumbList JSON-LD.
**Problems:** only 4 articles; all 8 long-form guides withdrawn (MIG-044).
**Missing:** newcomer essentials (applications, inspections, condition reports, bond lodgement and refund, notice periods, share houses vs boarding, rights by visa type, first-month budget).
**Bugs / Mobile issues:** none found.
**Recommended changes:** rewrite and re-publish the withdrawn guides; add the essentials list.

## `/guides/rental-laws` - Rental law by state ⚠️

**What works:** covers all eight states and territories; plain language; multilingual resources noted for Victoria.
**Problems:** specific bond caps and advance-rent limits per state with no source links or "last reviewed" date; I did not verify them (MIG-035).
**Missing:** boarders and lodgers; links to each tenancy authority and bond authority; tribunal links per state.
**Recommended changes:** professional review, citations, review date, boarders/lodgers section.

## `/guides/[id]` - Long-form guides 🚧

**What works:** withdrawn guides return 404 (`notFound`) and eight old slugs redirect temporarily to accurate Help articles.
**Problems:** every guide is withdrawn; `getStaticPaths` produces no pages.
**Recommended changes:** rewrite against the current product, then remove from `HIDDEN_GUIDES`.

## `/blog/[slug]` - Articles ✅

Live: `spot-rental-scams`, `5-tips-first-time-migrants`, `budgeting-rent-students`, `bond-rights-migrants`. Two withdrawn posts redirect to `/guides`; unknown slugs 404.
**What works:** Article + BreadcrumbList JSON-LD, readable.
**Problems:** the scams article opens with an unsourced statistic ("Rental scams cost Australian tenants millions every year, and migrants are disproportionately targeted"); title 69 characters and description 181 characters (truncate in Google).
**Recommended changes:** cite the ACCC Scamwatch figure or soften; shorten metadata.

## `/help` - Help Centre ✅

**What works:** most-read, quick answers (FAQPage JSON-LD), 8 categories, "Still stuck? Write to a person". Content is accurate and dated.
**Problems:** "Write to a person" goes to the Contact form whose messages admins never see (MIG-065).
**Bugs / Mobile issues:** none found.

## `/help/[slug]` - Help articles ✅ (23 articles in the sitemap)

**What works:** accurate, short, dated ("Updated 29 September 2026"); `how-matching-works` explicitly says "It is not AI"; `how-payments-work` matches Pricing.
**Problems:** `report-a-user` says "A listing: use Report on the listing page", which the public listing page lacks (MIG-009); it also lists the Gmail address.
**Recommended changes:** fix after MIG-009 and MIG-014.

## `/help/category/[slug]` - Help categories ✅

Eight categories, each lists its articles, BreadcrumbList JSON-LD. No issues found.

## `/suburbs` - Suburb directory ✅

**What works:** 15,334 suburbs and localities, 112 cities and regions grouped by ABS geography, search by name/city/state/postcode, state and area filters, three sorts, "Written guide" markers, data date. 123 KB HTML; LCP 2.39 s; no overflow at 320 px.
**Problems:** relies on the same broken room-count query as suburb pages (MIG-007) for any room counts.
**UX improvements:** show live room counts per suburb once supply exists.

## `/suburb/[state]/[slug]` - Suburb guide ⚠️

**What works:** every figure labelled "Published figure" or "Calculated by Migrent" with source and census date; honest notes ("not a room rent", "not travel times", "a count is a floor"); transport, nearby amenity counts from OpenStreetMap; editorial section clearly marked opinion with a review date; FAQPage, Place and BreadcrumbList JSON-LD; nearby suburbs.
**Problems**
- "Rooms on Migrent: Live room data is temporarily unavailable" on every page (MIG-007).
- "Nearest train station: Robin Thomas" at Parramatta is a light-rail stop (MIG-054).
- Contrast 4.16:1 on a chip in dark mode (MIG-052).
**Missing:** links into a "Rooms in this suburb" search with alert sign-up; rent for rooms (Migrent data) once there is enough.
**Recommended changes:** fix the query; relabel stations; add an alert CTA.

## `/suburb/[name]` (file `pages/suburb/[state].tsx`) - Old suburb URLs ✅

**What works:** old single-segment URLs resolve: one of the 16 original guides 301s to its new path, a unique name 301s, an ambiguous name shows a chooser, nothing 404s. Verified: `/suburb/west-end`, `/kellyville`, `/parramatta`, `/carlton`, `/sunnybank` redirect.
**Notes:** `/suburb/nsw` (a state alone) 404s; there is no state index page (could be a useful landing page).

## `/mentors` - Local mentors ⚠️

**What works:** search by suburb and language; clear "not ID-checked, meet somewhere public" notice; "No mentors yet" empty state.
**Problems:** 0 mentors; empty state says "Try a nearby suburb" (MIG-059); suburb chips Sydney-only; safety model (MIG-018).
**Recommended changes:** hide from the main navigation and homepage until there are approved, ID-checked mentors.

## `/mentor/[id]` - Mentor profile ⚠️

**Problems:** unknown IDs return 200, `index,follow`, title "Rooms for new arrivals in Australia", no H1 (MIG-050).
**Recommended changes:** `notFound` for missing mentors.

## `/become-mentor` - Become a mentor ⚠️

**What works:** clear form (suburb, languages, topics, intro, price with "You receive about $18. Migrent keeps $7 (30%)").
**Problems:** "Your profile is listed straight away" with no ID check (MIG-018); client-rendered (empty `<main>` in server HTML, MIG-051); "Sign in to continue" only at the end, after filling the form.
**Recommended changes:** ID check + approval; ask for sign-in first or keep the draft through sign-in.

## `/users/profile/[id]` - Public host profile (legacy) ⚠️

**What works:** public fields only (opaque `public_id`); the only place a user can Block someone.
**Problems:** unknown IDs return 200 + indexable (MIG-050); Block writes straight to Supabase from the browser (MIG-032); duplicated by the host section of the Hub listing view.
**Recommended changes:** server-side 404; move Block into the Hub API.

## `/about` - About ⚠️

**What works:** clear mission; "introduction service, not a real estate agent"; four principles; careers and press sections (merged).
**Problems:** no named founder, team or company entity anywhere on the site; for a trust-first product aimed at people avoiding scams, anonymity hurts.
**Recommended changes:** name the people and the legal entity once confirmed (MIG-006).

## `/contact` - Contact ❌

**What works:** accessible form (labelled fields, inline errors, character counter), "Feel unsafe? Call 000" note, topic selector.
**Problems:** submissions go to `support_requests`, which no admin screen reads, and the sender gets no confirmation (MIG-065); messages under 10 characters fail with a generic error (MIG-065); Gmail address shown (MIG-014).
**Recommended changes:** create a ticket; confirmation email; align validation.

## `/support/tickets` and `/support/tickets/[id]` - Your support requests ✅

Private (proxy redirects guests to Hub sign-in with `return`). List, create, reply and rate tickets; admin replies appear here.
**Problems:** lint warnings for effects calling setState (`pages/support/tickets/*.tsx`) (MIG-049); separate from the Contact form (MIG-065).

## `/404`, `/500` - Error pages ✅

Branded status pages with ways back; `noindex`. Unknown paths return a real 404 status.

## `/sitemap.xml`, `/sitemap-suburbs.xml`, `/robots.txt` ✅

59 core URLs with real `lastmod`; suburb sitemap index paged; robots disallows `/hub`, `/admin`, private paths and points at both sitemaps. Listings fetched with `limit=100` only (MIG-037).

---

## Legal centre

All legal pages share `components/site/LegalLayout.tsx`, show "Last updated: March 2026" (except `/legal` and `/rules-community-guidelines`), and print `migrentau@gmail.com`. Canonicals and titles are correct; axe clean except `/cookie-policy` contrast (MIG-052).

## `/legal` - Legal centre ⚠️
Index of all policies. Fine as navigation; inherits every problem below.

## `/terms-of-service` ❌
Section 5 "Platform Fees & Payments" describes $99 "per successful match" and a $19 optional seeker verification fee; the responsibilities table says "Pay applicable platform fees $99/deal, $19 optional"; fee-circumvention clause assumes per-match fees (MIG-006). Gmail contact x3. **Fix:** rewrite after the fee decision; counsel review; version and acceptance record.

## `/privacy-policy` ⚠️
Gmail contact x4 for privacy requests (MIG-014). Needs counsel review against the Hub's data (Rental Profile, documents, income, view-as by admins, listing-event hashing, push tokens, retention in MIG-016). Dated March 2026, before the Hub.

## `/cookie-policy` ⚠️
Contrast failure on a chip (MIG-052). Should list Vercel Analytics/Speed Insights, Supabase auth cookies, hCaptcha, Stripe once analytics is enabled.

## `/disclaimer` ❌
"Migrent charges flat platform fees only ($99 per deal for owners, $19 optional for seekers)" (MIG-006).

## `/anti-discrimination` (Fair Housing Policy) ⚠️
Content reasonable; Gmail contact. Note: the search has a "female only" filter and listings have gender preference; counsel should confirm how that sits with anti-discrimination law for shared accommodation (generally permitted for shared living in several states, but confirm per state).

## `/code-of-conduct` (NSW STRA Code of Conduct) ⚠️
The NSW short-term rental code shown as Migrent's code of conduct, while Migrent covers all states and mostly longer stays (MIG-060).

## `/rules-community-guidelines` ❌
Says renters "may be presented with an optional one-time AUD $19 platform fee when a successful match occurs" and owners "agree to pay Migrent's one-time AUD $99 platform fee on each successful match" (MIG-006).

## `/safety-reporting` ⚠️
Good emergency numbers (000, 131 444, Crime Stoppers) and report categories. Reporting is "email migrentau@gmail.com" (MIG-014); should link to in-product Report (MIG-009). "Fee circumvention" listed as a safety report category, which confuses renters who are told to pay hosts directly.

## `/support-disputes` (Dispute Resolution) ❌
"Platform fee disputes ($99 owner fee or $19 seeker fee)"; Gmail x2 (MIG-006, MIG-014). Tribunal pointers (NCAT etc.) are useful.

## `/contact-legal` (Legal Contact & Arbitration) ⚠️
Gmail contact; arbitration clause needs counsel review for consumer contracts.

## `/abn-terms` (ABN & Business Details) ❌
ABN shown; "Entity Type: Being confirmed"; "An AI-powered matching service for short- to medium-term rooms"; "Deal Confirmation Fee AUD $99 per successful match/deal"; "Verification Fee (optional) AUD $19"; website `migrent.vercel.app` (MIG-006).

---

## Account-adjacent site pages

## `/booking-success`, `/booking-cancelled` ✅
Stripe return pages for the host fee; private; read `session_id` and show status. Linked from `routes_bookings.py`.

## `/mentor-session-success` ✅
Stripe return for mentor sessions; private.

## `/verification-success`, `/verification-cancelled` 🚧
Return pages for the $19 renter check, which is switched off (`SEEKER_VERIFICATION_ENABLED=false`). Orphaned until that feature returns (MIG-048).

## `/reviews/[dealId]` ❌
Review form tied to a deal; deals are retired (410), so it can never be used (MIG-011).

## `/auth/callback` ✅
Legacy callback used when Supabase falls back to the Site URL (`/?code=` redirects here). Calls the welcome-suite email; the Hub's own callback does not (MIG-056).

---

## Migrent Hub

All Hub pages are private (`proxy.ts` redirects to `/hub/sign-in?next=...`), `noindex`, `private, no-store`. Covered by `tests/e2e/hub.spec.ts` (desktop and Pixel 7, axe in light and dark, no overflow).

## `/hub/sign-in` ✅
Google, email + password, magic link; invisible hCaptcha (confirmed loading in production); "Forgot your password?". Errors are clear and non-enumerating ("That email and password do not match. Check both, or reset your password."). **Polish:** no show-password toggle; invalid-email message vague; focus stays on the button after errors (MIG-063). Dev-only hydration error (MIG-061).

## `/hub/sign-up` ⚠️
Clear copy that adapts to intent ("List a property..." vs "Find, apply for..."); password 10+ characters with letters and a number; terms + privacy checkbox; resend confirmation. **Problems:** slow on mobile (LCP 3.9 s, ~3.7 s long tasks) (MIG-028); no welcome email afterwards (MIG-056). Supabase leaked-password protection is off (MIG-036).

## `/hub/forgot-password`, `/hub/reset-password` ✅
Reset by email back to `/hub/reset-password` via the Hub callback. Non-enumerating.

## `/hub/auth/callback` ✅
Finishes OAuth, magic link, confirmation and reset; honours `next`.

## `/hub/verify-mfa` ⚠️
TOTP challenge when the session needs aal2. Enforced only in the browser (MIG-019).

## `/hub/welcome` ✅
Role (renter / owner, and owner kind), name, 18+ confirmation and terms acceptance in one step.

## `/hub` - Home ✅
Renter: next inspection, unfinished application, unread messages, applications, inspections, Rental Profile progress, messages. Owner: portfolio counts, "needs your attention" (e.g. listing ends this week), properties, applications, inspections, messages, 30-day insights with "Counting since". Admin-only accounts see the admin overview.

## `/hub/discover` ✅
Search with map (MapLibre worker served from the site), filters; e2e confirms the map loads and pins homes.

## `/hub/homes/[id]` ✅
Hub listing view: Share, Compare, Report this listing, inspection times in the property's timezone, approximate area until booking, host card, "Never pay rent or a deposit before you have inspected and signed", similar homes. Shows bond when set. **Problem:** differs from the public listing page (MIG-043).

## `/hub/compare` ✅
Side-by-side saved homes.

## `/hub/saved` ✅
Saved homes with price-change notes ("$20 less since saved"), unavailable homes separated, saved searches with alert cadence.

## `/hub/profile` - Rental Profile ✅
Seven sections with progress; "This is my first rental in Australia" counts as complete; income private unless shared per application; documents private with per-application sharing and expiry; guidance not to share nationality, visa, religion or age. "An optional ID check is coming" (renter check disabled). Strong.

## `/hub/apply/[listingId]` ✅
Application with snapshot of the Rental Profile, move-in date, lease months, occupants, message, share-income choice (e2e "finish and send an application").

## `/hub/applications`, `/hub/applications/[id]` ✅
Both sides; search and status filters; timeline; owner notes; shortlist; request changes; owner approval then Migrent final review then tenancy.

## `/hub/inspections` ✅
Owners publish slots with capacity; renters book, move or cancel; attendance; address released on booking.

## `/hub/messages/[[...key]]` ⚠️
Conversations keyed by home and person with application and inspection context; search; Unread/Archived; Archive, Mute, Report; owner reply templates; safety note. **Problems:** ignores `?listing=&to=` so the public host card link lands on an empty inbox (MIG-008); no Block (MIG-032); no scam warnings (MIG-033).

## `/hub/my-home`, `/hub/tenancies`, `/hub/tenancies/[id]`, `/hub/maintenance/[id]` ✅
Lease summary, rent record (Migrent never collects rent), repairs with routine/urgent/emergency and "call 000" plus the state authority before an emergency request is sent; owner private notes; photos.

## `/hub/properties`, `/hub/properties/[id]` ⚠️
Portfolio grouped by property with units and statuses. No search, filter, sort or bulk actions for larger portfolios (MIG-026).

## `/hub/properties/new` - Listing wizard ⚠️
Six steps (property, space, details, photos, rent, review), autosave to `listing_drafts`, free navigation, Review lists missing items with links, search-card preview, optional AI writing help (off in production). **Problems:** accepts "Parramatta / VIC / 9999" and marks the step done (MIG-023); bond optional free text (MIG-017). **Accessibility:** steppers and radios correctly labelled.

## `/hub/listings/[id]`, `/hub/listings/[id]/edit` ⚠️
Manage a listing: status, pause/resume/renew, occupancy, edit. **Problem:** edits to a live listing are not re-reviewed (MIG-010).

## `/hub/insights` ✅
Views, unique views, saves, enquiries, inspections, applications per listing from recorded events only; owner's own visits excluded; "Counting since".

## `/hub/activity` ✅
Notifications; old notification links mapped to Hub routes.

## `/hub/settings` ⚠️
Profile photo and name, email change, role switch (renter / listing homes), owner kind, four email-notification groups, appearance, password change, two-step verification, sign out other devices, data export, delete account. **Problems:** delete leaves files and erases counterpart data (MIG-016); one role at a time (MIG-047); no blocked-users list.

## `/hub/me` ✅
Account summary and role label.

## `/hub/locked` ✅
Shown after three wrong admin-panel passwords (signs out, alerts all admins).

---

## Hub admin panel

All need an admin account **and** the panel password (423 from the API without the unlock token). Locks after 30 seconds idle with lights and siren (MIG-025). Every action that needs a reason enforces one and writes `admin_audit_log` first.

## `/hub/admin` - Overview ✅
Queue counts (listings to moderate, ID checks, final reviews, open reports, support tickets, emergency repairs), account and approved-listing totals, admin password change. **Missing:** trends and funnel metrics (MIG-015, MIG-024).

## `/hub/admin/listings` ✅
Tabs: To review, Flagged, Hidden, Removal pending, Paused, All listings; search by title, suburb or owner; side panel with photos, owner, spam reasons, history; state-appropriate actions with required reasons; two-step removal. **Missing:** bulk actions, canned reasons, a "changed since approval" queue (MIG-010, MIG-024).

## `/hub/admin/id-checks` ✅
Owners waiting; five-minute document link; approve or reject with emailed reason. **Note:** can be bypassed by self-approval until MIG-001 is fixed.

## `/hub/admin/reviews` - Final reviews ✅
Owner-approved applications awaiting Migrent; decisions audited.

## `/hub/admin/reports` ⚠️
"Most urgent first"; priority; take; close with reason; emergency repairs tab. **Missing:** act from the report (pause listing, suspend user, open the conversation), link to the reported object's history (MIG-024).

## `/hub/admin/support` ✅
Tickets from the help button: reply, internal notes, status, priority, topic. **Missing:** Contact-form messages (MIG-065).

## `/hub/admin/people` ⚠️
Search by name or email (two characters minimum), view as (read-only, 60 minutes, reason), suspend/reinstate with reason. **Problems:** suspension not enforced (MIG-002); no browse list, filters or person detail (MIG-024).

## `/hub/admin/audit` ✅
Every consequential admin action with who, when and why.

---

## Legacy pages and redirects

**Old admin console (`pages/admin/*`, 11 files: `index`, `overview`, `analytics`, `revenue`, `moderation`, `spam-moderation`, `listings`, `verification`, `users`, `reports`, `support`)** 🚧 - each redirects (307) to the Hub admin equivalent before rendering; non-admins get 404 from the proxy. The page files, `components/AdminGate.tsx`, `AdminLayout.tsx`, `AdminDataTable.tsx`, `components/admin/*` and `pages/api/admin/verify.ts` are dead code (MIG-048).

**Redirects verified live**

| Old URL | Goes to | Status |
|---|---|---|
| `/signin`, `/signup`, `/magic-link-*`, `/forgot-password`, `/reset-password` | Hub equivalents | ✅ 307 |
| `/dashboard`, `/dashboard/*`, `/owner/*`, `/seeker/dashboard`, `/seeker/profile`, `/seeker/wishlist`, `/seeker/saved`, `/messages`, `/account/*`, `/onboarding` | Hub equivalents (through sign-in when signed out, `next` preserved) | ✅ 307 |
| `/admin`, `/admin/*` | `/hub/admin/...` | ✅ 307 |
| `/for-seekers`, `/safety-verification`, `/no-agency` | `/how-renting-works` (+ anchors) | ✅ 308 |
| `/features`, `/resources/roi-calculator` | `/for-owners` (+ `#earnings`) | ✅ 308 |
| `/resources`, `/resources/*`, `/blog`, `/:locale/resources` | `/guides` or `/help` | ✅ 308 |
| `/faq` | `/help` | ✅ 308 |
| `/careers`, `/press` | `/about#careers`, `/about#press` | ✅ 308 |
| `/rental-laws` | `/guides/rental-laws` | ✅ 308 |
| `/seeker/search-extended`, `/seeker/room/:id` | `/seeker/search`, `/listing/:id` | ✅ 308 |
| `/rules` | `/rules-community-guidelines` | ✅ 308 |
| `/guides/host-first` and 7 other withdrawn guides, 2 withdrawn posts | accurate Help pages | ✅ 307 (temporary by design) |
| `/payment-success` | - | 404 (page removed; nothing links to it) |
| `/support` | - | ❌ 404, but booking emails link to it (MIG-030) |

---

## Next.js API routes

| Route | Purpose | Auth | Status |
|---|---|---|---|
| `GET /api/suburbs/search` | Suburb autocomplete from ABS data | Public | ✅ (e.g. `q=west end` returns 5 matches across states) |
| `GET /api/suburbs/region` | Region data for the directory | Public | ✅ |
| `POST /api/emails/send` | Internal email relay | `INTERNAL_EMAIL_SECRET` header, constant-time | ✅ (405 on GET) |
| `POST /api/emails/welcome-suite` | Welcome + legal reminder to the signed-in user | Session cookie; recipient from session | 🚧 not called by Hub sign-up (MIG-056) |
| `POST /api/admin/verify` | Old AdminGate passphrase | Session + passphrase | 🚧 dead (MIG-048) |

---

## Backend API surface

246 routes across 37 routers plus `/` and `/health` (enumerated from the FastAPI app). Auth column: **Hub** = `hub_actor` (+ suspension and view-as checks), **Token** = `get_current_user` only, **Admin** = DB admin + live session + panel unlock, **Secret** = cron or Stripe signature.

| Router (prefix) | Routes | Auth | Used by current frontend | Notes |
|---|---|---|---|---|
| `routes_hub` (`/hub`) | 8 | Hub | Yes | `/hub/features` public |
| `routes_hub_renter` | 17 | Hub | Yes | saved, searches, rental profile, documents, compare |
| `routes_applications` | 10 | Hub / Admin | Yes | |
| `routes_inspections` | 10 | Hub | Yes | |
| `routes_hub_messages` | 9 | Hub | Yes | sends through legacy `send_message` |
| `routes_hub_owner` | 17 | Hub | Yes | |
| `routes_tenancies` | 10 | Hub | Yes | |
| `routes_hub_admin` (`/hub/admin`) | 23 | Admin | Yes | |
| `routes_listings` (`/listings`) | 11 | Token / public | Yes | edits skip re-review (MIG-010); no suspension check (MIG-002) |
| `routes_messages` (`/messages`) | 7 | Token | Partly (attachments; send via Hub) | no suspension check |
| `routes_bookings` (`/bookings`) | 7 | Token | Yes (stays, pay-fee) | |
| `routes_profiles` (`/profiles`) | 11 | Token / public | Partly | `wishlist` writable (MIG-004) |
| `routes_owner_verification` | 5 | Token / Admin | Yes | |
| `routes_mentors` (`/mentors`) | 10 | Token / public | Yes | |
| `routes_support_tickets` (`/support`) | 12 | Token / guest / agent role | Yes | guest create unthrottled (MIG-041) |
| `routes_support` (`/support/contact`) | 1 | Public, 3/min | Yes | writes an unread table (MIG-065) |
| `routes_reports` (`/reports`) | 3 | Token / Admin | Yes | |
| `routes_reviews` (`/reviews`) | 6 | Token / public | Read only | creation impossible (MIG-011) |
| `routes_notification_center` | 5 | Token | Yes | |
| `routes_notifications` (push) | 2 | Token | Yes (enable-notifications card) | |
| `routes_account` (`/account/delete`) | 1 | Token, 3/hour | Yes | MIG-016 |
| `routes_admin` (`/admin`) | 10 | Admin | Shared logic with Hub admin | |
| `routes_spam_moderation` (`/admin/spam`) | 9 | Admin | Shared logic | |
| `routes_suburbs` (`/suburb`) | 2 | Public | Legacy | table has 16 rows; the site now uses ABS files |
| `routes_internal` (`/internal/cron`) | 4 | Secret | Render cron | unverified schedule (MIG-042) |
| `routes_deals` incl. `/webhooks/stripe` | 5 | Token / Secret | Webhook only | deal creation returns 410 |
| `routes_seeker` (`/seeker`) | 4 | Token | **No** | ❌ MIG-004 |
| `routes_owner` (`/owner`) | 3 | Token | **No** | dead |
| `routes_visa_matching` (`/visa`) | 3 | Token / public | **No** | ❌ MIG-004 |
| `routes_matches` (`/matches`) | 1 | Token | **No** | ❌ MIG-004 |
| `routes_referrals` (`/referrals`) | 3 | Token | **No** | dead |
| `routes_auth` (`/auth`) | 3 | Public / Token | **No** | ❌ MIG-020 |
| `routes_magic_auth` (`/auth`) | 4 | Public | **No** | ❌ MIG-020 (cross-device) |
| `routes_geocode` (`/geocode`) | 1 | Public | **No** (server-side use only) | MIG-058 |
| `routes_validation` | 3 | Public | **No** | dead |
| `routes_stations` (`/stations`) | 3 | Public | **No** | dead |
| `routes_verification` (`/payments`) | 1 | Token | Disabled feature | returns "not available" |
| `routes_verification_codes.py` | - | - | Not mounted | dead file |

---

## Permissions matrix

| Route group | Guest | Renter | Owner / PM | Admin |
|---|---|---|---|---|
| Public pages, search, listing, suburbs, guides, help | ✅ | ✅ | ✅ | ✅ |
| `/hub/*` (except auth pages) | → sign-in | ✅ | ✅ | ✅ |
| Renter screens (`/hub/saved`, `/profile`, `/apply/*`, `/compare`, `/discover`) | → sign-in | ✅ | Hidden from nav; API requires renter role where it matters | As their role |
| Owner screens (`/hub/properties*`, `/listings/*`, `/insights`) | → sign-in | API `require_owner` → 403 | ✅ | As their role |
| `/hub/admin/*` | → sign-in | 403 / not shown | 403 / not shown | ✅ + panel password |
| `/admin/*` (old) | → sign-in | 404 | 404 | → Hub admin |
| `/support/tickets*`, `/booking-*`, `/verification-*`, `/mentor-session-success`, `/reviews/*` | → sign-in (`return`) | ✅ | ✅ | ✅ |
| Supabase REST writes to `owner_verification`, `profiles.disabled_at`/`badges`, `mentors`, `mentor_sessions`, `tickets` | anon key only (no rows) | ❌ allowed on own rows | ❌ allowed on own rows | n/a |

The full feature-level matrix (save, message, apply, publish, report, block, delete) is in the master audit, section 6.
