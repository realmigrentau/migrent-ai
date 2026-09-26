/**
 * The "Cities and regions" taxonomy.
 *
 * Australia has no single legal list of cities, so the grouping on /suburbs is
 * ABS statistical geography rather than anything we invented:
 *
 *   1. A Greater Capital City Statistical Area (GCCSA) makes a capital region.
 *   2. Otherwise a Significant Urban Area (SUA) makes a regional-city region.
 *   3. Otherwise the locality falls into "Regional and remote <State>".
 *
 * A suburb is never put in a city because its name sounds like it belongs
 * there. Every assignment comes from which mesh blocks the suburb is built
 * from, and the method used is stored on the record.
 */

/** GCCSA code -> the capital region we publish, in the order the page uses. */
export const CAPITALS = [
  { gccsa: "1GSYD", id: "sydney", name: "Sydney", state: "NSW", order: 1 },
  { gccsa: "2GMEL", id: "melbourne", name: "Melbourne", state: "VIC", order: 2 },
  { gccsa: "3GBRI", id: "brisbane", name: "Brisbane", state: "QLD", order: 3 },
  { gccsa: "5GPER", id: "perth", name: "Perth", state: "WA", order: 4 },
  { gccsa: "4GADE", id: "adelaide", name: "Adelaide", state: "SA", order: 5 },
  { gccsa: "8ACTE", id: "canberra", name: "Canberra", state: "ACT", order: 6 },
  { gccsa: "6GHOB", id: "hobart", name: "Hobart", state: "TAS", order: 7 },
  { gccsa: "7GDAR", id: "darwin", name: "Darwin", state: "NT", order: 8 },
];

/**
 * The ACT's GCCSA is the whole territory, not just the built-up city, so the
 * heading gets a note rather than quietly implying Tharwa is inner Canberra.
 */
export const REGION_NOTES = {
  canberra:
    "The ABS treats the whole Australian Capital Territory as one Greater Capital City Statistical Area, so this group includes the territory's rural localities as well as Canberra's suburbs.",
};

/** State/territory code -> abbreviation and full name. */
export const STATES = {
  1: { abbr: "NSW", name: "New South Wales" },
  2: { abbr: "VIC", name: "Victoria" },
  3: { abbr: "QLD", name: "Queensland" },
  4: { abbr: "SA", name: "South Australia" },
  5: { abbr: "WA", name: "Western Australia" },
  6: { abbr: "TAS", name: "Tasmania" },
  7: { abbr: "NT", name: "Northern Territory" },
  8: { abbr: "ACT", name: "Australian Capital Territory" },
  9: { abbr: "OT", name: "Other Territories" },
};

export const STATE_BY_NAME = Object.fromEntries(
  Object.values(STATES).map((s) => [s.name, s]),
);

/** Display order for the state groupings below the capitals. */
export const STATE_ORDER = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT", "OT"];

/**
 * ABS geographies that exist to hold records with no real location. Anything
 * matching these never becomes a public page.
 *
 * In SAL Edition 3 these are the 19 codes at the end of each state's range
 * plus the national "Outside Australia" code.
 */
const SPECIAL_PURPOSE_PATTERNS = [
  /^no usual address/i,
  /^migratory\s*-\s*offshore\s*-\s*shipping/i,
  /^outside australia$/i,
  /^unincorporated/i,
  /\bnot? usual address\b/i,
];

/**
 * True when a SAL record is an ABS balancing code rather than a place.
 *
 * Edition 3 has exactly 19 of these: "No usual address (X)" and
 * "Migratory - Offshore - Shipping (X)" for each of the nine state/territory
 * groupings, plus the national "Outside Australia" at code ZZZZZ.
 *
 * The test is on the name rather than the code range. The 9xxxx band is the
 * Other Territories, and it holds five entirely real places - Christmas
 * Island, Home Island, Jervis Bay, Norfolk Island and West Island - which
 * people do live in and search for. Excluding by code range silently dropped
 * all five.
 */
export function isSpecialPurpose(salCode, salName) {
  const code = String(salCode || "").trim().toUpperCase();
  if (code === "" || code.startsWith("Z")) return true;
  const name = String(salName || "").trim();
  return SPECIAL_PURPOSE_PATTERNS.some((re) => re.test(name));
}

/** A GCCSA that is a capital city rather than "Rest of ..." or a balancing code. */
export function capitalForGccsa(gccsaCode) {
  return CAPITALS.find((c) => c.gccsa === String(gccsaCode || "").toUpperCase()) || null;
}

/** SUA names the ABS uses for "this SA2 is not in a significant urban area". */
export function isRealSua(suaName) {
  const n = String(suaName || "");
  return n !== "" && !/^not in any significant urban area/i.test(n) && !/^(outside australia|migratory)/i.test(n);
}

/** "Newcastle - Maitland" -> "newcastle-maitland" */
export function regionSlug(name) {
  return String(name)
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build the region record a place belongs to.
 * `kind` drives both ordering and the copy shown under each heading.
 */
export function makeRegion({ kind, id, name, state, order, suaCode, gccsaCode }) {
  return {
    id,
    name,
    kind, // "capital" | "urban" | "rest"
    state,
    order,
    suaCode: suaCode || null,
    gccsaCode: gccsaCode || null,
    note: REGION_NOTES[id] || null,
  };
}

/** Sort key so capitals lead, then regional cities by state, then rest-of-state. */
export function regionSortKey(region) {
  const stateRank = STATE_ORDER.indexOf(region.state);
  if (region.kind === "capital") return [0, region.order, ""];
  if (region.kind === "urban") return [1, stateRank, region.name];
  return [2, stateRank, region.name];
}
