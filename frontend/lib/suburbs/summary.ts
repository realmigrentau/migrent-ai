/**
 * The factual summary and the FAQs, built from controlled templates.
 *
 * No language model writes a word of this. Every sentence is a fixed string
 * with holes in it, each hole filled from one stored, sourced field, and a
 * sentence whose field is missing is not emitted at all. That is the whole
 * design: it means a page about a locality of 40 people says less rather than
 * making more up, and it means any sentence on any of 15,334 pages can be
 * traced back to a row in the Census.
 *
 * It is also why there is no "what we love" here. Opinions come from
 * editorial.mjs, where a person wrote them and a person reviewed them.
 */
import type { ListingStats, PlaceDetail, Region } from "./types";
import { formatAud, formatNumber, formatPercent, placeNoun } from "./format";

/** Where the place sits, phrased for the region's kind. */
function locationClause(detail: PlaceDetail, region: Region | null): string {
  const noun = placeNoun(detail.sectionOfState);
  if (!region) return `${detail.name} is a ${noun} in ${detail.stateName}.`;
  if (region.kind === "capital") {
    return `${detail.name} is a ${noun} in Greater ${region.name}, ${detail.stateName}.`;
  }
  if (region.kind === "urban") {
    return `${detail.name} is a ${noun} in the ${region.name} urban area, ${detail.stateName}.`;
  }
  return `${detail.name} is a ${noun} in ${detail.stateName}, outside the state's major urban areas.`;
}

/**
 * Two to four sentences of plain fact.
 * Returned as an array so the page can render them as one paragraph and a
 * test can assert on them individually.
 */
export function buildSummary(detail: PlaceDetail, region: Region | null): string[] {
  const out = [locationClause(detail, region)];
  const c = detail.census;
  if (!c) return out;

  if (c.population > 0) {
    out.push(`It had a population of ${formatNumber(c.population)} at the 2021 Census.`);
  }

  if (c.overseasBornPct != null) {
    out.push(`${formatPercent(c.overseasBornPct)} of residents were born overseas.`);
  }

  if (c.medianWeeklyRent != null) {
    out.push(
      `The median rent across all rented dwellings was ${formatAud(c.medianWeeklyRent)} a week, which covers whole houses and units rather than rooms.`,
    );
  } else if (c.ratesSuppressed) {
    out.push(
      "It is small enough that the ABS publishes few reliable figures for it, so some statistics below are not available.",
    );
  }

  return out;
}

/** The one-line meta description. Kept under 160 characters. */
export function buildMetaDescription(detail: PlaceDetail, region: Region | null): string {
  const noun = placeNoun(detail.sectionOfState);
  const where =
    region?.kind === "capital" ? `Greater ${region.name}` : region?.kind === "urban" ? region.name : detail.stateName;
  const c = detail.census;
  const bits: string[] = [`${detail.name} is a ${noun} in ${where}, ${detail.state}.`];
  if (c?.population) bits.push(`Population ${formatNumber(c.population)} (2021 Census).`);
  if (c?.overseasBornPct != null) bits.push(`${formatPercent(c.overseasBornPct)} born overseas.`);
  bits.push("Rooms, rent and community data from the ABS.");
  let out = bits.join(" ");
  if (out.length > 158) out = `${out.slice(0, 155).trimEnd()}...`;
  return out;
}

export interface Faq {
  q: string;
  a: string;
}

/**
 * FAQs assembled from this page's own verified fields.
 *
 * A question is only asked when its answer exists, so a small locality gets
 * two of these and an inner-city suburb gets six. None of them is a question
 * we would like to rank for but cannot answer.
 */
export function buildFaqs(
  detail: PlaceDetail,
  region: Region | null,
  listings: ListingStats | null,
): Faq[] {
  const faqs: Faq[] = [];
  const c = detail.census;
  const name = detail.name;

  if (c?.population) {
    faqs.push({
      q: `How many people live in ${name}?`,
      a: `${name} had a population of ${formatNumber(c.population)} at the 2021 Census (Australian Bureau of Statistics, Census of Population and Housing, Suburbs and Localities). Census counts are point-in-time figures from 10 August 2021, not current estimates.`,
    });
  }

  if (c?.medianWeeklyRent != null) {
    faqs.push({
      q: `What is the median rent in ${name}?`,
      a: `At the 2021 Census the median rent in ${name} was ${formatAud(c.medianWeeklyRent)} a week. That figure is the median across all rented dwellings, so it covers whole houses and units rather than single rooms, and it reflects August 2021 rather than today's market.`,
    });
  }

  if (listings && listings.activeListings > 0) {
    const priced =
      listings.medianWeeklyRoomPrice != null
        ? ` The median advertised room price is ${formatAud(listings.medianWeeklyRoomPrice)} a week across ${listings.sampleSize} listings.`
        : " There are not yet enough listings here to publish a median room price.";
    faqs.push({
      q: `Are there rooms available in ${name} on MigRent?`,
      a: `${name} currently has ${formatNumber(listings.activeListings)} verified ${listings.activeListings === 1 ? "room" : "rooms"} advertised on MigRent.${priced} This counts what is advertised on MigRent and is not a vacancy rate for the suburb.`,
    });
  }

  if (c?.topCountriesOfBirth?.length) {
    const top = c.topCountriesOfBirth.slice(0, 3);
    const list = top.map((t) => `${t.name} (${formatPercent(t.pct)})`).join(", ");
    faqs.push({
      q: `Where are residents of ${name} born?`,
      a: `At the 2021 Census, ${formatPercent(c.overseasBornPct)} of ${name} residents were born overseas. The most common overseas countries of birth were ${list}. Source: ABS Census 2021, country of birth by persons.`,
    });
  }

  if (c?.topLanguagesAtHome?.length) {
    const list = c.topLanguagesAtHome.slice(0, 3).map((t) => t.name).join(", ");
    faqs.push({
      q: `What languages are spoken in ${name}?`,
      a: `${formatPercent(c.otherLanguageAtHomePct)} of residents used a language other than English at home at the 2021 Census. The most common were ${list}. Source: ABS Census 2021, language used at home.`,
    });
  }

  const nearestTrain = detail.amenities?.nearest?.find((n) => n.category === "train_station");
  if (nearestTrain?.name) {
    faqs.push({
      q: `What is the nearest train station to ${name}?`,
      a: `The nearest mapped station is ${nearestTrain.name}, about ${(nearestTrain.distanceMetres / 1000).toFixed(1)} km from the centre of ${name} in a straight line. That is a straight-line distance from OpenStreetMap data, not a walking route or a travel time.`,
    });
  }

  if (detail.postcodes.length) {
    const many = detail.postcodes.length > 1;
    faqs.push({
      q: `What is the postcode for ${name}?`,
      a: many
        ? `${name} overlaps the ABS Postal Areas ${detail.postcodes.join(", ")}. ABS Postal Areas approximate postcodes from mesh blocks and are not Australia Post's official boundaries, so confirm the postcode against the specific address.`
        : `${name} sits in ABS Postal Area ${detail.postcodes[0]}. ABS Postal Areas approximate postcodes from mesh blocks and are not Australia Post's official boundaries, so confirm the postcode against the specific address.`,
    });
  }

  if (region?.kind === "capital") {
    faqs.push({
      q: `Is ${name} part of ${region.name}?`,
      a: `Yes. ${name} falls inside the Greater ${region.name} Greater Capital City Statistical Area, which is how the Australian Bureau of Statistics defines the city's extent. We assign each suburb by which statistical area most of its mesh blocks belong to, rather than by its name or its distance from the centre.`,
    });
  }

  return faqs;
}
