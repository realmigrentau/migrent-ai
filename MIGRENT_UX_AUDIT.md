# MIGRENT UX AUDIT

1 October 2026. Experience, trust, content and quality review of https://migrent.vercel.app and Migrent Hub. Issue IDs refer to [MIGRENT_MASTER_AUDIT.md](MIGRENT_MASTER_AUDIT.md). Signed-in experiences were tested on the production build against the mock API because production has no listings.

---

## 1. First-time visitor (5-10 second test)

| Question | Answer from the homepage | Verdict |
|---|---|---|
| What is Migrent? | "Find a home. Feel at home." + "Every host is ID-checked before a room goes live." | ✅ clear |
| Who is it for? | "Built for arriving", migrants/students only become explicit further down (How it works, Trust) | ⚠️ say "for people new to Australia" in the hero |
| What problem does it solve? | Scams and "no local rental history" are addressed in the trust section | ⚠️ below the fold |
| Why not realestate.com.au / Domain / Facebook? | Implied (ID checks, no history needed), never stated | ⚠️ one comparison line would help |
| Can I rent? | Yes: "I'm looking", search | ✅ |
| Can I list? | Yes: "I'm hosting", "List a property" in the nav | ✅ |
| Is it trustworthy? | Strong explanation of checks and their limits | ⚠️ undermined by no named company/people, a Gmail address, and an empty "Available now" section |
| Is it Australian? | "AU" beside the logo, "bond with your state", suburb cards | ⚠️ mostly implicit until scrolling |
| Temporary or long-term? | Not stated; Pricing talks about "stays" vs "tenancies" | ❌ unclear (MIG-040) |
| Specifically useful for migrants? | "Apply without a local rental history", Rental Profile, suburbs | ✅ once you scroll |
| What next? | Search or list | ✅ but the search panel is below the illustration on phones (MIG-039) |

**Visual quality:** distinctive, calm and premium (Newsreader + Manrope, cobalt, hand-built illustration, night-to-dawn hero). Hierarchy is clear. Animations are smooth and respect reduced motion. Spelling and grammar are clean, Australian English.

**Would a new customer understand what to do?** Yes for "search", but they then hit zero results (MIG-005) and conclude the site is not real.

---

## 2. Renter experience (new arrival in Sydney)

**Discovery.** Search filters are thoughtful for this audience (lockable bedroom door, no cameras, private bathroom, female-only, couples, bills included, near station). Gaps:
- No suburb autocomplete in the hero or search (MIG-039); a newcomer does not know suburb spellings.
- No lease-type filter (weeks vs months) and no "newcomers welcome" flag (MIG-045).
- Short-stay vocabulary: "Guests - Adults, Children, Infants", "check-in/check-out" (MIG-040).
- Empty state blames filters (MIG-022).

**Listing page.** Strong on honesty (approximate map, "address after inspection", what ID-checked means). Missing the information a migrant needs most:

| Need | Present? | Value | Recommendation |
|---|---|---|---|
| Bond amount and weeks | ❌ public page; optional free text in Hub | Very high | Structured, required for leases (MIG-017) |
| Move-in cost total | ❌ | Very high | Bond + rent in advance line |
| Bills included / estimate | Partly ("Bills not included - budget extra") | High | Estimate range when not included |
| Lease type and length | Min stay only | High | "Lease, 6-12 months" or "Stay, 4-12 weeks" |
| Documents required | ❌ | High | Owner picks from a list; Rental Profile shows what is ready |
| Australian rental history required? | Platform-level claim only | Very high | Per-listing "No local history needed" (MIG-045) |
| Students / visa types welcome | ❌ | High | Owner checkbox, no nationality filtering |
| Transport | "6 min to Kellyville" (mode missing) | High | "6 min walk to Kellyville station" (MIG-055) |
| Who lives there, house rules | Collected in wizard; shown when set in Hub | Medium | Show on public page too |
| Safety items (cameras, lock) | Collected; filterable | High | Show on both pages |
| Suburb context | Link to suburb guide | High | Inline 3 facts from the suburb guide |
| Schools, shops | Suburb guide counts | Medium | Keep in the suburb guide |
| Report / safety warning | Hub only | Very high | MIG-009 |
| Reviews | Empty heading | High | MIG-011 |

**Account.** Sign-up is short and clear; the welcome step asks the right things (role, name, 18+, terms). The Rental Profile is the best part of the product: it lets a newcomer present "first rental in Australia" as normal and keeps income private per application.

**Dashboard (Hub).** Excellent next-action design. Saved homes show price changes. Settings cover password, MFA, devices, export and deletion.

---

## 3. Landlord experience

- **Is it obvious landlords can use Migrent?** Yes: "List a property" in the nav, "I'm hosting", an owners section and `/for-owners`.
- **Why list here instead of realestate.com.au or Domain?** Free, no commission, structured applicants, inspections that book themselves, rent and repair record. Not said: who the renters are and how many (no supply data yet).
- **Is listing free or paid?** Free to list; $99 per property only for "stays" - and "stays" is not defined (MIG-040), while the Terms say "$99 per successful match" (MIG-006).
- **What happens after I list?** ID check, then review, then live: explained well on `/for-owners` and in the wizard.
- **How are renters screened?** Rental Profile snapshot, references, documents; Migrent final review before a tenancy is created. Renter identity is not checked (the optional check is "coming").
- **Wizard quality:** autosave, free navigation, missing-items list, search-card preview, AI writing help (off). Problems: location consistency (MIG-023), bond (MIG-017), no suburb autocomplete.
- **After publishing:** live edits skip review (MIG-010); insights are honest.
- **Missing for landlords:** obligations checklist by state (bond lodgement, condition report, smoke alarms, minimum standards); lease template pointers; listing renewal reminders depend on unverified cron jobs (MIG-042).

## 4. Property manager experience

Migrent works for one person with a few rooms. For 20-100 properties it becomes slow:
- No agency profile, licence number or branding (NSW and other states license property managers; renters should see the licence).
- No team members, roles or shared inbox; every PM would share one login (security risk).
- Portfolio has no search, filter, sort, pagination or bulk pause/renew; applications have search and status filters only.
- No CSV import/export, no API, no duplicate-detection across listings, no record of the landlord's authority for managed properties.
- Insights per listing only; no portfolio roll-up beyond the Hub home's 30-day totals.

Recommendation: keep PM as a second phase (MIG-026); start with team seats and portfolio filters.

## 5. Administrator experience

Strong foundations: queues with counts, tabs, side panels, required reasons, audit-first writes, view-as with reason and time limit, two-step removal, ID document links that expire in five minutes. Gaps (MIG-024, MIG-025):
- Reports cannot be acted on from the report.
- No browse/filter list of people and no person detail view.
- No metrics (signups, listings created, enquiries) - the old analytics was retired because its numbers were invented, but nothing honest replaced it.
- No bulk moderation or canned reasons; no "edited since approval" queue (MIG-010).
- Contact-form messages never appear (MIG-065).
- The 30-second idle lock with full-screen police lights and siren will fire while an admin reads an ID document.
- Suspension is not enforced outside the Hub (MIG-002).

---

## 6. Trust and safety

| Control | State | Notes |
|---|---|---|
| Host ID verification | ⚠️ | Human review of government ID; bypassable via REST (MIG-001) |
| Renter verification | 🚧 | Optional check "coming"; renters can apply without it (fine for the audience) |
| Property verification | ❌ | None; the copy is honest that Migrent has not inspected the property |
| Listing review before publish | ✅ | Every listing read by a person; spam scoring with scam keywords |
| Re-review after edits | ❌ | MIG-010 |
| Scam reporting | ⚠️ | Hub listing, conversation and profile Report; missing on the public listing (MIG-009); guests cannot report |
| Block | ⚠️ | Legacy page only (MIG-032) |
| Suspension | ❌ | MIG-002 |
| Safety education | ✅ | How renting works, scams article, Help, in-thread safety note, "call 000" for emergencies |
| Payment warnings | ⚠️ | "Never pay rent or a deposit before you have inspected and signed" in the Hub view only |
| Message scanning | ❌ | MIG-033 |
| Contact detail exposure | ✅ | Owner account IDs hidden; address released on booking |
| Reviews | ❌ | MIG-011 |
| Mentors | ❌ | Not ID-checked, in-person, paid (MIG-018) |

**Where Migrent can beat Facebook groups:** accountability (verified identity + the ability to report and ban that actually bites), no fake listings (review before and after edits), payment-safety prompts at the exact moment money is mentioned, verified reviews from real tenancies, and safety content in the reader's language.

---

## 7. Australian property context

- **Currency:** "$320 / week" on listings, "AUD 99" in the Hub, "AUD $99" in legal pages, "$99 AUD" elsewhere. Pick one ("$99" with "Prices in AUD" once per page).
- **Weekly rent:** consistently weekly. Good.
- **Address format:** suburb + postcode publicly, street after booking. Wizard has all 8 states and territories.
- **Spelling and dates:** Australian English; dates like "21 Sept 2026" (en-AU style). Good.
- **Phone numbers:** profile phone is free text; `/validate/phone` exists but is unused. Add AU formatting if phone becomes visible.
- **Coverage across states:** suburb guides cover all states and territories (15,334 places); rental-law page covers all eight. But "Popular suburbs" on search and the mentor chips are Sydney-only, the homepage cities are Sydney/Melbourne/Brisbane only, and the code of conduct is NSW's short-stay code (MIG-060).
- **Needs professional review (not verified here):** per-state bond caps and advance-rent limits; boarders and lodgers vs residential tenancies (MIG-035); the "introduction service, not an agent" positioning under each state's agents legislation; holding money for stays (MIG-034); Spam Act unsubscribe (MIG-031); Privacy Act retention of ID documents (MIG-016); anti-discrimination rules for gender-preference listings in shared housing; ACL on fee terms and marketing claims (MIG-006, MIG-021).

---

## 8. Suburbs and migration content

**Suburbs:** the best content on the site. Every figure sourced and labelled; methodology panel; editorial opinion separated and dated; honest omissions (no commute times, no walk scores). Issues: live room data error everywhere (MIG-007), light rail labelled as train (MIG-054), no link from a suburb to "alert me about rooms here". Mobile performance is fine (LCP 2.3 s throttled) despite 15,334 places, because the directory paginates and suburb pages are static.

**Does it help a migrant choose where to live?** Yes for community, language and rent context. It would help more with: typical room rent (once Migrent has data), travel time to the CBD and main universities (only with a real routing source - the site rightly refuses to fake it), and a "compare two suburbs" view.

**Guides, help, blog:** Help Centre is accurate. Guides are thin (MIG-044). The support widget KB contradicts Help (MIG-013). The scams article opens with an unsourced statistic.

---

## 9. Interaction audit (every button test)

Tested by hand on production (public) and the production build (Hub), plus the Playwright suite (navbar, search, hub journeys).

| Element | Where | Result |
|---|---|---|
| Logo, nav links (Find a stay, For owners dropdowns, Guides, Help, Sign in, List a property) | Header | WORKING |
| Language switcher | Header | PLACEHOLDER - one option, English (MIG-038) |
| Theme toggle | Hub, auth pages | WORKING (light/dark/auto shared with the site) |
| "I'm looking / I'm hosting" | Hero | WORKING |
| Location field | Hero | PARTIALLY WORKING - no autocomplete; covered by chat bubble on phones (MIG-039, MIG-012) |
| Rooms / Privacy / Shared / Extras tabs, bedroom stepper, Whole-place switch, toggles | Hero | WORKING (verified Privacy toggles: "No security cameras", "My bedroom door locks") |
| Doll's house rooms | Hero | WORKING with mouse/touch; not keyboard (MIG-064) |
| Show matching rooms | Hero | WORKING (→ `/seeker/search?suburb=...`) |
| Search all rooms, Save a search | Homepage | WORKING (Save a search → Hub Discover via sign-in) |
| "Available now" cards | Homepage | MISSING DESTINATION - no cards (MIG-005) |
| Meet the mentors | Homepage | MISLEADING - no mentors (MIG-021) |
| FAQ accordion | Homepage, Help | WORKING (`aria-expanded` updates) |
| Suburb marquee cards | Homepage | WORKING (all 10 links 200) |
| Chat bubble / Migrent Support | Site-wide | PARTIALLY WORKING - clipped on phones; "AI Assistant / Online" MISLEADING (MIG-012, MIG-013) |
| Search filters, sort, pagination, chips | Search | WORKING; empty state MISLEADING (MIG-022) |
| Photo gallery, full-screen photo | Listing | WORKING |
| "What will this really cost you?" | Listing | WORKING (opens the commute-cost helper) |
| Host name | Listing | WORKING (→ `/users/profile/...`) |
| Message {host} | Listing host card | BROKEN (MIG-008) |
| Apply / Book an inspection / Message / Save | Listing footer | WORKING (sign-in with intent) |
| Report / Share | Public listing | MISSING (MIG-009) |
| Report / Share / Compare | Hub listing | WORKING |
| Sign in, Google, magic link, Forgot password | Auth | WORKING (Google not clicked through to Google) |
| Wizard step buttons, Save and exit, Back/Next, Send for review | Hub | WORKING |
| Admin unlock, Lock now, tabs, Take this, Close report | Admin | WORKING |
| Contact form Send | `/contact` | PARTIALLY WORKING - saved where nobody looks (MIG-065) |
| Block | `/users/profile/[id]` | PARTIALLY WORKING (MIG-032) |
| Footer links (all of them) | Site-wide | WORKING (all return 200) |
| Email link "/support" | Booking emails | MISSING DESTINATION - 404 (MIG-030) |
| Verification success/cancelled pages | Stripe returns | UNNECESSARY while the $19 check is off |
| `/reviews/[dealId]` | Review form | BROKEN by design (MIG-011) |

## 10. Forms

| Form | Empty | Invalid | Long / special | Server error | Verdict |
|---|---|---|---|---|---|
| Hub sign-in | ✅ inline errors with `aria-invalid` | ⚠️ "Enter the email address you signed up with" for a malformed email | n/a | ✅ "That email and password do not match..." | Good (MIG-063 polish) |
| Hub sign-up | ✅ | ✅ password rule explained | n/a | ✅ | Good |
| Contact | ✅ | ✅ email format | ⚠️ 1-9 character messages rejected by the API with a generic error | ⚠️ "We could not send your message just now. Please email..." (offers a path) | MIG-065 |
| Search | n/a | ✅ malformed URLs handled | ✅ 3,000 chars, emoji, `<script>` | ✅ error/offline states | Good; no min>max feedback |
| Listing wizard | ✅ Review lists missing items | ❌ mismatched suburb/state/postcode accepted (MIG-023) | ✅ max lengths (title 80, description 5,000) | autosave | Mostly good |
| Rental Profile | ✅ section progress | ✅ | ✅ | ✅ | Good |
| Report dialog (Hub) | requires category | ✅ | ✅ | ✅ | Good (5/hour limit) |
| Become a mentor | ⚠️ sign-in only at the end | ✅ | ✅ | - | MIG-018 |

Double submission: buttons disable while submitting (sign-in, contact, wizard). Error messages are human ("We couldn't...") rather than codes throughout. Refresh during the wizard keeps the draft (`?draft=` in the URL).

## 11. Empty, loading and error states

| Screen | Loading | Empty | Error | Verdict |
|---|---|---|---|---|
| Homepage rooms | ISR | ❌ heading with nothing under it | - | MIG-005 |
| Search | server-rendered | ⚠️ blames filters | ✅ offline/error states | MIG-022 |
| Suburb room data | static | - | ❌ shown permanently | MIG-007 |
| Mentors | client | ⚠️ "Try a nearby suburb" | - | MIG-059 |
| Listing reviews | - | ❌ bare heading | - | MIG-011 |
| Hub screens | skeletons, stale-while-revalidate | ✅ intentional copy (e.g. "Pick a conversation") | ✅ toasts, "server without the Admin panel yet" message | Good |
| Saved | - | ✅ separates unavailable homes | - | Good |
| Unknown listing / suburb | - | - | ✅ 404/410 | Good |
| Unknown mentor / profile | - | - | ❌ 200 soft 404 | MIG-050 |
| Backend down | - | - | ✅ debounced "Reconnecting to live data" banner | Good |

## 12. Responsive design

- **Overflow:** none on 22 public pages at 320 px; none on Hub pages (e2e checks); WebKit iPhone 13 and Firefox desktop clean.
- **Problems:** support panel clipped on all phones and bubble overlap (MIG-012); homepage search below the fold at 320-375 px and no location field on mobile search (MIG-039); footer links small (MIG-053).
- **Tablet (768-1024):** search shows filters as a drawer below `lg`; Hub rail collapses; no issues found in e2e.
- **Large (1440-1920):** content is width-capped; no stretched layouts seen.
- Hub on phones: bottom tab bar, sign-out one tap away (e2e).

## 13. Light and dark mode

- One preference shared by the site and the Hub (light/dark/system), applied before first paint by a hashed inline script, so there is no flash.
- Dark palette is a clean near-black with cobalt, no muddy tinting; the homepage hero rests at pre-dawn with lit windows.
- axe in dark found one contrast failure (chip on the suburb page, MIG-052). Inputs, placeholders, borders, toasts, menus and the admin panel were checked in both themes by the e2e axe tests.
- Firefox could not be put into dark mode by the test harness (it ignored the emulated preference); the theme script itself runs in Firefox.

## 14. Accessibility

- **Automated:** axe WCAG 2.0/2.1/2.2 A+AA on 32 public pages x 2 themes: only `color-contrast` (5 nodes, MIG-052). Hub pages pass axe in the e2e suite.
- **Keyboard:** skip link first; logical order through nav, hero controls, CTAs; dropdowns and accordions operable; focus-visible styles present; the doll's house is mouse/touch only but duplicated by controls (MIG-064).
- **Forms:** labels associated (`label for`), errors announced with `role="alert"`, `aria-invalid`, `aria-describedby`; steppers have names like "More: Bedrooms".
- **Images:** listing photos inside cards use empty `alt` because the card text names the listing (acceptable); full-screen photo buttons are labelled "Open photo 1 of 1".
- **Motion:** reduced motion respected (hero, admin alarm lights).
- **Touch targets:** footer links below 24 px (MIG-053).
- **Language:** `lang="en"`; plain-English writing is a deliberate principle, which helps readers with English as a second language.

## 15. Performance

Throttled mobile (Pixel 7, 1.6 Mbps, 150 ms RTT, 4x CPU) against production:

| Page | LCP | FCP | CLS | Long tasks | Transfer | Requests |
|---|---|---|---|---|---|---|
| `/` | 2.66 s | 2.66 s | 0.009 | 434 ms | 743 KB | 37 |
| `/seeker/search` | 2.42 s | 2.42 s | 0.001 | 229 ms | 720 KB | 49 |
| `/suburbs` | 2.39 s | 2.39 s | 0 | 433 ms | 648 KB | 39 |
| `/suburb/nsw/parramatta` | 2.34 s | 2.34 s | 0.001 | 294 ms | 725 KB | 52 |
| `/how-renting-works` | 2.38 s | 2.38 s | 0.002 | 329 ms | 866 KB | 56 |
| `/guides` | 2.44 s | 2.44 s | 0.009 | 259 ms | 716 KB | 46 |
| `/hub/sign-up` | **3.91 s** | 2.70 s | 0 | **3,688 ms** | 582 KB | 39 |

Server TTFB from Sydney edge: 28-63 ms (static/ISR). API: `/health` ~0.2 s, empty search ~1.0 s (MIG-029). Fonts self-hosted and only two preloaded; images AVIF/WebP via `next/image`. Main opportunities: sign-up (MIG-028), API region (MIG-029), the search sort hydration mismatch (MIG-027), and the suburbs directory HTML (123 KB) if more fields are added. No N+1 problems in the Hub code paths; legacy routes have N+1 queries (moot once removed).

## 16. SEO

- **Good:** unique titles and descriptions on all 35 audited routes (no duplicates); self-referencing canonicals on `migrent.vercel.app`; OG and Twitter tags; JSON-LD on listings (Accommodation), suburbs (Place, FAQPage, BreadcrumbList), help (FAQPage), articles (Article); sitemap with real `lastmod`; private areas `noindex` and disallowed.
- **Problems:** `/seeker/search` is `noindex,nofollow` and there are no indexable "rooms in [suburb]" pages (MIG-037); soft 404s (MIG-050); no Organization/WebSite JSON-LD (MIG-051); `/become-mentor` client-rendered; canonical domain will need to move to migrent.com.au (MIG-014) with redirects from `*.vercel.app`; listing sitemap limited to 100; search snippets for the scams article truncated (69-char title, 181-char description).
- **Target queries:** "rooms for rent Sydney", "properties for rent Parramatta", "housing for international students Sydney" need suburb-level room landing pages linked from the suburb guides; "rentals for new migrants Australia" fits `/how-renting-works` + a newcomer guide. Do not add keyword-stuffed pages.

## 17. Content and microcopy

- Voice is excellent: short sentences, specific, honest ("Checked, not promised").
- Misleading or stale copy: support KB (MIG-013), legal pages (MIG-006), homepage availability and mentor claims (MIG-021), "AI Assistant / Online".
- Inconsistent terms: stays vs tenancies vs bookings vs applications; guests vs people; "Host" vs "Owner" vs "Landlord" (Hub says owner, public says host); "Migrent Hub" vs "your account".
- Inconsistent response times: "one business day" (Contact, listing), "24 hours" (widget), "24 to 48 hours" for ID review (widget).
- No lorem ipsum, TODOs or placeholder text found in shipped pages; illustrative testimonials were removed earlier.

## 18. Navigation and information architecture

- **Main nav:** Find a stay (search, how renting works, suburbs, mentors), For owners (why list, pricing, become a mentor), Guides, Help, Sign in, List a property. Clear and short.
- **Hub nav:** role-specific rail and phone tab bar; command palette; admin panel added for admins only.
- **Duplication:** two listing views (MIG-043); two support systems (Contact vs tickets, MIG-065); legacy profile page vs Hub host card; mentors under "Find a stay" and "For owners".
- **Dead ends:** "Message {host}" (MIG-008); `/support` from emails (MIG-030); empty search with no alert (MIG-022).
- **Breadcrumbs:** present on suburbs, guides, help, legal, listing. Good.

## 19. Browser testing

| Engine | Pages | Result |
|---|---|---|
| Chromium (desktop + Pixel 7) | full e2e suite + live checks | ✅ |
| WebKit (iPhone 13, light/dark) | `/`, `/seeker/search`, `/suburbs`, `/suburb/nsw/parramatta`, `/hub/sign-up`, `/how-renting-works` | ✅ no script errors, no overflow, dark mode applied |
| WebKit (desktop Safari) | same | ✅ |
| Firefox (desktop) | same | ✅ no script errors; dark-mode emulation not honoured by the harness |

Not tested: a physical iPhone, Samsung Internet, older iOS versions.

## 20. Edge cases

| Case | Result |
|---|---|
| Protected page while signed out | ✅ redirect to Hub sign-in with `next`/`return` |
| Old admin URL as non-admin | ✅ 404 |
| Invalid listing ID / malformed UUID | ✅ 404 |
| Expired listing | ✅ 410 with an honest state |
| Saved home later removed | ✅ shown under "no longer available" |
| Search with nonsense, emoji, script tags, 3,000 chars, negative prices, bad page/sort | ✅ handled |
| Unknown mentor or profile ID | ❌ 200 soft 404 (MIG-050) |
| Unknown suburb | ✅ 404; ambiguous old URL gets a chooser |
| Double-click submit | ✅ buttons disable |
| Refresh mid-wizard | ✅ draft restored |
| Sign-out in another tab / expired session | ✅ Hub re-checks the session; e2e confirms sign-out ends the session |
| Suspended user keeps using legacy APIs | ❌ (MIG-002) |
| Contact message under 10 characters | ❌ generic failure (MIG-065) |

## 21. Competitive product questions

| Feature | Why use Migrent instead | Opportunity |
|---|---|---|
| Search | ID-checked hosts, safety filters (lock, cameras), no account needed | Newcomer-friendly flag; lease-type filter; languages |
| Listing | Honest verification copy, address privacy | Move-in cost, documents needed, transport with mode |
| Rental Profile | Apply once without local history | Let renters show overseas references and visa-agnostic income proof; translated guidance |
| Messaging | Free (Flatmates charges for early messaging) | Scam-pattern warnings (MIG-033); in-language templates |
| Inspections | Self-booking slots | Video inspections for people still overseas |
| Tenancy tools | Rent record and repairs | Bond lodgement reminder with the state authority link |
| Suburb guides | Sourced, honest | "Rooms in this suburb" + alerts; compare two suburbs |
| Mentors | Local guidance | Only after ID checks; or replace with free community Q&A |
| Trust | Verified hosts | Verified reviews from tenancies; visible enforcement ("we removed N scam listings this month") |

**What not to copy:** auctions, agent subscriptions, paid listing boosts, AI "match scores" without substance, or Airbnb-style instant payments for leases.
