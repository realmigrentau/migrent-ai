# MigRent V1 Launch - Template & Fake Data Removal Audit

> Generated: 2026-04-06
> Status: LAUNCH BLOCKER - Must complete before go-live

---

## SECTION 1 - AUDIT STRATEGY

### How to audit the app

The audit works in two passes:

**Pass 1 - Automated search:** Search the codebase for keywords that indicate fake/mock/placeholder data (Section 2 below). Every hit gets triaged as P0/P1/P2.

**Pass 2 - Page-by-page walkthrough:** Open every route in the browser while logged in as both a seeker and an owner. For each page, ask: "If a real user saw this right now, would anything look fake, made-up, or broken?"

### Areas to audit (in priority order)

| Area | Risk Level | Why |
|------|-----------|-----|
| Payments/Billing (settings) | CRITICAL | Shows fake payout history - users will think money is owed |
| Analytics (settings) | CRITICAL | Shows fake revenue, occupancy, search terms - misleads owners |
| Wishlist activity feed | HIGH | Shows fake price drops, owner replies that never happened |
| Testimonials (pricing page) | HIGH | Fake quotes attributed to fake people - trust/legal risk |
| Platform stats (pricing page) | HIGH | "10K+ users", "98% satisfaction" - unverifiable marketing claims |
| Blog content | MEDIUM | Static file, not a database - acceptable for V1 but hardcoded |
| Suburb rent data | MEDIUM | Hardcoded averages that may drift from reality |
| Comparison table (pricing) | LOW | Feature claims vs competitors - marketing, acceptable if true |
| Legal/help/guides content | LOW | Static reference content - acceptable for V1 |
| Earnings calculator (pricing) | LOW | Math-based tool, not fake data - acceptable |
| Resend email default fee | LOW | Hardcoded "$118.00" fallback in email template |

### What is NOT fake (confirmed real data sources)

These components correctly fetch from Supabase/API and need no changes:
- Dashboard MetricsCards, OwnerMetricsCards, SeekerMetrics
- EarningsChart (uses real booking data)
- CommunityHighlights (fetches featured profiles from API)
- RecommendedMatches (fetches from API with match scoring)
- ActivityTimeline (uses real owner activity data)
- Help center (fetches from API)
- Profile settings (fetches from API)
- Notification preferences (fetches from API)
- Search/listings (fetches from API)
- Reviews system (fetches from API)
- Messages system (fetches from API)
- Booking system (fetches from API)

---

## SECTION 2 - CODEBASE SEARCH CHECKLIST

### Exact keywords to search for

Run each of these searches across the entire codebase. Each one found in a non-test file is a potential issue:

**High-priority (likely fake data):**
```
MOCK_
mock_
mockData
PLACEHOLDER_
placeholder_data
FAKE_
fake_
DUMMY_
dummy_
SAMPLE_
sample_
DEMO_
demo_
SEED_
seed_
```

**Content patterns:**
```
Lorem ipsum
lorem
"John "
"Jane "
"Sarah "
"Priya M."
"Ahmed K."
"Wei C."
example.com
test@
@test.com
123 Main
4242 4242
sk_test_
pk_test_
```

**Code smell patterns:**
```
// TODO
// FIXME
// HACK
// XXX
Coming Soon
coming_soon
hardcoded
hard-coded
// In prod:
// In production:
setTimeout(() => set   (fake async)
```

**Static array patterns (check if they should be database queries):**
```
const testimonials =
const stats =
const MOCK_
const PLACEHOLDER_
const reviews =
const notifications =
const payouts =
const transactions =
```

### Actual findings from this audit

| Search Term | File | Line | Status |
|-------------|------|------|--------|
| `MOCK_LISTINGS` | `components/settings/AnalyticsTab.tsx` | 22 | P0 - Fake analytics |
| `MOCK_SEARCH_TERMS` | `components/settings/AnalyticsTab.tsx` | 46 | P0 - Fake search data |
| `MOCK_PAYOUTS` | `components/settings/PaymentsTab.tsx` | 26 | P0 - Fake payment history |
| `MOCK_ACTIVITIES` | `hooks/useWishlist.ts` | 295 | P0 - Fake activity feed |
| `PLACEHOLDER_LISTINGS` | `hooks/useWishlist.ts` | 123 | P1 - Unused but present |
| `testimonials` | `components/pricing/TestimonialCarousel.tsx` | 11 | P1 - Fake testimonials |
| `stats` (10K+ users) | `components/pricing/TestimonialCarousel.tsx` | 38 | P1 - Unverifiable claims |
| `$99/year` | `components/settings/PaymentsTab.tsx` | 188 | P0 - Hardcoded billing |
| `$19 one-time` | `components/settings/PaymentsTab.tsx` | 196 | P0 - Hardcoded billing |
| `.. .. 4921` | `components/settings/PaymentsTab.tsx` | 68 | P0 - Fake bank account |
| `22 669 566 941` | `components/settings/PaymentsTab.tsx` | 220 | P0 - Hardcoded ABN |
| `"$118.00"` | `lib/resend-client.ts` | 112 | P1 - Hardcoded email fee |
| `Coming Soon` | `components/settings/PaymentsTab.tsx` | 230 | P2 - Acceptable |
| `+12` (fake seekers) | `components/settings/AnalyticsTab.tsx` | 296 | P0 - Fake user count |
| `Mock` prefix | `pages/features.tsx` | 17+ | P2 - Visual illustrations only |
| `blogPosts` static | `data/blogPosts.ts` | all | P2 - Static content, acceptable for V1 |
| `suburbs` static | `data/suburbs.ts` | all | P2 - Reference data, acceptable for V1 |

---

## SECTION 3 - MIGRENT PRIORITY TABLE

### P0 - Must fix before launch (user-facing fake data)

| Area | What is fake | Why it is risky | Real behaviour | Safe for V1? |
|------|-------------|----------------|----------------|--------------|
| Settings > Analytics | MOCK_LISTINGS array with fake "Sydney Loft - Bondi" etc, fake revenue ($1200, $780, $520), fake occupancy, fake ratings | Owner sees earnings they never made. Could cause support tickets or legal issues | Show real listing stats from Supabase or empty state: "Analytics will appear once your listings get views" | NO |
| Settings > Analytics | MOCK_SEARCH_TERMS with fake search counts | Owner thinks people are searching for their area when they are not | Hide section entirely until real search analytics exist, or show empty state | NO |
| Settings > Analytics | Fake "Most Active Seekers" with "+12" viewers | Owner thinks 17 seekers viewed their listings | Hide section or show real view counts from analytics | NO |
| Settings > Analytics | Fake revenue sparkline chart with hardcoded values [45,62,58,75,82,90] | Displays fake revenue trend | Remove or replace with real earnings chart (EarningsChart.tsx pattern already exists) | NO |
| Settings > Payments | MOCK_PAYOUTS array showing $1200, $950, $1100 completed payouts | User thinks they have been paid money they never received | Show empty state: "Your payout history will appear here once you receive payments" | NO |
| Settings > Payments | Hardcoded bank account ".. .. 4921" shown as "Primary" and "Verified" | User thinks a bank account is connected when it is not | Show "No payout method connected" with button to set up Stripe Connect | NO |
| Settings > Payments | Hardcoded "$99/year - Paid Jan 2026" and "$19 one-time - Paid" | User thinks they paid for subscriptions they did not purchase | Show actual subscription status from Stripe, or hide billing section until payments are live | NO |
| Settings > Payments | Hardcoded ABN "22 669 566 941" shown as "Valid" | Displays someone else's ABN as the user's own | Show empty ABN field with input, or hide tax section until feature is ready | NO |
| Wishlist | MOCK_ACTIVITIES array with fake price drops, owner replies | Seeker sees fake notifications about listings they saved | Show real activities or empty state: "Activity on your saved listings will appear here" | NO |

### P1 - Should fix before launch (trust/credibility risk)

| Area | What is fake | Why it is risky | Real behaviour | Safe for V1? |
|------|-------------|----------------|----------------|--------------|
| Pricing page | Fake testimonials from "Priya M.", "Ahmed K.", "Sarah L.", "Wei C." | If someone Googles these names and finds nothing, trust is destroyed. Potential ACCC issue for fake endorsements | Remove testimonials section entirely until real reviews exist, or replace with verifiable quotes | NO |
| Pricing page | Stats: "98% host satisfaction", "4.9/5 rating", "10K+ users", "48hrs avg match" | Unverifiable claims. If a journalist or competitor checks, this is a liability | Remove stats bar or replace with real counts from database (total users, total listings, avg response time) | NO |
| Wishlist hook | PLACEHOLDER_LISTINGS object with 7 fake listings (Sarah, Mike, Emma, James, Priya, Liam, Alex) | Dead code but still in the bundle. If accidentally referenced, fake listings appear | Delete the entire PLACEHOLDER_LISTINGS object | NO |
| Email template | Hardcoded "$118.00" as default totalFees | Every booking approval email shows $118 unless overridden | Remove the default - require the actual amount to be passed | NO |

### P2 - Acceptable for V1 (static content, not fake data)

| Area | What it is | Why it is acceptable | Action needed |
|------|-----------|---------------------|---------------|
| Blog | Static blog posts in blogPosts.ts | Real editorial content, just stored in code instead of CMS. Content is accurate and helpful | None for V1. Move to CMS post-launch |
| Help/KB | Static articles in supportKB.ts | Real help content. Standard practice for V1 | None |
| Guides | Static guides in guidesContent.ts | Real educational content | None |
| Rental laws | Static data in rentalLaws.ts | Real legal reference data | None |
| Suburbs | Static rent averages in suburbs.ts | Reference data. Should be updated quarterly | None for V1 |
| Stations | Seed data in migration 027 | Real Sydney Metro/train station coordinates | None |
| Features page | Mock UI illustrations (MockAIMatching etc) | Visual wireframe illustrations showing how features work - not pretending to be real data | None |
| Comparison table | Feature comparison vs Gumtree/Facebook/Domain | Marketing comparison - acceptable if claims are true | Verify each claim is accurate |
| Earnings calculator | Slider-based projections | Math tool, clearly interactive, not presenting fake data | None |
| Pricing FAQ | Static FAQ | Real business information | Verify accuracy |
| "Coming Soon" badge | Invoice template feature | Honestly labelled as upcoming - not deceptive | None |
| API docs | Example payloads with example.com emails | Standard API documentation practice | None |

---

## SECTION 4 - REPLACEMENT RULES

### For each area, what to replace fake content with:

**Reviews:** Already using real Supabase data. No changes needed. Empty state already exists: "No reviews yet."

**Notifications:** Already using real Supabase data via useNotifications hook. No changes needed.

**Settings - Analytics tab:** Replace entire component with production-safe version that either fetches real stats or shows empty states.

**Settings - Payments tab:** Replace mock payouts with empty state. Replace hardcoded bank/billing/ABN with real Stripe Connect status or "not connected" state.

**Owner calculators (pricing page):** Already uses real math via useCalculator hook. No changes needed.

**Search filters:** Already fetches from real API. No changes needed.

**Listing edit page:** Already uses real Supabase data. No changes needed.

**Legal acceptance:** Already tracked via migration 033. No changes needed.

**Verification status:** Already fetches real status from API. No changes needed.

**Help center:** Already fetches from API. No changes needed.

**Contact page:** Real form submission. Business details are real (migrentau@gmail.com). No changes needed.

**Blogs/guides:** Static content is real editorial content. Acceptable for V1.

**AI assistant:** Not found in codebase as a standalone feature. Search/matching uses real API.

**Pricing page - testimonials:** Remove entirely or replace with real user quotes.

**Pricing page - stats:** Remove or replace with real database counts.

**Legal pages:** Real content. No changes needed.

**API docs:** Example payloads use example.com - standard practice. No changes needed.

**Wishlist activity feed:** Replace MOCK_ACTIVITIES with empty state.

**Email fee default:** Remove hardcoded "$118.00" - require real amount.

---

## SECTION 5 - PRODUCTION-SAFE EMPTY STATES

### Design specifications for each empty state

**No reviews:**
```
Icon: Star (outline)
Heading: "No reviews yet"
Body: "Reviews will appear here after completed stays. Be the first to book and share your experience."
CTA: none (or "Browse listings" for seekers)
```

**No notifications:**
```
Icon: Bell (outline)
Heading: "You're all caught up"
Body: "Notifications about your bookings, messages, and listings will appear here."
CTA: none
```

**No payment history:**
```
Icon: Receipt (outline)
Heading: "No payment history yet"
Body: "Your payout history will appear here once you receive your first booking payment."
CTA: "Set up payouts" (links to Stripe Connect setup)
```

**No matches / no recommendations:**
```
Icon: Sparkles (outline)
Heading: "No recommendations yet"
Body: "Complete your profile to get personalised room matches based on your preferences, budget, and location."
CTA: "Complete Profile" button
```

**No listings (owner):**
```
Icon: Home (outline)
Heading: "No listings yet"
Body: "List your first room to start receiving booking requests from verified seekers."
CTA: "List a Room" button (links to /owner/listings/new)
```

**No messages:**
```
Icon: MessageSquare (outline)
Heading: "No messages yet"
Body: "When you message a host or receive enquiries, your conversations will appear here."
CTA: "Browse rooms" (for seekers) or none (for owners)
```

**No help articles (search with no results):**
```
Icon: Search (outline)
Heading: "No results found"
Body: "Try a different search term or browse our help categories below."
CTA: none (categories shown below)
```

**No saved wishlist:**
```
Icon: Heart (outline)
Heading: "No saved rooms yet"
Body: "Tap the heart icon on any listing to save it here. Compare rooms, track price drops, and organise your search."
CTA: "Start searching" button (links to /seeker/search)
```

**No analytics data (owner):**
```
Icon: BarChart3 (outline)
Heading: "Analytics coming soon"
Body: "Once your listings receive views and bookings, you will see performance data, search trends, and occupancy stats here."
CTA: none
```

**No payout method connected:**
```
Icon: Building2 (outline)
Heading: "No payout method connected"
Body: "Connect your bank account through Stripe to receive booking payments securely."
CTA: "Set up payouts" button
```

---

## SECTION 6 - IMPLEMENTATION PLAN

### Stage 1: P0 - High-risk fake data removal (Do first)

**Task 1.1:** Replace AnalyticsTab.tsx with production-safe empty state
- Remove MOCK_LISTINGS, MOCK_SEARCH_TERMS, fake sparkline, fake seekers
- Replace with "Analytics coming soon" empty state

**Task 1.2:** Replace PaymentsTab.tsx fake data with real empty states
- Remove MOCK_PAYOUTS array
- Replace hardcoded bank account with "No payout method connected"
- Replace hardcoded billing with conditional display (show only if Stripe subscription exists)
- Replace hardcoded ABN with empty/editable field

**Task 1.3:** Remove MOCK_ACTIVITIES from useWishlist.ts
- Replace with empty array
- Remove PLACEHOLDER_LISTINGS dead code

### Stage 2: P1 - Trust/credibility fixes

**Task 2.1:** Remove or replace TestimonialCarousel.tsx content
- Option A (recommended): Remove fake testimonials and stats entirely
- Option B: Replace stats with real database counts

**Task 2.2:** Fix email template default fee
- Remove hardcoded "$118.00" from resend-client.ts

### Stage 3: QA and smoke tests

After each stage, test these flows:

**Owner flow:**
- [ ] Sign in as owner
- [ ] Go to Settings > Analytics - should show empty state, no fake data
- [ ] Go to Settings > Payments - should show empty state, no fake bank/billing
- [ ] Go to Dashboard - should show real data or empty states
- [ ] Go to Pricing page - should have no fake testimonials/stats

**Seeker flow:**
- [ ] Sign in as seeker
- [ ] Go to Wishlist - activity feed should be empty or show real data
- [ ] Go to Settings > Payments - should show appropriate empty state
- [ ] Go to Dashboard - should show real data or empty states

**Public flow:**
- [ ] Visit Pricing page - no fake testimonials or unverifiable stats
- [ ] Visit Blog - content displays correctly
- [ ] Visit Help center - content displays correctly

### Stage 4: Launch gate checks

- [ ] Search codebase for "MOCK_" - zero results in production components
- [ ] Search codebase for "PLACEHOLDER_" data arrays - zero results
- [ ] Search codebase for "FAKE_" or "DUMMY_" - zero results
- [ ] All empty states render correctly
- [ ] No hardcoded dollar amounts pretending to be real earnings
- [ ] No fake user names, bank accounts, or ABNs
- [ ] No unverifiable platform stats (or replaced with real counts)

---

## SECTION 7 - CODE CHANGES (see implementation below)

Files to change:
1. `frontend/components/settings/AnalyticsTab.tsx` - Full rewrite
2. `frontend/components/settings/PaymentsTab.tsx` - Full rewrite
3. `frontend/hooks/useWishlist.ts` - Remove mock data
4. `frontend/components/pricing/TestimonialCarousel.tsx` - Full rewrite
5. `frontend/lib/resend-client.ts` - One-line fix

---

## SECTION 8 - FINAL LAUNCH CHECKLIST

### Fake data removal
- [ ] AnalyticsTab.tsx - no MOCK_LISTINGS, no MOCK_SEARCH_TERMS, no fake sparkline, no fake seekers
- [ ] PaymentsTab.tsx - no MOCK_PAYOUTS, no fake bank "4921", no hardcoded "$99/year", no fake ABN
- [ ] useWishlist.ts - no MOCK_ACTIVITIES, no PLACEHOLDER_LISTINGS
- [ ] TestimonialCarousel.tsx - no fake testimonials, no unverifiable platform stats
- [ ] resend-client.ts - no hardcoded "$118.00" default fee

### Search verification (run these and confirm zero results)
- [ ] `grep -r "MOCK_" frontend/components/ frontend/hooks/` returns nothing
- [ ] `grep -r "PLACEHOLDER_LISTINGS" frontend/` returns nothing
- [ ] `grep -r "4921" frontend/` returns nothing
- [ ] `grep -r "22 669 566 941" frontend/` returns nothing
- [ ] `grep -r "Priya M\." frontend/` returns nothing
- [ ] `grep -r "Ahmed K\." frontend/` returns nothing

### Empty states
- [ ] Settings > Analytics shows "Analytics coming soon" (not fake charts)
- [ ] Settings > Payments shows "No payouts yet" (not fake payment history)
- [ ] Settings > Payments shows "Set up payouts" (not fake connected bank)
- [ ] Wishlist activity feed shows empty state (not fake price drops)
- [ ] All empty states have helpful text and appropriate icons

### Page-by-page walkthrough (logged in as owner)
- [ ] Dashboard - real data or empty states only
- [ ] Settings > Profile - real profile data
- [ ] Settings > Analytics - empty state (no fake data)
- [ ] Settings > Payments - empty state (no fake data)
- [ ] Settings > Notifications - real preferences
- [ ] Settings > Security - real data
- [ ] Listings page - real listings or "no listings" state
- [ ] Messages - real messages or empty state

### Page-by-page walkthrough (logged in as seeker)
- [ ] Dashboard - real data or empty states only
- [ ] Search - real listings from database
- [ ] Wishlist - real saved items or empty state
- [ ] Messages - real messages or empty state
- [ ] Settings - all tabs show real data or proper empty states

### Public pages
- [ ] Pricing page - no fake testimonials or unverifiable stats
- [ ] Features page - visual illustrations only (acceptable)
- [ ] Blog - real content (static file is fine)
- [ ] Help center - real content
- [ ] Contact - real business details
- [ ] Legal pages - real content

### Technical checks
- [ ] No `sk_test_` or `pk_test_` Stripe keys in production env
- [ ] No `localhost:` URLs in production env
- [ ] Environment variables properly set for production
- [ ] All API endpoints return real data (not mocked)

---

## FIRST 10 FILES TO AUDIT (in order)

1. `frontend/components/settings/AnalyticsTab.tsx` - P0 - Full fake analytics dashboard
2. `frontend/components/settings/PaymentsTab.tsx` - P0 - Fake payouts, bank, billing, ABN
3. `frontend/hooks/useWishlist.ts` - P0 - Mock activities + dead placeholder listings
4. `frontend/components/pricing/TestimonialCarousel.tsx` - P1 - Fake testimonials and stats
5. `frontend/lib/resend-client.ts` - P1 - Hardcoded email fee default
6. `frontend/data/blogPosts.ts` - P2 - Static blog (verify content accuracy)
7. `frontend/data/suburbs.ts` - P2 - Static rent data (verify accuracy)
8. `frontend/data/supportKB.ts` - P2 - Static help KB (verify accuracy)
9. `frontend/pages/pricing.tsx` - P2 - Verify all pricing claims are accurate
10. `frontend/pages/contact.tsx` - P2 - Verify business details are current
