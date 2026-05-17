import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";
import { useTranslation } from "react-i18next";

export default function Careers() {
  const { t } = useTranslation();

  const values = [
    { title: t("careers.val1Title"), desc: t("careers.val1Desc"), icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { title: t("careers.val2Title"), desc: t("careers.val2Desc"), icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
    { title: t("careers.val3Title"), desc: t("careers.val3Desc"), icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { title: t("careers.val4Title"), desc: t("careers.val4Desc"), icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
  ];

  return (
    <>
      <Head>
        <title>Careers | MigRent AI</title>
        <meta name="description" content="Join MigRent AI - help build the future of accommodation for migrants and students in Australia." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/5 rounded-full blur-3xl animate-pulse" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              {t("careers.badge")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
              <span className="text-slate-900 dark:text-white">{t("careers.headline1")}</span>{" "}
              {t("careers.headlineAccent")}
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("careers.subtitle")}
            </p>
          </motion.div>
        </section>

        {/* Values */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-8 text-center">
            {t("careers.valuesTitle")} {t("careers.valuesAccent")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About the Team */}
        <section className="max-w-3xl mx-auto">
          <div className="card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("careers.teamTitle")}</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>
                {t("careers.teamP1")}
              </p>
              <p>
                {t("careers.teamP2")}
              </p>
            </div>
          </div>
        </section>

        {/* Current Openings */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6 text-center">
            {t("careers.openingsTitle")}
          </h2>
          <div className="space-y-3">
            <div className="card p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t("careers.volunteerTitle")}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t("careers.volunteerMeta")}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 text-xs font-semibold text-[var(--color-accent)] dark:text-[var(--color-accent)] shrink-0">
                  {t("careers.volunteerOpen")}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {t("careers.volunteerDesc")}
              </p>
            </div>

            <div className="card-subtle p-5 rounded-2xl">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                {t("careers.morePositions")}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto pb-8">
          <div className="card p-8 rounded-2xl bg-gradient-to-br from-[var(--color-primary-soft)] to-[var(--color-primary-soft)]/50 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary)]/5 border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">{t("careers.ctaTitle")}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">{t("careers.ctaSubtitle")}</p>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=Careers%20at%20MigRent%20AI" target="_blank" rel="noopener noreferrer">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-8 py-3 rounded-xl">
                {t("careers.ctaCta")}
              </motion.span>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
