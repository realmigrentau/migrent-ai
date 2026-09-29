import Link from "next/link";
import { ArrowRight, BadgeCheck, Handshake, Landmark, MailCheck, ScanSearch, UserRoundCheck } from "lucide-react";
import { Reveal, SectionHead } from "../site";

/**
 * Why a renter can trust a room they found here.
 *
 * One claim with its proof beside it (the host checks, as rows in a
 * panel), then three plain statements about money and roles underneath.
 * It replaces four sections that each said part of this: the ledger, the
 * belief band, the verified panel and the offerings list.
 */

const CHECKS = [
  { icon: UserRoundCheck, title: "Government ID", body: "A passport, licence, visa or national ID, reviewed by a person at Migrent." },
  { icon: MailCheck, title: "Contact details confirmed", body: "The host's email is confirmed, so the person you message is the person who was checked." },
  { icon: ScanSearch, title: "Every listing reviewed", body: "Migrent reads each listing before it is published, and takes down ones that break the rules." },
];

const PROMISES = [
  {
    icon: Landmark,
    title: "Your bond goes to your state",
    body: "It is lodged with your state or territory bond authority. Migrent never holds your bond or your rent.",
  },
  {
    icon: BadgeCheck,
    title: "No local history needed",
    body: "Your Rental Profile tells your story: work, study, references. You do not need an Australian rental ledger to apply.",
  },
  {
    icon: Handshake,
    title: "We are not an agent",
    body: "You deal with the host directly. Migrent runs the platform and the checks, and helps when something goes wrong.",
  },
];

export default function TrustSection() {
  return (
    <section className="site-section" aria-labelledby="trust-heading">
      <div className="site-shell">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          <Reveal>
            <SectionHead
              eyebrow="Why you can trust it"
              id="trust-heading"
              heading={
                <>
                  Every host, <strong>checked.</strong>
                </>
              }
              lead="A room only goes live after Migrent has checked who is letting it. Your visa and your story are enough; a local credit file is not required."
            />
            <Link href="/how-renting-works#checks" className="site-link mt-7">
              How we check hosts <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="site-card site-rows m-0 list-none p-0">
              {CHECKS.map((c) => (
                <li key={c.title} className="flex gap-4 px-6 py-5 sm:px-7">
                  <span className="site-icon" aria-hidden="true">
                    <c.icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="site-h3">{c.title}</h3>
                    <p className="site-body mt-1">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <ul className="m-0 mt-12 grid list-none gap-4 p-0 md:grid-cols-3 lg:mt-16">
          {PROMISES.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.06} className="site-card site-card--muted site-card--pad">
              <p.icon className="h-5 w-5 text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden="true" />
              <h3 className="site-h3 mt-4">{p.title}</h3>
              <p className="site-body mt-1.5">{p.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
