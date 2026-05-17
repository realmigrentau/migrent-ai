import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";
import Breadcrumb from "../../components/content/Breadcrumb";
import { getPostBySlug, getAllPosts, type BlogCategory } from "../../data/blogPosts";

const categoryColors: Record<BlogCategory, string> = {
  Guide: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Market: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
  Safety: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  News: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]",
  Tips: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const post = typeof slug === "string" ? getPostBySlug(slug) : undefined;
  const allPosts = getAllPosts();

  if (!post) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Post not found</h1>
        <Link href="/blog" className="btn-primary px-6 py-2.5 rounded-xl inline-block">
          Back to Blog
        </Link>
      </div>
    );
  }

  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <Head>
        <title>{post.title} | MigRent AI Blog</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <div className="max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.title },
          ]}
        />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category]}`}>
              {post.category}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{post.date}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">&middot;</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{post.readTime}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mt-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center text-white text-sm font-bold">
              {post.author.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">{post.author}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">{post.authorRole}</div>
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-slate-700 mb-10" />

        {/* Content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6"
        >
          {post.content.map((block, i) => {
            switch (block.type) {
              case "heading":
                return (
                  <h2 key={i} className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">
                    {block.content}
                  </h2>
                );
              case "paragraph":
                return (
                  <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                    {block.content}
                  </p>
                );
              case "list":
                return (
                  <ul key={i} className="space-y-2 pl-1">
                    {block.content.split("\n").map((item, li) => (
                      <li key={li} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              case "callout":
                return (
                  <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Important</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{block.content}</p>
                  </div>
                );
              default:
                return null;
            }
          })}
        </motion.article>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Related posts */}
        <section className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">More from the blog</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rp) => (
              <Link key={rp.slug} href={`/blog/${rp.slug}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="card p-4 rounded-xl cursor-pointer hover:shadow-md transition-shadow h-full"
                >
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[rp.category]}`}>
                    {rp.category}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-2">{rp.title}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{rp.date}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
