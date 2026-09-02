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