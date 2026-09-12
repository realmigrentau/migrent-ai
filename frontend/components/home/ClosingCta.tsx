import Link from "next/link";
import { ArrowRight, BadgeCheck, Compass, KeyRound, Lock, Wallet } from "lucide-react";
import { Reveal } from "./primitives";

/**
 * The close.
 *
 * The page used to end twice: a "two paths" card pair, then a separate
 * final call to action four hundred pixels later, both saying the same
 * thing. They are one band now, on the same deep ocean ground as the
 * belief statement, so the page opens on a photograph and closes on the
 * same sky.
 */

const PATHS = [
  {
    icon: Compass,
    tag: "For seekers",
    title: "Find a room you can trust",
    body: "Search verified rooms, no rental history needed.",
    cta: "I'm a Seeker",
    href: "/for-seekers",
    primary: true,
  },
  {
    icon: KeyRound,
    tag: "For owners",
    title: "Fill your room with the right tenant",
    body: "List once, and meet renters who are ready to move.",
    cta: "I'm an Owner",
    href: "/for-owners",
    primary: false,
  },
];

const CHIPS = [
  { icon: BadgeCheck, label: "ID-verified hosts" },
  { icon: Lock, label: "Bond lodged properly" },
  { icon: Wallet, label: "$0 renter fees" },
];

export default function ClosingCta() {
  return (
    <section className="mg-section mg-band--deep" aria-labelledby="closing-heading">
      <div className="mg-shell">
        <Reveal>
          <p className="mg-eyebrow mb-5">Free to browse · No credit file needed</p>
          <h2 id="closing-heading" className="mg-display max-w-[16ch]">
            Ready to find your <strong>room?</strong>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mg-lead mt-6 max-w-[46ch]">
            Whether you are moving in or opening a door, it starts the same way.
          </p>
        </Reveal>

        <ul className="list-none m-0 p-0 mt-12 grid md:grid-cols-2 gap-4 lg:gap-5">
          {PATHS.map((p, i) => (
            <Reveal as="li" key={p.tag} delay={0.12 + i * 0.08}>
              <div className="mg-card mg-card--lift h-full p-7 sm:p-9 flex flex-col">
                <span className="mg-icon mg-icon--lg" aria-hidden="true">
                  <p.icon className="w-6 h-6" strokeWidth={1.7} />
                </span>
                <p className="mg-eyebrow mt-6">{p.tag}</p>
                <h3 className="mg-h3 mg-h3--lg mt-3">{p.title}</h3>
                <p className="mg-body mt-2.5 flex-1">{p.body}</p>
                <Link
                  href={p.href}
                  className={`mg-btn ${p.primary ? "mg-btn--primary" : "mg-btn--ghost"} mg-btn--auto mt-8 self-start`}
                >
                  {p.cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.28} className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
          {CHIPS.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-2.5 text-[13.5px] font-medium text-[var(--color-ink-2)]">
              <c.icon className="w-4 h-4 text-[var(--color-accent)]" strokeWidth={1.9} aria-hidden="true" />
              {c.label}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
