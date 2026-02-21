import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Head from "next/head";
import { getAllPosts, type BlogCategory } from "../../data/blogPosts";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const categoryColors: Record<BlogCategory, string> = {
  Guide: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Market: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
  Safety: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  News: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Tips: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const categories: (BlogCategory | "All")[] = ["All", "Guide", "Market", "Safety", "News", "Tips"];

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "All">("All");
  const allPosts = getAllPosts();
  const filteredPosts = activeCategory === "All" ? allPosts : allPosts.filter((p) => p.category === activeCategory);

  return (
    <>
      <Head>
        <title>Blog | MigRent AI</title>
        <meta name="description" content="Tips, news, and community stories for migrants finding housing in Australia." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-20 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/15 dark:bg-rose-500/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/12 dark:bg-purple-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              MigRent Blog
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Tips, News & Stories
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Practical advice and community stories to help you navigate housing in Australia.
            </p>

            {/* Category filter pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {cat === "All" ? "All Posts" : cat}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Posts grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i % 6}
                variants={fadeUp}
              >
                <Link href={`/blog/${post.slug}`}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col"
                  >
                    {/* Gradient top bar */}
                    <div className="h-1.5 bg-gradient-to-r from-rose-500 to-purple-500" />

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category]}`}>
                          {post.category}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{post.date}</span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed flex-1">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {post.author} &middot; {post.readTime}
                        </div>
                        <span className="text-xs font-medium text-rose-500 dark:text-rose-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Read
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 dark:text-slate-500">No posts found in this category.</p>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Want to contribute?
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Have a story or tip to share? We&apos;d love to feature your experience.
            </p>
            <Link href="/contact">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block mt-6 btn-primary text-base px-8 py-3.5 rounded-xl">
                Get in Touch
              </motion.span>
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  );
}
