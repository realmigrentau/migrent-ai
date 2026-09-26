/**
 * The shapes the generated suburb data comes in.
 *
 * These mirror what scripts/abs/build-suburbs.mjs writes into data/suburbs/.
 * Nothing here is fetched from the browser: places and detail records are
 * read server-side, and the client only ever receives the handful of fields
 * a card or a page actually renders.
 */

/**
 * How much weight a displayed number carries.
 *
 * `verified`             published by the source as-is (Census median age)
 * `derived`              we calculated it from published counts, per a stated method
 * `approximate`          right order of magnitude, wrong to treat as exact
 * `insufficient_sample`  we have the data but too little of it to publish a figure
 * `unavailable`          no trustworthy source, so nothing is shown
 * `editorially_reviewed` a person wrote it and a person checked it
 */
export type DataQuality =
  | "verified"
  | "derived"
  | "approximate"
  | "insufficient_sample"
  | "unavailable"
  | "editorially_reviewed";

export type RegionKind = "capital" | "urban" | "rest";

export interface Region {
  id: string;
  name: string;
  kind: RegionKind;
  state: string;
  order: number;
  suaCode: string | null;
  gccsaCode: string | null;
  note: string | null;
  placeCount: number;
}

/** The compact record behind every card, search result and listing row. */
export interface PlaceSummary {
  salCode: string;
  name: string;
  slug: string;
  state: string;
  regionId: string;
  postcode: string | null;
  population: number;
  overseasBornPct: number | null;
  lat: number | null;
  lng: number | null;
  /** Set only where the LGA is what distinguishes this place from a namesake. */
  lgaQualifier: string | null;
  hasEditorial: boolean;
}

export interface CountryOrLanguage {
  name: string;
  count: number;
  pct: number | null;
}

export interface CensusStats {
  population: number;
  medianAge: number | null;
  medianWeeklyRent: number | null;
  medianWeeklyHouseholdIncome: number | null;
  medianWeeklyPersonalIncome: number | null;
  averageHouseholdSize: number | null;
  averagePersonsPerBedroom: number | null;
  overseasBornPct: number | null;
  bornAustraliaPct: number | null;
  otherLanguageAtHomePct: number | null;
  englishOnlyAtHomePct: number | null;
  totalDwellings: number;
  rentedDwellings: number;
  rentedDwellingsPct: number | null;
  ownedOutrightPct: number | null;
  mortgagedPct: number | null;
  dwellingTypes: {
    separateHouse: number | null;
    semiDetached: number | null;
    flatOrApartment: number | null;
    other: number | null;
  } | null;
  topCountriesOfBirth: CountryOrLanguage[] | null;
  topLanguagesAtHome: CountryOrLanguage[] | null;
  /** True when the place is too small for the ABS figures to support rates. */
  ratesSuppressed: boolean;
}

export interface NearestStop {
  category: string;
  name: string | null;
  /** Straight-line from the suburb's extent centre. Never a walking distance. */
  distanceMetres: number;
}

export interface AmenityData {
  counts: Record<string, number>;
  nearest: NearestStop[];
}

export interface EditorialContent {
  summary: string;
  loves: string[];
  thingsToKnow: string[];
  transportNote: string | null;
  reviewedOn: string;
}

export interface PlaceMapping {
  method: string;
  share: number;
  gccsaCode: string | null;
  suaCode: string | null;
  sourceGeography: string;
}

export interface PlaceDetail {
  salCode: string;
  name: string;
  publishedName: string;
  lgaQualifier: string | null;
  disambiguatedBy: "lga" | "sal-code" | null;
  slug: string;
  state: string;
  stateName: string;
  regionId: string;
  postcodes: string[];
  areaSqKm: number;
  sectionOfState: string | null;
  centre: { lat: number; lng: number } | null;
  bbox: [number, number, number, number] | null;
  mapping: PlaceMapping;
  census: CensusStats | null;
  amenities: AmenityData | null;
  editorial: EditorialContent | null;
}

export interface SourceRecord {
  id: string;
  group: string;
  organisation: string;
  dataset: string;
  edition: string;
  referencePeriod: string;
  geographyLevel: string;
  url: string | null;
  landingUrl: string | null;
  licence: { name: string; url: string | null; attribution: string };
  provides: string[];
  limitations: string | null;
  tables: Record<string, string> | null;
  downloadedAt: string | null;
  sha256: string | null;
  bytes: number | null;
}

export interface Manifest {
  generatedAt: string;
  asgsEdition: string;
  censusYear: string;
  minPopulationForRates: number;
  minListingSample: number;
  counts: {
    rawSalRecords: number;
    excludedSpecialPurpose: number;
    publicPlaces: number;
    assignedToCapital: number;
    assignedToUrbanArea: number;
    assignedToStateRemainder: number;
    failedValidation: number;
    regions: number;
    disambiguatedNames: number;
    missingBoundaryGeometry: number;
  };
  coverage: Record<string, number>;
  excluded: { salCode: string; name: string; reason: string }[];
  amenities: {
    fetchedAt: string | null;
    categories: { key: string; label: string }[];
    unavailableCategories: string[];
    tilesUnanswered: Record<string, number>;
    allCategories: { key: string; label: string }[];
  };
  sources: SourceRecord[];
}

/**
 * MigRent's own room-market figures, computed from verified listings only.
 *
 * Deliberately never called a vacancy rate: this is what is advertised on
 * MigRent right now, not a measure of the suburb's rental market.
 */
export interface ListingStats {
  activeListings: number;
  sampleSize: number;
  medianWeeklyRoomPrice: number | null;
  priceRange: [number, number] | null;
  billsIncludedPct: number | null;
  furnishedPct: number | null;
  mostRecentListedAt: string | null;
  /**
   * What the figures were computed over. Currently always the set of
   * approved, visible listings at `calculatedAt` - a rolling time window
   * would exclude long-standing listings and understate what is actually
   * advertised.
   */
  basis: "active-listings";
  calculatedAt: string;
  /** `insufficient_sample` until the minimum number of listings is reached. */
  quality: DataQuality;
}
