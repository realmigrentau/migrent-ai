import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  filtersToApiParams,
  parseSearchQuery,
  serializeSearchFilters,
  validateSearchDates,
} from "../../lib/search/searchQuery";

const TODAY = "2026-09-03";

describe("move-in date serialisation", () => {
  it("carries the homepage move-in date through to the API query", () => {
    const f = parseSearchQuery({ city: "Sydney", maxPrice: "350", availableFrom: "2026-10-01" }, TODAY);
    expect(f.suburb).toBe("Sydney");
    expect(f.checkIn).toBe("2026-10-01");
    const api = filtersToApiParams(f);
    expect(api.check_in).toBe("2026-10-01");
    expect(api.max_price).toBe("350");
    expect(api.suburb).toBe("Sydney");
    const url = serializeSearchFilters(f).toString();
    expect(url).toContain("checkIn=2026-10-01");
    expect(url).toContain("suburb=Sydney");
  });

  it("clamps a past move-in to today and drops an impossible move-out", () => {
    const d = validateSearchDates("2026-01-01", "2025-12-01", TODAY);
    expect(d.checkIn).toBe(TODAY);
    expect(d.checkOut).toBe("");
    expect(d.errors.join(" ")).toMatch(/after move-in/);
  });

  it("rejects malformed and absurd dates", () => {
    expect(validateSearchDates("2026-02-30", "", TODAY).checkIn).toBe("");
    expect(validateSearchDates("not-a-date", "", TODAY).errors.length).toBe(1);
    const far = validateSearchDates("2062-01-01", "", TODAY);
    expect(far.checkIn).toBe("");
    expect(far.errors[0]).toMatch(/18 months/);
  });
});

describe("URL round trip", () => {
  it("round-trips every filter through the URL", () => {
    const f = {
      ...DEFAULT_FILTERS,
      suburb: "Parramatta",
      checkIn: "2026-10-05",
      checkOut: "2026-12-05",
      adults: 2,
      minPrice: "200",
      maxPrice: "400",
      placeType: "private",
      propertyType: "house",
      furnished: true,
      billsIncluded: true,
      verifiedOwner: true,
      minStay: "1 month",
      stationName: "Parramatta",
      stationDistance: "15" as const,
      sortBy: "price_asc" as const,
      page: 3,
    };
    const qs = serializeSearchFilters(f);
    const back = parseSearchQuery(Object.fromEntries(qs.entries()), TODAY);
    expect(back).toEqual(f);
  });

  it("keeps URLs short by omitting defaults", () => {
    expect(serializeSearchFilters(DEFAULT_FILTERS).toString()).toBe("");
  });

  it("understands the legacy links other pages use", () => {
    const f = parseSearchQuery({ roomType: "private", pets: "true", nearUni: "true", verified: "true", billsIncluded: "true" }, TODAY);
    expect(f.placeType).toBe("private");
    expect(f.petsAllowed).toBe(true);
    expect(f.nearStation).toBe(true);
    expect(f.verifiedOwner).toBe(true);
    expect(f.billsIncluded).toBe(true);
  });

  it("sanitises hostile input", () => {
    const f = parseSearchQuery({ postcode: "21<script>55", maxPrice: "1e9", page: "-5", lat: "999", lng: "1" }, TODAY);
    expect(f.postcode).toBe("2155");
    expect(f.maxPrice).toBe("");
    expect(f.page).toBe(1);
    expect(f.lat).toBeNull();
    expect(f.searchType).toBe("postcode");
  });

  it("swaps an inverted price range instead of sending an impossible query", () => {
    const f = parseSearchQuery({ minPrice: "500", maxPrice: "200" }, TODAY);
    expect(f.minPrice).toBe("200");
    expect(f.maxPrice).toBe("500");
  });
});

describe("pagination", () => {
  it("maps page to offset", () => {
    const f = { ...DEFAULT_FILTERS, page: 3 };
    expect(filtersToApiParams(f).offset).toBe("40");
    expect(filtersToApiParams(f).limit).toBe("20");
  });
});
