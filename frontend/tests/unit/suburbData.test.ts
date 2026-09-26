import { describe, expect, it } from "vitest";
import {
  findPlace, findPlacesBySlug, getNearbyPlaces, getPlaceDetail, getRegionPlaces,
  loadManifest, loadPlaces, loadRegions, regionMap,
} from "../../lib/suburbs/data.server";
import { legacyRedirects } from "../../lib/suburbs/legacy.server";
import { FIELDS } from "../../lib/suburbs/fields";

/**
 * Integrity of the generated national dataset.
 *
 * These run against the committed data in data/suburbs/, so they fail if a
 * rebuild ever regresses the guarantees the pages depend on - a duplicate URL,
 * a suburb with no state, a special-purpose ABS code leaking into a public
 * page, or a statistic rendered without a source.
 */

const places = loadPlaces();
const regions = loadRegions();
const manifest = loadManifest();

describe("coverage", () => {
  it("imports the whole ASGS Edition 3 SAL dataset", () => {
    expect(manifest.counts.rawSalRecords).toBe(15353);
  });

  it("excludes exactly the 19 special-purpose codes", () => {
    expect(manifest.counts.excludedSpecialPurpose).toBe(19);
    expect(manifest.counts.publicPlaces).toBe(15353 - 19);
    expect(places).toHaveLength(manifest.counts.publicPlaces);
  });

  it("keeps the real Other Territories localities, which share the 9xxxx code band", () => {
    for (const name of ["Christmas Island", "Norfolk Island", "Jervis Bay", "Home Island", "West Island"]) {
      expect(places.some((p) => p.name === name), `${name} should be public`).toBe(true);
    }
  });

  it("accounts for every public place in exactly one region", () => {
    const sum = regions.reduce((n, r) => n + r.placeCount, 0);
    expect(sum).toBe(places.length);
  });

  it("covers all eight capitals plus regional and remote groupings", () => {
    const capitals = regions.filter((r) => r.kind === "capital").map((r) => r.name);
    expect(capitals).toEqual([
      "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Hobart", "Darwin",
    ]);
    expect(regions.filter((r) => r.kind === "urban").length).toBeGreaterThan(50);
    expect(regions.filter((r) => r.kind === "rest").length).toBeGreaterThan(0);
  });
});

describe("identifiers", () => {
  it("gives every place a unique SAL code", () => {
    const seen = new Set(places.map((p) => p.salCode));
    expect(seen.size).toBe(places.length);
  });

  it("gives every place a unique URL", () => {
    const urls = places.map((p) => `${p.state.toLowerCase()}/${p.slug}`);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("gives every place a state and a known region", () => {
    const ids = new Set(regions.map((r) => r.id));
    for (const p of places) {
      expect(p.state, `${p.salCode} has no state`).toBeTruthy();
      expect(ids.has(p.regionId), `${p.salCode} has unknown region ${p.regionId}`).toBe(true);
    }
  });

  it("never publishes a special-purpose ABS record", () => {
    const banned = /^(no usual address|migratory|outside australia)/i;
    for (const p of places) expect(banned.test(p.name), `${p.name} leaked`).toBe(false);
    expect(manifest.excluded).toHaveLength(19);
  });

  it("keeps same-named places in one state distinguishable", () => {
    // Queensland has two Richmonds and two Newtowns; each must be reachable.
    const qldRichmonds = places.filter((p) => p.state === "QLD" && p.name === "Richmond");
    expect(qldRichmonds.length).toBe(2);
    expect(new Set(qldRichmonds.map((p) => p.slug)).size).toBe(2);
    for (const r of qldRichmonds) expect(r.lgaQualifier).toBeTruthy();
  });

  it("resolves the nine Springfields without collision", () => {
    const springfields = places.filter((p) => p.name === "Springfield");
    expect(springfields.length).toBeGreaterThanOrEqual(7);
    const urls = springfields.map((p) => `${p.state}/${p.slug}`);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("region mapping", () => {
  it("assigns by mesh block overlap, never by name", () => {
    const kellyville = findPlace("nsw", "kellyville");
    expect(kellyville?.regionId).toBe("sydney");
    const detail = getPlaceDetail(kellyville!.salCode)!;
    expect(detail.mapping.method).toBe("dominant-mesh-block-gccsa");
    expect(detail.mapping.share).toBeGreaterThan(0.5);
    expect(detail.mapping.sourceGeography).toContain("mesh blocks");
  });

  it("does not put a namesake suburb in the wrong city", () => {
    // Richmond, Victoria is inner Melbourne; Richmond, NSW is not Sydney's.
    const vic = findPlace("vic", "richmond");
    expect(vic?.regionId).toBe("melbourne");
    // Every Richmond in Queensland is regional, not Brisbane.
    for (const r of places.filter((p) => p.state === "QLD" && p.name === "Richmond")) {
      expect(r.regionId).not.toBe("brisbane");
    }
  });
});

describe("statistics", () => {
  it("has source metadata for every field the pages render", () => {
    for (const [key, meta] of Object.entries(FIELDS)) {
      expect(meta.key).toBe(key);
      expect(meta.label).toBeTruthy();
      expect(meta.measure).toBeTruthy();
      expect(meta.sourceId).toBeTruthy();
      const source = manifest.sources.find((s) => s.id === meta.sourceId);
      expect(source, `${key} points at unknown source ${meta.sourceId}`).toBeTruthy();
      expect(source!.referencePeriod).toBeTruthy();
      expect(source!.licence.name).toBeTruthy();
      // Anything we calculated has to say how.
      if (meta.quality === "derived") expect(meta.methodology, `${key} needs a method`).toBeTruthy();
    }
  });

  it("uses null rather than a placeholder for missing values", () => {
    // Sample widely: a zero median would read as "$0 a week".
    for (const p of places.slice(0, 4000)) {
      const d = getPlaceDetail(p.salCode);
      if (!d?.census) continue;
      for (const key of ["medianWeeklyRent", "medianAge", "medianWeeklyHouseholdIncome"] as const) {
        const v = d.census[key];
        expect(v === null || v > 0, `${p.name} ${key} = ${v}`).toBe(true);
      }
    }
  });

  it("suppresses rates for places too small for the ABS to report reliably", () => {
    const tiny = places.filter((p) => p.population > 0 && p.population < 50).slice(0, 50);
    expect(tiny.length).toBeGreaterThan(0);
    for (const p of tiny) {
      const d = getPlaceDetail(p.salCode);
      expect(d?.census?.ratesSuppressed).toBe(true);
      expect(d?.census?.overseasBornPct).toBeNull();
      expect(d?.census?.topCountriesOfBirth).toBeNull();
    }
  });

  it("carries no fabricated safety, walkability or vacancy field", () => {
    const detail = getPlaceDetail(findPlace("nsw", "auburn")!.salCode)!;
    const json = JSON.stringify(detail).toLowerCase();
    for (const banned of ["safety_score", "safetyscore", "walkability", "vacancy", "walk_min", "rent_trend"]) {
      expect(json.includes(banned), `${banned} still present`).toBe(false);
    }
  });

  it("labels nearest-stop distances as straight-line only", () => {
    expect(FIELDS.nearestTransport.methodology).toMatch(/straight-line/i);
    expect(FIELDS.nearestTransport.limitation).toMatch(/not a walking route/i);
  });
});

describe("the sixteen migrated guides", () => {
  const legacy = legacyRedirects();

  it("migrated all sixteen onto SAL codes", () => {
    expect(Object.keys(legacy)).toHaveLength(16);
  });

  it("points every old URL at a real page", () => {
    for (const [slug, target] of Object.entries(legacy)) {
      const place = findPlace(target.state, target.slug);
      expect(place, `${slug} -> ${target.state}/${target.slug} is missing`).toBeTruthy();
      expect(place!.salCode).toBe(target.salCode);
      expect(getPlaceDetail(place!.salCode)?.editorial, `${slug} lost its editorial`).toBeTruthy();
    }
  });

  it("sends /suburb/auburn to the NSW Auburn, not the Queensland one", () => {
    expect(legacy.auburn.state).toBe("nsw");
    expect(findPlacesBySlug("auburn").length).toBeGreaterThan(1);
  });

  it("sends /suburb/west-end to Brisbane, not Townsville", () => {
    const detail = getPlaceDetail(legacy["west-end"].salCode)!;
    expect(detail.regionId).toBe("brisbane");
  });

  it("strips unsourceable numbers out of the editorial it kept", () => {
    for (const target of Object.values(legacy)) {
      const ed = getPlaceDetail(target.salCode)!.editorial!;
      const text = [ed.summary, ...ed.loves, ...ed.thingsToKnow, ed.transportNote ?? ""].join(" ");
      expect(text, `${target.slug} still quotes a commute time`).not.toMatch(/\d+\s*min/i);
      expect(text, `${target.slug} still quotes a rent figure`).not.toMatch(/\$\s?\d/);
      expect(text, `${target.slug} still claims a safety score`).not.toMatch(/safety score|\d\/10/i);
      expect(ed.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("region listing", () => {
  it("returns a page of six with the true total", () => {
    const { places: page, total } = getRegionPlaces("sydney", { offset: 0, limit: 6 });
    expect(page).toHaveLength(6);
    expect(total).toBe(regionMap().get("sydney")!.placeCount);
  });

  it("pages without repeating or dropping a suburb", () => {
    const a = getRegionPlaces("hobart", { offset: 0, limit: 20, sort: "name" }).places;
    const b = getRegionPlaces("hobart", { offset: 20, limit: 20, sort: "name" }).places;
    const codes = [...a, ...b].map((p) => p.salCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("finds genuinely nearby suburbs, not alphabetical neighbours", () => {
    const newtown = findPlace("nsw", "newtown")!;
    const nearby = getNearbyPlaces(newtown, 6);
    expect(nearby.length).toBe(6);
    expect(nearby.every((n) => n.salCode !== newtown.salCode)).toBe(true);
    // Everything within a few kilometres of Newtown is inner Sydney.
    expect(nearby.every((n) => n.regionId === "sydney")).toBe(true);
  });
});
