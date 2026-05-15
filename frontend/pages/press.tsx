import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";

const toc = [
  { id: "contact", label: "Press contact" },
  { id: "stats", label: "Key facts" },
  { id: "about", label: "About MigRent" },
  { id: "milestones", label: "Recent coverage" },
  { id: "assets", label: "Brand assets" },
  { id: "story-angles", label: "Story angles" },
];

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
    <PolicyLayout
      family="company"
      eyebrow="Press"
      title={`${t("press.headline1")} ${t("press.headline2")}`}
      lede={t("press.subtitle")}
      metaTitle="Press & Media | MigRent AI"
      metaDescription="MigRent AI press kit - company facts, milestones, media assets, and press contact information."
      toc={toc}
      related={[
        { href: "/about", label: "About MigRent", description: "Our story and mission" },
        { href: "/careers", label: "Careers", description: "Join the team" },
        { href: "/contact", label: "Contact", description: "Get in touch" },
        { href: "/pricing", label: "Pricing", description: "How MigRent earns" },
      ]}
    >
      <PolicySection id="contact" title={t("press.ctaTitle")}>
        <p>{t("press.ctaSubtitle")}</p>
        <div className="not-prose">
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=Press%20Enquiry%20-%20MigRent%20AI" target="_blank" rel="noopener noreferrer">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-8 py-3 rounded-xl">
              {t("press.ctaCta")}
            </motion.span>
          </a>
        </div>
      </PolicySection>

      <PolicySection id="stats" title="Key facts at a glance">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 not-prose">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-4 rounded-2xl text-center">
              <p className="text-2xl font-semibold text-rose-500">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mt-1">{stat.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{stat.detail}</p>
            </motion.div>
          ))}
        </div>
      </PolicySection>

      <PolicySection id="about" title={t("press.aboutTitle")}>
        <p>{t("press.aboutP1")}</p>
        <p>{t("press.aboutP2")}</p>
        <p>{t("press.aboutP3")}</p>
        <div className="card-subtle p-4 rounded-xl space-y-1 not-prose">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{t("press.companyDetails")}</p>
          <p className="text-sm">Business Name: MigRent AI</p>
          <p className="text-sm">ABN: 22 669 566 941</p>
          <p className="text-sm">Structure: Sole Trader</p>
          <p className="text-sm">Headquarters: Sydney, Australia</p>
          <p className="text-sm">Markets: Sydney, Adelaide</p>
        </div>
      </PolicySection>

      <PolicySection id="milestones" title={t("press.milestonesTitle")}>
        <div className="space-y-3 not-prose">
          {milestones.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-5 rounded-2xl flex gap-4 items-start">
              <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg shrink-0">{m.date}</span>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{m.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </PolicySection>

      <PolicySection id="assets" title={t("press.mediaKitTitle")}>
        <p>{t("press.mediaKitIntro")}</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>{t("press.mk1")}</li>
          <li>{t("press.mk2")}</li>
          <li>{t("press.mk3")}</li>
          <li>{t("press.mk4")}</li>
          <li>{t("press.mk5")}</li>
        </ul>
      </PolicySection>

      <PolicySection id="story-angles" title={t("press.userSayTitle")}>
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          <div className="card p-5 rounded-2xl">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-3">
              &quot;{t("press.userSay1")}&quot;
            </p>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">{t("press.userSay1Author")}</p>
          </div>
          <div className="card p-5 rounded-2xl">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-3">
              &quot;{t("press.userSay2")}&quot;
            </p>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">{t("press.userSay2Author")}</p>
          </div>
        </div>
      </PolicySection>
    </PolicyLayout>
  );
}
