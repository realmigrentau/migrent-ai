import { useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import { CloseCard, PageHero, Reveal } from "../../components/site";
import { Tabs } from "../../components/hub/ui/Layout";
import { getAllStates } from "../../data/rentalLaws";

/**
 * Rental law by state. Moved from /resources/rental-laws (which redirects
 * here) and laid out like the rest of the site. The content itself lives in
 * data/rentalLaws.ts; it is general information that needs a legal review
 * whenever tenancy law changes, which the page says plainly.
 */

export default function RentalLaws() {
  const states = getAllStates();
  const [code, setCode] = useState(states[0].code);
  const state = states.find((s) => s.code === code) ?? states[0];

  const blocks: { title: string; items: string[]; ordered?: boolean }[] = [
    { title: "Bonds", items: state.bondRules },
    { title: "Your rights as a renter", items: state.tenantRights },
    { title: "If there is a dispute", items: state.disputeProcess.map((s) => s.replace(/^\d+\.\s*/, "")), ordered: true },
    { title: "Good to know if you are new to Australia", items: state.migrantInfo },
  ];

  return (
    <>
      <SEOHead
        title="Rental law by state"
        description="Bond rules, renters' rights and how disputes are settled in every Australian state and territory, with the authority to contact in each."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Rental law by state", path: "/guides/rental-laws" },
        ]}
      />

      <PageHero
        eyebrow="Guides · Your rights"
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: "Rental law by state" }]}
        title={
          <>
            Rental law, <strong>state by state.</strong>
          </>
        }
        lead="Bonds, your rights and what to do in a dispute, with the authority to contact where you live."
      />

      <section className="site-section site-section--flush" aria-labelledby="state-heading">
        <div className="site-shell">
          <p className="site-card site-card--muted site-card--pad site-body mb-8">
            This is general information, not legal advice. Tenancy law changes; always check with the authority for your state or territory before you rely on it.
          </p>

          <Tabs
            label="State or territory"
            value={code}
            onChange={setCode}
            tabs={states.map((s) => ({ value: s.code, label: s.code }))}
            idBase="state"
          />

          <div id="state-panel" role="tabpanel" aria-labelledby={`state-tab-${state.code}`} className="mt-8">
            <h2 id="state-heading" className="site-h2 !text-[clamp(1.7rem,3vw,2.4rem)]">
              {state.name}
            </h2>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {blocks.map((b, i) => (
                <Reveal key={`${state.code}-${b.title}`} delay={(i % 2) * 0.05} className="site-card site-card--pad">
                  <h3 className="site-h3 site-h3--lg">{b.title}</h3>
                  {b.ordered ? (
                    <ol className="site-body mt-4 list-decimal space-y-2 pl-5">
                      {b.items.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ol>
                  ) : (
                    <ul className="site-body mt-4 list-disc space-y-2 pl-5">
                      {b.items.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              ))}
            </div>

            <div className="site-card site-card--pad mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="site-body m-0 inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden="true" />
                <span className="font-semibold text-[color:var(--color-ink)]">{state.emergencyContact}</span>
              </p>
              <a href={state.fairTradingUrl} target="_blank" rel="noopener noreferrer" className="site-link">
                Official information for {state.code} <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <CloseCard heading="Questions about renting with Migrent?" primary={{ label: "How renting works", href: "/how-renting-works" }} secondary={{ label: "Get help", href: "/help" }} />
    </>
  );
}
