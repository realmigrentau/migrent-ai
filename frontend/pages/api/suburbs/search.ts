/**
 * Suburb search.
 *
 * The index is 15,334 places. Shipping it to the browser would cost roughly a
 * megabyte before a single result was shown, on a page whose whole point is
 * that it loads fast on a phone, so the matching happens here and the client
 * ships only the combobox.
 *
 * Responses are cacheable at the edge: the same query returns the same
 * results until the next data build.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { loadPlaces, regionMap } from "../../../lib/suburbs/data.server";
import { placeHref, resultLabel, searchPlaces } from "../../../lib/suburbs/search";

export interface SearchApiResult {
  salCode: string;
  label: string;
  name: string;
  state: string;
  regionName: string;
  postcode: string | null;
  population: number;
  overseasBornPct: number | null;
  href: string;
  matchedOn: string;
}

export interface SearchApiResponse {
  query: string;
  total: number;
  results: SearchApiResult[];
  regions: { id: string; name: string; state: string; placeCount: number }[];
}

const VALID_STATES = new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT", "OT"]);

export default function handler(req: NextApiRequest, res: NextApiResponse<SearchApiResponse | { error: string }>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = typeof req.query.q === "string" ? req.query.q : "";
  const stateParam = typeof req.query.state === "string" ? req.query.state.toUpperCase() : "";
  const state = VALID_STATES.has(stateParam) ? stateParam : null;
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 25);

  const response = searchPlaces(loadPlaces(), regionMap(), q, { limit, state });

  // Stable for as long as the generated data is. Suburb boundaries move once
  // every five years; there is no reason to recompute this per request.
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");

  return res.status(200).json({
    query: response.query,
    total: response.total,
    results: response.results.map((r) => ({
      salCode: r.place.salCode,
      label: resultLabel(r.place),
      name: r.place.name,
      state: r.place.state,
      regionName: r.regionName,
      postcode: r.place.postcode,
      population: r.place.population,
      overseasBornPct: r.place.overseasBornPct,
      href: placeHref(r.place),
      matchedOn: r.matchedOn,
    })),
    regions: response.regions.map((r) => ({
      id: r.region.id,
      name: r.region.name,
      state: r.region.state,
      placeCount: r.region.placeCount,
    })),
  });
}
