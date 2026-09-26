/**
 * Server-side access to the generated suburb data.
 *
 * Everything here reads from data/suburbs/, which is written offline by
 * scripts/abs/build-suburbs.mjs. This module must never be imported from a
 * component that runs in the browser: the places index alone is 1.4MB, and
 * the detail buckets together are 20MB.
 *
 * Reads are memoised in module scope. On Vercel that means once per warm
 * lambda rather than once per request, which is what keeps a suburb page's
 * server time in single-digit milliseconds after the first hit.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Manifest, PlaceDetail, PlaceSummary, Region } from "./types";

const DATA_DIR = join(process.cwd(), "data", "suburbs");

function readJson<T>(...segments: string[]): T {
  return JSON.parse(readFileSync(join(DATA_DIR, ...segments), "utf8")) as T;
}

let manifestCache: Manifest | null = null;
export function loadManifest(): Manifest {
  if (!manifestCache) manifestCache = readJson<Manifest>("manifest.json");
  return manifestCache;
}

let regionsCache: Region[] | null = null;
export function loadRegions(): Region[] {
  if (!regionsCache) regionsCache = readJson<Region[]>("regions.json");
  return regionsCache;
}

export function getRegion(id: string): Region | null {
  return loadRegions().find((r) => r.id === id) ?? null;
}

interface PlacesFile {
  columns: string[];
  rows: (string | number | null)[][];
}

let placesCache: PlaceSummary[] | null = null;

/**
 * The full index, decoded from the compact row form the ETL writes.
 *
 * 15,334 objects is a few megabytes of heap held for the life of the lambda,
 * which is the trade that lets search and the region listings answer without
 * touching the filesystem again.
 */
export function loadPlaces(): PlaceSummary[] {
  if (placesCache) return placesCache;
  const file = readJson<PlacesFile>("places.json");
  placesCache = file.rows.map((r) => ({
    salCode: r[0] as string,
    name: r[1] as string,
    slug: r[2] as string,
    state: r[3] as string,
    regionId: r[4] as string,
    postcode: (r[5] as string | null) ?? null,
    population: (r[6] as number) ?? 0,
    overseasBornPct: (r[7] as number | null) ?? null,
    lat: (r[8] as number | null) ?? null,
    lng: (r[9] as number | null) ?? null,
    lgaQualifier: (r[10] as string | null) ?? null,
    hasEditorial: r[11] === 1,
  }));
  return placesCache;
}

let byUrlCache: Map<string, PlaceSummary> | null = null;
function byUrl(): Map<string, PlaceSummary> {
  if (byUrlCache) return byUrlCache;
  byUrlCache = new Map();
  for (const p of loadPlaces()) byUrlCache.set(`${p.state.toLowerCase()}/${p.slug}`, p);
  return byUrlCache;
}

let bySalCache: Map<string, PlaceSummary> | null = null;
function bySal(): Map<string, PlaceSummary> {
  if (bySalCache) return bySalCache;
  bySalCache = new Map();
  for (const p of loadPlaces()) bySalCache.set(p.salCode, p);
  return bySalCache;
}

export function findPlace(state: string, slug: string): PlaceSummary | null {
  return byUrl().get(`${state.toLowerCase()}/${slug.toLowerCase()}`) ?? null;
}

export function findPlaceBySalCode(salCode: string): PlaceSummary | null {
  return bySal().get(salCode) ?? null;
}

/**
 * Every place whose slug matches, across all states.
 *
 * This is what makes the legacy single-segment URLs work: /suburb/auburn has
 * to resolve to something, and there are two Auburns.
 */
export function findPlacesBySlug(slug: string): PlaceSummary[] {
  const wanted = slug.toLowerCase();
  return loadPlaces().filter((p) => p.slug === wanted);
}

const detailCache = new Map<string, Record<string, PlaceDetail>>();

/** Load one detail record, pulling in its 200KB bucket the first time. */
export function getPlaceDetail(salCode: string): PlaceDetail | null {
  const bucket = salCode.slice(-2).padStart(2, "0");
  let records = detailCache.get(bucket);
  if (!records) {
    try {
      records = readJson<Record<string, PlaceDetail>>("detail", `${bucket}.json`);
    } catch {
      return null;
    }
    detailCache.set(bucket, records);
  }
  return records[salCode] ?? null;
}

export type RegionSort = "name" | "population" | "overseas";

const SORTS: Record<RegionSort, (a: PlaceSummary, b: PlaceSummary) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  population: (a, b) => b.population - a.population || a.name.localeCompare(b.name),
  overseas: (a, b) => (b.overseasBornPct ?? -1) - (a.overseasBornPct ?? -1) || a.name.localeCompare(b.name),
};

let byRegionCache: Map<string, PlaceSummary[]> | null = null;
function byRegion(): Map<string, PlaceSummary[]> {
  if (byRegionCache) return byRegionCache;
  byRegionCache = new Map();
  for (const p of loadPlaces()) {
    let list = byRegionCache.get(p.regionId);
    if (!list) { list = []; byRegionCache.set(p.regionId, list); }
    list.push(p);
  }
  return byRegionCache;
}

/**
 * A page of one region's places.
 *
 * The directory never renders a whole region: Sydney alone is 923 cards and
 * "Regional and remote New South Wales" is 2,898. Six come down with the
 * first render and the rest are fetched a page at a time.
 */
export function getRegionPlaces(
  regionId: string,
  { offset = 0, limit = 6, sort = "population" as RegionSort } = {},
): { places: PlaceSummary[]; total: number } {
  const all = byRegion().get(regionId) ?? [];
  const sorted = [...all].sort(SORTS[sort] ?? SORTS.population);
  return { places: sorted.slice(offset, offset + limit), total: all.length };
}

/** Great-circle metres. Duplicated from the ETL because this runs in the app. */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371008.8;
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * The nearest places in the same region, by straight-line distance.
 *
 * Genuinely nearby rather than alphabetically adjacent, which is what makes
 * the "related suburbs" strip worth following.
 */
export function getNearbyPlaces(place: PlaceSummary, limit = 6): PlaceSummary[] {
  const pool = byRegion().get(place.regionId) ?? [];
  if (place.lat == null || place.lng == null) {
    return pool.filter((p) => p.salCode !== place.salCode).slice(0, limit);
  }
  const scored: { p: PlaceSummary; d: number }[] = [];
  for (const p of pool) {
    if (p.salCode === place.salCode || p.lat == null || p.lng == null) continue;
    scored.push({ p, d: haversine(place.lat, place.lng, p.lat, p.lng) });
  }
  scored.sort((a, b) => a.d - b.d);
  return scored.slice(0, limit).map((s) => s.p);
}

/** Region id to display name, for cards and breadcrumbs. */
let regionNamesCache: Map<string, Region> | null = null;
export function regionMap(): Map<string, Region> {
  if (!regionNamesCache) {
    regionNamesCache = new Map(loadRegions().map((r) => [r.id, r]));
  }
  return regionNamesCache;
}
