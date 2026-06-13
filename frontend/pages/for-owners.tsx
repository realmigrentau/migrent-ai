import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Home,
  ShieldCheck,
  Lock,
  Check,
  ArrowRight,
  Wallet,
  MessagesSquare,
  BadgeCheck,
  UsersRound,
  CalendarCheck,
  FileCheck2,
} from "lucide-react";
import PageSubnav from "../components/ui/PageSubnav";
import { reveal, ScrollStatement, ScrollMarquee } from "../components/marketing/motion";

/* Hallmark · genre: editorial · design-system: design.md · designed-as-app
 * macrostructure: Marquee Hero family (marketing) · page: for-owners */

const steps = [
  { n: "01", icon: Home, title: "List your room", body: "Photos, price, house rules, and who the place suits - your listing is live the same day you verify.", extra: ["Free to list", "Same-day setup", "Edit any time"] },
  { n: "02", icon: BadgeCheck, title: "Get verified", body: "A quick government ID and proof-of-property check. It is what makes your listing stand out as safe.", extra: ["Government ID", "Proof of property", "Verified badge"] },
  { n: "03", icon: UsersRound, title: "Meet real seekers", body: "Receive enquiries from genuine, motivated renters - students, professionals, and new arrivals.", extra: ["Serious enquiries", "Profiles up front", "Message in-app"] },
  { n: "04", icon: CalendarCheck, title: "Book with confidence", body: "Accept a request or use instant book. Payments run through Stripe with a clear agreement.", extra: ["Stripe secure", "Instant book", "Clear terms"] },
];

const benefits = [
  { icon: UsersRound, title: "Tenants you can trust", body: "Seeker profiles show verification status and references up front, so you choose with confidence." },
  { icon: Wallet, title: "Simple, fair pricing", body: "Free to list. A one-time AUD $99 fee per property when you find your tenant - no commissions, no subscriptions." },
  { icon: Lock, title: "Protected payments", body: "Rent and bond flow through Stripe, with the bond held in independent escrow for both sides." },
  { icon: ShieldCheck, title: "A safer marketplace", body: "Verification on both sides keeps scammers out - and keeps your enquiries genuine." },
  { icon: MessagesSquare, title: "Everything in one place", body: "Listings, enquiries, bookings, and payments managed from one clean dashboard." },
  { icon: FileCheck2, title: "Help when you need it", body: "Real support and clear dispute guidance, written in plain English." },
];

export default function ForOwners() {
  return (
    <>
      <Head>
        <title>For Owners - Fill your room with the right tenant | MigRent</title>
        <meta name="description" content="List your room on MigRent and reach verified, motivated renters. Free to list, one-time AUD $99 fee per property match. Secure payments and bond escrow built in." />
      </Head>

      <PageSubnav
        title="For Owners"
        links={[
          { label: "How it works", href: "#how" },
          { label: "Why MigRent", href: "#why" },
          { label: "Pricing", href: "#pricing" },
        ]}
        cta={{ label: "Start listing", href: "/owner/dashboard" }}
      />

      {/* 1 · HERO - owner-dashboard mock split (distinct from homepage + seekers) */}
      <section className="mood-field border-b border-[var(--color-line)] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-16 md:py-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.3, 1] }}>
              <div className="eyebrow mb-5">For owners · Free to list</div>
              <h1 className="font-serif text-[44px] sm:text-[58px] xl:text-[64px] font-medium leading-[0.98] tracking-[-0.025em] text-[var(--color-ink)] [overflow-wrap:anywhere]">
                List your room.
                <br />
                <span className="text-[var(--color-primary)]">Find great tenants.</span>
              </h1>
              <p className="mt-6 text-[17px] sm:text-[18px] text-[var(--color-ink-2)] max-w-[48ch] leading-[1.55]">
                Reach verified, motivated renters across Australia. Free to list, with secure payments and bond escrow built in.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/owner/dashboard" className="btn-primary h-12 px-7 text-[15px]">Start listing <ArrowRight className="w-4 h-4" /></Link>
                <Link href="/pricing" className="btn-secondary h-12 px-7 text-[15px]">View pricing</Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
                {[
                  { icon: Wallet, label: "Free to list" },
                  { icon: BadgeCheck, label: "Verified seekers" },
                  { icon: Lock, label: "Payments via Stripe" },
                ].map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--color-ink-2)]">
                    <c.icon className="w-4 h-4 text-[var(--color-accent)]" /> {c.label}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Enquiries mock - hand-built, token-only */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.7, 0.3, 1] }}
              className="relative hidden sm:block"
              aria-hidden="true"
            >
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface-2)] shadow-[var(--shadow-pop)] p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="eyebrow">Your listing</div>
                    <div className="font-serif text-[20px] text-[var(--color-ink)] mt-1 leading-tight">Garden room · Brunswick</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--color-accent)] bg-[var(--color-accent-soft)] rounded-full px-2.5 py-1">
                    <Check className="w-3 h-3" strokeWidth={2.8} /> Live
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Aisha K.", note: "Verified seeker · wants March move-in", tone: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]", initial: "A" },
                    { name: "Lucas M.", note: "Verified seeker · asked about bills", tone: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]", initial: "L" },
                    { name: "Mei T.", note: "Verified seeker · requested a viewing", tone: "bg-[var(--color-warn-50)] text-[var(--color-warn-500)]", initial: "M" },
                  ].map((e) => (
                    <div key={e.name} className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 ${e.tone}`}>{e.initial}</span>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold text-[var(--color-ink)] leading-tight">{e.name}</div>
                        <div className="text-[12px] text-[var(--color-ink-3)] leading-tight mt-0.5 truncate">{e.note}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--color-primary)] ml-auto shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
              {/* floating fee chip */}
              <div className="absolute -bottom-5 right-6 bg-[var(--color-surface-2)]/95 backdrop-blur rounded-full border border-[var(--color-line)] shadow-[var(--shadow-card)] px-4 py-2.5 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">$99 once · only when you match</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2 · HOW IT WORKS */}
      <section id="how" className="bg-[var(--color-surface)] border-b border-[var(--color-line)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="mb-12">
            <div className="eyebrow mb-3">How it works</div>
            <h2 className="font-serif text-[34px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)] max-w-[16ch]">From listing to move-in.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {steps.map((it, i) => {
              const Icon = it.icon;
              return (
                <motion.article key={it.n} {...reveal} transition={{ ...reveal.transition, delay: (i % 2) * 0.08 }} className="card-lift relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface-2)] shadow-[var(--shadow-card)] p-8 md:p-10">
                  <span className="absolute -right-4 -bottom-8 font-serif leading-none text-[var(--color-primary)] opacity-[0.06] select-none pointer-events-none" style={{ fontSize: "12rem" }}>{it.n}</span>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center"><Icon className="w-6 h-6" strokeWidth={1.7} /></div>
                      <div className="font-mono text-[var(--color-primary)] text-[12px] tracking-[0.2em]">{it.n} · STEP</div>
                    </div>
                    <h3 className="font-serif text-[30px] md:text-[36px] tracking-[-0.02em] text-[var(--color-ink)] leading-[1.0]">{it.title}</h3>
                    <p className="mt-3 text-[16px] text-[var(--color-ink-2)] leading-[1.55] max-w-[46ch]">{it.body}</p>
                    <div className="mt-6 pt-5 border-t border-[var(--color-line)] flex flex-wrap gap-2">
                      {it.extra.map((e) => (
                        <span key={e} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-ink-2)] bg-[var(--color-surface)] border border-[var(--color-line)] rounded-full px-3 py-1.5">
                          <Check className="w-3 h-3 text-[var(--color-accent)]" strokeWidth={2.8} /> {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2b · VALUE MARQUEE (scroll-drift) */}
      <ScrollMarquee words={["Free to list", "Verified seekers", "No rent commission", "Stripe payments", "Bond escrow"]} />

      {/* 3 · BENEFITS */}
      <section id="why" className="scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16">
            <motion.div {...reveal} className="lg:sticky lg:top-24 lg:self-start">
              <div className="eyebrow mb-3">Why owners choose MigRent</div>
              <h2 className="font-serif text-[34px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)]">Your room, in safe hands.</h2>
              <p className="mt-5 text-[16px] text-[var(--color-ink-2)] leading-[1.6] max-w-[42ch]">A marketplace where verification works both ways - so the people in your home are who they say they are.</p>
              <Link href="/owner/dashboard" className="btn-primary h-11 px-5 text-sm mt-7">List a room <ArrowRight className="w-3.5 h-3.5" /></Link>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((o, i) => (
                <motion.div key={o.title} {...reveal} transition={{ ...reveal.transition, delay: (i % 2) * 0.06 }} className="card-lift bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-6">
                  <div className="w-11 h-11 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center mb-4"><o.icon className="w-5 h-5" strokeWidth={1.8} /></div>
                  <h3 className="font-serif text-[20px] tracking-[-0.01em] text-[var(--color-ink)] leading-[1.15]">{o.title}</h3>
                  <p className="text-[13.5px] text-[var(--color-ink-2)] mt-1.5 leading-[1.5]">{o.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3b · STATEMENT (word-fill) */}
      <ScrollStatement
        eyebrow="Why hosts join"
        text="Your spare room can change someone's first year in Australia. We make sure it is safe, paid on time, and worth your while."
      />

      {/* 4 · PRICING SNAPSHOT */}
      <section id="pricing" className="mood-field-strong border-y border-[var(--color-line)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div {...reveal}>
              <div className="eyebrow mb-3">Simple pricing</div>
              <h2 className="font-serif text-[34px] md:text-[48px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)]">One fee. Only when it works.</h2>
              <p className="mt-5 text-[16px] text-[var(--color-ink-2)] leading-[1.6] max-w-[44ch]">
                Listing is free. You pay a one-time AUD $99 fee per property when you find your tenant - no subscriptions, no commissions on rent, no hidden costs.
              </p>
              <Link href="/pricing" className="btn-primary h-11 px-5 text-sm mt-7">See full pricing <ArrowRight className="w-3.5 h-3.5" /></Link>
            </motion.div>
            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="ocean-card rounded-[var(--radius-xl)] border border-[var(--color-line)] shadow-[var(--shadow-card)] p-8">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[64px] leading-none tracking-[-0.03em] text-[var(--color-ink)]">$99</span>
                <span className="font-mono text-[13px] text-[var(--color-ink-2)]">AUD · one-time, per property</span>
              </div>
              <hr className="rule-soft my-6" />
              <ul className="space-y-3.5">
                {["Free to list, free to edit", "Pay only when you match with a tenant", "No commission on weekly rent", "Secure payments and bond escrow included"].map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] text-[var(--color-ink)] leading-[1.5] font-medium">
                    <Check className="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0" strokeWidth={2.4} /> {t}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5 · CTA */}
      <section className="mood-field-strong border-t border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="max-w-[760px]">
            <div className="eyebrow mb-5">Free to list · Verified seekers</div>
            <h2 className="font-serif text-[40px] md:text-[60px] leading-[0.98] tracking-[-0.03em] text-[var(--color-ink)]">Ready to list your room?</h2>
            <p className="mt-5 text-[17px] text-[var(--color-ink-2)] leading-[1.55] max-w-[560px]">Join hosts across Australia opening their doors to verified renters - and getting paid safely.</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/owner/dashboard" className="btn-primary h-12 px-7 text-[15px]">Start hosting <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/contact" className="btn-secondary h-12 px-7 text-[15px]">Talk to us first</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
