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
Two families. All display is roman - italic headers are banned.

- Display + Body/UI: **Hanken Grotesk**. The display voice is the hero's own -
  weight 300 at display sizes with a single bold word for emphasis, tracking
  -0.028em; 500 at card-heading sizes; body at 400.
- Mono: **Space Mono** - eyebrows, labels, prices, meta.
- `.font-serif` is the display class. The name is historical and is referenced
  on ~400 headings across 60 routes; it no longer loads a serif. Weight tracks
  size automatically via `.font-serif.text-4xl` and `.font-serif[class*="text-[4"]`
  style hooks, so call sites did not have to change.

**Fraunces was retired.** The hero photograph contains no serif, so a serif on
every other page was the visible seam between the hero and the rest of the
site. Removing it also drops a three-axis variable font from the critical path.

Emphasis inside a heading is carried by **weight and accent colour**, never
italics.

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
- Hanken Grotesk (display + body) + Space Mono (meta).
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
