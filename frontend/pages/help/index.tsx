import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { getHelpCategories, getHelpArticles, type HelpCategory, type HelpArticle } from "../../lib/api";

const iconPaths: Record<string, string> = {
  Rocket: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3m3 3a22 22 0 004-13 22 22 0 00-13 4m9 9l-3-3m0 0l-4 4m7-7l4-4",
  Search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  Home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  CreditCard: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  ShieldCheck: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  Bug: "M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0M12 9V6m0 12v-3M9 9H6m12 0h-3M9 15H6m12 0h-3",
};

const categoryColors = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-purple-500 to-purple-600",
  "from-red-500 to-red-600",
  "from-cyan-500 to-cyan-600",
];

export default function HelpCenter() {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [catRes, artRes] = await Promise.all([
        getHelpCategories(),
        getHelpArticles(),
      ]);
      setCategories(catRes?.categories || []);
      setArticles(artRes?.articles || []);
      setLoading(false);
    })();
  }, []);

  // Search
  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(async () => {
      const res = await getHelpArticles({ query: query.trim() });
      setArticles(res?.articles || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <Head>
        <title>Help Center - MigRent</title>
        <meta name="description" content="Find answers to common questions about using MigRent." />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
            How can we help?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Search our help articles or browse by category
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {!query && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {categories.map((cat, i) => (
              <Link key={cat.id} href={`/help?category=${cat.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 bg-white dark:bg-slate-900 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryColors[i % categoryColors.length]} flex items-center justify-center mb-3`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[cat.icon || "Search"] || iconPaths.Search} />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{cat.article_count} articles</p>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        {/* Articles List */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {query ? `Results for "${query}"` : "All Articles"}
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="space-y-2">
              {articles.map((a) => (
                <Link key={a.id} href={`/help/${a.slug}`}>
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 bg-white dark:bg-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                      {a.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-slate-400 capitalize">{a.audience}</span>
                      <span className="text-xs text-slate-300 dark:text-slate-600">|</span>
                      <span className="text-xs text-slate-400">{a.view_count} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-500">No articles found.</p>
              <Link href="/support/tickets" className="text-sm text-rose-500 hover:text-rose-600 font-medium mt-2 inline-block">
                Contact support instead
              </Link>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-100 dark:border-rose-900/40 text-center">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Still need help?</h3>
          <p className="text-sm text-slate-500 mb-4">Our team typically responds within 24 hours.</p>
          <Link
            href="/support/tickets"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Submit a Request
          </Link>
        </div>
      </div>
    </>
  );
}
