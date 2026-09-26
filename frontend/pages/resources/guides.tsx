import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import SEOHead from "../../components/SEOHead";
import ResourceHero from "../../components/resources/ResourceHero";
import ResourceSearch from "../../components/resources/ResourceSearch";
import ResourceCard, { Arrow, CategoryChip } from "../../components/resources/ResourceCard";
import {
  RESOURCE_ARTICLES,
  countByCategory,
  getFeaturedArticle,
  getUsedCategories,
  type ResourceCategory,
} from "../../data/resources";

/**
 * Guides & Articles - the section's one educational hub.
 *
 * This replaces /guides and /blog, which were two pages doing the same
 * job: eight step-by-step guides on one, six written pieces on the other,
 * both of them "read this before you rent". A visitor had no way to guess
 * which one held the bond article. They are one index now, and the thing
 * that was actually useful about the split - guide versus article versus
 * announcement - survives as a three-word label on the card.
 *
 * Both sets of detail pages keep their URLs (/guides/:id, /blog/:slug), so
 * nothing that was indexed or bookmarked moved.
 */

const PAGE_SIZE = 9;
const RESULTS_ID = "guides-results";

export default function GuidesHub() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ResourceCategory | "All">("All");
  const [shown, setShown] = useState(PAGE_SIZE);

  /* 14 records filtered in memory needs no debounce timer; useDeferredValue
     keeps typing responsive if the list ever grows, and costs nothing now. */
  const deferredQuery = useDeferredValue(query);
  const categories = getUsedCategories();
  const featured = getFeaturedArticle();

  const results = useMemo(() => {
    const terms = deferredQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return RESOURCE_ARTICLES.filter((a) => {
      if (category !== "All" && a.category !== category) return false;
      if (terms.length === 0) return true;
      const text = `${a.title} ${a.summary} ${a.category} ${a.kind} ${a.keywords.join(" ")}`.toLowerCase();
      return terms.every((t) => text.includes(t));
    });
  }, [deferredQuery, category]);

  const filtering = query.trim().length > 0 || category !== "All";
  const visible = results.slice(0, shown);

  const reset = (next: () => void) => {
    next();
    setShown(PAGE_SIZE);
  };

  return (
    <>
      <SEOHead
        title="Guides & Articles"
        description="Practical advice for moving, living and settling in Australia - finding a room, hosting, money, visas, rights and staying safe."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Guides & Articles", path: "/resources/guides" },
        ]}
      />

      <ResourceHero
        eyebrow="Resources"
        title="Guides & Articles"
        lead="Practical advice for moving, living and settling in Australia. Written by the MigRent team, and kept to what we can actually stand behind."
        crumb="Guides & Articles"
      >
        <div className="max-w-[520px]">
          <ResourceSearch
            value={query}
            onChange={(v) => reset(() => setQuery(v))}
            label="Search guides and articles"
            placeholder="Search guides and articles"
            resultsId={RESULTS_ID}
          />
        </div>
      </ResourceHero>

      {/* Featured. Hidden the moment someone filters, because a pinned card
          above their results is just an answer to a question they stopped
          asking. */}
      {!filtering && (
        <section className="mg-section--sm pb-0" aria-labelledby="featured-heading">
          <div className="mg-container mg-container--narrow">
            <h2 id="featured-heading" className="eyebrow mb-4">
              Start here
            </h2>
            <article className="res-card sm:flex-row sm:items-center sm:gap-8 sm:p-8">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <CategoryChip category={featured.category} />
                  <span className="res-kind">{featured.kind}</span>
                </div>
                <h3 className="font-serif text-[24px] sm:text-[28px] leading-[1.14] tracking-[-0.014em] text-[var(--color-ink)]">
                  <Link href={featured.href} className="res-card__link">
                    {featured.title}
                  </Link>
                </h3>
                <p className="res-card__summary mt-3 max-w-[54ch]">{featured.summary}</p>
                <div className="flex items-center gap-4 mt-5">
                  <Arrow label="Read the guide" />
                  <span className="res-card__meta">{featured.readMinutes} min read</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="mg-section--sm" aria-labelledby="all-heading">
        <div className="mg-container mg-container--narrow">
          <h2 id="all-heading" className="sr-only">
            All guides and articles
          </h2>

          {/* Filters. Buttons with aria-pressed rather than links, because
              they change the view in place; the count tells you a chip is
              worth pressing before you press it. */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
            <button
              type="button"
              className="res-filter"
              aria-pressed={category === "All"}
              onClick={() => reset(() => setCategory("All"))}
            >
              All
              <span className="res-filter__count">{RESOURCE_ARTICLES.length}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className="res-filter"
                aria-pressed={category === c}
                onClick={() => reset(() => setCategory(c))}
              >
                {c}
                <span className="res-filter__count">{countByCategory(c)}</span>
              </button>
            ))}
          </div>

          <p className="sr-only" aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>

          <div id={RESULTS_ID} className="mt-8">
            {results.length > 0 ? (
              <>
                <ul className="list-none m-0 p-0 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((a) => (
                    <li key={a.key}>
                      <ResourceCard
                        href={a.href}
                        title={a.title}
                        summary={a.summary}
                        category={a.category}
                        kind={a.kind}
                        readMinutes={a.readMinutes}
                        date={a.date}
                      />
                    </li>
                  ))}
                </ul>

                {results.length > visible.length && (
                  <div className="flex justify-center mt-10">
                    <button
                      type="button"
                      className="btn-secondary h-11 px-6 text-sm"
                      onClick={() => setShown((n) => n + PAGE_SIZE)}
                    >
                      Load more
                      <span className="res-card__meta ml-1">
                        ({results.length - visible.length} left)
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="res-empty">
                <p className="font-serif text-[20px] text-[var(--color-ink)]">
                  Nothing matches that yet.
                </p>
                <p className="text-sm text-[var(--color-ink-2)] mt-2 max-w-[44ch] mx-auto">
                  Try a broader word, clear the topic filter, or ask us directly - the
                  Help Centre covers questions the articles do not.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <button
                    type="button"
                    className="btn-secondary h-11 px-5 text-sm"
                    onClick={() => reset(() => {
                      setQuery("");
                      setCategory("All");
                    })}
                  >
                    Clear filters
                  </button>
                  <Link href="/resources/help" className="btn-outline h-11 px-5 text-sm">
                    Go to the Help Centre
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Close. One deep band, the site's standard ending. */}
      <section className="mg-ground-deep mg-section--sm">
        <div className="mg-container mg-container--narrow text-center">
          <h2 className="font-serif text-[26px] sm:text-[32px] leading-[1.12] tracking-[-0.018em]">
            Still deciding where to start?
          </h2>
          <p className="text-[15px] text-[var(--color-ink-2)] mt-3 max-w-[48ch] mx-auto">
            The tools do the arithmetic, and the Help Centre answers the things an
            article cannot.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <Link href="/resources/tools" className="btn-primary h-11 px-6 text-sm">
              Tools & Checklists
            </Link>
            <Link href="/resources/help" className="btn-outline h-11 px-6 text-sm">
              Help Centre
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
