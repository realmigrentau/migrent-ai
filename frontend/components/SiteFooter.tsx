import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "./ui/Logo";
import { copyrightLine } from "../lib/siteIdentity";
import { hubFromSite } from "../lib/hub/routes";

/* Site footer: the deep-navy close.
 *
 * One line that says what Migrent is, the two things you can do next, and
 * a short index of the pages that exist after the 2026-09-29
 * consolidation. The long legal list lives in the Legal centre, so the
 * footer carries one link to it plus the three policies people look for
 * by name. Tokens are re-pointed by .site-footer in globals.css. */

const columns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Renters",
    links: [
      { label: "Search rooms", href: "/seeker/search" },
      { label: "How renting works", href: "/how-renting-works" },
      { label: "Suburb guides", href: "/suburbs" },
      { label: "Mentors", href: "/mentors" },
    ],
  },
  {
    heading: "Owners",
    links: [
      { label: "Why list with Migrent", href: "/for-owners" },
      { label: "Pricing", href: "/pricing" },
      { label: "Become a mentor", href: "/become-mentor" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Help centre", href: "/help" },
      { label: "Contact us", href: "/contact" },
      { label: "Report a safety issue", href: "/safety-reporting" },
    ],
  },
  {
    heading: "Migrent",
    links: [
      { label: "About", href: "/about" },
      { label: "Legal centre", href: "/legal" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell pb-8 pt-16 md:pt-20">
        <div className="grid gap-10 border-b border-[var(--color-line)] pb-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-[color:var(--color-ink)]">
              <Logo size={30} />
              <span className="font-[family-name:var(--font-display)] text-[26px] leading-none tracking-[-0.015em]">Migrent</span>
            </Link>
            <p className="site-footer__headline mt-6 max-w-[18ch] font-[family-name:var(--font-display)] text-[clamp(28px,3.4vw,42px)] font-[350] leading-[1.08] tracking-[-0.018em]">
              A real home in Australia, found the right way.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-6 lg:items-end lg:text-right">
            <p className="max-w-[40ch] text-[14.5px] leading-[1.6] text-[color:var(--color-ink-2)]">
              Rooms and homes for migrants, students and new arrivals. Hosts are ID-checked before a room goes live, and searching and applying are free.
            </p>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/seeker/search" className="btn-primary">
                Find a room
                <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
              </Link>
              <Link href={hubFromSite.listProperty()} className="btn-secondary">
                List a property
              </Link>
            </div>
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.heading}>
              <h2 className="eyebrow mb-4">{col.heading}</h2>
              <ul className="m-0 list-none space-y-3 p-0">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[14px] text-[color:var(--color-ink-2)] transition-colors duration-200 hover:text-[color:var(--color-ink)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-4 border-t border-[var(--color-line)] pt-7 md:flex-row md:items-center md:justify-between">
          <p className="m-0 font-mono text-[11.5px] uppercase tracking-[0.04em] text-[color:var(--color-ink-3)]">{copyrightLine()}</p>
          <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-[13px] text-[color:var(--color-ink-3)]">
            <li>
              <Link href="/privacy-policy" className="hover:text-[color:var(--color-ink)]">Privacy</Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:text-[color:var(--color-ink)]">Terms</Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="hover:text-[color:var(--color-ink)]">Cookies</Link>
            </li>
            <li>
              <Link href="/legal" className="hover:text-[color:var(--color-ink)]">All policies</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
