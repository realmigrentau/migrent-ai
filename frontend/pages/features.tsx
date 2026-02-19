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

      <div className="space-y-20">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl animate-pulse" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-xs font-medium text-purple-600 dark:text-purple-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              {t("features.heroBadge")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-purple-500 to-rose-500 bg-clip-text text-transparent">{t("features.heroTitle")}</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("features.heroSubtitle")}
            </p>
          </motion.div>
        </section>

        {/* Feature sections */}
        {features.map((feature, i) => {
          const isEven = i % 2 === 0;
          const bullets = t(feature.bulletsKey, { returnObjects: true }) as string[];

          return (
            <section key={feature.id} id={feature.id} className="scroll-mt-24">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0}
                variants={fadeUp}
                className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10 md:gap-16`}
              >
                {/* Visual */}
                <div className="w-full md:w-1/2">
                  <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${feature.color} p-8 md:p-12 aspect-[4/3] flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-white/5" />
                    <svg className="w-24 h-24 md:w-32 md:h-32 text-white/90 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                    </svg>
                    <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                  </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} mb-4`}>
                    <svg className={`w-6 h-6 ${feature.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {t(feature.titleKey)}
                  </h2>
                  <p className="mt-4 text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {Array.isArray(bullets) &&
                      bullets.map((bullet, bi) => (
                        <li key={bi} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <svg className={`w-5 h-5 shrink-0 ${feature.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {bullet}
                        </li>
                      ))}
                  </ul>
                </div>
              </motion.div>
            </section>
          );
        })}

        {/* CTA */}
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
