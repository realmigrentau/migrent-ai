import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  MessageCircle,
  Wallet,
  Lock,
  BadgeCheck,
  ShieldCheck,
  MessagesSquare,
  FileCheck2,
} from "lucide-react";
import EarningsCalculator from "../components/pricing/EarningsCalculator";
import ComparisonTable from "../components/pricing/ComparisonTable";
import PricingFAQ from "../components/pricing/PricingFAQ";
import TestimonialCarousel from "../components/pricing/TestimonialCarousel";
import PageSubnav from "../components/ui/PageSubnav";
import { reveal, ScrollStatement } from "../components/marketing/motion";

/* Hallmark · genre: editorial · design-system: design.md · designed-as-app
 * macrostructure: Marquee Hero family (marketing) · page: pricing */

const plans = [
  {
    tag: "For seekers",
    price: "$0",
    unit: "forever",
    title: "Search, apply, and book - free",
    body: "Renters never pay MigRent a service fee. Browse every listing, message hosts, and apply without a credit card.",
    points: ["Browse all verified listings", "Message hosts and apply free", "Bond held in independent escrow", "Mentor network included"],
    cta: { label: "Start searching", href: "/seeker/search" },
    featured: false,
  },
  {
    tag: "For owners",
    price: "$99",
    unit: "AUD · one-time, per property",
    title: "Free to list. Pay when it works.",
    body: "List and edit your rooms for free. You pay one fee per property when you find your tenant - nothing before, nothing after.",
    points: ["Free to list, free to edit", "No commission on weekly rent", "No subscriptions or hidden fees", "Secure payments and bond escrow included"],
    cta: { label: "Start listing", href: "/owner/dashboard" },
    featured: true,
  },
];

const included = [
  { icon: BadgeCheck, title: "Host verification", body: "Government ID and proof-of-property checks on every host, before listing." },
  { icon: Lock, title: "Bond escrow", body: "Bonds sit with an independent escrow partner, not in anyone's pocket." },
  { icon: Wallet, title: "Stripe payments", body: "Card details never touch our servers. Payments are processed by Stripe." },
  { icon: ShieldCheck, title: "Dispute guidance", body: "Clear, plain-English guidance if something goes wrong, for both sides." },
  { icon: MessagesSquare, title: "Human support", body: "A real team that answers - not a chatbot maze." },
  { icon: FileCheck2, title: "No lock-in", body: "No contracts with MigRent itself. Your lease is between you and your host." },
];

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing - Simple and honest | MigRent</title>
        <meta
          name="description"
          content="MigRent pricing - seekers browse, apply, and book free. Owners list free and pay a one-time AUD $99 fee per property match. No subscriptions, no rent commissions, no hidden fees."
        />
      </Head>

      <PageSubnav
        title="Pricing"
        links={[
          { label: "Plans", href: "#plans" },
          { label: "What's included", href: "#included" },
          { label: "Calculator", href: "#calculator" },
          { label: "Compare", href: "#compare" },
          { label: "FAQ", href: "#faq" },
        ]}
        cta={{ label: "Sign up", href: "/signup" }}
      />

      {/* 1 · HERO + PLANS */}
      <section id="plans" className="mood-field border-b border-[var(--color-line)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.3, 1] }} className="max-w-[760px] mb-14">
            <div className="eyebrow mb-5">Pricing · No hidden fees</div>
            <h1 className="font-serif text-[44px] sm:text-[58px] xl:text-[64px] font-medium leading-[0.98] tracking-[-0.025em] text-[var(--color-ink)]">
              Simple, honest pricing.
              <br />
              <span className="text-[var(--color-primary)]">One fee, and only when it works.</span>
            </h1>
            <p className="mt-6 text-[17px] sm:text-[18px] text-[var(--color-ink-2)] max-w-[52ch] leading-[1.55]">
              Seekers never pay. Owners pay once per property, only after finding a tenant. No subscriptions, no commissions on rent.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5 max-w-[1000px]">
            {plans.map((p, i) => (
              <motion.div
                key={p.tag}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.08 }}
                className={`relative flex flex-col rounded-[var(--radius-xl)] border p-8 md:p-9 ${
                  p.featured
                    ? "ocean-card border-[var(--color-primary-200)] shadow-[var(--shadow-pop)]"
                    : "bg-[var(--color-surface-2)] border-[var(--color-line)] shadow-[var(--shadow-card)]"
                }`}
              >
                <div className="eyebrow mb-5">{p.tag}</div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-serif text-[56px] md:text-[64px] leading-none tracking-[-0.03em] text-[var(--color-ink)]">{p.price}</span>
                  <span className="font-mono text-[12.5px] text-[var(--color-ink-2)]">{p.unit}</span>
                </div>
                <h2 className="font-serif text-[22px] tracking-[-0.01em] text-[var(--color-ink)] mt-5 leading-[1.15]">{p.title}</h2>
                <p className="text-[14.5px] text-[var(--color-ink-2)] mt-2 leading-[1.55]">{p.body}</p>
                <hr className="rule-soft my-6" />
                <ul className="space-y-3 flex-1">
                  {p.points.map((t) => (
                    <li key={t} className="flex gap-3 text-[14.5px] text-[var(--color-ink)] leading-[1.45] font-medium">
                      <Check className="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0" strokeWidth={2.4} /> {t}
                    </li>
                  ))}
                </ul>
                <Link href={p.cta.href} className={`${p.featured ? "btn-primary" : "btn-secondary"} h-11 px-5 text-sm mt-7 self-start`}>
                  {p.cta.label} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 · WHAT'S INCLUDED */}
      <section id="included" className="bg-[var(--color-surface)] border-b border-[var(--color-line)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="mb-10">
            <div className="eyebrow mb-2.5">Included for everyone</div>
            <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)] max-w-[18ch]">Every plan ships with the safety layer.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {included.map((o, i) => (
              <motion.div key={o.title} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.06 }} className="card-lift bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-6">
                <div className="w-11 h-11 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center mb-4"><o.icon className="w-5 h-5" strokeWidth={1.8} /></div>
                <h3 className="font-serif text-[20px] tracking-[-0.01em] text-[var(--color-ink)] leading-[1.15]">{o.title}</h3>
                <p className="text-[13.5px] text-[var(--color-ink-2)] mt-1.5 leading-[1.5]">{o.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · STATEMENT */}
      <ScrollStatement
        eyebrow="Why we price it this way"
        text="Most platforms profit from your rent every single week. We charge one fair fee when the match works, and nothing while you are still looking."
      />

      {/* 4 · CALCULATOR */}
      <section id="calculator" className="bg-[var(--color-surface)] border-y border-[var(--color-line)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-24">
          <motion.div {...reveal} className="mb-10">
            <div className="eyebrow mb-2.5">For owners</div>
            <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">What could your room earn?</h2>
          </motion.div>
          <EarningsCalculator />
        </div>
      </section>

      {/* 5 · COMPARE */}
      <section id="compare" className="scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-24">
          <motion.div {...reveal} className="mb-10">
            <div className="eyebrow mb-2.5">How we compare</div>
            <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">Side by side, in plain numbers.</h2>
          </motion.div>
          <ComparisonTable />
        </div>
      </section>

      {/* 6 · TESTIMONIALS */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-24">
          <TestimonialCarousel />
        </div>
      </section>

      {/* 7 · FAQ */}
      <section id="faq" className="scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-24">
          <PricingFAQ />
        </div>
      </section>

      {/* 8 · CTA */}
      <section className="mood-field-strong border-t border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="max-w-[760px]">
            <div className="eyebrow mb-5">Free to browse · Free to list</div>
            <h2 className="font-serif text-[40px] md:text-[60px] leading-[0.98] tracking-[-0.03em] text-[var(--color-ink)]">Ready to get started?</h2>
            <p className="mt-5 text-[17px] text-[var(--color-ink-2)] leading-[1.55] max-w-[560px]">
              Join hosts and seekers across Australia. List your room free, or start your search today.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/signup" className="btn-primary h-12 px-7 text-[15px]">Sign up free <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/contact" className="btn-secondary h-12 px-7 text-[15px]"><MessageCircle className="w-4 h-4" /> Talk to us</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
