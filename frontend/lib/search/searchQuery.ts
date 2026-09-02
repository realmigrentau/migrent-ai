/**
 * The search page's state, serialised to and from the URL.
 *
 * Everything a visitor can set in the filter panel lives in `SearchFilters`.
 * The URL is the source of truth: the homepage hero, category chips, suburb
 * guides and shared links all produce a URL, the page parses it, and every
 * change writes back so the browser's back/forward buttons work and a
 * search can be shared.
 *
 * These are pure functions with unit tests (tests/unit/searchQuery.test.ts).
 */

export type SearchType = "suburb" | "postcode" | "address" | "nearMe";
export type SortBy = "newest" | "price_asc" | "price_desc" | "best_match";
export type StationDistance = "any" | "15" | "30";

export interface SearchFilters {
  searchType: SearchType;
  suburb: string;
  postcode: string;
  address: string;
  lat: number | null;
  lng: number | null;
  /** ISO date, YYYY-MM-DD. Move-in / earliest availability. */
  checkIn: string;
  /** ISO date, YYYY-MM-DD. Move-out. */
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  minPrice: string;
  maxPrice: string;
  placeType: string;
  propertyType: string;
  furnished: boolean;
  billsIncluded: boolean;
  femaleOnly: boolean;
  nearStation: boolean;
  instantBook: boolean;
  petsAllowed: boolean;
  parking: boolean;
  airCon: boolean;
  couplesOk: boolean;
  verifiedOwner: boolean;
  minStay: string;
  stationName: string;
  stationDistance: StationDistance;
  sortBy: SortBy;
  page: number;
}

export const PAGE_SIZE = 20;

export const DEFAULT_FILTERS: SearchFilters = {
  searchType: "suburb",
  suburb: "",
  postcode: "",
  address: "",
  lat: null,
  lng: null,
  checkIn: "",
  checkOut: "",
  adults: 1,
  children: 0,
  infants: 0,
  pets: 0,
  minPrice: "",
  maxPrice: "",
  placeType: "",
  propertyType: "",
  furnished: false,
  billsIncluded: false,
  femaleOnly: false,
  nearStation: false,
  instantBook: false,
  petsAllowed: false,
  parking: false,
  airCon: false,
  couplesOk: false,
  verifiedOwner: false,
  minStay: "",
  stationName: "",
  stationDistance: "any",
  sortBy: "newest",
  page: 1,
};

type QueryValue = string | string[] | undefined;
export type QueryLike = Record<string, QueryValue>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function first(v: QueryValue): string {
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? "").toString().trim();
}

function bool(v: QueryValue): boolean {
  const s = first(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

function int(v: QueryValue, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(first(v), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function money(v: QueryValue): string {
  // Accept "$350", "1,200" and plain digits. Anything else (1e9, 12abc) is
  // not a price and is dropped rather than guessed at.
  const s = first(v).replace(/[$,\s]/g, "");
  if (!s || !/^\d{1,5}$/.test(s)) return "";
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n) || n < 0 || n > 50000) return "";
  return String(n);
}

export function isoToday(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD string into a real calendar date, or null. */
export function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export interface DateValidation {
  checkIn: string;
  checkOut: string;
  /** Human-readable problems; empty when valid. */
  errors: string[];
}

/**
 * Validate the move-in / move-out pair the way the API does:
 * - malformed dates are dropped
 * - a move-in date in the past is clamped to today (shared links keep working)
 * - move-out must be after move-in
 * - nothing more than ~18 months out (a typo like 2062 would otherwise stick)
 */
export function validateSearchDates(checkIn: string, checkOut: string, today: string = isoToday()): DateValidation {
  const errors: string[] = [];
  let ci = ISO_DATE.test(checkIn) && parseIsoDate(checkIn) ? checkIn : "";
  let co = ISO_DATE.test(checkOut) && parseIsoDate(checkOut) ? checkOut : "";
  if (checkIn && !ci) errors.push("Move-in date is not a valid date.");
  if (checkOut && !co) errors.push("Move-out date is not a valid date.");

  if (ci && ci < today) ci = today;

  const horizon = new Date(parseIsoDate(today) as Date);
  horizon.setDate(horizon.getDate() + 548);
  const horizonIso = isoToday(horizon);
  if (ci && ci > horizonIso) {
    errors.push("Move-in date is too far in the future (maximum 18 months).");
    ci = "";
  }
  if (co && ci && co <= ci) {
    errors.push("Move-out must be after move-in.");
    co = "";
  }
  if (co && !ci && co <= today) {
    errors.push("Move-out must be in the future.");
    co = "";
  }
  return { checkIn: ci, checkOut: co, errors };
}

/**
 * Read filters from a URL query. Accepts both the canonical keys written by
 * `serializeSearchFilters` and the legacy keys other pages link with
 * (`city`, `availableFrom`, `roomType`, `pets`, `nearUni`, ...).
 */
export function parseSearchQuery(q: QueryLike, today: string = isoToday()): SearchFilters {
  const f: SearchFilters = { ...DEFAULT_FILTERS };

  const place = first(q.suburb) || first(q.city);
  if (place) {
    f.suburb = place.slice(0, 80);
    f.searchType = "suburb";
  }
  const pc = first(q.postcode).replace(/[^0-9]/g, "").slice(0, 4);
  if (pc.length === 4) {
    f.postcode = pc;
    f.searchType = "postcode";
  }
  const address = first(q.address);
  if (address) {
    f.address = address.slice(0, 120);
    f.searchType = "address";
  }
  const lat = Number.parseFloat(first(q.lat));
  const lng = Number.parseFloat(first(q.lng));
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    f.lat = lat;
    f.lng = lng;
    f.searchType = "nearMe";
  }

  const dates = validateSearchDates(first(q.checkIn) || first(q.availableFrom) || first(q.check_in), first(q.checkOut) || first(q.check_out), today);
  f.checkIn = dates.checkIn;
  f.checkOut = dates.checkOut;

  f.adults = int(q.adults, 1, 1, 20);
  f.children = int(q.children, 0, 0, 20);
  f.infants = int(q.infants, 0, 0, 20);
  f.pets = int(q.petCount, 0, 0, 10);

  f.minPrice = money(q.minPrice);
  f.maxPrice = money(q.maxPrice);
  if (f.minPrice && f.maxPrice && Number(f.maxPrice) < Number(f.minPrice)) {
    // An impossible range is almost always a swapped pair.
    [f.minPrice, f.maxPrice] = [f.maxPrice, f.minPrice];
  }

  f.placeType = first(q.roomType) || first(q.placeType);
  f.propertyType = first(q.propertyType);

  f.furnished = bool(q.furnished);
  f.billsIncluded = bool(q.billsIncluded);
  f.femaleOnly = bool(q.femaleOnly);
  f.nearStation = bool(q.nearStation) || bool(q.nearUni);
  f.instantBook = bool(q.instantBook);
  f.petsAllowed = bool(q.pets) || bool(q.petsAllowed);
  f.parking = bool(q.parking);
  f.airCon = bool(q.airCon);
  f.couplesOk = bool(q.couplesOk);
  f.verifiedOwner = bool(q.verified) || bool(q.verifiedOwner);
  f.minStay = first(q.minStay).slice(0, 20);
  f.stationName = first(q.station).slice(0, 80);
  const sd = first(q.stationDistance);
  f.stationDistance = sd === "15" || sd === "30" ? sd : "any";
  const sort = first(q.sort);
  f.sortBy = sort === "price_asc" || sort === "price_desc" || sort === "best_match" ? sort : "newest";
  f.page = int(q.page, 1, 1, 500);
  return f;
}

/** Write filters to URL params, omitting defaults so URLs stay short. */
export function serializeSearchFilters(f: SearchFilters): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: string, v: string | number | boolean | null | undefined) => {
    if (v === null || v === undefined || v === "" || v === false) return;
    p.set(k, String(v));
  };
  if (f.searchType === "suburb") set("suburb", f.suburb);
  if (f.searchType === "postcode") set("postcode", f.postcode);
  if (f.searchType === "address") set("address", f.address);
  if (f.searchType === "nearMe" && f.lat !== null && f.lng !== null) {
    set("lat", f.lat.toFixed(4));
    set("lng", f.lng.toFixed(4));
  }
  set("checkIn", f.checkIn);
  set("checkOut", f.checkOut);
  if (f.adults !== 1) set("adults", f.adults);
  set("children", f.children || "");
  set("infants", f.infants || "");
  set("petCount", f.pets || "");
  set("minPrice", f.minPrice);
  set("maxPrice", f.maxPrice);
  set("roomType", f.placeType);
  set("propertyType", f.propertyType);
  set("furnished", f.furnished);
  set("billsIncluded", f.billsIncluded);
  set("femaleOnly", f.femaleOnly);
  set("nearStation", f.nearStation);
  set("instantBook", f.instantBook);
  set("petsAllowed", f.petsAllowed);
  set("parking", f.parking);
  set("airCon", f.airCon);
  set("couplesOk", f.couplesOk);
  set("verifiedOwner", f.verifiedOwner);
  set("minStay", f.minStay);
  set("station", f.stationName);
  if (f.stationDistance !== "any") set("stationDistance", f.stationDistance);
  if (f.sortBy !== "newest") set("sort", f.sortBy);
  if (f.page > 1) set("page", f.page);
  return p;
}

/** The query string the backend `/listings/search` endpoint expects. */
export function filtersToApiParams(f: SearchFilters, offset = (f.page - 1) * PAGE_SIZE, limit = PAGE_SIZE): Record<string, string> {
  const params: Record<string, string> = { limit: String(limit), offset: String(Math.max(0, offset)) };
  if (f.minPrice) params.min_price = f.minPrice;
  if (f.maxPrice) params.max_price = f.maxPrice;
  const guests = f.adults + f.children + f.infants;
  if (guests > 1) params.guests = String(guests);

  if (f.searchType === "nearMe" && f.lat !== null && f.lng !== null) {
    params.lat = String(f.lat);
    params.lng = String(f.lng);
    params.radius = "5";
  } else if (f.searchType === "suburb" && f.suburb) {
    params.suburb = f.suburb;
  } else if (f.searchType === "postcode" && f.postcode) {
    params.postcode = f.postcode;
  } else if (f.searchType === "address" && f.address) {
    params.address = f.address;
  }

  if (f.checkIn) params.check_in = f.checkIn;
  if (f.checkOut) params.check_out = f.checkOut;
  if (f.placeType) params.place_type = f.placeType;
  if (f.propertyType) params.property_type = f.propertyType;
  if (f.furnished) params.furnished = "true";
  if (f.billsIncluded) params.bills_included = "true";
  if (f.femaleOnly) params.gender_preference = "female";
  if (f.instantBook) params.instant_book = "true";
  if (f.petsAllowed) params.pets_allowed = "true";
  if (f.parking) params.parking = "true";
  if (f.airCon) params.air_conditioning = "true";
  if (f.couplesOk) params.couples_ok = "true";
  if (f.verifiedOwner) params.verified_owner = "true";
  if (f.minStay) params.min_stay = f.minStay;
  if (f.sortBy !== "newest") params.sort = f.sortBy;
  if (f.stationName) params.station_name = f.stationName;
  if (f.stationDistance !== "any") params.max_station_min = f.stationDistance;
  else if (f.nearStation) params.near_station = "true";
  return params;
}

/** Count of filters that differ from the defaults, excluding sort and page. */
export function activeFilterCount(f: SearchFilters): number {
  let n = 0;
  const keys = Object.keys(DEFAULT_FILTERS) as (keyof SearchFilters)[];
  for (const k of keys) {
    if (k === "sortBy" || k === "page" || k === "searchType" || k === "lat" || k === "lng") continue;
    if (f[k] !== DEFAULT_FILTERS[k]) n += 1;
  }
  return n;
}

export function filtersEqual(a: SearchFilters, b: SearchFilters): boolean {
  return serializeSearchFilters(a).toString() === serializeSearchFilters(b).toString();
}
