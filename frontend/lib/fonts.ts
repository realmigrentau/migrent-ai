/**
 * Self-hosted fonts via next/font.
 *
 * The three families were loaded from fonts.googleapis.com as a render-
 * blocking stylesheet. next/font downloads them at build time, serves them
 * from /_next/static with immutable caching, subsets them, and removes the
 * third-party request and its CSP entries. Fraunces keeps the SOFT, opsz and
 * WONK axes that design.md specifies.
 */
import { Fraunces, Hanken_Grotesk, Space_Mono } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz", "WONK"],
  display: "swap",
  variable: "--font-fraunces",
  fallback: ["Cormorant Garamond", "Georgia", "serif"],
});

export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-hanken",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
  fallback: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const fontClassName = `${fraunces.variable} ${hanken.variable} ${spaceMono.variable}`;

/** Inline :root override so portals and body-level styles resolve too. */
export const fontRootCss = `:root{--font-sans:${hanken.style.fontFamily};--font-serif:${fraunces.style.fontFamily};--font-display:${fraunces.style.fontFamily};--font-mono:${spaceMono.style.fontFamily};}`;
