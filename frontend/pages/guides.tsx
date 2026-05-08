import { useMemo, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";
import { Search, Clock, ArrowRight } from "lucide-react";
import { getAllGuides, type GuideCategory, type GuideContent } from "../data/guidesContent";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
  Intermediate: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Advanced: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

type FilterValue = "all" | GuideCategory;

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All guides", value: "all" },
  { label: "New to Australia", value: "newcomer" },
  { label: "For seekers", value: "seeker" },
  { label: "For owners", value: "owner" },
  { label: "Money & bills", value: "money" },
  { label: "Safety", value: "safety" },
  { label: "Legal & visa", value: "legal" },
];

function matchesQuery(guide: GuideContent, q: string): boolean {
  if (!q) return true;
  const haystack = [
    guide.title,
    guide.description,
    guide.whoFor || "",
    guide.quickAnswer || "",
    ...guide.sections.map((s) => s.title),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
}

export default function Guides() {
  const allGuides = getAllGuides();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    return allGuides.filter((g) => {
      if (filter !== "all" && g.category !== filter) return false;
      if (!matchesQuery(g, query)) return false;
      return true;
    });
  }, [allGuides, filter, query]);

  const featured = visible[0];
  const rest = visible.slice(1);

  return (
    <>
      <Head>
        <title>Guides | MigRent</title>
        <meta
          name="description"
          content="Practical guides for migrants and students renting in Australia. How to rent, your rights, bond, scams, inspections, and your first week."
        />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 md:py-20 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-3xl mx-auto px-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-xs font-medium text-blue-600 dark:text-blue-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Practical guides for migrants and students
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Guides that actually help
            </h1>

            <p className="mt-5 text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Honest, no-fluff guides to renting in Australia. Written for international students, working
              holiday makers, and first-time migrants.
            </p>

            {/* Search */}
            <div className="mt-8 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search guides (e.g. bond, scam, first week)"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Category filter pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {FILTERS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFilter(cat.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    filter === cat.value
                      ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                      : "bg-white dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Empty state */}
        {visible.length === 0 && (
          <section className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No guides match that search yet. Try a different keyword or clear the filter.
            </p>
          </section>
        )}

        {/* Featured */}
        {featured && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href={`/guides/${featured.id}`}>
                <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${featured.gradient}`} />
                  <div className="flex flex-col md:flex-row">
                    <div className={`w-full md:w-2/5 bg-gradient-to-br ${featured.gradient} p-8 md:p-10 flex flex-col justify-center min-h-[220px]`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={featured.icon} />
                          </svg>
                        </div>
                        <span className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">
                          Start here
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">{featured.title}</h3>
                      <p className="text-white/80 text-sm mt-2 leading-relaxed">{featured.description}</p>
                    </div>
                    <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${difficultyColors[featured.difficulty]}`}>
                          {featured.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featured.readTime}
                        </span>
                      </div>
                      {featured.quickAnswer && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                          {featured.quickAnswer}
                        </p>
                      )}
                      <div className="mt-5">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                          Read guide
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </section>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((guide, i) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 6) * 0.05, duration: 0.4 }}
                >
                  <Link href={`/guides/${guide.id}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col cursor-pointer"
                    >
                      <div className={`h-1 bg-gradient-to-r ${guide.gradient}`} />
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-11 h-11 rounded-xl ${guide.bgColor} flex items-center justify-center shrink-0`}>
                            <svg className={`w-5 h-5 ${guide.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={guide.icon} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                              {guide.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColors[guide.difficulty]}`}>
                                {guide.difficulty}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {guide.readTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {guide.description}
                        </p>

                        <div className="mt-auto pt-4">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            Read guide
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Help banner */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 p-[1px]"
          >
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 md:p-8 flex flex-col md:flex-row items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cannot find what you need?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  The Help Center has shorter answers. Or contact our team in your language.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Link href="/help" className="flex-1 md:flex-none text-center text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  Help Center
                </Link>
                <Link href="/contact" className="flex-1 md:flex-none text-center btn-primary text-sm px-5 py-2.5 rounded-xl whitespace-nowrap">
                  Contact us
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
