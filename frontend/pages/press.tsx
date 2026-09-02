import Link from "next/link";
import SEOHead from "../components/SEOHead";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Press() {
  const { t } = useTranslation();

  const stats = [
    { label: t("press.stat1Label"), value: t("press.stat1Value"), detail: t("press.stat1Detail") },
    { label: t("press.stat2Label"), value: t("press.stat2Value"), detail: t("press.stat2Detail") },
    { label: t("press.stat3Label"), value: t("press.stat3Value"), detail: t("press.stat3Detail") },
    { label: t("press.stat4Label"), value: t("press.stat4Value"), detail: t("press.stat4Detail") },
  ];

  const milestones = [
    { date: t("press.m1Date"), title: t("press.m1Title"), desc: t("press.m1Desc") },
    { date: t("press.m2Date"), title: t("press.m2Title"), desc: t("press.m2Desc") },
    { date: t("press.m3Date"), title: t("press.m3Title"), desc: t("press.m3Desc") },
    { date: t("press.m4Date"), title: t("press.m4Title"), desc: t("press.m4Desc") },
  ];

  return (
    <>
      <SEOHead title="Press & Media" description="MigRent press kit - company facts, milestones, media assets, and press contact information." />

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/5 hidden " />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-violet-100 dark:border-[var(--color-primary)]/20 text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)] mb-6">
              {t("press.badge")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
              {t("press.headline1")}{" "}
              <span className="text-[var(--color-ink)]">{t("press.headline2")}</span>
            </h1>
            <p className="mt-6 text-lg text-[var(--color-ink-3)] max-w-2xl mx-auto leading-relaxed">
              {t("press.subtitle")}
            </p>
          </motion.div>
        </section>

        {/* Key Stats */}
        <section className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-4 rounded-2xl text-center">
                <p className="text-2xl font-semibold text-[var(--color-primary)]">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mt-1">{stat.label}</p>
                <p className="text-xs text-[var(--color-ink-3)] mt-0.5">{stat.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="max-w-3xl mx-auto">
          <div className="card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-ink)]">{t("press.aboutTitle")}</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>
                {t("press.aboutP1")}
              </p>
              <p>
                {t("press.aboutP2")}
              </p>
              <p>
                {t("press.aboutP3")}
              </p>
              <div className="card-subtle p-4 rounded-xl space-y-1 mt-2">
                <p className="font-semibold text-[var(--color-ink)]">{t("press.companyDetails")}</p>
                <p>Trading name: MigRent</p>
                <p>ABN: 22 669 566 941</p>

                <p>Headquarters: Sydney, Australia</p>
                <p>Markets: Sydney, Adelaide</p>
              </div>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] mb-6 text-center">
            {t("press.milestonesTitle")}
          </h2>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-5 rounded-2xl flex gap-4 items-start">
                <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-lg shrink-0">{m.date}</span>
                <div>
                  <h3 className="font-bold text-[var(--color-ink)] text-sm">{m.title}</h3>
                  <p className="text-sm text-[var(--color-ink-3)] mt-0.5">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Media Kit */}
        <section className="max-w-3xl mx-auto">
          <div className="card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-ink)]">{t("press.mediaKitTitle")}</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>{t("press.mediaKitIntro")}</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>{t("press.mk1")}</li>
                <li>{t("press.mk2")}</li>
                <li>{t("press.mk3")}</li>
                <li>{t("press.mk4")}</li>
                <li>{t("press.mk5")}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] mb-6 text-center">
            {t("press.userSayTitle")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-5 rounded-2xl">
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed italic mb-3">
                &quot;{t("press.userSay1")}&quot;
              </p>
              <p className="text-xs font-semibold text-[var(--color-ink)]">{t("press.userSay1Author")}</p>
            </div>
            <div className="card p-5 rounded-2xl">
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed italic mb-3">
                &quot;{t("press.userSay2")}&quot;
              </p>
              <p className="text-xs font-semibold text-[var(--color-ink)]">{t("press.userSay2Author")}</p>
            </div>
          </div>
        </section>

        {/* Press Contact */}
        <section className="max-w-3xl mx-auto pb-8">
          <div className="card p-8 rounded-2xl bg-[var(--color-primary-soft)] from-violet-50 to-violet-100/50 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary)]/5 border-[var(--color-primary-soft)] dark:border-[var(--color-primary)]/20 text-center">
            <h2 className="text-2xl font-semibold text-[var(--color-ink)] mb-3">{t("press.ctaTitle")}</h2>
            <p className="text-sm text-[var(--color-ink-2)] mb-6 max-w-md mx-auto">{t("press.ctaSubtitle")}</p>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=Press%20Enquiry%20-%20MigRent%20AI" target="_blank" rel="noopener noreferrer">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-8 py-3 rounded-xl">
                {t("press.ctaCta")}
              </motion.span>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
