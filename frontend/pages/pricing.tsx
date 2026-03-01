import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";
import { useTranslation } from "react-i18next";

export default function Pricing() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Pricing | MigRent AI</title>
        <meta name="description" content="MigRent AI pricing - AUD $99 one-time owner fee, optional AUD $19 seeker verification. No subscriptions, no rent commissions." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              {t("pricing.title")} <span className="gradient-text">{t("pricing.titleAccent")}</span> {t("pricing.titleEnd")}
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("pricing.subtitle")}
            </p>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Owner */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="card p-6 rounded-2xl border-t-4 border-t-blue-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-xs font-semibold text-blue-600 dark:text-blue-400">
                {t("pricing.ownersBadge")}
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("pricing.ownerTitle")}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("pricing.ownerSubtitle")}</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{t("pricing.ownerPrice")}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{t("pricing.ownerPriceUnit")}</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t("pricing.ownerPriceNote")}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  t("pricing.ownerF1"),
                  t("pricing.ownerF2"),
                  t("pricing.ownerF3"),
                  t("pricing.ownerF4"),
                  t("pricing.ownerF5"),
                  t("pricing.ownerF6"),
                  t("pricing.ownerF7"),
                  t("pricing.ownerF8"),
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/owner/dashboard">
                <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
                  {t("pricing.ownerCta")}
                </motion.span>
              </Link>
            </motion.div>

            {/* Seeker */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="card p-6 rounded-2xl border-t-4 border-t-rose-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {t("pricing.seekersBadge")}
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("pricing.seekerTitle")}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("pricing.seekerSubtitle")}</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{t("pricing.seekerPrice")}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{t("pricing.seekerPriceUnit")}</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t("pricing.seekerPriceNote")}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  t("pricing.seekerF1"),
                  t("pricing.seekerF2"),
                  t("pricing.seekerF3"),
                  t("pricing.seekerF4"),
                  t("pricing.seekerF5"),
                  t("pricing.seekerF6"),
                  t("pricing.seekerF7"),
                  t("pricing.seekerF8"),
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/seeker/dashboard">
                <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:shadow-lg transition-shadow">
                  {t("pricing.seekerCta")}
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Comparison */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-6 text-center">
            {t("pricing.compareTitle")}
          </h2>
          <div className="card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-4 font-bold text-slate-900 dark:text-white">{t("pricing.compareFeature")}</th>
                    <th className="text-center p-4 font-bold text-rose-500">{t("pricing.compareMigrent")}</th>
                    <th className="text-center p-4 font-bold text-slate-400">{t("pricing.compareClassifieds")}</th>
                    <th className="text-center p-4 font-bold text-slate-400">{t("pricing.compareAgents")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { feature: t("pricing.cmpF1"), migrent: t("pricing.cmpM1"), classifieds: t("pricing.cmpC1"), agents: t("pricing.cmpA1") },
                    { feature: t("pricing.cmpF2"), migrent: t("pricing.cmpM2"), classifieds: t("pricing.cmpC2"), agents: t("pricing.cmpA2") },
                    { feature: t("pricing.cmpF3"), migrent: t("pricing.cmpM3"), classifieds: t("pricing.cmpC3"), agents: t("pricing.cmpA3") },
                    { feature: t("pricing.cmpF4"), migrent: t("pricing.cmpM4"), classifieds: t("pricing.cmpC4"), agents: t("pricing.cmpA4") },
                    { feature: t("pricing.cmpF5"), migrent: t("pricing.cmpM5"), classifieds: t("pricing.cmpC5"), agents: t("pricing.cmpA5") },
                    { feature: t("pricing.cmpF6"), migrent: t("pricing.cmpM6"), classifieds: t("pricing.cmpC6"), agents: t("pricing.cmpA6") },
                  ].map((row) => (
                    <tr key={row.feature}>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center font-semibold text-rose-500">{row.migrent}</td>
                      <td className="p-4 text-center text-slate-400">{row.classifieds}</td>
                      <td className="p-4 text-center text-slate-400">{row.agents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-6 text-center">
            {t("pricing.faqTitle")}
          </h2>
          <div className="space-y-3">
            {[
              { q: t("pricing.faqQ1"), a: t("pricing.faqA1") },
              { q: t("pricing.faqQ2"), a: t("pricing.faqA2") },
              { q: t("pricing.faqQ3"), a: t("pricing.faqA3") },
              { q: t("pricing.faqQ4"), a: t("pricing.faqA4") },
            ].map((item) => (
              <div key={item.q} className="card p-5 rounded-xl">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.q}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto pb-8">
          <div className="card p-8 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-blue-50 dark:from-rose-500/10 dark:via-slate-900 dark:to-blue-500/10 text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{t("pricing.ctaTitle")}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{t("pricing.ctaSubtitle")}</p>
            <div className="flex gap-3 justify-center flex-col sm:flex-row">
              <Link href="/signup">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-8 py-3 rounded-xl">
                  {t("pricing.ctaSignUp")}
                </motion.span>
              </Link>
              <Link href="/faq">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-secondary text-sm px-8 py-3 rounded-xl">
                  {t("pricing.ctaFaq")}
                </motion.span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
