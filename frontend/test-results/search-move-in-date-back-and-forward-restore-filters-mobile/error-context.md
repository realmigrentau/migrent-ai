# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.ts >> move-in date >> back and forward restore filters
- Location: tests/e2e/search.spec.ts:80:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('search', { name: 'Room filters' }).getByRole('button', { name: 'Furnished' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - link "Skip to main content" [ref=e5] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e6]:
      - navigation [ref=e7]:
        - link "MigRent MigRent AU" [ref=e8] [cursor=pointer]:
          - /url: /
          - img "MigRent" [ref=e9]
          - generic [ref=e12]: MigRent
          - generic [ref=e13]: AU
        - generic [ref=e15]:
          - button "Change language" [ref=e17]:
            - img [ref=e18]
          - button "Dark mode" [ref=e21]:
            - img [ref=e22]
          - button "Open menu" [ref=e24]
    - main [ref=e29]:
      - generic [ref=e31]:
        - generic [ref=e32]:
          - heading "Find a Room" [level=1] [ref=e33]
          - paragraph [ref=e34]: Search real listings by location, price, and preferences. Exact addresses are shared once a booking is agreed.
        - generic [ref=e35]:
          - button "Filters (1)" [ref=e36] [cursor=pointer]:
            - img [ref=e37]
            - text: Filters (1)
          - generic [ref=e39]:
            - generic [ref=e40]: Sort results
            - combobox "Sort results" [ref=e41]:
              - option "Newest" [selected]
              - 'option "Price: Low-High"'
              - 'option "Price: High-Low"'
        - generic "Active filters" [ref=e42]:
          - generic [ref=e43]:
            - text: Kellyville
            - 'button "Remove filter: Kellyville" [ref=e44]':
              - img [ref=e45]
          - button "Clear all" [ref=e47]
        - generic [ref=e48]:
          - status [ref=e49]: 3 rooms found. Map unavailable, showing list only.
          - generic [ref=e50]: Sort results
        - region "Search results" [ref=e54]:
          - list [ref=e55]:
            - listitem [ref=e56]:
              - article [ref=e57] [cursor=pointer]:
                - generic [ref=e58]:
                  - img "Photo of Sunny room near the station" [ref=e59]
                  - generic [ref=e60]:
                    - generic [ref=e61]: $320
                    - text: /wk
                  - button "Save Sunny room near the station to wishlist" [ref=e62]:
                    - img [ref=e63]
                - generic [ref=e65]:
                  - generic [ref=e66]:
                    - heading "Sunny room near the station" [level=2] [ref=e67]
                    - paragraph [ref=e68]: Kellyville 2155
                  - generic [ref=e69]:
                    - generic [ref=e70]: private
                    - generic [ref=e71]: Furnished
                    - generic [ref=e72]:
                      - img [ref=e73]
                      - text: ID verified host
                  - paragraph [ref=e76]: A bright private room with a window, five minutes from the station.
                  - paragraph [ref=e77]: 6 min to Kellyville
                  - link "View details for Sunny room near the station" [ref=e79]:
                    - /url: /listing/11111111-1111-4111-8111-000000000001
                    - text: View details
                    - generic [ref=e80]: for Sunny room near the station
            - listitem [ref=e81]:
              - article [ref=e82] [cursor=pointer]:
                - generic [ref=e83]:
                  - img "Photo of Room with unverified host" [ref=e84]
                  - generic [ref=e85]:
                    - generic [ref=e86]: $250
                    - text: /wk
                  - button "Save Room with unverified host to wishlist" [ref=e87]:
                    - img [ref=e88]
                - generic [ref=e90]:
                  - generic [ref=e91]:
                    - heading "Room with unverified host" [level=2] [ref=e92]
                    - paragraph [ref=e93]: Kellyville 2155
                  - generic [ref=e94]:
                    - generic [ref=e95]: private
                    - generic [ref=e96]: Furnished
                    - generic [ref=e97]:
                      - img [ref=e98]
                      - text: Not yet verified
                  - paragraph [ref=e102]: A bright private room with a window, five minutes from the station.
                  - paragraph [ref=e103]: 6 min to Kellyville
                  - link "View details for Room with unverified host" [ref=e105]:
                    - /url: /listing/11111111-1111-4111-8111-000000000003
                    - text: View details
                    - generic [ref=e106]: for Room with unverified host
            - listitem [ref=e107]:
              - article [ref=e108] [cursor=pointer]:
                - generic [ref=e109]:
                  - img "Photo of Available next month" [ref=e110]
                  - generic [ref=e111]:
                    - generic [ref=e112]: $290
                    - text: /wk
                  - button "Save Available next month to wishlist" [ref=e113]:
                    - img [ref=e114]
                - generic [ref=e116]:
                  - generic [ref=e117]:
                    - heading "Available next month" [level=2] [ref=e118]
                    - paragraph [ref=e119]: Kellyville 2155
                  - generic [ref=e120]:
                    - generic [ref=e121]: private
                    - generic [ref=e122]: Furnished
                    - generic [ref=e123]:
                      - img [ref=e124]
                      - text: ID verified host
                  - paragraph [ref=e127]: A bright private room with a window, five minutes from the station.
                  - paragraph [ref=e128]: 6 min to Kellyville
                  - link "View details for Available next month" [ref=e130]:
                    - /url: /listing/11111111-1111-4111-8111-000000000004
                    - text: View details
                    - generic [ref=e131]: for Available next month
    - contentinfo [ref=e132]:
      - generic [ref=e133]:
        - generic [ref=e134]:
          - generic [ref=e135]:
            - link "MigRent MigRent" [ref=e136] [cursor=pointer]:
              - /url: /
              - img "MigRent" [ref=e137]
              - generic [ref=e140]: MigRent
            - heading "A real home in Australia, found the right way." [level=2] [ref=e141]
            - generic [ref=e142]:
              - generic [ref=e143]:
                - img [ref=e144]
                - text: ID-verified hosts
              - generic [ref=e147]:
                - img [ref=e148]
                - text: Bond lodged properly
              - generic [ref=e151]:
                - img [ref=e152]
                - text: $0 renter fees
              - generic [ref=e155]:
                - img [ref=e156]
                - text: Mentor network
          - generic [ref=e158]:
            - paragraph [ref=e159]: Verified rooms for migrants, students, and new arrivals - no rental history needed.
            - generic [ref=e160]:
              - link "I'm a Seeker" [ref=e161] [cursor=pointer]:
                - /url: /for-seekers
                - text: I'm a Seeker
                - generic [ref=e162]: →
              - link "I'm an Owner" [ref=e163] [cursor=pointer]:
                - /url: /for-owners
        - generic [ref=e164]:
          - generic [ref=e165]:
            - heading "For seekers" [level=3] [ref=e166]
            - list [ref=e167]:
              - listitem [ref=e168]:
                - link "Search rooms" [ref=e169] [cursor=pointer]:
                  - /url: /seeker/search
              - listitem [ref=e170]:
                - link "How it works" [ref=e171] [cursor=pointer]:
                  - /url: /for-seekers
              - listitem [ref=e172]:
                - link "FAQ" [ref=e173] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e174]:
                - link "Guides" [ref=e175] [cursor=pointer]:
                  - /url: /guides
              - listitem [ref=e176]:
                - link "Tenant rights" [ref=e177] [cursor=pointer]:
                  - /url: /resources/rental-laws
          - generic [ref=e178]:
            - heading "For owners" [level=3] [ref=e179]
            - list [ref=e180]:
              - listitem [ref=e181]:
                - link "List a room" [ref=e182] [cursor=pointer]:
                  - /url: /for-owners
              - listitem [ref=e183]:
                - link "Pricing" [ref=e184] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e185]:
                - link "Owner dashboard" [ref=e186] [cursor=pointer]:
                  - /url: /dashboard/owner
              - listitem [ref=e187]:
                - link "Safety & verification" [ref=e188] [cursor=pointer]:
                  - /url: /safety-verification
              - listitem [ref=e189]:
                - link "Become a mentor" [ref=e190] [cursor=pointer]:
                  - /url: /become-mentor
          - generic [ref=e191]:
            - heading "Explore" [level=3] [ref=e192]
            - list [ref=e193]:
              - listitem [ref=e194]:
                - link "Features" [ref=e195] [cursor=pointer]:
                  - /url: /features
              - listitem [ref=e196]:
                - link "Suburb guides" [ref=e197] [cursor=pointer]:
                  - /url: /suburbs
              - listitem [ref=e198]:
                - link "Mentors" [ref=e199] [cursor=pointer]:
                  - /url: /mentors
              - listitem [ref=e200]:
                - link "Resources" [ref=e201] [cursor=pointer]:
                  - /url: /resources
              - listitem [ref=e202]:
                - link "Help centre" [ref=e203] [cursor=pointer]:
                  - /url: /help
              - listitem [ref=e204]:
                - link "Blog" [ref=e205] [cursor=pointer]:
                  - /url: /blog
          - generic [ref=e206]:
            - heading "Company" [level=3] [ref=e207]
            - list [ref=e208]:
              - listitem [ref=e209]:
                - link "About" [ref=e210] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e211]:
                - link "Careers" [ref=e212] [cursor=pointer]:
                  - /url: /careers
              - listitem [ref=e213]:
                - link "Press" [ref=e214] [cursor=pointer]:
                  - /url: /press
              - listitem [ref=e215]:
                - link "Contact" [ref=e216] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e217]:
            - heading "Trust & safety" [level=3] [ref=e218]
            - list [ref=e219]:
              - listitem [ref=e220]:
                - link "Bond protection" [ref=e221] [cursor=pointer]:
                  - /url: /safety-reporting
              - listitem [ref=e222]:
                - link "Community rules" [ref=e223] [cursor=pointer]:
                  - /url: /rules-community-guidelines
              - listitem [ref=e224]:
                - link "Code of conduct" [ref=e225] [cursor=pointer]:
                  - /url: /code-of-conduct
              - listitem [ref=e226]:
                - link "Anti-discrimination" [ref=e227] [cursor=pointer]:
                  - /url: /anti-discrimination
              - listitem [ref=e228]:
                - link "Support & disputes" [ref=e229] [cursor=pointer]:
                  - /url: /support-disputes
          - generic [ref=e230]:
            - heading "Legal" [level=3] [ref=e231]
            - list [ref=e232]:
              - listitem [ref=e233]:
                - link "Terms of service" [ref=e234] [cursor=pointer]:
                  - /url: /terms-of-service
              - listitem [ref=e235]:
                - link "Privacy policy" [ref=e236] [cursor=pointer]:
                  - /url: /privacy-policy
              - listitem [ref=e237]:
                - link "Cookie policy" [ref=e238] [cursor=pointer]:
                  - /url: /cookie-policy
              - listitem [ref=e239]:
                - link "Disclaimer" [ref=e240] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e241]:
                - link "ABN terms" [ref=e242] [cursor=pointer]:
                  - /url: /abn-terms
        - generic [ref=e243]:
          - generic [ref=e244]: © 2026 MigRent · ABN 22 669 566 941 · Australia
          - generic [ref=e245]:
            - generic [ref=e246]: Australia (English)
            - generic [ref=e247]: AUD $
            - link "Report a problem" [ref=e248] [cursor=pointer]:
              - /url: /contact
    - button "MigRent Support" [ref=e249]:
      - img [ref=e250]
  - alert [ref=e252]
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
  66  |     await expect(page).toHaveURL(/city=Kellyville/);
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
> 83  |     await furnished.click();
      |                     ^ Error: locator.click: Test timeout of 60000ms exceeded.
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