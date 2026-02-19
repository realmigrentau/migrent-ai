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

const resources = [
  {
    id: "blog",
    titleKey: "resources.blog.title",
    descKey: "resources.blog.desc",
    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-500/10",
    gradient: "from-rose-500 to-pink-500",
    external: false,
  },
  {
    id: "calculator",
    titleKey: "resources.calculator.title",
    descKey: "resources.calculator.desc",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    gradient: "from-green-500 to-emerald-500",
    external: false,
  },
  {
    id: "api-docs",
    titleKey: "resources.apiDocs.title",
    descKey: "resources.apiDocs.desc",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    gradient: "from-blue-500 to-indigo-500",
    external: false,
  },
  {
    id: "discord",
    titleKey: "resources.discord.title",
    descKey: "resources.discord.desc",
    icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    gradient: "from-indigo-500 to-purple-500",
    external: false,
  },
  {
    id: "careers",
    titleKey: "resources.careers.title",
    descKey: "resources.careers.desc",
    icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    gradient: "from-amber-500 to-orange-500",
    external: false,
    href: "/careers",
  },
  {
    id: "rental-laws",
    titleKey: "resources.rentalLaws.title",
    descKey: "resources.rentalLaws.desc",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-500/10",
    gradient: "from-cyan-500 to-teal-500",
    external: false,
  },
  {
    id: "owner-roi",
    titleKey: "resources.ownerROI.title",
    descKey: "resources.ownerROI.desc",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    gradient: "from-purple-500 to-violet-500",
    external: false,
  },
];

export default function Resources() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("resources.heroTitle")} | MigRent AI</title>
        <meta name="description" content="MigRent AI resources — blog, rent calculator, API docs, community, AU rental laws, and owner ROI tools." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-xs font-medium text-cyan-600 dark:text-cyan-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              {t("resources.heroBadge")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">{t("resources.heroTitle")}</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("resources.heroSubtitle")}
            </p>
          </motion.div>
        </section>

        {/* Resource grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, i) => (
              <motion.div
                key={resource.id}
                id={resource.id}
                className="scroll-mt-24"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i % 6}
                variants={fadeUp}
              >
                {resource.href ? (
                  <Link href={resource.href} className="block h-full">
                    <ResourceCard resource={resource} t={t} />
                  </Link>
                ) : (
                  <ResourceCard resource={resource} t={t} />
                )}
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
              {t("resources.cta.title")}
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              {t("resources.cta.subtitle")}
            </p>
            <Link href="/contact">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block mt-6 btn-primary text-base px-8 py-3.5 rounded-xl">
                {t("resources.cta.button")}
              </motion.span>
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  );
}

function ResourceCard({ resource, t }: { resource: (typeof resources)[number]; t: (key: string) => string }) {
  return (
    <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:shadow-lg transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 h-full flex flex-col">
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-b-full bg-gradient-to-r ${resource.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className={`w-12 h-12 rounded-xl ${resource.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <svg className={`w-6 h-6 ${resource.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={resource.icon} />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        {t(resource.titleKey)}
      </h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
        {t(resource.descKey)}
      </p>
      <span className="inline-flex items-center gap-1 mt-4 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full self-start">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {resource.href ? t("resources.visitLink") : t("resources.comingSoon")}
      </span>
    </div>
  );
}
