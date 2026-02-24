import Link from "next/link";
import Head from "next/head";
import { motion, type Variants } from "framer-motion";
import OwnerMarquee from "../components/OwnerMarquee";
import { useAuth } from "../hooks/useAuth";
import {
  Globe,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Search,
  Home as HomeIcon,
  ListPlus,
  Users,
  Handshake,
  Star,
  Phone,
  Lock,
  ArrowRight,
  BadgeCheck,
  MapPin,
} from "lucide-react";

/* ── Animation variants ── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

/* ── Static data ── */

const features = [
  {
    icon: Globe,
    title: "Built for migrants",
    desc: "Designed from the ground up for people arriving in Australia without local rental history.",
    color: "rose" as const,
  },
  {
    icon: ShieldCheck,
    title: "Verified hosts & profiles",
    desc: "Optional ID, email and phone verification builds trust between seekers and owners.",
    color: "emerald" as const,
  },
  {
    icon: Sparkles,
    title: "AI-powered matching",
    desc: "Our AI learns your preferences and surfaces rooms that actually fit your needs.",
    color: "violet" as const,
  },
  {
    icon: CreditCard,
    title: "Simple, secure payments",
    desc: "One-time platform fees processed through Stripe. No hidden charges, no ongoing commissions.",
    color: "blue" as const,
  },
];

const colorMap = {
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-100 dark:border-rose-500/20",
    icon: "text-rose-500",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-100 dark:border-emerald-500/20",
    icon: "text-emerald-500",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-100 dark:border-violet-500/20",
    icon: "text-violet-500",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-100 dark:border-blue-500/20",
    icon: "text-blue-500",
  },
} as const;

const seekerSteps = [
  { icon: Search, title: "Search & filter", desc: "Browse verified rooms by location, price, and more." },
  { icon: Sparkles, title: "Get AI matches", desc: "Our AI suggests rooms that fit your profile and preferences." },
  { icon: HomeIcon, title: "Move in", desc: "Connect with the owner, arrange directly, and settle in." },
];

const ownerSteps = [
  { icon: ListPlus, title: "List your room", desc: "Add photos, pricing, and details in minutes." },
  { icon: Users, title: "Meet matched seekers", desc: "Review trust-scored applicants who fit your listing." },
  { icon: Handshake, title: "Host with confidence", desc: "Choose your tenant and manage rent your way." },
];

const testimonials = [
  {
    name: "Priya M.",
    role: "Student from India",
    quote: "I found a verified room in Parramatta within a week of landing. The whole process felt safe and easy.",
    rating: 5,
    avatar: "P",
  },
  {
    name: "David L.",
    role: "Owner in Sydney",
    quote: "MigRent sends me serious enquiries from verified seekers. Much better than dealing with random classifieds.",
    rating: 5,
    avatar: "D",
  },
  {
    name: "Maria S.",
    role: "Professional from Brazil",
    quote: "As a new arrival with no rental history, MigRent made it possible to find a great room without the usual stress.",
    rating: 5,
    avatar: "M",
  },
];

const trustItems = [
  {
    icon: BadgeCheck,
    title: "Identity verification",
    desc: "Email, phone, and optional ID checks help everyone know who they are dealing with.",
  },
  {
    icon: Lock,
    title: "Secure payments via Stripe",
    desc: "Platform fees are processed securely. No card details are stored on our servers.",
  },
  {
    icon: Phone,
    title: "Support & dispute guidance",
    desc: "Our team is here to help with any questions or issues, so you are never on your own.",
  },
];

const trustBadges = [
  { icon: ShieldCheck, label: "Verified Hosts" },
  { icon: Lock, label: "Secure Stripe Payments" },
  { icon: MapPin, label: "Built in Australia" },
];

const pressLogos = ["TechCrunch", "StartupDaily", "SBS News", "Product Hunt"];

/* ── Page ── */

export default function Home() {
  const { session } = useAuth();

  return (
    <>
      <Head>
        <title>MigRent AI – Find Verified Rooms in Australia</title>
        <meta
          name="description"
          content="MigRent helps migrants, students, and professionals find verified rooms from trusted Australian owners — faster and safer than classifieds."
        />
        <meta property="og:title" content="MigRent AI – Find Verified Rooms in Australia" />
        <meta
          property="og:description"
          content="Find verified rooms from trusted owners across Australia. Superhost-rated, station-close listings."
        />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "MigRent AI",
              url: "https://migrent.au",
              description: "Find verified rooms from trusted owners across Australia.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://migrent.au/seeker/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </Head>

      {/* ═══════════════════════════════════════════
          SECTION 1 · HERO
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-400/15 dark:bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-400/10 dark:bg-violet-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-400/10 dark:bg-blue-500/8 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400 mb-8">
              <span className="pulse-dot" />
              Now live across Australia
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              <span className="gradient-text">Find your room,</span>{" "}
              <span className="text-slate-900 dark:text-white">feel at home</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              MigRent connects migrants, students, and professionals with verified
              rooms from local Australian owners &mdash; faster and safer than random
              classifieds.
            </p>

            {/* Primary CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/seeker/dashboard">
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 btn-primary text-base px-8 py-4 rounded-xl"
                >
                  I&apos;m a Seeker
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <Link href="/owner/dashboard">
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 btn-secondary text-base px-8 py-4 rounded-xl"
                >
                  I&apos;m an Owner
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </div>

            {/* Secondary links */}
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <Link
                href="/pricing"
                className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              >
                View pricing
              </Link>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <Link
                href="/about"
                className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              >
                Learn more
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm"
                >
                  <badge.icon className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 · MARQUEE (existing component)
      ═══════════════════════════════════════════ */}
      <section className="py-16 border-y border-slate-100 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Popular rooms from <span className="gradient-text">verified owners</span>
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Browse top-rated listings across Sydney, Melbourne, Brisbane, and beyond.
            </p>
          </motion.div>
        </div>

        {/* OwnerMarquee is rendered exactly as-is — no internal changes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <OwnerMarquee />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 · WHY MIGRENT – FEATURE STRIP
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-3">
              Why MigRent
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Everything you need to find <span className="gradient-text">home</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const c = colorMap[feature.color];
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="card p-6 rounded-2xl group hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`w-6 h-6 ${c.icon}`} />
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-bold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 · HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Three simple steps to your <span className="gradient-text">new home</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Seekers panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/10 dark:to-rose-900/10 border border-rose-100 dark:border-rose-500/20 p-8"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/30 dark:bg-rose-500/5 rounded-full blur-2xl" />
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white font-bold text-sm">
                  S
                </span>
                For Seekers
              </h3>
              <div className="space-y-6 relative z-10">
                {seekerSteps.map((step) => (
                  <div key={step.title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <step.icon className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {step.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/for-seekers">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 mt-8 btn-primary text-sm px-6 py-3 rounded-xl"
                >
                  Start searching
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>

            {/* Owners panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-900/10 border border-blue-100 dark:border-blue-500/20 p-8"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 dark:bg-blue-500/5 rounded-full blur-2xl" />
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  O
                </span>
                For Owners
              </h3>
              <div className="space-y-6 relative z-10">
                {ownerSteps.map((step) => (
                  <div key={step.title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <step.icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {step.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/for-owners">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 mt-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-shadow"
                >
                  List your room
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 · VISUAL STORIES / PICTURES
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-3">
              Real stories
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              People finding <span className="gradient-text">home</span> every day
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Large featured image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group"
            >
              {/* TODO: replace with real MigRent hero image */}
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
                alt="Beautiful furnished room"
                className="w-full h-full min-h-[300px] md:min-h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="inline-block px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold mb-3">
                  Featured
                </span>
                <h3 className="text-white text-xl md:text-2xl font-bold">
                  Beautiful rooms, verified owners, zero stress
                </h3>
                <p className="text-white/80 text-sm mt-2 max-w-md">
                  Every listing on MigRent is from a verified owner, so you can focus
                  on finding the perfect space.
                </p>
              </div>
            </motion.div>

            {/* Story card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative rounded-3xl overflow-hidden group"
            >
              {/* TODO: replace with real success story image */}
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80"
                alt="Modern bedroom"
                className="w-full h-[220px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold mb-2">
                  Success story
                </span>
                <h4 className="text-white font-bold text-sm">
                  Student finds a room in Kellyville in 3 days
                </h4>
              </div>
            </motion.div>

            {/* Story card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative rounded-3xl overflow-hidden group"
            >
              {/* TODO: replace with real success story image */}
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80"
                alt="Cozy living space"
                className="w-full h-[220px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold mb-2">
                  Success story
                </span>
                <h4 className="text-white font-bold text-sm">
                  New family moves to Sydney with a verified host
                </h4>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6 · SOCIAL PROOF
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-slate-50/80 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Loved by seekers and <span className="gradient-text">owners</span>
            </h2>
          </motion.div>

          {/* Rating summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-12"
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">4.9 / 5</span>
            <span className="text-sm text-slate-400 dark:text-slate-500">
              (from early pilot users)
            </span>
          </motion.div>

          {/* Testimonial cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card p-6 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* "As seen on" logos placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center"
          >
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
              As seen on
            </p>
            {/* TODO: replace with real media/partner logos */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
              {pressLogos.map((name) => (
                <div
                  key={name}
                  className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-sm font-semibold"
                >
                  {name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7 · SAFETY & TRUST
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-3">
              Safety first
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Your safety is our <span className="gradient-text">priority</span>
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Moving to a new country is a big step. We built MigRent with safety and
              transparency at its core, so you can focus on settling in.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {trustItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center card p-8 rounded-2xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 8 · BOTTOM CTA
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Full-bleed gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-rose-600 to-violet-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Ready to find your room?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
              Join migrants, students, and professionals who found their home through
              MigRent.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={session ? "/dashboard" : "/signup"}>
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-white text-rose-600 font-bold px-8 py-4 rounded-xl hover:shadow-xl transition-shadow text-base"
                >
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <Link href="/faq">
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-base"
                >
                  Help centre
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="card-subtle p-6 rounded-2xl space-y-2 text-sm text-slate-500 dark:text-slate-500">
          <p>
            <strong className="text-slate-700 dark:text-slate-400">Disclaimer:</strong>{" "}
            MigRent is an online platform only. We are not a real estate agent, landlord,
            tenant, or legal representative of any user.
          </p>
          <p>
            All agreements and ongoing rent payments are arranged directly between owners
            and seekers. MigRent charges a one-time AUD 99 fee to owners on successful
            matches and may offer an optional AUD 19 fee to seekers.
          </p>
        </div>
      </section>
    </>
  );
}
