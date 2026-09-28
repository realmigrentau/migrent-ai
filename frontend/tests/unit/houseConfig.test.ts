import { describe, expect, it } from "vitest";
import {
  BEDROOM_COUNT,
  decodePrefill,
  describe as describeHouse,
  encodePrefill,
  initialState,
  setBedroomCount,
  setWholePlace,
  switchMode,
  toDraftPrefill,
  toSearchHref,
  toSearchParams,
  toggleBedroom,
  type HouseState,
} from "../../lib/home/houseConfig";
import { filtersToApiParams, parseSearchQuery } from "../../lib/search/searchQuery";

const TODAY = "2026-09-29";

function looking(patch: Partial<HouseState> = {}): HouseState {
  return { ...initialState("looking"), ...patch };
}

describe("the house as a search", () => {
  it("starts as one room of your own with no filters", () => {
    const s = initialState("looking");
    expect(toSearchHref(s)).toBe("/seeker/search");
    expect(describeHouse(s)).toBe("A room of your own.");
  });

  it("turns two rooms of your own into a whole place with that many bedrooms", () => {
    const s = toggleBedroom(looking(), 0);
    const p = toSearchParams(s);
    expect(p.get("roomType")).toBe("entire_place");
    expect(p.get("bedrooms")).toBe("2");
  });

  it("keeps every toggle through the search page's own parser to the API", () => {
    const s = looking({
      where: "  Parramatta ",
      cameras: "none",
      lockable: true,
      bathroom: "private",
      laundry: "in_unit",
      extras: { parking: true, pets: true, furnished: true, bills: true, aircon: true, internet: true },
    });
    const query = Object.fromEntries(toSearchParams(s).entries());
    const f = parseSearchQuery(query, TODAY);
    expect(f.suburb).toBe("Parramatta");
    expect(f.noCameras && f.lockable && f.privateBath && f.laundryInHome && f.internet).toBe(true);
    expect(f.parking && f.petsAllowed && f.furnished && f.billsIncluded && f.airCon).toBe(true);

    const api = filtersToApiParams(f);
    expect(api).toMatchObject({
      suburb: "Parramatta",
      no_cameras: "true",
      lockable_bedroom: "true",
      private_bathroom: "true",
      laundry: "in_unit",
      internet_included: "true",
      parking: "true",
      pets_allowed: "true",
      furnished: "true",
      bills_included: "true",
      air_conditioning: "true",
    });
  });

  it("treats a four-digit place as a postcode", () => {
    expect(toSearchParams(looking({ where: "2150" })).get("postcode")).toBe("2150");
  });

  it("never lets the last bedroom be switched off", () => {
    const s = looking();
    const onlyRoom = s.bedrooms.indexOf(true);
    expect(toggleBedroom(s, onlyRoom)).toBe(s);
  });
});

describe("the house as a listing", () => {
  it("lets three of four rooms as private rooms", () => {
    const prefill = toDraftPrefill(initialState("hosting"));
    expect(prefill.place_type).toBe("private_room");
    expect(prefill.property_bedrooms).toBe(BEDROOM_COUNT);
    expect(prefill.bedrooms).toBeUndefined();
    expect(describeHouse(initialState("hosting"))).toMatch(/^3 of 4 bedrooms/);
  });

  it("lets the whole home as one when every room is ticked", () => {
    const s = setWholePlace(initialState("hosting"), true);
    expect(s.bedrooms.every(Boolean)).toBe(true);
    const prefill = toDraftPrefill(s);
    expect(prefill.place_type).toBe("entire_place");
    expect(prefill.bedrooms).toBe(BEDROOM_COUNT);
  });

  it("unticking a room after 'whole home' goes back to rooms", () => {
    const s = toggleBedroom(setWholePlace(initialState("hosting"), true), 2);
    expect(s.wholePlace).toBe(false);
    expect(toDraftPrefill(s).place_type).toBe("private_room");
  });

  it("records camera disclosure in the listing's own words", () => {
    const s = { ...initialState("hosting"), cameras: "outside" as const };
    const prefill = toDraftPrefill(s);
    expect(prefill.security_cameras).toBe(true);
    expect(prefill.security_cameras_location).toBe("Outside only");
  });

  it("round-trips through the URL and drops anything it does not know", () => {
    const prefill = toDraftPrefill({ ...initialState("hosting"), where: "Rouse Hill" });
    const decoded = decodePrefill(encodePrefill(prefill));
    expect(decoded).toEqual(prefill);

    const hostile = btoa(JSON.stringify({ weekly_price: 1, place_type: "castle", furnished: "yes", suburb: "<b>x</b>" }));
    expect(decodePrefill(hostile)).toEqual({ suburb: "<b>x</b>" });
    expect(decodePrefill("not base64 at all!")).toBeNull();
    expect(decodePrefill("x".repeat(3000))).toBeNull();
  });
});

describe("switching between looking and hosting", () => {
  it("keeps the rooms, place and extras, and replaces 'any' with a host's answer", () => {
    const s = switchMode(looking({ where: "Glebe", cameras: "any", extras: { ...initialState().extras, pets: true } }), "hosting");
    expect(s.mode).toBe("hosting");
    expect(s.where).toBe("Glebe");
    expect(s.cameras).toBe("none");
    expect(s.extras.pets).toBe(true);
    expect(s.bathroom).not.toBe("any");
  });
});

describe("setting the number of bedrooms", () => {
  it("adds rooms in a steady order and keeps the ones already chosen", () => {
    const start = { ...initialState("looking"), bedrooms: [false, false, false, true] };
    const three = setBedroomCount(start, 3);
    expect(three.bedrooms).toEqual([true, true, false, true]);
    const one = setBedroomCount(three, 1);
    expect(one.bedrooms.filter(Boolean)).toHaveLength(1);
    expect(setBedroomCount(one, 0).bedrooms.filter(Boolean)).toHaveLength(1);
    expect(setBedroomCount(one, 9).bedrooms.every(Boolean)).toBe(true);
  });
});
