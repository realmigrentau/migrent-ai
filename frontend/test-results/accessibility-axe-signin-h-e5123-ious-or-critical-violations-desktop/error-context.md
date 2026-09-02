# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> axe: /signin has no serious or critical violations
- Location: tests/e2e/accessibility.spec.ts:7:7

# Error details

```
Error: [
  {
    "id": "color-contrast",
    "nodes": [
      [
        ".text-\\[11px\\]"
      ],
      [
        ".text-\\[56px\\]"
      ],
      [
        ".opacity-75"
      ]
    ]
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 233

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
+               "bgColor": "#1d6475",
+               "contrastRatio": 3.38,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#9dbec4",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.38 (foreground color: #9dbec4, background color: #1d6475, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"hidden lg:flex flex-col justify-between p-14 bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]\">",
+                 "target": Array [
+                   ".p-14",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.38 (foreground color: #9dbec4, background color: #1d6475, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<div class=\"font-mono text-[11px] uppercase tracking-[0.08em] opacity-60\">Verified hosts across Australia</div>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-\\[11px\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1d6475",
+               "contrastRatio": 2.17,
+               "expectedContrastRatio": "3:1",
+               "fgColor": "#1e2a36",
+               "fontSize": "42.0pt (56px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.17 (foreground color: #1e2a36, background color: #1d6475, font size: 42.0pt (56px), font weight: normal). Expected contrast ratio of 3:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"hidden lg:flex flex-col justify-between p-14 bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]\">",
+                 "target": Array [
+                   ".p-14",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.17 (foreground color: #1e2a36, background color: #1d6475, font size: 42.0pt (56px), font weight: normal). Expected contrast ratio of 3:1",
+         "html": "<h2 class=\"font-serif text-[56px] leading-[1.02] tracking-[-0.025em] mt-3 text-balance\">The lease begins<br><span class=\"opacity-75\">at hello.</span></h2>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-\\[56px\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1d6475",
+               "contrastRatio": 1.81,
+               "expectedContrastRatio": "3:1",
+               "fgColor": "#1e3946",
+               "fontSize": "42.0pt (56px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 1.81 (foreground color: #1e3946, background color: #1d6475, font size: 42.0pt (56px), font weight: normal). Expected contrast ratio of 3:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"hidden lg:flex flex-col justify-between p-14 bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]\">",
+                 "target": Array [
+                   ".p-14",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 1.81 (foreground color: #1e3946, background color: #1d6475, font size: 42.0pt (56px), font weight: normal). Expected contrast ratio of 3:1",
+         "html": "<span class=\"opacity-75\">at hello.</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".opacity-75",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1d6475",
+               "contrastRatio": 3.38,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#9dbec4",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.38 (foreground color: #9dbec4, background color: #1d6475, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"hidden lg:flex flex-col justify-between p-14 bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]\">",
+                 "target": Array [
+                   ".p-14",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.38 (foreground color: #9dbec4, background color: #1d6475, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span>ID-verified hosts</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".gap-x-4 > span:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1d6475",
+               "contrastRatio": 3.38,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#9dbec4",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.38 (foreground color: #9dbec4, background color: #1d6475, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"hidden lg:flex flex-col justify-between p-14 bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]\">",
+                 "target": Array [
+                   ".p-14",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.38 (foreground color: #9dbec4, background color: #1d6475, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span>Bond lodged properly</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".gap-x-4 > span:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1d6475",
+               "contrastRatio": 3.38,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#9dbec4",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.38 (foreground color: #9dbec4, background color: #1d6475, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"hidden lg:flex flex-col justify-between p-14 bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]\">",
+                 "target": Array [
+                   ".p-14",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.38 (foreground color: #9dbec4, background color: #1d6475, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span>$0 renter fees</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "span:nth-child(5)",
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
          - link "MigRent MigRent" [ref=e48] [cursor=pointer]:
            - /url: /
            - img "MigRent" [ref=e49]
            - generic [ref=e52]: MigRent
          - generic [ref=e53]:
            - generic [ref=e54]: Verified hosts across Australia
            - heading "The lease begins at hello." [level=2] [ref=e55]:
              - text: The lease begins
              - text: at hello.
            - paragraph [ref=e56]: MigRent helps people new to Australia find a place to live - without a rental history, a guarantor, or a stack of paperwork.
          - generic [ref=e57]:
            - generic [ref=e58]: ID-verified hosts
            - generic [ref=e59]: ·
            - generic [ref=e60]: Bond lodged properly
            - generic [ref=e61]: ·
            - generic [ref=e62]: $0 renter fees
        - generic [ref=e64]:
          - generic [ref=e65]: Sign in
          - heading "Sign in to MigRent" [level=1] [ref=e66]:
            - text: Sign in to
            - text: MigRent
          - paragraph [ref=e67]:
            - text: New here?
            - link "Create an account →" [ref=e68] [cursor=pointer]:
              - /url: /signup
          - generic [ref=e69]:
            - generic [ref=e70]:
              - generic [ref=e71]: Email
              - textbox "Email" [ref=e72]:
                - /placeholder: you@example.com
            - generic [ref=e73]:
              - generic [ref=e74]: Password
              - textbox "Password" [ref=e75]
            - link "Forgot password?" [ref=e77] [cursor=pointer]:
              - /url: /forgot-password
            - button "Sign in" [ref=e78] [cursor=pointer]:
              - text: Sign in
              - img [ref=e79]
          - generic [ref=e83]: Or continue with
          - button "Continue with Google" [ref=e85]:
            - img [ref=e86]
            - text: Continue with Google
          - alert
          - paragraph [ref=e91]:
            - text: By continuing you agree to our
            - link "Terms" [ref=e92] [cursor=pointer]:
              - /url: /terms-of-service
            - text: and
            - link "Privacy Policy" [ref=e93] [cursor=pointer]:
              - /url: /privacy-policy
            - text: . MigRent never asks for bond outside the platform.
    - contentinfo [ref=e94]:
      - generic [ref=e95]:
        - generic [ref=e96]:
          - generic [ref=e97]:
            - link "MigRent MigRent" [ref=e98] [cursor=pointer]:
              - /url: /
              - img "MigRent" [ref=e99]
              - generic [ref=e102]: MigRent
            - heading "A real home in Australia, found the right way." [level=2] [ref=e103]
            - generic [ref=e104]:
              - generic [ref=e105]:
                - img [ref=e106]
                - text: ID-verified hosts
              - generic [ref=e109]:
                - img [ref=e110]
                - text: Bond lodged properly
              - generic [ref=e113]:
                - img [ref=e114]
                - text: $0 renter fees
              - generic [ref=e117]:
                - img [ref=e118]
                - text: Mentor network
          - generic [ref=e120]:
            - paragraph [ref=e121]: Verified rooms for migrants, students, and new arrivals - no rental history needed.
            - generic [ref=e122]:
              - link "I'm a Seeker" [ref=e123] [cursor=pointer]:
                - /url: /for-seekers
                - text: I'm a Seeker
                - generic [ref=e124]: →
              - link "I'm an Owner" [ref=e125] [cursor=pointer]:
                - /url: /for-owners
        - generic [ref=e126]:
          - generic [ref=e127]:
            - heading "For seekers" [level=3] [ref=e128]
            - list [ref=e129]:
              - listitem [ref=e130]:
                - link "Search rooms" [ref=e131] [cursor=pointer]:
                  - /url: /seeker/search
              - listitem [ref=e132]:
                - link "How it works" [ref=e133] [cursor=pointer]:
                  - /url: /for-seekers
              - listitem [ref=e134]:
                - link "FAQ" [ref=e135] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e136]:
                - link "Guides" [ref=e137] [cursor=pointer]:
                  - /url: /guides
              - listitem [ref=e138]:
                - link "Tenant rights" [ref=e139] [cursor=pointer]:
                  - /url: /resources/rental-laws
          - generic [ref=e140]:
            - heading "For owners" [level=3] [ref=e141]
            - list [ref=e142]:
              - listitem [ref=e143]:
                - link "List a room" [ref=e144] [cursor=pointer]:
                  - /url: /for-owners
              - listitem [ref=e145]:
                - link "Pricing" [ref=e146] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e147]:
                - link "Owner dashboard" [ref=e148] [cursor=pointer]:
                  - /url: /dashboard/owner
              - listitem [ref=e149]:
                - link "Safety & verification" [ref=e150] [cursor=pointer]:
                  - /url: /safety-verification
              - listitem [ref=e151]:
                - link "Become a mentor" [ref=e152] [cursor=pointer]:
                  - /url: /become-mentor
          - generic [ref=e153]:
            - heading "Explore" [level=3] [ref=e154]
            - list [ref=e155]:
              - listitem [ref=e156]:
                - link "Features" [ref=e157] [cursor=pointer]:
                  - /url: /features
              - listitem [ref=e158]:
                - link "Suburb guides" [ref=e159] [cursor=pointer]:
                  - /url: /suburbs
              - listitem [ref=e160]:
                - link "Mentors" [ref=e161] [cursor=pointer]:
                  - /url: /mentors
              - listitem [ref=e162]:
                - link "Resources" [ref=e163] [cursor=pointer]:
                  - /url: /resources
              - listitem [ref=e164]:
                - link "Help centre" [ref=e165] [cursor=pointer]:
                  - /url: /help
              - listitem [ref=e166]:
                - link "Blog" [ref=e167] [cursor=pointer]:
                  - /url: /blog
          - generic [ref=e168]:
            - heading "Company" [level=3] [ref=e169]
            - list [ref=e170]:
              - listitem [ref=e171]:
                - link "About" [ref=e172] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e173]:
                - link "Careers" [ref=e174] [cursor=pointer]:
                  - /url: /careers
              - listitem [ref=e175]:
                - link "Press" [ref=e176] [cursor=pointer]:
                  - /url: /press
              - listitem [ref=e177]:
                - link "Contact" [ref=e178] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e179]:
            - heading "Trust & safety" [level=3] [ref=e180]
            - list [ref=e181]:
              - listitem [ref=e182]:
                - link "Bond protection" [ref=e183] [cursor=pointer]:
                  - /url: /safety-reporting
              - listitem [ref=e184]:
                - link "Community rules" [ref=e185] [cursor=pointer]:
                  - /url: /rules-community-guidelines
              - listitem [ref=e186]:
                - link "Code of conduct" [ref=e187] [cursor=pointer]:
                  - /url: /code-of-conduct
              - listitem [ref=e188]:
                - link "Anti-discrimination" [ref=e189] [cursor=pointer]:
                  - /url: /anti-discrimination
              - listitem [ref=e190]:
                - link "Support & disputes" [ref=e191] [cursor=pointer]:
                  - /url: /support-disputes
          - generic [ref=e192]:
            - heading "Legal" [level=3] [ref=e193]
            - list [ref=e194]:
              - listitem [ref=e195]:
                - link "Terms of service" [ref=e196] [cursor=pointer]:
                  - /url: /terms-of-service
              - listitem [ref=e197]:
                - link "Privacy policy" [ref=e198] [cursor=pointer]:
                  - /url: /privacy-policy
              - listitem [ref=e199]:
                - link "Cookie policy" [ref=e200] [cursor=pointer]:
                  - /url: /cookie-policy
              - listitem [ref=e201]:
                - link "Disclaimer" [ref=e202] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e203]:
                - link "ABN terms" [ref=e204] [cursor=pointer]:
                  - /url: /abn-terms
        - generic [ref=e205]:
          - generic [ref=e206]: © 2026 MigRent · ABN 22 669 566 941 · Australia
          - generic [ref=e207]:
            - generic [ref=e208]: Australia (English)
            - generic [ref=e209]: AUD $
            - link "Report a problem" [ref=e210] [cursor=pointer]:
              - /url: /contact
    - button "MigRent Support" [ref=e211]:
      - img [ref=e212]
  - alert [ref=e214]
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