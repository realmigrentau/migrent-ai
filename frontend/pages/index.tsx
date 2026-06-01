import Link from "next/link";
import Head from "next/head";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  Star,
  Heart,
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

function PriceTag({ price, size = "md" }: { price: number; size?: "sm" | "md" | "lg" }) {
  const sz = { sm: { num: 16, unit: 11 }, md: { num: 20, unit: 12 }, lg: { num: 30, unit: 13 } }[size];
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-bold tracking-[-0.02em] text-[var(--color-ink)] tabular-nums" style={{ fontSize: sz.num }}>
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
    <Link href={`/listing/${listing.id}`} className="card-lift group flex flex-col overflow-hidden bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[14px] hover:border-[var(--color-line-2)] hover:shadow-[var(--shadow-card)] transition-all">
      <div className="relative">
        <div className="photo-placeholder h-[180px] w-full" style={{ borderRadius: 0 }}>
          {suburb} · {listing.property_type || listing.room_type || "Room"}
        </div>
        {listing.verified && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[10.5px] font-semibold">
              <Check className="w-2.5 h-2.5" strokeWidth={2.4} /> Verified host
            </span>
          </div>
        )}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-[var(--color-surface)]/92 backdrop-blur flex items-center justify-center text-[var(--color-ink-2)] hover:text-[var(--color-coral-500)] transition-colors"
          aria-label="Save listing"
        >
          <Heart className="w-[15px] h-[15px]" />
        </button>
      </div>
      <div className="p-3.5 flex flex-col flex-1 gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <div className="eyebrow truncate">{suburb}{postcode}</div>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-2)]">
            <Star className="w-3 h-3 fill-[var(--color-warn-500)] text-[var(--color-warn-500)]" /> <span className="tabular-nums">4.8</span>
          </span>
        </div>
        <div className="font-semibold text-[15px] tracking-[-0.005em] text-[var(--color-ink)] leading-snug line-clamp-2">
          {title}
        </div>
        <div className="flex gap-3 text-[12.5px] text-[var(--color-ink-3)] mt-auto">
          {listing.beds != null && <span className="inline-flex items-center gap-1"><Bed className="w-3 h-3" /> {listing.beds}</span>}
          {listing.bath != null && <span className="inline-flex items-center gap-1"><Bath className="w-3 h-3" /> {listing.bath}</span>}
          {listing.available_from && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(listing.available_from).toLocaleDateString("en-AU", { month: "short", day: "numeric" })}</span>}
        </div>
        <div className="h-px bg-[var(--color-line)] my-1" />
        <div className="flex justify-between items-end">
          <PriceTag price={price} />
          <span className="text-[11.5px] text-[var(--color-ink-3)]">{listing.bills_included ? "Bills inc." : "Long stay"}</span>
        </div>
      </div>
    </Link>
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
    { label: "Under $250/wk", count: "412", href: "/seeker/search?maxPrice=250" },
    { label: "Studio apartments", count: "86", href: "/seeker/search?propertyType=studio" },
    { label: "Share houses", count: "1,240", href: "/seeker/search?roomType=private" },
    { label: "Near universities", count: "318", href: "/seeker/search?nearUni=true" },
    { label: "Pet-friendly", count: "142", href: "/seeker/search?pets=true" },
    { label: "Bills included", count: "540", href: "/seeker/search?billsIncluded=true" },
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
      tone: "bg-[#f4e4cf] text-[var(--color-warn-500)]",
      quote: "I filtered by 'no rental history needed' and there were 412 listings. Not three. Four hundred.",
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

      {/* SECTION 1 - HERO */}
      <section className="bg-grain relative bg-[var(--color-bg)] border-b border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 pt-10 md:pt-14 pb-14 md:pb-20">
          <div className="eyebrow mb-3">For migrants, students &amp; new arrivals · AU only</div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 items-end">
            <div>
              <h1 className="font-serif text-[44px] sm:text-[60px] md:text-[72px] lg:text-[84px] leading-[0.98] tracking-[-0.025em] text-[var(--color-ink)] text-balance">
                {t("home.headline1")},<br />
                <span className="italic text-[var(--color-ink-2)]">{t("home.headline2")}.</span>
              </h1>
              <p className="text-[17px] text-[var(--color-ink-2)] mt-5 max-w-[540px] leading-[1.5]">
                {t("home.subtitle")}
              </p>
            </div>

            {/* Search card */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[20px] p-1.5 shadow-[var(--shadow-pop)]">
              <div className="px-4 py-3.5">
                <div className="eyebrow">Start your search</div>
              </div>
              <div className="grid grid-cols-2 bg-[var(--color-surface-2)] rounded-[14px] overflow-hidden border border-[var(--color-line)]">
                <label className="px-4 py-3 border-r border-[var(--color-line)] block">
                  <div className="text-[11px] text-[var(--color-ink-3)] font-semibold uppercase tracking-[0.04em]">City</div>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent border-none outline-none text-[15px] font-semibold text-[var(--color-ink)] w-full mt-0.5 p-0"
                  />
                </label>
                <div className="px-4 py-3">
                  <div className="text-[11px] text-[var(--color-ink-3)] font-semibold uppercase tracking-[0.04em]">Move-in</div>
                  <div className="text-[15px] font-semibold text-[var(--color-ink)] mt-0.5">Any time</div>
                </div>
              </div>
              <div className="px-4 pt-4 pb-1">
                <div className="flex justify-between items-baseline">
                  <div className="text-[11px] text-[var(--color-ink-3)] font-semibold uppercase tracking-[0.04em]">Weekly budget</div>
                  <div className="font-mono text-[13px] text-[var(--color-ink)]">up to ${budget}/wk</div>
                </div>
                <input
                  type="range"
                  min={150}
                  max={1000}
                  step={5}
                  value={budget}
                  onChange={(e) => setBudget(+e.target.value)}
                  aria-label={`Weekly budget: up to $${budget} AUD`}
                  className="premium-range w-full mt-2 accent-[var(--color-primary)]"
                />
                <div className="flex justify-between text-[11px] text-[var(--color-ink-3)] mt-0.5">
                  <span>$150</span><span>$500</span><span>$1000+</span>
                </div>
              </div>
              <div className="px-4 py-4">
                <Link
                  href={`/seeker/search?city=${encodeURIComponent(city)}&maxPrice=${budget}`}
                  className="btn-primary w-full h-12 text-[15px]"
                >
                  Show {matchCount} matching homes
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="text-[11.5px] text-[var(--color-ink-3)] mt-2.5 text-center">
                  Or{" "}
                  <Link href={session ? "/owner/listings/new" : "/for-owners"} className="text-[var(--color-ink-2)] underline underline-offset-[3px]">
                    list a room
                  </Link>
                  {" "}on MigRent
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1B - OWNER MARQUEE */}
      <section className="py-12 bg-[var(--color-surface)] border-b border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 mb-6">
          <div className="eyebrow mb-2">{t("home.marqueeAccent")}</div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-[-0.02em] text-[var(--color-ink)]">
            {t("home.marqueeTitle")}
          </h2>
          <p className="mt-1 text-[14px] text-[var(--color-ink-2)] max-w-[540px]">
            {t("home.marqueeSubtitle")}
          </p>
        </div>
        <OwnerMarquee />
      </section>

      {/* SECTION 2 - STATS STRIP */}
      <section className="bg-[var(--color-surface)] border-b border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[var(--color-line)]">
          {[
            ["Live", "Now accepting new listings"],
            ["Verified", "Every host ID-checked"],
            ["Bond protected", "Held in independent escrow"],
            ["$0", "Service fee for renters"],
          ].map(([n, l], i) => (
            <div key={i} className="px-6 md:px-8 py-6">
              <div className="font-serif text-[36px] md:text-[44px] leading-none tracking-[-0.02em] text-[var(--color-ink)] tabular-nums">{n}</div>
              <div className="text-[12.5px] text-[var(--color-ink-3)] mt-2">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 - BROWSE */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-7">
            <div>
              <div className="eyebrow mb-1.5">Browse</div>
              <h2 className="font-serif text-[32px] md:text-[44px] tracking-[-0.02em] leading-[1.05] text-[var(--color-ink)]">
                {t("home.whyTitle")} <span className="italic text-[var(--color-ink-2)]">{t("home.whyAccent")}</span>
              </h2>
              <p className="text-[15px] text-[var(--color-ink-2)] mt-2 max-w-[540px]">
                Sorted by what fits, not by what makes us money.
              </p>
            </div>
            <Link href="/seeker/search" className="text-[var(--color-ink)] font-semibold text-sm inline-flex items-center gap-1.5 hover:underline underline-offset-[3px]">
              See all listings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
            {categories.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="card-lift flex items-center justify-between px-4 py-3.5 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[10px] text-[var(--color-ink)] hover:border-[var(--color-line-2)] transition-colors"
              >
                <span className="text-sm font-semibold">{c.label}</span>
                <span className="font-mono text-xs text-[var(--color-ink-3)]">{c.count} →</span>
              </Link>
            ))}
          </div>

          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="overflow-hidden bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[14px]">
                  <div className="shimmer h-[180px] w-full" />
                  <div className="p-3.5 space-y-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((l) => (
                <HomeListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* SECTION 4 - TRUST */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14">
            <div>
              <div className="eyebrow mb-2.5">Trust, built in</div>
              <h2 className="font-serif text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.025em] text-[var(--color-ink)]">
                Every host is who they say they are.
              </h2>
              <p className="text-[15px] text-[var(--color-ink-2)] mt-4 leading-[1.55] max-w-[460px]">
                MigRent is the first Australian rental platform with mandatory landlord verification, optional tenant background checks, and built-in bond protection through our partner escrow.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                <Link href="/safety-verification" className="btn-primary h-11 px-5 text-sm">
                  How verification works <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/rental-laws" className="btn-secondary h-11 px-5 text-sm">
                  Read tenant rights
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trustItems.map((it, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="p-5 bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[14px]"
                >
                  <div className="text-[var(--color-accent)] mb-3"><it.icon className="w-[22px] h-[22px]" /></div>
                  <div className="text-[15px] font-semibold text-[var(--color-ink)] tracking-[-0.005em]">{it.h}</div>
                  <div className="text-[13px] text-[var(--color-ink-2)] mt-1 leading-[1.5]">{it.p}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - STORIES */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-7">
            <div>
              <div className="eyebrow mb-1.5">From people who found a home</div>
              <h2 className="font-serif text-[32px] md:text-[44px] tracking-[-0.02em] leading-[1.05] text-[var(--color-ink)]">
                The first week, in their words.
              </h2>
            </div>
            <Link href="/about" className="text-[var(--color-ink)] font-semibold text-sm inline-flex items-center gap-1.5 hover:underline underline-offset-[3px]">
              Read more stories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stories.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[14px] p-6 flex flex-col gap-3.5"
              >
                <div className="font-serif text-[22px] leading-[1.35] text-[var(--color-ink)] tracking-[-0.005em] flex-1">
                  &ldquo;{s.quote}&rdquo;
                </div>
                <div className="flex items-center gap-2.5 pt-3 border-t border-[var(--color-line)]">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${s.tone}`}>
                    {s.initial}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-[var(--color-ink)]">{s.name}</div>
                    <div className="font-mono text-[10.5px] text-[var(--color-ink-3)]">{s.from}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
