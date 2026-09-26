/**
 * The source manifest.
 *
 * Every number the suburb directory displays has to be traceable to a row in
 * this file: who published it, which dataset, which reference period, under
 * what licence. Nothing is imported that is not declared here first, and the
 * manifest is copied into the generated data so the site can show its own
 * provenance without the ETL having to be present at runtime.
 *
 * Upgrading to ASGS Edition 4 (SAL data due October 2026) means editing the
 * GEOGRAPHY entries' `edition`, `url` and `referencePeriod` and re-running the
 * build. Nothing in lib/ or pages/ knows an edition number.
 */

export const ASGS_EDITION = "3";

const ASGS_BASE =
  "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/access-and-downloads";

const ABS_LICENCE = {
  name: "Creative Commons Attribution 4.0 International",
  url: "https://creativecommons.org/licenses/by/4.0/",
  attribution:
    "Source: Australian Bureau of Statistics, Australian Statistical Geography Standard (ASGS) Edition 3 and Census of Population and Housing 2021. Licensed under CC BY 4.0.",
};

const OSM_LICENCE = {
  name: "Open Database License (ODbL) 1.0",
  url: "https://opendatacommons.org/licenses/odbl/1-0/",
  attribution: "© OpenStreetMap contributors, available under the Open Database License.",
};

/**
 * `file` is the name under .abs-cache/. `sheet`/`member` say which part of a
 * multi-part download the ETL actually reads, so a reader can check our work.
 */
export const SOURCES = [
  {
    id: "abs-asgs-sal",
    group: "geography",
    organisation: "Australian Bureau of Statistics",
    dataset: "ASGS Edition 3 - Suburbs and Localities (SAL) allocation file",
    edition: "Edition 3 (July 2021 - June 2026)",
    referencePeriod: "2021",
    geographyLevel: "Mesh Block to Suburb and Locality (SAL)",
    url: `${ASGS_BASE}/allocation-files/SAL_2021_AUST.xlsx`,
    landingUrl:
      "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/non-abs-structures/suburbs-and-localities",
    file: "SAL_2021_AUST.xlsx",
    licence: ABS_LICENCE,
    provides: ["SAL code", "SAL name", "state"],
  },
  {
    id: "abs-asgs-mb",
    group: "geography",
    organisation: "Australian Bureau of Statistics",
    dataset: "ASGS Edition 3 - Mesh Block allocation file",
    edition: "Edition 3 (July 2021 - June 2026)",
    referencePeriod: "2021",
    geographyLevel: "Mesh Block to SA1/SA2/SA3/SA4/GCCSA/State",
    url: `${ASGS_BASE}/allocation-files/MB_2021_AUST.xlsx`,
    landingUrl:
      "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/latest-release",
    file: "MB_2021_AUST.xlsx",
    licence: ABS_LICENCE,
    provides: ["Greater Capital City Statistical Area", "SA2/SA3/SA4", "mesh block area"],
  },
  {
    id: "abs-asgs-sua",
    group: "geography",
    organisation: "Australian Bureau of Statistics",
    dataset: "ASGS Edition 3 - Significant Urban Areas allocation file",
    edition: "Edition 3 (July 2021 - June 2026)",
    referencePeriod: "2021",
    geographyLevel: "SA2 to Significant Urban Area (SUA)",
    url: `${ASGS_BASE}/allocation-files/SUA_2021_AUST.xlsx`,
    landingUrl:
      "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/significant-urban-areas-urban-centres-and-localities-section-state",
    file: "SUA_2021_AUST.xlsx",
    licence: ABS_LICENCE,
    provides: ["Significant Urban Area (regional city grouping)"],
  },
  {
    id: "abs-asgs-ucl",
    group: "geography",
    organisation: "Australian Bureau of Statistics",
    dataset: "ASGS Edition 3 - Urban Centres and Localities / Section of State allocation file",
    edition: "Edition 3 (July 2021 - June 2026)",
    referencePeriod: "2021",
    geographyLevel: "Mesh Block to UCL / Section of State",
    url: `${ASGS_BASE}/allocation-files/UCL_SOSR_SOS_2021_AUST.xlsx`,
    landingUrl:
      "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/significant-urban-areas-urban-centres-and-localities-section-state",
    file: "UCL_SOSR_SOS_2021_AUST.xlsx",
    licence: ABS_LICENCE,
    provides: ["Urban Centre / Locality", "Section of State (urban, rural, remote)"],
  },
  {
    id: "abs-asgs-poa",
    group: "geography",
    organisation: "Australian Bureau of Statistics",
    dataset: "ASGS Edition 3 - Postal Areas (POA) allocation file",
    edition: "Edition 3 (July 2021 - June 2026)",
    referencePeriod: "2021",
    geographyLevel: "Mesh Block to ABS Postal Area",
    url: `${ASGS_BASE}/allocation-files/POA_2021_AUST.xlsx`,
    landingUrl:
      "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/non-abs-structures/postal-areas",
    file: "POA_2021_AUST.xlsx",
    licence: ABS_LICENCE,
    provides: ["ABS Postal Area approximation of postcodes"],
    limitations:
      "ABS Postal Areas approximate Australia Post postcodes from Mesh Blocks. They are not the legal postcode boundaries, they are not maintained by Australia Post, and one suburb can fall in more than one Postal Area. We label them as approximate and never present them as official postcodes.",
  },
  {
    id: "abs-asgs-sal-boundaries",
    group: "geography",
    organisation: "Australian Bureau of Statistics",
    dataset: "ASGS Edition 3 - Suburbs and Localities digital boundaries (GDA2020, ESRI Shapefile)",
    edition: "Edition 3 (July 2021 - June 2026)",
    referencePeriod: "2021",
    geographyLevel: "SAL polygon extents",
    url: `${ASGS_BASE}/digital-boundary-files/SAL_2021_AUST_GDA2020_SHP.zip`,
    landingUrl: `${ASGS_BASE}/digital-boundary-files`,
    file: "SAL_2021_AUST_GDA2020_SHP.zip",
    licence: ABS_LICENCE,
    provides: ["Suburb extent and centre point (GDA2020)"],
    limitations:
      "We read each SAL's published bounding box and use its centre as the suburb's reference point. That is the centre of the extent, not a population-weighted centroid, so for long or L-shaped localities it can sit away from where people actually live. Distances derived from it are labelled approximate.",
  },
  {
    id: "abs-census-2021-gcp-sal",
    group: "census",
    organisation: "Australian Bureau of Statistics",
    dataset: "Census of Population and Housing 2021, General Community Profile DataPack (Suburbs and Localities)",
    edition: "2021 GCP DataPack, short header, Release 2",
    referencePeriod: "2021 Census (10 August 2021)",
    geographyLevel: "Suburb and Locality (SAL)",
    url: "https://www.abs.gov.au/census/find-census-data/datapacks/download/2021_GCP_SAL_for_AUS_short-header.zip",
    landingUrl: "https://www.abs.gov.au/census/find-census-data/datapacks",
    file: "2021_GCP_SAL_for_AUS_short-header.zip",
    licence: ABS_LICENCE,
    tables: {
      G01: "Selected Person Characteristics by Sex",
      G02: "Selected Medians and Averages",
      "G09F-G09H": "Country of Birth of Person by Age by Sex (persons totals)",
      "G13C-G13E": "Language Used at Home by Proficiency in Spoken English by Sex (persons totals)",
      G37: "Dwelling Structure by Tenure Type and Landlord Type",
    },
    provides: [
      "Population",
      "Median age",
      "Median weekly household income",
      "Median weekly rent (all dwellings)",
      "Average household size",
      "Residents born overseas",
      "Country of birth",
      "Language used at home",
      "Tenure and dwelling structure",
    ],
    limitations:
      "Census counts are a point-in-time measure from August 2021, not a current estimate. The ABS suppresses or randomly perturbs small cells to protect confidentiality, so very small localities show zeroes or blanks rather than real values; we treat those as unavailable rather than as zero. Median weekly rent is the median across all rented dwellings, whole houses and units included - it is not a room rent.",
  },
  {
    id: "osm-amenities",
    group: "amenities",
    organisation: "OpenStreetMap contributors",
    dataset: "OpenStreetMap public transport stops and community amenities (via Overpass API)",
    edition: "Live extract",
    referencePeriod: "Extracted at import time",
    geographyLevel: "Point features within each suburb's bounding box",
    url: "https://overpass-api.de/api/interpreter",
    landingUrl: "https://www.openstreetmap.org/copyright",
    file: "osm-amenities.json",
    licence: OSM_LICENCE,
    provides: [
      "Train, metro, tram and ferry stops",
      "Supermarkets, pharmacies, medical centres and hospitals",
      "Schools and universities",
      "Libraries and parks",
    ],
    limitations:
      "OpenStreetMap is contributed by volunteers, so coverage is excellent in cities and patchy in remote areas. A count of zero means nothing was mapped inside the suburb's boundary, which is not the same as nothing being there. We count features, we do not rate them, and we do not publish a walkability score because no free national dataset supports one.",
  },
  {
    id: "migrent-listings",
    group: "platform",
    organisation: "MigRent",
    dataset: "MigRent verified room listings",
    edition: "Live",
    referencePeriod: "Rolling 90 days to the import date",
    geographyLevel: "Listing suburb and state, matched to SAL",
    url: null,
    landingUrl: "/seeker/search",
    file: null,
    licence: { name: "MigRent internal data", url: null, attribution: "MigRent platform data." },
    provides: ["Active verified rooms", "Advertised weekly room price", "Bills included", "Furnished"],
    limitations:
      "These are advertised asking prices for rooms listed on MigRent, not agreed rents and not a whole-suburb market measure. We publish a median only where the minimum sample is met, and we never describe listing availability as a suburb vacancy rate.",
  },
];

/** Minimum number of listings before a MigRent median is shown at all. */
export const MIN_LISTING_SAMPLE = 5;

/** Only these Overpass categories are imported, with the tag filters used. */
export const OSM_CATEGORIES = [
  { key: "train_station", label: "Train and metro stations", filters: ['["railway"="station"]', '["railway"="halt"]'] },
  { key: "tram_stop", label: "Tram and light rail stops", filters: ['["railway"="tram_stop"]'] },
  { key: "ferry_terminal", label: "Ferry terminals", filters: ['["amenity"="ferry_terminal"]'] },
  { key: "bus_stop", label: "Bus stops", filters: ['["highway"="bus_stop"]'] },
  { key: "supermarket", label: "Supermarkets", filters: ['["shop"="supermarket"]'] },
  { key: "pharmacy", label: "Pharmacies", filters: ['["amenity"="pharmacy"]'] },
  { key: "medical", label: "Medical centres and clinics", filters: ['["amenity"="clinic"]', '["amenity"="doctors"]'] },
  { key: "hospital", label: "Hospitals", filters: ['["amenity"="hospital"]'] },
  { key: "school", label: "Schools", filters: ['["amenity"="school"]'] },
  { key: "university", label: "Universities and colleges", filters: ['["amenity"="university"]', '["amenity"="college"]'] },
  { key: "library", label: "Libraries", filters: ['["amenity"="library"]'] },
  { key: "park", label: "Parks", filters: ['["leisure"="park"]'] },
];

export const LICENCES = { ABS: ABS_LICENCE, OSM: OSM_LICENCE };
