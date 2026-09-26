import Link from "next/link";
import { Logo } from "./ui/Logo";
import { BadgeCheck, Lock, Wallet, HeartHandshake } from "lucide-react";
import { copyrightLine } from "../lib/siteIdentity";

/* Site footer.
 *
 * A full directory of everything MigRent offers, with a brand band and a
 * trust strip on top. Every colour, hairline and radius comes from a token,
 * so on the homepage - where styles/home.css re-points those tokens at the
 * hero's palette - the footer arrives in the same sky without a second
 * component. All links point to real routes. */

const columns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "For seekers",
    links: [
      { label: "Search rooms", href: "/seeker/search" },
      { label: "How it works", href: "/for-seekers" },
      { label: "Help centre", href: "/resources/help" },
      { label: "Guides & articles", href: "/resources/guides" },
      { label: "Tenant rights", href: "/resources/rental-laws" },
    ],
  },
  {
    heading: "For owners",
    links: [
      { label: "List a room", href: "/for-owners" },
      { label: "Pricing", href: "/pricing" },
      { label: "Owner dashboard", href: "/dashboard/owner" },
      { label: "Safety & verification", href: "/safety-verification" },
      { label: "Become a mentor", href: "/become-mentor" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { label: "Features", href: "/features" },
      { label: "Suburb guides", href: "/suburbs" },
      { label: "Mentors", href: "/mentors" },
      { label: "Resources", href: "/resources" },
      { label: "Tools & checklists", href: "/resources/tools" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Trust & safety",
    links: [
      { label: "Bond protection", href: "/safety-reporting" },
      { label: "Community rules", href: "/rules-community-guidelines" },
      { label: "Code of conduct", href: "/code-of-conduct" },
      { label: "Anti-discrimination", href: "/anti-discrimination" },
      { label: "Support & disputes", href: "/support-disputes" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of service", href: "/terms-of-service" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Cookie policy", href: "/cookie-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "ABN terms", href: "/abn-terms" },
    ],
  },
];

const trustChips = [
  { icon: BadgeCheck, label: "ID-verified hosts" },
  { icon: Lock, label: "Bond lodged properly" },
  { icon: Wallet, label: "$0 renter fees" },
  { icon: HeartHandshake, label: "Mentor network" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 pt-16 md:pt-20 pb-7">
        {/* Brand band */}
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 pb-12 mb-12 border-b border-[var(--color-line)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-[var(--color-ink)]">
              <Logo size={30} />
              <span className="font-serif text-[26px] leading-none tracking-[-0.015em]">MigRent</span>
            </Link>
            <h2 className="site-footer__headline font-serif text-[30px] md:text-[40px] leading-[1.06] tracking-[-0.025em] text-[var(--color-ink)] mt-6 max-w-[16ch]">
              A real home in Australia, found the right way.
            </h2>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
              {trustChips.map((c) => (
                <span key={c.label} className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-ink-2)]">
                  <c.icon className="w-4 h-4 text-[var(--color-accent)]" strokeWidth={1.9} aria-hidden="true" /> {c.label}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:justify-self-end lg:text-right self-end">
            <p className="text-[14px] text-[var(--color-ink-2)] leading-[1.55] max-w-[34ch] lg:ml-auto">
              Verified rooms for migrants, students, and new arrivals - no rental history needed.
            </p>
            <div className="flex flex-wrap gap-3 mt-6 lg:justify-end">
              <Link href="/for-seekers" className="btn-primary h-11 px-6 text-sm rounded-[var(--radius-control)]">
                I&apos;m a Seeker <span aria-hidden="true">→</span>
              </Link>
              <Link href="/for-owners" className="btn-secondary h-11 px-6 text-sm rounded-[var(--radius-control)]">
                I&apos;m an Owner
              </Link>
            </div>
          </div>
        </div>

        {/* Link directory */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-11">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="eyebrow mb-4">{col.heading}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-block text-[13.5px] text-[var(--color-ink-2)] hover:text-[var(--color-primary)] transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-7 mt-14 border-t border-[var(--color-line)]">
          <div className="font-mono text-[11.5px] text-[var(--color-ink-3)] uppercase tracking-[0.04em]">
            {copyrightLine()}
          </div>
          <div className="flex items-center gap-4 text-[11.5px] text-[var(--color-ink-3)]">
            <span>Australia (English)</span>
            <span>AUD $</span>
            <Link href="/contact" className="hover:text-[var(--color-primary)] transition-colors">Report a problem</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
