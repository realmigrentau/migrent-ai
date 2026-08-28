import Link from "next/link";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import {
  ShieldCheck,
  Check,
  ArrowRight,
  Calendar,
  Bed,
  Bath,
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
  UsersRound,
  FileCheck2,
  GraduationCap,
  Luggage,
  type LucideIcon,
} from "lucide-react";
import { searchListings } from "../lib/api";
import PageSubnav from "../components/ui/PageSubnav";

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

// Suggestions for the hero search field. The eight capitals the backend's
// derive_city() maps postcodes to, plus the suburbs that actually have guide
// pages, so a suggestion always leads somewhere with content behind it.
const HERO_PLACES = [
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Hobart", "Darwin",
  "Bondi", "Surry Hills", "Newtown", "Parramatta", "Chatswood", "Hurstville",
  "Strathfield", "Bankstown", "Liverpool", "Blacktown", "Penrith", "Manly",
  "Randwick", "Redfern", "Marrickville", "Burwood", "Homebush", "Ashfield",
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0.7, 0.3, 1] as const },
};

/* ─────────────────────────────────────────────
   PriceTag + listing card
   ───────────────────────────────────────────── */
function PriceTag({ price }: { price: number }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-mono font-bold tracking-[-0.02em] text-[var(--color-ink)] tabular-nums text-[20px]">${price}</span>
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
        <div className="photo-placeholder h-[190px] w-full" style={{ borderRadius: 0 }}>{suburb} · {listing.property_type || listing.room_type || "Room"}</div>
        {listing.verified && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 h-[20px] px-2 rounded-full bg-[var(--color-surface-2)]/95 backdrop-blur text-[var(--color-accent)] text-[10.5px] font-semibold shadow-[var(--shadow-soft)]">
              <Check className="w-2.5 h-2.5" strokeWidth={2.6} /> Verified host
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="eyebrow truncate">{suburb}{postcode}</div>
        <div className="font-serif text-[19px] tracking-[-0.01em] text-[var(--color-ink)] leading-[1.2] line-clamp-2">{title}</div>
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

/* ─────────────────────────────────────────────
   Pinned horizontal scroller (reusable)
   Panels slide sideways as you scroll DOWN. The first panel is fully
   in view at the start (x: 0%); a progress rail shows all N steps and
   which one you are on; each panel is a full two-column scene so there
   is no empty space. Mobile / reduced-motion -> swipeable snap row.
   ───────────────────────────────────────────── */
type PanelItem = { n: string; icon: LucideIcon; title: string; body: string; extra?: string[] };

const HOW_ITEMS: PanelItem[] = [
  { n: "01", icon: Search, title: "Search", body: "Filter by budget, suburb, and what matters, then find a room that fits how you actually live.", extra: ["No history needed", "Pet-friendly", "Bills included", "Near transport"] },
  { n: "02", icon: ShieldCheck, title: "Verify", body: "Every host is ID-checked with proof of property before a single room goes live, so you always know who you are dealing with.", extra: ["Government ID", "Proof of property", "Ongoing checks"] },
  { n: "03", icon: Lock, title: "Book", body: "Agree the room, the rent and the move-in date in writing, then lodge your bond with your state's bond authority. We show you exactly how.", extra: ["Written agreement", "Bond lodged correctly", "Receipt you keep"] },
  { n: "04", icon: KeyRound, title: "Settle", body: "Move in with real support behind you - clear dispute guidance and mentors who have made the same move.", extra: ["Dispute guidance", "Mentor support", "Real humans"] },
];

const WHO_ITEMS: PanelItem[] = [
  { n: "01", icon: Compass, title: "New migrants", body: "Just landed, no local rental history yet, and looking for somewhere safe to start your life here." },
  { n: "02", icon: GraduationCap, title: "Students", body: "Near campus, on a student budget, often booking a room before you have even arrived in the country." },
  { n: "03", icon: Luggage, title: "Working holiday", body: "Flexible stays across new cities, with hosts who understand that your plans keep moving." },
  { n: "04", icon: UsersRound, title: "New families", body: "A little more space, the right suburb for school and work, and a lease you can actually understand." },
];

function StepsGrid({ items }: { items: PanelItem[] }) {
  return (
    <section className="mood-field border-y border-[var(--color-line)]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
        <motion.div {...reveal} className="mb-12">
          <div className="eyebrow mb-3">How it works</div>
          <h2 className="font-serif text-[34px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)] max-w-[16ch]">Four steps to a room you can trust.</h2>
          <p className="mt-4 text-[16px] md:text-[17px] text-[var(--color-ink-2)] leading-[1.6] max-w-[56ch]">No paper applications and no rental ledger you don't have yet - just a clear path from searching to settled.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.article
                key={it.n}
                {...reveal}
                transition={{ ...reveal.transition, delay: (i % 2) * 0.08 }}
                className="card-lift relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface-2)] shadow-[var(--shadow-card)] p-8 md:p-10"
              >
                <span className="absolute -right-4 -bottom-8 font-serif leading-none text-[var(--color-primary)] opacity-[0.06] select-none pointer-events-none" style={{ fontSize: "12rem" }}>{it.n}</span>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center"><Icon className="w-6 h-6" strokeWidth={1.7} /></div>
                    <div className="font-mono text-[var(--color-primary)] text-[12px] tracking-[0.2em]">{it.n} · STEP</div>
                  </div>
                  <h3 className="font-serif text-[30px] md:text-[38px] tracking-[-0.02em] text-[var(--color-ink)] leading-[1.0]">{it.title}</h3>
                  <p className="mt-3 text-[16px] text-[var(--color-ink-2)] leading-[1.55] max-w-[46ch]">{it.body}</p>
                  {it.extra && (
                    <div className="mt-6 pt-5 border-t border-[var(--color-line)] flex flex-wrap gap-2">
                      {it.extra.map((e) => (
                        <span key={e} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-ink-2)] bg-[var(--color-surface)] border border-[var(--color-line)] rounded-full px-3 py-1.5">
                          <Check className="w-3 h-3 text-[var(--color-accent)]" strokeWidth={2.8} /> {e}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Scroll-drift marquee - a DIFFERENT Lenis-style effect. A big serif
   ribbon of value-props that slides as the page scrolls past it.
   ───────────────────────────────────────────── */
function ScrollMarquee({ words }: { words: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["8%", "-32%"]);
  const row = [...words, ...words];
  return (
    <section ref={ref} className="bg-[var(--color-bg)] border-y border-[var(--color-line)] py-14 md:py-20 overflow-hidden">
      <motion.div style={{ x }} className="flex items-center gap-8 whitespace-nowrap w-max">
        {row.map((w, i) => (
          <span key={i} className="inline-flex items-center gap-8 font-serif text-[clamp(2rem,5vw,4rem)] tracking-[-0.02em] text-[var(--color-ink)]">
            {w}
            <span className="text-[var(--color-accent)] text-[0.6em]" aria-hidden="true">✦</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Parallax gallery - two rows of suburb tiles drifting in OPPOSITE
   directions as you scroll (a signature Lenis-demo move). Reliable:
   just scroll-linked translateX, no pinning.
   ───────────────────────────────────────────── */
const GALLERY: { s: string; c: string; slug?: string }[] = [
  { s: "Marrickville", c: "Sydney", slug: "marrickville" }, { s: "Carlton", c: "Melbourne", slug: "carlton" }, { s: "West End", c: "Brisbane", slug: "west-end" },
  { s: "Newtown", c: "Sydney", slug: "newtown" }, { s: "Brunswick", c: "Melbourne", slug: "brunswick" }, { s: "South Bank", c: "Brisbane" },
  { s: "Footscray", c: "Melbourne", slug: "footscray" }, { s: "Surry Hills", c: "Sydney" }, { s: "Fitzroy", c: "Melbourne" },
  { s: "Glebe", c: "Sydney" }, { s: "St Kilda", c: "Melbourne" }, { s: "Paddington", c: "Brisbane" },
];

function GalleryTile({ s, c, slug }: { s: string; c: string; slug?: string }) {
  const face = (
    <div className="photo-placeholder h-[200px] rounded-[var(--radius-xl)] relative overflow-hidden border border-[var(--color-line)]">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <div className="font-serif text-[22px] text-white leading-none tracking-[-0.01em]">{s}</div>
        <div className="font-mono text-[11px] text-white/80 mt-1.5 tracking-[0.08em]">
          {c.toUpperCase()}
          {slug && <span className="text-white/90"> · GUIDE →</span>}
        </div>
      </div>
    </div>
  );
  return (
    <div className="shrink-0 w-[260px] sm:w-[300px]">
      {slug ? <Link href={`/suburb/${slug}`} className="block card-lift">{face}</Link> : face}
    </div>
  );
}

function ParallaxGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const xA = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-14%", "2%"]);
  const xB = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["2%", "-14%"]);
  const rowA = GALLERY.slice(0, 6);
  const rowB = GALLERY.slice(6);
  return (
    <section ref={ref} className="bg-[var(--color-bg)] py-20 md:py-28 overflow-hidden border-y border-[var(--color-line)]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 mb-10">
        <div className="eyebrow mb-3">A glimpse of home</div>
        <h2 className="font-serif text-[34px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)] max-w-[18ch]">Real rooms, in real neighbourhoods.</h2>
      </div>
      <motion.div style={{ x: xA }} className="flex gap-5 mb-5 w-max will-change-transform">
        {[...rowA, ...rowA].map((t, i) => <GalleryTile key={`a${i}`} s={t.s} c={t.c} slug={t.slug} />)}
      </motion.div>
      <motion.div style={{ x: xB }} className="flex gap-5 w-max will-change-transform">
        {[...rowB, ...rowB].map((t, i) => <GalleryTile key={`b${i}`} s={t.s} c={t.c} slug={t.slug} />)}
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Stacking cards - a DIFFERENT scroll effect. Cards pin one after
   another and stack on top of each other as you scroll (Apple/Lenis
   style). Pure CSS sticky, so it just works once overflow-x is clip.
   ───────────────────────────────────────────── */
function StackingCards({ eyebrow, heading, items }: { eyebrow: string; heading: string; items: PanelItem[] }) {
  return (
    <section className="bg-[var(--color-bg)] border-y border-[var(--color-line)]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
        <motion.div {...reveal} className="mb-12">
          <div className="eyebrow mb-3">{eyebrow}</div>
          <h2 className="font-serif text-[34px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)] max-w-[18ch]">{heading}</h2>
        </motion.div>
        <div className="space-y-5">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <div key={it.n} className="sticky" style={{ top: `${100 + i * 22}px` }}>
                <div className="bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 md:p-12 grid md:grid-cols-[150px_1fr] gap-6 md:gap-10 items-center overflow-hidden">
                  <div className="font-serif text-[68px] md:text-[104px] leading-none text-[var(--color-primary)] tracking-[-0.04em]">{it.n}</div>
                  <div>
                    <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center mb-4"><Icon className="w-6 h-6" strokeWidth={1.7} /></div>
                    <h3 className="font-serif text-[28px] md:text-[38px] tracking-[-0.02em] text-[var(--color-ink)] leading-[1.05]">{it.title}</h3>
                    <p className="mt-3 text-[16px] md:text-[17px] text-[var(--color-ink-2)] leading-[1.55] max-w-[52ch]">{it.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   EFFECT 4 · Scroll word-fill statement
   Each word brightens from muted to ink as the section passes through.
   ───────────────────────────────────────────── */
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  return (
    <motion.span style={{ opacity }} className="transition-none">
      {children}{" "}
    </motion.span>
  );
}

function ScrollStatement({ text, eyebrow }: { text: string; eyebrow: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  return (
    <section ref={ref} className="bg-[var(--color-bg)]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 lg:px-14 py-24 md:py-32">
        <div className="eyebrow mb-6">{eyebrow}</div>
        <p className="font-serif text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[1.25] tracking-[-0.02em] text-[var(--color-ink)]">
          {words.map((w, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return <Word key={i} progress={scrollYProgress} range={[start, end]}>{w}</Word>;
          })}
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   Curtain reveal - lines slide up from behind a mask as you scroll
   (an Awwwards / Lenis-style text reveal, distinct from the word-fill).
   ───────────────────────────────────────────── */
function CurtainLine({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const y = useTransform(progress, range, ["115%", "0%"]);
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span style={{ y, opacity }} className="block">{children}</motion.span>
    </span>
  );
}

function VerifiedCurtain() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const lines = ["Every owner, checked.", "Government ID, proof of property.", "Verified before a room goes live."];
  const points = [
    { icon: BadgeCheck, t: "Identity verified" },
    { icon: FileCheck2, t: "Property confirmed" },
    { icon: ShieldCheck, t: "Ongoing monitoring" },
  ];
  return (
    <section ref={ref} className="bg-[var(--color-surface)] border-y border-[var(--color-line)]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 lg:px-14 py-24 md:py-32">
        <div className="eyebrow mb-6">Verified owners</div>
        <div className="font-serif text-[clamp(2rem,5.4vw,4.2rem)] leading-[1.06] tracking-[-0.03em] text-[var(--color-ink)]">
          {lines.map((l, i) => {
            const start = i / lines.length;
            const end = start + 1 / lines.length;
            return <CurtainLine key={i} progress={scrollYProgress} range={[start, end]}>{l}</CurtainLine>;
          })}
        </div>
        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4">
          {points.map((p) => (
            <span key={p.t} className="inline-flex items-center gap-2.5 text-[15px] font-medium text-[var(--color-ink-2)]">
              <span className="w-9 h-9 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center"><p.icon className="w-[18px] h-[18px]" strokeWidth={1.9} /></span>
              {p.t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [budget, setBudget] = useState(350);
  const [city, setCity] = useState("Sydney");
  const [moveIn, setMoveIn] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const reduced = useReducedMotion();

  // EFFECT 1 · hero video parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoY = useTransform(heroP, [0, 1], [0, reduced ? 0 : -64]);

  // EFFECT 5 · cities parallax
  const citiesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: citiesP } = useScroll({ target: citiesRef, offset: ["start end", "end start"] });
  const citiesY = useTransform(citiesP, [0, 1], [reduced ? 0 : 48, reduced ? 0 : -48]);

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

  const heroChips = [
    { icon: BadgeCheck, label: "ID-verified hosts" },
    { icon: Lock, label: "Bond lodged properly" },
    { icon: Wallet, label: "$0 renter fees" },
  ];

  const trustBar = [
    { icon: ShieldCheck, label: "Verified hosts" },
    { icon: Lock, label: "Bond protected" },
    { icon: FileCheck2, label: "No history needed" },
    { icon: MessagesSquare, label: "Real support" },
  ];

  // EFFECT 3 · "Everything you get" - the full offering, one line each
  const offerings = [
    { icon: BadgeCheck, title: "Verified hosts", body: "Government ID and proof of property, checked before listing." },
    { icon: Lock, title: "Bond guidance", body: "We walk you through lodging your bond with your state authority, so it is never sitting in a landlord's account." },
    { icon: FileCheck2, title: "No rental history", body: "Filter for owners who welcome first-time renters." },
    { icon: Wallet, title: "Secure payments", body: "Processed through Stripe. $0 platform fee for renters." },
    { icon: HeartHandshake, title: "Mentors", body: "Guidance from people who have made the same move." },
    { icon: MessagesSquare, title: "Human support", body: "A real team and clear dispute guidance when you need it." },
  ];

  const categories = [
    { label: "Under $250/wk", href: "/seeker/search?maxPrice=250" },
    { label: "Studio apartments", href: "/seeker/search?propertyType=studio" },
    { label: "Share houses", href: "/seeker/search?roomType=private" },
    { label: "Near universities", href: "/seeker/search?nearUni=true" },
    { label: "Pet-friendly", href: "/seeker/search?pets=true" },
    { label: "Bills included", href: "/seeker/search?billsIncluded=true" },
  ];

  const cities = [
    { city: "Sydney", note: "Surry Hills to Parramatta" },
    { city: "Melbourne", note: "Carlton to Footscray" },
    { city: "Brisbane", note: "West End to South Bank" },
    { city: "More soon", note: "Perth & Adelaide next" },
  ];


  const faqs = [
    { q: "Do I need an Australian rental history?", a: "No. Many hosts welcome first-time renters with no local ledger or credit file - filter for them." },
    { q: "How is my bond protected?", a: "By being lodged with your state's bond authority rather than held by your host. We show you how to do it and what receipt to ask for. MigRent never holds your money." },
    { q: "What does it cost renters?", a: "Browsing and applying is free, with $0 platform service fees." },
    { q: "How are hosts verified?", a: "Government ID plus proof they control the property, before any room goes live." },
  ];

  return (
    <>
      <Head>
        <title>MigRent - A real home in Australia, found the right way.</title>
        <meta name="description" content="Verified rooms across Australia for migrants, students, and new arrivals. Every host ID-checked. No rental history needed, no renter fees." />
        <meta property="og:title" content="MigRent - A real home in Australia" />
        <meta property="og:description" content="Verified rooms across Australia for migrants, students, and new arrivals." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <PageSubnav
        title="MigRent"
        links={[
          { label: "How it works", href: "#how" },
          { label: "Browse", href: "#browse" },
          { label: "Mentors", href: "#mentors" },
          { label: "FAQ", href: "#faq" },
        ]}
        cta={{ label: "Start searching", href: "/seeker/search" }}
        threshold={700}
      />

      {/* 1 · HERO (parallax video) */}
      <section ref={heroRef} className="mood-field border-b border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-12 md:py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="eyebrow mb-5">Verified rentals · Australia</div>
              <h1 className="font-serif text-[44px] sm:text-[58px] xl:text-[68px] font-medium leading-[0.98] tracking-[-0.025em] text-[var(--color-ink)] [overflow-wrap:anywhere]">
                A real home in Australia,
                <br />
                <span className="text-[var(--color-primary)]">found the right way.</span>
              </h1>
              <p className="mt-6 text-[17px] sm:text-[18px] text-[var(--color-ink-2)] max-w-[44ch] leading-[1.55]">
                Verified rooms for migrants, students, and new arrivals. No rental history needed.
              </p>

              <div className="mt-8 bg-[var(--color-surface-2)] rounded-[var(--radius-xl)] border border-[var(--color-line)] shadow-[var(--shadow-card)] p-4 sm:p-5 max-w-[520px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 bg-[var(--color-surface)] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-line)]">
                  <label className="px-4 py-3 border-b sm:border-b-0 sm:border-r border-[var(--color-line)] block">
                    <span className="eyebrow">City or suburb</span>
                    {/* Was a bare text input: a typo produced zero results with
                        no suggestion and no recovery. A native datalist gives
                        real suggestions without shipping a combobox. */}
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      list="hero-places"
                      autoComplete="off"
                      placeholder="Sydney"
                      className="bg-transparent border-none outline-none text-[15px] font-semibold text-[var(--color-ink)] w-full mt-1 p-0 placeholder:text-[var(--color-ink-4)] placeholder:font-normal"
                      aria-label="City or suburb"
                    />
                    <datalist id="hero-places">
                      {HERO_PLACES.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </label>
                  <label className="px-4 py-3 block">
                    <span className="eyebrow">Move-in from</span>
                    {/* This was a static div reading "Any time", styled to look
                        like the field beside it. It sat in the primary search
                        widget and did nothing at all. */}
                    <input
                      type="date"
                      value={moveIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setMoveIn(e.target.value)}
                      className="bg-transparent border-none outline-none text-[15px] font-semibold text-[var(--color-ink)] w-full mt-1 p-0"
                      aria-label="Earliest move-in date"
                    />
                  </label>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-baseline">
                    <div className="eyebrow">Weekly budget</div>
                    <div className="font-mono text-[13px] text-[var(--color-ink)] tabular-nums">up to ${budget}/wk</div>
                  </div>
                  <input type="range" min={150} max={1000} step={5} value={budget} onChange={(e) => setBudget(+e.target.value)} aria-label={`Weekly budget: up to $${budget} AUD`} className="premium-range w-full mt-2.5" />
                </div>
                <Link href={`/seeker/search?${new URLSearchParams({ city: city.trim(), maxPrice: String(budget), ...(moveIn ? { availableFrom: moveIn } : {}) }).toString()}`} style={{ color: "var(--color-primary-fg)" }} className="mt-4 w-full bg-[var(--color-primary)] text-[color:var(--color-primary-fg)] text-[15px] font-semibold h-12 rounded-[var(--radius-card)] hover:bg-[var(--color-primary-500)] transition-colors inline-flex items-center justify-center gap-2">
                  Search rooms up to ${budget}/wk <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
                {heroChips.map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--color-ink-2)]">
                    <c.icon className="w-4 h-4 text-[var(--color-accent)]" /> {c.label}
                  </span>
                ))}
              </div>
            </div>

            <motion.div style={{ y: videoY }} className="relative">
              <div className="relative overflow-hidden rounded-[24px] border border-[var(--color-line)] shadow-[var(--shadow-pop)] aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] bg-[var(--color-ink)]">
                {/* Hand-built Sand & Ocean mood-field (replaces the old AI-generated
                    hero video): layered token-coloured washes + faint grain. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(120% 90% at 78% 8%, color-mix(in oklab, var(--color-primary-400) 82%, transparent), transparent 62%),
                      radial-gradient(105% 80% at 8% 94%, color-mix(in oklab, var(--color-accent) 62%, transparent), transparent 60%),
                      radial-gradient(95% 60% at 58% 84%, color-mix(in oklab, var(--color-warn-500) 42%, transparent), transparent 62%),
                      linear-gradient(168deg, color-mix(in oklab, var(--color-primary) 52%, var(--color-ink)) 0%, var(--color-ink) 80%)`,
                  }}
                />
                <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.08] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
                  <filter id="hero-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /></filter>
                  <rect width="100%" height="100%" filter="url(#hero-grain)" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0f]/45 via-transparent to-transparent" aria-hidden="true" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2.5 bg-[var(--color-surface-2)]/92 backdrop-blur-md rounded-[var(--radius-card)] px-3.5 py-2.5 shadow-[var(--shadow-card)]">
                  <span className="w-8 h-8 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0"><BadgeCheck className="w-4 h-4" /></span>
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

      {/* 2 · TRUST BAR (tiny) */}
      <section className="bg-[var(--color-surface)] border-b border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {trustBar.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-ink-2)]">
              <t.icon className="w-4 h-4 text-[var(--color-accent)]" strokeWidth={2} /> {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* 3 · HOW IT WORKS (steps grid) */}
      <div id="how" className="scroll-mt-[76px]"><StepsGrid items={HOW_ITEMS} /></div>

      {/* 3b · VALUE MARQUEE (scroll-drift) */}
      <ScrollMarquee words={["Verified hosts", "Bond protected", "No rental history", "Mentors included", "Secure payments", "$0 renter fees"]} />

      {/* 4 · EVERYTHING YOU GET (sticky-scroll) */}
      <section className="bg-[var(--color-bg)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="eyebrow mb-3">Everything you get</div>
              <h2 className="font-serif text-[34px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)]">One platform, built for arriving.</h2>
              <p className="mt-5 text-[16px] text-[var(--color-ink-2)] leading-[1.6] max-w-[42ch]">Every part of renting somewhere new, made safe and simple.</p>
              <Link href="/for-seekers" className="btn-primary h-11 px-5 text-sm mt-7">See how it works <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {offerings.map((o, i) => (
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

      {/* 5 · BROWSE */}
      <section id="browse" className="bg-[var(--color-surface)] border-y border-[var(--color-line)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <div className="eyebrow mb-2.5">Browse</div>
              <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">Rooms that fit you.</h2>
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
                  <div className="p-4 space-y-2.5"><div className="shimmer h-3 w-1/3 rounded" /><div className="shimmer h-4 w-3/4 rounded" /><div className="shimmer h-3 w-1/2 rounded" /></div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((l, i) => (
                <motion.div key={l.id} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.06 }}><HomeListingCard listing={l} /></motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* 5b · WHY MIGRENT (comparison) */}
      <section className="bg-[var(--color-bg)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="mb-10">
            <div className="eyebrow mb-2.5">Why MigRent</div>
            <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">A fairer way to find a home.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            <motion.div {...reveal} className="rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
              <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-ink-3)] mb-5">The usual way</div>
              <ul className="space-y-4">
                {["Months of payslips and a local rental ledger", "Bond paid straight into a landlord's account", "Unverified listings, and scams to watch for", "Figuring out a new country on your own"].map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] text-[var(--color-ink-2)] leading-[1.5]"><span className="text-[var(--color-ink-4)] mt-0.5">✕</span> {t}</li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="ocean-card rounded-[var(--radius-xl)] border border-[var(--color-line)] shadow-[var(--shadow-card)] p-8">
              <div className="eyebrow mb-5">The MigRent way</div>
              <ul className="space-y-4">
                {["No rental history or credit file needed", "Clear guidance on lodging your bond safely", "Every host ID-verified before listing", "A mentor who has made the same move"].map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] text-[var(--color-ink)] leading-[1.5] font-medium"><Check className="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0" strokeWidth={2.4} /> {t}</li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6 · WORD-FILL STATEMENT */}
      <ScrollStatement
        eyebrow="What we believe"
        text="Your visa is enough. Your story is enough. A credit score you haven't built yet should never decide where you get to call home."
      />

      {/* 7 · WHERE YOU CAN LIVE (parallax tiles) */}
      <section ref={citiesRef} className="mood-field-strong border-y border-[var(--color-line)] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="mb-9">
            <div className="eyebrow mb-2.5">Where you can live</div>
            <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">Australia's biggest welcome mats.</h2>
          </motion.div>
          <motion.div style={{ y: citiesY }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cities.map((c, i) => (
              <motion.div key={c.city} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }}>
                <Link href="/suburbs" className="block bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-6 card-lift hover:border-[var(--color-line-2)] transition-colors">
                  <MapPin className="w-5 h-5 text-[var(--color-primary)] mb-4" />
                  <div className="font-serif text-[24px] tracking-[-0.015em] text-[var(--color-ink)] leading-none">{c.city}</div>
                  <div className="text-[13px] text-[var(--color-ink-3)] mt-2 leading-[1.4]">{c.note}</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 8 · MENTORS */}
      <section id="mentors" className="bg-[var(--color-bg)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div {...reveal}>
              <div className="eyebrow mb-3">You're not alone</div>
              <h2 className="font-serif text-[34px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-[var(--color-ink)]">Settle in with a mentor.</h2>
              <p className="mt-5 text-[16px] text-[var(--color-ink-2)] leading-[1.6] max-w-[44ch]">People who made the same move help you read a lease, pick a suburb, and find your feet.</p>
              <div className="flex flex-wrap gap-3 mt-7">
                <Link href="/mentors" className="btn-primary h-11 px-5 text-sm">Meet our mentors <ArrowRight className="w-3.5 h-3.5" /></Link>
                <Link href="/become-mentor" className="btn-secondary h-11 px-5 text-sm">Become a mentor</Link>
              </div>
            </motion.div>
            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-8">
              <UsersRound className="w-9 h-9 text-[var(--color-accent)]" strokeWidth={1.6} />
              <div className="mt-5 space-y-4">
                {["Reads a lease with you before you sign", "Knows which suburbs fit your budget", "Answers the questions you didn't know to ask"].map((t) => (
                  <div key={t} className="flex gap-3 text-[15px] text-[var(--color-ink-2)] leading-[1.5] pb-4 border-b border-[var(--color-line)] last:border-0 last:pb-0">
                    <Check className="w-4 h-4 text-[var(--color-accent)] mt-1 shrink-0" strokeWidth={2.4} /> {t}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9b · WHO IT'S FOR (stacking cards - different effect) */}
      <StackingCards eyebrow="Who it's for" heading="Built for everyone arriving in Australia." items={WHO_ITEMS} />

      {/* 10 · TWO PATHS */}
      <section className="bg-[var(--color-bg)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="mb-9">
            <div className="eyebrow mb-2.5">For both sides</div>
            <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">Moving in, or opening a door.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: Compass, tag: "For seekers", title: "Find a room you can trust", cta: "I'm a Seeker", href: "/for-seekers" },
              { icon: KeyRound, tag: "For owners", title: "Fill your room with the right tenant", cta: "I'm an Owner", href: "/for-owners" },
            ].map((p, i) => (
              <motion.div key={p.tag} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="card-lift bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-8 flex flex-col">
                <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center mb-6"><p.icon className="w-6 h-6" strokeWidth={1.75} /></div>
                <div className="eyebrow mb-2">{p.tag}</div>
                <h3 className="font-serif text-[26px] tracking-[-0.015em] text-[var(--color-ink)] leading-[1.1] flex-1">{p.title}</h3>
                <Link href={p.href} className="btn-primary h-11 px-5 text-sm mt-7 self-start">{p.cta} <ArrowRight className="w-3.5 h-3.5" /></Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10b · GUIDES & RESOURCES */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-9">
            <div>
              <div className="eyebrow mb-2.5">Guides &amp; resources</div>
              <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">Everything you need to land well.</h2>
            </div>
            <Link href="/guides" className="text-[var(--color-primary)] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all shrink-0">All guides <ArrowRight className="w-3.5 h-3.5" /></Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileCheck2, t: "Your first week", d: "A checklist for the days right after you land." },
              { icon: KeyRound, t: "Understanding your lease", d: "What to read before you sign anything." },
              { icon: MapPin, t: "Choosing a suburb", d: "Match budget, commute, and community." },
              { icon: ShieldCheck, t: "Tenant rights", d: "What you're entitled to as a renter in Australia." },
            ].map((g, i) => (
              <motion.div key={g.t} {...reveal} transition={{ ...reveal.transition, delay: (i % 4) * 0.05 }}>
                <Link href="/guides" className="card-lift block h-full bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--color-primary-200)] transition-colors">
                  <div className="w-11 h-11 rounded-[var(--radius-card)] bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center mb-4"><g.icon className="w-5 h-5" strokeWidth={1.8} /></div>
                  <h3 className="font-serif text-[20px] tracking-[-0.01em] text-[var(--color-ink)] leading-[1.15]">{g.t}</h3>
                  <p className="text-[13.5px] text-[var(--color-ink-2)] mt-1.5 leading-[1.5]">{g.d}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 11 · FAQ */}
      <section id="faq" className="bg-[var(--color-surface)] border-y border-[var(--color-line)] scroll-mt-[76px]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
            <motion.div {...reveal}>
              <div className="eyebrow mb-2.5">Good to know</div>
              <h2 className="font-serif text-[34px] md:text-[48px] tracking-[-0.025em] leading-[1.02] text-[var(--color-ink)]">Questions, answered.</h2>
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

      {/* 12 · VERIFIED OWNERS (curtain reveal) */}
      <VerifiedCurtain />

      {/* 12b · PARALLAX GALLERY (opposite-drift rows) */}
      <ParallaxGallery />

      {/* 13 · CTA */}
      <section className="mood-field-strong border-t border-[var(--color-line)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-20 md:py-28">
          <motion.div {...reveal} className="max-w-[760px]">
            <div className="inline-flex items-center gap-2 text-[var(--color-primary)] mb-5">
              <Sparkles className="w-5 h-5" />
              <span className="eyebrow">Free to browse · No credit file needed</span>
            </div>
            <h2 className="font-serif text-[40px] md:text-[64px] leading-[0.98] tracking-[-0.03em] text-[var(--color-ink)]">Ready to find your room?</h2>
            <p className="mt-5 text-[17px] text-[var(--color-ink-2)] leading-[1.55] max-w-[560px]">Join migrants, students, and professionals who found a home they can trust.</p>
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
