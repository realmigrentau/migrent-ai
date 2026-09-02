# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.ts >> move-in date >> homepage move-in date reaches the search URL and filters results
- Location: tests/e2e/search.spec.ts:57:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /city=Kellyville/
Received string:  "http://127.0.0.1:3100/seeker/search?suburb=Kellyville&checkIn=2026-10-17&maxPrice=350"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    23 × unexpected value "http://127.0.0.1:3100/seeker/search?suburb=Kellyville&checkIn=2026-10-17&maxPrice=350"

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- banner:
  - navigation:
    - link "MigRent MigRent AU":
      - /url: /
      - img "MigRent"
      - text: MigRent AU
    - button "Change language":
      - img
    - button "Dark mode":
      - img
    - button "Open menu"
- main:
  - heading "Find a Room" [level=1]
  - paragraph: Search real listings by location, price, and preferences. Exact addresses are shared once a booking is agreed.
  - button "Filters (3)"
  - text: Sort results
  - combobox "Sort results":
    - option "Newest" [selected]
    - 'option "Price: Low-High"'
    - 'option "Price: High-Low"'
  - text: Max $350/wk
  - 'button "Remove filter: Max $350/wk"'
  - text: Move in 2026-10-17
  - 'button "Remove filter: Move in 2026-10-17"'
  - text: Kellyville
  - 'button "Remove filter: Kellyville"'
  - button "Clear all"
  - status: 3 rooms found. Map unavailable, showing list only.
  - text: Sort results
  - region "Search results":
    - list:
      - listitem:
        - article:
          - img "Photo of Sunny room near the station"
          - text: $320/wk
          - button "Save Sunny room near the station to wishlist"
          - heading "Sunny room near the station" [level=2]
          - paragraph: Kellyville 2155
          - text: private Furnished ID verified host
          - paragraph: A bright private room with a window, five minutes from the station.
          - paragraph: 6 min to Kellyville
          - link "View details for Sunny room near the station":
            - /url: /listing/11111111-1111-4111-8111-000000000001
      - listitem:
        - article:
          - img "Photo of Room with unverified host"
          - text: $250/wk
          - button "Save Room with unverified host to wishlist"
          - heading "Room with unverified host" [level=2]
          - paragraph: Kellyville 2155
          - text: private Furnished Not yet verified
          - paragraph: A bright private room with a window, five minutes from the station.
          - paragraph: 6 min to Kellyville
          - link "View details for Room with unverified host":
            - /url: /listing/11111111-1111-4111-8111-000000000003
      - listitem:
        - article:
          - img "Photo of Available next month"
          - text: $290/wk
          - button "Save Available next month to wishlist"
          - heading "Available next month" [level=2]
          - paragraph: Kellyville 2155
          - text: private Furnished ID verified host
          - paragraph: A bright private room with a window, five minutes from the station.
          - paragraph: 6 min to Kellyville
          - link "View details for Available next month":
            - /url: /listing/11111111-1111-4111-8111-000000000004
- contentinfo:
  - link "MigRent MigRent":
    - /url: /
    - img "MigRent"
    - text: MigRent
  - heading "A real home in Australia, found the right way." [level=2]
  - text: ID-verified hosts Bond lodged properly $0 renter fees Mentor network
  - paragraph: Verified rooms for migrants, students, and new arrivals - no rental history needed.
  - link "I'm a Seeker":
    - /url: /for-seekers
  - link "I'm an Owner":
    - /url: /for-owners
  - heading "For seekers" [level=3]
  - list:
    - listitem:
      - link "Search rooms":
        - /url: /seeker/search
    - listitem:
      - link "How it works":
        - /url: /for-seekers
    - listitem:
      - link "FAQ":
        - /url: /faq
    - listitem:
      - link "Guides":
        - /url: /guides
    - listitem:
      - link "Tenant rights":
        - /url: /resources/rental-laws
  - heading "For owners" [level=3]
  - list:
    - listitem:
      - link "List a room":
        - /url: /for-owners
    - listitem:
      - link "Pricing":
        - /url: /pricing
    - listitem:
      - link "Owner dashboard":
        - /url: /dashboard/owner
    - listitem:
      - link "Safety & verification":
        - /url: /safety-verification
    - listitem:
      - link "Become a mentor":
        - /url: /become-mentor
  - heading "Explore" [level=3]
  - list:
    - listitem:
      - link "Features":
        - /url: /features
    - listitem:
      - link "Suburb guides":
        - /url: /suburbs
    - listitem:
      - link "Mentors":
        - /url: /mentors
    - listitem:
      - link "Resources":
        - /url: /resources
    - listitem:
      - link "Help centre":
        - /url: /help
    - listitem:
      - link "Blog":
        - /url: /blog
  - heading "Company" [level=3]
  - list:
    - listitem:
      - link "About":
        - /url: /about
    - listitem:
      - link "Careers":
        - /url: /careers
    - listitem:
      - link "Press":
        - /url: /press
    - listitem:
      - link "Contact":
        - /url: /contact
  - heading "Trust & safety" [level=3]
  - list:
    - listitem:
      - link "Bond protection":
        - /url: /safety-reporting
    - listitem:
      - link "Community rules":
        - /url: /rules-community-guidelines
    - listitem:
      - link "Code of conduct":
        - /url: /code-of-conduct
    - listitem:
      - link "Anti-discrimination":
        - /url: /anti-discrimination
    - listitem:
      - link "Support & disputes":
        - /url: /support-disputes
  - heading "Legal" [level=3]
  - list:
    - listitem:
      - link "Terms of service":
        - /url: /terms-of-service
    - listitem:
      - link "Privacy policy":
        - /url: /privacy-policy
    - listitem:
      - link "Cookie policy":
        - /url: /cookie-policy
    - listitem:
      - link "Disclaimer":
        - /url: /disclaimer
    - listitem:
      - link "ABN terms":
        - /url: /abn-terms
  - text: © 2026 MigRent · ABN 22 669 566 941 · Australia Australia (English) AUD $
  - link "Report a problem":
    - /url: /contact
- button "MigRent Support":
  - img
- alert: Search rooms | MigRent
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | const LIVE_ID = "11111111-1111-4111-8111-000000000001";
  4   | const EXPIRED_ID = "22222222-2222-4222-8222-000000000001";
  5   | 
  6   | async function collectPageErrors(page: Page) {
  7   |   const errors: string[] = [];
  8   |   page.on("pageerror", (err) => errors.push(err.message));
  9   |   page.on("console", (msg) => {
  10  |     if (msg.type() === "error") errors.push(msg.text());
  11  |   });
  12  |   return errors;
  13  | }
  14  | 
  15  | test.describe("search survives without WebGL", () => {
  16  |   test("results list works when WebGL is unavailable", async ({ page }) => {
  17  |     // Force the "no WebGL" path the way a locked-down corporate browser or a
  18  |     // VM would: getContext returns null for every WebGL context type.
  19  |     await page.addInitScript(() => {
  20  |       (window as unknown as { __MIGRENT_DISABLE_WEBGL__: boolean }).__MIGRENT_DISABLE_WEBGL__ = true;
  21  |       const original = HTMLCanvasElement.prototype.getContext;
  22  |       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  23  |       HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: any[]) {
  24  |         if (String(type).includes("webgl")) return null;
  25  |         return (original as unknown as (t: string, ...r: unknown[]) => unknown).call(this, type, ...rest);
  26  |       } as typeof HTMLCanvasElement.prototype.getContext;
  27  |     });
  28  |     const errors = await collectPageErrors(page);
  29  | 
  30  |     await page.goto("/seeker/search?suburb=Kellyville");
  31  |     await expect(page.getByTestId("results-status")).toContainText(/room/i);
  32  |     await expect(page.getByTestId("listing-card").first()).toBeVisible();
  33  |     // The framework error overlay must never appear.
  34  |     await expect(page.locator("text=Application error")).toHaveCount(0);
  35  |     await expect(page.locator("nextjs-portal")).toHaveCount(0);
  36  | 
  37  |     const width = page.viewportSize()?.width ?? 0;
  38  |     if (width >= 1280) {
  39  |       await expect(page.getByTestId("map-unavailable")).toBeVisible();
  40  |       await expect(page.getByTestId("map-unavailable")).toContainText("Map unavailable");
  41  |     }
  42  |     expect(errors.filter((e) => /webgl|Failed to initialize/i.test(e))).toHaveLength(0);
  43  |     // Vercel's analytics scripts 404 outside Vercel; everything else must be clean.
  44  |     expect(errors.filter((e) => !/webgl|favicon|Download the React DevTools|_vercel\/|404 \(Not Found\)/i.test(e))).toHaveLength(0);
  45  |   });
  46  | 
  47  |   test("results are server-rendered before any script runs", async ({ request }) => {
  48  |     const res = await request.get("/seeker/search?suburb=Parramatta");
  49  |     expect(res.status()).toBe(200);
  50  |     const html = await res.text();
  51  |     expect(html).toContain("Studio in Parramatta");
  52  |     expect(html).toContain('data-testid="listing-card"');
  53  |   });
  54  | });
  55  | 
  56  | test.describe("move-in date", () => {
  57  |   test("homepage move-in date reaches the search URL and filters results", async ({ page }) => {
  58  |     await page.goto("/");
  59  |     const nextMonth = new Date();
  60  |     nextMonth.setDate(nextMonth.getDate() + 45);
  61  |     const iso = nextMonth.toISOString().slice(0, 10);
  62  |     await page.getByLabel("City or suburb").fill("Kellyville");
  63  |     await page.getByLabel("Move-in from").fill(iso);
  64  |     await page.getByRole("button", { name: /Search rooms up to/ }).click();
  65  |     await expect(page).toHaveURL(new RegExp(`/seeker/search\\?.*checkIn=${iso}`));
> 66  |     await expect(page).toHaveURL(/city=Kellyville/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  67  |     await expect(page.getByTestId("listing-card").filter({ hasText: "Available next month" })).toHaveCount(1);
  68  |     // Move the date earlier: the not-yet-available room disappears.
  69  |     await page.locator('input[name="checkIn"]').first().fill(new Date().toISOString().slice(0, 10));
  70  |     await expect(page.getByTestId("listing-card").filter({ hasText: "Available next month" })).toHaveCount(0);
  71  |     await expect(page).toHaveURL(/checkIn=/);
  72  |   });
  73  | 
  74  |   test("impossible ranges are rejected client-side and the URL stays sane", async ({ page }) => {
  75  |     await page.goto("/seeker/search?suburb=Kellyville&checkIn=2062-01-01&checkOut=2020-01-01");
  76  |     await expect(page).not.toHaveURL(/2062/);
  77  |     await expect(page.getByTestId("listing-card").first()).toBeVisible();
  78  |   });
  79  | 
  80  |   test("back and forward restore filters", async ({ page }) => {
  81  |     await page.goto("/seeker/search?suburb=Kellyville");
  82  |     const furnished = page.getByRole("search", { name: "Room filters" }).getByRole("button", { name: "Furnished" });
  83  |     await furnished.click();
  84  |     await expect(page).toHaveURL(/furnished=true/);
  85  |     await page.goto("/seeker/search?suburb=Parramatta");
  86  |     await page.goBack();
  87  |     await expect(page).toHaveURL(/furnished=true/);
  88  |     await expect(furnished).toHaveAttribute("aria-pressed", "true");
  89  |   });
  90  | });
  91  | 
  92  | test.describe("error and empty states", () => {
  93  |   test("API failure shows a retry state instead of 'no rooms'", async ({ page }) => {
  94  |     await page.goto("/seeker/search?suburb=__boom__");
  95  |     await expect(page.getByTestId("search-error")).toBeVisible();
  96  |     await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  97  |     await expect(page.getByTestId("search-empty")).toHaveCount(0);
  98  |   });
  99  | 
  100 |   test("no matches shows the empty state with recovery actions", async ({ page }) => {
  101 |     await page.goto("/seeker/search?suburb=Nowhereville");
  102 |     await expect(page.getByTestId("search-empty")).toBeVisible();
  103 |     await expect(page.getByRole("button", { name: "Kellyville" })).toBeVisible();
  104 |   });
  105 | 
  106 |   test("pagination loads more and reports totals honestly", async ({ page }) => {
  107 |     await page.goto("/seeker/search");
  108 |     await expect(page.getByTestId("results-status")).toContainText(/Showing 20 of 26 rooms/);
  109 |     await page.getByRole("button", { name: "Load more rooms" }).click();
  110 |     await expect(page.getByTestId("listing-card")).toHaveCount(26);
  111 |   });
  112 | });
  113 | 
  114 | test.describe("verification and listing state", () => {
  115 |   test("an unverified host is never shown as verified", async ({ page }) => {
  116 |     await page.goto("/seeker/search?suburb=Kellyville");
  117 |     const card = page.getByTestId("listing-card").filter({ hasText: "unverified host" });
  118 |     await expect(card.locator("[data-verification-status]")).toHaveAttribute("data-verification-status", "unverified");
  119 |     await expect(card).toContainText("Not yet verified");
  120 |     await expect(card).not.toContainText("ID verified host");
  121 |     const verifiedCard = page.getByTestId("listing-card").filter({ hasText: "Sunny room" }).first();
  122 |     await expect(verifiedCard.locator("[data-verification-status]")).toHaveAttribute("data-verification-status", "verified");
  123 |   });
  124 | 
  125 |   test("expired listing URL returns 410 and an honest page", async ({ page }) => {
  126 |     const response = await page.goto(`/listing/${EXPIRED_ID}`);
  127 |     expect(response?.status()).toBe(410);
  128 |     await expect(page.getByRole("heading", { level: 1 })).toContainText("Beautiful Rooms in Kellyville");
  129 |     await expect(page.getByText("No longer available")).toBeVisible();
  130 |     await expect(page.getByText(/25 April 2026/)).toBeVisible();
  131 |     await expect(page.getByRole("button", { name: /Request to book|Instant book/ })).toHaveCount(0);
  132 |     const html = await page.content();
  133 |     expect(html).toContain('name="robots" content="noindex');
  134 |   });
  135 | 
  136 |   test("public listing page never contains private fields", async ({ request }) => {
  137 |     const res = await request.get(`/listing/${LIVE_ID}`);
  138 |     const html = await res.text();
  139 |     for (const forbidden of ['"latitude"', '"longitude"', '"owner_id"', '"moderation_notes"', '"spam_score"', '"hidden_at"', '"street_address"', '"geocoded_address"', '"streetAddress"']) {
  140 |       expect(html, `${forbidden} leaked into the public page`).not.toContain(forbidden);
  141 |     }
  142 |     expect(html).toContain('"precision":"approximate"');
  143 |     expect(html).toContain("Street address is shared once a booking is agreed");
  144 |   });
  145 | });
  146 | 
```