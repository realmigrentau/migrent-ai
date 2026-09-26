import type { GetServerSideProps } from "next";
import Link from "next/link";
import SEOHead from "../../components/SEOHead";
import { findPlacesBySlug, regionMap } from "../../lib/suburbs/data.server";
import { legacyTarget } from "../../lib/suburbs/legacy.server";
import { placeHref } from "../../lib/suburbs/search";
import { SITE_URL } from "../../lib/site";
import type { PlaceSummary } from "../../lib/suburbs/types";

/**
 * The old single-segment suburb URL.
 *
 * Before this rebuild every guide lived at /suburb/<name>, which worked only
 * because there were sixteen of them. Nationally the form is ambiguous - 955
 * Australian place names are shared - so the canonical URL now carries the
 * state, and this route resolves the old one:
 *
 *   1. one of the sixteen original guides  -> 301 to its new path
 *   2. a name only one place in Australia has -> 301 to that place
 *   3. a name several places share -> a short chooser, so the link still
 *      lands somewhere useful instead of 404ing
 *   4. nothing -> 404
 *
 * It is getServerSideProps rather than a static redirect because the answer
 * depends on 15,334 rows of data, and because case 3 renders a page.
 *
 * The file is [state].tsx rather than [name].tsx only because Next requires
 * every route at the same depth to name its parameter identically, and the
 * sibling route is /suburb/[state]/[slug]. What arrives here is an old
 * single-segment slug, not a state.
 */

interface Props {
  slug: string;
  options: {
    salCode: string;
    name: string;
    state: string;
    stateLabel: string;
    regionName: string;
    href: string;
    population: number;
    lgaQualifier: string | null;
  }[];
}

const STATE_NAMES: Record<string, string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory",
  OT: "Other Territories",
};

export default function SuburbDisambiguation({ slug, options }: Props) {
  const name = options[0]?.name ?? slug;

  return (
    <>
      {/* Several pages for one query string is exactly the thin-content
          pattern to keep out of an index. The destinations are indexed. */}
      <SEOHead
        title={`${name} - which one?`}
        description={`${options.length} places in Australia are called ${name}. Choose the one you mean.`}
        noIndex
        canonical={`${SITE_URL}/suburbs`}
      />
      <div className="sub-page">
        <div className="sub-disambig">
          <p className="sub-detail__eyebrow">Suburb guides</p>
          <h1 className="sub-detail__title">More than one {name}</h1>
          <p className="sub-disambig__lede">
            {options.length} places in Australia are called {name}. Pick the one you are looking for.
          </p>
          <ul className="sub-disambig__list">
            {options.map((o) => (
              <li key={o.salCode}>
                <Link href={o.href}>
                  <span className="sub-disambig__name">
                    {o.name}
                    {o.lgaQualifier ? ` (${o.lgaQualifier})` : ""}
                  </span>
                  <span className="sub-disambig__meta">
                    {o.regionName} · {o.stateLabel}
                    {o.population > 0 && ` · pop. ${o.population.toLocaleString()}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="sub-disambig__back">
            <Link href="/suburbs">Search every Australian suburb</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, res }) => {
  // Named "state" by the router; it is really the old single-segment slug.
  const slug = String(params?.state || "").toLowerCase();
  if (!slug) return { notFound: true };

  // 1. One of the sixteen guides that existed before the rebuild.
  const legacy = legacyTarget(slug);
  if (legacy) {
    return {
      redirect: { destination: `/suburb/${legacy.state}/${legacy.slug}`, permanent: true },
    };
  }

  const matches: PlaceSummary[] = findPlacesBySlug(slug);
  if (matches.length === 0) return { notFound: true };

  // 2. Unambiguous nationally.
  if (matches.length === 1) {
    return { redirect: { destination: placeHref(matches[0]), permanent: true }, props: {} as never };
  }

  // 3. Genuinely ambiguous, so let the reader choose.
  const regions = regionMap();
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");

  return {
    props: {
      slug,
      options: matches
        .sort((a, b) => b.population - a.population)
        .map((p) => ({
          salCode: p.salCode,
          name: p.name,
          state: p.state,
          stateLabel: STATE_NAMES[p.state] || p.state,
          regionName: regions.get(p.regionId)?.name ?? "",
          href: placeHref(p),
          population: p.population,
          lgaQualifier: p.lgaQualifier,
        })),
    },
  };
};
