import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, Compass, Scale, Search, type LucideIcon } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import { CloseCard, PageHero, Reveal, SectionHead } from "../../components/site";
import {
  RESOURCE_ARTICLES,
  RESOURCE_TOOLS,
  getFeaturedArticle,
  getUsedCategories,
  type ResourceCategory,
} from "../../data/resources";

/**
 * Guides: everything written, in one place.
 *
 * Replaces /resources, /resources/guides, /resources/tools and /blog. The
 * index is derived from data/guidesContent.ts and data/blogPosts.ts through
 * data/resources.ts, so a card can only ever point at a page that exists.
 * Article URLs (/guides/:id, /blog/:slug) are unchanged.
 */

const TOOL_ICON: Record<string, LucideIcon> = { scales: Scale, compass: Compass, calculator: Calculator };
const PAGE = 9;

export default function Guides() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ResourceCategory | "All">("All");
  const [shown, setShown] = useState(PAGE);
  const deferred = useDeferredValue(query);
  const categories = getUsedCategories();
  const featured = getFeaturedArticle();

  const results = useMemo(() => {
    const terms = deferred.toLowerCase().split(/\s+/).filter(Boolean);
    return RESOURCE_ARTICLES.filter((a) => {
      if (category !== "All" && a.category !== category) return false;
      if (!terms.length) return true;
      const text = `${a.title} ${a.summary} ${a.category} ${a.kind} ${a.keywords.join(" ")}`.toLowerCase();
      return terms.every((t) => text.includes(t));
    });
  }, [deferred, category]);

  const filtering = query.trim().length > 0 || category !== "All";
  const visible = results.slice(0, shown);

  return (
    <>
      <SEOHead
        title="Guides"
        description="Practical guides for renting and settling in Australia: finding a room, bonds, your rights, hosting, and staying safe."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ]}
      />

      <PageHero
        eyebrow="Guides"
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]}
        title={
          <>
            Land well, with the <strong>basics covered.</strong>
          </>
        }
        lead="Practical advice for renting and settling in Australia, kept to what we can stand behind."
      >
        <form role="search" className="mt-8 max-w-[560px]" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="guides-search" className="site-search">
            <Search className="site-search__icon" strokeWidth={1.9} aria-hidden="true" />
            <span className="sr-only">Search guides</span>
            <input
              id="guides-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShown(PAGE);
              }}
              placeholder="Search: bond, scams, visa, suburb"
              aria-controls="guides-results"
            />
          </label>
        </form>
      </PageHero>

      <section className="site-section site-section--flush" aria-labelledby="all-heading">
        <div className="site-shell">
          <h2 id="all-heading" className="sr-only">
            All guides
          </h2>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
            {(["All", ...categories] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => {
                  setCategory(c);
                  setShown(PAGE);
                }}
                className="hc-chip !w-auto !h-10"
              >
                {c}
              </button>
            ))}
          </div>

          {!filtering && (
            <Reveal className="mt-8">
              <Link href={featured.href} className="site-card flex flex-col gap-4 p-[clamp(22px,3vw,36px)] md:flex-row md:items-end md:justify-between">
                <div className="max-w-[60ch]">
                  <p className="eyebrow">Start here</p>
                  <h3 className="site-h2 mt-3 !text-[clamp(1.6rem,2.8vw,2.3rem)]">{featured.title}</h3>
                  <p className="site-lead mt-3">{featured.summary}</p>
                </div>
                <span className="site-link">
                  Read the guide <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          )}

          <div id="guides-results" aria-live="polite" className="mt-8">
            {filtering && (
              <p className="site-meta mb-4">
                {results.length} {results.length === 1 ? "guide" : "guides"}
                {category !== "All" ? ` in ${category}` : ""}
                {query.trim() ? ` matching "${query.trim()}"` : ""}
              </p>
            )}
            {visible.length === 0 ? (
              <p className="site-body">
                Nothing matched. Try another word, or{" "}
                <button type="button" className="underline underline-offset-2" onClick={() => { setQuery(""); setCategory("All"); }}>
                  show everything
                </button>
                .
              </p>
            ) : (
              <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((a, i) => (
                  <Reveal as="li" key={a.key} delay={(i % 3) * 0.04}>
                    <Link href={a.href} className="site-card site-card--pad flex h-full flex-col">
                      <p className="site-meta">
                        {a.kind} · {a.category} · {a.readMinutes} min
                      </p>
                      <h3 className="site-h3 mt-2.5">{a.title}</h3>
                      <p className="site-body mt-1.5 line-clamp-3 flex-1">{a.summary}</p>
                      <span className="site-link mt-4 text-[14px]">
                        Read <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            )}
            {results.length > shown && (
              <div className="mt-8 flex justify-center">
                <button type="button" className="btn-secondary" onClick={() => setShown((n) => n + PAGE)}>
                  Show more
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="checklists" className="site-section scroll-mt-28" aria-labelledby="tools-heading">
        <div className="site-shell">
          <Reveal>
            <SectionHead
              eyebrow="Tools"
              id="tools-heading"
              heading={
                <>
                  Look it up <strong>yourself.</strong>
                </>
              }
              lead="Rental rules by state, Census figures by suburb, and your own numbers."
            />
          </Reveal>
          <ul className="m-0 mt-10 grid list-none gap-3 p-0 md:grid-cols-3">
            {RESOURCE_TOOLS.map((t, i) => {
              const Icon = TOOL_ICON[t.icon] ?? Compass;
              return (
                <Reveal as="li" key={t.id} delay={i * 0.05}>
                  <Link href={t.href} className="site-card site-card--pad flex h-full flex-col">
                    <span className="site-icon" aria-hidden="true">
                      <Icon className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    {t.audience && <p className="site-meta mt-4">{t.audience}</p>}
                    <h3 className={`site-h3 ${t.audience ? "mt-1" : "mt-4"}`}>{t.title}</h3>
                    <p className="site-body mt-1.5 flex-1">{t.summary}</p>
                    <span className="site-link mt-4 text-[14px]">
                      {t.action} <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <CloseCard
        heading={
          <>
            Ready to look for your <strong className="type-script">room</strong>?
          </>
        }
        primary={{ label: "Search rooms", href: "/seeker/search" }}
        secondary={{ label: "Get help", href: "/help" }}
      />
    </>
  );
}
