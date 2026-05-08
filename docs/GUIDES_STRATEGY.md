# MigRent Guides - Content & UX Strategy

Last updated: 2026-05-09
Owner: Content + Product
Status: V1 launch plan

---

## SECTION 1 - GUIDE CONTENT STRATEGY

**Why generic support content fails.** Most rental help content is written for a generic Australian renter who already knows how the system works. Migrants and international students do not. They arrive with: limited rental history, no Australian bank statements, unclear bond expectations, language friction, fear of being scammed, and 4-6 weeks to lock down housing before classes or work start. Generic content treats them like locals. It buries the answer under "depends on your state". It uses jargon (REA, bond, NCAT, RTA) without translating it. It avoids legal topics out of caution and ends up being unhelpful exactly when stakes are highest.

**What makes guide content truly helpful for migrants/students.**
1. Written for someone who has never rented in Australia before, not someone refreshing knowledge.
2. Concrete and specific: actual document names, actual dollar ranges, actual timeframes.
3. Honest about risk - says "this is a scam pattern" instead of dancing around it.
4. Translates Australian terms (bond, condition report, lease, agent, share house) on first use.
5. Linked to the official source (Fair Trading, NCAT, ATO, Home Affairs) so users can verify.
6. Acknowledges visa context - student vs working holiday vs 482 vs PR have different cashflow and different risks.
7. Mobile-first: most newcomers read on a phone in transit or in a hostel.

**How guides differ from other content.**
- **Blog posts** - timely, opinion, narrative. Drop-off is fine.
- **FAQs** - 1-2 sentence answers to a specific known question.
- **Legal pages** - terms, privacy, formal policy. Written by legal, not for browsing.
- **Guides** - evergreen, structured walkthroughs. Designed to be the *first place* a confused user lands and the *last place* they need to look. They sit between FAQ (too short) and legal (too dense).

**Balancing practical, warm, and professional.**
- Practical = checklists, exact amounts, screenshots if relevant, a "what to do right now" line in every guide.
- Warm = "you", "we", short sentences, no condescension. Acknowledge that this is stressful. Use names of real Australian tribunals and agencies, not abbreviations alone.
- Professional = no emoji-stuffed copy, no slang, no "OMG", no fake urgency. One clean voice. Disclaimers where the topic touches law.

---

## SECTION 2 - GUIDE EXPERIENCE DESIGN

**Page structure (top to bottom).**
1. Breadcrumb (Guides > Category > Title).
2. Hero block: gradient background, title, 1-line description, difficulty pill, read time, last updated badge, "Who this is for" line.
3. Quick answer box (TL;DR in 2-3 sentences) - sticky on mobile.
4. Why it matters (1-2 sentences).
5. Step-by-step body sections, each numbered, each scannable.
6. Inline callouts (Tip, Warning, Info, Success) where they add value, not as decoration.
7. Checklist card (downloadable / printable summary).
8. Official resources (links to Fair Trading, ATO, Home Affairs, etc.).
9. Disclaimer when topic touches law, money, or visa.
10. Related guides (3 max).
11. "Was this helpful?" feedback row.

**Sidebar / TOC.** Sticky table of contents on desktop, top-anchored "Jump to section" dropdown on mobile. Highlights active section as user scrolls.

**Progress / read-time.** Read-time on hero (e.g. "5 min read"). A thin top progress bar shows scroll progress through the guide. No vanity progress percentages.

**Callouts.** Four variants only:
- **Tip** (slate/brand) - useful but optional.
- **Info** (blue) - explainer or context.
- **Warning** (amber) - common mistake or risk.
- **Critical** (red) - scam, illegal, do-not-do.

**Checklists.** Card-style with circular check icons. Each item is one action. Print-friendly via system print stylesheet (no separate PDF pipeline at launch).

**Step sections.** Numbered, with the number rendered as a coloured circle that matches the guide's gradient. Title, paragraphs, optional sub-checklist, optional callout per step.

**Related guides.** 3 cards max, only ones contextually related, not a dump of all other guides.

**Visuals / illustrations / icons.** Lucide icons inline at the section level. No stock photography. No mascots. Coloured gradient hero strip per guide gives each guide its own personality without needing custom illustration.

**Download / print / save.**
- Print: native browser print works because content is semantic HTML. Add a `print:hidden` class to nav.
- Save: signed-in users get a "Save guide" button that bookmarks under their dashboard. No PDF generation at launch.

---

## SECTION 3 - CONTENT TYPES

| Format | Best for | Length |
|---|---|---|
| **Step-by-step guide** | Process with a clear order (book a room, file a dispute) | 5-7 steps, 4-7 min read |
| **Newcomer explainer** | Concepts a local would already know (what is a bond, what is a condition report) | 800-1200 words |
| **Checklist** | Pre-arrival, first week, before signing, before moving out | 8-15 line items |
| **City/state guide** | Suburb-specific or state-specific rules (NSW vs VIC bond rules differ) | 6-9 min read, comparison tables |
| **Rental process guide** | The full path from search to move-out | Long, sectioned, TOC-heavy |
| **Safety guide** | Scams, suspicious listings, in-person inspections, personal safety | Direct, warning-heavy |
| **Budgeting guide** | Weekly rent, bills, bond, upfront costs, ongoing costs | Spreadsheet-style with example numbers |
| **Document prep guide** | What to gather, what counterparts accept | Tagged by visa subclass |
| **Inspection guide** | What to look for at a viewing or on arrival | Photo checklist |
| **Moving-in guide** | First-week tasks (utilities, condition report, neighbour intros) | Calendar-style |

---

## SECTION 4 - MIGRANT/STUDENT GUIDE TOPICS (RANKED BY USER VALUE)

Ranked by: stakes (financial / legal / safety) x frequency of need x time-to-first-rent-decision.

**Tier 1 - launch must-haves (top 10)**
1. How to rent in Australia as a new migrant (the master guide)
2. Documents you need to rent in Australia
3. How rental bond works (and how to get it back)
4. How to spot and avoid rental scams
5. How to inspect a room or house (online and in person)
6. Renter rights basics for migrants and students
7. Understanding rent, bills, and what is included
8. Questions to ask before you book
9. First week in Australia: housing checklist
10. What to do if a listing or host feels suspicious

**Tier 2 - launch+1 (next 10)**
11. Prepare your MigRent profile for better matches
12. Moving-in day checklist
13. Move-out and bond-return checklist
14. Budgeting for rent on a student visa
15. Budgeting for rent on a working holiday visa
16. Sharing a house: living-with-strangers etiquette
17. Setting up bills, internet, and utilities
18. What to do if your host breaks the rules
19. Understanding the condition report
20. Renting in Sydney vs Melbourne vs Brisbane (suburb cost orientation)

**Tier 3 - V2 ideas**
- Renting with a partner or family on a single visa
- Renting on bridging visas
- LGBTQ+ friendly housing in Australia
- Female-only and culture-aligned share houses
- Disability access and accessible listings
- Rural and regional rentals (working holiday extension context)
- Insurance basics for renters
- Tax considerations for international student renters
- Moving between states mid-stay
- Pets in rentals

---

## SECTION 5 - ARTICLE STRUCTURE TEMPLATE

```
TITLE (clear, plain English, no clever puns)

WHO THIS IS FOR (1 line)
e.g. "International students arriving in Australia for the first time."

WHY IT MATTERS (1-2 lines)
e.g. "Bond is usually the largest single payment you make. Knowing how it works
protects up to four weeks of rent."

QUICK ANSWER / TL;DR (3 sentences max)

STEP-BY-STEP SECTIONS
- Section 1: Title
  - 1-3 short paragraphs
  - Optional checklist
  - Optional callout (Tip / Warning / Info / Critical)
- Section 2: Title
  - ...
- (continue)

COMMON MISTAKES (3-6 bullets)

OFFICIAL RESOURCES
- NSW Fair Trading: link
- VIC Consumer Affairs: link
- Home Affairs visa info: link
- (only sources directly relevant to this guide)

RELATED GUIDES
- 3 max

LAST UPDATED: YYYY-MM-DD

DISCLAIMER (if legal / visa / money)
"This guide is general information, not legal advice. Tenancy law differs by state.
For your specific situation, contact your state's Fair Trading body or a free
community legal centre."
```

---

## SECTION 6 - VISUAL STYLE

**Color accents.** Each guide owns one gradient (blue, rose, green, purple, amber, indigo, red, emerald, teal). The gradient appears on the hero, the section number circles, and the active TOC item. The body remains slate text on white/dark. Color is *one accent per guide*, not rainbow.

**Section blocks.** White card (dark mode: slate-900) with a 1px border. Numbered circle in the gradient. Generous whitespace (vertical rhythm of `mb-12` between sections).

**Icons.** Lucide icons. One icon per section if helpful; never multiple icons per heading.

**Cards.** Rounded `rounded-2xl`, subtle border, no heavy shadows.

**Checklists.** Round check circles. Brand-coloured checkmark when complete state is shown. Empty state is a hollow circle with a slate border.

**Callouts.** Left coloured stripe (4px) + tinted background (10% of variant color) + icon + label + body. Same component, four variants. Never stacked more than two in a row.

**Spacing and typography.**
- Body: 16px / 1.6 line-height.
- Headings: H1 36-48px, H2 22-24px, H3 18-20px.
- Max content width: ~720px on desktop reading column. Sidebar/TOC outside that.
- Mobile: 18px body, generous padding `px-4`.

**Keeping it professional.**
- No emoji stuffing in headings.
- No drop shadows on every element.
- No more than 3 colors in a single block.
- No animations on every scroll - reserve motion for hero entry and TOC active state.

---

## SECTION 7 - FRONTEND IMPLEMENTATION

**Stack stays the same.** Next.js Pages Router + Tailwind + shadcn primitives. No new dependencies.

**Routes.**
- `/guides` - index, with category filter pills and search.
- `/guides/[id]` - individual guide. ID is a slug (e.g. `rent-as-new-migrant`).
- `/help` - existing Help Center, links into guides on relevant categories.

**Content source.** `frontend/data/guidesContent.ts` - typed array. No CMS at launch. Editable by anyone with repo access; review via PR.

**Components (under `frontend/components/content/`).**
- `GuideHero` - title, gradient, badges, last updated.
- `GuideTOC` (existing `TableOfContents`) - sticky sidebar.
- `StepBlock` - numbered section wrapper with gradient circle.
- `Callout` - one component, variants `tip` / `info` / `warning` / `critical`.
- `ChecklistCard` - title + array of items, optional check state.
- `ResourceLinks` - external official links with domain badge.
- `RelatedGuides` - 3-card grid using existing data.
- `LastUpdatedBadge` - small pill on hero.
- `QuickAnswer` - styled TL;DR block at top of guide.

**How guides connect to Help Center and search.**
- Help Center category pages link to relevant guides.
- A single search index combines `helpData.ts` articles + `guidesContent.ts` guides. The Help search box on `/help` already handles this; we extend it to include guide titles + section titles + keywords.
- Guide pages get a "Need more help?" footer that links to `/contact` and the Help Center category.

---

## SECTION 8 - CONTENT GOVERNANCE

**Adding a new guide.**
1. Open a PR that adds an entry to `guidesContent.ts`.
2. Use the template (Section 5).
3. Set `lastUpdated` to today's date.
4. Add `disclaimer` if topic is legal, money, or visa.
5. Add at least one `officialResource` link if topic touches law.
6. Add to the appropriate category.

**Updating stale content.**
- Every guide displays `lastUpdated`.
- Quarterly review: any guide >6 months old is reviewed by content owner.
- Any guide referencing dollar amounts, visa rules, or tenancy law is reviewed every 6 months minimum.

**Ownership.**
- Content owner (you) approves all new guides.
- Legal-touching guides (visa, bond, disputes, tenancy rights) get a second-pair-of-eyes review before publish.
- Deletion requires a redirect from old slug to closest replacement.

**Legal / source checks.**
- Every claim about Australian law links to the relevant Fair Trading body or government source.
- No "according to a study" without a link.
- No "MigRent guarantees" - use "MigRent's policy is".

**Update timestamps.**
- `lastUpdated` field is mandatory. Rendered visibly on the page.
- `firstPublished` optional, used for freshness signals only.

**Migrating from weak old guides.**
- Each old guide is replaced not deleted. The old slug stays and renders the new content with a "Updated" badge for 90 days.
- If a guide is being merged into another, add a redirect (in `next.config` `redirects()`) from old slug to new.

**Avoiding duplication.**
- Single source of truth: `guidesContent.ts`.
- One topic = one guide. If two cover the same ground, merge. Use `relatedGuides` to cross-link.
- FAQs in `helpData.ts` should defer to guides for anything longer than 2 sentences.

---

## SECTION 9 - V1 GUIDE PLAN

**Top 10 must-have for V1 (ship at launch).**
1. How to rent in Australia as a new migrant
2. Documents you need to rent in Australia
3. How rental bond works (and how to get it back)
4. How to spot and avoid rental scams
5. How to inspect a room or house
6. Renter rights basics
7. Understanding rent, bills, and what is included
8. Questions to ask before you book
9. First week in Australia housing checklist
10. What to do if a listing or host feels suspicious

**Next 10 (launch+1, within 8 weeks).**
11. Prepare your MigRent profile for better matches
12. Moving-in day checklist
13. Move-out and bond-return checklist
14. Budgeting for rent on a student visa
15. Budgeting for rent on a working holiday visa
16. Sharing a house: living-with-strangers etiquette
17. Setting up bills, internet, and utilities
18. What to do if your host breaks the rules
19. Understanding the condition report
20. City orientation: Sydney vs Melbourne vs Brisbane vs Perth

**V2 (later).** See Tier 3 in Section 4.

---

## SECTION 10 - QA CHECKLIST

Before any guide is marked live, all of these must be true:

- [ ] Title is plain English, under 65 characters
- [ ] "Who this is for" line is present
- [ ] Quick answer / TL;DR is 3 sentences max
- [ ] Each section has a clear heading
- [ ] No section paragraph exceeds 5 lines on mobile
- [ ] At least one checklist or callout per guide
- [ ] No more than 3 callouts per guide (avoid noise)
- [ ] Every legal claim links to an official source
- [ ] Disclaimer appears if topic is legal / money / visa
- [ ] `lastUpdated` is set to today
- [ ] Related guides resolve to real guide IDs
- [ ] Mobile reading test: scroll the guide on a phone, no horizontal scroll, no overlapping text
- [ ] Print test: print preview shows clean layout, no nav, no sidebar
- [ ] No duplicate or near-duplicate guide already exists
- [ ] No empty placeholder sections
- [ ] No "coming soon" or "TBD" content
- [ ] Translates Australian-specific terms on first use (bond, condition report, REA, agent)
- [ ] Search: typing the guide's main topic returns it on `/help` search

---

## APPENDIX A - 20 BEST FIRST GUIDE TITLES

1. How to Rent in Australia as a New Migrant
2. Documents You Need to Rent in Australia
3. Rental Bond in Australia: How It Works and How to Get It Back
4. How to Spot a Rental Scam (and What to Do Next)
5. How to Inspect a Room or House Before You Book
6. Renter Rights for Migrants and International Students
7. Rent, Bills, and What "All Inclusive" Really Means
8. Questions to Ask Before You Book a Room
9. Your First Week in Australia: Housing Checklist
10. A Listing Feels Off: How to Report It Safely
11. How to Build a MigRent Profile That Hosts Trust
12. Moving-In Day: Step-by-Step Checklist
13. Moving Out: How to Get Your Full Bond Back
14. Renting on a Student Visa: Budget and Rules
15. Renting on a Working Holiday Visa: Short Stays and Regional Work
16. Living in a Share House: Etiquette for International Students
17. Setting Up Internet, Power, Gas, and Water
18. When Your Host Breaks the Rules: Your Options
19. The Condition Report: Why It Protects Your Bond
20. Sydney, Melbourne, Brisbane, Perth: Where Should You Land?

---

## APPENDIX B - GUIDE PAGE WIREFRAME (TEXT)

```
+----------------------------------------------------------------+
| Guides > Category > [Guide Title]            <- breadcrumb     |
+----------------------------------------------------------------+
|                                                                |
|  +----------------------------------------------------------+  |
|  |  [icon]  [Beginner] [5 min] [Updated 2026-05-09]         |  |
|  |  How to Rent in Australia as a New Migrant               |  |
|  |  One line description of the guide.                      |  |
|  |  Who this is for: international students and new arrivals|  |
|  +----------------------------------------------------------+  |
|                                                                |
|  +----------------------------------+  +-------------------+   |
|  | Quick answer (TL;DR)             |  |  ON THIS PAGE     |   |
|  | 2-3 sentences.                   |  |  - Step 1         |   |
|  +----------------------------------+  |  - Step 2  <-active|  |
|                                        |  - Step 3         |   |
|  Why it matters                        |  - Checklist      |   |
|  1-2 sentences.                        |  - Resources      |   |
|                                        +-------------------+   |
|  (1)  Step One Title                                           |
|       Body paragraph.                                          |
|       Body paragraph.                                          |
|       [TIP callout]                                            |
|                                                                |
|  (2)  Step Two Title                                           |
|       Body paragraph.                                          |
|       [WARNING callout]                                        |
|                                                                |
|  (3)  Step Three Title                                         |
|       Body paragraph.                                          |
|       [Checklist Card]                                         |
|         [ ] Item 1                                             |
|         [ ] Item 2                                             |
|         [ ] Item 3                                             |
|                                                                |
|  Common mistakes                                               |
|  - Mistake 1                                                   |
|  - Mistake 2                                                   |
|                                                                |
|  Official Resources                                            |
|  - NSW Fair Trading (link)                                     |
|  - Home Affairs (link)                                         |
|                                                                |
|  Related Guides                                                |
|  [card] [card] [card]                                          |
|                                                                |
|  [Disclaimer]                                                  |
|                                                                |
|  Was this helpful?  [Yes] [No]                                 |
+----------------------------------------------------------------+
```

---

## APPENDIX C - REUSABLE CONTENT TEMPLATE (PASTE INTO `guidesContent.ts`)

```ts
{
  id: "kebab-case-slug",
  title: "Plain-English Title Under 65 Chars",
  description: "One sentence description used in cards and meta.",
  whoFor: "Who this is for (one line).",
  whyItMatters: "Why this matters (one or two sentences).",
  quickAnswer: "Three-sentence TL;DR. Be direct. Tell them the answer.",
  icon: "M3 12...", // lucide-equivalent SVG path or use icon name
  gradient: "from-blue-500 to-indigo-500",
  color: "text-blue-500",
  bgColor: "bg-blue-50 dark:bg-blue-500/10",
  difficulty: "Beginner", // | "Intermediate" | "Advanced"
  readTime: "5 min read",
  category: "seeker", // | "owner" | "legal" | "money" | "safety"
  lastUpdated: "2026-05-09",
  disclaimer: "Optional. Use for legal/money/visa topics.",
  sections: [
    {
      id: "step-one",
      title: "Step One Title",
      content: ["Paragraph one.", "Paragraph two."],
      tip: "Optional one-line tip.",
      callouts: [
        { variant: "warning", title: "Heads up", body: "Be careful of X." }
      ],
      checklist: [
        "Action 1",
        "Action 2",
        "Action 3"
      ],
    },
    // ... more sections
  ],
  commonMistakes: [
    "Mistake 1.",
    "Mistake 2.",
  ],
  officialResources: [
    { label: "NSW Fair Trading", url: "https://www.nsw.gov.au/...", region: "NSW" },
  ],
  relatedGuides: ["other-slug-1", "other-slug-2"],
}
```

---

## APPENDIX D - BIGGEST GUIDE-CONTENT MISTAKES TO REMOVE

1. **Vague reassurance.** "MigRent has your back" with no detail. Replace with the actual mechanism.
2. **Marketing voice.** "Our world-class platform" - cut. Migrants want facts, not sales copy.
3. **Stat claims with no source.** "85% occupancy" "60% more bookings" - either link to the data, present as a sample example, or remove.
4. **Treating legal topics as decoration.** A real disclaimer + one official link beats five sentences of hedging.
5. **Generic Australian advice.** State law differs. Either say "varies by state, see your state's Fair Trading" or cover NSW/VIC/QLD specifically.
6. **No visa context.** A 482 holder and a 500 holder have different cashflow and different risks. Acknowledge it.
7. **Walls of text.** No paragraph longer than 4 lines on mobile.
8. **Empty checklist boxes that do nothing.** Either make them functional with local-storage state, or use them as visual structure only.
9. **"Coming soon" placeholders.** Either ship the guide or remove it from nav.
10. **Duplicate FAQ + guide content.** FAQ should be one sentence; guide should be the full answer. They should not say the same thing.
11. **Stock-photo aesthetics.** Replace with the gradient + icon system.
12. **No last-updated date.** A guide without a date looks abandoned.
13. **Dark patterns.** No "you must verify to read this guide". Guides are public.
14. **Translated phrases that don't translate.** "Bond" in English first, then equivalent in context if needed - not the other way around.
15. **Burying the answer.** TL;DR goes at the top, not after a 600-word intro.
