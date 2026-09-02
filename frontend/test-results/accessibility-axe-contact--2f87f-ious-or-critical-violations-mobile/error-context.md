# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> axe: /contact has no serious or critical violations
- Location: tests/e2e/accessibility.spec.ts:7:7

# Error details

```
Error: [
  {
    "id": "color-contrast",
    "nodes": [
      [
        ".py-1"
      ],
      [
        ".text-\\[10px\\]"
      ],
      [
        ".opacity-80 > .leading-relaxed.text-xs"
      ]
    ]
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 134

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
+               "bgColor": "#d2e9f7",
+               "contrastRatio": 2.49,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#2e9bd0",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.49 (foreground color: #2e9bd0, background color: #d2e9f7, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium\">",
+                 "target": Array [
+                   ".py-1",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.49 (foreground color: #2e9bd0, background color: #d2e9f7, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".py-1",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e8e1d3",
+               "contrastRatio": 3.25,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#747c84",
+               "fontSize": "7.5pt (10px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.25 (foreground color: #747c84, background color: #e8e1d3, font size: 7.5pt (10px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-3)] font-medium uppercase tracking-wide\">Launching soon</span>",
+                 "target": Array [
+                   ".text-\\[10px\\]",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.25 (foreground color: #747c84, background color: #e8e1d3, font size: 7.5pt (10px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-3)] font-medium uppercase tracking-wide\">Launching soon</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-\\[10px\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f4f1e9",
+               "contrastRatio": 3.75,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#747c84",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.75 (foreground color: #747c84, background color: #f4f1e9, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"card p-5 rounded-2xl opacity-80\">",
+                 "target": Array [
+                   ".opacity-80",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-ink)]\">",
+                 "target": Array [
+                   ".min-h-screen",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.75 (foreground color: #747c84, background color: #f4f1e9, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-xs text-[var(--color-ink-3)] leading-relaxed\">Peer help and community chat. We're finalising moderation before opening it up.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".opacity-80 > .leading-relaxed.text-xs",
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
          - generic [ref=e34]: Email support, weekdays, Australian business hours. We aim to reply within one business day.
          - heading "Contact MigRent" [level=1] [ref=e36]
          - paragraph [ref=e37]: Real humans. Real answers. Whether you're a seeker, an owner, or someone with a legal or safety concern - this page sorts you to the right place in seconds.
        - generic [ref=e38]:
          - link "I need help Account, listing, booking, payment - send a message and we aim to reply within one business day." [ref=e39] [cursor=pointer]:
            - /url: "#contact-form"
            - img [ref=e41]
            - heading "I need help" [level=3] [ref=e43]
            - paragraph [ref=e44]: Account, listing, booking, payment - send a message and we aim to reply within one business day.
          - link "I have a question Most answers are in our Help Center. Browse first - it's faster." [ref=e45] [cursor=pointer]:
            - /url: "#help-shortcut"
            - img [ref=e47]
            - heading "I have a question" [level=3] [ref=e49]
            - paragraph [ref=e50]: Most answers are in our Help Center. Browse first - it's faster.
          - link "Safety, legal or press Report a user, formal legal notice, or media enquiry - jump straight to the right channel." [ref=e51] [cursor=pointer]:
            - /url: "#escalation"
            - img [ref=e53]
            - heading "Safety, legal or press" [level=3] [ref=e55]
            - paragraph [ref=e56]: Report a user, formal legal notice, or media enquiry - jump straight to the right channel.
        - generic [ref=e57]:
          - generic [ref=e58]:
            - generic [ref=e59]:
              - heading "Quick answers" [level=2] [ref=e60]
              - paragraph [ref=e61]: Most questions are answered in seconds.
            - link "Browse all FAQs →" [ref=e62] [cursor=pointer]:
              - /url: /faq
          - generic [ref=e63]:
            - link "How does identity verification work?" [ref=e64] [cursor=pointer]:
              - /url: /faq
              - generic [ref=e65]: How does identity verification work?
              - img [ref=e66]
            - link "How do bookings and payments work?" [ref=e68] [cursor=pointer]:
              - /url: /faq
              - generic [ref=e69]: How do bookings and payments work?
              - img [ref=e70]
            - link "Can I cancel a booking?" [ref=e72] [cursor=pointer]:
              - /url: /faq
              - generic [ref=e73]: Can I cancel a booking?
              - img [ref=e74]
            - link "How do I list my property?" [ref=e76] [cursor=pointer]:
              - /url: /help
              - generic [ref=e77]: How do I list my property?
              - img [ref=e78]
            - link "Is MigRent only for migrants and students?" [ref=e80] [cursor=pointer]:
              - /url: /faq
              - generic [ref=e81]: Is MigRent only for migrants and students?
              - img [ref=e82]
            - link "How do I report a suspicious listing?" [ref=e84] [cursor=pointer]:
              - /url: /help
              - generic [ref=e85]: How do I report a suspicious listing?
              - img [ref=e86]
        - generic [ref=e88]:
          - generic [ref=e89]:
            - heading "Send us a message" [level=2] [ref=e90]
            - paragraph [ref=e91]: Tell us what's going on. We reply from migrentau@gmail.com within 24 hours on weekdays, 48 hours on weekends.
            - generic [ref=e92]:
              - paragraph [ref=e93]: Prefer email?
              - link "migrentau@gmail.com" [ref=e94] [cursor=pointer]:
                - /url: https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com
              - paragraph [ref=e95]: For faster routing, add a tag to your subject line - for example [BOOKING] or [SAFETY].
          - generic [ref=e97]:
            - generic [ref=e98]:
              - generic [ref=e99]:
                - generic [ref=e100]: Full name
                - textbox "Full name" [ref=e101]:
                  - /placeholder: Jane Doe
              - generic [ref=e102]:
                - generic [ref=e103]: Email
                - textbox "Email" [ref=e104]:
                  - /placeholder: you@example.com
            - generic [ref=e105]:
              - generic [ref=e106]: I am a
              - generic [ref=e107]:
                - button "Seeker" [ref=e108]
                - button "Owner" [ref=e109]
                - button "Other" [ref=e110]
            - generic [ref=e111]:
              - generic [ref=e112]:
                - generic [ref=e113]: Enquiry type
                - combobox "Enquiry type" [ref=e114]:
                  - option "Account help (login, password)"
                  - option "Verification help"
                  - option "Listing help (create, edit, photos)"
                  - option "Booking or payment"
                  - option "Safety or report a user"
                  - option "Legal, privacy or DMCA"
                  - option "Press or media"
                  - option "Partnerships or business"
                  - option "Something else" [selected]
                - paragraph [ref=e115]: We'll route it to the right person.
              - generic [ref=e116]:
                - generic [ref=e117]: Subject (optional)
                - textbox "Subject (optional)" [ref=e118]:
                  - /placeholder: Short summary
            - generic [ref=e119]:
              - generic [ref=e120]:
                - generic [ref=e121]: Message
                - generic [ref=e122]: 0/2000
              - textbox "Message" [ref=e123]:
                - /placeholder: Tell us what's going on. The more detail, the faster we can help.
            - generic [ref=e124]:
              - button "Send message" [ref=e125] [cursor=pointer]
              - paragraph [ref=e126]:
                - text: We use your email only to reply. See our
                - link "Privacy Policy" [ref=e127] [cursor=pointer]:
                  - /url: /privacy-policy
                - text: .
        - generic [ref=e128]:
          - generic [ref=e129]:
            - generic [ref=e130]:
              - img [ref=e132]
              - generic [ref=e134]:
                - heading "Safety or report a user" [level=3] [ref=e135]
                - paragraph [ref=e136]: Scams, harassment, suspicious listings.
            - paragraph [ref=e137]: Use the Report button on any listing or profile, or email us with the subject line [SAFETY]. We respond within 24 hours, 7 days a week.
            - link "Email the safety team" [ref=e138] [cursor=pointer]:
              - /url: https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=%5BSAFETY%5D
              - text: Email the safety team
              - img [ref=e139]
          - generic [ref=e141]:
            - generic [ref=e142]:
              - img [ref=e144]
              - generic [ref=e146]:
                - heading "Legal, privacy or DMCA" [level=3] [ref=e147]
                - paragraph [ref=e148]: Formal notices, data requests, arbitration.
            - paragraph [ref=e149]: Our Legal Contact page has dedicated subject lines for faster routing - privacy requests, copyright, arbitration, and more.
            - link "Open Legal Contact" [ref=e150] [cursor=pointer]:
              - /url: /contact-legal
              - text: Open Legal Contact
              - img [ref=e151]
        - generic [ref=e153]:
          - heading "Other ways to reach us" [level=2] [ref=e154]
          - generic [ref=e155]:
            - 'link "Press & media Subject: [PRESS] · 3-5 business days" [ref=e156] [cursor=pointer]':
              - /url: https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=%5BPRESS%5D
              - img [ref=e158]
              - heading "Press & media" [level=3] [ref=e160]
              - paragraph [ref=e161]: "Subject: [PRESS] · 3-5 business days"
            - link "Partnerships Universities, mentors, integrations" [ref=e162] [cursor=pointer]:
              - /url: https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=%5BPARTNERSHIPS%5D
              - img [ref=e164]
              - heading "Partnerships" [level=3] [ref=e166]
              - paragraph [ref=e167]: Universities, mentors, integrations
            - generic [ref=e168]:
              - img [ref=e170]
              - generic [ref=e172]:
                - heading "Discord community" [level=3] [ref=e173]
                - generic [ref=e174]: Launching soon
              - paragraph [ref=e175]: Peer help and community chat. We're finalising moderation before opening it up.
        - generic [ref=e176]:
          - generic [ref=e177]:
            - heading "Business details" [level=3] [ref=e178]
            - generic [ref=e179]:
              - paragraph [ref=e180]:
                - generic [ref=e181]: "Trading name:"
                - text: MigRent
              - paragraph [ref=e182]:
                - generic [ref=e183]: "ABN:"
                - text: 22 669 566 941
              - paragraph [ref=e184]:
                - generic [ref=e185]: "Location:"
                - text: Australia
              - paragraph [ref=e186]:
                - generic [ref=e187]: "Email:"
                - link "migrentau@gmail.com" [ref=e188] [cursor=pointer]:
                  - /url: mailto:migrentau@gmail.com
              - paragraph [ref=e189]: Entity details are being confirmed and will be published here.
          - generic [ref=e190]:
            - heading "A note from the founder" [level=3] [ref=e191]
            - paragraph [ref=e192]: Hi - I'm Anesh, the founder of MigRent. We're a small, focused team building MigRent for migrants and students in Australia. Email goes straight to a real human inbox. If something's not working or you just want to say hello, write to us. We read everything.
            - link "About MigRent" [ref=e193] [cursor=pointer]:
              - /url: /about
              - text: About MigRent
              - img [ref=e194]
        - generic [ref=e196]:
          - text: Still stuck? Email us anytime at
          - link "migrentau@gmail.com" [ref=e197] [cursor=pointer]:
            - /url: https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com
          - text: .
    - contentinfo [ref=e198]:
      - generic [ref=e199]:
        - generic [ref=e200]:
          - generic [ref=e201]:
            - link "MigRent MigRent" [ref=e202] [cursor=pointer]:
              - /url: /
              - img "MigRent" [ref=e203]
              - generic [ref=e206]: MigRent
            - heading "A real home in Australia, found the right way." [level=2] [ref=e207]
            - generic [ref=e208]:
              - generic [ref=e209]:
                - img [ref=e210]
                - text: ID-verified hosts
              - generic [ref=e213]:
                - img [ref=e214]
                - text: Bond lodged properly
              - generic [ref=e217]:
                - img [ref=e218]
                - text: $0 renter fees
              - generic [ref=e221]:
                - img [ref=e222]
                - text: Mentor network
          - generic [ref=e224]:
            - paragraph [ref=e225]: Verified rooms for migrants, students, and new arrivals - no rental history needed.
            - generic [ref=e226]:
              - link "I'm a Seeker" [ref=e227] [cursor=pointer]:
                - /url: /for-seekers
                - text: I'm a Seeker
                - generic [ref=e228]: →
              - link "I'm an Owner" [ref=e229] [cursor=pointer]:
                - /url: /for-owners
        - generic [ref=e230]:
          - generic [ref=e231]:
            - heading "For seekers" [level=3] [ref=e232]
            - list [ref=e233]:
              - listitem [ref=e234]:
                - link "Search rooms" [ref=e235] [cursor=pointer]:
                  - /url: /seeker/search
              - listitem [ref=e236]:
                - link "How it works" [ref=e237] [cursor=pointer]:
                  - /url: /for-seekers
              - listitem [ref=e238]:
                - link "FAQ" [ref=e239] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e240]:
                - link "Guides" [ref=e241] [cursor=pointer]:
                  - /url: /guides
              - listitem [ref=e242]:
                - link "Tenant rights" [ref=e243] [cursor=pointer]:
                  - /url: /resources/rental-laws
          - generic [ref=e244]:
            - heading "For owners" [level=3] [ref=e245]
            - list [ref=e246]:
              - listitem [ref=e247]:
                - link "List a room" [ref=e248] [cursor=pointer]:
                  - /url: /for-owners
              - listitem [ref=e249]:
                - link "Pricing" [ref=e250] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e251]:
                - link "Owner dashboard" [ref=e252] [cursor=pointer]:
                  - /url: /dashboard/owner
              - listitem [ref=e253]:
                - link "Safety & verification" [ref=e254] [cursor=pointer]:
                  - /url: /safety-verification
              - listitem [ref=e255]:
                - link "Become a mentor" [ref=e256] [cursor=pointer]:
                  - /url: /become-mentor
          - generic [ref=e257]:
            - heading "Explore" [level=3] [ref=e258]
            - list [ref=e259]:
              - listitem [ref=e260]:
                - link "Features" [ref=e261] [cursor=pointer]:
                  - /url: /features
              - listitem [ref=e262]:
                - link "Suburb guides" [ref=e263] [cursor=pointer]:
                  - /url: /suburbs
              - listitem [ref=e264]:
                - link "Mentors" [ref=e265] [cursor=pointer]:
                  - /url: /mentors
              - listitem [ref=e266]:
                - link "Resources" [ref=e267] [cursor=pointer]:
                  - /url: /resources
              - listitem [ref=e268]:
                - link "Help centre" [ref=e269] [cursor=pointer]:
                  - /url: /help
              - listitem [ref=e270]:
                - link "Blog" [ref=e271] [cursor=pointer]:
                  - /url: /blog
          - generic [ref=e272]:
            - heading "Company" [level=3] [ref=e273]
            - list [ref=e274]:
              - listitem [ref=e275]:
                - link "About" [ref=e276] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e277]:
                - link "Careers" [ref=e278] [cursor=pointer]:
                  - /url: /careers
              - listitem [ref=e279]:
                - link "Press" [ref=e280] [cursor=pointer]:
                  - /url: /press
              - listitem [ref=e281]:
                - link "Contact" [ref=e282] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e283]:
            - heading "Trust & safety" [level=3] [ref=e284]
            - list [ref=e285]:
              - listitem [ref=e286]:
                - link "Bond protection" [ref=e287] [cursor=pointer]:
                  - /url: /safety-reporting
              - listitem [ref=e288]:
                - link "Community rules" [ref=e289] [cursor=pointer]:
                  - /url: /rules-community-guidelines
              - listitem [ref=e290]:
                - link "Code of conduct" [ref=e291] [cursor=pointer]:
                  - /url: /code-of-conduct
              - listitem [ref=e292]:
                - link "Anti-discrimination" [ref=e293] [cursor=pointer]:
                  - /url: /anti-discrimination
              - listitem [ref=e294]:
                - link "Support & disputes" [ref=e295] [cursor=pointer]:
                  - /url: /support-disputes
          - generic [ref=e296]:
            - heading "Legal" [level=3] [ref=e297]
            - list [ref=e298]:
              - listitem [ref=e299]:
                - link "Terms of service" [ref=e300] [cursor=pointer]:
                  - /url: /terms-of-service
              - listitem [ref=e301]:
                - link "Privacy policy" [ref=e302] [cursor=pointer]:
                  - /url: /privacy-policy
              - listitem [ref=e303]:
                - link "Cookie policy" [ref=e304] [cursor=pointer]:
                  - /url: /cookie-policy
              - listitem [ref=e305]:
                - link "Disclaimer" [ref=e306] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e307]:
                - link "ABN terms" [ref=e308] [cursor=pointer]:
                  - /url: /abn-terms
        - generic [ref=e309]:
          - generic [ref=e310]: © 2026 MigRent · ABN 22 669 566 941 · Australia
          - generic [ref=e311]:
            - generic [ref=e312]: Australia (English)
            - generic [ref=e313]: AUD $
            - link "Report a problem" [ref=e314] [cursor=pointer]:
              - /url: /contact
    - button "MigRent Support" [ref=e315]:
      - img [ref=e316]
  - alert [ref=e318]
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