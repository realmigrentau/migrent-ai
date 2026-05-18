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

/* ── Step illustrations for each guide ───────────────────────────── */

function StepsPreview({ steps, color }: { steps: string[]; color: string }) {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className={`w-6 h-6 rounded-full bg-[var(--color-primary-soft)] ${color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
            {i + 1}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{step}</span>
        </div>
      ))}
    </div>
  );
}

const guides = [
  {
    id: "host-first",
    titleKey: "guides.hostFirst.title",
    descKey: "guides.hostFirst.desc",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    gradient: "from-[var(--color-primary)] to-[var(--color-primary)]",
    steps: ["Create your listing", "Add photos & pricing", "Set house rules", "Welcome your first seeker"],
    readTime: "5 min read",
    difficulty: "Beginner",
  },
  {
    id: "find-fast",
    titleKey: "guides.findFast.title",
    descKey: "guides.findFast.desc",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    color: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10",
    gradient: "from-[var(--color-primary)] to-[var(--color-primary)]",
    steps: ["Set up smart filters", "Enable instant alerts", "Save favourite suburbs", "Apply with one click"],
    readTime: "4 min read",
    difficulty: "Beginner",
  },
  {
    id: "verify-profile",
    titleKey: "guides.verifyProfile.title",
    descKey: "guides.verifyProfile.desc",
    icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    gradient: "from-green-500 to-[var(--color-accent)]",
    steps: ["Upload your ID", "Take a selfie for matching", "Confirm your address", "Earn your trust badge"],
    readTime: "3 min read",
    difficulty: "Beginner",
  },
  {
    id: "list-property",
    titleKey: "guides.listProperty.title",
    descKey: "guides.listProperty.desc",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    color: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10",
    gradient: "from-[var(--color-primary)] to-[var(--color-primary)]",
    steps: ["Enter room details", "Upload quality photos", "Set pricing & availability", "Publish and go live"],
    readTime: "6 min read",
    difficulty: "Intermediate",
  },
  {
    id: "superhost",
    titleKey: "guides.superhost.title",
    descKey: "guides.superhost.desc",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    gradient: "from-amber-500 to-orange-500",
    steps: ["Maintain 4.8+ rating", "Respond within 1 hour", "Zero cancellations", "Complete 10+ bookings"],
    readTime: "4 min read",
    difficulty: "Advanced",
  },
  {
    id: "earnings",
    titleKey: "guides.earnings.title",
    descKey: "guides.earnings.desc",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-[var(--color-accent)]",
    bgColor: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10",
    gradient: "from-[var(--color-accent)] to-teal-500",
    steps: ["Select your suburb", "Choose room type", "See weekly estimates", "Compare with market rates"],
    readTime: "3 min read",
    difficulty: "Beginner",
  },
  {
    id: "visas",
    titleKey: "guides.visas.title",
    descKey: "guides.visas.desc",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10",
    gradient: "from-[var(--color-primary)] to-[var(--color-primary)]",
    steps: ["Identify your visa type", "Check housing rights", "Understand bond rules", "Know your protections"],
    readTime: "7 min read",
    difficulty: "Intermediate",
  },
  {
    id: "disputes",
    titleKey: "guides.disputes.title",
    descKey: "guides.disputes.desc",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    gradient: "from-[var(--color-danger-500)] to-[var(--color-primary)]",
    steps: ["File your dispute", "Provide evidence", "Mediation process", "Resolution & outcome"],
    readTime: "5 min read",
    difficulty: "Intermediate",
  },
];

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
  Intermediate: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Advanced: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]",
};

export default function Guides() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("guides.heroTitle")} | MigRent AI</title>
        <meta name="description" content="Step-by-step guides for MigRent AI - learn how to host, find rentals, verify your profile, become a superhost, and more." />
      </Head>

      <div className="space-y-20">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative text-center py-20 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/12 dark:bg-blue-500/6 hidden " />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-500/12 dark:bg-green-500/6 hidden " style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-400/5 dark:bg-teal-600/5 hidden " />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <span className="eyebrow">{t("guides.heroBadge")}</span>
            </div>

            <h1 className="font-serif text-[44px] sm:text-[60px] md:text-[80px] leading-[0.98] tracking-[-0.025em] text-[var(--color-ink)]">
              Guides <span className="italic text-[var(--color-ink-2)]">& How-Tos</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[var(--color-ink-2)] max-w-2xl mx-auto leading-relaxed">
              {t("guides.heroSubtitle")}
            </p>

            {/* Category filter pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {[
                { label: "All Guides", active: true },
                { label: "For Seekers", active: false },
                { label: "For Owners", active: false },
                { label: "Legal & Visa", active: false },
              ].map((cat) => (
                <span
                  key={cat.label}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    cat.active
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {cat.label}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Featured guide (first one, full width) ─────────────── */}
        <section>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            id={guides[0].id}
            className="scroll-mt-24"
          >
            <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-[var(--color-primary)] ${guides[0].gradient}`} />
              <div className="flex flex-col md:flex-row">
                {/* Visual */}
                <div className={`w-full md:w-2/5 bg-[var(--color-primary-soft)] ${guides[0].gradient} p-8 flex flex-col justify-center min-h-[240px]`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={guides[0].icon} />
                      </svg>
                    </div>
                    <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Featured Guide</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {t(guides[0].titleKey)}
                  </h3>
                  <p className="text-white/70 text-sm mt-2 leading-relaxed">
                    {t(guides[0].descKey)}
                  </p>
                </div>
                {/* Steps */}
                <div className="w-full md:w-3/5 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${difficultyColors[guides[0].difficulty]}`}>
                      {guides[0].difficulty}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {guides[0].readTime}
                    </span>
                  </div>
                  <StepsPreview steps={guides[0].steps} color={guides[0].gradient} />
                  <Link href={`/guides/${guides[0].id}`}>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-block mt-6 btn-primary text-sm px-6 py-2.5 rounded-xl"
                    >
                      {t("guides.readGuide")}
                    </motion.span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Guide cards grid (remaining guides) ────────────────── */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.slice(1).map((guide, i) => (
              <motion.div
                key={guide.id}
                id={guide.id}
                className="scroll-mt-24"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i % 6}
                variants={fadeUp}
              >
                <Link href={`/guides/${guide.id}`}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer"
                  >
                    {/* Top gradient accent */}
                    <div className={`h-1 bg-[var(--color-primary)] ${guide.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className={`h-1 bg-[var(--color-primary)] ${guide.gradient} opacity-100 group-hover:opacity-0 transition-opacity -mt-1`} style={{ height: "2px" }} />

                    <div className="p-6 flex flex-col flex-1">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl ${guide.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                          <svg className={`w-6 h-6 ${guide.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={guide.icon} />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {t(guide.titleKey)}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColors[guide.difficulty]}`}>
                              {guide.difficulty}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{guide.readTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t(guide.descKey)}
                      </p>

                      {/* Steps preview */}
                      <StepsPreview steps={guide.steps} color={guide.gradient} />

                      {/* Footer */}
                      <div className="mt-auto pt-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)]">
                          {t("guides.readGuide")}
                          <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Help banner ────────────────────────────────────────── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-[var(--color-line-2)] p-[1px]"
          >
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Can&apos;t find what you need?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Our support team can help you with any question - available 24/7 in multiple languages.
                </p>
              </div>
              <Link href="/contact">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block btn-primary text-sm px-6 py-3 rounded-xl whitespace-nowrap"
                >
                  {t("guides.cta.button")}
                </motion.span>
              </Link>
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
              {t("guides.cta.title")}
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              {t("guides.cta.subtitle")}
            </p>
            <Link href="/contact">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block mt-6 btn-primary text-base px-8 py-3.5 rounded-xl">
                {t("guides.cta.button")}
              </motion.span>
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  );
}
