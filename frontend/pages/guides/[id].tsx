import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";
import Breadcrumb from "../../components/content/Breadcrumb";
import TableOfContents from "../../components/content/TableOfContents";
import Callout from "../../components/content/Callout";
import ChecklistCard from "../../components/content/ChecklistCard";
import ResourceLinks from "../../components/content/ResourceLinks";
import LastUpdatedBadge from "../../components/content/LastUpdatedBadge";
import QuickAnswer from "../../components/content/QuickAnswer";
import { getGuideById, getAllGuides } from "../../data/guidesContent";
import { Users, Compass, AlertOctagon, ChevronRight } from "lucide-react";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
  Intermediate: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Advanced: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export default function GuidePage() {
  const router = useRouter();
  const { id } = router.query;
  const guide = typeof id === "string" ? getGuideById(id) : undefined;
  const allGuides = getAllGuides();

  if (!guide) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Guide not found</h1>
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
        <title>{guide.title} | MigRent Guides</title>
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
          className="mb-10"
        >
          <div className={`rounded-2xl bg-gradient-to-br ${guide.gradient} p-8 md:p-12 relative overflow-hidden`}>
            <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-white/8 blur-2xl" />
            <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-white/8 blur-xl" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={guide.icon} />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
                  {guide.difficulty}
                </span>
                <span className="text-white/80 text-xs flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {guide.readTime}
                </span>
                {guide.lastUpdated && <LastUpdatedBadge date={guide.lastUpdated} variant="light" />}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white">{guide.title}</h1>
              <p className="text-white/80 text-lg mt-3 max-w-2xl">{guide.description}</p>
              {guide.whoFor && (
                <div className="mt-5 flex items-start gap-2 text-white/90 max-w-2xl">
                  <Users className="w-4 h-4 mt-1 shrink-0 opacity-80" />
                  <span className="text-sm">
                    <span className="font-semibold">Who this is for: </span>
                    {guide.whoFor}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Quick answer */}
            {guide.quickAnswer && (
              <QuickAnswer gradient={guide.gradient}>{guide.quickAnswer}</QuickAnswer>
            )}

            {/* Why it matters */}
            {guide.whyItMatters && (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-5 my-6 flex items-start gap-3">
                <Compass className={`w-5 h-5 ${guide.color} shrink-0 mt-0.5`} />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Why this matters
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {guide.whyItMatters}
                  </p>
                </div>
              </div>
            )}

            {/* Sections */}
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
                  <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${guide.gradient} flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5`}>
                    {i + 1}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
                </div>
                <div className="pl-12 space-y-4">
                  {section.content.map((paragraph, pi) => (
                    <p key={pi} className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}

                  {section.checklist && section.checklist.length > 0 && (
                    <ChecklistCard
                      items={section.checklist}
                      storageKey={`${guide.id}-${section.id}`}
                      gradient={guide.gradient}
                    />
                  )}

                  {section.callouts?.map((c, ci) => (
                    <Callout key={ci} variant={c.variant} title={c.title}>
                      {c.body}
                    </Callout>
                  ))}

                  {section.tip && (
                    <Callout variant="tip">{section.tip}</Callout>
                  )}
                </div>
              </motion.section>
            ))}

            {/* Common mistakes */}
            {guide.commonMistakes && guide.commonMistakes.length > 0 && (
              <section className="mt-10 mb-12">
                <div className="flex items-start gap-4 mb-4">
                  <span className={`w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5`}>
                    <AlertOctagon className="w-4.5 h-4.5 text-white" />
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    Common mistakes to avoid
                  </h2>
                </div>
                <ul className="pl-12 space-y-2">
                  {guide.commonMistakes.map((m, mi) => (
                    <li key={mi} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Official resources */}
            {guide.officialResources && guide.officialResources.length > 0 && (
              <ResourceLinks resources={guide.officialResources} />
            )}

            {/* Disclaimer */}
            {guide.disclaimer && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 my-6 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-700 dark:text-slate-300">Disclaimer.</strong> {guide.disclaimer}
              </div>
            )}

            {/* Related guides */}
            {relatedGuides.length > 0 && (
              <section className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Related guides</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedGuides.slice(0, 3).map((rg) =>
                    rg ? (
                      <Link key={rg.id} href={`/guides/${rg.id}`}>
                        <motion.div
                          whileHover={{ y: -4 }}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow h-full"
                        >
                          <div className={`w-10 h-10 rounded-lg ${rg.bgColor} flex items-center justify-center shrink-0`}>
                            <svg className={`w-5 h-5 ${rg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={rg.icon} />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{rg.title}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {rg.difficulty} &middot; {rg.readTime}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                        </motion.div>
                      </Link>
                    ) : null
                  )}
                </div>
              </section>
            )}

            {/* Help footer */}
            <section className="mt-12 mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Still need help?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Our support team responds in your language. Or browse the Help Center for shorter answers.
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Link href="/help" className="flex-1 sm:flex-none text-center text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition">
                  Help Center
                </Link>
                <Link href="/contact" className="flex-1 sm:flex-none text-center btn-primary text-sm px-4 py-2.5 rounded-xl">
                  Contact us
                </Link>
              </div>
            </section>
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
