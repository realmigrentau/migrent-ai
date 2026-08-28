import Link from "next/link";
import { Logo } from "./ui/Logo";
import { BadgeCheck, Lock, Wallet, HeartHandshake } from "lucide-react";

/* Site footer (design.md · Sand & Ocean).
 * A full directory of everything MigRent offers, in six columns, with a
 * brand band + trust strip on top. All links point to real routes. */

const columns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "For seekers",
    links: [
      { label: "Search rooms", href: "/seeker/search" },
      { label: "How it works", href: "/for-seekers" },
      { label: "FAQ", href: "/faq" },
      { label: "Guides", href: "/guides" },
      { label: "Tenant rights", href: "/rental-laws" },
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
      { label: "Help centre", href: "/help" },
      { label: "Blog", href: "/blog" },
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
    <footer className="mood-field border-t border-[var(--color-line)]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 pt-16 pb-7">
        {/* Brand band */}
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14 pb-10 mb-10 border-b border-[var(--color-line)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-[var(--color-ink)]">
              <Logo size={30} />
              <span className="font-serif text-[26px] leading-none tracking-[-0.015em]">MigRent</span>
            </Link>
            <h2 className="font-serif text-[28px] md:text-[38px] leading-[1.02] tracking-[-0.025em] text-[var(--color-ink)] mt-5 max-w-[16ch]">
              A real home in Australia, found the right way.
            </h2>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
              {trustChips.map((c) => (
                <span key={c.label} className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-ink-2)]">
                  <c.icon className="w-4 h-4 text-[var(--color-accent)]" /> {c.label}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:justify-self-end lg:text-right self-end">
            <p className="text-[14px] text-[var(--color-ink-2)] leading-[1.55] max-w-[34ch] lg:ml-auto">
              Verified rooms for migrants, students, and new arrivals - no rental history needed.
            </p>
            <div className="flex flex-wrap gap-3 mt-5 lg:justify-end">
              <Link href="/for-seekers" className="btn-primary h-11 px-5 text-sm">
                I&apos;m a Seeker <span aria-hidden="true">→</span>
              </Link>
              <Link href="/for-owners" className="btn-secondary h-11 px-5 text-sm">
                I&apos;m an Owner
              </Link>
            </div>
          </div>
        </div>

        {/* Link directory */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="eyebrow mb-3.5">{col.heading}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13.5px] text-[var(--color-ink-2)] hover:text-[var(--color-primary)] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6 mt-12 border-t border-[var(--color-line)]">
          <div className="font-mono text-[11.5px] text-[var(--color-ink-3)] uppercase tracking-[0.04em]">
            © {new Date().getFullYear()} MigRent Pty Ltd · ABN 22 669 566 941 · Made in Naarm / Melbourne
          </div>
          <div className="flex items-center gap-4 text-[11.5px] text-[var(--color-ink-3)]">
            <span>Australia (English)</span>
            <span>AUD $</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
