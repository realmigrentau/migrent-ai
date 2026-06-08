import Link from "next/link";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Check,
  User as UserIcon,
  Globe,
  ArrowRight,
  Calendar,
  Bed,
  Bath,
  Heart,
  Search,
  KeyRound,
  Lock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
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

/* Slow, weighted reveal — the "expensive" feel. */
const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0.7, 0.3, 1] as const },
};

function PriceTag({ price, size = "md" }: { price: number; size?: "sm" | "md" | "lg" }) {
  const sz = { sm: { num: 16, unit: 11 }, md: { num: 20, unit: 12 }, lg: { num: 30, unit: 13 } }[size];
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-mono font-bold tracking-[-0.02em] text-[var(--color-ink)] tabular-nums" style={{ fontSize: sz.num }}>
        ${price}
      </span>
      <span className="text-[var(--color-ink-3)] font-medium" style={{ fontSize: sz.unit }}>
        AUD/wk
      </span>
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

/* ── How it works · sideways-scroll showcase ──
 * Desktop + motion-on: pinned section, content moves horizontally as you
 * scroll down (the "VIP" effect). Mobile / reduced-motion: a snap row. */
const steps = [
  {
    icon: Search,
    kicker: "01 · Search",
    title: "Search the way you live",
    body: "Filter by budget, suburb, and move-in date — then by what actually matters: no rental history needed, pet-friendly, bills included.",
  },
  {
    icon: ShieldCheck,
    kicker: "02 · Verify",
    title: "Meet verified owners",
    body: "Every host completes government ID and proof-of-property checks before a single room goes live. You always know who you are talking to.",
  },
  {
    icon: Lock,
    kicker: "03 · Book",
    title: "Book with your bond protected",
    body: "Pay securely through Stripe. Your bond is held in independent escrow — never the landlord's bank account.",
  },
  {
    icon: KeyRound,
    kicker: "04 · Settle",
    title: "Move in, settle in",
    body: "Real support and dispute guidance when you need it, plus mentors who have made the same move before you.",
  },
];

function StepCard({ step }: { step: (typeof steps)[number] }) {
  const Icon = step.icon;
  return (
    <article className="relative h-full w-[78vw] sm:w-[420px] shrink-0 bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-7 sm:p-9 flex flex-col shadow-[var(--shadow-card)]">
      <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center mb-6">
        <Icon className="w-6 h-6" strokeWidth={1.75} />
      </div>
      <div className="eyebrow mb-3">{step.kicker}</div>
      <h3 className="font-serif text-[28px] sm:text-[34px] leading-[1.05] tracking-[-0.015em] text-[var(--color-ink)]">
        {step.title}
      </h3>
      <p className="mt-4 text-[15px] leading-[1.6] text-[var(--color-ink-2)] max-w-[36ch]">
        {step.body}
      </p>
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
    </div>
  );

  if (!pinned) {
    // Mobile / reduced-motion: header + horizontal snap row
    return (
      <section className="mood-field py-16 sm:py-20 border-y border-[var(--color-line)]">
        {header}
        <div className="hscroll mt-9 px-6 md:px-10 lg:px-14 [&>*]:h-auto">
          {steps.map((s) => (
            <StepCard key={s.kicker} step={s} />
          ))}
        </div>
      </section>
    );
  }

  // Desktop: pinned, scroll-down-moves-sideways
  return (
    <section ref={targetRef} className="mood-field relative h-[320vh] border-y border-[var(--color-line)]">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="pt-4 pb-10">{header}</div>
        <motion.div style={{ x }} className="flex gap-7 pl-6 md:pl-10 lg:pl-14 h-[58vh] items-stretch">
          {steps.map((s) => (
            <StepCard key={s.kicker} step={s} />
          ))}
          <div className="shrink-0 w-[30vw]" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [budget, setBudget] = useState(350);
  const [city, setCity] = useState("Melbourne, VIC");
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    searchListings({ limit: "3" })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setListings(data.slice(0, 3));
        } else if (data && Array.isArray(data.listings)) {
          setListings(data.listings.slice(0, 3));
        }
      })
      .catch((err) => {
        if (!cancelled) console.warn("Failed to load featured listings:", err);
      })
      .finally(() => {
        if (!cancelled) setListingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = [
    { label: "Under $250/wk", href: "/seeker/search?maxPrice=250" },
    { label: "Studio apartments", href: "/seeker/search?propertyType=studio" },
    { label: "Share houses", href: "/seeker/search?roomType=private" },
    { label: "Near universities", href: "/seeker/search?nearUni=true" },
    { label: "Pet-friendly", href: "/seeker/search?pets=true" },
    { label: "Bills included", href: "/seeker/search?billsIncluded=true" },
  ];

  const trustItems = [
    { icon: ShieldCheck, h: "ID verified hosts", p: "Every host completes government ID and proof-of-property checks." },
    { icon: Check, h: "Bond protected", p: "Your bond is held by an independent escrow, not the landlord." },
    { icon: UserIcon, h: "Tenant references", p: "Optional - and weighted, not required. Your visa is enough." },
    { icon: Globe, h: "Migrant-friendly badge", p: "Hosts who accept first-time renters with no Aussie credit file." },
  ];

  const stories = [
    {
      name: "Aisha",
      from: "Karachi → Carlton",
      initial: "A",
      tone: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
      quote: "I had a student visa, no payslip, and a phone that didn't work yet. The hosts I messaged actually replied - and one of them said yes.",
    },
    {
      name: "Lucas",
      from: "São Paulo → Surry Hills",
      initial: "L",
      tone: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
      quote: "The bond went into escrow, not my landlord's bank account. After three years of horror stories from friends in Sydney, that felt huge.",
    },
    {
      name: "Mei",
      from: "Taipei → Brisbane",
      initial: "M",
      tone: "bg-[var(--color-warn-50)] text-[var(--color-warn-500)]",
      quote: "I filtered by 'no rental history needed' and there were hundreds of listings. Not three. Hundreds.",
    },
  ];

  const matchCount = Math.max(1, Math.floor((budget - 100) / 7));

  return (
    <>
      <Head>
        <title>MigRent - A real home in Australia, found the right way.</title>
        <meta name="description" content="From a $195/wk share in Footscray to a $900/wk apartment in Surry Hills. Every host ID-checked, every listing bond-protected. No rental history needed." />
        <meta property="og:title" content="MigRent - A real home in Australia" />
        <meta property="og:description" content="Verified rooms across Australia for migrants, students, and new arrivals." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-default.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/og-default.png" />
      </Head>

      {/* ════════ SECTION 1 · HERO (video card preserved) ════════ */}
      <section className="bg-[var(--color-bg)] p-3 sm:p-4 md:p-6">
        <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-black min-h-[calc(100vh-84px-24px)] sm:min-h-[calc(100vh-84px-32px)] md:min-h-[calc(100vh-84px-48px)] lg:h-[calc(100vh-84px-48px)]">
          {/* Animated video backdrop — kept */}
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4"
          />
          {/* Warm legibility scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#10171a]/72 via-[#10171a]/18 to-[#10171a]/30" aria-hidden="true" />

          <div className="relative z-10 flex flex-col min-h-[calc(100vh-84px-24px)] sm:min-h-[calc(100vh-84px-32px)] md:min-h-[calc(100vh-84px-48px)] lg:h-full p-4 sm:p-6 md:p-8 gap-6">
            {/* Top glass pill */}
            <div className="flex items-start">
              <div className="inline-flex items-center gap-2 bg-[var(--color-surface-2)]/70 backdrop-blur-md rounded-full shadow-sm pl-3 pr-3.5 py-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
                <span className="text-[12.5px] font-medium text-[var(--color-ink)] whitespace-nowrap">
                  For migrants, students &amp; new arrivals · AU only
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-[2rem]" />

            {/* Bottom band: headline left / search card right */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="lg:max-w-lg xl:max-w-2xl shrink-0">
                <h1 className="font-serif text-white text-[42px] sm:text-[58px] xl:text-[76px] font-medium leading-[1.0] tracking-[-0.02em] drop-shadow-[0_2px_28px_rgba(0,0,0,0.5)] text-balance [overflow-wrap:anywhere]">
                  {t("home.headline1")}
                  <br />
                  <span className="relative inline-block text-white">
                    {t("home.headline2")}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 -bottom-1 h-[10px] w-full"
                      style={{
                        background:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='12' viewBox='0 0 200 12' fill='none'%3E%3Cpath d='M2 8C40 3 80 3 118 6c30 2 56 2 80-2' stroke='%23d99657' stroke-width='3.5' stroke-linecap='round'/%3E%3C/svg%3E\") center/100% 100% no-repeat",
                      }}
                    />
                  </span>
                  .
                </h1>
                <p className="mt-6 text-[15px] sm:text-[17px] text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)] max-w-[520px] leading-[1.55]">
                  {t("home.subtitle")}
                </p>
              </div>

              {/* Search card — Sand & Ocean */}
              <div className="w-full lg:w-[min(480px,45%)] shrink-0">
                <div className="bg-[var(--color-surface-2)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-6 flex flex-col gap-4">
                  <div className="font-serif text-[24px] sm:text-[28px] text-[var(--color-ink)] tracking-[-0.015em] leading-none">
                    Start your search
                  </div>

                  <div className="grid grid-cols-2 bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-line)]">
                    <label className="px-4 py-3 border-r border-[var(--color-line)] block">
                      <div className="eyebrow">City</div>
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-transparent border-none outline-none text-[15px] font-semibold text-[var(--color-ink)] w-full mt-1 p-0"
                      />
                    </label>
                    <div className="px-4 py-3">
                      <div className="eyebrow">Move-in</div>
                      <div className="text-[15px] font-semibold text-[var(--color-ink)] mt-1">Any time</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline">
                      <div className="eyebrow">Weekly budget</div>
                      <div className="font-mono text-[13px] text-[var(--color-ink)] tabular-nums">up to ${budget}/wk</div>
                    </div>
                    <input
                      type="range"
                      min={150}
                      max={1000}
                      step={5}
                      value={budget}
                      onChange={(e) => setBudget(+e.target.value)}
                      aria-label={`Weekly budget: up to $${budget} AUD`}
                      className="premium-range w-full mt-2.5"
                    />
                    <div className="flex justify-between font-mono text-[11px] text-[var(--color-ink-3)] mt-1">
                      <span>$150</span><span>$500</span><span>$1000+</span>
                    </div>
                  </div>

                  <Link
                    href={`/seeker/search?city=${encodeURIComponent(city)}&maxPrice=${budget}`}
                    className="w-full bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[15px] font-semibold h-12 rounded-2xl hover:bg-[var(--color-primary-500)] transition-colors inline-flex items-center justify-center gap-2"
                  >
                    Show {matchCount} matching homes
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <div className="text-[12px] text-[var(--color-ink-3)] text-center -mt-1">
                    Or{" "}
                    <Link href={session ? "/owner/listings/new" : "/for-owners"} className="text-[var(--color-ink)] font-semibold underline underline-offset-[3px]">
                      list a room
                    </Link>
                    {" "}on MigRent
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ SECTION 2 · OWNER MARQUEE ════════ */}
      <section className="py-14 bg-[var(--color-surface)] border-b border-[var(--color-line)]">
        <motion.div {...reveal} className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 mb-7">
          <div className="eyebrow mb-2.5">{t("home.marqueeAccent")}</div>
          <h2 className="font-serif text-[28px] md:text-[40px] tracking-[-0.02em] leading-[1.05] text-[var(--color-ink)]">
            {t("home.marqueeTitle")}
          </h2>
          <p className="mt-2 text-[15px] text-[var(--color-ink-2)] max-w-[560px] leading-[1.55]">
            {t("home.marqueeSubtitle")}
          </p>
        </motion.div>
        <OwnerMarquee />
      </section>

      {/* ════════ SECTION 3 · TRUST STRIP ════════ */}
      <section className="bg-[var(--color-surface)] border-b border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[var(--color-line)]">
          {[
            ["Live", "Now accepting new listings"],
            ["Verified", "Every host ID-checked"],
            ["Escrow", "Bond held independently"],
            ["$0", "Service fee for renters"],
          ].map(([n, l], i) => (
            <motion.div
              key={i}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.06 }}
              className="px-6 md:px-8 py-7"
            >
              <div className="font-serif text-[38px] md:text-[48px] leading-none tracking-[-0.025em] text-[var(--color-ink)]">{n}</div>
              <div className="text-[12.5px] text-[var(--color-ink-3)] mt-2.5 leading-[1.4]">{l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════ SECTION 4 · HOW IT WORKS (sideways scroll) ════════ */}
      <HowItWorks />

      {/* ════════ SECTION 5 · BROWSE ════════ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-16 md:py-20">
          <motion.div {...reveal} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <div className="eyebrow mb-2.5">Browse</div>
              <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">
                Sorted by what fits you.
              </h2>
              <p className="text-[15px] text-[var(--color-ink-2)] mt-3 max-w-[540px] leading-[1.55]">
                Not by what makes us money. Start with a shortcut, or open the full map.
              </p>
            </div>
            <Link href="/seeker/search" className="text-[var(--color-primary)] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
              See all listings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {categories.map((c, i) => (
              <motion.div key={c.label} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.05 }}>
                <Link
                  href={c.href}
                  className="card-lift flex items-center justify-between px-5 py-4 bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-card)] text-[var(--color-ink)] hover:border-[var(--color-primary-200)] transition-colors"
                >
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
                    <div className="shimmer h-3 w-1/3 rounded" />
                    <div className="shimmer h-4 w-3/4 rounded" />
                    <div className="shimmer h-3 w-1/2 rounded" />
                    <div className="h-px bg-[var(--color-line)] my-1" />
                    <div className="flex justify-between">
                      <div className="shimmer h-5 w-20 rounded" />
                      <div className="shimmer h-3 w-16 rounded" />
                    </div>
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

      {/* ════════ SECTION 6 · TRUST DETAIL ════════ */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-18 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
            <motion.div {...reveal}>
              <div className="eyebrow mb-3">Trust, built in</div>
              <h2 className="font-serif text-[38px] md:text-[58px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)]">
                Every host is who they say they are.
              </h2>
              <p className="text-[16px] text-[var(--color-ink-2)] mt-5 leading-[1.6] max-w-[460px]">
                MigRent is the first Australian rental platform with mandatory landlord verification, optional tenant background checks, and built-in bond protection through our partner escrow.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <Link href="/safety-verification" className="btn-primary h-11 px-5 text-sm">
                  How verification works <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/rental-laws" className="btn-secondary h-11 px-5 text-sm">
                  Read tenant rights
                </Link>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trustItems.map((it, i) => (
                <motion.div
                  key={i}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * 0.06 }}
                  className="card-lift p-6 bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-card)]"
                >
                  <div className="w-11 h-11 rounded-[var(--radius-card)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center mb-4"><it.icon className="w-[22px] h-[22px]" /></div>
                  <div className="font-serif text-[20px] text-[var(--color-ink)] tracking-[-0.01em] leading-[1.15]">{it.h}</div>
                  <div className="text-[13.5px] text-[var(--color-ink-2)] mt-2 leading-[1.55]">{it.p}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ SECTION 7 · STORIES ════════ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-18 md:py-24">
          <motion.div {...reveal} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-9">
            <div>
              <div className="eyebrow mb-2.5">From people who found a home</div>
              <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">
                The first week, in their words.
              </h2>
            </div>
            <Link href="/about" className="text-[var(--color-primary)] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
              Read more stories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stories.map((s, i) => (
              <motion.div
                key={i}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.08 }}
                className="card-lift bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-7 flex flex-col gap-4"
              >
                <div className="font-serif text-[23px] leading-[1.35] text-[var(--color-ink)] tracking-[-0.01em] flex-1">
                  &ldquo;{s.quote}&rdquo;
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-line)]">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${s.tone}`}>
                    {s.initial}
                  </span>
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

      {/* ════════ SECTION 8 · CLOSING CTA ════════ */}
      <section className="mood-field-strong border-t border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="max-w-[760px]">
            <div className="inline-flex items-center gap-2 text-[var(--color-primary)] mb-5">
              <Sparkles className="w-5 h-5" />
              <span className="eyebrow">Free to browse · No credit file needed</span>
            </div>
            <h2 className="font-serif text-[40px] md:text-[64px] leading-[0.98] tracking-[-0.03em] text-[var(--color-ink)]">
              {t("home.ctaTitle")}
            </h2>
            <p className="mt-5 text-[17px] text-[var(--color-ink-2)] leading-[1.55] max-w-[560px]">
              {t("home.ctaSubtitle")}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/for-seekers" className="btn-primary h-12 px-7 text-[15px]">
                {t("home.seekerCta")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/for-owners" className="btn-secondary h-12 px-7 text-[15px]">
                {t("home.ownerCta")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
