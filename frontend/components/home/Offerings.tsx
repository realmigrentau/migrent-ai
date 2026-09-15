import Link from "next/link";
import { ArrowRight, BadgeCheck, FileCheck2, HeartHandshake, Lock, MessagesSquare, Wallet } from "lucide-react";
import { FeatureRow, Reveal } from "./primitives";

/**
 * Everything MigRent actually does, in one hairline column.
 *
 * This used to be a six-card grid directly under a four-card grid. It is a
 * list now: the heading holds the left rail while the offering rows pass,
 * so the section reads as an index of the product rather than a repeat of
 * the section above it.
 */

const OFFERINGS = [
  {
    icon: BadgeCheck,
    title: "Verified hosts",
    body: "Government ID and proof of property, checked before a listing goes live.",
    tone: "trust" as const,
  },
  {
    icon: Lock,
    title: "Bond guidance",
    body: "We walk you through lodging your bond with your state authority, so it is never sitting in a landlord's account.",
  },
  {
    icon: FileCheck2,
    title: "No rental history",
    body: "Filter for owners who welcome first-time renters with no local ledger or credit file.",
  },
  {
    icon: Wallet,
    title: "Secure payments",
    body: "Processed through Stripe. $0 platform fee for renters.",
  },
  {
    icon: HeartHandshake,
    title: "Mentors",
    body: "Guidance from people who have made the same move to Australia.",
  },
  {
    icon: MessagesSquare,
    title: "Human support",
    body: "A real team and clear dispute guidance when something goes wrong.",
  },
];

export default function Offerings() {
  return (
    <section className="mg-section mg-band--green" aria-labelledby="offerings-heading">
      <div className="mg-shell grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="mg-eyebrow mg-eyebrow--ruled mb-4">Everything you get</p>
          <h2 id="offerings-heading" className="mg-h2 max-w-[14ch]">
            One platform, built for <strong>arriving.</strong>
          </h2>
          <p className="mg-lead mt-5 max-w-[38ch]">
            Every part of renting somewhere new, made safe and simple.
          </p>
          <Link href="/for-seekers" className="mg-btn mg-btn--primary mg-btn--sm mg-btn--auto mt-8">
            See how it works <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </Reveal>

        <div className="mg-rows">
          {OFFERINGS.map((o, i) => (
            <Reveal key={o.title} delay={(i % 3) * 0.05} className="py-6 first:pt-0 last:pb-0">
              <FeatureRow icon={o.icon} title={o.title} body={o.body} tone={o.tone} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
