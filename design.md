# Design - MigRent

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page - extend or amend this file when the
system needs to grow.

System name: **Riviera** (v2, 2026-09-12). Supersedes "Sand & Ocean".

The homepage hero - the Mediterranean villa photograph - is the benchmark for
the whole site. Riviera is built from the villa rather than from its sky: a
deep-forest primary (the palms), soft-linen and warm-paper grounds (the stucco
and the haze), a rationed terracotta (the roofline), and muted sage for
everything interactive. The azure that dominates the photograph stays inside
the photograph; it survives in the UI only as `--color-info` for callouts,
because a sky-blue action colour is what made the rest of the site read as a
different, cooler product than the hero.

Built to read as human-made, not generated: no italic headers, no gradient
text, no fake browser chrome, no invented metrics.

/ Hallmark - genre: editorial x modern-minimal (warm-atmospheric) - route: custom
/ design-system: design.md - designed-as-app - v2

## Genre
Editorial warmth meets modern-minimal structure, with atmospheric (photographic,
immersive) heroes. NOT the dark-AI-tool "atmospheric" register - this is a
home-finding marketplace, so warmth and trust lead.

## Macrostructure family
Pages within a family share the family's shape; they vary only in component
archetypes and hero treatment.

- Marketing pages: **Marquee Hero** (atmospheric media hero) -> stat/trust band ->
  editorial content sections -> sideways-scroll showcase -> statement CTA.
  Variation knobs: hero media (video / gradient-field / photo), section order.
- App pages (dashboard, account, owner, seeker): **Workbench** - calm, functional,
  no enrichment. Linen and paper surfaces, deep-forest primary actions,
  generous spacing.
- Content pages (legal, guides, blog, faq): **Long Document** - one editorial
  column, display headings, generous measure, mono eyebrows.

## Theme (Riviera) - SINGLE THEME
There is ONE theme. Light is warm coastal; dark is the same brand after dark
(a tinted near-black with a green cast, never pure #000). Do not reintroduce
data-palette variants.

### Light (live token names in styles/globals.css)

- `--color-bg`          soft linen (page ground)   #f5f2ea
- `--color-surface`     warm paper                 #fbf9f4
- `--color-surface-2`   elevated card              #ffffff
- `--color-surface-cool` cooler alternate band     #f8f8f5
- `--color-ink`         near-black charcoal        #171a17   15.7:1 on linen
- `--color-ink-2`       body                       #3f4740   8.6:1
- `--color-ink-3`       muted warm olive-grey      #5d655b   5.4:1
- `--color-line`        soft border                #e2ded1
- `--color-primary`     deep forest                #132720   14.0:1 on linen
- `--color-accent`      muted sage / eucalyptus    #3f6b57   5.4:1
- `--color-terracotta`  roofline, text-safe step   #a0563a   4.8:1
- `--color-terracotta-500` roofline, fill          #b96848
- `--color-trust`       verification only          #2f6b4f   5.6:1
- `--color-info-500`    the hero's sky, callouts   #1f6a8c
- `--color-deep`        theme-stable dark band     #132720

### Dark

Canvas #10150f, paper #171c15, card #1f251c. The forest primary lifts to sage
(#8fbba1) so it stays visible; terracotta warms to #d9906e.

### Accent discipline
- **Deep forest** is the action colour and the one confident dark. Primary
  buttons, deep bands, the footer.
- **Sage** is the general interactive tint - links, icons, small emphasis. It
  carries the volume precisely so terracotta does not have to.
- **Terracotta is rationed.** Eyebrows, small badges, selected states, hairline
  rules, step numerals, the occasional CTA detail. **Never a full-width section
  background.** It is the single easiest way to undo this system.
- Alternate major sections linen -> white -> cool off-white, with one or two
  deep-forest bands per page and the deep footer as the close.

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
`--color-primary` means *deep forest* on light and *lifted sage* on dark,
because it has to stay legible as an action colour in both. A **band** must not
flip. Bands use `--color-deep`, which is dark in both themes. Use `.mg-ground-deep`
(or `.site-footer`), which re-point the ink, line and button tokens together
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
- Body / UI: **Schibsted Grotesk**. A news grotesque with open apertures and a
  generous x-height - it has to stay legible at 13px on a form label, and a
  large share of this audience is reading in a second language. Variable range
  is 400-900 and nothing in the UI is set below 400.
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
- Primary CTA: deep-forest fill, linen text, `--radius-control` 12px,
  confident verb labels ("Find your room", "Start hosting", "I'm a Seeker").
  Use `.btn-primary`; do not hand-roll a filled button - the hand-rolled ones
  are where the near-black-on-near-black contrast bugs came from.
- Secondary CTA: outline on linen, ink text, same radius (`.btn-outline`).

## Per-page allowances
- Marketing pages MAY use enrichment: the hero video, gradient mood-fields,
  the sideways-scroll showcase, hand-built CSS texture. Tier A/B only.
- App pages MUST NOT use enrichment - function carries the page.
- Content pages: typography only.

## What pages MUST share
- The wordmark / Logo + "MigRent" in the display face.
- Deep-forest primary + sage accent + rationed terracotta.
- Newsreader (headings) + Schibsted Grotesk (body/UI) + Space Mono (meta).
- One button system (`.btn-primary` / `-secondary` / `-outline` / `-ghost` /
  `-danger` / `.btn-text`), one field system, one card system, one radius scale.
- The deep-forest footer as the close.
- CTA voice (fill style, radius, padding rhythm).
- The mono terracotta eyebrow -> display heading rhythm (eyebrow stacked ABOVE heading,
  same column - never the tag-left / heading-right two-column pattern).
- Sand surfaces, warm hairlines, soft shadows.

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

## Exports
See globals.css `@theme` for the live hex tokens. tokens.css at project root
mirrors the system as portable CSS custom properties.
