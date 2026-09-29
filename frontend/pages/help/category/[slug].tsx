import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ArrowRight } from "lucide-react";
import SEOHead from "../../../components/SEOHead";
import { CloseCard, PageHero, Reveal } from "../../../components/site";
import { HELP_CATEGORIES, getArticlesByCategory, getCategoryBySlug } from "../../../lib/helpData";
import { supportPromise } from "../../../lib/siteIdentity";

/**
 * One help topic and its articles. Statically rendered per topic: the old
 * page read the slug from the router, which is empty during prerender, so
 * every topic URL shipped an empty document.
 */

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: HELP_CATEGORIES.map((c) => ({ params: { slug: c.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ slug: string }> = async ({ params }) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  if (!getCategoryBySlug(slug)) return { notFound: true };
  return { props: { slug } };
};

export default function HelpCategoryPage({ slug }: { slug: string }) {
  const category = getCategoryBySlug(slug);
  if (!category) return null;
  const articles = getArticlesByCategory(slug);
  const others = HELP_CATEGORIES.filter((c) => c.slug !== slug && c.articleCount > 0);

  return (
    <>
      <SEOHead
        title={`${category.name} - Help`}
        description={category.description}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Help", path: "/help" },
          { name: category.name, path: `/help/category/${category.slug}` },
        ]}
      />

      <PageHero
        eyebrow="Help topic"
        crumbs={[{ label: "Home", href: "/" }, { label: "Help", href: "/help" }, { label: category.name }]}
        title={category.name}
        lead={category.description}
      />

      <section className="site-section site-section--flush" aria-label={`${category.name} articles`}>
        <div className="site-shell">
          {articles.length === 0 ? (
            <p className="site-body">
              Nothing here yet. <Link href="/help" className="underline underline-offset-2">Back to Help</Link>
            </p>
          ) : (
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a, i) => (
                <Reveal as="li" key={a.slug} delay={(i % 3) * 0.04}>
                  <Link href={`/help/${a.slug}`} className="site-card site-card--pad flex h-full flex-col">
                    <h2 className="site-h3">{a.title}</h2>
                    <p className="site-body mt-1.5 flex-1">{a.summary}</p>
                    <span className="site-link mt-4 text-[14px]">
                      Read <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}

          {others.length > 0 && (
            <nav aria-labelledby="other-topics" className="mt-14">
              <h2 id="other-topics" className="eyebrow mb-4">
                Other topics
              </h2>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {others.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/help/category/${c.slug}`} className="site-chip !h-10 !px-4">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      <CloseCard heading="Can't find it?" lead={supportPromise()} primary={{ label: "Contact us", href: "/contact" }} secondary={{ label: "All help", href: "/help" }} />
    </>
  );
}
