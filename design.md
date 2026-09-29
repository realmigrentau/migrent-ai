# Design - Migrent

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page - extend or amend this file when the
system needs to grow.

System name: **Cobalt** (v3, 2026-09-28). Supersedes Riviera (v2, forest and
sage) and the dawn palette. One system for the public site and Migrent Hub:
the site is editorial and discovery-led, the Hub calmer and task-led, and a
button, badge or card is the same object in both. `styles/globals.css` is the
source of truth for every value; this file explains the rules.

Built to read as human-made, not generated: no italic headers, no gradient
text, no fake browser chrome, no invented metrics.

/ Hallmark - genre: editorial x modern-minimal - route: custom
/ design-system: design.md - designed-as-app - v3

## Genre
Editorial warmth on the public site, calm product UI in the Hub. This is a
home-finding marketplace, so trust and clarity lead.

## Macrostructure family
Pages within a family share the family's shape; they vary only in component
archetypes and hero treatment.

- Marketing pages: **Marquee Hero** (the sunrise hero with the interactive
  house) -> trust band -> editorial sections -> sideways-scroll showcase ->
  statement CTA. Inner public pages use the **page hero** (the same sky,
  quieter) -> sections -> close card. See "Public site kit" below.
- **Migrent Hub** (every signed-in screen): floating navigation rail on
  desktop (expanded 248px / compact 76px), five-tab bottom bar on phones,
  a page header (title, one line of description, actions), then sections of
  cards and rows. No marketing enrichment. See `docs/hub.md`.
- Content pages (legal, guides, blog, faq): **Long Document** - one editorial
  column, display headings, generous measure, mono eyebrows.

## Theme (Cobalt) - light, dark and system
One preference for the whole of Migrent (`migrent-theme` in localStorage:
`light`, `dark` or `system`), applied before first paint by
`lib/themeBootstrap.ts`. Dark is the same brand at night: a tinted near-black
(#090b10), never pure black.

### Light (live token names in styles/globals.css)

- `--color-canvas`         page ground behind cards      #f6f8fc
- `--color-surface`        cards and panels              #ffffff
- `--color-surface-muted`  quiet fills, chips            #f2f4f8
- `--color-ink`            headings                      #101828   16.7:1
- `--color-ink-2`          body                          #475467    7.7:1
- `--color-ink-3`          secondary text                #5d6678    5.1:1 on the palest tint
- `--color-ink-4`          hints, timestamps             #626d80    4.6:1 on the palest tint
- `--color-line` / `-2`    borders                       #e4e9f0 / #d6dce5
- `--color-primary`        cobalt: action, brand, verification  #365df3  white on it 5.2:1, as text >= 4.6:1
- `--color-primary-soft`   selected and highlighted fills #eaf0ff
- `--color-deep`           theme-stable navy for footer and deep bands  #141b33
- status: `--color-success-*`, `--color-warn-*`, `--color-danger-*`, `--color-info-*` - status only, never decoration

The brief's cobalt was #3D63F3; at 4.45:1 as small text on the grey surfaces it
missed AA, so the live value is the same hue 1.5% deeper.

### Dark

Canvas #090b10, surface #0f131a, elevated #151a23, lines are white at 8% and
14%. Cobalt lifts to #6b8cff with near-black text on it; ink steps are
#f5f7fa / #c0c7d2 / #a8b0bd / #808a9a, all >= 4.5:1 where they are used.

### Accent discipline
- **Cobalt** is the one action colour. One primary button per view; secondary
  actions are outlined or ghost.
- **Status colours carry meaning only.** A green badge means done, amber means
  needs attention, red means blocked or dangerous. Every status also has a
  label and an icon - never colour alone.
- **Terracotta** survives only in public-site editorial detail (eyebrows,
  rules). It does not appear in the Hub.

### Shape, depth and motion (Hub)
- Radii: 24px navigation rail, 22px cards, 18-20px panels and lists, 12-16px
  controls, full pills for chips, badges and the composer.
- Depth: hairline borders first; shadows only on floating things (rail, tab
  bar, menus, dialogs, sticky action bars).
- Motion: 150-280ms, `--ease-out` (cubic-bezier(0.22, 1, 0.36, 1)); content
  rises 6-8px as it appears; everything respects `prefers-reduced-motion`.
- Icons: lucide, stroke 1.75, 16-20px.

### Two traps that are specific to this codebase
1. **Unlayered CSS beats every cascade layer.** `a { color: inherit }` sat
   outside a layer and silently defeated every Tailwind text-colour utility on
   a link, which is why several CTAs rendered near-black on near-black. It now
   lives in `@layer base`. Anything that must be overridable by a utility
   belongs in a layer.
2. **Tailwind v4 tree-shakes unused `@theme` variables.** A token referenced
   only from hand-written CSS (never as a `bg-*`/`text-*` class) is dropped
   from the output, which turns `background: var(--token)` into an invalid
   declaration and throws the whole rule away. Tokens in that position are
   declared in the plain `:root` block below `@theme` - see `--color-deep`.

### A third, about theme-flipping tokens
`--color-primary` flips between themes (#365df3 light, #6b8cff dark) so it
stays legible as an action colour. A **band** must not flip. Bands use
`--color-deep`, which is dark in both themes. Use `.mg-ground-deep` (or
`.site-footer`), which re-point the ink, line and button tokens together
rather than restating a colour on each child.

## Typography
Three voices with three jobs, plus mono for meta and a condensed face for the
wordmark. All display is roman - italic headers are banned.

- Headings: **Newsreader**. A reading serif with a real `opsz` axis, so
  `.font-serif` (which sets `font-optical-sizing: auto`) draws a 64px hero with
  fine hairlines and an 18px card title with the sturdier cut that survives at
  that size. Weight 350 at display sizes, 500 at card-heading sizes, tracking
  -0.016em / -0.006em. A serif needs far less negative tracking than a
  grotesque; do not carry the old numbers over.
- Body / UI: **Manrope**, on the public site and everywhere in Migrent Hub
  (Hub headings too, weight 600, tracking -0.022em). Open apertures and a
  generous x-height keep it legible at 13px, and a large share of this
  audience reads in a second language. Nothing in the UI is set below 400.
- Accent: **Style Script**, via `.type-script`. See below.
- Figures: `.type-heavy` - Newsreader 700 for prices and counts. It is spelled
  out against the `[class*="text-["]` size hooks in `globals.css` because those
  match at the same specificity and would otherwise win on source order.
- Mono: **Space Mono** - eyebrows, labels, prices, meta.
- Wordmark: **Archivo** at `wdth` 62 (`--font-condensed`) - the hero mark and
  numerals only.
- `.font-serif` is the display class, referenced on ~400 headings across 60
  routes. Weight tracks size automatically via `.font-serif.text-4xl` and
  `.font-serif[class*="text-[4"]` style hooks, so call sites did not change.

**Why this replaced the single-grotesque stack.** For one release display, body
and the `.font-serif` class all resolved to Hanken Grotesk. A page whose heading
and its own caption are the same face at two weights has no voice, it has a size
chart - and that is the house style of every template on the internet. The
wordmark is architecture; the page under it is something you read. Two different
jobs, so two different faces.

### The script accent
One word inside a heading, in a handful of places on the whole site. It marks
the word the page is emotionally about - *home*, *trust*, *room* - never the
functional ones (steps, filters, FAQ). The rules, which are not negotiable
because of who reads this site:

- one word, never a phrase and never a whole heading;
- never body copy, a label, a button, or anything small;
- never the only thing carrying a meaning - the sentence has to read the same
  with the accent switched off;
- never on an i18n string. Style Script is latin-subset; a `zh`, `ar` or `ru`
  translation would fall through to whatever the OS calls cursive.

Punctuation stays in the serif: `your <strong class="type-script">room</strong>?`

Current call sites: the homepage intro line, the search heading, the homepage
close, the `for-seekers` hero, the `for-owners` close.

Emphasis inside a heading is otherwise carried by **weight and accent colour**,
never italics.

### The weight scale
The page is set light and then hit hard in a few places. The gap is the point:
a heading at 350 with one word at 700 reads as two voices in one sentence,
where 500-against-600 just reads as one voice getting slightly louder.

| Where | Weight |
| --- | --- |
| Display headings (`.font-serif` at text-4xl+, `.mg-display`, `.mg-h2`, `.display-*`) | 350 |
| The emphasised word inside them (`strong`) | **700** |
| Card and row titles (`.font-serif` below display scale, `.mg-h3`, `.mg-h3--lg`) | 600 |
| Body, leads, meta | 400 |
| Buttons (`.btn-*`), field labels | **700** |
| Eyebrows (`.eyebrow` mono, `.mg-eyebrow`) | **700** |
| Figures (`.type-heavy`, `.mg-numeral`) | **700** |

Bold serif sets wider than light serif at the same size, so every 700 above
carries extra negative tracking (-0.022em on emphasis, -0.03em on figures).
Without it the bold word looks pasted in from a larger heading.

## Spacing
4-point named scale (Tailwind v4 spacing + the `--space-*` tokens in tokens.css).
Pages use named tokens / Tailwind utilities, never raw magic numbers.

## Motion
The premium "expensive" feel. Tools already installed: Lenis (smooth momentum
scroll) + Framer Motion.

- Easings: `--ease-out` / `--ease-mr: cubic-bezier(0.22, 1, 0.36, 1)`, plus in-out.
- Durations are one named scale: `--duration-micro` 180ms (hover tints) ·
  `--duration-fast` 200ms (buttons, inputs) · `--duration-base` 260ms (cards) ·
  `--duration-slow` 320ms (dropdowns) · `--duration-panel` 380ms (modals,
  drawers) · `--duration-reveal` 640ms (editorial reveals).
- Card hover: translateY(-3px) + image scale 1.02 + a slightly stronger border.
- Button hover: background step, and any `.btn-arrow` icon slides 3px.
- Reveal pattern: slow, weighted fade + small rise on scroll-in (`.reveal`),
  staggered for groups. Durations 500-800ms, generous.
- Signature move: **horizontal / sideways-scroll showcase** (`.hscroll`) for
  featured listings and "how it works" - the VIP sideways-scroll effect.
- Reduced-motion fallback: opacity-only, <= 150ms; horizontal sections become
  normal vertical stacks.
- Animate transform + opacity only. Never bounce/overshoot on UI state.

## Microinteractions stance
- Silent success over celebratory toasts.
- Card lift on hover (`.card-lift`): translateY(-2px) + soft shadow, 180ms.
- Hover tooltips delay 800ms; focus tooltips 0ms.
- `:focus-visible` ring shows instantly, never animated, >= 3:1 contrast.

## CTA voice
- Primary CTA: cobalt fill, white text (near-black on the lifted dark-theme cobalt), `--radius-control` 12px,
  confident verb labels ("Find your room", "Start hosting", "I'm a Seeker").
  Use `.btn-primary`; do not hand-roll a filled button - the hand-rolled ones
  are where the near-black-on-near-black contrast bugs came from.
- Secondary CTA: outline on the surface, ink text, same radius (`.btn-outline`).
- In Migrent Hub, use the Hub components (`components/hub/ui/Button.tsx`:
  `Button`, `ButtonLink`, `IconButton`); they read the same tokens.

## Per-page allowances
- Marketing pages MAY use enrichment: the hero video, gradient mood-fields,
  the sideways-scroll showcase, hand-built CSS texture. Tier A/B only.
- App pages MUST NOT use enrichment - function carries the page.
- Content pages: typography only.

## What pages MUST share
- The wordmark / Logo + "Migrent" in the display face.
- Cobalt primary; status colours for status only.
- Newsreader (editorial display) + Manrope (body/UI) + Space Mono (meta).
- One button system (`.btn-primary` / `-secondary` / `-outline` / `-ghost` /
  `-danger` / `.btn-text`), one field system, one card system, one radius scale.
- The deep navy footer (`--color-deep`) as the close on the public site.
- CTA voice (fill style, radius, padding rhythm).
- The mono cobalt eyebrow -> display heading rhythm (eyebrow stacked ABOVE heading,
  same column - never the tag-left / heading-right two-column pattern).
- Cool canvas and white surfaces, hairline borders, shadows only on floating things.

## What pages MAY differ on
- Macrostructure within the page-type family.
- Hero archetype + media (video / gradient-field / photo).
- Enrichment - marketing pages only, Tier A/B only.

## Anti-slop rules (non-negotiable, from the brief "make it less AI")
1. No italic headers anywhere. Emphasis = accent colour + weight.
2. No gradient text on headings.
3. No fake browser/phone/code chrome.
4. No invented metrics - use real numbers, a placeholder, or a different layout.
5. No 4-column link-index footer as the only footer idea (the AI fingerprint).
6. Eyebrow tags stack above headings; cap 1-2 ordinal tags per page.
7. Tinted neutrals only - no pure #000 / #fff base surfaces.

## Public site kit (v3.1, 2026-09-29)
The public site was rebuilt to match the Hub. Every public page is built from
`components/site` and `styles/site.css`; nothing on the public site hand-rolls
a card, a heading or a page top any more.

- **One calm canvas.** `--color-bg` everywhere; white `.site-card` surfaces
  with a 1px line and a 22px radius; no shadows on cards, no glass panels, no
  coloured bands. Only the footer is navy.
- **Page tops.** `PageHero` (eyebrow, display title with one `<strong>`
  phrase, lead, optional crumbs and actions) draws the sunrise sky under the
  floating header. One-message pages (404, 500, after a checkout) use
  `StatusPage`, the same sky with the message centred.
- **Layout routing.** `components/Layout.tsx` lists routes in `SITE_KIT`
  (full width, draw their own sky, no header spacer) or `LEGACY_FULL_WIDTH`
  (full width below the header: listing, mentor and suburb detail pages).
  Anything else still gets the centred container.
- **Type.** `.site-display` / `.site-h2` are Newsreader at weight 350 with
  the emphasised phrase in `<strong>`; `.site-h3` is the UI face. Never set a
  display heading bold as a whole.
- **Long documents.** `DocLayout` (sticky side menu with scroll-spy) for How
  renting works and the Legal centre; policy text is styled by `.legal-doc`
  and never edited as part of a redesign.
- **Forms.** Public forms use the Hub field components
  (`components/hub/ui/Field.tsx`), so a field is the same object everywhere.
- **Icons.** lucide line icons only. No emoji as icons.
- **Honesty.** `tests/unit/claims.test.ts` fails the build on claims Migrent
  cannot back (Superhost, proof of property, visa checks, verified renters,
  AI matching outside the verbatim legal pages, invented scale).

## Exports
See globals.css `@theme` for the live hex tokens. tokens.css at project root
mirrors the system as portable CSS custom properties.
