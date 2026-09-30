import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { CloseCard, Faq, PageHero, Reveal, SectionHead, type FaqEntry } from "../components/site";
import { hubFromSite } from "../lib/hub/routes";
import { hostFeeSentence, seekerFeeSentence, siteIdentity, supportPromise } from "../lib/siteIdentity";

/**
 * Pricing, stated once and exactly.
 *
 * Every amount and rule here comes from lib/siteIdentity.ts, which mirrors
 * the backend's billing (FEE_MODEL=per_property). The old page's comparison
 * table against named competitors, its "AI matching" and "Superhost"
 * answers and its cancellation promise are gone: none of them described
 * something Migrent does.
 */

const fee = siteIdentity.fees.host.listingFee;

const PLANS = [
  {
    tag: "Renters",
    price: "$0",
    unit: "always",
    title: "Search, message, inspect and apply for free",
    points: ["Every listing, no account needed to search", "Messages and inspection bookings", "Your Rental Profile and applications", "Rent record and repair requests after move-in", "Optional: mentor sessions, priced by each mentor"],
    cta: { label: "Search rooms", href: "/seeker/search" },
    featured: false,
  },
  {
    tag: "Hosts",
    price: `$${fee}`,
    unit: "AUD, once per property",
    title: "Free to list. One fee, and only for stays.",
    points: [
      "Free to list, edit and receive applications",
      "Long-term tenancies through applications: no fee",
      `Stay bookings: $${fee} once per property, when the first one is confirmed`,
      "No commission on rent, no subscription",
    ],
    cta: { label: "List a property", href: hubFromSite.listProperty() },
    featured: true,
  },
];

const FAQS: FaqEntry[] = [
  { q: "What do renters pay?", a: seekerFeeSentence() },
  { q: "What do hosts pay?", a: `${hostFeeSentence()} Listing a room and taking a long-term tenant through an application costs nothing.` },
  { q: "Is there a monthly fee or a commission on rent?", a: "No. There is no subscription and no percentage of rent, ever." },
  { q: "Does Migrent hold the rent or bond?", a: "No. Rent is paid to the host the way you agree, and the bond is lodged with your state or territory bond authority. Migrent never holds either." },
  { q: "How is the host fee paid?", a: "By card through Stripe, when the first stay booking on that property is confirmed. Card details never reach Migrent's servers." },
  { q: "Who do I ask about a charge?", a: supportPromise() },
];

export default function Pricing() {
  return (
    <>
      <SEOHead
        title="Pricing"
        description={`Renters search and apply for free. Hosts list for free and pay a one-off AUD $${fee} per property only when a stay booking is first confirmed. No commission on rent.`}
      />

      <PageHero
        eyebrow="Pricing"
        crumbs={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
        title={
          <>
            Simple, honest <strong>pricing.</strong>
          </>
        }
        lead="Renters search and apply for free. Hosts list for free and pay one fee per property, only for stays."
      />

      <section className="site-section site-section--flush" aria-label="Plans">
        <div className="site-shell">
          <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
            {PLANS.map((p, i) => (
              <Reveal
                as="li"
                key={p.tag}
                delay={i * 0.06}
                className={`site-card flex flex-col p-[clamp(24px,3vw,40px)] ${p.featured ? "shadow-[var(--shadow-pop)] ring-1 ring-[var(--color-primary-200)]" : ""}`}
              >
                <p className="eyebrow">{p.tag}</p>
                <p className="mt-5 flex items-baseline gap-2.5">
                  <span className="font-[family-name:var(--font-display)] text-[clamp(3.2rem,6vw,4.2rem)] font-bold leading-none tracking-[-0.03em] text-[color:var(--color-ink)]">{p.price}</span>
                  <span className="site-meta">{p.unit}</span>
                </p>
                <h2 className="site-h3 site-h3--lg mt-5">{p.title}</h2>
                <ul className="mt-6 flex flex-1 list-none flex-col gap-3 border-t border-[var(--color-line)] p-0 pt-6">
                  {p.points.map((t) => (
                    <li key={t} className="flex gap-3 text-[15px] leading-[1.45] text-[color:var(--color-ink)]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-primary)]" strokeWidth={2.4} aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
                <Link href={p.cta.href} className={`${p.featured ? "btn-primary" : "btn-secondary"} btn-lg mt-8 self-start`}>
                  {p.cta.label} <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                </Link>
              </Reveal>
            ))}
          </ul>
          <p className="site-meta mt-6">
            Hosts: want to see what a room could earn? Try the{" "}
            <Link href="/for-owners#earnings" className="underline underline-offset-2">
              earnings estimate
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="site-section site-section--tight" aria-labelledby="pricing-faq-heading">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal>
            <SectionHead
              eyebrow="Questions"
              id="pricing-faq-heading"
              heading={
                <>
                  Money, <strong>plainly.</strong>
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.06}>
            <Faq items={FAQS} />
          </Reveal>
        </div>
      </section>

      <CloseCard
        heading="Start free, whichever side you are on."
        primary={{ label: "Search rooms", href: "/seeker/search" }}
        secondary={{ label: "List a property", href: "/for-owners" }}
      />
    </>
  );
}
