import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import SEOHead from "../components/SEOHead";
import ResourceHero from "../components/resources/ResourceHero";
import ResourceIcon from "../components/resources/ResourceIcon";
import ResourceSearch from "../components/resources/ResourceSearch";
import ResourceCard, { Arrow, CategoryChip } from "../components/resources/ResourceCard";
import {
  RESOURCES_IN_PROGRESS,
  RESOURCE_ARTICLES,
  RESOURCE_HUBS,
  RESOURCE_TOOLS,
  getFeaturedArticle,
  searchResources,
} from "../data/resources";

/**
 * The Resources overview.
 *
 * What was here before was six full-bleed panels, each with a hand-drawn
 * fake UI mock-up inside it - a fake blog feed, a fake API response, a fake
 * Discord server, a fake careers board with three invented job openings -
 * and it advertised a Developer API that does not exist and a community
 * chat that has not launched. It was the single largest piece of invented
 * content on the site.
 *
 * It is now what an overview should be: one sentence, one search box that
 * covers every resource at once, the three real destinations, and the
 * things people actually open.
 */

const RESULTS_ID = "resources-results";

export default function ResourcesLanding() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const hits = useMemo(() => searchResources(deferredQuery), [deferredQuery]);
  const searching = query.trim().length > 0;

  const featured = getFeaturedArticle();
  /* The three newest written pieces. They are already stored newest-first,
     so this is a slice rather than a sort - no date parsing, and no way to
     show a piece that is not really the latest. */
  const latest = RESOURCE_ARTICLES.filter((a) => a.date && a.key !== featured.key).slice(0, 3);

  return (
    <>
      <SEOHead
        title="Resources"
        description="Everything you need for your move: guides and articles, tools and checklists, and a help centre for the questions in between."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
        ]}
      />

      <ResourceHero
        eyebrow="Resources"
        title={
          <>
            Everything you need for your <strong>move.</strong>
          </>
        }
        lead="Three places to look: what to read, what to use, and what to ask. Search all of it at once, or start with a hub below."
      >
        <div className="max-w-[560px]">
          <ResourceSearch
            value={query}
            onChange={setQuery}
            label="Search all resources"
            placeholder="Search everything - bond, suburbs, visas, earnings..."
            resultsId={RESULTS_ID}
          />
        </div>
      </ResourceHero>

      <div id={RESULTS_ID}>
        {searching ? (
          <section className="mg-section--sm" aria-labelledby="search-heading">
            <div className="mg-container mg-container--narrow">
              <h2 id="search-heading" className="font-serif text-[24px] tracking-[-0.014em]" aria-live="polite">
                {hits.length} {hits.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
              </h2>

              {hits.length > 0 ? (
                <ul className="list-none m-0 p-0 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-7">
                  {hits.map((hit) => (
                    <li key={hit.key}>
                      <article className="res-card">
                        <div className="flex items-center gap-2.5 mb-3.5">
                          <CategoryChip category={hit.category} />
                          <span className="res-kind">{hit.label}</span>
                        </div>
                        <h3 className="res-card__title">
                          <Link href={hit.href} className="res-card__link">
                            {hit.title}
                          </Link>
                        </h3>
                        <p className="res-card__summary mt-2 flex-1">{hit.summary}</p>
                        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--color-line)]">
                          <span className="res-card__meta">
                            {hit.readMinutes ? `${hit.readMinutes} min read` : "Tool"}
                          </span>
                          <Arrow label="Open" />
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="res-empty mt-7">
                  <p className="font-serif text-[20px] text-[var(--color-ink)]">
                    Nothing here matches that.
                  </p>
                  <p className="text-sm text-[var(--color-ink-2)] mt-2 max-w-[46ch] mx-auto">
                    Try a single word - bond, visa, suburb, scam, earnings - or ask us
                    and we will answer it properly.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    <button
                      type="button"
                      className="btn-secondary h-11 px-5 text-sm"
                      onClick={() => setQuery("")}
                    >
                      Clear search
                    </button>
                    <Link href="/contact" className="btn-outline h-11 px-5 text-sm">
                      Ask us
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* The three destinations. Exactly the three in the navbar
                dropdown, read from the same array, so they can never drift
                apart again. */}
            <section className="mg-section--sm" aria-labelledby="hubs-heading">
              <div className="mg-container mg-container--narrow">
                <h2 id="hubs-heading" className="sr-only">
                  Resource hubs
                </h2>
                <ul className="list-none m-0 p-0 grid gap-5 md:grid-cols-3">
                  {RESOURCE_HUBS.map((hub) => (
                    <li key={hub.id}>
                      <Link href={hub.href} className="res-tile group">
                        <span className="res-icon mb-6">
                          <ResourceIcon name={hub.icon} />
                        </span>
                        <h3 className="font-serif text-[21px] leading-[1.2] tracking-[-0.01em] text-[var(--color-ink)]">
                          {hub.title}
                        </h3>
                        <p className="res-card__summary mt-2.5 flex-1">{hub.description}</p>
                        <span className="mt-6">
                          <Arrow label="Browse" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Popular. Real pages people open, not a "featured" slot
                filled with whatever was newest. */}
            <section className="mg-section--sm pt-0" aria-labelledby="popular-heading">
              <div className="mg-container mg-container--narrow">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <h2 id="popular-heading" className="font-serif text-[24px] tracking-[-0.014em]">
                    Most useful first
                  </h2>
                  <Link href="/resources/guides" className="mg-link">
                    All guides and articles
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <ul className="list-none m-0 p-0 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                  <li>
                    <ResourceCard
                      href={featured.href}
                      title={featured.title}
                      summary={featured.summary}
                      category={featured.category}
                      kind={featured.kind}
                      readMinutes={featured.readMinutes}
                    />
                  </li>
                  {RESOURCE_TOOLS.slice(0, 2).map((tool) => (
                    <li key={tool.id}>
                      <article className="res-card">
                        <div className="flex items-center gap-2.5 mb-3.5">
                          <CategoryChip category={tool.category} />
                          <span className="res-kind">Tool</span>
                        </div>
                        <h3 className="res-card__title">
                          <Link href={tool.href} className="res-card__link">
                            {tool.title}
                          </Link>
                        </h3>
                        <p className="res-card__summary mt-2 flex-1">{tool.summary}</p>
                        <div className="flex items-center justify-end mt-5 pt-4 border-t border-[var(--color-line)]">
                          <Arrow label={tool.action} />
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {latest.length > 0 && (
              <section className="mg-section--sm pt-0" aria-labelledby="latest-heading">
                <div className="mg-container mg-container--narrow">
                  <h2 id="latest-heading" className="font-serif text-[24px] tracking-[-0.014em]">
                    Latest writing
                  </h2>
                  <ul className="list-none m-0 p-0 grid gap-5 sm:grid-cols-3 mt-6">
                    {latest.map((a) => (
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

                  <p className="text-[13px] text-[var(--color-ink-3)] mt-9">
                    Also in development:{" "}
                    {RESOURCES_IN_PROGRESS.map((item, i) => (
                      <span key={item.href}>
                        {i > 0 && ", "}
                        <Link
                          href={item.href}
                          className="text-[var(--color-ink-2)] underline underline-offset-2 decoration-[var(--color-line-2)] hover:text-[var(--color-primary)] transition-colors"
                        >
                          {item.label}
                        </Link>
                      </span>
                    ))}
                    .
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <section className="mg-ground-deep mg-section--sm">
        <div className="mg-container mg-container--narrow text-center">
          <h2 className="font-serif text-[26px] sm:text-[32px] leading-[1.12] tracking-[-0.018em]">
            Ready to start looking?
          </h2>
          <p className="text-[15px] text-[var(--color-ink-2)] mt-3 max-w-[48ch] mx-auto">
            Every room on MigRent comes from a host whose ID and control of the
            property were checked before it went live.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <Link href="/seeker/search" className="btn-primary h-11 px-6 text-sm">
              Search rooms
            </Link>
            <Link href="/for-owners" className="btn-outline h-11 px-6 text-sm">
              List a room
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
