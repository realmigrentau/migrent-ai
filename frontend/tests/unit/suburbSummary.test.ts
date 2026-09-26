import { describe, expect, it } from "vitest";
import { findPlace, getPlaceDetail, getRegion, loadPlaces } from "../../lib/suburbs/data.server";
import { buildFaqs, buildMetaDescription, buildSummary } from "../../lib/suburbs/summary";
import { formatAud, formatDistance, formatPercent } from "../../lib/suburbs/format";
import type { ListingStats } from "../../lib/suburbs/types";

/**
 * The generated prose.
 *
 * Every sentence on 15,334 pages comes out of these templates, so the thing
 * worth testing is that a template never writes a sentence whose data is
 * missing - "It had a population of null" on ten thousand pages would be
 * worse than any single wrong number.
 */

const detailFor = (state: string, slug: string) => {
  const place = findPlace(state, slug)!;
  const detail = getPlaceDetail(place.salCode)!;
  return { detail, region: getRegion(detail.regionId) };
};

const noListings: ListingStats = {
  activeListings: 0, sampleSize: 0, medianWeeklyRoomPrice: null, priceRange: null,
  billsIncludedPct: null, furnishedPct: null, mostRecentListedAt: null,
  basis: "active-listings", calculatedAt: "2026-09-26T00:00:00.000Z", quality: "insufficient_sample",
};

describe("formatting", () => {
  it("never renders a missing value as zero", () => {
    expect(formatAud(null)).toBeNull();
    expect(formatPercent(null)).toBeNull();
    expect(formatDistance(null)).toBeNull();
  });

  it("formats money, percentages and distances the way the page reads them", () => {
    expect(formatAud(630)).toBe("$630");
    expect(formatPercent(42.5)).toBe("42.5%");
    expect(formatPercent(40)).toBe("40%");
    expect(formatDistance(420)).toBe("420 m");
    expect(formatDistance(2430)).toBe("2.4 km");
  });
});

describe("factual summary", () => {
  it("places the suburb, then states only what it has", () => {
    const { detail, region } = detailFor("nsw", "kellyville");
    const sentences = buildSummary(detail, region);
    expect(sentences[0]).toBe("Kellyville is a suburb in Greater Sydney, New South Wales.");
    expect(sentences.join(" ")).toContain("at the 2021 Census");
    expect(sentences.join(" ")).toMatch(/born overseas/);
  });

  it("says nothing it cannot source, however small the place", () => {
    const tiny = loadPlaces().filter((p) => p.population > 0 && p.population < 30).slice(0, 40);
    expect(tiny.length).toBeGreaterThan(0);
    for (const p of tiny) {
      const d = getPlaceDetail(p.salCode)!;
      const text = buildSummary(d, getRegion(d.regionId)).join(" ");
      expect(text).not.toMatch(/null|undefined|NaN/);
      expect(text).not.toMatch(/\$\s*0\b/);
    }
  });

  it("calls a rural locality a locality, not a suburb", () => {
    const rural = loadPlaces().find((p) => {
      const d = getPlaceDetail(p.salCode);
      return d?.sectionOfState === "Rural Balance";
    })!;
    const d = getPlaceDetail(rural.salCode)!;
    expect(buildSummary(d, getRegion(d.regionId))[0]).toContain("is a locality in");
  });

  it("flags the Census rent as a whole-dwelling figure wherever it appears", () => {
    const { detail, region } = detailFor("vic", "footscray");
    const text = buildSummary(detail, region).join(" ");
    expect(text).toMatch(/whole houses and units rather than rooms/);
  });
});

describe("meta description", () => {
  it("stays inside the length search engines will show", () => {
    for (const slug of [["nsw", "kellyville"], ["vic", "carlton"], ["qld", "sunnybank"]] as const) {
      const { detail, region } = detailFor(slug[0], slug[1]);
      const meta = buildMetaDescription(detail, region);
      expect(meta.length).toBeLessThanOrEqual(160);
      expect(meta).not.toMatch(/null|undefined|NaN/);
    }
  });
});

describe("FAQs", () => {
  it("only asks questions this page can answer", () => {
    const { detail, region } = detailFor("qld", "sunnybank");
    const faqs = buildFaqs(detail, region, noListings);
    expect(faqs.length).toBeGreaterThan(3);
    for (const f of faqs) {
      expect(f.q).toMatch(/\?$/);
      expect(f.a).not.toMatch(/null|undefined|NaN/);
      // Every answer names where it came from, or says what it is not.
      expect(f.a, f.q).toMatch(
        /Census|OpenStreetMap|MigRent|ABS|Australian Bureau of Statistics|Postal Area/,
      );
    }
  });

  it("cites the source in the population answer", () => {
    const { detail, region } = detailFor("nsw", "auburn");
    const faq = buildFaqs(detail, region, noListings).find((f) => f.q.includes("How many people"))!;
    expect(faq.a).toContain("Australian Bureau of Statistics");
    expect(faq.a).toContain("2021");
  });

  it("does not offer a rooms question when there are no rooms", () => {
    const { detail, region } = detailFor("nsw", "auburn");
    const faqs = buildFaqs(detail, region, noListings);
    expect(faqs.some((f) => f.q.includes("rooms available"))).toBe(false);
  });

  it("explains room counts are not a vacancy rate when there are rooms", () => {
    const { detail, region } = detailFor("nsw", "kellyville");
    const faqs = buildFaqs(detail, region, { ...noListings, activeListings: 1 });
    const rooms = faqs.find((f) => f.q.includes("rooms available"))!;
    expect(rooms.a).toContain("not a vacancy rate");
    expect(rooms.a).toContain("not yet enough listings");
  });

  it("labels the postcode as an approximation", () => {
    const { detail, region } = detailFor("nsw", "kellyville");
    const faq = buildFaqs(detail, region, noListings).find((f) => f.q.includes("postcode"))!;
    expect(faq.a).toMatch(/approximate|approximates/i);
    expect(faq.a).toContain("Australia Post");
  });

  it("produces something for a locality with almost no data, or nothing at all", () => {
    const sparse = loadPlaces().filter((p) => p.population === 0).slice(0, 25);
    for (const p of sparse) {
      const d = getPlaceDetail(p.salCode)!;
      const faqs = buildFaqs(d, getRegion(d.regionId), noListings);
      for (const f of faqs) expect(f.a).not.toMatch(/null|undefined|NaN/);
    }
  });
});
