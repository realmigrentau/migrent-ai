import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { getHelpArticle, voteHelpArticle, type HelpArticle } from "../../lib/api";

export default function HelpArticlePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<boolean | null>(null);

  useEffect(() => {
    if (!slug || typeof slug !== "string") return;
    (async () => {
      const data = await getHelpArticle(slug);
      setArticle(data);
      setLoading(false);
    })();
  }, [slug]);

  async function handleVote(helpful: boolean) {
    if (!article || voted !== null) return;
    setVoted(helpful);
    await voteHelpArticle(article.id, helpful);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="space-y-2 mt-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Article not found</h1>
        <p className="text-slate-500 mb-4">The article you're looking for doesn't exist.</p>
        <Link href="/help" className="text-rose-500 hover:text-rose-600 font-medium">
          Back to Help Center
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} - MigRent Help</title>
        <meta name="description" content={article.body.slice(0, 160)} />
      </Head>

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/help" className="hover:text-rose-500 transition-colors">Help Center</Link>
          <span>/</span>
          {article.category_name && (
            <>
              <Link
                href={`/help?category=${article.category_slug || ""}`}
                className="hover:text-rose-500 transition-colors"
              >
                {article.category_name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-600 dark:text-slate-300 truncate">{article.title}</span>
        </nav>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-8">
          <span className="capitalize">{article.audience === "both" ? "Everyone" : `For ${article.audience}s`}</span>
          <span>|</span>
          <span>{article.view_count} views</span>
          <span>|</span>
          <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
        </div>

        {/* Body (Markdown) */}
        <article className="prose prose-slate dark:prose-invert prose-sm max-w-none mb-10">
          {/* Simple markdown rendering - split by \n\n for paragraphs, ## for headings */}
          {article.body.split("\n\n").map((block, i) => {
            if (block.startsWith("## ")) {
              return <h2 key={i} className="text-lg font-bold mt-6 mb-2">{block.replace("## ", "")}</h2>;
            }
            if (block.startsWith("### ")) {
              return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{block.replace("### ", "")}</h3>;
            }
            if (block.startsWith("- ")) {
              return (
                <ul key={i} className="list-disc pl-5 space-y-1">
                  {block.split("\n").map((line, j) => (
                    <li key={j}>{line.replace(/^- /, "")}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i}>{block}</p>;
          })}
        </article>

        {/* Helpful? */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center mb-8">
          {voted === null ? (
            <>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Was this article helpful?</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleVote(true)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Yes, helpful
                </button>
                <button
                  onClick={() => handleVote(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                  Not helpful
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              {voted ? "Thanks for your feedback!" : "Sorry to hear that. We'll work on improving this article."}
            </p>
          )}
        </div>

        {/* Back link */}
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Help Center
        </Link>
      </div>
    </>
  );
}
