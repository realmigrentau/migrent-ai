import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { useDashboard } from "../../hooks/useDashboard";
import {
  HELP_CATEGORIES,
  QUICK_FAQS,
  POPULAR_SEARCHES,
  getFeaturedArticles,
  searchArticles,
  type StaticHelpArticle,
} from "../../lib/helpData";
import {
  Rocket,
  ShieldCheck,
  Search,
  Home,
  CreditCard,
  AlertTriangle,
  FileText,
  Wrench,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Mail,
  ArrowRight,
  BookOpen,
  Clock,
  Users,
  Zap,
  X,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="w-5 h-5 text-white" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-white" />,
  Search: <Search className="w-5 h-5 text-white" />,
  Home: <Home className="w-5 h-5 text-white" />,
  CreditCard: <CreditCard className="w-5 h-5 text-white" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5 text-white" />,
  FileText: <FileText className="w-5 h-5 text-white" />,
  Wrench: <Wrench className="w-5 h-5 text-white" />,
};

const AUDIENCE_LABEL: Record<string, string> = {
  seeker: "For seekers",
  owner: "For owners",
  both: "Everyone",
};

const TYPE_COLORS: Record<string, string> = {
  guide: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  faq: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  troubleshoot: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  policy: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  safety: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
};

function FAQItem({ faq, index }: { faq: typeof QUICK_FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-medium text-sm text-slate-900 dark:text-white pr-4">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ArticleCard({ article, index }: { article: StaticHelpArticle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/help/${article.slug}`}>
        <div className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 leading-snug">
                {article.title}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed mb-2">
                {article.summary}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[article.type] || TYPE_COLORS.guide}`}>
                  {article.type === "faq" ? "FAQ" : article.type.charAt(0).toUpperCase() + article.type.slice(1)}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  {article.readingTime} min read
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Users className="w-3 h-3" />
                  {AUDIENCE_LABEL[article.audience]}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HelpCenter() {
  const { role } = useDashboard();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StaticHelpArticle[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const featuredArticles = getFeaturedArticles(role);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      const results = searchArticles(query);
      setSearchResults(results);
      setSearching(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const showSearch = query.trim().length > 0;

  return (
    <DashboardLayout>
      <Head>
        <title>Help Center - MigRent</title>
        <meta name="description" content="Find answers to common questions about MigRent - search, browse categories, or contact support." />
      </Head>

      <div className="max-w-4xl mx-auto space-y-10 pb-16">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 p-8 md:p-12 text-white shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-20 -translate-y-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-16 translate-y-16" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium mb-4">
              <Zap className="w-3 h-3" />
              Support Center
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
              How can we help?
            </h1>
            <p className="text-indigo-100 text-sm md:text-base mb-6 max-w-lg">
              Search our help articles, browse by category, or contact our support team.
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for help - e.g. verify identity, cancel booking..."
                className="w-full pl-12 pr-10 py-3.5 rounded-xl text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg placeholder:text-slate-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Popular searches */}
            {!showSearch && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-indigo-200 text-xs self-center">Popular:</span>
                {POPULAR_SEARCHES.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); searchRef.current?.focus(); }}
                    className="text-xs px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors text-white border border-white/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search results */}
        <AnimatePresence mode="wait">
          {showSearch && (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {searching
                    ? "Searching..."
                    : searchResults.length > 0
                    ? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${query}"`
                    : `No results for "${query}"`}
                </h2>
                <button
                  onClick={() => setQuery("")}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Clear search
                </button>
              </div>

              {searching && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((a, i) => (
                    <ArticleCard key={a.slug} article={a} index={i} />
                  ))}
                </div>
              )}

              {!searching && searchResults.length === 0 && (
                <div className="text-center py-12 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No results found</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    We couldn't find an article matching "{query}". Try different keywords or browse the categories below.
                  </p>
                  <Link
                    href="/support/tickets"
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Contact support instead
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content - hidden during search */}
        {!showSearch && (
          <>
            {/* Categories */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Browse by category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {HELP_CATEGORIES.map((cat, i) => (
                  <motion.div
                    key={cat.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link href={`/help/category/${cat.slug}`}>
                      <div className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer h-full">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                          {CATEGORY_ICONS[cat.icon]}
                        </div>
                        <h3 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 leading-snug">
                          {cat.name}
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          {cat.articleCount} article{cat.articleCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Featured / recommended for your role */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {role === "owner" ? "Owner essentials" : "Recommended for you"}
                </h2>
                <Link
                  href={`/help/category/getting-started`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  See all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {featuredArticles.map((article, i) => (
                  <ArticleCard key={article.slug} article={article} index={i} />
                ))}
              </div>
            </section>

            {/* Quick FAQ accordion */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Quick answers
              </h2>
              <div className="space-y-2">
                {QUICK_FAQS.map((faq, i) => (
                  <FAQItem key={i} faq={faq} index={i} />
                ))}
              </div>
            </section>

            {/* Escalation / Contact support */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-900/10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      Still need help?
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Our support team is here for you. We typically respond within 24 hours on business days.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <Link
                      href="/support/tickets"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Submit a request
                    </Link>
                    <a
                      href="mailto:support@migrent.com.au"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Email support
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">24h</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Response time</p>
                  </div>
                  <div className="text-center border-x border-slate-200 dark:border-slate-700">
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">5 days</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mon - Fri support</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">AU</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Australia-based</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
