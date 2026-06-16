import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";
import Breadcrumb from "../../components/content/Breadcrumb";
import TableOfContents from "../../components/content/TableOfContents";
import { getGuideById, getAllGuides } from "../../data/guidesContent";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-[var(--color-accent-50)] dark:bg-[var(--color-accent-50)]0/10 text-[var(--color-accent)] dark:text-[var(--color-accent)]",
  Intermediate: "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]",
  Advanced: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]",
};

export default function GuidePage() {
  const router = useRouter();
  const { id } = router.query;
  const guide = typeof id === "string" ? getGuideById(id) : undefined;
  const allGuides = getAllGuides();

  if (!guide) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-4">Guide not found</h1>
        <Link href="/guides" className="btn-primary px-6 py-2.5 rounded-xl inline-block">
          Back to Guides
        </Link>
      </div>
    );
  }

  const relatedGuides = guide.relatedGuides
    .map((rid) => allGuides.find((g) => g.id === rid))
    .filter(Boolean);

  return (
    <>
      <Head>
        <title>{guide.title} | MigRent AI Guides</title>
        <meta name="description" content={guide.description} />
      </Head>

      <div className="max-w-6xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Guides", href: "/guides" },
            { label: guide.title },
          ]}
        />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className={`rounded-2xl bg-[var(--color-primary-soft)] ${guide.gradient} p-8 md:p-12 relative overflow-hidden`}>
            <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-white/8 blur-2xl" />
            <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-white/8 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={guide.icon} />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white`}>
                    {guide.difficulty}
                  </span>
                  <span className="text-white/60 text-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {guide.readTime}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white">{guide.title}</h1>
              <p className="text-white/70 text-lg mt-3 max-w-2xl">{guide.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {guide.sections.map((section, i) => (
              <motion.section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className={`w-8 h-8 rounded-full bg-[var(--color-primary-soft)] ${guide.gradient} flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5`}>
                    {i + 1}
                  </span>
                  <h2 className="text-xl font-bold text-[var(--color-ink)]">{section.title}</h2>
                </div>
                <div className="pl-12 space-y-4">
                  {section.content.map((paragraph, pi) => (
                    <p key={pi} className="text-[var(--color-ink-2)] leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                  {section.tip && (
                    <div className={`rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 mt-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <svg className={`w-4 h-4 ${guide.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-sm font-semibold text-[var(--color-ink-2)]">Tip</span>
                      </div>
                      <p className="text-sm text-[var(--color-ink-3)]">{section.tip}</p>
                    </div>
                  )}
                </div>
              </motion.section>
            ))}

            {/* Related guides */}
            {relatedGuides.length > 0 && (
              <section className="mt-16 pt-8 border-t border-[var(--color-line)]">
                <h3 className="text-lg font-bold text-[var(--color-ink)] mb-4">Related Guides</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedGuides.map((rg) =>
                    rg ? (
                      <Link key={rg.id} href={`/guides/${rg.id}`}>
                        <motion.div
                          whileHover={{ y: -4 }}
                          className="card p-4 rounded-xl flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className={`w-10 h-10 rounded-lg ${rg.bgColor} flex items-center justify-center shrink-0`}>
                            <svg className={`w-5 h-5 ${rg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={rg.icon} />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[var(--color-ink)]">{rg.title}</div>
                            <div className="text-xs text-[var(--color-ink-3)] mt-0.5">
                              {rg.difficulty} &middot; {rg.readTime}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ) : null
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0 hidden lg:block">
            <TableOfContents
              items={guide.sections.map((s) => ({ id: s.id, title: s.title }))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
