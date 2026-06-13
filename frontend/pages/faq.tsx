import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useTranslation } from "react-i18next";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-muted)] transition-colors"
      >
        <h3 className="font-semibold text-[var(--color-ink)] text-sm pr-4">{q}</h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[var(--color-ink-3)] shrink-0"
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
            <p className="px-4 pb-4 text-sm text-[var(--color-ink-3)] leading-relaxed">{a}</p>
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

  return (
    <>
      <Head>
        <title>FAQ | MigRent AI</title>
        <meta name="description" content="Frequently asked questions about MigRent AI - payments, listings, verification, accounts, and more." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10 border border-[var(--color-line-2)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-warn-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                {t("faq.title")} {t("faq.titleAccent")}
              </h1>
              <p className="text-sm text-[var(--color-ink-3)] mt-1">{faqCategories.reduce((sum, cat) => sum + cat.items.length, 0)}+ {t("faq.countSuffix")}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <input
              type="text"
              placeholder={t("faq.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-10">
          {filteredCategories.map((category) => (
            <section key={category.title} className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">{category.title}</h2>
              <div className="space-y-2">
                {category.items.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </section>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[var(--color-ink-3)] text-sm">{t("faq.noResults")} <Link href="/contact" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">{t("faq.contactUs")}</Link>.</p>
            </div>
          )}

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-[var(--color-primary-soft)] bg-[var(--color-warn-50)] border-[var(--color-line-2)] text-center">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">{t("faq.stillTitle")}</h3>
            <p className="text-sm text-[var(--color-ink-2)] mb-4">{t("faq.stillSubtitle")}</p>
            <Link href="/contact">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                {t("faq.stillCta")}
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
