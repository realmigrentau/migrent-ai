import type { GetStaticPaths, GetStaticProps } from "next";
import { Lightbulb } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import { CloseCard, DocLayout, PageHero } from "../../components/site";
import { getAllGuides, getGuideById } from "../../data/guidesContent";
import { HIDDEN_GUIDES } from "../../data/resources";

/**
 * A step-by-step guide, laid out as a document with its own side menu.
 *
 * Every current guide is withdrawn for rewriting (HIDDEN_GUIDES), so no
 * paths are built and the old URLs redirect to the accurate Help article
 * on the same subject. The page stays so a rewritten guide only needs to
 * leave the hidden list to be published again.
 */

const visibleGuides = () => getAllGuides().filter((g) => !HIDDEN_GUIDES.has(g.id));

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: visibleGuides().map((g) => ({ params: { id: g.id } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ id: string }> = async ({ params }) => {
  const id = typeof params?.id === "string" ? params.id : "";
  if (!getGuideById(id) || HIDDEN_GUIDES.has(id)) return { notFound: true };
  return { props: { id } };
};

export default function GuidePage({ id }: { id: string }) {
  const guide = getGuideById(id);
  if (!guide) return null;

  return (
    <>
      <SEOHead
        title={guide.title}
        description={guide.description}
        ogType="article"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.title, path: `/guides/${guide.id}` },
        ]}
      />

      <PageHero
        eyebrow={`Guide · ${guide.readTime}`}
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: guide.title }]}
        title={guide.title}
        lead={guide.description}
      />

      <DocLayout nav={guide.sections.map((s) => ({ href: `#${s.id}`, label: s.title }))} navLabel="In this guide">
        <div className="flex flex-col gap-12">
          {guide.sections.map((section, i) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28">
              <p className="site-numeral text-[40px] text-[color:var(--color-primary-200)]" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 id={`${section.id}-title`} className="site-h2 mt-2 !text-[clamp(1.5rem,2.4vw,2rem)]">
                {section.title}
              </h2>
              <div className="site-prose mt-5">
                {section.content.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
              {section.tip && (
                <aside className="site-card site-card--muted site-card--pad mt-5 flex gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden="true" />
                  <p className="site-body m-0">{section.tip}</p>
                </aside>
              )}
            </section>
          ))}
        </div>
      </DocLayout>

      <CloseCard heading="Ready to look?" primary={{ label: "Search rooms", href: "/seeker/search" }} secondary={{ label: "All guides", href: "/guides" }} />
    </>
  );
}
