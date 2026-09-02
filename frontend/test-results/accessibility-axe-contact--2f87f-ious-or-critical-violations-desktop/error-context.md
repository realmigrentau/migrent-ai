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
          - generic [ref=e49]: Email support, weekdays, Australian business hours. We aim to reply within one business day.
          - heading "Contact MigRent" [level=1] [ref=e51]
          - paragraph [ref=e52]: Real humans. Real answers. Whether you're a seeker, an owner, or someone with a legal or safety concern - this page sorts you to the right place in seconds.
        - generic [ref=e53]:
          - link "I need help Account, listing, booking, payment - send a message and we aim to reply within one business day." [ref=e54] [cursor=pointer]:
            - /url: "#contact-form"
            - img [ref=e56]
            - heading "I need help" [level=3] [ref=e58]
            - paragraph [ref=e59]: Account, listing, booking, payment - send a message and we aim to reply within one business day.
          - link "I have a question Most answers are in our Help Center. Browse first - it's faster." [ref=e60] [cursor=pointer]:
            - /url: "#help-shortcut"
            - img [ref=e62]
            - heading "I have a question" [level=3] [ref=e64]
            - paragraph [ref=e65]: Most answers are in our Help Center. Browse first - it's faster.
          - link "Safety, legal or press Report a user, formal legal notice, or media enquiry - jump straight to the right channel." [ref=e66] [cursor=pointer]:
            - /url: "#escalation"
            - img [ref=e68]
            - heading "Safety, legal or press" [level=3] [ref=e70]
            - paragraph [ref=e71]: Report a user, formal legal notice, or media enquiry - jump straight to the right channel.
        - generic [ref=e72]:
          - generic [ref=e73]:
            - generic [ref=e74]:
              - heading "Quick answers" [level=2] [ref=e75]
              - paragraph [ref=e76]: Most questions are answered in seconds.
            - link "Browse all FAQs →" [ref=e77] [cursor=pointer]:
              - /url: /faq
          - generic [ref=e78]:
            - link "How does identity verification work?" [ref=e79] [cursor=pointer]:
              - /url: /faq
              - generic [ref=e80]: How does identity verification work?
              - img [ref=e81]
            - link "How do bookings and payments work?" [ref=e83] [cursor=pointer]:
              - /url: /faq
              - generic [ref=e84]: How do bookings and payments work?
              - img [ref=e85]
            - link "Can I cancel a booking?" [ref=e87] [cursor=pointer]:
              - /url: /faq
              - generic [ref=e88]: Can I cancel a booking?
              - img [ref=e89]
            - link "How do I list my property?" [ref=e91] [cursor=pointer]:
              - /url: /help
              - generic [ref=e92]: How do I list my property?
              - img [ref=e93]
            - link "Is MigRent only for migrants and students?" [ref=e95] [cursor=pointer]:
              - /url: /faq
              - generic [ref=e96]: Is MigRent only for migrants and students?
              - img [ref=e97]
            - link "How do I report a suspicious listing?" [ref=e99] [cursor=pointer]:
              - /url: /help
              - generic [ref=e100]: How do I report a suspicious listing?
              - img [ref=e101]
        - generic [ref=e103]:
          - generic [ref=e104]:
            - heading "Send us a message" [level=2] [ref=e105]
            - paragraph [ref=e106]: Tell us what's going on. We reply from migrentau@gmail.com within 24 hours on weekdays, 48 hours on weekends.
            - generic [ref=e107]:
              - paragraph [ref=e108]: Prefer email?
              - link "migrentau@gmail.com" [ref=e109] [cursor=pointer]:
                - /url: https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com
              - paragraph [ref=e110]: For faster routing, add a tag to your subject line - for example [BOOKING] or [SAFETY].
          - generic [ref=e112]:
            - generic [ref=e113]:
              - generic [ref=e114]:
                - generic [ref=e115]: Full name
                - textbox "Full name" [ref=e116]:
                  - /placeholder: Jane Doe
              - generic [ref=e117]:
                - generic [ref=e118]: Email
                - textbox "Email" [ref=e119]:
                  - /placeholder: you@example.com
            - generic [ref=e120]:
              - generic [ref=e121]: I am a
              - generic [ref=e122]:
                - button "Seeker" [ref=e123]
                - button "Owner" [ref=e124]
                - button "Other" [ref=e125]
            - generic [ref=e126]:
              - generic [ref=e127]:
                - generic [ref=e128]: Enquiry type
                - combobox "Enquiry type" [ref=e129]:
                  - option "Account help (login, password)"
                  - option "Verification help"
                  - option "Listing help (create, edit, photos)"
                  - option "Booking or payment"
                  - option "Safety or report a user"
                  - option "Legal, privacy or DMCA"
                  - option "Press or media"
                  - option "Partnerships or business"
                  - option "Something else" [selected]
                - paragraph [ref=e130]: We'll route it to the right person.
              - generic [ref=e131]:
                - generic [ref=e132]: Subject (optional)
                - textbox "Subject (optional)" [ref=e133]:
                  - /placeholder: Short summary
            - generic [ref=e134]:
              - generic [ref=e135]:
                - generic [ref=e136]: Message
                - generic [ref=e137]: 0/2000
              - textbox "Message" [ref=e138]:
                - /placeholder: Tell us what's going on. The more detail, the faster we can help.
            - generic [ref=e139]:
              - button "Send message" [ref=e140] [cursor=pointer]
              - paragraph [ref=e141]:
                - text: We use your email only to reply. See our
                - link "Privacy Policy" [ref=e142] [cursor=pointer]:
                  - /url: /privacy-policy
                - text: .
        - generic [ref=e143]:
          - generic [ref=e144]:
            - generic [ref=e145]:
              - img [ref=e147]
              - generic [ref=e149]:
                - heading "Safety or report a user" [level=3] [ref=e150]
                - paragraph [ref=e151]: Scams, harassment, suspicious listings.
            - paragraph [ref=e152]: Use the Report button on any listing or profile, or email us with the subject line [SAFETY]. We respond within 24 hours, 7 days a week.
            - link "Email the safety team" [ref=e153] [cursor=pointer]:
              - /url: https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=%5BSAFETY%5D
              - text: Email the safety team
              - img [ref=e154]
          - generic [ref=e156]:
            - generic [ref=e157]:
              - img [ref=e159]
              - generic [ref=e161]:
                - heading "Legal, privacy or DMCA" [level=3] [ref=e162]
                - paragraph [ref=e163]: Formal notices, data requests, arbitration.
            - paragraph [ref=e164]: Our Legal Contact page has dedicated subject lines for faster routing - privacy requests, copyright, arbitration, and more.
            - link "Open Legal Contact" [ref=e165] [cursor=pointer]:
              - /url: /contact-legal
              - text: Open Legal Contact
              - img [ref=e166]
        - generic [ref=e168]:
          - heading "Other ways to reach us" [level=2] [ref=e169]
          - generic [ref=e170]:
            - 'link "Press & media Subject: [PRESS] · 3-5 business days" [ref=e171] [cursor=pointer]':
              - /url: https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=%5BPRESS%5D
              - img [ref=e173]
              - heading "Press & media" [level=3] [ref=e175]
              - paragraph [ref=e176]: "Subject: [PRESS] · 3-5 business days"
            - link "Partnerships Universities, mentors, integrations" [ref=e177] [cursor=pointer]:
              - /url: https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=%5BPARTNERSHIPS%5D
              - img [ref=e179]
              - heading "Partnerships" [level=3] [ref=e181]
              - paragraph [ref=e182]: Universities, mentors, integrations
            - generic [ref=e183]:
              - img [ref=e185]
              - generic [ref=e187]:
                - heading "Discord community" [level=3] [ref=e188]
                - generic [ref=e189]: Launching soon
              - paragraph [ref=e190]: Peer help and community chat. We're finalising moderation before opening it up.
        - generic [ref=e191]:
          - generic [ref=e192]:
            - heading "Business details" [level=3] [ref=e193]
            - generic [ref=e194]:
              - paragraph [ref=e195]:
                - generic [ref=e196]: "Trading name:"
                - text: MigRent
              - paragraph [ref=e197]:
                - generic [ref=e198]: "ABN:"
                - text: 22 669 566 941
              - paragraph [ref=e199]:
                - generic [ref=e200]: "Location:"
                - text: Australia
              - paragraph [ref=e201]:
                - generic [ref=e202]: "Email:"
                - link "migrentau@gmail.com" [ref=e203] [cursor=pointer]:
                  - /url: mailto:migrentau@gmail.com
              - paragraph [ref=e204]: Entity details are being confirmed and will be published here.
          - generic [ref=e205]:
            - heading "A note from the founder" [level=3] [ref=e206]
            - paragraph [ref=e207]: Hi - I'm Anesh, the founder of MigRent. We're a small, focused team building MigRent for migrants and students in Australia. Email goes straight to a real human inbox. If something's not working or you just want to say hello, write to us. We read everything.
            - link "About MigRent" [ref=e208] [cursor=pointer]:
              - /url: /about
              - text: About MigRent
              - img [ref=e209]
        - generic [ref=e211]:
          - text: Still stuck? Email us anytime at
          - link "migrentau@gmail.com" [ref=e212] [cursor=pointer]:
            - /url: https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com
          - text: .
    - contentinfo [ref=e213]:
      - generic [ref=e214]:
        - generic [ref=e215]:
          - generic [ref=e216]:
            - link "MigRent MigRent" [ref=e217] [cursor=pointer]:
              - /url: /
              - img "MigRent" [ref=e218]
              - generic [ref=e221]: MigRent
            - heading "A real home in Australia, found the right way." [level=2] [ref=e222]
            - generic [ref=e223]:
              - generic [ref=e224]:
                - img [ref=e225]
                - text: ID-verified hosts
              - generic [ref=e228]:
                - img [ref=e229]
                - text: Bond lodged properly
              - generic [ref=e232]:
                - img [ref=e233]
                - text: $0 renter fees
              - generic [ref=e236]:
                - img [ref=e237]
                - text: Mentor network
          - generic [ref=e239]:
            - paragraph [ref=e240]: Verified rooms for migrants, students, and new arrivals - no rental history needed.
            - generic [ref=e241]:
              - link "I'm a Seeker" [ref=e242] [cursor=pointer]:
                - /url: /for-seekers
                - text: I'm a Seeker
                - generic [ref=e243]: →
              - link "I'm an Owner" [ref=e244] [cursor=pointer]:
                - /url: /for-owners
        - generic [ref=e245]:
          - generic [ref=e246]:
            - heading "For seekers" [level=3] [ref=e247]
            - list [ref=e248]:
              - listitem [ref=e249]:
                - link "Search rooms" [ref=e250] [cursor=pointer]:
                  - /url: /seeker/search
              - listitem [ref=e251]:
                - link "How it works" [ref=e252] [cursor=pointer]:
                  - /url: /for-seekers
              - listitem [ref=e253]:
                - link "FAQ" [ref=e254] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e255]:
                - link "Guides" [ref=e256] [cursor=pointer]:
                  - /url: /guides
              - listitem [ref=e257]:
                - link "Tenant rights" [ref=e258] [cursor=pointer]:
                  - /url: /resources/rental-laws
          - generic [ref=e259]:
            - heading "For owners" [level=3] [ref=e260]
            - list [ref=e261]:
              - listitem [ref=e262]:
                - link "List a room" [ref=e263] [cursor=pointer]:
                  - /url: /for-owners
              - listitem [ref=e264]:
                - link "Pricing" [ref=e265] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e266]:
                - link "Owner dashboard" [ref=e267] [cursor=pointer]:
                  - /url: /dashboard/owner
              - listitem [ref=e268]:
                - link "Safety & verification" [ref=e269] [cursor=pointer]:
                  - /url: /safety-verification
              - listitem [ref=e270]:
                - link "Become a mentor" [ref=e271] [cursor=pointer]:
                  - /url: /become-mentor
          - generic [ref=e272]:
            - heading "Explore" [level=3] [ref=e273]
            - list [ref=e274]:
              - listitem [ref=e275]:
                - link "Features" [ref=e276] [cursor=pointer]:
                  - /url: /features
              - listitem [ref=e277]:
                - link "Suburb guides" [ref=e278] [cursor=pointer]:
                  - /url: /suburbs
              - listitem [ref=e279]:
                - link "Mentors" [ref=e280] [cursor=pointer]:
                  - /url: /mentors
              - listitem [ref=e281]:
                - link "Resources" [ref=e282] [cursor=pointer]:
                  - /url: /resources
              - listitem [ref=e283]:
                - link "Help centre" [ref=e284] [cursor=pointer]:
                  - /url: /help
              - listitem [ref=e285]:
                - link "Blog" [ref=e286] [cursor=pointer]:
                  - /url: /blog
          - generic [ref=e287]:
            - heading "Company" [level=3] [ref=e288]
            - list [ref=e289]:
              - listitem [ref=e290]:
                - link "About" [ref=e291] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e292]:
                - link "Careers" [ref=e293] [cursor=pointer]:
                  - /url: /careers
              - listitem [ref=e294]:
                - link "Press" [ref=e295] [cursor=pointer]:
                  - /url: /press
              - listitem [ref=e296]:
                - link "Contact" [ref=e297] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e298]:
            - heading "Trust & safety" [level=3] [ref=e299]
            - list [ref=e300]:
              - listitem [ref=e301]:
                - link "Bond protection" [ref=e302] [cursor=pointer]:
                  - /url: /safety-reporting
              - listitem [ref=e303]:
                - link "Community rules" [ref=e304] [cursor=pointer]:
                  - /url: /rules-community-guidelines
              - listitem [ref=e305]:
                - link "Code of conduct" [ref=e306] [cursor=pointer]:
                  - /url: /code-of-conduct
              - listitem [ref=e307]:
                - link "Anti-discrimination" [ref=e308] [cursor=pointer]:
                  - /url: /anti-discrimination
              - listitem [ref=e309]:
                - link "Support & disputes" [ref=e310] [cursor=pointer]:
                  - /url: /support-disputes
          - generic [ref=e311]:
            - heading "Legal" [level=3] [ref=e312]
            - list [ref=e313]:
              - listitem [ref=e314]:
                - link "Terms of service" [ref=e315] [cursor=pointer]:
                  - /url: /terms-of-service
              - listitem [ref=e316]:
                - link "Privacy policy" [ref=e317] [cursor=pointer]:
                  - /url: /privacy-policy
              - listitem [ref=e318]:
                - link "Cookie policy" [ref=e319] [cursor=pointer]:
                  - /url: /cookie-policy
              - listitem [ref=e320]:
                - link "Disclaimer" [ref=e321] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e322]:
                - link "ABN terms" [ref=e323] [cursor=pointer]:
                  - /url: /abn-terms
        - generic [ref=e324]:
          - generic [ref=e325]: © 2026 MigRent · ABN 22 669 566 941 · Australia
          - generic [ref=e326]:
            - generic [ref=e327]: Australia (English)
            - generic [ref=e328]: AUD $
            - link "Report a problem" [ref=e329] [cursor=pointer]:
              - /url: /contact
    - button "MigRent Support" [ref=e330]:
      - img [ref=e331]
  - alert [ref=e333]
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