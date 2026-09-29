import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { AlertTriangle, ArrowRight } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import { CloseCard, PageHero, Reveal } from "../../components/site";
import { getAllPosts, getPostBySlug } from "../../data/blogPosts";
import { HIDDEN_POSTS } from "../../data/resources";

/**
 * One article from the Guides index, statically rendered. Posts that are
 * withdrawn for fact-checking (HIDDEN_POSTS) are not built; their URLs
 * redirect to /guides from next.config.ts.
 */

const visiblePosts = () => getAllPosts().filter((p) => !HIDDEN_POSTS.has(p.slug));

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: visiblePosts().map((p) => ({ params: { slug: p.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ slug: string }> = async ({ params }) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  if (!getPostBySlug(slug) || HIDDEN_POSTS.has(slug)) return { notFound: true };
  return { props: { slug } };
};

export default function BlogPost({ slug }: { slug: string }) {
  const post = getPostBySlug(slug);
  if (!post) return null;
  const more = visiblePosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        ogType="article"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      <PageHero
        narrow
        eyebrow={`${post.category} · ${post.readTime}`}
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: post.title }]}
        title={post.title}
        lead={post.excerpt}
      >
        <p className="site-meta mt-6">
          {post.author} · {post.date}
        </p>
      </PageHero>

      <article className="site-section site-section--flush">
        <div className="site-shell site-shell--narrow">
          <div className="site-prose">
            {post.content.map((block, i) => {
              if (block.type === "heading") return <h2 key={i}>{block.content}</h2>;
              if (block.type === "list")
                return (
                  <ul key={i}>
                    {block.content.split("\n").map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              if (block.type === "callout")
                return (
                  <aside key={i} className="site-card site-card--muted site-card--pad flex gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-warn-500)]" strokeWidth={1.9} aria-hidden="true" />
                    <p className="site-body m-0">{block.content}</p>
                  </aside>
                );
              return <p key={i}>{block.content}</p>;
            })}
          </div>

          {more.length > 0 && (
            <nav aria-labelledby="more-heading" className="mt-16 border-t border-[var(--color-line)] pt-10">
              <h2 id="more-heading" className="eyebrow mb-5">
                Keep reading
              </h2>
              <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3">
                {more.map((p, i) => (
                  <Reveal as="li" key={p.slug} delay={i * 0.04}>
                    <Link href={`/blog/${p.slug}`} className="site-card site-card--pad flex h-full flex-col">
                      <p className="site-meta">{p.category}</p>
                      <h3 className="site-h3 mt-2 flex-1">{p.title}</h3>
                      <span className="site-link mt-4 text-[14px]">
                        Read <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </article>

      <CloseCard heading="Looking for a room?" primary={{ label: "Search rooms", href: "/seeker/search" }} secondary={{ label: "All guides", href: "/guides" }} />
    </>
  );
}
