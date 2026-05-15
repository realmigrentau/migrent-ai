import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";

const toc = [
  { id: "openings", label: "Open roles" },
  { id: "how-we-work", label: "How we work" },
  { id: "benefits", label: "Benefits" },
  { id: "process", label: "Hiring process" },
  { id: "apply", label: "Apply" },
];

export default function Careers() {
  const { t } = useTranslation();

  const values = [
    { title: t("careers.val1Title"), desc: t("careers.val1Desc"), icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { title: t("careers.val2Title"), desc: t("careers.val2Desc"), icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
    { title: t("careers.val3Title"), desc: t("careers.val3Desc"), icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { title: t("careers.val4Title"), desc: t("careers.val4Desc"), icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
  ];

  return (
    <PolicyLayout
      family="company"
      eyebrow="Careers"
      title={`${t("careers.headline1")} ${t("careers.headlineAccent")}`}
      lede={t("careers.subtitle")}
      metaTitle="Careers | MigRent AI"
      metaDescription="Join MigRent AI - help build the future of accommodation for migrants and students in Australia."
      toc={toc}
      related={[
        { href: "/about", label: "About MigRent", description: "Our story and team" },
        { href: "/press", label: "Press & Media", description: "Company facts and milestones" },
        { href: "/contact", label: "Contact", description: "Get in touch" },
        { href: "/pricing", label: "Pricing", description: "How MigRent earns" },
      ]}
    >
      <PolicySection id="openings" title={t("careers.openingsTitle")}>
        <div className="space-y-3 not-prose">
          <div className="card p-5 rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t("careers.volunteerTitle")}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t("careers.volunteerMeta")}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
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
      </PolicySection>

      <PolicySection id="how-we-work" title={t("careers.teamTitle")}>
        <p>{t("careers.teamP1")}</p>
        <p>{t("careers.teamP2")}</p>
      </PolicySection>

      <PolicySection id="benefits" title={`${t("careers.valuesTitle")} ${t("careers.valuesAccent")}`}>
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          {values.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </PolicySection>

      <PolicySection id="process" title="Hiring process">
        <p>We keep our hiring process light and respectful of your time: an intro chat, a short practical task tied to the role, and a final conversation with the founder. We aim to give a clear yes or no within two weeks.</p>
      </PolicySection>

      <PolicySection id="apply" title={t("careers.ctaTitle")}>
        <p>{t("careers.ctaSubtitle")}</p>
        <div className="not-prose">
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=Careers%20at%20MigRent%20AI" target="_blank" rel="noopener noreferrer">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-8 py-3 rounded-xl">
              {t("careers.ctaCta")}
            </motion.span>
          </a>
        </div>
      </PolicySection>
    </PolicyLayout>
  );
}
