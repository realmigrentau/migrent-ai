import { useCallback, useEffect, useMemo, useRef } from "react";
import type { GetStaticProps } from "next";
import { useRouter } from "next/router";
import SEOHead from "../components/SEOHead";
import SuburbSearch from "../components/suburbs/SuburbSearch";
import CityAccordion from "../components/suburbs/CityAccordion";
import DirectoryFilters, {
  type DirectoryFilterState,
  type SortOption,
} from "../components/suburbs/DirectoryFilters";
import { getRegionPlaces, loadManifest, loadRegions } from "../lib/suburbs/data.server";
import { getAllListingStats } from "../lib/suburbs/listings.server";
import { placeHref, resultLabel } from "../lib/suburbs/search";
import { formatDate } from "../lib/suburbs/format";
import { SITE_URL } from "../lib/site";
import type { Region } from "../lib/suburbs/types";
import type { RegionCard } from "./api/suburbs/region";

/** The one section that is open when the page loads. */
const DEFAULT_OPEN = "sydney";

interface Props {
  regions: Region[];
  sydneyPreview: RegionCard[];
  totals: { places: number; regions: number; capitals: number };
  generatedAt: string;
  censusYear: string;
  asgsEdition: string;
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

export default function SuburbsDirectory({
  regions,
  sydneyPreview,
  totals,
  generatedAt,
  censusYear,
  asgsEdition,
}: Props) {
  const router = useRouter();

  // The URL is the state. Nothing is mirrored into React state and resynced
  // by an effect, which means Back and Forward restore the whole view - which
  // city is open, the filters, the search - for free, and there is no window
  // where the address bar and the page disagree.
  const urlQuery = typeof router.query.q === "string" ? router.query.q : "";

  const open = useMemo(() => {
    const region = typeof router.query.region === "string" ? router.query.region : null;
    if (region === "none") return null;
    return region && regions.some((r) => r.id === region) ? region : DEFAULT_OPEN;
  }, [router.query.region, regions]);

  const filters = useMemo<DirectoryFilterState>(() => {
    const state = typeof router.query.state === "string" ? router.query.state.toUpperCase() : "";
    const sort = typeof router.query.sort === "string" ? router.query.sort : "";
    const kind = typeof router.query.kind === "string" ? router.query.kind : "";
    return {
      state: STATE_NAMES[state] ? state : "",
      kind: kind === "capital" || kind === "regional" ? kind : "all",
      sort: (["population", "name", "overseas"] as const).includes(sort as SortOption)
        ? (sort as SortOption)
        : "population",
    };
  }, [router.query.state, router.query.sort, router.query.kind]);

  /** Build the next URL from the current one plus an override. */
  const buildUrl = useCallback(
    (next: Partial<{ q: string; region: string | null; state: string; kind: string; sort: string }>) => {
      const params = new URLSearchParams();
      const q = next.q ?? urlQuery;
      const region = next.region === undefined ? open : next.region;
      const state = next.state ?? filters.state;
      const kind = next.kind ?? filters.kind;
      const sort = next.sort ?? filters.sort;
      if (q) params.set("q", q);
      // "none" is meaningful: every section shut, which is different from
      // "no region in the URL", which means Sydney is open.
      if (region === null) params.set("region", "none");
      else if (region !== DEFAULT_OPEN) params.set("region", region);
      if (state) params.set("state", state);
      if (kind !== "all") params.set("kind", kind);
      if (sort !== "population") params.set("sort", sort);
      return params.toString() ? `/suburbs?${params}` : "/suburbs";
    },
    [urlQuery, open, filters.state, filters.kind, filters.sort],
  );

  const syncUrl = useCallback(
    (next: Parameters<typeof buildUrl>[0], push = false) => {
      const url = buildUrl(next);
      const method = push ? router.push : router.replace;
      void method.call(router, url, undefined, { shallow: true, scroll: false });
    },
    [router, buildUrl],
  );

  /**
   * Typing should not write a history entry per keystroke, and should not
   * route on every one either. The combobox holds the text; the URL catches
   * up a beat later so the search stays shareable.
   */
  const queryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onQueryChange = useCallback(
    (q: string) => {
      if (queryTimer.current) clearTimeout(queryTimer.current);
      queryTimer.current = setTimeout(() => syncUrl({ q }), 400);
    },
    [syncUrl],
  );
  useEffect(() => () => { if (queryTimer.current) clearTimeout(queryTimer.current); }, []);

  const visible = useMemo(() => {
    return regions.filter((r) => {
      if (filters.state && r.state !== filters.state) return false;
      if (filters.kind === "capital" && r.kind !== "capital") return false;
      if (filters.kind === "regional" && r.kind === "capital") return false;
      return true;
    });
  }, [regions, filters.state, filters.kind]);

  const capitals = visible.filter((r) => r.kind === "capital");
  const urban = visible.filter((r) => r.kind === "urban");
  const rest = visible.filter((r) => r.kind === "rest");

  // Regional cities are grouped under their state, or 100 headings run
  // down the page with nothing to hold them together.
  const urbanByState = useMemo(() => {
    const map = new Map<string, Region[]>();
    for (const r of urban) {
      if (!map.has(r.state)) map.set(r.state, []);
      map.get(r.state)!.push(r);
    }
    return [...map.entries()];
  }, [urban]);

  const toggle = (id: string) => {
    syncUrl({ region: open === id ? null : id }, true);
  };

  const renderAccordion = (region: Region) => (
    <CityAccordion
      key={region.id}
      region={region}
      open={open === region.id}
      onToggle={() => toggle(region.id)}
      initialPlaces={region.id === DEFAULT_OPEN && filters.sort === "population" ? sydneyPreview : undefined}
      sort={filters.sort}
    />
  );

  const title = "Australian suburb guides - every suburb and locality";
  const description = `Search all ${totals.places.toLocaleString()} Australian suburbs and localities. Population, rent, community and transport data from the ABS Census ${censusYear}, with sources on every figure.`;

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonical={`${SITE_URL}/suburbs`}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Suburb guides", path: "/suburbs" },
        ]}
      />

      <div className="sub-page">
        <header className="sub-hero">
          <div className="sub-hero__inner">
            <p className="sub-hero__eyebrow">Suburb guides</p>
            <h1 className="sub-hero__title">Where you can live, honestly told.</h1>
            <p className="sub-hero__lede">
              Every suburb and locality in Australia, built from the ABS Census and official
              statistical geography. Real figures with their sources attached, and nothing invented
              to fill a gap.
            </p>

            <div className="sub-hero__search">
              <SuburbSearch
                initialQuery={urlQuery}
                stateFilter={filters.state || null}
                onQueryChange={onQueryChange}
              />
            </div>

            <ul className="sub-hero__trust">
              <li>
                <strong>{totals.places.toLocaleString()}</strong> suburbs and localities
              </li>
              <li>
                <strong>{totals.regions}</strong> cities and regions
              </li>
              <li>Data from the ABS and other verified sources</li>
              <li>Last updated {formatDate(generatedAt)}</li>
            </ul>
          </div>
        </header>

        <main className="sub-main">
          <div className="sub-section-head">
            <h2 className="sub-section-title" id="cities-and-regions">
              Cities and regions
            </h2>
            <p className="sub-section-note">
              Grouping follows ABS statistical geography (ASGS Edition {asgsEdition}): the eight
              Greater Capital City Statistical Areas, then Significant Urban Areas for regional
              cities, then everything else grouped with the rest of its state. Each suburb is placed
              by where most of its mesh blocks actually are, never by its name.
            </p>
          </div>

          <DirectoryFilters
            value={filters}
            onChange={(next) => syncUrl({ state: next.state, kind: next.kind, sort: next.sort })}
            resultCount={visible.length}
          />

          {visible.length === 0 ? (
            <p className="sub-empty">
              No cities or regions match those filters.{" "}
              <button
                type="button"
                className="sub-link"
                onClick={() => syncUrl({ state: "", kind: "all", sort: "population" })}
              >
                Clear filters
              </button>
            </p>
          ) : (
            <>
              {capitals.length > 0 && (
                <section className="sub-group" aria-labelledby="group-capitals">
                  <h3 className="sub-group__title" id="group-capitals">
                    Capital cities
                  </h3>
                  <div className="sub-group__items">{capitals.map(renderAccordion)}</div>
                </section>
              )}

              {urbanByState.length > 0 && (
                <section className="sub-group" aria-labelledby="group-urban">
                  <h3 className="sub-group__title" id="group-urban">
                    Regional cities and urban areas
                  </h3>
                  {urbanByState.map(([state, list]) => (
                    <div key={state} className="sub-group__state">
                      <h4 className="sub-group__state-title">{STATE_NAMES[state] || state}</h4>
                      <div className="sub-group__items">{list.map(renderAccordion)}</div>
                    </div>
                  ))}
                </section>
              )}

              {rest.length > 0 && (
                <section className="sub-group" aria-labelledby="group-rest">
                  <h3 className="sub-group__title" id="group-rest">
                    Regional and remote localities
                  </h3>
                  <div className="sub-group__items">{rest.map(renderAccordion)}</div>
                </section>
              )}
            </>
          )}

          <aside className="sub-footnote">
            <h2 className="sub-footnote__title">About this data</h2>
            <p>
              Suburb boundaries and names come from the ABS Australian Statistical Geography
              Standard, Suburbs and Localities (Edition {asgsEdition}). Population, rent, community
              and housing figures come from the {censusYear} Census of Population and Housing. Nearby
              amenities come from OpenStreetMap. Room counts and prices are MigRent&apos;s own
              verified listings.
            </p>
            <p>
              We publish no safety score, no walkability score and no commute times, because no
              source we can license supports them honestly. Each suburb page lists its sources in
              full.
            </p>
            <p className="sub-footnote__attribution">
              Contains data sourced from the Australian Bureau of Statistics, licensed under CC BY
              4.0. Amenity data &copy; OpenStreetMap contributors, licensed under the Open Database
              License.
            </p>
          </aside>
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const regions = loadRegions();
  const manifest = loadManifest();

  // Sydney is open on arrival, so its six previews are rendered server-side
  // rather than costing a round trip after hydration.
  const { places } = getRegionPlaces(DEFAULT_OPEN, { offset: 0, limit: 6, sort: "population" });
  const listings = await getAllListingStats();

  const sydneyPreview: RegionCard[] = places.map((p) => {
    const stats = listings?.bySalCode[p.salCode] ?? null;
    return {
      salCode: p.salCode,
      name: p.name,
      label: resultLabel(p),
      state: p.state,
      postcode: p.postcode,
      population: p.population,
      overseasBornPct: p.overseasBornPct,
      href: placeHref(p),
      activeListings: listings ? (stats?.activeListings ?? 0) : null,
      medianWeeklyRoomPrice: stats?.medianWeeklyRoomPrice ?? null,
      hasEditorial: p.hasEditorial,
    };
  });

  return {
    props: {
      regions,
      sydneyPreview,
      totals: {
        places: manifest.counts.publicPlaces,
        regions: manifest.counts.regions,
        capitals: manifest.counts.assignedToCapital,
      },
      generatedAt: manifest.generatedAt,
      censusYear: manifest.censusYear,
      asgsEdition: manifest.asgsEdition,
    },
    // The suburb data is static; only the room counts on the six Sydney cards
    // move, so an hour is plenty and keeps this page cheap.
    revalidate: 3600,
  };
};
