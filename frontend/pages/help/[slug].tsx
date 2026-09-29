import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ArrowRight, Mail } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import Prose from "../../components/site/Prose";
import { PageHero, Reveal } from "../../components/site";
import { HELP_ARTICLES, getArticleBySlug, getRelatedArticles } from "../../lib/helpData";
import { supportPromise } from "../../lib/siteIdentity";

/**
 * One help article. Statically rendered for every slug, so the whole help
 * centre is indexable, and laid out like every other reading page: the sky,
 * one column to read, and a short aside with what to read next.
 */

const AUDIENCE: Record<string, string> = { seeker: "For renters", owner: "For hosts", both: "For everyone" };

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: HELP_ARTICLES.map((a) => ({ params: { slug: a.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ slug: string }> = async ({ params }) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  if (!HELP_ARTICLES.some((a) => a.slug === slug)) return { notFound: true };
  return { props: { slug } };
};

export default function HelpArticlePage({ slug }: { slug: string }) {
  const article = getArticleBySlug(slug);
  if (!article) return null;
  const related = getRelatedArticles(article, 4);

  return (
    <>
      <SEOHead
        title={`${article.title} - Help`}
        description={article.summary}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Help", path: "/help" },
          { name: article.categoryName, path: `/help/category/${article.category}` },
          { name: article.title, path: `/help/${article.slug}` },
        ]}
      />

      <PageHero
        narrow
        eyebrow={`${article.categoryName} · ${AUDIENCE[article.audience]}`}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Help", href: "/help" },
          { label: article.categoryName, href: `/help/category/${article.category}` },
          { label: article.title },
        ]}
        title={article.title}
        lead={article.summary}
      />

      <div className="site-section site-section--flush">
        <div className="site-shell site-shell--narrow grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
          <article className="min-w-0">
            <Prose source={article.body} />
            <p className="site-meta mt-10">
              Updated {new Date(article.updatedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </article>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start" aria-label="More help">
            {related.length > 0 && (
              <nav aria-labelledby="related-heading" className="site-card site-card--pad">
                <h2 id="related-heading" className="site-h3">
                  Related
                </h2>
                <ul className="m-0 mt-3 flex list-none flex-col gap-1 p-0">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/help/${r.slug}`} className="site-doc__navlink !px-0 !font-medium">
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <Reveal className="site-card site-card--muted site-card--pad">
              <Mail className="h-5 w-5 text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden="true" />
              <h2 className="site-h3 mt-3">Still need help?</h2>
              <p className="site-body mt-1.5">{supportPromise()}</p>
              <Link href="/contact" className="site-link mt-4">
                Contact us <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            </Reveal>
          </aside>
        </div>
      </div>
    </>
  );
}
