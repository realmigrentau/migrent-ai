import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";

const toc = [
  { id: "story", label: "Our story" },
  { id: "metrics", label: "By the numbers" },
  { id: "mission", label: "Mission" },
  { id: "values", label: "Values" },
  { id: "how", label: "How it works" },
  { id: "business", label: "Business details" },
  { id: "contact", label: "Contact" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function About() {
  const { t } = useTranslation();

  const stats = [
    { value: t("about.stat1Value"), label: t("about.stat1Label"), detail: t("about.stat1Detail") },
    { value: t("about.stat2Value"), label: t("about.stat2Label"), detail: t("about.stat2Detail") },
    { value: t("about.stat3Value"), label: t("about.stat3Label"), detail: t("about.stat3Detail") },
    { value: t("about.stat4Value"), label: t("about.stat4Label"), detail: t("about.stat4Detail") },
  ];

  const values = [
    { title: t("about.value1Title"), desc: t("about.value1Desc"), icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
    { title: t("about.value2Title"), desc: t("about.value2Desc"), icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { title: t("about.value3Title"), desc: t("about.value3Desc"), icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
    { title: t("about.value4Title"), desc: t("about.value4Desc"), icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  ];

  return (
    <PolicyLayout
      family="company"
      eyebrow="About MigRent"
      title={`${t("about.headline1")} ${t("about.headlineAccent")} ${t("about.headline2")}`}
      lede={t("about.subtitle")}
      metaTitle="About | MigRent AI"
      metaDescription="MigRent AI - founded in Sydney by an entrepreneur building an AI-powered rental marketplace for migrants and students across Australia."
      toc={toc}
      related={[
        { href: "/careers", label: "Careers", description: "Help us build the future of rentals" },
        { href: "/press", label: "Press & Media", description: "Company facts and media kit" },
        { href: "/contact", label: "Contact", description: "Get in touch with the team" },
        { href: "/pricing", label: "Pricing", description: "Simple, flat fees" },
      ]}
    >
      <PolicySection id="story" title={`${t("about.storyTitle")} ${t("about.storyAccent")}`}>
        <p>{t("about.storyP1")}</p>
        <p>{t("about.storyP2")}</p>
        <p>{t("about.storyP3")}</p>
        <p>{t("about.storyP4")}</p>
      </PolicySection>

      <PolicySection id="metrics" title="By the numbers">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 not-prose">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-4 rounded-2xl text-center">
              <p className="text-2xl font-bold text-rose-500">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mt-1">{stat.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{stat.detail}</p>
            </motion.div>
          ))}
        </div>
      </PolicySection>

      <PolicySection id="mission" title={t("about.missionTitle")}>
        <p>{t("about.missionText")}</p>
      </PolicySection>

      <PolicySection id="values" title={`${t("about.valuesTitle")} ${t("about.valuesAccent")}`}>
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          {values.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </PolicySection>

      <PolicySection id="how" title={t("about.howTitle")}>
        <p>{t("about.howDesc")}</p>
        <div className="grid sm:grid-cols-2 gap-3 not-prose">
          <div className="card-subtle p-4 rounded-xl border-l-2 border-l-rose-500">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{t("about.howSeekerTitle")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("about.howSeekerDesc")}</p>
            <Link href="/for-seekers" className={`${accent} text-xs mt-1 inline-block`}>{t("about.howSeekerLink")}</Link>
          </div>
          <div className="card-subtle p-4 rounded-xl border-l-2 border-l-blue-500">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{t("about.howOwnerTitle")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("about.howOwnerDesc")}</p>
            <Link href="/for-owners" className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2 transition-colors mt-1 inline-block">{t("about.howOwnerLink")}</Link>
          </div>
        </div>
      </PolicySection>

      <PolicySection id="business" title={t("about.businessTitle")}>
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("about.businessName")}</span>
            <p className="font-semibold text-slate-900 dark:text-white">MigRent AI</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("about.abn")}</span>
            <p className="font-semibold text-slate-900 dark:text-white">22 669 566 941</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("about.structure")}</span>
            <p>{t("about.structureValue")}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("about.location")}</span>
            <p>{t("about.locationValue")}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("about.markets")}</span>
            <p>{t("about.marketsValue")}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("about.emailLabel")}</span>
            <p><a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com" target="_blank" rel="noopener noreferrer" className={accent}>migrentau@gmail.com</a></p>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          <strong className="text-slate-700 dark:text-slate-300">{t("about.disclaimerLabel")}</strong> {t("about.disclaimerText")}
        </p>
      </PolicySection>

      <PolicySection id="contact" title={t("about.ctaTitle")}>
        <p>{t("about.ctaSubtitle")}</p>
        <div className="flex gap-3 flex-col sm:flex-row not-prose">
          <Link href="/dashboard" className="inline-block btn-primary text-sm px-8 py-2.5 rounded-[10px]">
            {t("about.seekerCta")}
          </Link>
          <Link href="/owner/dashboard" className="inline-block btn-secondary text-sm px-8 py-2.5 rounded-[10px]">
            {t("about.ownerCta")}
          </Link>
        </div>
      </PolicySection>
    </PolicyLayout>
  );
}
