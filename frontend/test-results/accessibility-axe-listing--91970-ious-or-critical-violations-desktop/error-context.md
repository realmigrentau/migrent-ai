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
        - generic [ref=e48]:
          - button "Go back" [ref=e49]:
            - img [ref=e50]
          - generic [ref=e52]:
            - paragraph [ref=e53]: Sunny room near the station
            - generic [ref=e55]: Kellyville
          - generic [ref=e57]: $320/wk
        - generic [ref=e58]:
          - generic [ref=e60]:
            - button "Open photo 1 of 1 in full screen" [ref=e61]
            - img "Sunny room near the station, photo 1 of 1" [ref=e62]
            - generic [ref=e65]:
              - img [ref=e66]
              - text: ID verified host
            - generic:
              - generic:
                - img
                - text: View all photos
          - generic [ref=e69]:
            - heading "Sunny room near the station" [level=1] [ref=e70]
            - generic [ref=e71]:
              - img [ref=e72]
              - generic [ref=e75]: Kellyville 2155
            - paragraph [ref=e76]: Street address is shared once a booking is agreed.
          - generic [ref=e77]:
            - generic [ref=e78]:
              - region "About this place" [ref=e79]:
                - heading "About this place" [level=2] [ref=e80]
                - paragraph [ref=e81]: A bright private room with a window, five minutes from the station.
              - button "What will this really cost you? Enter your uni/work - see true weekly cost" [ref=e83]:
                - generic [ref=e84]:
                  - img [ref=e86]
                  - generic [ref=e88]:
                    - paragraph [ref=e89]: What will this really cost you?
                    - paragraph [ref=e90]: Enter your uni/work - see true weekly cost
                - img [ref=e91]
              - generic [ref=e93]:
                - generic [ref=e94]:
                  - heading "Pricing" [level=3] [ref=e95]:
                    - img [ref=e96]
                    - text: Pricing
                  - generic [ref=e98]:
                    - generic [ref=e99]: $320
                    - generic [ref=e100]: / week
                  - generic [ref=e101]: Bills not included - budget extra
                - generic [ref=e102]:
                  - heading "Property" [level=3] [ref=e103]
                  - generic [ref=e104]:
                    - generic [ref=e105]:
                      - img [ref=e106]
                      - text: house - private
                    - generic [ref=e109]:
                      - img [ref=e110]
                      - text: 1 bed
                    - generic [ref=e112]:
                      - img [ref=e113]
                      - text: 1 bath
                    - generic [ref=e116]:
                      - img [ref=e117]
                      - text: Max 2 guests
                - generic [ref=e122]:
                  - heading "Amenities" [level=3] [ref=e123]
                  - generic [ref=e125]:
                    - img [ref=e126]
                    - generic [ref=e129]: Furnished
                - generic [ref=e130]:
                  - heading "Availability" [level=3] [ref=e131]:
                    - img [ref=e132]
                    - text: Availability
                  - generic [ref=e134]:
                    - paragraph [ref=e135]: Available from 23 Aug 2026
                    - paragraph [ref=e136]: Until 31 Dec 2026
                    - paragraph [ref=e137]: "Min stay: 4 weeks"
                - generic [ref=e138]:
                  - heading "Location" [level=3] [ref=e139]:
                    - img [ref=e140]
                    - text: Location
                  - paragraph [ref=e144]: Kellyville - 6 min walk
                  - paragraph [ref=e145]: Map unavailable on this device.
                  - paragraph [ref=e146]: Approximate area only. The exact address is shared once the host accepts your booking.
              - generic [ref=e147]:
                - heading "Your host" [level=2] [ref=e148]
                - generic [ref=e149]:
                  - generic [ref=e150]: V
                  - generic [ref=e151]:
                    - paragraph [ref=e152]:
                      - link "Verified Owner" [ref=e153] [cursor=pointer]:
                        - /url: /users/profile/pubverif02
                    - generic [ref=e154]:
                      - generic [ref=e155]:
                        - img [ref=e156]
                        - text: 2 live listings
                      - generic [ref=e159]: Member since Jan 2026
                    - paragraph [ref=e160]: Long-time host in Kellyville.
                    - list "Host achievements" [ref=e161]:
                      - listitem [ref=e162]: Superhost
                - generic [ref=e163]:
                  - generic [ref=e164]:
                    - img [ref=e166]
                    - paragraph [ref=e169]: ID verified host
                  - list [ref=e170]:
                    - listitem [ref=e171]:
                      - generic [ref=e172]: Email confirmed
                      - generic [ref=e173]: Confirmed
                    - listitem [ref=e174]:
                      - generic [ref=e175]: Phone confirmed
                      - generic [ref=e176]: Confirmed
                    - listitem [ref=e177]:
                      - generic [ref=e178]: Government ID checked
                      - generic [ref=e179]: Checked June 2026
                  - paragraph [ref=e180]:
                    - text: Verification confirms documents were checked. It is not a guarantee of safety or suitability.
                    - link "How verification works" [ref=e181] [cursor=pointer]:
                      - /url: /safety-verification
                - link "Message Verified Owner" [ref=e182] [cursor=pointer]:
                  - /url: /messages?listing=11111111-1111-4111-8111-000000000001&to=pubverif02
                  - img [ref=e183]
                  - text: Message Verified Owner
              - generic [ref=e185]:
                - heading "Reviews" [level=2] [ref=e186]
                - generic [ref=e187]:
                  - img [ref=e188]
                  - text: No reviews yet
                - paragraph [ref=e190]: No reviews yet. Be the first to book and review this place.
              - generic [ref=e191]:
                - heading "Similar roomsnear Kellyville" [level=2] [ref=e192]:
                  - text: Similar rooms
                  - generic [ref=e193]: near Kellyville
                - generic [ref=e194]:
                  - link "Studio in Parramatta $410/wk Studio in Parramatta Parramatta" [ref=e195] [cursor=pointer]:
                    - /url: /listing/11111111-1111-4111-8111-000000000002
                    - generic [ref=e196]:
                      - generic [ref=e197]:
                        - img "Studio in Parramatta" [ref=e198]
                        - generic [ref=e199]: $410/wk
                      - generic [ref=e200]:
                        - heading "Studio in Parramatta" [level=3] [ref=e201]
                        - generic [ref=e202]:
                          - img [ref=e203]
                          - text: Parramatta
                  - link "Room with unverified host $250/wk Room with unverified host Kellyville" [ref=e206] [cursor=pointer]:
                    - /url: /listing/11111111-1111-4111-8111-000000000003
                    - generic [ref=e207]:
                      - generic [ref=e208]:
                        - img "Room with unverified host" [ref=e209]
                        - generic [ref=e210]: $250/wk
                      - generic [ref=e211]:
                        - heading "Room with unverified host" [level=3] [ref=e212]
                        - generic [ref=e213]:
                          - img [ref=e214]
                          - text: Kellyville
                - link "View all rooms in Kellyville" [ref=e217] [cursor=pointer]:
                  - /url: /seeker/search?suburb=Kellyville
              - list [ref=e219]:
                - listitem [ref=e220]:
                  - img [ref=e221]
                  - generic [ref=e224]:
                    - paragraph [ref=e225]: Host verification
                    - paragraph [ref=e226]:
                      - text: Government ID checked before a room goes live.
                      - link "What that does and does not mean" [ref=e227] [cursor=pointer]:
                        - /url: /safety-verification
                - listitem [ref=e228]:
                  - img [ref=e229]
                  - generic [ref=e232]:
                    - paragraph [ref=e233]: Renters pay $0
                    - paragraph [ref=e234]: MigRent never holds your rent or bond. Hosts pay a fee to MigRent; renters do not.
                - listitem [ref=e235]:
                  - img [ref=e236]
                  - generic [ref=e239]:
                    - paragraph [ref=e240]: Support by email
                    - paragraph [ref=e241]:
                      - text: Email support, weekdays, Australian business hours. We aim to reply within one business day.
                      - link "migrentau@gmail.com" [ref=e242] [cursor=pointer]:
                        - /url: mailto:migrentau@gmail.com
            - generic [ref=e245]:
              - paragraph [ref=e246]: Sign in to request a booking
              - link "Sign in" [ref=e247] [cursor=pointer]:
                - /url: /signin?redirect=%2Flisting%2F11111111-1111-4111-8111-000000000001
              - paragraph [ref=e248]:
                - text: New to MigRent?
                - link "Create an account" [ref=e249] [cursor=pointer]:
                  - /url: /signup
    - contentinfo [ref=e250]:
      - generic [ref=e251]:
        - generic [ref=e252]:
          - generic [ref=e253]:
            - link "MigRent MigRent" [ref=e254] [cursor=pointer]:
              - /url: /
              - img "MigRent" [ref=e255]
              - generic [ref=e258]: MigRent
            - heading "A real home in Australia, found the right way." [level=2] [ref=e259]
            - generic [ref=e260]:
              - generic [ref=e261]:
                - img [ref=e262]
                - text: ID-verified hosts
              - generic [ref=e265]:
                - img [ref=e266]
                - text: Bond lodged properly
              - generic [ref=e269]:
                - img [ref=e270]
                - text: $0 renter fees
              - generic [ref=e273]:
                - img [ref=e274]
                - text: Mentor network
          - generic [ref=e276]:
            - paragraph [ref=e277]: Verified rooms for migrants, students, and new arrivals - no rental history needed.
            - generic [ref=e278]:
              - link "I'm a Seeker" [ref=e279] [cursor=pointer]:
                - /url: /for-seekers
                - text: I'm a Seeker
                - generic [ref=e280]: →
              - link "I'm an Owner" [ref=e281] [cursor=pointer]:
                - /url: /for-owners
        - generic [ref=e282]:
          - generic [ref=e283]:
            - heading "For seekers" [level=3] [ref=e284]
            - list [ref=e285]:
              - listitem [ref=e286]:
                - link "Search rooms" [ref=e287] [cursor=pointer]:
                  - /url: /seeker/search
              - listitem [ref=e288]:
                - link "How it works" [ref=e289] [cursor=pointer]:
                  - /url: /for-seekers
              - listitem [ref=e290]:
                - link "FAQ" [ref=e291] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e292]:
                - link "Guides" [ref=e293] [cursor=pointer]:
                  - /url: /guides
              - listitem [ref=e294]:
                - link "Tenant rights" [ref=e295] [cursor=pointer]:
                  - /url: /resources/rental-laws
          - generic [ref=e296]:
            - heading "For owners" [level=3] [ref=e297]
            - list [ref=e298]:
              - listitem [ref=e299]:
                - link "List a room" [ref=e300] [cursor=pointer]:
                  - /url: /for-owners
              - listitem [ref=e301]:
                - link "Pricing" [ref=e302] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e303]:
                - link "Owner dashboard" [ref=e304] [cursor=pointer]:
                  - /url: /dashboard/owner
              - listitem [ref=e305]:
                - link "Safety & verification" [ref=e306] [cursor=pointer]:
                  - /url: /safety-verification
              - listitem [ref=e307]:
                - link "Become a mentor" [ref=e308] [cursor=pointer]:
                  - /url: /become-mentor
          - generic [ref=e309]:
            - heading "Explore" [level=3] [ref=e310]
            - list [ref=e311]:
              - listitem [ref=e312]:
                - link "Features" [ref=e313] [cursor=pointer]:
                  - /url: /features
              - listitem [ref=e314]:
                - link "Suburb guides" [ref=e315] [cursor=pointer]:
                  - /url: /suburbs
              - listitem [ref=e316]:
                - link "Mentors" [ref=e317] [cursor=pointer]:
                  - /url: /mentors
              - listitem [ref=e318]:
                - link "Resources" [ref=e319] [cursor=pointer]:
                  - /url: /resources
              - listitem [ref=e320]:
                - link "Help centre" [ref=e321] [cursor=pointer]:
                  - /url: /help
              - listitem [ref=e322]:
                - link "Blog" [ref=e323] [cursor=pointer]:
                  - /url: /blog
          - generic [ref=e324]:
            - heading "Company" [level=3] [ref=e325]
            - list [ref=e326]:
              - listitem [ref=e327]:
                - link "About" [ref=e328] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e329]:
                - link "Careers" [ref=e330] [cursor=pointer]:
                  - /url: /careers
              - listitem [ref=e331]:
                - link "Press" [ref=e332] [cursor=pointer]:
                  - /url: /press
              - listitem [ref=e333]:
                - link "Contact" [ref=e334] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e335]:
            - heading "Trust & safety" [level=3] [ref=e336]
            - list [ref=e337]:
              - listitem [ref=e338]:
                - link "Bond protection" [ref=e339] [cursor=pointer]:
                  - /url: /safety-reporting
              - listitem [ref=e340]:
                - link "Community rules" [ref=e341] [cursor=pointer]:
                  - /url: /rules-community-guidelines
              - listitem [ref=e342]:
                - link "Code of conduct" [ref=e343] [cursor=pointer]:
                  - /url: /code-of-conduct
              - listitem [ref=e344]:
                - link "Anti-discrimination" [ref=e345] [cursor=pointer]:
                  - /url: /anti-discrimination
              - listitem [ref=e346]:
                - link "Support & disputes" [ref=e347] [cursor=pointer]:
                  - /url: /support-disputes
          - generic [ref=e348]:
            - heading "Legal" [level=3] [ref=e349]
            - list [ref=e350]:
              - listitem [ref=e351]:
                - link "Terms of service" [ref=e352] [cursor=pointer]:
                  - /url: /terms-of-service
              - listitem [ref=e353]:
                - link "Privacy policy" [ref=e354] [cursor=pointer]:
                  - /url: /privacy-policy
              - listitem [ref=e355]:
                - link "Cookie policy" [ref=e356] [cursor=pointer]:
                  - /url: /cookie-policy
              - listitem [ref=e357]:
                - link "Disclaimer" [ref=e358] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e359]:
                - link "ABN terms" [ref=e360] [cursor=pointer]:
                  - /url: /abn-terms
        - generic [ref=e361]:
          - generic [ref=e362]: © 2026 MigRent · ABN 22 669 566 941 · Australia
          - generic [ref=e363]:
            - generic [ref=e364]: Australia (English)
            - generic [ref=e365]: AUD $
            - link "Report a problem" [ref=e366] [cursor=pointer]:
              - /url: /contact
    - button "MigRent Support" [ref=e367]:
      - img [ref=e368]
  - alert [ref=e370]
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