# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> axe: /listing/11111111-1111-4111-8111-000000000001 has no serious or critical violations
- Location: tests/e2e/accessibility.spec.ts:7:7

# Error details

```
Error: [
  {
    "id": "color-contrast",
    "nodes": [
      [
        ".dark\\:text-\\[var\\(--color-accent\\)\\]"
      ]
    ]
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 58

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
+               "bgColor": "#cbe3e6",
+               "contrastRatio": 2.33,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#2e9bd0",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.33 (foreground color: #2e9bd0, background color: #cbe3e6, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"rounded-2xl border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] bg-[var(--color-primary-soft)] from-[var(--color-accent-50)] to-[var(--color-primary-50)] dark:from-emerald-950/30 dark:to-[var(--color-surface-muted)] overflow-hidden\">",
+                 "target": Array [
+                   ".border-\\[var\\(--color-accent-soft\\)\\]",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.33 (foreground color: #2e9bd0, background color: #cbe3e6, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-[11px] font-medium text-[var(--color-accent)] dark:text-[var(--color-accent)]\">What will this really cost you?</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".dark\\:text-\\[var\\(--color-accent\\)\\]",
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
        - generic [ref=e33]:
          - button "Go back" [ref=e34]:
            - img [ref=e35]
          - generic [ref=e37]:
            - paragraph [ref=e38]: Sunny room near the station
            - generic [ref=e40]: Kellyville
        - generic [ref=e41]:
          - generic [ref=e43]:
            - button "Open photo 1 of 1 in full screen" [ref=e44]
            - img "Sunny room near the station, photo 1 of 1" [ref=e45]
            - generic [ref=e48]:
              - img [ref=e49]
              - text: ID verified host
            - generic:
              - generic:
                - img
                - text: View all photos
          - generic [ref=e52]:
            - heading "Sunny room near the station" [level=1] [ref=e53]
            - generic [ref=e54]:
              - img [ref=e55]
              - generic [ref=e58]: Kellyville 2155
            - paragraph [ref=e59]: Street address is shared once a booking is agreed.
          - generic [ref=e60]:
            - generic [ref=e61]:
              - region "About this place" [ref=e62]:
                - heading "About this place" [level=2] [ref=e63]
                - paragraph [ref=e64]: A bright private room with a window, five minutes from the station.
              - button "What will this really cost you? Enter your uni/work - see true weekly cost" [ref=e66]:
                - generic [ref=e67]:
                  - img [ref=e69]
                  - generic [ref=e71]:
                    - paragraph [ref=e72]: What will this really cost you?
                    - paragraph [ref=e73]: Enter your uni/work - see true weekly cost
                - img [ref=e74]
              - generic [ref=e76]:
                - generic [ref=e77]:
                  - heading "Pricing" [level=3] [ref=e78]:
                    - img [ref=e79]
                    - text: Pricing
                  - generic [ref=e81]:
                    - generic [ref=e82]: $320
                    - generic [ref=e83]: / week
                  - generic [ref=e84]: Bills not included - budget extra
                - generic [ref=e85]:
                  - heading "Property" [level=3] [ref=e86]
                  - generic [ref=e87]:
                    - generic [ref=e88]:
                      - img [ref=e89]
                      - text: house - private
                    - generic [ref=e92]:
                      - img [ref=e93]
                      - text: 1 bed
                    - generic [ref=e95]:
                      - img [ref=e96]
                      - text: 1 bath
                    - generic [ref=e99]:
                      - img [ref=e100]
                      - text: Max 2 guests
                - generic [ref=e105]:
                  - heading "Amenities" [level=3] [ref=e106]
                  - generic [ref=e108]:
                    - img [ref=e109]
                    - generic [ref=e112]: Furnished
                - generic [ref=e113]:
                  - heading "Availability" [level=3] [ref=e114]:
                    - img [ref=e115]
                    - text: Availability
                  - generic [ref=e117]:
                    - paragraph [ref=e118]: Available from 23 Aug 2026
                    - paragraph [ref=e119]: Until 31 Dec 2026
                    - paragraph [ref=e120]: "Min stay: 4 weeks"
                - generic [ref=e121]:
                  - heading "Location" [level=3] [ref=e122]:
                    - img [ref=e123]
                    - text: Location
                  - paragraph [ref=e127]: Kellyville - 6 min walk
                  - paragraph [ref=e128]: Map unavailable on this device.
                  - paragraph [ref=e129]: Approximate area only. The exact address is shared once the host accepts your booking.
              - generic [ref=e130]:
                - heading "Your host" [level=2] [ref=e131]
                - generic [ref=e132]:
                  - generic [ref=e133]: V
                  - generic [ref=e134]:
                    - paragraph [ref=e135]:
                      - link "Verified Owner" [ref=e136] [cursor=pointer]:
                        - /url: /users/profile/pubverif02
                    - generic [ref=e137]:
                      - generic [ref=e138]:
                        - img [ref=e139]
                        - text: 2 live listings
                      - generic [ref=e142]: Member since Jan 2026
                    - paragraph [ref=e143]: Long-time host in Kellyville.
                    - list "Host achievements" [ref=e144]:
                      - listitem [ref=e145]: Superhost
                - generic [ref=e146]:
                  - generic [ref=e147]:
                    - img [ref=e149]
                    - paragraph [ref=e152]: ID verified host
                  - list [ref=e153]:
                    - listitem [ref=e154]:
                      - generic [ref=e155]: Email confirmed
                      - generic [ref=e156]: Confirmed
                    - listitem [ref=e157]:
                      - generic [ref=e158]: Phone confirmed
                      - generic [ref=e159]: Confirmed
                    - listitem [ref=e160]:
                      - generic [ref=e161]: Government ID checked
                      - generic [ref=e162]: Checked June 2026
                  - paragraph [ref=e163]:
                    - text: Verification confirms documents were checked. It is not a guarantee of safety or suitability.
                    - link "How verification works" [ref=e164] [cursor=pointer]:
                      - /url: /safety-verification
                - link "Message Verified Owner" [ref=e165] [cursor=pointer]:
                  - /url: /messages?listing=11111111-1111-4111-8111-000000000001&to=pubverif02
                  - img [ref=e166]
                  - text: Message Verified Owner
              - generic [ref=e168]:
                - heading "Reviews" [level=2] [ref=e169]
                - generic [ref=e170]:
                  - img [ref=e171]
                  - text: No reviews yet
                - paragraph [ref=e173]: No reviews yet. Be the first to book and review this place.
              - generic [ref=e174]:
                - heading "Similar roomsnear Kellyville" [level=2] [ref=e175]:
                  - text: Similar rooms
                  - generic [ref=e176]: near Kellyville
                - generic [ref=e177]:
                  - link "Studio in Parramatta $410/wk Studio in Parramatta Parramatta" [ref=e178] [cursor=pointer]:
                    - /url: /listing/11111111-1111-4111-8111-000000000002
                    - generic [ref=e179]:
                      - generic [ref=e180]:
                        - img "Studio in Parramatta" [ref=e181]
                        - generic [ref=e182]: $410/wk
                      - generic [ref=e183]:
                        - heading "Studio in Parramatta" [level=3] [ref=e184]
                        - generic [ref=e185]:
                          - img [ref=e186]
                          - text: Parramatta
                  - link "Room with unverified host $250/wk Room with unverified host Kellyville" [ref=e189] [cursor=pointer]:
                    - /url: /listing/11111111-1111-4111-8111-000000000003
                    - generic [ref=e190]:
                      - generic [ref=e191]:
                        - img "Room with unverified host" [ref=e192]
                        - generic [ref=e193]: $250/wk
                      - generic [ref=e194]:
                        - heading "Room with unverified host" [level=3] [ref=e195]
                        - generic [ref=e196]:
                          - img [ref=e197]
                          - text: Kellyville
                - link "View all rooms in Kellyville" [ref=e200] [cursor=pointer]:
                  - /url: /seeker/search?suburb=Kellyville
              - list [ref=e202]:
                - listitem [ref=e203]:
                  - img [ref=e204]
                  - generic [ref=e207]:
                    - paragraph [ref=e208]: Host verification
                    - paragraph [ref=e209]:
                      - text: Government ID checked before a room goes live.
                      - link "What that does and does not mean" [ref=e210] [cursor=pointer]:
                        - /url: /safety-verification
                - listitem [ref=e211]:
                  - img [ref=e212]
                  - generic [ref=e215]:
                    - paragraph [ref=e216]: Renters pay $0
                    - paragraph [ref=e217]: MigRent never holds your rent or bond. Hosts pay a fee to MigRent; renters do not.
                - listitem [ref=e218]:
                  - img [ref=e219]
                  - generic [ref=e222]:
                    - paragraph [ref=e223]: Support by email
                    - paragraph [ref=e224]:
                      - text: Email support, weekdays, Australian business hours. We aim to reply within one business day.
                      - link "migrentau@gmail.com" [ref=e225] [cursor=pointer]:
                        - /url: mailto:migrentau@gmail.com
            - generic [ref=e228]:
              - paragraph [ref=e229]: Sign in to request a booking
              - link "Sign in" [ref=e230] [cursor=pointer]:
                - /url: /signin?redirect=%2Flisting%2F11111111-1111-4111-8111-000000000001
              - paragraph [ref=e231]:
                - text: New to MigRent?
                - link "Create an account" [ref=e232] [cursor=pointer]:
                  - /url: /signup
        - generic [ref=e234]:
          - generic [ref=e235]:
            - generic [ref=e236]: $320
            - text: / week
          - link "Sign in to book" [ref=e237] [cursor=pointer]:
            - /url: /signin?redirect=%2Flisting%2F11111111-1111-4111-8111-000000000001
    - contentinfo [ref=e238]:
      - generic [ref=e239]:
        - generic [ref=e240]:
          - generic [ref=e241]:
            - link "MigRent MigRent" [ref=e242] [cursor=pointer]:
              - /url: /
              - img "MigRent" [ref=e243]
              - generic [ref=e246]: MigRent
            - heading "A real home in Australia, found the right way." [level=2] [ref=e247]
            - generic [ref=e248]:
              - generic [ref=e249]:
                - img [ref=e250]
                - text: ID-verified hosts
              - generic [ref=e253]:
                - img [ref=e254]
                - text: Bond lodged properly
              - generic [ref=e257]:
                - img [ref=e258]
                - text: $0 renter fees
              - generic [ref=e261]:
                - img [ref=e262]
                - text: Mentor network
          - generic [ref=e264]:
            - paragraph [ref=e265]: Verified rooms for migrants, students, and new arrivals - no rental history needed.
            - generic [ref=e266]:
              - link "I'm a Seeker" [ref=e267] [cursor=pointer]:
                - /url: /for-seekers
                - text: I'm a Seeker
                - generic [ref=e268]: →
              - link "I'm an Owner" [ref=e269] [cursor=pointer]:
                - /url: /for-owners
        - generic [ref=e270]:
          - generic [ref=e271]:
            - heading "For seekers" [level=3] [ref=e272]
            - list [ref=e273]:
              - listitem [ref=e274]:
                - link "Search rooms" [ref=e275] [cursor=pointer]:
                  - /url: /seeker/search
              - listitem [ref=e276]:
                - link "How it works" [ref=e277] [cursor=pointer]:
                  - /url: /for-seekers
              - listitem [ref=e278]:
                - link "FAQ" [ref=e279] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e280]:
                - link "Guides" [ref=e281] [cursor=pointer]:
                  - /url: /guides
              - listitem [ref=e282]:
                - link "Tenant rights" [ref=e283] [cursor=pointer]:
                  - /url: /resources/rental-laws
          - generic [ref=e284]:
            - heading "For owners" [level=3] [ref=e285]
            - list [ref=e286]:
              - listitem [ref=e287]:
                - link "List a room" [ref=e288] [cursor=pointer]:
                  - /url: /for-owners
              - listitem [ref=e289]:
                - link "Pricing" [ref=e290] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e291]:
                - link "Owner dashboard" [ref=e292] [cursor=pointer]:
                  - /url: /dashboard/owner
              - listitem [ref=e293]:
                - link "Safety & verification" [ref=e294] [cursor=pointer]:
                  - /url: /safety-verification
              - listitem [ref=e295]:
                - link "Become a mentor" [ref=e296] [cursor=pointer]:
                  - /url: /become-mentor
          - generic [ref=e297]:
            - heading "Explore" [level=3] [ref=e298]
            - list [ref=e299]:
              - listitem [ref=e300]:
                - link "Features" [ref=e301] [cursor=pointer]:
                  - /url: /features
              - listitem [ref=e302]:
                - link "Suburb guides" [ref=e303] [cursor=pointer]:
                  - /url: /suburbs
              - listitem [ref=e304]:
                - link "Mentors" [ref=e305] [cursor=pointer]:
                  - /url: /mentors
              - listitem [ref=e306]:
                - link "Resources" [ref=e307] [cursor=pointer]:
                  - /url: /resources
              - listitem [ref=e308]:
                - link "Help centre" [ref=e309] [cursor=pointer]:
                  - /url: /help
              - listitem [ref=e310]:
                - link "Blog" [ref=e311] [cursor=pointer]:
                  - /url: /blog
          - generic [ref=e312]:
            - heading "Company" [level=3] [ref=e313]
            - list [ref=e314]:
              - listitem [ref=e315]:
                - link "About" [ref=e316] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e317]:
                - link "Careers" [ref=e318] [cursor=pointer]:
                  - /url: /careers
              - listitem [ref=e319]:
                - link "Press" [ref=e320] [cursor=pointer]:
                  - /url: /press
              - listitem [ref=e321]:
                - link "Contact" [ref=e322] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e323]:
            - heading "Trust & safety" [level=3] [ref=e324]
            - list [ref=e325]:
              - listitem [ref=e326]:
                - link "Bond protection" [ref=e327] [cursor=pointer]:
                  - /url: /safety-reporting
              - listitem [ref=e328]:
                - link "Community rules" [ref=e329] [cursor=pointer]:
                  - /url: /rules-community-guidelines
              - listitem [ref=e330]:
                - link "Code of conduct" [ref=e331] [cursor=pointer]:
                  - /url: /code-of-conduct
              - listitem [ref=e332]:
                - link "Anti-discrimination" [ref=e333] [cursor=pointer]:
                  - /url: /anti-discrimination
              - listitem [ref=e334]:
                - link "Support & disputes" [ref=e335] [cursor=pointer]:
                  - /url: /support-disputes
          - generic [ref=e336]:
            - heading "Legal" [level=3] [ref=e337]
            - list [ref=e338]:
              - listitem [ref=e339]:
                - link "Terms of service" [ref=e340] [cursor=pointer]:
                  - /url: /terms-of-service
              - listitem [ref=e341]:
                - link "Privacy policy" [ref=e342] [cursor=pointer]:
                  - /url: /privacy-policy
              - listitem [ref=e343]:
                - link "Cookie policy" [ref=e344] [cursor=pointer]:
                  - /url: /cookie-policy
              - listitem [ref=e345]:
                - link "Disclaimer" [ref=e346] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e347]:
                - link "ABN terms" [ref=e348] [cursor=pointer]:
                  - /url: /abn-terms
        - generic [ref=e349]:
          - generic [ref=e350]: © 2026 MigRent · ABN 22 669 566 941 · Australia
          - generic [ref=e351]:
            - generic [ref=e352]: Australia (English)
            - generic [ref=e353]: AUD $
            - link "Report a problem" [ref=e354] [cursor=pointer]:
              - /url: /contact
    - button "MigRent Support" [ref=e355]:
      - img [ref=e356]
  - alert [ref=e358]
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