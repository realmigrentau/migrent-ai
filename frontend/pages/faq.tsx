import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import PolicyLayout from "../components/legal/PolicyLayout";

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm pr-4">{q}</h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 shrink-0"
        >
          &#x25BE;
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const faqCategories = [
    {
      title: t("faq.cat1Title"),
      color: "rose",
      items: [
        { q: t("faq.cat1q1"), a: t("faq.cat1a1") },
        { q: t("faq.cat1q2"), a: t("faq.cat1a2") },
        { q: t("faq.cat1q3"), a: t("faq.cat1a3") },
        { q: t("faq.cat1q4"), a: t("faq.cat1a4") },
        { q: t("faq.cat1q5"), a: t("faq.cat1a5") },
        { q: t("faq.cat1q6"), a: t("faq.cat1a6") },
      ],
    },
    {
      title: t("faq.cat2Title"),
      color: "rose",
      items: [
        { q: t("faq.cat2q1"), a: t("faq.cat2a1") },
        { q: t("faq.cat2q2"), a: t("faq.cat2a2") },
        { q: t("faq.cat2q3"), a: t("faq.cat2a3") },
        { q: t("faq.cat2q4"), a: t("faq.cat2a4") },
        { q: t("faq.cat2q5"), a: t("faq.cat2a5") },
        { q: t("faq.cat2q6"), a: t("faq.cat2a6") },
        { q: t("faq.cat2q7"), a: t("faq.cat2a7") },
        { q: t("faq.cat2q8"), a: t("faq.cat2a8") },
      ],
    },
    {
      title: t("faq.cat3Title"),
      color: "blue",
      items: [
        { q: t("faq.cat3q1"), a: t("faq.cat3a1") },
        { q: t("faq.cat3q2"), a: t("faq.cat3a2") },
        { q: t("faq.cat3q3"), a: t("faq.cat3a3") },
        { q: t("faq.cat3q4"), a: t("faq.cat3a4") },
        { q: t("faq.cat3q5"), a: t("faq.cat3a5") },
        { q: t("faq.cat3q6"), a: t("faq.cat3a6") },
        { q: t("faq.cat3q7"), a: t("faq.cat3a7") },
        { q: t("faq.cat3q8"), a: t("faq.cat3a8") },
      ],
    },
    {
      title: t("faq.cat4Title"),
      color: "emerald",
      items: [
        { q: t("faq.cat4q1"), a: t("faq.cat4a1") },
        { q: t("faq.cat4q2"), a: t("faq.cat4a2") },
        { q: t("faq.cat4q3"), a: t("faq.cat4a3") },
        { q: t("faq.cat4q4"), a: t("faq.cat4a4") },
        { q: t("faq.cat4q5"), a: t("faq.cat4a5") },
        { q: t("faq.cat4q6"), a: t("faq.cat4a6") },
      ],
    },
    {
      title: t("faq.cat5Title"),
      color: "emerald",
      items: [
        { q: t("faq.cat5q1"), a: t("faq.cat5a1") },
        { q: t("faq.cat5q2"), a: t("faq.cat5a2") },
        { q: t("faq.cat5q3"), a: t("faq.cat5a3") },
        { q: t("faq.cat5q4"), a: t("faq.cat5a4") },
        { q: t("faq.cat5q5"), a: t("faq.cat5a5") },
        { q: t("faq.cat5q6"), a: t("faq.cat5a6") },
      ],
    },
    {
      title: t("faq.cat6Title"),
      color: "slate",
      items: [
        { q: t("faq.cat6q1"), a: t("faq.cat6a1") },
        { q: t("faq.cat6q2"), a: t("faq.cat6a2") },
        { q: t("faq.cat6q3"), a: t("faq.cat6a3") },
        { q: t("faq.cat6q4"), a: t("faq.cat6a4") },
        { q: t("faq.cat6q5"), a: t("faq.cat6a5") },
        { q: t("faq.cat6q6"), a: t("faq.cat6a6") },
      ],
    },
  ];

  const filteredCategories = faqCategories.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  const totalCount = faqCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <PolicyLayout
      family="support"
      eyebrow="Help center"
      title={`${t("faq.title")} ${t("faq.titleAccent")}`}
      lede={`Answers to common questions about MigRent. ${totalCount}+ topics covering payments, listings, verification, accounts, and safety.`}
      metaTitle="FAQ | MigRent AI"
      metaDescription="Frequently asked questions about MigRent AI - payments, listings, verification, accounts, and more."
      related={[
        { href: "/contact", label: "Contact support", description: "Talk to a real human" },
        { href: "/help", label: "Help center", description: "Guides and how-tos" },
        { href: "/pricing", label: "Pricing", description: "Simple, flat fees" },
        { href: "/about", label: "About MigRent", description: "Our story and mission" },
      ]}
    >
      <div className="mb-2">
        <input
          type="text"
          placeholder={t("faq.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="space-y-10">
        {filteredCategories.map((category) => (
          <section key={category.title} className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{category.title}</h2>
            <div className="space-y-2">
              {category.items.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t("faq.noResults")}{" "}
              <Link href="/contact" className={accent}>{t("faq.contactUs")}</Link>.
            </p>
          </div>
        )}

        <div className="card p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-600/5 border-amber-200 dark:border-amber-500/20 text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t("faq.stillTitle")}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{t("faq.stillSubtitle")}</p>
          <Link href="/contact">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
              {t("faq.stillCta")}
            </motion.span>
          </Link>
        </div>
      </div>
    </PolicyLayout>
  );
}
