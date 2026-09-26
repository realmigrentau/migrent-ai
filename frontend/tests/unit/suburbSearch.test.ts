import { describe, expect, it } from "vitest";
import { loadPlaces, regionMap } from "../../lib/suburbs/data.server";
import {
  boundedEditDistance, extractState, normalise, placeHref, resultLabel, searchPlaces,
} from "../../lib/suburbs/search";

/**
 * Search behaviour, against the real national index.
 *
 * The cases here are the ones people actually type: a bare name, a name plus
 * a state, a postcode, a name with an apostrophe nobody types, and a typo.
 */

const places = loadPlaces();
const regions = regionMap();
const find = (q: string, opts = {}) => searchPlaces(places, regions, q, opts);
const names = (q: string, opts = {}) => find(q, opts).results.map((r) => resultLabel(r.place));

describe("normalisation", () => {
  it("is case and punctuation insensitive", () => {
    expect(normalise("  KELLYVILLE  ")).toBe("kellyville");
    expect(normalise("Kurri Kurri")).toBe("kurri kurri");
  });

  it("drops apostrophes rather than splitting on them", () => {
    // The ABS writes "St Marys"; people type all three of these.
    expect(normalise("St Mary's")).toBe("st marys");
    expect(normalise("O'Connor")).toBe("oconnor");
  });
});

describe("state extraction", () => {
  it("reads an abbreviation from either end", () => {
    expect(extractState("richmond vic")).toEqual({ rest: "richmond", state: "VIC" });
    expect(extractState("nsw richmond")).toEqual({ rest: "richmond", state: "NSW" });
  });

  it("reads a full state name, preferring it over a shorter match", () => {
    expect(extractState("richmond south australia")).toEqual({ rest: "richmond", state: "SA" });
    expect(extractState("richmond new south wales")).toEqual({ rest: "richmond", state: "NSW" });
  });

  it("leaves a plain query alone", () => {
    expect(extractState("kellyville")).toEqual({ rest: "kellyville", state: null });
  });
});

describe("bounded edit distance", () => {
  it("measures small edits and gives up past the bound", () => {
    expect(boundedEditDistance("melbourne", "melbourne", 2)).toBe(0);
    expect(boundedEditDistance("melborne", "melbourne", 2)).toBe(1);
    expect(boundedEditDistance("aaaaaaaa", "bbbbbbbb", 2)).toBeGreaterThan(2);
  });
});

describe("finding a suburb", () => {
  it("puts an exact name first", () => {
    const top = find("Kellyville").results[0];
    expect(top.place.name).toBe("Kellyville");
    expect(top.place.state).toBe("NSW");
    expect(placeHref(top.place)).toBe("/suburb/nsw/kellyville");
  });

  it("returns every Richmond, each distinguishable by state", () => {
    const results = find("Richmond", { limit: 25 }).results.filter((r) => r.place.name === "Richmond");
    const states = new Set(results.map((r) => r.place.state));
    expect(states.size).toBeGreaterThanOrEqual(4);
    // Every label carries the state, and the Queensland pair carry their LGA.
    for (const r of results) expect(resultLabel(r.place)).toContain(r.place.state);
    const qld = results.filter((r) => r.place.state === "QLD");
    expect(qld.length).toBe(2);
    expect(new Set(qld.map((r) => resultLabel(r.place))).size).toBe(2);
  });

  it("narrows to one state when the query names one", () => {
    const vic = find("richmond vic").results;
    expect(vic.length).toBeGreaterThan(0);
    expect(vic.every((r) => r.place.state === "VIC")).toBe(true);
    expect(vic[0].place.name).toBe("Richmond");
  });

  it("respects an explicit state filter", () => {
    expect(names("richmond", { state: "TAS" }).every((n) => n.endsWith("TAS"))).toBe(true);
  });

  it("finds a suburb whose city section is collapsed on the page", () => {
    // Search reads the whole index, not what happens to be expanded.
    const remote = find("Petermann").results;
    expect(remote.length).toBeGreaterThan(0);
    expect(remote[0].place.state).toBe("NT");
  });
});

describe("postcodes", () => {
  it("finds suburbs by their ABS Postal Area", () => {
    const results = find("2150").results;
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.place.postcode === "2150")).toBe(true);
    expect(results[0].matchedOn).toBe("postcode");
  });

  it("handles a leading-zero postcode", () => {
    const results = find("0800").results;
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.place.state === "NT")).toBe(true);
  });

  it("does not treat a postcode as a name", () => {
    expect(find("2150").results.every((r) => r.matchedOn === "postcode")).toBe(true);
  });
});

describe("cities and regions", () => {
  it("offers the region when its own name is typed", () => {
    const { regions: hits } = find("Newcastle");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].region.name).toMatch(/Newcastle/);
    expect(hits[0].region.placeCount).toBeGreaterThan(0);
  });

  it("offers capital cities too", () => {
    const { regions: hits } = find("Adelaide");
    expect(hits.some((h) => h.region.id === "adelaide")).toBe(true);
  });
});

describe("typos", () => {
  it("still reaches Melbourne from a misspelling", () => {
    const results = find("melborne").results;
    expect(results.some((r) => r.place.name === "Melbourne")).toBe(true);
  });

  it("still reaches Kellyville from a misspelling", () => {
    expect(find("kelyville").results.some((r) => r.place.name === "Kellyville")).toBe(true);
  });

  it("does not invent matches for nonsense", () => {
    expect(find("zzzxqvwpl").results).toHaveLength(0);
  });
});

describe("edges", () => {
  it("returns nothing for an empty query", () => {
    expect(find("").results).toHaveLength(0);
    expect(find("   ").total).toBe(0);
  });

  it("reports a real total alongside a capped page of results", () => {
    const r = find("spring", { limit: 5 });
    expect(r.results.length).toBeLessThanOrEqual(5);
    expect(r.total).toBeGreaterThanOrEqual(r.results.length);
  });

  it("ranks a place people have heard of above an empty paddock", () => {
    const top = find("Sydney").results[0];
    expect(top.place.state).toBe("NSW");
    expect(top.place.regionId).toBe("sydney");
  });

  it("puts a suburb with a written guide ahead of its namesakes", () => {
    const top = find("Newtown").results[0];
    expect(top.place.state).toBe("NSW");
    expect(top.place.hasEditorial).toBe(true);
  });
});
