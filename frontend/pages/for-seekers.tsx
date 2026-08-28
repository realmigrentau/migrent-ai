import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Search,
  ShieldCheck,
  Lock,
  KeyRound,
  Check,
  ArrowRight,
  FileCheck2,
  Wallet,
  HeartHandshake,
  MessagesSquare,
  MapPin,
  BadgeCheck,
  Star,
} from "lucide-react";
import PageSubnav from "../components/ui/PageSubnav";
import { reveal, ScrollStatement, ScrollMarquee } from "../components/marketing/motion";

/* Hallmark · genre: editorial · design-system: design.md · designed-as-app
 * macrostructure: Marquee Hero family (marketing) · page: for-seekers */

const steps = [
  { n: "01", icon: Search, title: "Search honestly", body: "Filter by budget, suburb, and move-in date - then by what actually matters to a new arrival.", extra: ["No history needed", "Pet-friendly", "Bills included", "Near transport"] },
  { n: "02", icon: ShieldCheck, title: "Meet verified hosts", body: "Every host passes government ID and proof-of-property checks before their room goes live.", extra: ["Government ID", "Proof of property", "Ongoing checks"] },
  { n: "03", icon: Lock, title: "Apply and book safely", body: "Message hosts and apply in one place, free. When you agree terms, we show you how to lodge your bond with your state authority.", extra: ["$0 renter fees", "Bond lodged correctly", "Clear agreement"] },
  { n: "04", icon: KeyRound, title: "Move in supported", body: "Real support and dispute guidance, plus mentors who made the same move before you.", extra: ["Dispute guidance", "Mentor support", "Real humans"] },
];

const benefits = [
  { icon: FileCheck2, title: "Your visa is enough", body: "Filter for hosts who welcome first-time renters with no Australian rental ledger or credit file." },
  { icon: Lock, title: "Bond guidance", body: "Your bond belongs with your state's bond authority, never in a landlord's bank account. We show you how to check." },
  { icon: Wallet, title: "$0 renter fees", body: "Browsing, messaging, and applying are free. No platform service fee for renters." },
  { icon: BadgeCheck, title: "Verified, always", body: "You will never message an unverified host. Every listing belongs to a checked owner." },
  { icon: HeartHandshake, title: "Mentors included", body: "Get help reading a lease, opening a bank account, or picking a suburb from someone who has done it." },
  { icon: MessagesSquare, title: "Real support", body: "A human team and clear dispute guidance if anything goes sideways." },
];

const filters = [
  "No rental history needed",
  "Bills included",
  "Pet-friendly",
  "Near universities",
  "Near public transport",
  "Furnished rooms",
  "Female-only households",
  "Instant book",
];

export default function ForSeekers() {
  return (
    <>
      <Head>
        <title>For Seekers - Find a room you can trust | MigRent</title>
        <meta name="description" content="Verified rooms for migrants, students, and new arrivals across Australia. No rental history or local credit file needed. $0 renter fees." />
      </Head>

      <PageSubnav
        title="For Seekers"
        links={[
          { label: "How it works", href: "#how" },
          { label: "Why MigRent", href: "#why" },
          { label: "Filters", href: "#filters" },
          { label: "Cities", href: "#cities" },
        ]}
        cta={{ label: "Start searching", href: "/seeker/search" }}
      />

      {/* 1 · HERO - listing-collage split (distinct from the homepage video hero) */}
      <section className="mood-field border-b border-[var(--color-line)] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-16 md:py-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.3, 1] }}>
              <div className="eyebrow mb-5">For seekers · Free to use</div>
              <h1 className="font-serif text-[44px] sm:text-[58px] xl:text-[64px] font-medium leading-[0.98] tracking-[-0.025em] text-[var(--color-ink)] [overflow-wrap:anywhere]">
                Find your room.
                <br />
                <span className="text-[var(--color-primary)]">Feel at home.</span>
              </h1>
              <p className="mt-6 text-[17px] sm:text-[18px] text-[var(--color-ink-2)] max-w-[48ch] leading-[1.55]">
                Verified rooms across Australia for migrants, students, and new arrivals - with no rental history or local credit file needed.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/seeker/search" className="btn-primary h-12 px-7 text-[15px]">Start searching <ArrowRight className="w-4 h-4" /></Link>
                <Link href="/pricing" className="btn-secondary h-12 px-7 text-[15px]">View pricing</Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
                {[
                  { icon: BadgeCheck, label: "ID-verified hosts" },
                  { icon: Lock, label: "Bond lodged properly" },
                  { icon: Wallet, label: "$0 renter fees" },
                ].map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--color-ink-2)]">
                    <c.icon className="w-4 h-4 text-[var(--color-accent)]" /> {c.label}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Listing collage - hand-built, token-only */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.7, 0.3, 1] }}
              className="relative hidden sm:block h-[460px]"
              aria-hidden="true"
            >
              {/* back card */}
              <div className="absolute right-6 top-0 w-[72%] rotate-[2.5deg]">
                <div className="rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-line)] shadow-[var(--shadow-card)] bg-[var(--color-surface-2)]">
                  <div className="photo-placeholder h-[150px]">Carlton · Room</div>
                  <div className="p-4">
                    <div className="eyebrow">Carlton, VIC</div>
                    <div className="font-serif text-[18px] text-[var(--color-ink)] mt-1 leading-tight">Bright room near campus</div>
                    <div className="font-mono text-[13px] text-[var(--color-ink)] mt-2 tabular-nums">$295<span className="text-[var(--color-ink-3)]">/wk</span></div>
                  </div>
                </div>
              </div>
              {/* front card */}
              <div className="absolute left-0 bottom-10 w-[72%] -rotate-[2deg]">
                <div className="rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-line)] shadow-[var(--shadow-pop)] bg-[var(--color-surface-2)]">
                  <div className="photo-placeholder h-[170px]">Marrickville · Room</div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="eyebrow">Marrickville, NSW</div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent)]"><Check className="w-3 h-3" strokeWidth={2.8} /> Verified</span>
                    </div>
                    <div className="font-serif text-[19px] text-[var(--color-ink)] mt-1 leading-tight">Sunny ensuite, bills included</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-mono text-[14px] text-[var(--color-ink)] tabular-nums">$310<span className="text-[var(--color-ink-3)]">/wk</span></div>
                      <span className="inline-flex items-center gap-1 text-[12px] text-[var(--color-ink-2)]"><Star className="w-3 h-3 text-[var(--color-warn-500)] fill-[var(--color-warn-500)]" /> New</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* floating chip */}
              <div className="absolute right-0 bottom-2 bg-[var(--color-surface-2)]/95 backdrop-blur rounded-full border border-[var(--color-line)] shadow-[var(--shadow-card)] px-4 py-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">No rental history needed</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2 · HOW IT WORKS (steps grid, same language as homepage) */}
      <section id="how" className="bg-[var(--color-surface)] border-b border-[var(--color-line)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="mb-12">
            <div className="eyebrow mb-3">How it works</div>
            <h2 className="font-serif text-[34px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)] max-w-[16ch]">From searching to settled.</h2>
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
      <ScrollMarquee words={["No rental history", "Verified hosts", "Bond protected", "$0 renter fees", "Mentors included"]} />

      {/* 3 · BENEFITS */}
      <section id="why" className="scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16">
            <motion.div {...reveal} className="lg:sticky lg:top-24 lg:self-start">
              <div className="eyebrow mb-3">Why seekers choose MigRent</div>
              <h2 className="font-serif text-[34px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)]">Built for your first rental here.</h2>
              <p className="mt-5 text-[16px] text-[var(--color-ink-2)] leading-[1.6] max-w-[42ch]">Everything the usual market makes hard, made simple and safe.</p>
              <Link href="/seeker/search" className="btn-primary h-11 px-5 text-sm mt-7">Browse rooms <ArrowRight className="w-3.5 h-3.5" /></Link>
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

      {/* 4 · FILTERS */}
      <section id="filters" className="mood-field-strong border-y border-[var(--color-line)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div {...reveal}>
              <div className="eyebrow mb-3">Search that gets it</div>
              <h2 className="font-serif text-[34px] md:text-[48px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)]">Filters made for arriving.</h2>
              <p className="mt-5 text-[16px] text-[var(--color-ink-2)] leading-[1.6] max-w-[44ch]">
                Most rental sites filter by price and bedrooms. MigRent also filters by the things that decide whether a place works for someone new to the country.
              </p>
              <Link href="/seeker/search" className="btn-primary h-11 px-5 text-sm mt-7">Try the search <ArrowRight className="w-3.5 h-3.5" /></Link>
            </motion.div>
            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="flex flex-wrap gap-2.5">
              {filters.map((f) => (
                <span key={f} className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--color-ink)] bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-full px-4 py-2.5 shadow-[var(--shadow-soft)]">
                  <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" strokeWidth={2.6} /> {f}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4b · STATEMENT (word-fill) */}
      <ScrollStatement
        eyebrow="What we believe"
        text="Arriving somewhere new takes courage. Finding a safe place to sleep should not. Your visa and your story are enough."
      />

      {/* 5 · WHERE */}
      <section id="cities" className="scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="mb-9">
            <div className="eyebrow mb-2.5">Where you can live</div>
            <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">Rooms across Australia's biggest cities.</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { city: "Sydney", note: "Surry Hills to Parramatta" },
              { city: "Melbourne", note: "Carlton to Footscray" },
              { city: "Brisbane", note: "West End to South Bank" },
              { city: "More soon", note: "Perth & Adelaide next" },
            ].map((c, i) => (
              <motion.div key={c.city} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-6 card-lift">
                <MapPin className="w-5 h-5 text-[var(--color-primary)] mb-4" />
                <div className="font-serif text-[24px] tracking-[-0.015em] text-[var(--color-ink)] leading-none">{c.city}</div>
                <div className="text-[13px] text-[var(--color-ink-3)] mt-2 leading-[1.4]">{c.note}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · CTA */}
      <section className="mood-field-strong border-t border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="max-w-[760px]">
            <div className="eyebrow mb-5">Free to browse · No credit file needed</div>
            <h2 className="font-serif text-[40px] md:text-[60px] leading-[0.98] tracking-[-0.03em] text-[var(--color-ink)]">Ready to find your room?</h2>
            <p className="mt-5 text-[17px] text-[var(--color-ink-2)] leading-[1.55] max-w-[560px]">Join migrants, students, and professionals who found a home they can trust through MigRent.</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/seeker/search" className="btn-primary h-12 px-7 text-[15px]">Start searching <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/faq" className="btn-secondary h-12 px-7 text-[15px]">Questions? Read the FAQ</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
