import { Check } from "lucide-react";
import { Reveal, SectionHead } from "./primitives";

/**
 * Why any of this matters, second on the page.
 *
 * A ledger rather than two matching cards: the left column is plain text on
 * the band, muted and struck through with a thin rule, and only the right
 * column is raised onto paper with the sky behind it. The asymmetry is the
 * argument - one side is what you are used to, the other is the offer.
 */

const USUAL = [
  "Months of payslips and a local rental ledger",
  "Bond paid straight into a landlord's account",
  "Unverified listings, and scams to watch for",
  "Figuring out a new country on your own",
];

const OURS = [
  "No rental history or credit file needed",
  "Clear guidance on lodging your bond safely",
  "Every host ID-verified before listing",
  "A mentor who has made the same move",
];

export default function WhyItMatters() {
  return (
    <section className="mg-section mg-band--sand" aria-labelledby="why-heading">
      <div className="mg-shell">
        <Reveal>
          <SectionHead
            eyebrow="Why MigRent"
            heading="Renting here asks for a past you have not"
            emphasis="had yet."
            headingId="why-heading"
            lead="You arrive with a visa, a job offer and no Australian paper trail. That should not be the thing that decides where you sleep."
          />
        </Reveal>

        <div className="mt-12 md:mt-16 grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-14 items-start">
          <Reveal className="lg:pt-2">
            <p className="mg-eyebrow mb-6">The usual way</p>
            <ul className="list-none m-0 p-0 mg-rows">
              {USUAL.map((t) => (
                <li key={t} className="flex gap-4 py-4 first:pt-0">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-px w-5 shrink-0 bg-[var(--color-line-2)]"
                  />
                  <span className="text-[15px] leading-[1.55] text-[var(--color-ink-3)]">{t}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mg-card mg-wash-sun overflow-hidden p-7 sm:p-9 lg:p-11 shadow-[var(--shadow-card)]">
              <p className="mg-eyebrow mg-eyebrow--accent mb-6">The MigRent way</p>
              <ul className="list-none m-0 p-0 mg-rows">
                {OURS.map((t) => (
                  <li key={t} className="flex gap-4 py-4 first:pt-0">
                    <span className="mt-0.5 shrink-0 text-[var(--color-trust)]" aria-hidden="true">
                      <Check className="w-[18px] h-[18px]" strokeWidth={2.4} />
                    </span>
                    <span className="text-[15.5px] leading-[1.55] font-medium text-[var(--color-ink)]">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
