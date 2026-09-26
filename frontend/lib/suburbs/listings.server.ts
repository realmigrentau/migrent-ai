/**
 * MigRent's own room figures, from MigRent's own listings.
 *
 * These are the only numbers on a suburb page that are ours rather than the
 * ABS's, and they are the ones most likely to be misread, so the rules are
 * strict:
 *
 *  - Only approved, visible listings count. A listing hidden, awaiting
 *    moderation or pending deletion is not a room anyone can rent.
 *  - A median is published only once MIN_LISTING_SAMPLE listings exist in the
 *    suburb. Below that the page says there is not enough data, because the
 *    "median" of two rooms is just one of the two rooms.
 *  - None of this is ever called a vacancy rate. It is a count of what is
 *    advertised on one platform, which is a different thing from how much of
 *    a suburb's housing stock is empty.
 *
 * Listings are matched to suburbs by name and postcode. Where a name is
 * ambiguous and the postcode does not settle it, the listing is counted
 * nationally but attributed to no suburb - a miscounted suburb is worse than
 * an uncounted one.
 */
import { createClient } from "@supabase/supabase-js";
import type { ListingStats, PlaceSummary } from "./types";
import { loadPlaces } from "./data.server";
import { normalise } from "./search";

/** Below this many listings in a suburb, no median is published. */
export const MIN_LISTING_SAMPLE = 5;

interface ListingRow {
  suburb: string | null;
  postcode: number | null;
  weekly_price: number | null;
  furnished: boolean | null;
  bills_included: boolean | null;
  created_at: string | null;
}

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Listings that are actually rentable right now.
 *
 * Never throws and never hangs. This runs inside getStaticProps for the
 * directory and for every suburb page, so an unreachable or slow database has
 * to degrade to "room data unavailable" rather than stall a deploy or fail
 * 15,334 pages.
 */
const QUERY_TIMEOUT_MS = 8000;

async function fetchActiveListings(): Promise<ListingRow[] | null> {
  const supabase = client();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("suburb, postcode, weekly_price, furnished, bills_included, created_at")
      .eq("moderation_status", "approved")
      .is("hidden_at", null)
      .is("delete_approved_at", null)
      .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));
    if (error) return null;
    return (data ?? []) as ListingRow[];
  } catch {
    // DNS failure, timeout, malformed env - all the same answer to a caller.
    return null;
  }
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

interface Bucket {
  rows: ListingRow[];
}

/**
 * Group every active listing onto a SAL code.
 *
 * Returns a map keyed by SAL code plus a count of listings that could not be
 * placed, which the directory surfaces rather than hides.
 */
function bucketBySalCode(rows: ListingRow[], places: PlaceSummary[]) {
  const bySlug = new Map<string, PlaceSummary[]>();
  for (const p of places) {
    let list = bySlug.get(p.slug);
    if (!list) { list = []; bySlug.set(p.slug, list); }
    list.push(p);
  }

  const buckets = new Map<string, Bucket>();
  let unmatched = 0;

  for (const row of rows) {
    if (!row.suburb) { unmatched++; continue; }
    const slug = normalise(row.suburb).replace(/ /g, "-");
    const candidates = bySlug.get(slug);
    if (!candidates?.length) { unmatched++; continue; }

    let match: PlaceSummary | null = null;
    if (candidates.length === 1) {
      match = candidates[0];
    } else if (row.postcode != null) {
      const pc = String(row.postcode).padStart(4, "0");
      const byPostcode = candidates.filter((c) => c.postcode === pc);
      if (byPostcode.length === 1) match = byPostcode[0];
    }
    // Ambiguous and the postcode did not settle it: count it nowhere.
    if (!match) { unmatched++; continue; }

    let bucket = buckets.get(match.salCode);
    if (!bucket) { bucket = { rows: [] }; buckets.set(match.salCode, bucket); }
    bucket.rows.push(row);
  }

  return { buckets, unmatched };
}

function toStats(rows: ListingRow[], calculatedAt: string): ListingStats {
  const prices = rows.map((r) => r.weekly_price).filter((p): p is number => typeof p === "number" && p > 0);
  const enough = rows.length >= MIN_LISTING_SAMPLE;
  const dates = rows.map((r) => r.created_at).filter((d): d is string => !!d).sort();

  return {
    activeListings: rows.length,
    sampleSize: prices.length,
    medianWeeklyRoomPrice: enough ? median(prices) : null,
    priceRange: enough && prices.length ? [Math.min(...prices), Math.max(...prices)] : null,
    billsIncludedPct: enough ? Math.round((rows.filter((r) => r.bills_included).length / rows.length) * 100) : null,
    furnishedPct: enough ? Math.round((rows.filter((r) => r.furnished).length / rows.length) * 100) : null,
    mostRecentListedAt: dates.length ? dates[dates.length - 1] : null,
    basis: "active-listings",
    calculatedAt,
    quality: enough ? "derived" : "insufficient_sample",
  };
}

export interface AllListingStats {
  bySalCode: Record<string, ListingStats>;
  unmatched: number;
  calculatedAt: string;
}

/**
 * One trip to Supabase serves every card on a directory render, and the
 * result is reused for a few minutes afterwards. Without this, expanding a
 * city would fan out into one query per suburb.
 */
const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { at: number; value: AllListingStats | null } | null = null;
let inflight: Promise<AllListingStats | null> | null = null;

/**
 * Listing stats for every suburb that has any, in one query.
 *
 * Returns null if Supabase is unreachable, and every caller treats that as
 * "not available" rather than as zero.
 */
export async function getAllListingStats(): Promise<AllListingStats | null> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;
  if (inflight) return inflight;

  inflight = (async () => {
    const rows = await fetchActiveListings();
    if (rows === null) {
      // Do not cache a failure for long - the backend may just be waking up.
      cached = { at: Date.now() - CACHE_TTL_MS + 15000, value: null };
      return null;
    }
    const calculatedAt = new Date().toISOString();
    const { buckets, unmatched } = bucketBySalCode(rows, loadPlaces());
    const bySalCode: Record<string, ListingStats> = {};
    for (const [salCode, bucket] of buckets) {
      bySalCode[salCode] = toStats(bucket.rows, calculatedAt);
    }
    const value = { bySalCode, unmatched, calculatedAt };
    cached = { at: Date.now(), value };
    return value;
  })().finally(() => { inflight = null; });

  return inflight;
}

/** Listing stats for one suburb. Zero listings is a real answer, not a null. */
export async function getListingStats(salCode: string): Promise<ListingStats | null> {
  const all = await getAllListingStats();
  if (!all) return null;
  return (
    all.bySalCode[salCode] ?? {
      activeListings: 0,
      sampleSize: 0,
      medianWeeklyRoomPrice: null,
      priceRange: null,
      billsIncludedPct: null,
      furnishedPct: null,
      mostRecentListedAt: null,
      basis: "active-listings",
      calculatedAt: all.calculatedAt,
      quality: "insufficient_sample",
    }
  );
}
