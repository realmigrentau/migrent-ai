import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import SEOHead from "../../../components/SEOHead";
import StatBlock, { StatList } from "../../../components/suburbs/StatBlock";
import SourcesPanel from "../../../components/suburbs/SourcesPanel";
import {
  findPlace, getNearbyPlaces, getPlaceDetail, getRegion, loadManifest, loadPlaces,
} from "../../../lib/suburbs/data.server";
import { getListingStats } from "../../../lib/suburbs/listings.server";
import { placeHref } from "../../../lib/suburbs/search";
import { buildFaqs, buildMetaDescription, buildSummary } from "../../../lib/suburbs/summary";
import {
  formatArea, formatAud, formatDate, formatDistance, formatNumber, formatPercent, placeNoun,
} from "../../../lib/suburbs/format";
import { amenityLabel, TRANSPORT_SINGULAR } from "../../../lib/suburbs/fields";
import { editorialSalCodes } from "../../../lib/suburbs/legacy.server";
import { SITE_URL } from "../../../lib/site";
import type { ListingStats, PlaceDetail, PlaceSummary, Region, SourceRecord } from "../../../lib/suburbs/types";

interface Props {
  detail: PlaceDetail;
  region: Region | null;
  nearby: PlaceSummary[];
  listings: ListingStats | null;
  sources: SourceRecord[];
  generatedAt: string;
  summary: string[];
  faqs: { q: string; a: string }[];
  metaDescription: string;
}

export default function SuburbPage({
  detail, region, nearby, listings, sources, generatedAt, summary, faqs, metaDescription,
}: Props) {
  const c = detail.census;
  const noun = placeNoun(detail.sectionOfState);
  const canonical = `${SITE_URL}/suburb/${detail.state.toLowerCase()}/${detail.slug}`;
  const heading = detail.disambiguatedBy === "lga" && detail.lgaQualifier
    ? `${detail.name} (${detail.lgaQualifier})`
    : detail.name;

  const amenityCounts = detail.amenities?.counts ?? {};
  const amenityEntries = Object.entries(amenityCounts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  const nearest = detail.amenities?.nearest ?? [];

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${detail.name}, ${detail.state}`,
    description: summary.join(" "),
    url: canonical,
    address: {
      "@type": "PostalAddress",
      addressLocality: detail.name,
      addressRegion: detail.state,
      addressCountry: "AU",
      ...(detail.postcodes[0] ? { postalCode: detail.postcodes[0] } : {}),
    },
    ...(detail.centre
      ? { geo: { "@type": "GeoCoordinates", latitude: detail.centre.lat, longitude: detail.centre.lng } }
      : {}),
  };

  const faqJsonLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <SEOHead
        title={`${heading}, ${detail.state} - suburb guide`}
        description={metaDescription}
        canonical={canonical}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Suburb guides", path: "/suburbs" },
          ...(region ? [{ name: region.name, path: `/suburbs?region=${region.id}` }] : []),
          { name: detail.name, path: `/suburb/${detail.state.toLowerCase()}/${detail.slug}` },
        ]}
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd).replace(/</g, "\\u003c") }}
        />
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
          />
        )}
      </Head>

      <div className="sub-page">
        <article className="sub-detail">
          {/* 1. Breadcrumbs */}
          <nav className="sub-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/suburbs">Suburb guides</Link></li>
              {region && (
                <li><Link href={`/suburbs?region=${region.id}`}>{region.name}</Link></li>
              )}
              <li aria-current="page">{detail.name}</li>
            </ol>
          </nav>

          {/* 2 + 3. Identity and the factual summary */}
          <header className="sub-detail__head">
            <p className="sub-detail__eyebrow">
              {region
                ? region.kind === "capital"
                  ? `Greater ${region.name}, ${detail.state}`
                  : `${region.name}, ${detail.state}`
                : detail.stateName}
            </p>
            <h1 className="sub-detail__title">{heading}</h1>
            <p className="sub-detail__meta">
              {detail.stateName}
              {detail.postcodes.length > 0 && (
                <>
                  {" · "}
                  {detail.postcodes.length > 1 ? "Postcodes " : "Postcode "}
                  {detail.postcodes.slice(0, 3).join(", ")}
                  <span className="sub-detail__approx" title="ABS Postal Areas approximate postcodes from mesh blocks">
                    {" "}(approximate)
                  </span>
                </>
              )}
              {detail.areaSqKm > 0 && <> · {formatArea(detail.areaSqKm)}</>}
            </p>
            <div className="sub-detail__summary">
              {summary.map((sentence) => (
                <p key={sentence}>{sentence}</p>
              ))}
            </div>
          </header>

          {/* 4. What MigRent itself can tell you */}
          <section className="sub-rooms" aria-labelledby="h-rooms">
            <h2 className="sub-section-title" id="h-rooms">Rooms on MigRent</h2>
            {listings === null ? (
              <p className="sub-rooms__none">
                Live room data is temporarily unavailable. Try the{" "}
                <Link href={`/seeker/search?suburb=${encodeURIComponent(detail.name)}`}>room search</Link>.
              </p>
            ) : listings.activeListings === 0 ? (
              <div className="sub-rooms__none">
                <p>
                  There are no verified rooms advertised in {detail.name} on MigRent right now. This
                  counts what is listed with us - it is not a vacancy rate for the suburb.
                </p>
                <Link className="sub-btn sub-btn--primary" href={`/seeker/search?suburb=${encodeURIComponent(detail.name)}`}>
                  Search rooms nearby
                </Link>
              </div>
            ) : (
              <div className="sub-rooms__grid">
                <dl className="sub-stats">
                  <StatBlock
                    fieldKey="activeListings"
                    value={formatNumber(listings.activeListings)}
                    sources={sources}
                    emphasis
                  />
                  <StatBlock
                    fieldKey="medianWeeklyRoomPrice"
                    value={listings.medianWeeklyRoomPrice != null ? `${formatAud(listings.medianWeeklyRoomPrice)} / week` : null}
                    sources={sources}
                    note={`Not enough recent MigRent listings in ${detail.name} to publish a median. We publish one once there are at least 5.`}
                  />
                </dl>
                <p className="sub-rooms__asof">
                  Counted {formatDate(listings.calculatedAt)} from approved, visible listings.
                </p>
                <Link className="sub-btn sub-btn--primary" href={`/seeker/search?suburb=${encodeURIComponent(detail.name)}`}>
                  See rooms in {detail.name}
                </Link>
              </div>
            )}
          </section>

          {/* 5 + 6. Population and community */}
          {c ? (
            <>
              <section aria-labelledby="h-people">
                <h2 className="sub-section-title" id="h-people">Population and community</h2>
                {c.ratesSuppressed && (
                  <p className="sub-suppressed">
                    {detail.name} is small enough that the ABS publishes few reliable proportions for
                    it - small counts are randomly adjusted to protect confidentiality. The figures
                    below are limited to what can be reported honestly at this size.
                  </p>
                )}
                <dl className="sub-stats">
                  <StatBlock fieldKey="population" value={formatNumber(c.population)} sources={sources} emphasis />
                  <StatBlock fieldKey="medianAge" value={c.medianAge != null ? `${c.medianAge}` : null} sources={sources} />
                  <StatBlock fieldKey="overseasBornPct" value={formatPercent(c.overseasBornPct)} sources={sources} />
                  <StatBlock
                    fieldKey="otherLanguageAtHomePct"
                    value={formatPercent(c.otherLanguageAtHomePct)}
                    sources={sources}
                  />
                  <StatBlock
                    fieldKey="averageHouseholdSize"
                    value={c.averageHouseholdSize != null ? `${c.averageHouseholdSize} people` : null}
                    sources={sources}
                  />
                  <StatBlock
                    fieldKey="medianWeeklyHouseholdIncome"
                    value={c.medianWeeklyHouseholdIncome != null ? `${formatAud(c.medianWeeklyHouseholdIncome)} / week` : null}
                    sources={sources}
                  />
                </dl>

                {/* A dl, not a div: StatList renders dt/dd pairs, and a dt
                    outside a description list is an axe "dlitem" failure. */}
                <dl className="sub-stats sub-stats--wide">
                  <StatList fieldKey="topCountriesOfBirth" items={c.topCountriesOfBirth} sources={sources} />
                  <StatList fieldKey="topLanguagesAtHome" items={c.topLanguagesAtHome} sources={sources} />
                </dl>
              </section>

              {/* 7. Housing and renting */}
              <section aria-labelledby="h-housing">
                <h2 className="sub-section-title" id="h-housing">Housing and renting</h2>
                <dl className="sub-stats">
                  <StatBlock
                    fieldKey="medianWeeklyRent"
                    value={c.medianWeeklyRent != null ? `${formatAud(c.medianWeeklyRent)} / week` : null}
                    sources={sources}
                    emphasis
                  />
                  <StatBlock fieldKey="rentedDwellingsPct" value={formatPercent(c.rentedDwellingsPct)} sources={sources} />
                  <StatBlock
                    fieldKey="dwellingTypes"
                    value={
                      c.dwellingTypes
                        ? `${formatPercent(c.dwellingTypes.separateHouse)} houses, ${formatPercent(c.dwellingTypes.flatOrApartment)} flats`
                        : null
                    }
                    sources={sources}
                  />
                </dl>
                {c.medianWeeklyRent != null && (
                  <p className="sub-caveat">
                    The Census median covers whole rented dwellings - houses and units - at August
                    2021. It is not a room rent and not a current market rate. MigRent&apos;s own room
                    figures are in the section above.
                  </p>
                )}
              </section>
            </>
          ) : (
            <section aria-labelledby="h-people">
              <h2 className="sub-section-title" id="h-people">Population and community</h2>
              <p className="sub-suppressed">
                The ABS does not publish Census figures for {detail.name}, so we have none to show.
              </p>
            </section>
          )}

          {/* 8. Transport */}
          <section aria-labelledby="h-transport">
            <h2 className="sub-section-title" id="h-transport">Transport and connectivity</h2>
            {nearest.length === 0 ? (
              <p className="sub-empty-note">
                No train station, tram stop or ferry terminal is mapped within 20km of the centre of{" "}
                {detail.name} in OpenStreetMap. That is a statement about what has been mapped, not a
                guarantee that none exists.
              </p>
            ) : (
              <>
                <ul className="sub-nearest">
                  {nearest.map((n) => (
                    <li key={n.category}>
                      <span className="sub-nearest__kind">
                        Nearest {TRANSPORT_SINGULAR[n.category] || n.category.replace(/_/g, " ")}
                      </span>
                      <span className="sub-nearest__name">{n.name || "Unnamed stop"}</span>
                      <span className="sub-nearest__dist">{formatDistance(n.distanceMetres)} away</span>
                    </li>
                  ))}
                </ul>
                <p className="sub-caveat">
                  Straight-line distances from the centre of the suburb&apos;s boundary, using
                  OpenStreetMap data. They are not walking routes and not travel times - we do not
                  publish commute times because we have no routing source that would make them true.
                </p>
              </>
            )}
            {detail.editorial?.transportNote && (
              <p className="sub-editorial__note">
                {detail.editorial.transportNote}{" "}
                <span className="sub-editorial__stamp">
                  Editorial, reviewed {formatDate(detail.editorial.reviewedOn)}
                </span>
              </p>
            )}
          </section>

          {/* 9. Amenities */}
          <section aria-labelledby="h-amenities">
            <h2 className="sub-section-title" id="h-amenities">What is nearby</h2>
            {amenityEntries.length === 0 ? (
              <p className="sub-empty-note">
                Nothing in the categories we count is mapped inside {detail.name} in OpenStreetMap.
                In remote Australia that usually means the area has not been mapped in detail yet.
              </p>
            ) : (
              <>
                <ul className="sub-amenities">
                  {amenityEntries.map(([key, count]) => (
                    <li key={key} className="sub-amenity">
                      <span className="sub-amenity__count">{count}</span>
                      <span className="sub-amenity__label">{amenityLabel(key, count)}</span>
                    </li>
                  ))}
                </ul>
                <p className="sub-caveat">
                  Counted inside the suburb&apos;s actual boundary from OpenStreetMap. Volunteer-
                  contributed, so a count is a floor rather than a survey. We publish no walkability
                  score: no free national dataset supports one.
                </p>
              </>
            )}
          </section>

          {/* Editorial, clearly separated from anything sourced */}
          {detail.editorial && (
            <section className="sub-editorial" aria-labelledby="h-editorial">
              <h2 className="sub-section-title" id="h-editorial">From the MigRent team</h2>
              <p className="sub-editorial__lead">{detail.editorial.summary}</p>
              <div className="sub-editorial__cols">
                <div>
                  <h3>What we love</h3>
                  <ul>
                    {detail.editorial.loves.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3>Things to know</h3>
                  <ul>
                    {detail.editorial.thingsToKnow.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
              <p className="sub-editorial__stamp">
                Written and reviewed by the MigRent team on {formatDate(detail.editorial.reviewedOn)}.
                This section is opinion, not data.
              </p>
            </section>
          )}

          {/* FAQs, built only from the fields above */}
          {faqs.length > 0 && (
            <section aria-labelledby="h-faq">
              <h2 className="sub-section-title" id="h-faq">Common questions about {detail.name}</h2>
              <div className="sub-faqs">
                {faqs.map((f) => (
                  <details key={f.q} className="sub-faq">
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <SourcesPanel sources={sources} detail={detail} generatedAt={generatedAt} />

          {/* Nearby suburbs */}
          {nearby.length > 0 && (
            <section aria-labelledby="h-nearby">
              <h2 className="sub-section-title" id="h-nearby">
                Nearby {noun === "suburb" ? "suburbs" : "localities"}
              </h2>
              <ul className="sub-nearby">
                {nearby.map((n) => (
                  <li key={n.salCode}>
                    <Link href={placeHref(n)}>
                      <span className="sub-nearby__name">{n.name}</span>
                      <span className="sub-nearby__meta">
                        {n.state}
                        {n.population > 0 && ` · pop. ${n.population.toLocaleString()}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="sub-cta">
            <h2>Looking for a room in {detail.name}?</h2>
            <p>
              MigRent lists rooms from hosts who are ID-checked before their listing goes live, and
              renters pay us nothing.
            </p>
            <div className="sub-cta__actions">
              <Link className="sub-btn sub-btn--primary" href={`/seeker/search?suburb=${encodeURIComponent(detail.name)}`}>
                Browse rooms in {detail.name}
              </Link>
              <Link className="sub-btn sub-btn--ghost" href="/suburbs">
                All suburb guides
              </Link>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}

/**
 * Pre-render only the sixteen suburbs with written guides.
 *
 * Building all 15,334 at deploy time would make every deploy slow and
 * fragile for no benefit - the long tail is crawled rarely and served from
 * the ISR cache after its first request, which costs one filesystem read of
 * a 200KB bucket.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const wanted = new Set(editorialSalCodes());
  const paths = loadPlaces()
    .filter((p) => wanted.has(p.salCode))
    .map((p) => ({ params: { state: p.state.toLowerCase(), slug: p.slug } }));
  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const state = String(params?.state || "");
  const slug = String(params?.slug || "");
  const summaryPlace = findPlace(state, slug);
  if (!summaryPlace) return { notFound: true, revalidate: 3600 };

  // The canonical path is lowercase; anything else redirects rather than
  // becoming a second URL for the same suburb.
  if (state !== state.toLowerCase() || slug !== slug.toLowerCase()) {
    return {
      redirect: { destination: `/suburb/${summaryPlace.state.toLowerCase()}/${summaryPlace.slug}`, permanent: true },
    };
  }

  const detail = getPlaceDetail(summaryPlace.salCode);
  if (!detail) return { notFound: true, revalidate: 3600 };

  const region = getRegion(detail.regionId);
  const manifest = loadManifest();
  const listings = await getListingStats(detail.salCode);

  return {
    props: {
      detail,
      region,
      nearby: getNearbyPlaces(summaryPlace, 6),
      listings,
      sources: manifest.sources,
      generatedAt: manifest.generatedAt,
      summary: buildSummary(detail, region),
      faqs: buildFaqs(detail, region, listings),
      metaDescription: buildMetaDescription(detail, region),
    },
    revalidate: 3600,
  };
};
