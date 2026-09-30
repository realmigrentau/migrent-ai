/**
 * Self-hosted fonts via next/font.
 *
 * next/font downloads each family at build time, serves it from
 * /_next/static with immutable caching, subsets it to latin, and generates a
 * metric-matched fallback - so there is no fonts.googleapis.com request, no
 * render-blocking third-party stylesheet and no CSP entry for it.
 *
 * ── The voices ──
 * The site used to be one grotesque doing every job: display, UI and the
 * "serif" class all resolved to Hanken Grotesk. One neutral face set at three
 * weights is the house style of every template on the internet, which is
 * exactly what it looked like. There are now three real voices with three
 * different jobs:
 *
 *   Newsreader        headings. A proper reading serif with an optical-size
 *                     axis, so a 64px hero and an 18px card title are drawn
 *                     with different contrast rather than one outline scaled.
 *   Manrope           body, UI, buttons, forms, and every Hub heading.
 *                     Open apertures and a generous x-height, legible at
 *                     13px on a form label, which matters for readers whose
 *                     second language this is.
 *   Style Script      the accent. One word, in a handful of headings. See
 *                     .type-script in styles/globals.css for the rules.
 *
 * Space Mono still carries eyebrows, labels and prices, and Archivo still
 * carries the wordmark - both were the distinctive parts of the old stack and
 * neither was the problem.
 */
import { Archivo, Manrope, Newsreader, Space_Mono, Style_Script } from "next/font/google";

/**
 * Display face for every heading.
 *
 * The opsz axis is the reason this is Newsreader rather than a static serif:
 * `.font-serif` sets font-optical-sizing: auto, so the same class gives a
 * hero its fine hairlines and a card title the sturdier, wider-spaced cut
 * that survives at 18px. Weights 200-800, and the display sizes sit at 350.
 */
export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  display: "swap",
  variable: "--font-newsreader",
  fallback: ["ui-serif", "Iowan Old Style", "Georgia", "Times New Roman", "serif"],
});

/**
 * Body and UI face, shared by the public site and Migrent Hub.
 *
 * Manrope replaced Schibsted Grotesk when the Hub arrived: one UI face for
 * both products, with open apertures and a generous x-height that holds up
 * at 13px on a form label, and a geometric warmth that keeps a dense
 * application screen from reading as enterprise software. Variable 200-800.
 */
export const manrope = Manrope({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-manrope",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

/**
 * The script accent - one word in a heading, never a whole line.
 *
 * Style Script is semi-connected with a large x-height and open counters, so
 * it stays readable at heading size in a way a copperplate script does not.
 * It is deliberately the smallest font in the bundle's critical path: the
 * call sites are counted on one hand (see .type-script).
 */
export const styleScript = Style_Script({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-style-script",
  // Not preloaded: only the body and heading faces are needed for the first
  // paint. This one arrives right after, swapped in without a layout jump.
  preload: false,
  fallback: ["Snell Roundhand", "Segoe Script", "cursive"],
});

/**
 * Architectural display face for the homepage wordmark.
 *
 * The reference wordmark measures 1354px wide at a 302px cap height - a
 * width-to-cap ratio of 4.48. A normal-width grotesque comes out around 6.0,
 * so matching the reference width would leave the word about a quarter too
 * short and it would read as a wide band rather than architecture. Archivo
 * carries a real wdth axis, so the proportion is dialled in instead of faked
 * by squashing. Used for the wordmark, the hero brand mark and numerals.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  display: "swap",
  variable: "--font-display-condensed",
  // Not preloaded: only the body and heading faces are needed for the first
  // paint. This one arrives right after, swapped in without a layout jump.
  preload: false,
  fallback: ["Archivo Narrow", "Roboto Condensed", "ui-sans-serif", "system-ui", "sans-serif"],
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
  // Not preloaded: only the body and heading faces are needed for the first
  // paint. This one arrives right after, swapped in without a layout jump.
  preload: false,
  fallback: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const fontClassName = `${manrope.variable} ${newsreader.variable} ${styleScript.variable} ${spaceMono.variable} ${archivo.variable}`;

/** Inline :root override so portals and body-level styles resolve too. */
export const fontRootCss = `:root{--font-sans:${manrope.style.fontFamily};--font-serif:${newsreader.style.fontFamily};--font-display:${newsreader.style.fontFamily};--font-script:${styleScript.style.fontFamily};--font-mono:${spaceMono.style.fontFamily};--font-condensed:${archivo.style.fontFamily};}`;
