import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getArticleBySlug,
  getRelatedArticles,
  getCategoryBySlug,
  type StaticHelpArticle,
} from "../../lib/helpData";
import { HELP_ARTICLES } from "../../lib/helpData";
import type { GetStaticPaths, GetStaticProps } from "next";
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
  guide: { label: "Step-by-step guide", color: "bg-[var(--color-primary-50)] text-[var(--color-primary)] dark:bg-[var(--color-surface-muted)] dark:text-[var(--color-primary)]" },
  faq: { label: "Quick answer", color: "bg-[var(--color-accent-soft)] text-[var(--color-accent)] dark:bg-[var(--color-surface-muted)] dark:text-[var(--color-accent)]" },
  troubleshoot: { label: "Troubleshooting", color: "bg-[var(--color-warn-50)] text-[var(--color-warn-600)] dark:bg-[var(--color-surface-muted)] dark:text-[var(--color-warn-500)]" },
  policy: { label: "Policy & Legal", color: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:bg-primary-900/20 dark:text-[var(--color-primary)]" },
  safety: { label: "Safety", color: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:bg-[var(--color-surface-muted)] dark:text-[var(--color-primary)]" },
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
        <h2 key={i} className="text-xl font-bold text-[var(--color-ink)] mt-8 mb-3 first:mt-0">
          {block.replace("## ", "")}
        </h2>
      );
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="text-base font-semibold text-[var(--color-ink)] mt-5 mb-2">
          {block.replace("### ", "")}
        </h3>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- "));
      return (
        <ul key={i} className="space-y-1.5 my-3">
          {items.map((line, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-[var(--color-ink-2)] leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <span>{line.replace(/^- /, "")}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (block.trim() === "") return null;
    return (
      <p key={i} className="text-sm text-[var(--color-ink-2)] leading-relaxed my-3">
        {block}
      </p>
    );
  });
}

function RelatedArticleRow({ article }: { article: StaticHelpArticle }) {
  return (
    <Link href={`/help/${article.slug}`}>
      <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--color-surface)]/50 transition-colors cursor-pointer">
        <BookOpen className="w-4 h-4 text-[var(--color-ink-3)] group-hover:text-[var(--color-primary)] transition-colors shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-ink-2)] group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-primary)] transition-colors leading-snug">
            {article.title}
          </p>
          <p className="text-[11px] text-[var(--color-ink-3)] mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readingTime} min
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--color-ink-4)] group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
      </div>
    </Link>
  );
}

/**
 * Statically render each help article.
 *
 * The slug came from router.query, which is empty at prerender, so the page
 * returned null and every help URL shipped an empty document. A help centre is
 * one of the highest-intent search surfaces a product has, and none of it was
 * indexable.
 */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: HELP_ARTICLES.map((a) => ({ params: { slug: a.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  if (!HELP_ARTICLES.some((a) => a.slug === slug)) return { notFound: true };
  return { props: { slug } };
};

export default function HelpArticlePage({ slug }: { slug: string }) {
  const [voted, setVoted] = useState<boolean | null>(null);

  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Head>
          <title>Article not found - MigRent Help</title>
        </Head>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-muted)] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-[var(--color-ink-3)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-2">
            Article not found
          </h1>
          <p className="text-[var(--color-ink-3)] mb-6 text-sm">
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
      </div>
    );
  }

  const category = getCategoryBySlug(article.category);
  const related = getRelatedArticles(article, 4);
  const typeBadge = TYPE_BADGE[article.type] || TYPE_BADGE.guide;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Head>
        <title>{article.title} - MigRent Help</title>
        <meta name="description" content={article.summary} />
      </Head>

      <div className="max-w-5xl mx-auto pb-16">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">

          {/* Main article column */}
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-[var(--color-ink-3)] mb-6 flex-wrap">
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
              <span className="text-[var(--color-ink-2)] truncate max-w-[200px]">
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
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-3)] flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {AUDIENCE_LABEL[article.audience]}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-[var(--color-ink)] mb-3 leading-tight">
                {article.title}
              </h1>

              <p className="text-sm text-[var(--color-ink-3)] mb-4 leading-relaxed">
                {article.summary}
              </p>

              <div className="flex items-center gap-4 text-xs text-[var(--color-ink-3)] pb-6 border-b border-[var(--color-line)]">
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
                <div className="flex items-center gap-2 flex-wrap mt-8 pt-6 border-t border-[var(--color-line)]">
                  <span className="text-xs text-[var(--color-ink-3)]">Tags:</span>
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-[var(--color-ink-3)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Helpful feedback */}
              <div className="mt-8 p-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]/40 text-center">
                {voted === null ? (
                  <>
                    <p className="text-sm font-semibold text-[var(--color-ink)] mb-3">
                      Was this article helpful?
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setVoted(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] dark:hover:bg-[var(--color-surface-muted)] text-sm text-[var(--color-ink-2)] transition-colors font-medium"
                      >
                        <ThumbsUp className="w-4 h-4 text-[var(--color-accent)]" />
                        Yes, helpful
                      </button>
                      <button
                        onClick={() => setVoted(false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] hover:border-[var(--color-line-2)] hover:bg-[var(--color-primary-soft)] dark:hover:bg-[var(--color-surface-muted)] text-sm text-[var(--color-ink-2)] transition-colors font-medium"
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
                    <p className="text-sm font-medium text-[var(--color-ink-2)]">
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
              <div className="mt-6 p-5 rounded-2xl bg-[var(--color-primary)] from-[var(--color-primary-50)] to-[var(--color-primary-50)] dark:from-primary-900/20 dark:to-[var(--color-surface-muted)] border border-[var(--color-primary-soft)] dark:border-primary-900/40">
                <h3 className="font-bold text-[var(--color-ink)] text-sm mb-1">
                  Still need help with this?
                </h3>
                <p className="text-xs text-[var(--color-ink-3)] mb-3">
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-muted)] border border-[var(--color-line)] text-[var(--color-ink-2)] rounded-lg text-xs font-semibold transition-colors"
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
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-3)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors font-medium"
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
                <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-2)] overflow-hidden">
                  <div className={`bg-[var(--color-primary-soft)] ${category.gradient} p-4`}>
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
                <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-2)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--color-line)]">
                    <h3 className="font-bold text-sm text-[var(--color-ink)]">Related articles</h3>
                  </div>
                  <div className="p-2">
                    {related.map((a) => (
                      <RelatedArticleRow key={a.slug} article={a} />
                    ))}
                  </div>
                </div>
              )}

              {/* Contact card */}
              <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-2)] p-4">
                <h3 className="font-bold text-sm text-[var(--color-ink)] mb-1">
                  Contact support
                </h3>
                <p className="text-xs text-[var(--color-ink-3)] mb-3">
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
    </div>
  );
}
