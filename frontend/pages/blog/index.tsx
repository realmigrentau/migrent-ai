import { useState } from "react";
import Link from "next/link";
import SEOHead from "../../components/SEOHead";
import { motion, type Variants } from "framer-motion";
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
  Guide: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]",
  Market: "bg-[var(--color-accent-50)] dark:bg-[var(--color-accent)]/10 text-[var(--color-accent)] dark:text-[var(--color-accent)]",
  Safety: "bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-500)]/10 text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]",
  News: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]",
  Tips: "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]",
};

const categories: (BlogCategory | "All")[] = ["All", "Guide", "Market", "Safety", "News", "Tips"];

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "All">("All");
  const allPosts = getAllPosts();
  const filteredPosts = activeCategory === "All" ? allPosts : allPosts.filter((p) => p.category === activeCategory);

  return (
    <>
      <SEOHead title="Blog" description="Tips, news, and community stories for migrants finding housing in Australia." />

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-20 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary)]/15 dark:bg-[var(--color-primary)]/8 hidden " />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--color-primary)]/12 dark:bg-[var(--color-primary)]/6 hidden " style={{ animationDelay: "1s" }} />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              MigRent Blog
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              <span className="text-[color:var(--color-primary)]">
                Tips, News & Stories
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[var(--color-ink-3)] max-w-2xl mx-auto leading-relaxed">
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
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                      : "bg-white dark:bg-white/5 border-[var(--color-line)] text-[var(--color-ink-2)] hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-line-2)]"
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
                    <div className="h-1.5 bg-[var(--color-primary)] from-[var(--color-primary)] to-[var(--color-primary)]" />

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category]}`}>
                          {post.category}
                        </span>
                        <span className="text-[10px] text-[var(--color-ink-3)]">{post.date}</span>
                      </div>

                      <h3 className="text-lg font-bold text-[var(--color-ink)] group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-primary)] transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-sm text-[var(--color-ink-3)] mt-2 leading-relaxed flex-1">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-line)]">
                        <div className="text-xs text-[var(--color-ink-3)]">
                          {post.author} &middot; {post.readTime}
                        </div>
                        <span className="text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)] group-hover:translate-x-1 transition-transform flex items-center gap-1">
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
              <p className="text-[var(--color-ink-3)]">No posts found in this category.</p>
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
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-ink)]">
              Want to contribute?
            </h2>
            <p className="mt-3 text-[var(--color-ink-3)]">
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
