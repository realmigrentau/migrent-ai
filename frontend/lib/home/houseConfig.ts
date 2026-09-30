/**
 * The homepage house: what a visitor has set, and what it turns into.
 *
 * The house is one model with two readings. Someone looking for a home sets
 * the rooms and features they want, and that becomes a search URL. Someone
 * hosting sets the rooms they rent out and what the place has, and that
 * becomes the first draft of a listing in Migrent Hub. Every toggle maps to
 * a real listing field or a real search filter; nothing here is decoration.
 *
 * Pure functions, unit tested in tests/unit/houseConfig.test.ts.
 */

export type HouseMode = "looking" | "hosting";

/** The drawn house has four bedrooms. */
export const BEDROOM_COUNT = 4;

export type CameraChoice = "any" | "none" | "outside" | "inside";
export type BathroomChoice = "any" | "private" | "ensuite" | "shared";
export type LaundryChoice = "any" | "in_unit" | "shared" | "none";

export interface HouseExtras {
  parking: boolean;
  pets: boolean;
  furnished: boolean;
  bills: boolean;
  aircon: boolean;
  internet: boolean;
}

export interface HouseState {
  mode: HouseMode;
  /** Which of the four bedrooms are "yours" (looking) or rented out (hosting). */
  bedrooms: boolean[];
  /** Looking: only whole places. Hosting: the whole home is let as one. */
  wholePlace: boolean;
  where: string;
  cameras: CameraChoice;
  lockable: boolean;
  bathroom: BathroomChoice;
  laundry: LaundryChoice;
  extras: HouseExtras;
}

export const EXTRA_KEYS = ["parking", "pets", "furnished", "bills", "aircon", "internet"] as const;
export type ExtraKey = (typeof EXTRA_KEYS)[number];

export const EXTRA_LABELS: Record<ExtraKey, { looking: string; hosting: string; short: string }> = {
  parking: { looking: "Parking", hosting: "Parking", short: "parking" },
  pets: { looking: "Pets OK", hosting: "Pets welcome", short: "pets OK" },
  furnished: { looking: "Furnished", hosting: "Furnished", short: "furnished" },
  bills: { looking: "Bills included", hosting: "Bills included", short: "bills included" },
  aircon: { looking: "Air-con", hosting: "Air-con", short: "air-con" },
  internet: { looking: "Internet", hosting: "Internet included", short: "internet" },
};

const NO_EXTRAS: HouseExtras = { parking: false, pets: false, furnished: false, bills: false, aircon: false, internet: false };

/** Where a renter starts: one room of their own, nothing else decided. */
export function initialState(mode: HouseMode = "looking"): HouseState {
  if (mode === "hosting") {
    return {
      mode,
      bedrooms: [true, true, true, false],
      wholePlace: false,
      where: "",
      cameras: "none",
      lockable: true,
      bathroom: "shared",
      laundry: "in_unit",
      extras: { ...NO_EXTRAS, furnished: true, bills: true, internet: true },
    };
  }
  return {
    mode,
    bedrooms: [false, true, false, false],
    wholePlace: false,
    where: "",
    cameras: "any",
    lockable: false,
    bathroom: "any",
    laundry: "any",
    extras: { ...NO_EXTRAS },
  };
}

/**
 * Switching modes keeps what still means the same thing (the rooms, the
 * suburb, the extras) and resets what does not. "Any" is a renter's answer
 * that a host cannot give, so those become the host's sensible defaults.
 */
export function switchMode(state: HouseState, mode: HouseMode): HouseState {
  if (state.mode === mode) return state;
  const fresh = initialState(mode);
  return {
    ...fresh,
    bedrooms: state.bedrooms.some(Boolean) ? [...state.bedrooms] : fresh.bedrooms,
    wholePlace: state.wholePlace,
    where: state.where,
    extras: mode === "hosting" ? { ...fresh.extras, ...pickTrue(state.extras) } : { ...state.extras },
  };
}

function pickTrue(extras: HouseExtras): Partial<HouseExtras> {
  const out: Partial<HouseExtras> = {};
  for (const k of EXTRA_KEYS) if (extras[k]) out[k] = true;
  return out;
}

export function selectedCount(state: HouseState): number {
  return state.bedrooms.filter(Boolean).length;
}

/**
 * Toggle one bedroom. There is always at least one: a search for zero
 * bedrooms, or a listing that rents nothing out, is not a thing anyone can
 * mean, so the last room cannot be switched off.
 */
export function toggleBedroom(state: HouseState, index: number): HouseState {
  if (index < 0 || index >= BEDROOM_COUNT) return state;
  const next = [...state.bedrooms];
  next[index] = !next[index];
  if (!next.some(Boolean)) return state;
  const count = next.filter(Boolean).length;
  // A host who unticks a room is no longer letting the whole home as one.
  const wholePlace = state.mode === "hosting" && count < BEDROOM_COUNT ? false : state.wholePlace;
  return { ...state, bedrooms: next, wholePlace };
}

/** Hosting: "the whole home" selects every bedroom. */
export function setWholePlace(state: HouseState, wholePlace: boolean): HouseState {
  if (state.mode === "hosting" && wholePlace) {
    return { ...state, wholePlace, bedrooms: Array.from({ length: BEDROOM_COUNT }, () => true) };
  }
  return { ...state, wholePlace };
}

/** Is the kitchen and living room shared with other people? */
export function sharesLivingAreas(state: HouseState): boolean {
  return !state.wholePlace;
}

const MAX_WHERE = 80;

function cleanWhere(where: string): string {
  return where.replace(/\s+/g, " ").trim().slice(0, MAX_WHERE);
}

// ─── Looking: the search it becomes ───────────────────────────────────────

/**
 * The /seeker/search query for a renter's house. Keys are the ones
 * lib/search/searchQuery.ts reads, so the filters arrive already set and can
 * be changed or cleared on the search page like any other filter.
 */
export function toSearchParams(state: HouseState): URLSearchParams {
  const p = new URLSearchParams();
  const where = cleanWhere(state.where);
  if (where) p.set(/^\d{4}$/.test(where) ? "postcode" : "suburb", where);

  const rooms = selectedCount(state);
  if (state.wholePlace) {
    p.set("roomType", "entire_place");
    if (rooms > 1) p.set("bedrooms", String(rooms));
  } else if (rooms > 1) {
    // Two or more rooms of your own only exists as a whole place.
    p.set("roomType", "entire_place");
    p.set("bedrooms", String(rooms));
  }

  if (state.cameras === "none") p.set("noCameras", "true");
  if (state.lockable) p.set("lockable", "true");
  if (state.bathroom === "private" || state.bathroom === "ensuite") p.set("privateBath", "true");
  if (state.laundry === "in_unit") p.set("laundry", "in_unit");

  const e = state.extras;
  if (e.parking) p.set("parking", "true");
  if (e.pets) p.set("petsAllowed", "true");
  if (e.furnished) p.set("furnished", "true");
  if (e.bills) p.set("billsIncluded", "true");
  if (e.aircon) p.set("airCon", "true");
  if (e.internet) p.set("internet", "true");
  return p;
}

export function toSearchHref(state: HouseState): string {
  const qs = toSearchParams(state).toString();
  return qs ? `/seeker/search?${qs}` : "/seeker/search";
}

// ─── Hosting: the listing draft it becomes ────────────────────────────────

/** The subset of the Hub listing draft (lib/hub/listingDraft.ts) the house can fill. */
export interface HousePrefill {
  suburb?: string;
  postcode?: string;
  property_type: "house";
  property_bedrooms: number;
  place_type: "entire_place" | "private_room";
  bedrooms?: number;
  bathroom_type?: "private" | "ensuite" | "shared";
  laundry?: "in_unit" | "shared" | "none";
  security_cameras: boolean;
  security_cameras_location?: string;
  lockable_bedroom: boolean;
  parking: boolean;
  pets_allowed: boolean;
  furnished: boolean;
  bills_included: boolean;
  air_conditioning: boolean;
  internet_included: boolean;
}

export function toDraftPrefill(state: HouseState): HousePrefill {
  const where = cleanWhere(state.where);
  const rooms = selectedCount(state);
  const whole = state.wholePlace || rooms === BEDROOM_COUNT;
  const prefill: HousePrefill = {
    property_type: "house",
    property_bedrooms: BEDROOM_COUNT,
    place_type: whole ? "entire_place" : "private_room",
    security_cameras: state.cameras === "outside" || state.cameras === "inside",
    lockable_bedroom: state.lockable,
    parking: state.extras.parking,
    pets_allowed: state.extras.pets,
    furnished: state.extras.furnished,
    bills_included: state.extras.bills,
    air_conditioning: state.extras.aircon,
    internet_included: state.extras.internet,
  };
  if (whole) prefill.bedrooms = BEDROOM_COUNT;
  if (where) {
    if (/^\d{4}$/.test(where)) prefill.postcode = where;
    else prefill.suburb = where;
  }
  if (state.bathroom !== "any") prefill.bathroom_type = state.bathroom;
  if (state.laundry !== "any") prefill.laundry = state.laundry;
  if (state.cameras === "outside") prefill.security_cameras_location = "Outside only";
  if (state.cameras === "inside") prefill.security_cameras_location = "Inside and outside";
  return prefill;
}

/** URL-safe base64 of the prefill JSON, for the ?prefill= parameter. */
export function encodePrefill(prefill: HousePrefill): string {
  const bytes = new TextEncoder().encode(JSON.stringify(prefill));
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const PREFILL_BOOLEANS = [
  "security_cameras",
  "lockable_bedroom",
  "parking",
  "pets_allowed",
  "furnished",
  "bills_included",
  "air_conditioning",
  "internet_included",
] as const;

/**
 * Read a ?prefill= value back, trusting nothing: it arrives in a URL anyone
 * can edit, so only known keys with the expected types survive.
 */
export function decodePrefill(raw: string | undefined | null): Partial<HousePrefill> | null {
  if (!raw || raw.length > 2000) return null;
  let parsed: unknown;
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const binary = atob(padded);
    const json = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const src = parsed as Record<string, unknown>;
  const out: Partial<HousePrefill> = {};

  if (typeof src.suburb === "string" && src.suburb.trim()) out.suburb = cleanWhere(src.suburb);
  if (typeof src.postcode === "string" && /^\d{4}$/.test(src.postcode)) out.postcode = src.postcode;
  if (src.property_type === "house") out.property_type = "house";
  if (typeof src.property_bedrooms === "number" && Number.isInteger(src.property_bedrooms) && src.property_bedrooms >= 1 && src.property_bedrooms <= 10) {
    out.property_bedrooms = src.property_bedrooms;
  }
  if (src.place_type === "entire_place" || src.place_type === "private_room") out.place_type = src.place_type;
  if (typeof src.bedrooms === "number" && Number.isInteger(src.bedrooms) && src.bedrooms >= 1 && src.bedrooms <= 10) out.bedrooms = src.bedrooms;
  if (src.bathroom_type === "private" || src.bathroom_type === "ensuite" || src.bathroom_type === "shared") out.bathroom_type = src.bathroom_type;
  if (src.laundry === "in_unit" || src.laundry === "shared" || src.laundry === "none") out.laundry = src.laundry;
  if (src.security_cameras_location === "Outside only" || src.security_cameras_location === "Inside and outside") {
    out.security_cameras_location = src.security_cameras_location;
  }
  for (const k of PREFILL_BOOLEANS) {
    if (typeof src[k] === "boolean") out[k] = src[k] as boolean;
  }
  return Object.keys(out).length ? out : null;
}

// ─── Words ──────────────────────────────────────────────────────────────

/** One plain sentence describing the house as it is set. */
export function describe(state: HouseState): string {
  const rooms = selectedCount(state);
  const parts: string[] = [];

  if (state.mode === "looking") {
    if (state.wholePlace || rooms > 1) parts.push(`A whole place with ${rooms} ${rooms === 1 ? "bedroom" : "bedrooms"}`);
    else parts.push("A room of your own");
    if (state.bathroom === "private" || state.bathroom === "ensuite") parts.push("private bathroom");
    if (state.laundry === "in_unit") parts.push("laundry at home");
    if (state.cameras === "none") parts.push("no cameras");
    if (state.lockable) parts.push("a door that locks");
  } else {
    const whole = state.wholePlace || rooms === BEDROOM_COUNT;
    parts.push(whole ? "The whole home" : `${rooms} of ${BEDROOM_COUNT} bedrooms`);
    if (state.bathroom === "private") parts.push("private bathroom");
    if (state.bathroom === "ensuite") parts.push("ensuite");
    if (state.bathroom === "shared") parts.push("shared bathroom");
    parts.push(state.cameras === "none" ? "no cameras" : state.cameras === "outside" ? "cameras outside only" : "cameras inside and out");
    if (state.lockable) parts.push("lockable doors");
  }

  for (const k of EXTRA_KEYS) if (state.extras[k]) parts.push(EXTRA_LABELS[k].short);

  const [head, ...rest] = parts;
  return rest.length ? `${head}, ${rest.join(", ")}.` : `${head}.`;
}

/** The order rooms light up in when a count is set rather than a room tapped. */
const LIGHT_ORDER = [1, 0, 2, 3];

/**
 * Set how many bedrooms are selected, keeping the rooms already chosen where
 * possible: going up lights the next dark room, going down turns off the
 * most recently added one.
 */
export function setBedroomCount(state: HouseState, count: number): HouseState {
  const target = Math.max(1, Math.min(BEDROOM_COUNT, Math.round(count)));
  const next = [...state.bedrooms];
  let current = next.filter(Boolean).length;
  for (const i of LIGHT_ORDER) {
    if (current >= target) break;
    if (!next[i]) {
      next[i] = true;
      current += 1;
    }
  }
  for (const i of [...LIGHT_ORDER].reverse()) {
    if (current <= target) break;
    if (next[i]) {
      next[i] = false;
      current -= 1;
    }
  }
  const wholePlace = state.mode === "hosting" && target < BEDROOM_COUNT ? false : state.wholePlace;
  return { ...state, bedrooms: next, wholePlace };
}
