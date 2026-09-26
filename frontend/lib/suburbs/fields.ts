/**
 * What every displayed number means, where it came from, and how much to
 * trust it.
 *
 * The rule this table exists to enforce: nothing appears on a suburb page
 * without an entry here. If a statistic has no source, no reference period
 * and no stated method, it does not get rendered - which is what went wrong
 * with the "Safety Score 6.9/10" and "Walkability 6.5/10" the old pages
 * printed, neither of which anyone could trace to anything.
 *
 * This is a table rather than per-record metadata because the answer is the
 * same for all 15,334 places: "median weekly rent" is always the 2021 Census
 * G02 figure for all rented dwellings. Repeating that on every record would
 * multiply the data layer by a large constant for no added truth. Per-record
 * variation is carried on the record itself, as a null value or a suppression
 * flag.
 */
import type { DataQuality } from "./types";

export interface FieldMeta {
  key: string;
  /** What the page calls it. */
  label: string;
  /** What the publisher calls it. Never paraphrased. */
  measure: string;
  sourceId: string;
  quality: DataQuality;
  unit?: "percent" | "audWeekly" | "years" | "people" | "count" | "sqkm" | "perHousehold" | "metres";
  /** Only where we calculated rather than copied. */
  methodology?: string;
  /** What this number cannot be used for. */
  limitation?: string;
}

const CENSUS = "abs-census-2021-gcp-sal";
const SAL = "abs-asgs-sal";
const POA = "abs-asgs-poa";
const BOUNDARIES = "abs-asgs-sal-boundaries";
const OSM = "osm-amenities";
const LISTINGS = "migrent-listings";

export const FIELDS: Record<string, FieldMeta> = {
  population: {
    key: "population",
    label: "Population",
    measure: "Total persons (Census 2021, place of usual residence)",
    sourceId: CENSUS,
    quality: "verified",
    unit: "people",
    limitation:
      "A count from Census night, 10 August 2021, not a current estimate. Small counts are randomly adjusted by the ABS to protect confidentiality.",
  },
  medianAge: {
    key: "medianAge",
    label: "Median age",
    measure: "Median age of persons",
    sourceId: CENSUS,
    quality: "verified",
    unit: "years",
  },
  medianWeeklyRent: {
    key: "medianWeeklyRent",
    label: "Median weekly rent",
    measure: "Median rent (weekly), all rented dwellings",
    sourceId: CENSUS,
    quality: "verified",
    unit: "audWeekly",
    limitation:
      "This is the 2021 Census median across whole rented dwellings - houses and units, not rooms. It is not a room rent and it is not a current market rate.",
  },
  medianWeeklyHouseholdIncome: {
    key: "medianWeeklyHouseholdIncome",
    label: "Median weekly household income",
    measure: "Median total household income (weekly)",
    sourceId: CENSUS,
    quality: "verified",
    unit: "audWeekly",
  },
  medianWeeklyPersonalIncome: {
    key: "medianWeeklyPersonalIncome",
    label: "Median weekly personal income",
    measure: "Median total personal income (weekly)",
    sourceId: CENSUS,
    quality: "verified",
    unit: "audWeekly",
  },
  averageHouseholdSize: {
    key: "averageHouseholdSize",
    label: "Average household size",
    measure: "Average household size",
    sourceId: CENSUS,
    quality: "verified",
    unit: "perHousehold",
  },
  overseasBornPct: {
    key: "overseasBornPct",
    label: "Residents born overseas",
    measure: "Country of birth: elsewhere, as a share of total persons",
    sourceId: CENSUS,
    quality: "derived",
    unit: "percent",
    methodology:
      "Birthplace elsewhere divided by total persons, from Census table G01. Residents who did not state a birthplace stay in the denominator, so this is a floor rather than a point estimate.",
  },
  otherLanguageAtHomePct: {
    key: "otherLanguageAtHomePct",
    label: "Speak a language other than English at home",
    measure: "Language used at home: other language, as a share of total persons",
    sourceId: CENSUS,
    quality: "derived",
    unit: "percent",
    methodology: "Language used at home other than English divided by total persons, from Census table G01.",
  },
  topCountriesOfBirth: {
    key: "topCountriesOfBirth",
    label: "Most common overseas countries of birth",
    measure: "Country of birth of person, persons totals",
    sourceId: CENSUS,
    quality: "derived",
    unit: "percent",
    methodology:
      "The five largest overseas countries of birth by persons counted, from Census tables G09F to G09H. Australia, the 'elsewhere' residual and 'not stated' are excluded.",
    limitation:
      "This is a description of who lives somewhere, nothing more. MigRent does not rank suburbs by the origins of their residents.",
  },
  topLanguagesAtHome: {
    key: "topLanguagesAtHome",
    label: "Most common languages used at home",
    measure: "Language used at home, persons totals",
    sourceId: CENSUS,
    quality: "derived",
    unit: "percent",
    methodology:
      "The five largest non-English languages by persons counted, from Census tables G13C to G13E. Language-group subtotals and residual 'other' categories are excluded.",
  },
  rentedDwellingsPct: {
    key: "rentedDwellingsPct",
    label: "Dwellings that are rented",
    measure: "Rented dwellings as a share of all occupied private dwellings",
    sourceId: CENSUS,
    quality: "derived",
    unit: "percent",
    methodology: "Total rented across all landlord types divided by total occupied private dwellings, from Census table G37.",
  },
  dwellingTypes: {
    key: "dwellingTypes",
    label: "Dwelling types",
    measure: "Dwelling structure of occupied private dwellings",
    sourceId: CENSUS,
    quality: "derived",
    unit: "percent",
    methodology: "Each dwelling structure as a share of total occupied private dwellings, from Census table G37.",
  },
  areaSqKm: {
    key: "areaSqKm",
    label: "Area",
    measure: "Suburb and Locality area (Albers equal-area projection)",
    sourceId: SAL,
    quality: "verified",
    unit: "sqkm",
  },
  postcodes: {
    key: "postcodes",
    label: "Postcode",
    measure: "ABS Postal Areas overlapping this suburb",
    sourceId: POA,
    quality: "approximate",
    methodology:
      "ABS Postal Areas are built from mesh blocks to approximate postcodes. We list every Postal Area overlapping the suburb, largest overlap first.",
    limitation:
      "Postal Areas are the ABS's approximation, not Australia Post's postcode boundaries, and one suburb can sit across several. Confirm the postcode on the address itself before using it for mail.",
  },
  centre: {
    key: "centre",
    label: "Location",
    measure: "Centre of the published SAL boundary extent (GDA2020)",
    sourceId: BOUNDARIES,
    quality: "approximate",
    methodology: "The midpoint of the suburb's published bounding box.",
    limitation:
      "The centre of the extent, not a population-weighted centroid. For a long or L-shaped locality it can sit away from where people live.",
  },
  amenityCounts: {
    key: "amenityCounts",
    label: "Mapped amenities",
    measure: "OpenStreetMap features inside the suburb boundary",
    sourceId: OSM,
    quality: "derived",
    unit: "count",
    methodology:
      "Every OpenStreetMap node or way carrying the relevant tag, tested against the suburb's actual boundary polygon rather than its bounding box.",
    limitation:
      "OpenStreetMap is volunteer-contributed. A count of zero means nothing is mapped inside the boundary, which is not the same as nothing being there. We count features; we do not rate them, and we publish no walkability score because no free national dataset supports one.",
  },
  nearestTransport: {
    key: "nearestTransport",
    label: "Nearest public transport",
    measure: "Closest mapped station, tram stop or ferry terminal",
    sourceId: OSM,
    quality: "approximate",
    unit: "metres",
    methodology:
      "Straight-line distance from the centre of the suburb's boundary extent to the nearest mapped stop, within 20km.",
    limitation:
      "A straight line, not a walking route and not a travel time. Actual walking distance is always longer, and we do not have a licensed routing engine to calculate it.",
  },
  activeListings: {
    key: "activeListings",
    label: "Rooms on MigRent",
    measure: "Approved, visible MigRent room listings in this suburb",
    sourceId: LISTINGS,
    quality: "verified",
    unit: "count",
    limitation:
      "This is how many rooms are advertised on MigRent right now. It is not a vacancy rate and says nothing about the suburb's wider rental market.",
  },
  medianWeeklyRoomPrice: {
    key: "medianWeeklyRoomPrice",
    label: "Median advertised room price on MigRent",
    measure: "Median advertised weekly price of verified MigRent room listings",
    sourceId: LISTINGS,
    quality: "derived",
    unit: "audWeekly",
    methodology:
      "The median advertised weekly price across approved, visible MigRent listings in this suburb. Published only where the minimum sample is met.",
    limitation:
      "Advertised asking prices, not agreed rents, and only for rooms listed on MigRent. It is not a market median for the suburb.",
  },
};

/** Lookup that never returns undefined, so a render cannot silently drop a source. */
export function fieldMeta(key: string): FieldMeta {
  const meta = FIELDS[key];
  if (!meta) {
    throw new Error(
      `No field metadata for "${key}". Every displayed statistic needs an entry in lib/suburbs/fields.ts.`,
    );
  }
  return meta;
}

/** Human labels for the quality flags, used in the data-quality chip. */
export const QUALITY_LABELS: Record<DataQuality, string> = {
  verified: "Published figure",
  derived: "Calculated by MigRent",
  approximate: "Approximate",
  insufficient_sample: "Not enough data",
  unavailable: "Not available",
  editorially_reviewed: "Editorial, human-reviewed",
};

/** Category keys to the words the page uses for them. */
export const AMENITY_LABELS: Record<string, string> = {
  train_station: "Train and metro stations",
  tram_stop: "Tram and light rail stops",
  ferry_terminal: "Ferry terminals",
  bus_stop: "Bus stops",
  supermarket: "Supermarkets",
  pharmacy: "Pharmacies",
  medical: "Medical centres",
  hospital: "Hospitals",
  school: "Schools",
  university: "Universities and colleges",
  library: "Libraries",
  park: "Parks",
};

/** Singular forms for "nearest X" lines. */
export const TRANSPORT_SINGULAR: Record<string, string> = {
  train_station: "train station",
  tram_stop: "tram or light rail stop",
  ferry_terminal: "ferry terminal",
};

/**
 * Singular amenity labels, for the many suburbs with exactly one of something.
 * "1 Pharmacies" is the kind of detail that makes a page look generated.
 */
const AMENITY_SINGULAR: Record<string, string> = {
  train_station: "Train or metro station",
  tram_stop: "Tram or light rail stop",
  ferry_terminal: "Ferry terminal",
  bus_stop: "Bus stop",
  supermarket: "Supermarket",
  pharmacy: "Pharmacy",
  medical: "Medical centre",
  hospital: "Hospital",
  school: "School",
  university: "University or college",
  library: "Library",
  park: "Park",
};

export function amenityLabel(key: string, count: number): string {
  if (count === 1 && AMENITY_SINGULAR[key]) return AMENITY_SINGULAR[key];
  return AMENITY_LABELS[key] || key.replace(/_/g, " ");
}
