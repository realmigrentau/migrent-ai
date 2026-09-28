/**
 * A saved search stores the API's own filter names (backend
 * routes_hub_renter.SEARCH_KEYS). Discover reads the public search page's
 * URL names (lib/search/searchQuery). This translates one to the other so
 * "Open" on a saved search lands on exactly the results it describes.
 */
export type SavedParams = Record<string, string | number | boolean>;

const MAP: Record<string, string> = {
  suburb: "suburb",
  postcode: "postcode",
  min_price: "minPrice",
  max_price: "maxPrice",
  property_type: "propertyType",
  place_type: "roomType",
  furnished: "furnished",
  bills_included: "billsIncluded",
  pets_allowed: "petsAllowed",
  parking: "parking",
  available_from: "checkIn",
};

export function discoverPath(params: SavedParams): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    const key = MAP[k];
    if (!key || v === "" || v === false || v === null || v === undefined) continue;
    q.set(key, String(v));
  }
  const s = q.toString();
  return `/discover${s ? `?${s}` : ""}`;
}

const PLACE: Record<string, string> = { entire_place: "Whole place", private_room: "Private room", shared_room: "Shared room" };

/** Plain-language chips for a saved search. */
export function describeSearch(params: SavedParams): string[] {
  const out: string[] = [];
  if (params.suburb) out.push(String(params.suburb));
  if (params.postcode) out.push(`Postcode ${params.postcode}`);
  if (params.min_price && params.max_price) out.push(`$${params.min_price}-$${params.max_price} a week`);
  else if (params.max_price) out.push(`Up to $${params.max_price} a week`);
  else if (params.min_price) out.push(`From $${params.min_price} a week`);
  if (params.place_type) out.push(PLACE[String(params.place_type)] ?? String(params.place_type));
  if (params.property_type) out.push(String(params.property_type).replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()));
  if (params.furnished) out.push("Furnished");
  if (params.bills_included) out.push("Bills included");
  if (params.pets_allowed) out.push("Pets considered");
  if (params.parking) out.push("Parking");
  if (params.available_from) out.push(`Available by ${params.available_from}`);
  if (!out.length) out.push("Anywhere in Australia");
  return out;
}
