import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { PageHero, Reveal } from "../components/site";
import { LEGAL_DOCS } from "../components/site/LegalLayout";
import { businessDetails } from "../lib/siteIdentity";

/**
 * The Legal centre index: every policy in one place, and who Migrent is.
 * The business details come from lib/siteIdentity.ts, which only states
 * what has been confirmed.
 */

export default function LegalCentre() {
  return (
    <>
      <SEOHead
        title="Legal centre"
        description="Migrent's terms, privacy policy and every other policy in one place, with Migrent's business details."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Legal", path: "/legal" },
        ]}
      />

      <PageHero
        eyebrow="Legal centre"
        crumbs={[{ label: "Home", href: "/" }, { label: "Legal" }]}
        title={
          <>
            Every policy, <strong>in one place.</strong>
          </>
        }
        lead="The terms you agree to when you use Migrent, how we handle your information, and the rules everyone follows."
      />

      <section className="site-section site-section--flush" aria-label="Policies">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {LEGAL_DOCS.map((d, i) => (
              <Reveal as="li" key={d.href} delay={(i % 2) * 0.04}>
                <Link href={d.href} className="site-card site-card--pad flex h-full flex-col">
                  <h2 className="site-h3">{d.label}</h2>
                  <p className="site-body mt-1.5 flex-1">{d.summary}</p>
                  <span className="site-link mt-4 text-[14px]">
                    Read <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>

          <aside className="site-card site-card--pad self-start lg:sticky lg:top-28" aria-labelledby="business-heading">
            <h2 id="business-heading" className="site-h3">
              Business details
            </h2>
            <dl className="m-0 mt-4 flex flex-col gap-3">
              {businessDetails().map((row) => (
                <div key={row.label}>
                  <dt className="site-meta">{row.label}</dt>
                  <dd className="m-0 text-[15px] font-semibold text-[color:var(--color-ink)] [overflow-wrap:anywhere]">{row.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}
