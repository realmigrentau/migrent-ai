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

const guides = [
  {
    id: "host-first",
    titleKey: "guides.hostFirst.title",
    descKey: "guides.hostFirst.desc",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "find-fast",
    titleKey: "guides.findFast.title",
    descKey: "guides.findFast.desc",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-500/10",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    id: "verify-profile",
    titleKey: "guides.verifyProfile.title",
    descKey: "guides.verifyProfile.desc",
    icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "list-property",
    titleKey: "guides.listProperty.title",
    descKey: "guides.listProperty.desc",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    id: "superhost",
    titleKey: "guides.superhost.title",
    descKey: "guides.superhost.desc",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "earnings",
    titleKey: "guides.earnings.title",
    descKey: "guides.earnings.desc",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "visas",
    titleKey: "guides.visas.title",
    descKey: "guides.visas.desc",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    id: "disputes",
    titleKey: "guides.disputes.title",
    descKey: "guides.disputes.desc",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    gradient: "from-red-500 to-rose-500",
  },
];

export default function Guides() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("guides.heroTitle")} | MigRent AI</title>
        <meta name="description" content="Step-by-step guides for MigRent AI — learn how to host, find rentals, verify your profile, become a superhost, and more." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl animate-pulse" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-xs font-medium text-blue-600 dark:text-blue-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {t("guides.heroBadge")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">{t("guides.heroTitle")}</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("guides.heroSubtitle")}
            </p>
          </motion.div>
        </section>

        {/* Guide cards grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide, i) => (
              <motion.div
                key={guide.id}
                id={guide.id}
                className="scroll-mt-24"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i % 4}
                variants={fadeUp}
              >
                <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:shadow-lg transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 h-full">
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-b-full bg-gradient-to-r ${guide.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${guide.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <svg className={`w-6 h-6 ${guide.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={guide.icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t(guide.titleKey)}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t(guide.descKey)}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-4 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t("guides.comingSoon")}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

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
