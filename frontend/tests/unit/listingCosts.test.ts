import { describe, expect, it } from "vitest";
import { RENTING_AUTHORITIES, bondWeeksFromText, maxRentInAdvanceWeeks, moveInCost, rentingAuthorityFor, weeksOf } from "../../lib/listingCosts";
import { draftProblems } from "../../lib/hub/listingDraft";
import { getAllStates } from "../../data/rentalLaws";
import { DEFAULT_FILTERS, filtersToApiParams, parseSearchQuery, serializeSearchFilters } from "../../lib/search/searchQuery";

describe("move-in cost", () => {
  it("adds bond and rent in advance in whole weeks of rent", () => {
    const c = moveInCost({ weekly_price: 320, bond_weeks: 4, rent_in_advance_weeks: 2 });
    expect(c).toMatchObject({ known: true, bond: 1280, advance: 640, total: 1920 });
  });

  it("counts no bond and no advance as a known zero", () => {
    expect(moveInCost({ weekly_price: 300, bond_weeks: 0, rent_in_advance_weeks: 0 })).toMatchObject({ known: true, total: 0 });
  });

  it("is unknown until the host has said both", () => {
    expect(moveInCost({ weekly_price: 300, bond_weeks: 4 }).known).toBe(false);
    expect(moveInCost({ weekly_price: 300, bond: "4 weeks" }).known).toBe(false);
  });

  it("never adds rent in advance to a short stay", () => {
    const c = moveInCost({ weekly_price: 300, bond_weeks: 2, rent_in_advance_weeks: 2, listing_purpose: "short_stay" });
    expect(c.advance).toBe(0);
    expect(c.total).toBe(600);
  });
});

describe("old free-text bond", () => {
  it("reads plain week counts and nothing else", () => {
    expect(bondWeeksFromText("4 weeks")).toBe(4);
    expect(bondWeeksFromText("2 wks")).toBe(2);
    expect(bondWeeksFromText("6 weeks")).toBeUndefined();
    expect(bondWeeksFromText("$1,200")).toBeUndefined();
    expect(bondWeeksFromText(null)).toBeUndefined();
  });
});

describe("where the bond goes", () => {
  it("finds the state from the postcode, border towns included by range", () => {
    expect(rentingAuthorityFor(2150)?.state).toBe("NSW");
    expect(rentingAuthorityFor("3000")?.state).toBe("VIC");
    expect(rentingAuthorityFor(800)?.state).toBe("NT");
    expect(rentingAuthorityFor(2600)?.state).toBe("ACT");
    expect(rentingAuthorityFor(undefined)).toBeNull();
  });

  it("links to the same official page as the rental laws guide", () => {
    for (const s of getAllStates()) {
      expect(RENTING_AUTHORITIES[s.code]?.url).toBe(s.fairTradingUrl);
    }
  });
});

describe("lease and newcomer search filters", () => {
  it("round-trips through the URL and reaches the API", () => {
    const f = parseSearchQuery({ suburb: "Parramatta", lease: "long_term", newcomer: "true" });
    expect(f.leaseType).toBe("long_term");
    expect(f.newcomer).toBe(true);
    const qs = serializeSearchFilters(f).toString();
    expect(qs).toContain("lease=long_term");
    expect(qs).toContain("newcomer=true");
    const api = filtersToApiParams(f);
    expect(api.lease_type).toBe("long_term");
    expect(api.newcomer_friendly).toBe("true");
  });

  it("ignores an unknown lease type", () => {
    expect(parseSearchQuery({ lease: "forever" }).leaseType).toBe("");
    expect(filtersToApiParams(DEFAULT_FILTERS).lease_type).toBeUndefined();
  });
});

describe("rent in advance limits by state", () => {
  it("is one rent period (a week) in Tasmania and the NT, two weeks elsewhere", () => {
    expect(maxRentInAdvanceWeeks("TAS")).toBe(1);
    expect(maxRentInAdvanceWeeks("NT")).toBe(1);
    expect(maxRentInAdvanceWeeks("NSW")).toBe(2);
    expect(maxRentInAdvanceWeeks(undefined)).toBe(2);
  });

  it("the wizard flags two weeks in advance in Tasmania", () => {
    const base = { listing_purpose: "long_term" as const, bond_weeks: 4, rent_in_advance_weeks: 2 };
    expect(draftProblems({ ...base, postcode: "7000" }).some((p) => p.field === "rent_in_advance_weeks")).toBe(true);
    expect(draftProblems({ ...base, postcode: "2150" }).some((p) => p.field === "rent_in_advance_weeks")).toBe(false);
  });

  it("writes week counts as possessives", () => {
    expect(weeksOf(1)).toBe("1 week's");
    expect(weeksOf(4)).toBe("4 weeks'");
  });
});
