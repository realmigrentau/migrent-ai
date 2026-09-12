import { KeyRound, Lock, Search, ShieldCheck, type LucideIcon } from "lucide-react";
import { Reveal } from "./primitives";

/**
 * The four steps, as a sequence rather than four identical boxes.
 *
 * A sticky heading on the left holds its ground while the steps pass on the
 * right, separated by hairlines and counted in the hero's own condensed
 * face. Nothing here is a card, which is what stops this section and the
 * benefits section further down from reading as the same block twice.
 */

type Step = {
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
  tags: string[];
};

const STEPS: Step[] = [
  {
    n: "01",
    icon: Search,
    title: "Search",
    body: "Filter by budget, suburb, and what matters, then find a room that fits how you actually live.",
    tags: ["No history needed", "Pet-friendly", "Bills included", "Near transport"],
  },
  {
    n: "02",
    icon: ShieldCheck,
    title: "Verify",
    body: "Every host is ID-checked with proof of property before a single room goes live, so you always know who you are dealing with.",
    tags: ["Government ID", "Proof of property", "Ongoing checks"],
  },
  {
    n: "03",
    icon: Lock,
    title: "Book",
    body: "Agree the room, the rent and the move-in date in writing, then lodge your bond with your state's bond authority. We show you exactly how.",
    tags: ["Written agreement", "Bond lodged correctly", "Receipt you keep"],
  },
  {
    n: "04",
    icon: KeyRound,
    title: "Settle",
    body: "Move in with real support behind you - clear dispute guidance and mentors who have made the same move.",
    tags: ["Dispute guidance", "Mentor support", "Real humans"],
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="mg-section mg-band--air scroll-mt-[76px]" aria-labelledby="how-heading">
      <div className="mg-shell grid lg:grid-cols-[0.78fr_1.22fr] gap-10 lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="mg-eyebrow mg-eyebrow--ruled mb-4">How it works</p>
          <h2 id="how-heading" className="mg-h2 max-w-[13ch]">
            Four steps to a room you can <strong>trust.</strong>
          </h2>
          <p className="mg-lead mt-5 max-w-[40ch]">
            No paper applications and no rental ledger you do not have yet - just a clear path from searching to
            settled.
          </p>
        </Reveal>

        <ol className="list-none m-0 p-0 mg-rows">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.06} className="py-9 first:pt-0 last:pb-0">
              <div className="flex items-start gap-5 sm:gap-8">
                <span
                  aria-hidden="true"
                  className="mg-numeral text-[var(--color-primary-200)] text-[clamp(2.6rem,5vw,4.2rem)] w-[1.7ch] shrink-0 select-none"
                >
                  {s.n}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="mg-icon" aria-hidden="true">
                      <s.icon className="w-[21px] h-[21px]" strokeWidth={1.7} />
                    </span>
                    <h3 className="mg-h3 mg-h3--lg">{s.title}</h3>
                  </div>
                  <p className="mg-body mt-4 max-w-[48ch]">{s.body}</p>
                  <ul className="list-none m-0 p-0 mt-5 flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <li key={t} className="mg-chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
