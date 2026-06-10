# Design - MigRent

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page - extend or amend this file when the
system needs to grow.

System name: **Sand & Ocean** - warm coastal Australian. Sand-paper surfaces,
deep ink, an ocean-teal primary, a sea-green trust accent, and a dune-amber for
warmth. Rich and layered, never minimal. Built to read as human-made, not
generated: no italic headers, no gradient text, no fake browser chrome, no
invented metrics.

/ Hallmark - genre: editorial x modern-minimal (warm-atmospheric) - route: custom
/ design-system: design.md - designed-as-app - v1

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
  no enrichment. Sand surfaces, teal primary actions, generous spacing.
- Content pages (legal, guides, blog, faq): **Long Document** - one editorial
  column, Fraunces headings, generous measure, mono eyebrows.

## Theme (Sand & Ocean) - SINGLE THEME
There is ONE theme. The old swappable palettes (sand/cloud/mint/blush/paper/sky)
were removed (CSS overlays, the settings palette picker, and the _document
bootstrap). Light = Sand & Ocean; dark = one premium warm-dark (deep espresso
canvas, layered elevation, glowing teal/sea-green accents, faint warm bloom).
Do not reintroduce data-palette variants.

OKLCH source of truth (the live tokens in globals.css are hex equivalents to match
the existing file convention).

- `--color-paper`    oklch(96.5% 0.010 85)   warm paper       #f6f1e9
- `--color-paper-2`  oklch(98.5% 0.006 85)   elevated         #fbf8f2
- `--color-canvas`   oklch(94.0% 0.012 85)   sand canvas      #ece5d8
- `--color-ink`      oklch(25.0% 0.015 240)  deep ink-navy    #1e2a36
- `--color-ink-2`    oklch(44.0% 0.014 240)  body             #49555f
- `--color-ink-3`    oklch(58.0% 0.012 240)  muted            #6e7882
- `--color-rule`     oklch(89.0% 0.012 90)   sand hairline    #ded6c6
- `--color-rule-2`   oklch(82.0% 0.014 90)   divider          #cabfa9
- `--color-primary`  oklch(46.0% 0.085 218)  ocean teal       #1d6475
- `--color-accent`   oklch(52.0% 0.080 175)  sea-green (trust) #208073
- `--color-dune`     oklch(64.0% 0.110 70)   warm amber       #b06b2b
- `--color-coral`    oklch(58.0% 0.150 25)   hearts/urgency   #c14a3f
- `--color-focus`    oklch(58.0% 0.120 215)  focus ring       #2a8aa0

Accent discipline: ocean-teal is the action/brand colour; sea-green marks trust
(verified, secure, protected); dune-amber is a sparing warmth highlight; coral is
reserved for favourites/urgency only. Keep chromatic accent under ~5% per viewport.

## Typography
Three families. All display is roman - italic headers are banned.

- Display: **Fraunces** (variable, opsz high, SOFT on), weight 400-620, style normal.
  Used for hero headlines, section headings, stat numerals, pull-quotes.
- Body/UI: **Hanken Grotesk**, weight 400-700.
- Mono: **Space Mono**, weight 400-700 - eyebrows, labels, prices, meta.
- Display tracking: -0.02em on large display; -0.01em on section heads.
- Type scale anchor: hero `clamp(2.6rem, 5vw + 1rem, 5rem)`; cap long headlines
  per Hallmark size-by-length brackets.

Emphasis inside a heading is carried by **accent colour + weight**, never italics.

## Spacing
4-point named scale (Tailwind v4 spacing + the `--space-*` tokens in tokens.css).
Pages use named tokens / Tailwind utilities, never raw magic numbers.

## Motion
The premium "expensive" feel. Tools already installed: Lenis (smooth momentum
scroll) + Framer Motion.

- Easings: `--ease-mr: cubic-bezier(0.2, 0.7, 0.3, 1)` (out), plus in / in-out.
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
- Primary CTA: ocean-teal fill, ink text on light / paper text on teal, pill-ish
  radius (`--radius-control` 10px), confident verb labels ("Find your room",
  "Start hosting", "I'm a Seeker").
- Secondary CTA: outline on sand, ink text, same radius.

## Per-page allowances
- Marketing pages MAY use enrichment: the hero video, gradient mood-fields,
  the sideways-scroll showcase, hand-built CSS texture. Tier A/B only.
- App pages MUST NOT use enrichment - function carries the page.
- Content pages: typography only.

## What pages MUST share
- The wordmark / Logo + "MigRent" in Fraunces.
- Ocean-teal primary + sea-green trust accent, used sparingly.
- Fraunces (display) + Hanken Grotesk (body) + Space Mono (meta).
- CTA voice (fill style, radius, padding rhythm).
- The mono eyebrow -> Fraunces heading rhythm (eyebrow stacked ABOVE heading,
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
