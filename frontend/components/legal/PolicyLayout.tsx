import { ReactNode, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";

type Family = "legal" | "trust" | "company" | "support" | "pricing";

const familyTint: Record<Family, { hero: string; badge: string; text: string }> = {
  legal: {
    hero: "from-slate-50 to-white dark:from-slate-900/40 dark:to-transparent",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    text: "text-slate-500",
  },
  trust: {
    hero: "from-emerald-50/70 to-white dark:from-emerald-500/5 dark:to-transparent",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    text: "text-emerald-600",
  },
  company: {
    hero: "from-amber-50/70 to-white dark:from-amber-500/5 dark:to-transparent",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    text: "text-amber-600",
  },
  support: {
    hero: "from-sky-50/70 to-white dark:from-sky-500/5 dark:to-transparent",
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    text: "text-sky-600",
  },
  pricing: {
    hero: "from-indigo-50/70 to-white dark:from-indigo-500/5 dark:to-transparent",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
    text: "text-indigo-600",
  },
};

export interface TocItem {
  id: string;
  label: string;
}

export interface RelatedLink {
  href: string;
  label: string;
  description?: string;
}

interface PolicyLayoutProps {
  family?: Family;
  eyebrow?: string;
  title: string;
  lede?: string;
  lastUpdated?: string;
  effective?: string;
  version?: string;
  metaTitle?: string;
  metaDescription?: string;
  toc?: TocItem[];
  disclaimer?: ReactNode;
  related?: RelatedLink[];
  contactHref?: string;
  hideHelpful?: boolean;
  children: ReactNode;
}

export default function PolicyLayout({
  family = "legal",
  eyebrow,
  title,
  lede,
  lastUpdated,
  effective,
  version,
  metaTitle,
  metaDescription,
  toc,
  disclaimer,
  related,
  contactHref = "/contact",
  hideHelpful = false,
  children,
}: PolicyLayoutProps) {
  const tint = familyTint[family];
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!toc || toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  return (
    <>
      <Head>
        <title>{metaTitle || `${title} | MigRent AI`}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
      </Head>

      {/* Hero band */}
      <div className={`relative -mx-4 sm:-mx-6 lg:-mx-8 bg-gradient-to-b ${tint.hero} border-b border-slate-200/60 dark:border-slate-800/60`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {eyebrow && (
              <span className={`inline-block text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded-full ${tint.badge} mb-4`}>
                {eyebrow}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white max-w-3xl leading-[1.1]">
              {title}
            </h1>
            {lede && (
              <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {lede}
              </p>
            )}
            {(lastUpdated || effective || version) && (
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                {lastUpdated && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Last updated {lastUpdated}
                  </span>
                )}
                {effective && <span>Effective {effective}</span>}
                {version && <span className="font-mono">v{version}</span>}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-0 sm:px-2 lg:px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-14">
          {/* TOC */}
          {toc && toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400 mb-3">
                  On this page
                </p>
                <nav className="space-y-1">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm py-1.5 pl-3 border-l-2 transition-colors ${
                        activeId === item.id
                          ? "border-slate-900 dark:border-white text-slate-900 dark:text-white font-medium"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Content column */}
          <div className="min-w-0">
            {disclaimer && <div className="mb-8">{disclaimer}</div>}

            {/* Mobile TOC */}
            {toc && toc.length > 0 && (
              <details className="lg:hidden mb-8 card rounded-2xl p-4 group">
                <summary className="text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer flex items-center justify-between">
                  On this page
                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <nav className="mt-3 space-y-1">
                  {toc.map((item) => (
                    <a key={item.id} href={`#${item.id}`} className="block text-sm py-1.5 text-slate-600 dark:text-slate-400">
                      {item.label}
                    </a>
                  ))}
                </nav>
              </details>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-10"
            >
              {children}
            </motion.div>

            {/* Footer block */}
            <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-10">
              {!hideHelpful && <WasThisHelpful contactHref={contactHref} />}
              {related && related.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400 mb-4">
                    Related pages
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {related.map((r) => (
                      <Link
                        key={r.href}
                        href={r.href}
                        className="card rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{r.label}</p>
                            {r.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {r.description}
                              </p>
                            )}
                          </div>
                          <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function WasThisHelpful({ contactHref }: { contactHref: string }) {
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 card-subtle rounded-2xl p-5">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Was this page helpful?</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {choice === "yes" && "Thanks for the feedback."}
          {choice === "no" && (
            <>
              Sorry to hear that. <Link href={contactHref} className="underline">Tell us what's missing</Link>.
            </>
          )}
          {!choice && "Your feedback helps us improve."}
        </p>
      </div>
      {!choice && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChoice("yes")}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => setChoice("no")}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
