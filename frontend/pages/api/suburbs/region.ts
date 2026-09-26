/**
 * One page of one region's suburbs.
 *
 * The directory renders six cards per city and fetches the rest from here.
 * That is what keeps the first paint small: Sydney is 923 suburbs and
 * "Regional and remote New South Wales" is 2,898, and neither has any
 * business being in the initial HTML.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getRegion, getRegionPlaces, type RegionSort } from "../../../lib/suburbs/data.server";
import { getAllListingStats } from "../../../lib/suburbs/listings.server";
import { placeHref, resultLabel } from "../../../lib/suburbs/search";

export interface RegionCard {
  salCode: string;
  name: string;
  label: string;
  state: string;
  postcode: string | null;
  population: number;
  overseasBornPct: number | null;
  href: string;
  activeListings: number | null;
  medianWeeklyRoomPrice: number | null;
  hasEditorial: boolean;
}

export interface RegionApiResponse {
  regionId: string;
  total: number;
  offset: number;
  limit: number;
  places: RegionCard[];
}

const SORTS = new Set<RegionSort>(["name", "population", "overseas"]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegionApiResponse | { error: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const regionId = typeof req.query.id === "string" ? req.query.id : "";
  if (!getRegion(regionId)) return res.status(404).json({ error: "Unknown region" });

  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 60);
  const sortParam = typeof req.query.sort === "string" ? (req.query.sort as RegionSort) : "population";
  const sort = SORTS.has(sortParam) ? sortParam : "population";

  const { places, total } = getRegionPlaces(regionId, { offset, limit, sort });

  // One Supabase round trip, memoised for five minutes, shared by every card
  // on the page rather than one per suburb.
  const listings = await getAllListingStats();

  // Shorter than the search cache: the suburb list is static but the room
  // counts on it are not.
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");

  return res.status(200).json({
    regionId,
    total,
    offset,
    limit,
    places: places.map((p) => {
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
    }),
  });
}
