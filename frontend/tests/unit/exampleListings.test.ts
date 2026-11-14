import { describe, expect, it } from "vitest";
import {
  EXAMPLE_LISTINGS,
  EXAMPLE_LISTINGS_HIDE_AT,
  exampleListingHref,
  exampleListingTitle,
  showExampleListings,
} from "../../data/exampleListings";

/**
 * Example listings must never pass for real rooms: titled as examples, no
 * address, no host, photos from the stock library only, and gone once there
 * are enough real rooms.
 */

const STREET = /\b\d+[a-z]?\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?\s+(Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Parade|Pde|Place|Pl|Court|Ct|Crescent|Cres|Way|Highway|Hwy|Boulevard|Close|Terrace|Tce)\b/;

describe("example listings", () => {
  it("every title says it is an example", () => {
    for (const e of EXAMPLE_LISTINGS) {
      expect(exampleListingTitle(e)).toMatch(/^Example listing: /);
      expect(e.title).not.toMatch(/example/i);
    }
  });

  it("have unique, clean slugs under /example", () => {
    const slugs = EXAMPLE_LISTINGS.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const e of EXAMPLE_LISTINGS) {
      expect(e.slug).toMatch(/^[a-z0-9-]+$/);
      expect(exampleListingHref(e)).toBe(`/example/${e.slug}`);
    }
  });

  it("never carry a street address or a host", () => {
    for (const e of EXAMPLE_LISTINGS) {
      const text = [e.title, e.description, e.household, ...e.features, ...e.rules].join(" ");
      expect(text).not.toMatch(STREET);
      expect(Object.keys(e)).not.toEqual(expect.arrayContaining(["address"]));
      expect(e).not.toHaveProperty("street_address");
      expect(e).not.toHaveProperty("host");
      expect(e).not.toHaveProperty("owner");
    }
  });

  it("use stock photos only", () => {
    for (const e of EXAMPLE_LISTINGS) {
      expect(e.images.length).toBeGreaterThan(0);
      for (const src of e.images) expect(src).toMatch(/^https:\/\/images\.unsplash\.com\/photo-[0-9a-f-]+\?/);
    }
  });

  it("show only while there are few real rooms", () => {
    expect(showExampleListings(0)).toBe(true);
    expect(showExampleListings(EXAMPLE_LISTINGS_HIDE_AT - 1)).toBe(true);
    expect(showExampleListings(EXAMPLE_LISTINGS_HIDE_AT)).toBe(false);
    expect(showExampleListings(50)).toBe(false);
    // Unknown is treated as "don't show": never pad a catalogue we can't see.
    expect(showExampleListings(null)).toBe(false);
  });
});
