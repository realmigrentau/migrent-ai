import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import {
  getArticleBySlug,
  getRelatedArticles,
  getCategoryBySlug,
  type StaticHelpArticle,
} from "../../lib/helpData";
import {
  ChevronRight,
  Clock,
  Users,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  BookOpen,
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
  CheckCircle2,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
  Search: <Search className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  AlertTriangle: <AlertTriangle className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
};

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  guide: { label: "Step-by-step guide", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  faq: { label: "Quick answer", color: "bg-[var(--color-accent-soft)] text-[var(--color-accent)] dark:bg-emerald-900/20 dark:text-[var(--color-accent)]" },
  troubleshoot: { label: "Troubleshooting", color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
  policy: { label: "Policy & Legal", color: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:bg-primary-900/20 dark:text-[var(--color-primary)]" },
  safety: { label: "Safety", color: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:bg-rose-900/20 dark:text-[var(--color-primary)]" },
};

const AUDIENCE_LABEL: Record<string, string> = {
  seeker: "For seekers",
  owner: "For owners",
  both: "Everyone",
};

function renderBody(body: string) {
  const blocks = body.trim().split("\n\n");
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 first:mt-0">
          {block.replace("## ", "")}
        </h2>
      );
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-5 mb-2">
          {block.replace("### ", "")}
        </h3>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- "));
      return (
        <ul key={i} className="space-y-1.5 my-3">
          {items.map((line, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <span>{line.replace(/^- /, "")}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (block.trim() === "") return null;
    return (
      <p key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed my-3">
        {block}
      </p>
    );
  });
}

function RelatedArticleRow({ article }: { article: StaticHelpArticle }) {
  return (
    <Link href={`/help/${article.slug}`}>
      <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
        <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-[var(--color-primary)] transition-colors shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-primary)] transition-colors leading-snug">
            {article.title}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readingTime} min
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
      </div>
    </Link>
  );
}

export default function HelpArticlePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [voted, setVoted] = useState<boolean | null>(null);

  if (!slug || typeof slug !== "string") {
    return null;
  }

  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <DashboardLayout>
        <Head>
          <title>Article not found - MigRent Help</title>
        </Head>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Article not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            This article doesn't exist or may have been moved. Try searching the Help Center.
          </p>
          <Link
            href="/help"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Help Center
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const category = getCategoryBySlug(article.category);
  const related = getRelatedArticles(article, 4);
  const typeBadge = TYPE_BADGE[article.type] || TYPE_BADGE.guide;

  return (
    <DashboardLayout>
      <Head>
        <title>{article.title} - MigRent Help</title>
        <meta name="description" content={article.summary} />
      </Head>

      <div className="max-w-5xl mx-auto pb-16">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">

          {/* Main article column */}
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 flex-wrap">
              <Link href="/help" className="hover:text-[var(--color-primary)] transition-colors font-medium">
                Help Center
              </Link>
              <ChevronRight className="w-3 h-3" />
              {category && (
                <>
                  <Link
                    href={`/help/category/${article.category}`}
                    className="hover:text-[var(--color-primary)] transition-colors font-medium"
                  >
                    {article.categoryName}
                  </Link>
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
              <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                {article.title}
              </span>
            </nav>

            {/* Article header */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${typeBadge.color}`}>
                  {typeBadge.label}
                </span>
                {article.audience !== "both" && (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {AUDIENCE_LABEL[article.audience]}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 leading-tight">
                {article.title}
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                {article.summary}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 pb-6 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readingTime} min read
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Updated {new Date(article.updatedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>

              {/* Body */}
              <div className="mt-6">
                {renderBody(article.body)}
              </div>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">Tags:</span>
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Helpful feedback */}
              <div className="mt-8 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center">
                {voted === null ? (
                  <>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
                      Was this article helpful?
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setVoted(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:bg-[var(--color-accent-soft)] dark:hover:bg-emerald-900/20 text-sm text-slate-600 dark:text-slate-300 transition-colors font-medium"
                      >
                        <ThumbsUp className="w-4 h-4 text-[var(--color-accent)]" />
                        Yes, helpful
                      </button>
                      <button
                        onClick={() => setVoted(false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[var(--color-line-2)] hover:bg-[var(--color-primary-soft)] dark:hover:bg-rose-900/20 text-sm text-slate-600 dark:text-slate-300 transition-colors font-medium"
                      >
                        <ThumbsDown className="w-4 h-4 text-[var(--color-primary)]" />
                        Not helpful
                      </button>
                    </div>
                  </>
                ) : voted ? (
                  <div className="flex items-center justify-center gap-2 text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium text-sm">Thanks for your feedback!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      We'll work on improving this article.
                    </p>
                    <Link
                      href="/support/tickets"
                      className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] dark:text-[var(--color-primary)] hover:underline font-medium"
                    >
                      Contact support for faster help
                    </Link>
                  </div>
                )}
              </div>

              {/* Bottom escalation */}
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-[var(--color-primary-soft)] dark:border-primary-900/40">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  Still need help with this?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Our support team responds within 24 hours.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/support/tickets"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Submit a request
                  </Link>
                  <a
                    href="mailto:support@migrent.com.au"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email support
                  </a>
                </div>
              </div>

              {/* Back link */}
              <div className="mt-6">
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Help Center
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - desktop only */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4">

              {/* Category card */}
              {category && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                  <div className={`bg-gradient-to-br ${category.gradient} p-4`}>
                    <div className="flex items-center gap-2 text-white">
                      {CATEGORY_ICONS[category.icon]}
                      <span className="font-semibold text-sm">{category.name}</span>
                    </div>
                    <p className="text-white/80 text-xs mt-1 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <div className="p-3">
                    <Link
                      href={`/help/category/${category.slug}`}
                      className="flex items-center justify-between text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)] hover:underline"
                    >
                      See all articles in this category
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Related articles */}
              {related.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Related articles</h3>
                  </div>
                  <div className="p-2">
                    {related.map((a) => (
                      <RelatedArticleRow key={a.slug} article={a} />
                    ))}
                  </div>
                </div>
              )}

              {/* Contact card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Contact support
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Can't find what you need? We respond within 24 hours.
                </p>
                <Link
                  href="/support/tickets"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Get help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
