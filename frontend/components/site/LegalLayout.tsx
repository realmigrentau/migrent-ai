import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight } from "lucide-react";
import { DocLayout, PageHero } from "./index";
import { supportPromise } from "../../lib/siteIdentity";

/**
 * The Legal centre's frame: the sky, a side menu of every policy, and the
 * policy itself. The policies' own text is untouched by the 2026-09-29
 * redesign; only this frame and the styling of their sections changed
 * (.legal-doc in styles/site.css).
 */

export const LEGAL_DOCS: { href: string; label: string; summary: string }[] = [
  { href: "/terms-of-service", label: "Terms of Service", summary: "The agreement between you and Migrent for using the platform." },
  { href: "/privacy-policy", label: "Privacy Policy", summary: "What personal information we collect, why, and your rights." },
  { href: "/cookie-policy", label: "Cookie Policy", summary: "The cookies and similar storage the site uses." },
  { href: "/disclaimer", label: "Platform Disclaimer", summary: "The limits of what Migrent is responsible for." },
  { href: "/anti-discrimination", label: "Fair Housing Policy", summary: "How Migrent handles discrimination on the platform." },
  { href: "/rules-community-guidelines", label: "Community Guidelines", summary: "The rules everyone using Migrent agrees to." },
  { href: "/code-of-conduct", label: "NSW STRA Code of Conduct", summary: "A summary of the NSW short-term rental code." },
  { href: "/safety-reporting", label: "Safety and Reporting", summary: "How to report a problem, and what happens next." },
  { href: "/support-disputes", label: "Dispute Resolution", summary: "What to do when a disagreement cannot be settled directly." },
  { href: "/contact-legal", label: "Legal Contact and Arbitration", summary: "Where legal notices go, and how arbitration works." },
  { href: "/abn-terms", label: "ABN and Business Details", summary: "Who operates Migrent, and its registered details." },
];

export default function LegalLayout({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  const router = useRouter();
  return (
    <>
      <PageHero
        eyebrow="Legal centre"
        crumbs={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: title }]}
        title={title}
        lead={note}
      />
      <DocLayout
        nav={[{ href: "/legal", label: "All policies" }, ...LEGAL_DOCS.map(({ href, label }) => ({ href, label }))]}
        navLabel="Policies"
        current={router.pathname}
      >
        <div className="legal-doc">{children}</div>
        <div className="site-card site-card--muted site-card--pad mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="site-h3">Questions about this policy?</p>
            <p className="site-body mt-1">{supportPromise()}</p>
          </div>
          <Link href="/contact" className="btn-secondary shrink-0">
            Contact us <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </div>
      </DocLayout>
    </>
  );
}
