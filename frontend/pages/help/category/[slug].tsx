import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  getCategoryBySlug,
  getArticlesByCategory,
  HELP_CATEGORIES,
  type StaticHelpArticle,
} from "../../../lib/helpData";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  ChevronRight,
  MessageCircle,
  Mail,
  Rocket,
  ShieldCheck,
  Search,
  Home,
  CreditCard,
  AlertTriangle,
  FileText,
  Wrench,
  LayoutGrid,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="w-6 h-6 text-white" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-white" />,
  Search: <Search className="w-6 h-6 text-white" />,
  Home: <Home className="w-6 h-6 text-white" />,
  CreditCard: <CreditCard className="w-6 h-6 text-white" />,
  AlertTriangle: <AlertTriangle className="w-6 h-6 text-white" />,
  FileText: <FileText className="w-6 h-6 text-white" />,
  Wrench: <Wrench className="w-6 h-6 text-white" />,
};

const TYPE_COLORS: Record<string, string> = {
  guide: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  faq: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  troubleshoot: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  policy: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  safety: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
};

const TYPE_LABELS: Record<string, string> = {
  guide: "Guide",
  faq: "FAQ",
  troubleshoot: "Troubleshooting",
  policy: "Policy",
  safety: "Safety",
};

const AUDIENCE_LABEL: Record<string, string> = {
  seeker: "Seekers",
  owner: "Owners",
  both: "Everyone",
};

function ArticleCard({ article, index }: { article: StaticHelpArticle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/help/${article.slug}`}>
        <div className="group p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
              <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 leading-snug">
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {article.summary}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[article.type] || TYPE_COLORS.guide}`}>
                  {TYPE_LABELS[article.type] || "Guide"}
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

export default function HelpCategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  if (!slug || typeof slug !== "string") return null;

  const category = getCategoryBySlug(slug);
  const articles = getArticlesByCategory(slug);

  if (!category) {
    return (
      <DashboardLayout>
        <Head>
          <title>Category not found - MigRent Help</title>
        </Head>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-7 h-7 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Category not found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            This category doesn't exist. Browse all categories in the Help Center.
          </p>
          <Link
            href="/help"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Help Center
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>{category.name} - MigRent Help</title>
        <meta name="description" content={category.description} />
      </Head>

      <div className="max-w-4xl mx-auto pb-16 space-y-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
          <Link href="/help" className="hover:text-indigo-500 transition-colors font-medium">
            Help Center
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">{category.name}</span>
        </nav>

        {/* Category hero */}
        <div className={`rounded-2xl bg-gradient-to-br ${category.gradient} p-7 md:p-10 text-white shadow-lg`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-sm">
              {CATEGORY_ICONS[category.icon]}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">
                {category.name}
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-xl leading-relaxed">
                {category.description}
              </p>
              <p className="text-white/60 text-xs mt-3">
                {articles.length} article{articles.length !== 1 ? "s" : ""} in this category
              </p>
            </div>
          </div>
        </div>

        {/* Articles */}
        {articles.length > 0 ? (
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              All articles
            </h2>
            <div className="space-y-2">
              {articles.map((article, i) => (
                <ArticleCard key={article.slug} article={article} index={i} />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No articles yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Articles for this category are coming soon. Contact support if you need help now.
            </p>
            <Link
              href="/support/tickets"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Contact support
            </Link>
          </div>
        )}

        {/* Other categories */}
        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Other categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {HELP_CATEGORIES.filter((c) => c.slug !== slug).map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={`/help/category/${cat.slug}`}>
                  <div className="group p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all cursor-pointer h-full">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-2 shadow-sm`}>
                      <span className="scale-75">{CATEGORY_ICONS[cat.icon]}</span>
                    </div>
                    <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {cat.articleCount} article{cat.articleCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Escalation */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-900/10 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                Can't find what you need?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Our team responds within 24 hours on business days.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Link
                href="/support/tickets"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Submit a request
              </Link>
              <a
                href="mailto:support@migrent.com.au"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email support
              </a>
            </div>
          </div>
        </div>

        {/* Back link */}
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>
    </DashboardLayout>
  );
}
