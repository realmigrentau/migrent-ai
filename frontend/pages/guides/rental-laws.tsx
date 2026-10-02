import { useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import { CloseCard, PageHero, Reveal } from "../../components/site";
import { Tabs } from "../../components/hub/ui/Layout";
import { LAST_CHECKED, getAllStates } from "../../data/rentalLaws";

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
    { title: "Rent", items: state.rentRules },
    { title: "Inspections and entry", items: state.entryRules },
    { title: "Renting a room in someone's home", items: state.roomInHome },
    { title: "If there is a dispute", items: state.disputeProcess.map((s) => s.replace(/^\d+\.\s*/, "")), ordered: true },
    { title: "Good to know if you are new to Australia", items: state.migrantInfo },
  ];

  return (
    <>
      <SEOHead
        title="Rental law by state"
        description="Bond limits, rent in advance, rent increases, inspections and disputes in every Australian state and territory, checked against each government's own source."
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
        lead="Bonds, rent, inspections and what to do in a dispute, with the authority to contact where you live."
      />

      <section className="site-section site-section--flush" aria-labelledby="state-heading">
        <div className="site-shell">
          <p className="site-card site-card--muted site-card--pad site-body mb-8">
            This is general information, not legal advice. Each figure was checked against the official source listed under each state on {LAST_CHECKED}. Tenancy law changes, so check with the authority for your state or territory before you rely on it.
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

            <div className="site-card site-card--pad mt-4" data-testid="rental-law-sources">
              <h3 className="site-h3">Sources for {state.name}</h3>
              <p className="site-meta mt-1">Checked on {LAST_CHECKED}.</p>
              <ul className="site-body mt-3 list-disc space-y-1.5 pl-5">
                {state.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="site-link">
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CloseCard heading="Questions about renting with Migrent?" primary={{ label: "How renting works", href: "/how-renting-works" }} secondary={{ label: "Get help", href: "/help" }} />
    </>
  );
}
