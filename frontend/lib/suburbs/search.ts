/**
 * Suburb search.
 *
 * Pure functions over a places array, so the whole thing is unit-testable
 * without touching the filesystem. It runs server-side behind
 * /api/suburbs/search: 15,334 places is far too much index to ship to a
 * phone, and doing the work on the server keeps the page's JavaScript to the
 * combobox itself.
 *
 * What it has to cope with, from real searches:
 *
 *   "kellyville"        a name
 *   "richmond vic"      a name plus a state abbreviation
 *   "richmond victoria" a name plus a state, spelled out
 *   "2150"              a postcode
 *   "st marys"          an apostrophe the user did not type
 *   "melborne"          a typo
 *   "newcastle"         a city rather than a suburb
 */
import type { PlaceSummary, Region } from "./types";

export interface SearchResult {
  place: PlaceSummary;
  regionName: string;
  score: number;
  /** Why this matched, so the UI can explain a fuzzy or postcode hit. */
  matchedOn: "name" | "postcode" | "region" | "fuzzy";
}

export interface SearchResponse {
  results: SearchResult[];
  /** Regions whose own name matched, offered above the suburbs. */
  regions: { region: Region; score: number }[];
  total: number;
  query: string;
}

/** Both the abbreviation and the full name, either of which people type. */
const STATE_TOKENS: Record<string, string> = {
  nsw: "NSW",
  "new south wales": "NSW",
  vic: "VIC",
  victoria: "VIC",
  qld: "QLD",
  queensland: "QLD",
  wa: "WA",
  "western australia": "WA",
  sa: "SA",
  "south australia": "SA",
  tas: "TAS",
  tasmania: "TAS",
  nt: "NT",
  "northern territory": "NT",
  act: "ACT",
  "australian capital territory": "ACT",
  ot: "OT",
  "other territories": "OT",
};

/**
 * Lowercase, strip apostrophes entirely and everything else to spaces.
 *
 * Apostrophes go rather than becoming spaces so that "st marys", "st mary's"
 * and "stmarys" all normalise together - the ABS writes it "St Marys" and
 * people type it every other way.
 */
export function normalise(value: string): string {
  return String(value)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['‘’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Pull a trailing or leading state token out of the query.
 * "richmond vic" -> { rest: "richmond", state: "VIC" }
 */
export function extractState(normalised: string): { rest: string; state: string | null } {
  // Longest tokens first, so "south australia" wins over "sa".
  const tokens = Object.keys(STATE_TOKENS).sort((a, b) => b.length - a.length);
  for (const token of tokens) {
    if (normalised === token) return { rest: "", state: STATE_TOKENS[token] };
    if (normalised.endsWith(` ${token}`)) {
      return { rest: normalised.slice(0, -(token.length + 1)).trim(), state: STATE_TOKENS[token] };
    }
    if (normalised.startsWith(`${token} `)) {
      return { rest: normalised.slice(token.length + 1).trim(), state: STATE_TOKENS[token] };
    }
  }
  return { rest: normalised, state: null };
}

/**
 * Levenshtein distance, abandoned as soon as it exceeds `max`.
 *
 * Bounded because the only question asked is "is this within one or two
 * edits", and a full matrix over 15,334 names per keystroke is not free.
 */
export function boundedEditDistance(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let prev = new Array(b.length + 1);
  let cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    const swap = prev; prev = cur; cur = swap;
  }
  return prev[b.length];
}

/** Bigger places and places we have written about rank above empty paddocks. */
function prominence(place: PlaceSummary, regionKind: string | undefined): number {
  let score = 0;
  if (place.population > 0) score += Math.min(Math.log10(place.population) * 12, 60);
  if (regionKind === "capital") score += 24;
  else if (regionKind === "urban") score += 10;
  if (place.hasEditorial) score += 40;
  return score;
}

const MAX_RESULTS = 12;

/**
 * Rank places against a query.
 *
 * Exact and prefix matches are collected first; the fuzzy pass only runs when
 * those came up short, so a well-spelled query never pays for typo tolerance.
 */
export function searchPlaces(
  places: PlaceSummary[],
  regions: Map<string, Region>,
  rawQuery: string,
  { limit = MAX_RESULTS, state: stateFilter = null as string | null } = {},
): SearchResponse {
  const query = String(rawQuery || "").trim();
  const normalisedQuery = normalise(query);
  if (!normalisedQuery) return { results: [], regions: [], total: 0, query };

  const { rest, state: queryState } = extractState(normalisedQuery);
  const state = stateFilter || queryState;
  const term = rest || normalisedQuery;
  const isPostcode = /^\d{3,4}$/.test(term);

  // Regions whose own name matches, e.g. "newcastle" or "geelong".
  const regionHits: { region: Region; score: number }[] = [];
  if (!isPostcode && term.length >= 3) {
    for (const region of regions.values()) {
      if (state && region.state !== state) continue;
      const name = normalise(region.name);
      if (name === term) regionHits.push({ region, score: 1000 });
      else if (name.startsWith(term)) regionHits.push({ region, score: 800 });
      else if (name.includes(term)) regionHits.push({ region, score: 500 });
    }
    regionHits.sort((a, b) => b.score - a.score || b.region.placeCount - a.region.placeCount);
  }

  const scored: SearchResult[] = [];
  let exactish = 0;

  for (const place of places) {
    if (state && place.state !== state) continue;
    const region = regions.get(place.regionId);

    if (isPostcode) {
      if (place.postcode !== term.padStart(4, "0") && place.postcode !== term) continue;
      scored.push({
        place,
        regionName: region?.name ?? "",
        score: 900 + prominence(place, region?.kind),
        matchedOn: "postcode",
      });
      exactish++;
      continue;
    }

    const name = normalise(place.name);
    let base = 0;
    let matchedOn: SearchResult["matchedOn"] = "name";

    if (name === term) base = 1000;
    else if (name.startsWith(term)) base = 800;
    else if (name.includes(` ${term}`)) base = 640;
    else if (name.includes(term)) base = 480;
    else if (region && normalise(region.name) === term) { base = 300; matchedOn = "region"; }

    if (base > 0) {
      if (matchedOn === "name") exactish++;
      scored.push({ place, regionName: region?.name ?? "", score: base + prominence(place, region?.kind), matchedOn });
    }
  }

  // Typo tolerance, only where the literal passes did not find much.
  if (!isPostcode && exactish < limit && term.length >= 4) {
    const max = term.length >= 7 ? 2 : 1;
    const seen = new Set(scored.map((s) => s.place.salCode));
    for (const place of places) {
      if (seen.has(place.salCode)) continue;
      if (state && place.state !== state) continue;
      const name = normalise(place.name);
      // Compare against the whole name and its first word, so "melborne"
      // still reaches "Melbourne" inside a longer published name.
      const candidates = [name, name.split(" ")[0]];
      let best = max + 1;
      for (const c of candidates) {
        const d = boundedEditDistance(term, c, max);
        if (d < best) best = d;
      }
      if (best > max) continue;
      const region = regions.get(place.regionId);
      scored.push({
        place,
        regionName: region?.name ?? "",
        score: 260 - best * 60 + prominence(place, region?.kind),
        matchedOn: "fuzzy",
      });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name));

  return {
    results: scored.slice(0, limit),
    regions: regionHits.slice(0, 3),
    total: scored.length,
    query,
  };
}

/**
 * The label a result shows.
 *
 * The state is always present, because 955 Australian place names are shared
 * by more than one locality and a bare name is genuinely ambiguous. The LGA
 * is added only where two places in the same state share a name.
 */
export function resultLabel(place: PlaceSummary): string {
  return place.lgaQualifier
    ? `${place.name} (${place.lgaQualifier}), ${place.state}`
    : `${place.name}, ${place.state}`;
}

/** The canonical path for a place. */
export function placeHref(place: Pick<PlaceSummary, "state" | "slug">): string {
  return `/suburb/${place.state.toLowerCase()}/${place.slug}`;
}
