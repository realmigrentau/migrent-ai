# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> axe: /seeker/search?suburb=Kellyville has no serious or critical violations
- Location: tests/e2e/accessibility.spec.ts:7:7

# Error details

```
Error: [
  {
    "id": "color-contrast",
    "nodes": [
      [
        "li:nth-child(1) > article > .p-4.space-y-2.flex-1 > .text-\\[var\\(--color-accent\\)\\]"
      ],
      [
        "li:nth-child(2) > article > .p-4.space-y-2.flex-1 > .text-\\[var\\(--color-accent\\)\\]"
      ],
      [
        "li:nth-child(3) > article > .p-4.space-y-2.flex-1 > .text-\\[var\\(--color-accent\\)\\]"
      ]
    ]
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 128

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f6f1e9",
+               "contrastRatio": 2.78,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#2e9bd0",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.78 (foreground color: #2e9bd0, background color: #f6f1e9, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<article data-testid=\"listing-card\" class=\"card rounded-2xl overflow-hidden group cursor-pointer h-full flex flex-col\">",
+                 "target": Array [
+                   "li:nth-child(1) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.78 (foreground color: #2e9bd0, background color: #f6f1e9, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-xs font-medium text-[var(--color-accent)]\">6<!-- --> min to <!-- -->Kellyville</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(1) > article > .p-4.space-y-2.flex-1 > .text-\\[var\\(--color-accent\\)\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f6f1e9",
+               "contrastRatio": 2.78,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#2e9bd0",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.78 (foreground color: #2e9bd0, background color: #f6f1e9, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<article data-testid=\"listing-card\" class=\"card rounded-2xl overflow-hidden group cursor-pointer h-full flex flex-col\">",
+                 "target": Array [
+                   "li:nth-child(2) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.78 (foreground color: #2e9bd0, background color: #f6f1e9, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-xs font-medium text-[var(--color-accent)]\">6<!-- --> min to <!-- -->Kellyville</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(2) > article > .p-4.space-y-2.flex-1 > .text-\\[var\\(--color-accent\\)\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f6f1e9",
+               "contrastRatio": 2.78,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#2e9bd0",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.78 (foreground color: #2e9bd0, background color: #f6f1e9, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<article data-testid=\"listing-card\" class=\"card rounded-2xl overflow-hidden group cursor-pointer h-full flex flex-col\">",
+                 "target": Array [
+                   "li:nth-child(3) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.78 (foreground color: #2e9bd0, background color: #f6f1e9, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-xs font-medium text-[var(--color-accent)]\">6<!-- --> min to <!-- -->Kellyville</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(3) > article > .p-4.space-y-2.flex-1 > .text-\\[var\\(--color-accent\\)\\]",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+ ]
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
        - list [ref=e14]:
          - listitem [ref=e15]:
            - link "Home" [ref=e16] [cursor=pointer]:
              - /url: /
          - listitem [ref=e17]:
            - button "Features" [ref=e18]:
              - text: Features
              - img [ref=e19]
          - listitem [ref=e21]:
            - link "Pricing" [ref=e22] [cursor=pointer]:
              - /url: /pricing
          - listitem [ref=e23]:
            - button "Resources" [ref=e24]:
              - text: Resources
              - img [ref=e25]
        - list [ref=e28]:
          - listitem [ref=e29]:
            - button "Change language" [ref=e31]:
              - img [ref=e32]
          - listitem [ref=e35]:
            - button "Dark mode" [ref=e36]:
              - img [ref=e37]
          - listitem [ref=e39]:
            - link "List a room" [ref=e40] [cursor=pointer]:
              - /url: /for-owners
          - listitem [ref=e41]:
            - link "Sign Up" [ref=e42] [cursor=pointer]:
              - /url: /signup
    - main [ref=e44]:
      - generic [ref=e46]:
        - generic [ref=e47]:
          - heading "Find a Room" [level=1] [ref=e48]
          - paragraph [ref=e49]: Search real listings by location, price, and preferences. Exact addresses are shared once a booking is agreed.
        - generic "Active filters" [ref=e50]:
          - generic [ref=e51]:
            - text: Kellyville
            - 'button "Remove filter: Kellyville" [ref=e52]':
              - img [ref=e53]
          - button "Clear all" [ref=e55]
        - generic [ref=e56]:
          - status [ref=e57]: 3 rooms found. Map unavailable, showing list only.
          - generic [ref=e59]:
            - generic [ref=e60]: Sort results
            - combobox "Sort results" [ref=e61]:
              - option "Newest" [selected]
              - 'option "Price: Low-High"'
              - 'option "Price: High-Low"'
        - generic [ref=e62]:
          - complementary "Filters" [ref=e63]:
            - search "Room filters" [ref=e65]:
              - generic [ref=e66]:
                - button "Location" [expanded] [ref=e67]:
                  - text: Location
                  - img [ref=e68]
                - generic [ref=e71]:
                  - group "Search by" [ref=e72]:
                    - button "Near me" [ref=e73]
                    - button "suburb" [pressed] [ref=e74]
                    - button "postcode" [ref=e75]
                    - button "address" [ref=e76]
                  - generic [ref=e77]:
                    - generic [ref=e78]: Suburb or city
                    - searchbox "Suburb or city" [ref=e79]: Kellyville
              - generic [ref=e80]:
                - button "Price range ($/week)" [expanded] [ref=e81]:
                  - text: Price range ($/week)
                  - img [ref=e82]
                - generic [ref=e85]:
                  - generic [ref=e86]:
                    - generic [ref=e87]: Minimum weekly price
                    - generic: $
                    - spinbutton "Minimum weekly price" [ref=e88]
                  - generic [ref=e89]: "-"
                  - generic [ref=e90]:
                    - generic [ref=e91]: Maximum weekly price
                    - generic: $
                    - spinbutton "Maximum weekly price" [ref=e92]
              - generic [ref=e93]:
                - button "Room type" [expanded] [ref=e94]:
                  - text: Room type
                  - img [ref=e95]
                - generic [ref=e98]:
                  - button "All" [pressed] [ref=e99]
                  - button "Private room" [ref=e100]
                  - button "Shared room" [ref=e101]
                  - button "Entire place" [ref=e102]
              - button "Property type" [ref=e104]:
                - text: Property type
                - img [ref=e105]
              - button "Dates" [ref=e108]:
                - text: Dates
                - img [ref=e109]
              - button "Guests" [ref=e112]:
                - text: Guests
                - img [ref=e113]
              - button "Near a station" [ref=e116]:
                - text: Near a station
                - img [ref=e117]
              - button "Minimum stay" [ref=e120]:
                - text: Minimum stay
                - img [ref=e121]
              - generic [ref=e123]:
                - button "Amenities & features" [expanded] [ref=e124]:
                  - text: Amenities & features
                  - img [ref=e125]
                - generic [ref=e128]:
                  - button "Furnished" [ref=e129]
                  - button "Bills included" [ref=e130]
                  - button "Instant book" [ref=e131]
                  - button "Pets allowed" [ref=e132]
                  - button "Parking" [ref=e133]
                  - button "Air con" [ref=e134]
                  - button "Couples OK" [ref=e135]
                  - button "Near station" [ref=e136]
              - button "Preferences" [ref=e138]:
                - text: Preferences
                - img [ref=e139]
              - button "Search rooms" [ref=e141] [cursor=pointer]
          - generic [ref=e143]:
            - region "Search results" [ref=e144]:
              - list [ref=e145]:
                - listitem [ref=e146]:
                  - article [ref=e147] [cursor=pointer]:
                    - generic [ref=e148]:
                      - img "Photo of Sunny room near the station" [ref=e149]
                      - generic [ref=e150]:
                        - generic [ref=e151]: $320
                        - text: /wk
                      - button "Save Sunny room near the station to wishlist" [ref=e152]:
                        - img [ref=e153]
                    - generic [ref=e155]:
                      - generic [ref=e156]:
                        - heading "Sunny room near the station" [level=2] [ref=e157]
                        - paragraph [ref=e158]: Kellyville 2155
                      - generic [ref=e159]:
                        - generic [ref=e160]: private
                        - generic [ref=e161]: Furnished
                        - generic [ref=e162]:
                          - img [ref=e163]
                          - text: ID verified host
                      - paragraph [ref=e166]: A bright private room with a window, five minutes from the station.
                      - paragraph [ref=e167]: 6 min to Kellyville
                      - link "View details for Sunny room near the station" [ref=e169]:
                        - /url: /listing/11111111-1111-4111-8111-000000000001
                        - text: View details
                        - generic [ref=e170]: for Sunny room near the station
                - listitem [ref=e171]:
                  - article [ref=e172] [cursor=pointer]:
                    - generic [ref=e173]:
                      - img "Photo of Room with unverified host" [ref=e174]
                      - generic [ref=e175]:
                        - generic [ref=e176]: $250
                        - text: /wk
                      - button "Save Room with unverified host to wishlist" [ref=e177]:
                        - img [ref=e178]
                    - generic [ref=e180]:
                      - generic [ref=e181]:
                        - heading "Room with unverified host" [level=2] [ref=e182]
                        - paragraph [ref=e183]: Kellyville 2155
                      - generic [ref=e184]:
                        - generic [ref=e185]: private
                        - generic [ref=e186]: Furnished
                        - generic [ref=e187]:
                          - img [ref=e188]
                          - text: Not yet verified
                      - paragraph [ref=e192]: A bright private room with a window, five minutes from the station.
                      - paragraph [ref=e193]: 6 min to Kellyville
                      - link "View details for Room with unverified host" [ref=e195]:
                        - /url: /listing/11111111-1111-4111-8111-000000000003
                        - text: View details
                        - generic [ref=e196]: for Room with unverified host
                - listitem [ref=e197]:
                  - article [ref=e198] [cursor=pointer]:
                    - generic [ref=e199]:
                      - img "Photo of Available next month" [ref=e200]
                      - generic [ref=e201]:
                        - generic [ref=e202]: $290
                        - text: /wk
                      - button "Save Available next month to wishlist" [ref=e203]:
                        - img [ref=e204]
                    - generic [ref=e206]:
                      - generic [ref=e207]:
                        - heading "Available next month" [level=2] [ref=e208]
                        - paragraph [ref=e209]: Kellyville 2155
                      - generic [ref=e210]:
                        - generic [ref=e211]: private
                        - generic [ref=e212]: Furnished
                        - generic [ref=e213]:
                          - img [ref=e214]
                          - text: ID verified host
                      - paragraph [ref=e217]: A bright private room with a window, five minutes from the station.
                      - paragraph [ref=e218]: 6 min to Kellyville
                      - link "View details for Available next month" [ref=e220]:
                        - /url: /listing/11111111-1111-4111-8111-000000000004
                        - text: View details
                        - generic [ref=e221]: for Available next month
            - status [ref=e224]:
              - img [ref=e225]
              - paragraph [ref=e227]: Map unavailable
              - paragraph [ref=e228]: The map could not load. Results are listed below.
              - button "Try the map again" [ref=e229] [cursor=pointer]
    - contentinfo [ref=e230]:
      - generic [ref=e231]:
        - generic [ref=e232]:
          - generic [ref=e233]:
            - link "MigRent MigRent" [ref=e234] [cursor=pointer]:
              - /url: /
              - img "MigRent" [ref=e235]
              - generic [ref=e238]: MigRent
            - heading "A real home in Australia, found the right way." [level=2] [ref=e239]
            - generic [ref=e240]:
              - generic [ref=e241]:
                - img [ref=e242]
                - text: ID-verified hosts
              - generic [ref=e245]:
                - img [ref=e246]
                - text: Bond lodged properly
              - generic [ref=e249]:
                - img [ref=e250]
                - text: $0 renter fees
              - generic [ref=e253]:
                - img [ref=e254]
                - text: Mentor network
          - generic [ref=e256]:
            - paragraph [ref=e257]: Verified rooms for migrants, students, and new arrivals - no rental history needed.
            - generic [ref=e258]:
              - link "I'm a Seeker" [ref=e259] [cursor=pointer]:
                - /url: /for-seekers
                - text: I'm a Seeker
                - generic [ref=e260]: →
              - link "I'm an Owner" [ref=e261] [cursor=pointer]:
                - /url: /for-owners
        - generic [ref=e262]:
          - generic [ref=e263]:
            - heading "For seekers" [level=3] [ref=e264]
            - list [ref=e265]:
              - listitem [ref=e266]:
                - link "Search rooms" [ref=e267] [cursor=pointer]:
                  - /url: /seeker/search
              - listitem [ref=e268]:
                - link "How it works" [ref=e269] [cursor=pointer]:
                  - /url: /for-seekers
              - listitem [ref=e270]:
                - link "FAQ" [ref=e271] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e272]:
                - link "Guides" [ref=e273] [cursor=pointer]:
                  - /url: /guides
              - listitem [ref=e274]:
                - link "Tenant rights" [ref=e275] [cursor=pointer]:
                  - /url: /resources/rental-laws
          - generic [ref=e276]:
            - heading "For owners" [level=3] [ref=e277]
            - list [ref=e278]:
              - listitem [ref=e279]:
                - link "List a room" [ref=e280] [cursor=pointer]:
                  - /url: /for-owners
              - listitem [ref=e281]:
                - link "Pricing" [ref=e282] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e283]:
                - link "Owner dashboard" [ref=e284] [cursor=pointer]:
                  - /url: /dashboard/owner
              - listitem [ref=e285]:
                - link "Safety & verification" [ref=e286] [cursor=pointer]:
                  - /url: /safety-verification
              - listitem [ref=e287]:
                - link "Become a mentor" [ref=e288] [cursor=pointer]:
                  - /url: /become-mentor
          - generic [ref=e289]:
            - heading "Explore" [level=3] [ref=e290]
            - list [ref=e291]:
              - listitem [ref=e292]:
                - link "Features" [ref=e293] [cursor=pointer]:
                  - /url: /features
              - listitem [ref=e294]:
                - link "Suburb guides" [ref=e295] [cursor=pointer]:
                  - /url: /suburbs
              - listitem [ref=e296]:
                - link "Mentors" [ref=e297] [cursor=pointer]:
                  - /url: /mentors
              - listitem [ref=e298]:
                - link "Resources" [ref=e299] [cursor=pointer]:
                  - /url: /resources
              - listitem [ref=e300]:
                - link "Help centre" [ref=e301] [cursor=pointer]:
                  - /url: /help
              - listitem [ref=e302]:
                - link "Blog" [ref=e303] [cursor=pointer]:
                  - /url: /blog
          - generic [ref=e304]:
            - heading "Company" [level=3] [ref=e305]
            - list [ref=e306]:
              - listitem [ref=e307]:
                - link "About" [ref=e308] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e309]:
                - link "Careers" [ref=e310] [cursor=pointer]:
                  - /url: /careers
              - listitem [ref=e311]:
                - link "Press" [ref=e312] [cursor=pointer]:
                  - /url: /press
              - listitem [ref=e313]:
                - link "Contact" [ref=e314] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e315]:
            - heading "Trust & safety" [level=3] [ref=e316]
            - list [ref=e317]:
              - listitem [ref=e318]:
                - link "Bond protection" [ref=e319] [cursor=pointer]:
                  - /url: /safety-reporting
              - listitem [ref=e320]:
                - link "Community rules" [ref=e321] [cursor=pointer]:
                  - /url: /rules-community-guidelines
              - listitem [ref=e322]:
                - link "Code of conduct" [ref=e323] [cursor=pointer]:
                  - /url: /code-of-conduct
              - listitem [ref=e324]:
                - link "Anti-discrimination" [ref=e325] [cursor=pointer]:
                  - /url: /anti-discrimination
              - listitem [ref=e326]:
                - link "Support & disputes" [ref=e327] [cursor=pointer]:
                  - /url: /support-disputes
          - generic [ref=e328]:
            - heading "Legal" [level=3] [ref=e329]
            - list [ref=e330]:
              - listitem [ref=e331]:
                - link "Terms of service" [ref=e332] [cursor=pointer]:
                  - /url: /terms-of-service
              - listitem [ref=e333]:
                - link "Privacy policy" [ref=e334] [cursor=pointer]:
                  - /url: /privacy-policy
              - listitem [ref=e335]:
                - link "Cookie policy" [ref=e336] [cursor=pointer]:
                  - /url: /cookie-policy
              - listitem [ref=e337]:
                - link "Disclaimer" [ref=e338] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e339]:
                - link "ABN terms" [ref=e340] [cursor=pointer]:
                  - /url: /abn-terms
        - generic [ref=e341]:
          - generic [ref=e342]: © 2026 MigRent · ABN 22 669 566 941 · Australia
          - generic [ref=e343]:
            - generic [ref=e344]: Australia (English)
            - generic [ref=e345]: AUD $
            - link "Report a problem" [ref=e346] [cursor=pointer]:
              - /url: /contact
    - button "MigRent Support" [ref=e347]:
      - img [ref=e348]
  - alert [ref=e350]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import AxeBuilder from "@axe-core/playwright";
  3  | 
  4  | const PAGES = ["/", "/seeker/search?suburb=Kellyville", "/signin", "/signup", "/contact", "/pricing", "/faq", "/listing/11111111-1111-4111-8111-000000000001"];
  5  | 
  6  | for (const path of PAGES) {
  7  |   test(`axe: ${path} has no serious or critical violations`, async ({ page }) => {
  8  |     await page.goto(path);
  9  |     await page.waitForLoadState("networkidle");
  10 |     const results = await new AxeBuilder({ page })
  11 |       .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
  12 |       // Third-party embeds are not ours to fix.
  13 |       .exclude("iframe")
  14 |       .analyze();
  15 |     const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
> 16 |     expect(serious, JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.slice(0, 3).map((n) => n.target) })), null, 2)).toEqual([]);
     |                                                                                                                                   ^ Error: [
  17 |   });
  18 | }
  19 | 
  20 | test("skip link and landmarks", async ({ page }) => {
  21 |   await page.goto("/");
  22 |   await page.keyboard.press("Tab");
  23 |   const skip = page.getByRole("link", { name: "Skip to main content" });
  24 |   await expect(skip).toBeFocused();
  25 |   await skip.press("Enter");
  26 |   await expect(page.locator("main#main-content")).toBeFocused();
  27 |   await expect(page.locator("main")).toHaveCount(1);
  28 |   await expect(page.locator("footer")).toHaveCount(1);
  29 |   await expect(page.locator("nav").first()).toBeVisible();
  30 | });
  31 | 
  32 | test("empty sign-in submission announces field errors", async ({ page }) => {
  33 |   await page.goto("/signin");
  34 |   await page.getByRole("button", { name: /^Sign in$/ }).click();
  35 |   const email = page.getByLabel("Email");
  36 |   await expect(email).toHaveAttribute("aria-invalid", "true");
  37 |   const describedBy = await email.getAttribute("aria-describedby");
  38 |   expect(describedBy).toBeTruthy();
  39 |   await expect(page.locator(`#${describedBy}`)).toContainText(/email/i);
  40 |   await expect(page.locator("#signin-status[role=alert]")).toContainText(/./);
  41 |   // Enter submits the form.
  42 |   await email.fill("someone@example.com");
  43 |   await page.getByLabel("Password").fill("x");
  44 |   await page.getByLabel("Password").press("Enter");
  45 |   await expect(page.locator("#signin-status")).toContainText(/./);
  46 | });
  47 | 
  48 | test("theme toggle exposes its state", async ({ page }) => {
  49 |   await page.goto("/");
  50 |   const toggle = page.getByRole("button", { name: "Dark mode" }).first();
  51 |   const before = await toggle.getAttribute("aria-pressed");
  52 |   await toggle.click();
  53 |   await expect(toggle).toHaveAttribute("aria-pressed", before === "true" ? "false" : "true");
  54 | });
  55 | 
  56 | test("FAQ accordion is keyboard operable and announces state", async ({ page }) => {
  57 |   await page.goto("/faq");
  58 |   const first = page.locator("main h3 > button[aria-expanded]").first();
  59 |   await first.focus();
  60 |   await page.keyboard.press("Enter");
  61 |   await expect(first).toHaveAttribute("aria-expanded", "true");
  62 |   const controls = await first.getAttribute("aria-controls");
  63 |   await expect(page.locator(`#${controls}`)).toBeVisible();
  64 | });
  65 | 
  66 | test("search filters are reachable by keyboard and the results region is announced", async ({ page, isMobile }) => {
  67 |   test.skip(isMobile, "filter sidebar is a drawer on mobile");
  68 |   await page.goto("/seeker/search?suburb=Kellyville");
  69 |   const status = page.getByTestId("results-status");
  70 |   await expect(status).toHaveAttribute("aria-live", "polite");
  71 |   await page.getByRole("search", { name: "Room filters" }).getByRole("button", { name: "Furnished" }).focus();
  72 |   await page.keyboard.press("Space");
  73 |   await expect(page).toHaveURL(/furnished=true/);
  74 | });
  75 | 
```