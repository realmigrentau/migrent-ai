import Link from "next/link";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  Check,
  ArrowRight,
  Calendar,
  Bed,
  Bath,
  Heart,
  Search,
  KeyRound,
  Lock,
  Sparkles,
  MapPin,
  Wallet,
  HeartHandshake,
  BadgeCheck,
  MessagesSquare,
  Compass,
} from "lucide-react";
import { searchListings } from "../lib/api";
import OwnerMarquee from "../components/OwnerMarquee";

type Listing = {
  id: string;
  title?: string;
  address?: string;
  suburb?: string;
  city?: string;
  postcode?: string;
  weekly_price?: number;
  daily_price?: number;
  room_type?: string;
  property_type?: string;
  beds?: number;
  bath?: number;
  bills_included?: boolean;
  verified?: boolean;
  available_from?: string;
};

/* Slow, weighted reveal - the premium feel. */
const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0.7, 0.3, 1] as const },
};

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4";

function PriceTag({ price }: { price: number }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-mono font-bold tracking-[-0.02em] text-[var(--color-ink)] tabular-nums text-[20px]">
        ${price}
      </span>
      <span className="text-[var(--color-ink-3)] font-medium text-[12px]">AUD/wk</span>
    </span>
  );
}

function HomeListingCard({ listing }: { listing: Listing }) {
  const suburb = listing.suburb || listing.city || "Australia";
  const postcode = listing.postcode ? `, ${listing.postcode}` : "";
  const title = listing.title || listing.address || "Verified room in Australia";
  const price = listing.weekly_price || (listing.daily_price ? listing.daily_price * 7 : 0);
  return (
    <Link href={`/listing/${listing.id}`} className="card-lift group flex flex-col overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-card)] hover:border-[var(--color-line-2)] hover:shadow-[var(--shadow-card)] transition-all">
      <div className="relative">
        <div className="photo-placeholder h-[190px] w-full" style={{ borderRadius: 0 }}>
          {suburb} · {listing.property_type || listing.room_type || "Room"}
        </div>
        {listing.verified && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 h-[20px] px-2 rounded-full bg-[var(--color-surface-2)]/95 backdrop-blur text-[var(--color-accent)] text-[10.5px] font-semibold shadow-[var(--shadow-soft)]">
              <Check className="w-2.5 h-2.5" strokeWidth={2.6} /> Verified host
            </span>
          </div>
        )}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-2.5 right-2.5 w-[32px] h-[32px] rounded-full bg-[var(--color-surface-2)]/92 backdrop-blur flex items-center justify-center text-[var(--color-ink-2)] hover:text-[var(--color-coral-500)] transition-colors"
          aria-label="Save listing"
        >
          <Heart className="w-[15px] h-[15px]" />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="eyebrow truncate">{suburb}{postcode}</div>
        <div className="font-serif text-[19px] tracking-[-0.01em] text-[var(--color-ink)] leading-[1.2] line-clamp-2">
          {title}
        </div>
        <div className="flex gap-3 text-[12.5px] text-[var(--color-ink-3)] mt-auto">
          {listing.beds != null && <span className="inline-flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {listing.beds}</span>}
          {listing.bath != null && <span className="inline-flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {listing.bath}</span>}
          {listing.available_from && <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(listing.available_from).toLocaleDateString("en-AU", { month: "short", day: "numeric" })}</span>}
        </div>
        <hr className="rule-soft my-1" />
        <div className="flex justify-between items-end">
          <PriceTag price={price} />
          <span className="text-[11.5px] text-[var(--color-ink-3)]">{listing.bills_included ? "Bills inc." : "Long stay"}</span>
        </div>
      </div>
    </Link>
  );
}

/* ── How it works · pinned sideways-scroll showcase ── */
const steps = [
  { icon: Search, kicker: "01 · Search", title: "Search the way you live", body: "Filter by budget, suburb, and move-in date, then by what actually matters: no rental history needed, pet-friendly, or bills included." },
  { icon: ShieldCheck, kicker: "02 · Verify", title: "Meet verified owners", body: "Every host completes government ID and proof-of-property checks before a single room goes live. You always know who you are talking to." },
  { icon: Lock, kicker: "03 · Book", title: "Book with your bond protected", body: "Pay securely through Stripe. Your bond is held in independent escrow, never in the landlord's bank account." },
  { icon: KeyRound, kicker: "04 · Settle", title: "Move in, settle in", body: "Real support and dispute guidance when you need it, plus mentors who have made the same move before you." },
];

function StepCard({ step }: { step: (typeof steps)[number] }) {
  const Icon = step.icon;
  return (
    <article className="relative h-full w-[78vw] sm:w-[420px] shrink-0 bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-7 sm:p-9 flex flex-col shadow-[var(--shadow-card)]">
      <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center mb-6">
        <Icon className="w-6 h-6" strokeWidth={1.75} />
      </div>
      <div className="eyebrow mb-3">{step.kicker}</div>
      <h3 className="font-serif text-[28px] sm:text-[34px] leading-[1.05] tracking-[-0.015em] text-[var(--color-ink)]">{step.title}</h3>
      <p className="mt-4 text-[15px] leading-[1.6] text-[var(--color-ink-2)] max-w-[36ch]">{step.body}</p>
    </article>
  );
}

function HowItWorks() {
  const targetRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const check = () => setPinned(window.innerWidth >= 1024 && !reduced);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [reduced]);

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-64%"]);

  const header = (
    <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14">
      <div className="eyebrow mb-3">How MigRent works</div>
      <h2 className="font-serif text-[34px] md:text-[52px] leading-[1.02] tracking-[-0.025em] text-[var(--color-ink)] max-w-[16ch]">
        Four steps from searching to settled.
      </h2>
      <p className="mt-4 text-[16px] text-[var(--color-ink-2)] max-w-[52ch] leading-[1.55]">
        No paper applications, no agents talking down to you, no rental ledger you don't have yet. Just a clear path to a room you can trust.
      </p>
    </div>
  );

  if (!pinned) {
    return (
      <section className="mood-field py-16 sm:py-20 border-y border-[var(--color-line)]">
        {header}
        <div className="hscroll mt-9 px-6 md:px-10 lg:px-14 [&>*]:h-auto">
          {steps.map((s) => <StepCard key={s.kicker} step={s} />)}
        </div>
      </section>
    );
  }

  return (
    <section ref={targetRef} className="mood-field relative h-[320vh] border-y border-[var(--color-line)]">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="pt-4 pb-10">{header}</div>
        <motion.div style={{ x }} className="flex gap-7 pl-6 md:pl-10 lg:pl-14 h-[56vh] items-stretch">
          {steps.map((s) => <StepCard key={s.kicker} step={s} />)}
          <div className="shrink-0 w-[30vw]" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const [budget, setBudget] = useState(350);
  const [city, setCity] = useState("Melbourne, VIC");
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const reduced = useReducedMotion();

  // Hero video parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoY = useTransform(heroP, [0, 1], [0, reduced ? 0 : -64]);

  // Cities band parallax
  const citiesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: citiesP } = useScroll({ target: citiesRef, offset: ["start end", "end start"] });
  const citiesY = useTransform(citiesP, [0, 1], [reduced ? 0 : 40, reduced ? 0 : -40]);

  useEffect(() => {
    let cancelled = false;
    searchListings({ limit: "3" })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) setListings(data.slice(0, 3));
        else if (data && Array.isArray(data.listings)) setListings(data.listings.slice(0, 3));
      })
      .catch((err) => { if (!cancelled) console.warn("Failed to load featured listings:", err); })
      .finally(() => { if (!cancelled) setListingsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const matchCount = Math.max(1, Math.floor((budget - 100) / 7));

  const categories = [
    { label: "Under $250/wk", href: "/seeker/search?maxPrice=250" },
    { label: "Studio apartments", href: "/seeker/search?propertyType=studio" },
    { label: "Share houses", href: "/seeker/search?roomType=private" },
    { label: "Near universities", href: "/seeker/search?nearUni=true" },
    { label: "Pet-friendly", href: "/seeker/search?pets=true" },
    { label: "Bills included", href: "/seeker/search?billsIncluded=true" },
  ];

  const heroChips = [
    { icon: BadgeCheck, label: "ID-verified hosts" },
    { icon: Lock, label: "Bond held in escrow" },
    { icon: Wallet, label: "$0 renter fees" },
  ];

  const trustItems = [
    { icon: ShieldCheck, h: "ID-verified hosts", p: "Every host completes government ID and proof-of-property checks before listing." },
    { icon: Lock, h: "Bond held in escrow", p: "Your bond sits with an independent escrow partner, released only when it should be." },
    { icon: BadgeCheck, h: "No rental history needed", p: "References are optional and weighted, not required. Your visa and your story are enough." },
    { icon: MessagesSquare, h: "Real human support", p: "A team that answers, plus clear dispute guidance if something goes sideways." },
  ];

  const stories = [
    { name: "Aisha", from: "Karachi → Carlton", initial: "A", tone: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]", quote: "I had a student visa, no payslip, and a phone that didn't work yet. The hosts I messaged actually replied, and one of them said yes." },
    { name: "Lucas", from: "São Paulo → Surry Hills", initial: "L", tone: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]", quote: "The bond went into escrow, not my landlord's account. After years of horror stories from friends in Sydney, that felt huge." },
    { name: "Mei", from: "Taipei → Brisbane", initial: "M", tone: "bg-[var(--color-warn-50)] text-[var(--color-warn-500)]", quote: "I filtered by 'no rental history needed' and there were real options, run by people who understood why I was asking." },
  ];

  const faqs = [
    { q: "Do I need an Australian rental history?", a: "No. Many hosts on MigRent accept first-time renters with no local rental ledger or credit file. You can filter specifically for them." },
    { q: "How is my bond protected?", a: "Your bond is held by an independent escrow partner rather than the landlord directly, and is only released according to the agreement." },
    { q: "What does it cost to use MigRent?", a: "Browsing and applying is free for renters, with $0 platform service fees. Owners pay to list and manage their rooms." },
    { q: "How do you verify hosts?", a: "Every host completes government ID verification and proof that they control the property before any room can go live." },
  ];

  return (
    <>
      <Head>
        <title>MigRent - A real home in Australia, found the right way.</title>
        <meta name="description" content="Verified rooms across Australia for migrants, students, and new arrivals. Every host ID-checked, every bond held in escrow. No rental history needed." />
        <meta property="og:title" content="MigRent - A real home in Australia" />
        <meta property="og:description" content="Verified rooms across Australia for migrants, students, and new arrivals." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-default.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/og-default.png" />
      </Head>

      {/* ════════ 1 · HERO (split editorial) ════════ */}
      <section ref={heroRef} className="mood-field border-b border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-12 md:py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            {/* Left: message + search */}
            <div>
              <div className="eyebrow mb-5">Verified rentals · Australia</div>
              <h1 className="font-serif text-[44px] sm:text-[58px] xl:text-[68px] font-medium leading-[0.98] tracking-[-0.025em] text-[var(--color-ink)] [overflow-wrap:anywhere]">
                A real home in Australia,
                <br />
                <span className="text-[var(--color-primary)]">found the right way.</span>
              </h1>
              <p className="mt-6 text-[17px] sm:text-[18px] text-[var(--color-ink-2)] max-w-[46ch] leading-[1.55]">
                Verified rooms for migrants, students, and new arrivals - with no rental history or local credit file needed.
              </p>

              {/* Search bar */}
              <div className="mt-8 bg-[var(--color-surface-2)] rounded-[var(--radius-xl)] border border-[var(--color-line)] shadow-[var(--shadow-card)] p-4 sm:p-5 max-w-[520px]">
                <div className="grid grid-cols-2 bg-[var(--color-surface)] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-line)]">
                  <label className="px-4 py-3 border-r border-[var(--color-line)] block">
                    <div className="eyebrow">City</div>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-transparent border-none outline-none text-[15px] font-semibold text-[var(--color-ink)] w-full mt-1 p-0"
                      aria-label="City"
                    />
                  </label>
                  <div className="px-4 py-3">
                    <div className="eyebrow">Move-in</div>
                    <div className="text-[15px] font-semibold text-[var(--color-ink)] mt-1">Any time</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-baseline">
                    <div className="eyebrow">Weekly budget</div>
                    <div className="font-mono text-[13px] text-[var(--color-ink)] tabular-nums">up to ${budget}/wk</div>
                  </div>
                  <input
                    type="range" min={150} max={1000} step={5} value={budget}
                    onChange={(e) => setBudget(+e.target.value)}
                    aria-label={`Weekly budget: up to $${budget} AUD`}
                    className="premium-range w-full mt-2.5"
                  />
                </div>
                <Link
                  href={`/seeker/search?city=${encodeURIComponent(city)}&maxPrice=${budget}`}
                  className="mt-4 w-full bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[15px] font-semibold h-12 rounded-[var(--radius-card)] hover:bg-[var(--color-primary-500)] transition-colors inline-flex items-center justify-center gap-2"
                >
                  Show {matchCount} matching homes <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust chips */}
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
                {heroChips.map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--color-ink-2)]">
                    <c.icon className="w-4 h-4 text-[var(--color-accent)]" /> {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: framed video */}
            <motion.div style={{ y: videoY }} className="relative">
              <div className="relative overflow-hidden rounded-[24px] border border-[var(--color-line)] shadow-[var(--shadow-pop)] aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] bg-[var(--color-ink)]">
                <video autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" src={VIDEO_SRC} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10171a]/45 via-transparent to-transparent" aria-hidden="true" />
                {/* Floating verified pill */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2.5 bg-[var(--color-surface-2)]/92 backdrop-blur-md rounded-[var(--radius-card)] px-3.5 py-2.5 shadow-[var(--shadow-card)]">
                  <span className="w-8 h-8 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--color-ink)] leading-tight">Every host, verified</div>
                    <div className="text-[11.5px] text-[var(--color-ink-3)] leading-tight">Government ID + proof of property</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ 2 · TRUST BAR ════════ */}
      <section className="bg-[var(--color-surface)] border-b border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[var(--color-line)]">
          {trustItems.map((it, i) => (
            <motion.div key={i} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="px-6 md:px-8 py-7">
              <it.icon className="w-6 h-6 text-[var(--color-accent)] mb-3.5" strokeWidth={1.75} />
              <div className="font-serif text-[19px] tracking-[-0.01em] text-[var(--color-ink)] leading-[1.15]">{it.h}</div>
              <div className="text-[13px] text-[var(--color-ink-2)] mt-1.5 leading-[1.5]">{it.p}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════ 3 · THE PROBLEM / WHY ════════ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-18 md:py-24">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">
            <motion.div {...reveal}>
              <div className="eyebrow mb-3">Why we built MigRent</div>
              <h2 className="font-serif text-[36px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)]">
                Renting here shouldn't require a history you don't have yet.
              </h2>
            </motion.div>
            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="space-y-5 text-[16px] md:text-[17px] leading-[1.65] text-[var(--color-ink-2)]">
              <p>
                When you first arrive in Australia, the rental market asks for the one thing you can't have yet: a local rental ledger, payslips going back months, an Aussie credit file. So new arrivals get pushed toward whatever they can find - often unverified, overpriced, or simply unsafe.
              </p>
              <p>
                MigRent flips that. Hosts are verified before they can list. Your bond is protected by an independent escrow. And listings can be filtered for owners who welcome first-time renters - so your visa and your story count for more than a credit score you haven't built.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/for-seekers" className="btn-primary h-11 px-5 text-sm">How it works for renters <ArrowRight className="w-3.5 h-3.5" /></Link>
                <Link href="/about" className="btn-secondary h-11 px-5 text-sm">Our story</Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ 4 · HOW IT WORKS (pinned sideways) ════════ */}
      <HowItWorks />

      {/* ════════ 5 · BROWSE + FEATURED ════════ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-18 md:py-24">
          <motion.div {...reveal} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <div className="eyebrow mb-2.5">Browse</div>
              <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">Sorted by what fits you.</h2>
              <p className="text-[16px] text-[var(--color-ink-2)] mt-3 max-w-[52ch] leading-[1.55]">Start with a shortcut below, or open the full map and filter by everything that matters to you.</p>
            </div>
            <Link href="/seeker/search" className="text-[var(--color-primary)] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all shrink-0">See all listings <ArrowRight className="w-3.5 h-3.5" /></Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {categories.map((c, i) => (
              <motion.div key={c.label} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.05 }}>
                <Link href={c.href} className="card-lift flex items-center justify-between px-5 py-4 bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-card)] text-[var(--color-ink)] hover:border-[var(--color-primary-200)] transition-colors">
                  <span className="text-[15px] font-semibold">{c.label}</span>
                  <ArrowRight className="w-4 h-4 text-[var(--color-primary)]" />
                </Link>
              </motion.div>
            ))}
          </div>

          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-card)]">
                  <div className="shimmer h-[190px] w-full" />
                  <div className="p-4 space-y-2.5">
                    <div className="shimmer h-3 w-1/3 rounded" /><div className="shimmer h-4 w-3/4 rounded" /><div className="shimmer h-3 w-1/2 rounded" />
                    <div className="h-px bg-[var(--color-line)] my-1" />
                    <div className="flex justify-between"><div className="shimmer h-5 w-20 rounded" /><div className="shimmer h-3 w-16 rounded" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((l, i) => (
                <motion.div key={l.id} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.06 }}>
                  <HomeListingCard listing={l} />
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ════════ 6 · TWO PATHS ════════ */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-18 md:py-24">
          <motion.div {...reveal} className="mb-10">
            <div className="eyebrow mb-2.5">Two sides, one community</div>
            <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)] max-w-[18ch]">Whether you're moving in or opening a door.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: Compass, tag: "For seekers", title: "Find a room you can trust", points: ["Filter for hosts who welcome first-time renters", "See verified hosts and protected bonds up front", "Message, apply, and book in one place"], cta: "I'm a Seeker", href: "/for-seekers" },
              { icon: KeyRound, tag: "For owners", title: "Fill your room with the right tenant", points: ["List free and reach verified, serious renters", "Get matched enquiries, not a flooded inbox", "Secure payments and clear agreements built in"], cta: "I'm an Owner", href: "/for-owners" },
            ].map((p, i) => (
              <motion.div key={p.tag} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="card-lift bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-8 flex flex-col">
                <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center mb-6"><p.icon className="w-6 h-6" strokeWidth={1.75} /></div>
                <div className="eyebrow mb-2">{p.tag}</div>
                <h3 className="font-serif text-[26px] tracking-[-0.015em] text-[var(--color-ink)] leading-[1.1]">{p.title}</h3>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-2.5 text-[14.5px] text-[var(--color-ink-2)] leading-[1.45]">
                      <Check className="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0" strokeWidth={2.4} /> {pt}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className="btn-primary h-11 px-5 text-sm mt-7 self-start">{p.cta} <ArrowRight className="w-3.5 h-3.5" /></Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 7 · WHERE WE OPERATE (parallax band) ════════ */}
      <section ref={citiesRef} className="mood-field-strong border-b border-[var(--color-line)] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-18 md:py-24">
          <motion.div {...reveal} className="mb-9">
            <div className="eyebrow mb-2.5">Where we operate</div>
            <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">Across Australia's biggest welcome mats.</h2>
          </motion.div>
          <motion.div style={{ y: citiesY }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </motion.div>
        </div>
      </section>

      {/* ════════ 8 · MENTORS ════════ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-18 md:py-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <motion.div {...reveal}>
              <div className="eyebrow mb-3">More than a listing</div>
              <h2 className="font-serif text-[36px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)]">Settle in with someone who has done it before.</h2>
              <p className="mt-5 text-[16px] md:text-[17px] text-[var(--color-ink-2)] leading-[1.65] max-w-[48ch]">
                Finding a room is only half of arriving. MigRent connects you with mentors who have made the same move - people who can help you read a lease, open a bank account, find the right suburb, and feel less alone in the first few weeks.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <Link href="/mentors" className="btn-primary h-11 px-5 text-sm">Meet our mentors <ArrowRight className="w-3.5 h-3.5" /></Link>
                <Link href="/become-mentor" className="btn-secondary h-11 px-5 text-sm">Become a mentor</Link>
              </div>
            </motion.div>
            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-8">
              <HeartHandshake className="w-9 h-9 text-[var(--color-accent)]" strokeWidth={1.6} />
              <div className="mt-5 space-y-4">
                {["Reads a lease with you before you sign", "Knows which suburbs fit your budget and commute", "Has answers for the questions you didn't know to ask"].map((t) => (
                  <div key={t} className="flex gap-3 text-[15px] text-[var(--color-ink-2)] leading-[1.5] pb-4 border-b border-[var(--color-line)] last:border-0 last:pb-0">
                    <Check className="w-4 h-4 text-[var(--color-accent)] mt-1 shrink-0" strokeWidth={2.4} /> {t}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ 9 · STORIES ════════ */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-18 md:py-24">
          <motion.div {...reveal} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-9">
            <div>
              <div className="eyebrow mb-2.5">From people who found a home</div>
              <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">The first week, in their words.</h2>
            </div>
            <Link href="/about" className="text-[var(--color-primary)] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all shrink-0">Read more stories <ArrowRight className="w-3.5 h-3.5" /></Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stories.map((s, i) => (
              <motion.div key={i} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="card-lift bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-7 flex flex-col gap-4">
                <div className="font-serif text-[22px] leading-[1.35] text-[var(--color-ink)] tracking-[-0.01em] flex-1">&ldquo;{s.quote}&rdquo;</div>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-line)]">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${s.tone}`}>{s.initial}</span>
                  <div>
                    <div className="text-[14px] font-semibold text-[var(--color-ink)]">{s.name}</div>
                    <div className="font-mono text-[10.5px] text-[var(--color-ink-3)]">{s.from}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 10 · FAQ ════════ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-18 md:py-24">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
            <motion.div {...reveal}>
              <div className="eyebrow mb-2.5">Good to know</div>
              <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">Questions, answered plainly.</h2>
              <Link href="/faq" className="mt-6 inline-flex items-center gap-1.5 text-[var(--color-primary)] font-semibold text-sm hover:gap-2.5 transition-all">See all FAQs <ArrowRight className="w-3.5 h-3.5" /></Link>
            </motion.div>
            <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              {faqs.map((f, i) => (
                <motion.div key={i} {...reveal} transition={{ ...reveal.transition, delay: i * 0.05 }} className="py-6">
                  <h3 className="font-serif text-[20px] tracking-[-0.01em] text-[var(--color-ink)] mb-2">{f.q}</h3>
                  <p className="text-[15px] text-[var(--color-ink-2)] leading-[1.6] max-w-[62ch]">{f.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 11 · OWNER MARQUEE ════════ */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-line)] py-14">
        <motion.div {...reveal} className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 mb-7">
          <div className="eyebrow mb-2.5">Verified owners</div>
          <h2 className="font-serif text-[28px] md:text-[40px] tracking-[-0.02em] leading-[1.05] text-[var(--color-ink)]">Rooms from people who passed our checks.</h2>
          <p className="mt-2 text-[15px] text-[var(--color-ink-2)] max-w-[560px] leading-[1.55]">Browse top-rated listings across Sydney, Melbourne, Brisbane, and beyond.</p>
        </motion.div>
        <OwnerMarquee />
      </section>

      {/* ════════ 12 · CLOSING CTA ════════ */}
      <section className="mood-field-strong border-t border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="max-w-[760px]">
            <div className="inline-flex items-center gap-2 text-[var(--color-primary)] mb-5">
              <Sparkles className="w-5 h-5" />
              <span className="eyebrow">Free to browse · No credit file needed</span>
            </div>
            <h2 className="font-serif text-[40px] md:text-[64px] leading-[0.98] tracking-[-0.03em] text-[var(--color-ink)]">Ready to find your room?</h2>
            <p className="mt-5 text-[17px] text-[var(--color-ink-2)] leading-[1.55] max-w-[560px]">Join migrants, students, and professionals who found a home they can trust through MigRent.</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/for-seekers" className="btn-primary h-12 px-7 text-[15px]">I'm a Seeker <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/for-owners" className="btn-secondary h-12 px-7 text-[15px]">I'm an Owner</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
