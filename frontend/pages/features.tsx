import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Head from "next/head";
import { useTranslation } from "react-i18next";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

/* ── Mock UI illustrations for each feature ──────────────────────── */

function MockAIMatching() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold">AI</div>
        <div className="text-white/90 text-sm font-semibold">Finding your match...</div>
      </div>
      {[98, 94, 87].map((score, i) => (
        <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <div className="w-10 h-10 rounded-lg bg-white/15 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-2.5 bg-white/30 rounded-full w-3/4" />
            <div className="h-2 bg-white/15 rounded-full w-1/2 mt-1.5" />
          </div>
          <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            score >= 95 ? "bg-green-400/20 text-green-200" :
            score >= 90 ? "bg-blue-400/20 text-blue-200" :
            "bg-amber-400/20 text-amber-200"
          }`}>
            {score}%
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-1">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-white/60 text-xs">3 rooms matched in 0.4s</span>
      </div>
    </div>
  );
}

function MockVerified() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm" />
        <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <div className="text-white/90 text-sm font-semibold">Identity Verified</div>
        <div className="text-white/50 text-xs mt-1">ID, photo, and address confirmed</div>
      </div>
      <div className="flex gap-2">
        {["ID Check", "Photo Match", "Address"].map((label) => (
          <span key={label} className="text-[10px] font-medium text-white/70 bg-white/10 px-2.5 py-1 rounded-full">{label}</span>
        ))}
      </div>
    </div>
  );
}

function MockInstantBooking() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/15" />
          <div>
            <div className="h-2.5 bg-white/30 rounded-full w-28" />
            <div className="h-2 bg-white/15 rounded-full w-20 mt-1.5" />
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] text-white/60 bg-white/10 px-2 py-0.5 rounded">$280/wk</span>
          <span className="text-[10px] text-white/60 bg-white/10 px-2 py-0.5 rounded">Furnished</span>
          <span className="text-[10px] text-green-300/80 bg-green-400/15 px-2 py-0.5 rounded">Instant</span>
        </div>
      </div>
      <motion.div
        initial={{ scale: 0.95, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
        className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center"
      >
        <div className="text-white font-semibold text-sm">Book Now</div>
        <div className="text-white/50 text-[10px] mt-0.5">Confirm in 30 seconds</div>
      </motion.div>
      <div className="flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-white/60 text-xs">Avg. booking time: 28 seconds</span>
      </div>
    </div>
  );
}

function MockFilters() {
  const filters = [
    { label: "Station", active: true },
    { label: "$200-350", active: true },
    { label: "Student visa", active: false },
    { label: "Furnished", active: true },
    { label: "Bills incl.", active: false },
    { label: "Female only", active: false },
  ];
  return (
    <div className="w-full h-full flex flex-col gap-3 p-6">
      <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Smart Filters</div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <span key={f.label} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            f.active ? "bg-white/25 text-white" : "bg-white/8 text-white/50"
          }`}>
            {f.label}
          </span>
        ))}
      </div>
      <div className="mt-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs">Distance to station</span>
          <span className="text-white/90 text-xs font-semibold">500m</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full" />
        </div>
      </div>
      <div className="text-white/50 text-xs">147 rooms match your filters</div>
    </div>
  );
}

function MockSuperhost() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm" />
        <div className="absolute -top-2 -right-2">
          <svg className="w-8 h-8 text-amber-300 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <div className="text-amber-200 text-xs font-bold uppercase tracking-wider">Superhost</div>
        <div className="text-white/90 text-sm font-semibold mt-1">Top 5% of owners</div>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[
          { val: "4.9", label: "Rating" },
          { val: "<1h", label: "Response" },
          { val: "0", label: "Cancels" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/10 rounded-lg p-2 text-center">
            <div className="text-white/90 text-sm font-bold">{stat.val}</div>
            <div className="text-white/50 text-[10px]">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockSupport() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <span className="text-white/80 text-sm font-semibold">Live Support</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-300 text-[10px]">Online</span>
        </span>
      </div>
      {[
        { from: "user", text: "My booking was cancelled?" },
        { from: "agent", text: "Let me check that for you..." },
        { from: "agent", text: "Sorted! Refund issued in 24h." },
      ].map((msg, i) => (
        <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`px-3 py-2 rounded-xl text-xs max-w-[75%] ${
            msg.from === "user" ? "bg-white/20 text-white/90" : "bg-white/10 text-white/70"
          }`}>
            {msg.text}
          </div>
        </div>
      ))}
      <div className="flex gap-2 mt-auto">
        {["English", "中文", "हिन्दी", "العربية"].map((lang) => (
          <span key={lang} className="text-[9px] text-white/40 bg-white/5 px-2 py-0.5 rounded">{lang}</span>
        ))}
      </div>
    </div>
  );
}

const features = [
  {
    id: "ai-matching",
    titleKey: "features.aiMatching.title",
    descKey: "features.aiMatching.desc",
    bulletsKey: "features.aiMatching.bullets",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    color: "from-rose-500 to-pink-500",
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-500/10",
    headline: "AI finds your perfect room",
    subline: "Smart matching that learns what you actually want",
    MockUI: MockAIMatching,
  },
  {
    id: "verified-hosts",
    titleKey: "features.verifiedHosts.title",
    descKey: "features.verifiedHosts.desc",
    bulletsKey: "features.verifiedHosts.bullets",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    color: "from-blue-500 to-indigo-500",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    headline: "100% verified hosts only",
    subline: "Every owner is identity-checked before listing",
    MockUI: MockVerified,
  },
  {
    id: "instant-booking",
    titleKey: "features.instantBooking.title",
    descKey: "features.instantBooking.desc",
    bulletsKey: "features.instantBooking.bullets",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "from-green-500 to-emerald-500",
    iconColor: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    headline: "Book in 30 seconds",
    subline: "One-click booking for verified instant rooms",
    MockUI: MockInstantBooking,
  },
  {
    id: "smart-filters",
    titleKey: "features.smartFilters.title",
    descKey: "features.smartFilters.desc",
    bulletsKey: "features.smartFilters.bullets",
    icon: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
    color: "from-purple-500 to-violet-500",
    iconColor: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    headline: "Station, budget, visa filters",
    subline: "20+ smart filters built for migrant needs",
    MockUI: MockFilters,
  },
  {
    id: "superhost",
    titleKey: "features.superhost.title",
    descKey: "features.superhost.desc",
    bulletsKey: "features.superhost.bullets",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    color: "from-amber-500 to-orange-500",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    headline: "Superhost badge program",
    subline: "Recognising the top 5% of trusted owners",
    MockUI: MockSuperhost,
  },
  {
    id: "support",
    titleKey: "features.support.title",
    descKey: "features.support.desc",
    bulletsKey: "features.support.bullets",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    color: "from-cyan-500 to-teal-500",
    iconColor: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-500/10",
    headline: "24/7 multilingual support",
    subline: "Help in your language, any time of day",
    MockUI: MockSupport,
    href: "/help",
  },
];

export default function Features() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("features.heroTitle")} | MigRent AI</title>
        <meta name="description" content="Discover MigRent AI's powerful features — AI matching, verified hosts, instant booking, smart filters, superhost program, and 24/7 support." />
      </Head>

      <div className="space-y-24">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative text-center py-20 overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/15 dark:bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-500/12 dark:bg-rose-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-400/5 dark:bg-violet-600/5 rounded-full blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-xs font-medium text-purple-600 dark:text-purple-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              {t("features.heroBadge")}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-purple-500 via-violet-500 to-rose-500 bg-clip-text text-transparent">
                Powerful Features
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">for MigRent AI</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("features.heroSubtitle")}
            </p>

            {/* Quick nav pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {features.map((f) => (
                <Link key={f.id} href={`#${f.id}`}>
                  <motion.span
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer
                      bg-white dark:bg-white/5 border-slate-200 dark:border-slate-700
                      hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md
                      text-slate-600 dark:text-slate-300`}
                  >
                    <svg className={`w-3.5 h-3.5 ${f.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                    {t(f.titleKey)}
                  </motion.span>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Feature sections ───────────────────────────────────── */}
        {features.map((feature, i) => {
          const isEven = i % 2 === 0;
          const bullets = t(feature.bulletsKey, { returnObjects: true }) as string[];
          const MockUI = feature.MockUI;

          return (
            <section key={feature.id} id={feature.id} className="scroll-mt-24">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={0}
                variants={fadeUp}
                className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10 md:gap-16`}
              >
                {/* Screenshot-style visual */}
                <div className="w-full md:w-1/2">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${feature.color} aspect-[4/3] shadow-xl`}
                  >
                    {/* Decorative dots / glass effect */}
                    <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-white/8 blur-2xl" />
                    <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-white/8 blur-xl" />
                    {/* Mock UI content */}
                    <div className="relative z-[1] h-full flex items-center justify-center pt-6">
                      <MockUI />
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} mb-4`}>
                    <svg className={`w-6 h-6 ${feature.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                    </svg>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {feature.headline}
                  </h2>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">
                    {feature.subline}
                  </p>

                  <p className="mt-4 text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t(feature.descKey)}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {Array.isArray(bullets) &&
                      bullets.map((bullet, bi) => (
                        <li key={bi} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <span className={`w-5 h-5 rounded-full ${feature.bgColor} flex items-center justify-center shrink-0`}>
                            <svg className={`w-3 h-3 ${feature.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          {bullet}
                        </li>
                      ))}
                  </ul>
                  {(feature as typeof feature & { href?: string }).href && (
                    <Link href={(feature as typeof feature & { href?: string }).href!}>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-block mt-6 btn-primary text-sm px-6 py-2.5 rounded-xl"
                      >
                        Try it now
                      </motion.span>
                    </Link>
                  )}
                </div>
              </motion.div>
            </section>
          );
        })}

        {/* ── Stats bar ──────────────────────────────────────────── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-rose-500 p-[1px]"
          >
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 md:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: "50K+", label: "Rooms listed" },
                  { value: "<30s", label: "Avg. booking time" },
                  { value: "100%", label: "Verified hosts" },
                  { value: "24/7", label: "Support available" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-500 to-rose-500 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("features.cta.title")}
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              {t("features.cta.subtitle")}
            </p>
            <Link href="/signup">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block mt-6 btn-primary text-base px-8 py-3.5 rounded-xl">
                {t("features.cta.button")}
              </motion.span>
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  );
}
