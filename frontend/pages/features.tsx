import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  Star,
  Globe,
  MapPin,
  UsersRound,
  Check,
  ArrowRight,
  BadgeCheck,
  Lock,
} from "lucide-react";
import PageSubnav from "../components/ui/PageSubnav";
import { reveal, ScrollStatement, ScrollMarquee } from "../components/marketing/motion";

/* Hallmark · genre: editorial · design-system: design.md · designed-as-app
 * macrostructure: Marquee Hero family (marketing) · page: features
 * Mocks are Tier-A CSS art built from tokens - no screenshots, no chrome. */

/* ───────── Tier-A CSS mocks ───────── */

function MockMatching() {
  const rows = [
    { name: "Sunny ensuite · Marrickville", pct: "96%", on: true },
    { name: "Garden room · Brunswick", pct: "91%", on: false },
    { name: "Loft room · West End", pct: "87%", on: false },
  ];
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface-2)] shadow-[var(--shadow-pop)] p-6" aria-hidden="true">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center"><Sparkles className="w-4 h-4" /></span>
        <span className="text-[13.5px] font-semibold text-[var(--color-ink)]">Finding your match…</span>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.name} className={`flex items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3 ${r.on ? "border-[var(--color-primary-200)] bg-[var(--color-primary-50)]" : "border-[var(--color-line)] bg-[var(--color-surface)]"}`}>
            <div className="photo-placeholder w-11 h-11 rounded-[8px] shrink-0 text-[0px]">room</div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold text-[var(--color-ink)] truncate">{r.name}</div>
              <div className="mt-1.5 h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: r.pct }} />
              </div>
            </div>
            <span className="font-mono text-[12.5px] font-bold text-[var(--color-primary)] tabular-nums shrink-0">{r.pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockVerify() {
  const checks = ["Government ID confirmed", "Proof of property confirmed", "Ongoing monitoring active"];
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface-2)] shadow-[var(--shadow-pop)] p-6" aria-hidden="true">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-11 h-11 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center"><BadgeCheck className="w-5 h-5" /></span>
        <div>
          <div className="text-[14px] font-semibold text-[var(--color-ink)] leading-tight">Sarah M. · Host</div>
          <div className="text-[12px] text-[var(--color-ink-3)] leading-tight mt-0.5">Verified owner since 2025</div>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent)] bg-[var(--color-accent-soft)] rounded-full px-2.5 py-1"><Check className="w-3 h-3" strokeWidth={2.8} /> Verified</span>
      </div>
      <div className="space-y-2.5">
        {checks.map((c) => (
          <div key={c} className="flex items-center gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-line)] px-4 py-3">
            <Check className="w-4 h-4 text-[var(--color-accent)] shrink-0" strokeWidth={2.6} />
            <span className="text-[13px] font-medium text-[var(--color-ink-2)]">{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockBooking() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface-2)] shadow-[var(--shadow-pop)] p-6" aria-hidden="true">
      <div className="eyebrow mb-4">Instant book</div>
      <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 mb-4">
        <div className="flex justify-between text-[13px] text-[var(--color-ink-2)]"><span>Rent · 4 weeks</span><span className="font-mono tabular-nums text-[var(--color-ink)]">$1,240</span></div>
        <div className="flex justify-between text-[13px] text-[var(--color-ink-2)] mt-2"><span>Bond (held in escrow)</span><span className="font-mono tabular-nums text-[var(--color-ink)]">$620</span></div>
        <div className="flex justify-between text-[13px] mt-2"><span className="text-[var(--color-ink-2)]">MigRent renter fee</span><span className="font-mono tabular-nums font-bold text-[var(--color-accent)]">$0</span></div>
        <hr className="rule-soft my-3" />
        <div className="flex justify-between text-[14px] font-semibold text-[var(--color-ink)]"><span>Move-in total</span><span className="font-mono tabular-nums">$1,860</span></div>
      </div>
      <div className="h-11 rounded-[var(--radius-card)] bg-[var(--color-primary)] text-[color:var(--color-primary-fg)] flex items-center justify-center gap-2 text-[14px] font-semibold">
        <Zap className="w-4 h-4" /> Book instantly
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-[var(--color-ink-3)] mt-3"><Lock className="w-3 h-3" /> Secured by Stripe</div>
    </div>
  );
}

function MockFilters() {
  const on = ["No rental history", "Bills included", "Near station"];
  const off = ["Pet-friendly", "Furnished", "Female-only", "Instant book", "Near university"];
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface-2)] shadow-[var(--shadow-pop)] p-6" aria-hidden="true">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center"><SlidersHorizontal className="w-4 h-4" /></span>
        <span className="text-[13.5px] font-semibold text-[var(--color-ink)]">Filters that understand arriving</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {on.map((f) => (
          <span key={f} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[color:var(--color-primary-fg)] bg-[var(--color-primary)] rounded-full px-3.5 py-2">
            <Check className="w-3 h-3" strokeWidth={2.8} /> {f}
          </span>
        ))}
        {off.map((f) => (
          <span key={f} className="inline-flex items-center text-[12.5px] font-medium text-[var(--color-ink-2)] bg-[var(--color-surface)] border border-[var(--color-line)] rounded-full px-3.5 py-2">{f}</span>
        ))}
      </div>
      <hr className="rule-soft my-5" />
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[var(--color-ink-2)]">Matching rooms</span>
        <span className="font-mono text-[15px] font-bold text-[var(--color-ink)] tabular-nums">47</span>
      </div>
    </div>
  );
}

/* ───────── Content ───────── */

const deepFeatures = [
  {
    id: "matching",
    icon: Sparkles,
    eyebrow: "Smart matching",
    title: "Matching that learns what you actually want",
    body: "Tell us how you live - budget, commute, lifestyle - and MigRent surfaces the rooms that genuinely fit, not just the newest listings.",
    points: ["Ranked by fit, not by ad spend", "Learns from what you save and skip", "Built around migrant needs first"],
    Mock: MockMatching,
    flip: false,
  },
  {
    id: "trust",
    icon: ShieldCheck,
    eyebrow: "Verified hosts",
    title: "Every host checked before you ever say hello",
    body: "Government ID and proof-of-property verification run before a listing goes live - and stay monitored while it is.",
    points: ["Government ID verification", "Proof of property ownership", "Ongoing checks while listed"],
    Mock: MockVerify,
    flip: true,
  },
  {
    id: "booking",
    icon: Zap,
    eyebrow: "Instant booking",
    title: "From found it to booked it in minutes",
    body: "Instant-book rooms let you secure a place the moment you find it - with payments through Stripe and your bond in independent escrow.",
    points: ["One-tap booking on eligible rooms", "Clear cost breakdown up front", "$0 renter fees, always"],
    Mock: MockBooking,
    flip: false,
  },
  {
    id: "filters",
    icon: SlidersHorizontal,
    eyebrow: "Smart filters",
    title: "Twenty filters built for arriving, not browsing",
    body: "Filter by no-rental-history-needed, distance to a station, bills included, female-only households, and everything else that actually decides where you can live.",
    points: ["No rental history needed", "Distance to stations and campuses", "Household and lifestyle filters"],
    Mock: MockFilters,
    flip: true,
  },
];

const moreFeatures = [
  { icon: Star, title: "Superhost program", body: "The top trusted owners earn a visible badge, so quality is easy to spot." },
  { icon: Globe, title: "Multilingual support", body: "Help in plain language, with a team that understands the migrant journey." },
  { icon: MapPin, title: "Suburb reports", body: "Know rents, transport, and community before you commit to a suburb.", href: "/resources/rental-laws" },
  { icon: UsersRound, title: "Mentor network", body: "Verified locals who made the same move help you settle in.", href: "/mentors" },
];

export default function Features() {
  return (
    <>
      <Head>
        <title>Features - Built for arriving | MigRent</title>
        <meta name="description" content="Smart matching, verified hosts, instant booking, migrant-first filters, suburb reports, and a mentor network. Everything MigRent does, in one place." />
      </Head>

      <PageSubnav
        title="Features"
        links={[
          { label: "Matching", href: "#matching" },
          { label: "Trust", href: "#trust" },
          { label: "Booking", href: "#booking" },
          { label: "Filters", href: "#filters" },
          { label: "More", href: "#more" },
        ]}
        cta={{ label: "Sign up", href: "/signup" }}
      />

      {/* 1 · HERO */}
      <section className="mood-field border-b border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.3, 1] }} className="max-w-[860px]">
            <div className="eyebrow mb-5">Platform features</div>
            <h1 className="font-serif text-[44px] sm:text-[58px] xl:text-[68px] font-medium leading-[0.98] tracking-[-0.025em] text-[var(--color-ink)] [overflow-wrap:anywhere]">
              Powerful features,
              <br />
              <span className="text-[var(--color-primary)]">built for arriving.</span>
            </h1>
            <p className="mt-6 text-[17px] sm:text-[18px] text-[var(--color-ink-2)] max-w-[52ch] leading-[1.55]">
              Everything you need to find or list a room - designed around the first months in a new country.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {["Smart matching", "Verified hosts", "Instant booking", "Migrant-first filters", "Suburb reports", "Mentor network", "Multilingual support"].map((c) => (
                <span key={c} className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-ink)] bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-full px-4 py-2 shadow-[var(--shadow-soft)]">
                  <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" strokeWidth={2.6} /> {c}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2 · DEEP FEATURES (alternating) */}
      {deepFeatures.map((f) => {
        const Icon = f.icon;
        return (
          <section key={f.id} id={f.id} className={`scroll-mt-[76px] border-b border-[var(--color-line)] ${f.flip ? "bg-[var(--color-surface)]" : "bg-[var(--color-bg)]"}`}>
            <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
              <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${f.flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <motion.div {...reveal}>
                  <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center mb-6"><Icon className="w-6 h-6" strokeWidth={1.7} /></div>
                  <div className="eyebrow mb-3">{f.eyebrow}</div>
                  <h2 className="font-serif text-[32px] md:text-[44px] leading-[1.02] tracking-[-0.025em] text-[var(--color-ink)] max-w-[18ch]">{f.title}</h2>
                  <p className="mt-5 text-[16px] md:text-[17px] text-[var(--color-ink-2)] leading-[1.6] max-w-[48ch]">{f.body}</p>
                  <ul className="mt-6 space-y-2.5">
                    {f.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-[14.5px] text-[var(--color-ink)] font-medium leading-[1.45]">
                        <Check className="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0" strokeWidth={2.4} /> {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.12 }}>
                  <f.Mock />
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      {/* 3 · MARQUEE */}
      <ScrollMarquee words={["Smart matching", "Verified hosts", "Instant booking", "Suburb reports", "Mentor network"]} />

      {/* 4 · MORE FEATURES */}
      <section id="more" className="bg-[var(--color-surface)] border-b border-[var(--color-line)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="mb-10">
            <div className="eyebrow mb-2.5">And there's more</div>
            <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)] max-w-[18ch]">The details that make it feel easy.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {moreFeatures.map((o, i) => {
              const inner = (
                <>
                  <div className="w-11 h-11 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center mb-4"><o.icon className="w-5 h-5" strokeWidth={1.8} /></div>
                  <h3 className="font-serif text-[20px] tracking-[-0.01em] text-[var(--color-ink)] leading-[1.15]">{o.title}</h3>
                  <p className="text-[13.5px] text-[var(--color-ink-2)] mt-1.5 leading-[1.5]">{o.body}</p>
                </>
              );
              return (
                <motion.div key={o.title} {...reveal} transition={{ ...reveal.transition, delay: (i % 4) * 0.05 }}>
                  {o.href ? (
                    <Link href={o.href} className="card-lift block h-full bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--color-primary-200)] transition-colors">{inner}</Link>
                  ) : (
                    <div className="card-lift h-full bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-6">{inner}</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 · STATEMENT */}
      <ScrollStatement
        eyebrow="The idea behind all of it"
        text="Every feature exists to answer one question: can someone who just landed find a safe place to live, without a history they haven't had time to build?"
      />

      {/* 6 · CTA */}
      <section className="mood-field-strong border-t border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="max-w-[760px]">
            <div className="eyebrow mb-5">Free to browse · Free to list</div>
            <h2 className="font-serif text-[40px] md:text-[60px] leading-[0.98] tracking-[-0.03em] text-[var(--color-ink)]">See it for yourself.</h2>
            <p className="mt-5 text-[17px] text-[var(--color-ink-2)] leading-[1.55] max-w-[560px]">Search verified rooms, or list yours - every feature above is included from day one.</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/seeker/search" className="btn-primary h-12 px-7 text-[15px]">Start searching <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/for-owners" className="btn-secondary h-12 px-7 text-[15px]">I'm an Owner</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
