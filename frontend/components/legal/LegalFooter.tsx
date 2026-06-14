import Link from "next/link";

const legalLinks = [
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/rental-laws", label: "Rental Laws" },
  { href: "/no-agency", label: "No Agency Disclosure" },
  { href: "/support-disputes", label: "Dispute Resolution" },
  { href: "/code-of-conduct", label: "STRA Code of Conduct" },
  { href: "/safety-reporting", label: "Safety & Reporting" },
  { href: "/anti-discrimination", label: "Fair Housing" },
  { href: "/cookie-policy", label: "Cookie Policy" },
  { href: "/abn-terms", label: "ABN & Business Details" },
  { href: "/contact-legal", label: "Legal Contact" },
];

export default function LegalFooter() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {legalLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-xs text-[var(--color-ink-3)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export { legalLinks };
