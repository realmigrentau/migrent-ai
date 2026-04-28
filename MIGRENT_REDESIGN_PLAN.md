# MigRent Visual Redesign Plan

A pre-launch visual redesign and UI cleanup. Goal: make MigRent feel modern, calm, premium, welcoming, and trustworthy without removing a single feature, page, or workflow.

Stack stays the same: Next.js + Tailwind + shadcn + Supabase + FastAPI + Stripe + Resend.

---

## Section 1 - Design Audit

Likely reasons MigRent feels cluttered, noisy, and unwelcoming:

**Visual noise & competition**
- Every card, banner, badge, and CTA fights for attention with similar visual weight (same shadow, same border, same color saturation).
- Multiple accent colors used without clear semantic meaning (blue for links, blue for buttons, blue for badges, blue for highlights - all slightly different blues).
- Overuse of borders + shadows + background fills on the same element ("triple-stacked" containment).
- Icons used decoratively rather than functionally, adding cognitive noise.

**Spacing & rhythm**
- Inconsistent vertical rhythm between sections (24px here, 40px there, 56px elsewhere).
- Card internal padding varies across pages (p-4 vs p-6 vs p-8).
- Form fields, button heights, and input heights don't match (h-9 / h-10 / h-11 mixed).
- Page containers use different max-widths per route.

**Typography**
- Too many font sizes in use; weak distinction between H1, H2, H3, body, meta.
- Body copy and meta text often the same size, just different colors.
- Line-height too tight for marketing copy, too loose for dashboard data.
- Headings use the same weight as buttons (no clear "voice" in type).

**Hierarchy**
- No single primary action per screen - three or four buttons pretend to be primary.
- Stats, filters, and content all rendered at equal visual weight.
- Hero sections try to do five jobs (search + value prop + trust + CTA + nav repeat).

**Marketplace-specific issues**
- Listing cards probably show 8-12 pieces of metadata (price, suburb, beds, baths, parking, type, availability, host, badges, tags) at equal weight.
- Filter sidebars compete with results visually.
- Owner dashboard likely mirrors seeker UI, making roles ambiguous.

**Mobile**
- Desktop-first density carried to mobile (cramped cards, tiny tap targets, tight padding).
- Sticky elements (filters, CTAs, nav) likely overlap or stack awkwardly.

**Trust & welcome**
- No quiet "breathing room" anywhere - feels transactional, not human.
- Migrant/student audience needs reassurance, but UI reads like a generic SaaS dashboard.

---

## Section 2 - New Design Direction

**Visual personality:** calm, confident, modern Australian. Airbnb's clarity + Linear's restraint + Notion's warmth, with a small dose of local color.

**Tone:** human, helpful, factual. Never shouty. Never overdesigned.

**Layout feel:** generous whitespace, strong left alignment, clear sections separated by air, not lines.

**Spacing feel:** "expensive." Editorial. Things have room to exist.

**Color philosophy: 60 / 30 / 10**
- 60% neutral surfaces (white + warm-near-white + ink text).
- 30% one quiet brand color (a deep, trustworthy teal or indigo - not purple-glow, not cobalt SaaS blue).
- 10% accent (a single warm highlight - soft amber/coral) used only for one thing per screen.
- Status colors (success/warn/error) only for status - never decorative.

**Typography philosophy:**
- One sans for UI (Inter or Geist).
- Optional one editorial serif for hero headlines (Fraunces or Source Serif) to signal warmth/trust on marketing surfaces. App surfaces stay sans-only.
- Strong size jumps between levels. Use weight, not color, for hierarchy.

**How trust shows up visually:**
- Real photos, not stock illustrations.
- Quiet badges (verified host, ID-checked) that look earned, not gamified.
- Plain-English microcopy.
- Australian contextual cues (suburb names, AU$, state tags) handled with restraint.
- Accessibility-first contrast.

---

## Section 3 - Design System Rules

**Spacing scale (Tailwind-native, restrict to these):**
`2, 3, 4, 6, 8, 12, 16, 24` - nothing else. Reject 5, 7, 10, 14.

**Section spacing:**
- Marketing pages: `py-20 md:py-28` between sections.
- App pages: `py-8 md:py-12` between major blocks.
- Inside cards: `p-5 md:p-6` (one value across the app).

**Border radius:**
- Buttons & inputs: `rounded-lg` (10px).
- Cards: `rounded-2xl` (16px).
- Modals/drawers: `rounded-2xl`.
- Avatars/pills: `rounded-full`.
- Never mix `rounded-md` and `rounded-lg` on the same surface.

**Shadows:**
- Default card: no shadow, just `border border-neutral-200/70`.
- Elevated card (hover or featured): `shadow-sm` only.
- Modals: `shadow-xl`.
- Never combine border + medium shadow + colored background on the same element.

**Typography scale:**
- Display (hero): `text-5xl md:text-6xl font-semibold tracking-tight`
- H1: `text-3xl md:text-4xl font-semibold tracking-tight`
- H2: `text-2xl font-semibold tracking-tight`
- H3: `text-lg font-semibold`
- Body: `text-[15px] leading-relaxed text-neutral-700`
- Meta/label: `text-xs uppercase tracking-wide text-neutral-500`

**Buttons (one ladder):**
- Primary: solid brand, `h-10 px-4 rounded-lg font-medium`.
- Secondary: `border border-neutral-200 bg-white`.
- Ghost: text-only with hover bg.
- Destructive: solid red - only on destructive actions.
- Max one primary button per screen region.

**Form styling:**
- Inputs: `h-10 rounded-lg border border-neutral-200 bg-white px-3 text-[15px] focus:ring-2 focus:ring-brand/20 focus:border-brand`.
- Labels above inputs, `text-sm font-medium`, never inside.
- Helper text below, `text-xs text-neutral-500`.
- Errors red, but only inline, never as a whole-card flash.

**Icons:** Lucide only. Always 16px in lines of text, 20px in buttons, 24px in headers. Strokes consistent (1.75).

**Grid/alignment:**
- 12-col grid on desktop with `gap-6`.
- Everything aligns to a left edge - no centered marketing pages except hero blocks.

**Container widths:**
- Marketing: `max-w-6xl`.
- App content: `max-w-7xl`.
- Reading/legal: `max-w-3xl`.
- Forms: `max-w-xl`.

**Mobile rules:**
- Tap targets >= 44px.
- Stack with `gap-4`, never `gap-2`.
- Reduce card density: hide tertiary metadata behind expand.

---

## Section 4 - Clutter Reduction (without removing features)

The single most important section. Rules:

1. **One job per surface.** Each page has one primary verb (Search / Apply / Manage / Read). Everything else demotes.
2. **Progressive disclosure on cards.** Listing cards show 4 facts: photo, title, suburb + price, one trust signal. Bedrooms/baths/parking live on the detail page or behind hover/expand.
3. **Group secondary actions into a `...` menu.** Edit, duplicate, archive, share, report -> kebab menu. Don't render four ghost buttons.
4. **Tabs for parallel content.** Listing detail: Overview / Amenities / Location / Host / Reviews - instead of one giant scroll wall.
5. **Accordions for long forms.** Owner listing creation: split into accordion steps (Basics -> Pricing -> Photos -> Rules -> Availability) without changing the underlying form.
6. **Replace decorative icons.** Remove icons that don't add information (e.g., a house icon next to the word "Listing").
7. **Replace borders with whitespace.** Most dividers can become 32px of vertical space. Use a hairline `border-neutral-100` only when truly needed.
8. **Single accent color per page.** If everything is highlighted, nothing is.
9. **Demote stats blocks.** On dashboards, render KPIs as quiet text + number, not heavy gradient cards.
10. **Inline filters, not stacked panels.** Search filters as a single horizontal bar with a "More filters" drawer for the rest.
11. **Reduce repeated labels.** "Property type: Apartment" -> just "Apartment".
12. **Empty states do one thing.** A line of text, an illustration or an icon (not both), one CTA.

Result: same features, half the visual weight.

---

## Section 5 - Page-by-Page Strategy

**Homepage**
- Now: hero + 6 value props + featured listings + how-it-works + testimonials + CTA + secondary CTA, all yelling.
- Change: editorial hero (large headline, calm subhead, one search bar, one CTA), then 3 sections max with 96px+ separation. Featured listings as a wide horizontal scroll of 4 large cards, not a grid of 12.
- Keep: every section. Just rhythm them.

**Seeker search**
- Now: filter sidebar + map + grid + chips + sort + saved searches all visible.
- Change: top horizontal filter bar with 5 primary filters, "More filters" drawer for the rest. Map collapsible. Results grid `gap-6`, 3 cols desktop.
- Keep: all filters and map.

**Listing cards**
- Now: 10+ pieces of meta.
- Change: 16:10 photo (rounded-2xl, no border), title (1 line, truncate), suburb-price/wk, one trust badge. Hover reveals "Save" + quick view. Beds/baths icons go on detail page.

**Listing detail**
- Now: long scroll with mixed sections.
- Change: gallery -> sticky right-rail booking card (price + CTA + dates) -> tabbed content (Overview / Amenities / Location / Host / Reviews / Policies). All content preserved, just chunked.

**Seeker dashboard**
- Now: too-equal cards.
- Change: a calm header (greeting + status), then 2-3 sections: Active applications, Saved listings, Suggested matches. Demote everything else into a "More" section or sidebar.

**Owner dashboard**
- Now: probably mirrors seeker UI.
- Change: distinct visual identity (slightly different page header pattern), KPI strip (text + number, no gradient), then Listings table + Inbox + Performance. Bookings/moderation/analytics each as their own surface, accessed via sidebar.

**Settings**
- Two-column: left vertical nav, right form pane. Sections: Profile, Account, Notifications, Payments, Privacy, Danger zone. Forms `max-w-xl`. One save button per section, sticky bottom.

**Profile pages**
- Hero card with avatar, name, verifications. Below: tabs for About / Listings / Reviews. Quiet, trust-forward.

**Pricing**
- Three-column comparison, generous padding, one recommended plan with a single accent ring (not gradient glow). Feature list aligns row-for-row across plans.

**Legal/info pages**
- The new `legal/` components are good. Reading width `max-w-3xl`, sidebar TOC on desktop, sticky last-reviewed banner, accordion for state laws.

**Help Center**
- Search-first hero, then category cards (3-col), recent articles list, "Still need help?" footer. Article pages: TOC + reading column.

**Contact**
- Two-col: form left, contact options right. No hero illustration. Just clarity.

**Auth (signup/login)**
- Centered single-card layout, `max-w-md`, brand mark on top, social auth buttons aligned and identical heights, one primary CTA. No marketing collateral on these pages.

**Notifications**
- Inbox-style list with read/unread states (subtle left border for unread). Filters as quiet pill row. Group by day.

**Forms / modals / drawers**
- Modals max-w-lg, drawer for longer flows. Always: header (title + close), body (scroll), footer (cancel left ghost, primary right). Never both modal AND drawer for the same flow.

---

## Section 6 - Component Redesign Plan

| Component | New rule |
|---|---|
| Navbar | 64px tall, white bg, hairline bottom border on scroll only. Logo left, primary nav center (5 links max), auth/avatar right. No dropdowns shown by default. |
| Sidebar (app) | 240px, neutral-50 bg, sections grouped with small uppercase labels, active state = brand-tinted bg + brand text, no icons-only collapse. |
| Page headers | Title (H1) + optional subtitle + right-aligned actions. Bottom margin `mb-8`. No background color. |
| Cards | `rounded-2xl border border-neutral-200/70 bg-white p-6`. No shadow by default. One title, one body, one action. |
| Stats blocks | Label (xs uppercase), Number (3xl semibold), Delta (xs colored). Plain. |
| Search/filter panels | One row, 5 primary filters max + "More". Drawer for full filter set. |
| Tabs | Underline style, not pills. `text-sm font-medium`, brand underline on active. |
| Tables | No vertical borders. Row hover bg neutral-50. Sticky header. Numeric right-aligned. |
| Accordions | Title row 56px, chevron right, no background. Open state adds `bg-neutral-50/50`. |
| Forms | Vertical stacks `gap-5`. Two-col only on desktop and only for short pairs. |
| Inputs | h-10, rounded-lg, neutral-200 border, focus brand ring. |
| Buttons | One ladder (primary/secondary/ghost/destructive). Heights: sm h-9, md h-10, lg h-11. |
| Badges | Quiet by default: `bg-neutral-100 text-neutral-700 text-xs px-2 py-0.5 rounded-full`. Status badges only for status. |
| Empty states | Centered, max-w-sm, one line + one button. Light icon optional. |
| Banners | Single line of text + one action + dismiss. Use `bg-amber-50 border-amber-200` for info, never multi-color. |
| Modals | rounded-2xl, max-w-lg, shadow-xl, backdrop blur-sm + black/40. |
| Toasts | Top-right, neutral-900 bg, white text, single icon, auto-dismiss 4s. |
| Footer | 4-col link grid, muted neutral-500 text, one row of legal at bottom. No newsletter inline unless it's the actual goal. |

---

## Section 7 - Modernization Rules

- Remove half the borders. Replace with whitespace.
- Cut shadow strength. Most surfaces get none; hover gets `shadow-sm`.
- Pick one accent. Use it on the primary button, the active tab, and the brand mark - nowhere else.
- Tighten heading tracking (`tracking-tight`) and loosen body line-height (`leading-relaxed`).
- Use muted surfaces (`bg-neutral-50`) to group, instead of cards-inside-cards.
- Consistent corners. Radius across the app should feel like one family.
- Subtle motion. 150-200ms ease for hover/focus. No bouncy springs. No animated gradients.
- CTA emphasis comes from contrast and isolation, not size or glow.
- Mobile parity. Every desktop layout has a designed mobile equivalent, not a squished one.
- Interaction consistency. Hover, focus, active, disabled states defined once, used everywhere.

---

## Section 8 - Tailwind / shadcn Implementation

**1. Lock tokens in `tailwind.config.ts`:**

```ts
extend: {
  colors: {
    brand: { DEFAULT: '#0F766E', 50:'#F0FDFA', 600:'#0D9488', 700:'#0F766E', 800:'#115E59' },
    accent: { DEFAULT: '#D97706' },
    ink: '#0B1220',
  },
  borderRadius: { lg: '10px', xl: '14px', '2xl': '16px' },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Fraunces', 'Inter', 'serif'],
  },
  boxShadow: {
    sm: '0 1px 2px rgba(16,24,40,0.04)',
    md: '0 4px 12px rgba(16,24,40,0.06)',
    xl: '0 24px 48px -12px rgba(16,24,40,0.18)',
  },
}
```

**2. Globals (`globals.css`):** body `text-[15px] text-neutral-800 antialiased`, set `--radius` for shadcn to 10px to match.

**3. Standard patterns to define once and reuse:**

- `<PageHeader title subtitle actions />`
- `<Card>` with fixed `p-6 rounded-2xl border border-neutral-200/70`
- `<Section>` wrapper with `py-12 md:py-20`
- `<Stat label value delta />`
- `<Field label hint error>{children}</Field>`
- `<EmptyState title body action />`

**4. Unifying shadcn:**
- Override Button, Input, Card, Dialog, Tabs, Badge, Sheet to use the locked tokens.
- Delete one-off variants in components - force everyone through the shared variants.

**5. Avoid per-page custom feel:**
- One `app/(marketing)/layout.tsx`, one `app/(app)/layout.tsx` - no page should redefine container width or padding.
- Convention: no arbitrary spacing values like `mt-[37px]`.

---

## Section 9 - Safe Rollout

**Phase 1 - Foundations (1-2 days, zero risk)**
- Lock tokens in `tailwind.config.ts`.
- Create `components/ui/primitives/` shared wrappers (PageHeader, Section, Card, Stat, Field, EmptyState).
- Update shadcn variants to match tokens.
- No page-level changes yet.

**Phase 2 - Global layout (1-2 days)**
- Redesign Navbar, Footer, app Sidebar, page container layouts.
- Standardize page header pattern.

**Phase 3 - High-traffic surfaces (3-5 days)**
- Homepage
- Seeker search + listing cards
- Listing detail
- Seeker dashboard
- Owner dashboard

**Phase 4 - Lower-priority pages (2-3 days)**
- Settings, profile, pricing, help center, contact, auth, notifications.

**Phase 5 - Polish pass (1-2 days)**
- Empty states across the app, toasts, banners, modals.
- Mobile pass on every redesigned surface.
- Accessibility contrast pass.
- Remove any remaining one-off styles.

Each phase ships behind a branch; the app remains usable throughout because we change look, not behavior.

---

## Section 10 - Outputs

**1) Visual redesign strategy (one line):** Calm, editorial marketplace UI built on a 60/30/10 color system, one type ladder, restrained shadows, generous whitespace, and a single primary action per screen - preserving every existing feature.

**2) Design system spec:** see Section 3.

**3) Page-by-page checklist:** see Section 5.

**4) Component checklist:** see Section 6.

**5) Tailwind/shadcn guidance:** see Section 8.

**6) Do this / Avoid this**

| Do | Avoid |
|---|---|
| One primary button per region | Three "primary" buttons fighting |
| `rounded-2xl` cards with hairline border, no shadow | Shadow + border + bg-color stacks |
| One brand color + one warm accent | Five blues, three greens, two purples |
| Whitespace as separator | Lines and dividers everywhere |
| Tabs/accordions for dense pages | Long scroll walls |
| Quiet badges | Gradient/glow badges |
| Real photos | Generic illustrations |
| Inter for UI, Fraunces optional for hero | Three+ fonts |
| Tailwind spacing 2/3/4/6/8/12/16/24 | `mt-[37px]` arbitrary values |
| Lucide icons, consistent size | Mixed icon libraries |

**7) Launch-safe rollout order:** Phase 1 -> 2 -> 3 -> 4 -> 5 above.

---

## Top 20 UI issues to fix first
1. Too many "primary" CTAs per screen.
2. Inconsistent card padding.
3. Border + shadow + fill stacking.
4. Multiple shades of the same color used semantically interchangeably.
5. Listing cards overloaded with metadata.
6. Filter sidebar competing with results.
7. Owner dashboard visually identical to seeker dashboard.
8. Heading sizes too close to body text.
9. Form input heights inconsistent.
10. Button heights inconsistent.
11. Page container widths vary per route.
12. Section vertical rhythm inconsistent.
13. Decorative icons adding noise.
14. Empty states overdesigned.
15. Modals and drawers used inconsistently.
16. Mobile density too high.
17. Stats rendered as heavy gradient cards.
18. Tabs styled as pills and underlines in different places.
19. Toasts/banners using too many colors.
20. Footer crowded with newsletter + nav + social + legal.

## Top 15 components to redesign first
1. Button
2. Input / Field
3. Card
4. PageHeader
5. Navbar
6. Sidebar
7. Listing card
8. Tabs
9. Badge
10. Stat block
11. Empty state
12. Modal/Dialog
13. Drawer/Sheet
14. Toast
15. Filter bar

## 10 pages that benefit most from cleanup
1. Homepage
2. Seeker search
3. Listing detail
4. Seeker dashboard
5. Owner dashboard
6. Settings
7. Pricing
8. Help center
9. Auth (login/signup)
10. Notifications

---

## Founder-friendly summary

MigRent has all the right features, but right now everything on the screen looks equally important, which makes it feel busy. The fix isn't deleting things - it's giving things room to breathe, picking one color and one font system and sticking to it, making cards quieter, putting secondary actions into menus and tabs, and making sure every page has one clear "thing to do." Done in five small phases, the app will feel calmer, more grown-up, more trustworthy, and more premium - without losing a single feature.
