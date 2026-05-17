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

export default function ForSeekers() {
  const { t } = useTranslation();

  const steps = [
    { num: t("forSeekers.step1Num"), title: t("forSeekers.step1Title"), desc: t("forSeekers.step1Desc"), icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { num: t("forSeekers.step2Num"), title: t("forSeekers.step2Title"), desc: t("forSeekers.step2Desc"), icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { num: t("forSeekers.step3Num"), title: t("forSeekers.step3Title"), desc: t("forSeekers.step3Desc"), icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { num: t("forSeekers.step4Num"), title: t("forSeekers.step4Title"), desc: t("forSeekers.step4Desc"), icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  ];

  const benefits = [
    { title: t("forSeekers.ben1Title"), desc: t("forSeekers.ben1Desc"), icon: "S" },
    { title: t("forSeekers.ben2Title"), desc: t("forSeekers.ben2Desc"), icon: "N" },
    { title: t("forSeekers.ben3Title"), desc: t("forSeekers.ben3Desc"), icon: "V" },
    { title: t("forSeekers.ben4Title"), desc: t("forSeekers.ben4Desc"), icon: "$" },
    { title: t("forSeekers.ben5Title"), desc: t("forSeekers.ben5Desc"), icon: "F" },
    { title: t("forSeekers.ben6Title"), desc: t("forSeekers.ben6Desc"), icon: "C" },
  ];

  return (
    <>
      <Head>
        <title>For Seekers | MigRent AI</title>
        <meta name="description" content="Find your room with MigRent AI. AI-powered matching for migrants, students, and professionals across Australia." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/5 rounded-full blur-3xl animate-pulse" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              {t("forSeekers.badge")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight text-slate-900 dark:text-white">
              {t("forSeekers.headline1")} {t("forSeekers.headline2")}
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("forSeekers.subtitle")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="inline-block btn-primary text-sm px-8 py-2.5 rounded-[10px]">
                {t("forSeekers.startSearching")}
              </Link>
              <Link href="/pricing" className="inline-block btn-secondary text-sm px-8 py-2.5 rounded-[10px]">
                {t("forSeekers.viewPricing")}
              </Link>
            </div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="max-w-3xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-8 text-center">
            {t("forSeekers.howTitle")} {t("forSeekers.howAccent")}
          </motion.h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="card p-5 rounded-2xl flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-primary)]/70">{step.num}</span>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-8 text-center">
            {t("forSeekers.benefitsTitle")} {t("forSeekers.benefitsAccent")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="card-subtle p-5 rounded-xl group hover:shadow-md dark:hover:bg-white/[0.06] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] flex items-center justify-center text-[var(--color-primary)] dark:text-[var(--color-primary)] font-bold text-sm mb-3 group-hover:border-[var(--color-line-2)] dark:group-hover:border-[var(--color-line-2)]/40 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Search Filters Showcase */}
        <section className="max-w-3xl mx-auto">
          <div className="card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{t("forSeekers.filtersTitle")}</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>{t("forSeekers.filtersIntro")}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  t("forSeekers.filter1"),
                  t("forSeekers.filter2"),
                  t("forSeekers.filter3"),
                  t("forSeekers.filter4"),
                  t("forSeekers.filter5"),
                  t("forSeekers.filter6"),
                  t("forSeekers.filter7"),
                  t("forSeekers.filter8"),
                ].map((filter) => (
                  <div key={filter} className="flex items-center gap-2 card-subtle p-3 rounded-lg">
                    <svg className="w-4 h-4 text-[var(--color-primary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{filter}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto pb-8">
          <div className="card p-8 rounded-2xl bg-gradient-to-br from-[var(--color-primary-soft)] to-[var(--color-primary-soft)]/50 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary)]/5 border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">{t("forSeekers.ctaTitle")}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">{t("forSeekers.ctaSubtitle")}</p>
            <Link href="/dashboard" className="inline-block btn-primary text-sm px-8 py-2.5 rounded-[10px]">
              {t("forSeekers.ctaCta")}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
