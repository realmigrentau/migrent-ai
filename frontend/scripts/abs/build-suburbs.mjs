/**
 * Build the national suburb directory from the cached ABS and OpenStreetMap
 * sources.
 *
 *   node scripts/abs/fetch-sources.mjs      # ~280MB of ABS downloads, once
 *   node scripts/abs/fetch-osm.mjs          # Overpass, tiled, ~20 minutes
 *   node scripts/abs/build-suburbs.mjs      # this - offline, ~60 seconds
 *
 * Nothing in lib/ or pages/ knows an ASGS edition number or a Census year.
 * Upgrading to Edition 4 when the SAL data lands in October 2026 means
 * pointing sources.mjs at the new files and running this again; the shape of
 * the output, and therefore the whole UI, is unchanged.
 *
 * The output is written to data/suburbs/ and committed, because Vercel builds
 * from the repository and cannot be asked to download a 98MB Census archive.
 * What is committed is already reduced: no raw Census table ever reaches the
 * browser, and no page loads more than the one bucket file it needs.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

import { SOURCES, ASGS_EDITION, MIN_LISTING_SAMPLE, OSM_CATEGORIES } from "./sources.mjs";
import { readLock, CACHE_DIR } from "./fetch-sources.mjs";
import { buildGeography } from "./stages/geography.mjs";
import { buildCensus, MIN_POPULATION_FOR_RATES } from "./stages/census.mjs";
import { buildAmenities } from "./stages/amenities.mjs";
import { readPolygons, buildSpatialIndex, extentCentre } from "./geo.mjs";
import { readDbf } from "./shapefile.mjs";
import { assignSlugs } from "./naming.mjs";
import { EDITORIAL, EDITORIAL_REVIEWED_ON, LEGACY_SLUGS } from "./editorial.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_DIR = join(ROOT, "data", "suburbs");
const SHP_DIR = join(CACHE_DIR, "sal-shp");
const SHP_BASE = "SAL_2021_AUST_GDA2020";

const log = (...a) => console.log(...a);

/** Detail records are sharded by the last two digits of the SAL code. */
export const bucketOf = (salCode) => String(salCode).slice(-2).padStart(2, "0");

function unpackBoundaries() {
  const shp = join(SHP_DIR, `${SHP_BASE}.shp`);
  if (existsSync(shp)) return;
  log("  unpacking SAL boundary shapefile");
  mkdirSync(SHP_DIR, { recursive: true });
  execFileSync("unzip", ["-o", "-q", join(CACHE_DIR, "SAL_2021_AUST_GDA2020_SHP.zip"), "-d", SHP_DIR]);
}

async function main() {
  const startedAt = new Date();
  const t0 = Date.now();
  log(`MigRent suburb directory build - ASGS Edition ${ASGS_EDITION}\n`);

  // -- 1. Geography and the city/region mapping ---------------------------
  log("Geography");
  const geo = buildGeography(CACHE_DIR, log);
  const places = geo.places;

  // -- 2. Boundaries: a reference point per suburb, and the polygons the
  //       amenity join needs ---------------------------------------------
  log("\nBoundaries");
  unpackBoundaries();
  const dbf = readDbf(join(SHP_DIR, `${SHP_BASE}.dbf`), { fields: ["SAL_CODE21"] });
  const polygons = readPolygons(join(SHP_DIR, `${SHP_BASE}.shp`), join(SHP_DIR, `${SHP_BASE}.shx`));
  const polyIndexBySal = new Map();
  for (let i = 0; i < dbf.length; i++) if (dbf[i]) polyIndexBySal.set(dbf[i].SAL_CODE21, i);
  log(`  ${polygons.filter(Boolean).length.toLocaleString()} boundaries with geometry`);

  let missingGeometry = 0;
  for (const p of places) {
    const i = polyIndexBySal.get(p.salCode);
    const poly = i === undefined ? null : polygons[i];
    p.centre = extentCentre(poly);
    p.bbox = poly ? [poly.xmin, poly.ymin, poly.xmax, poly.ymax].map((n) => Math.round(n * 1e6) / 1e6) : null;
    if (!p.centre) missingGeometry++;
  }
  if (missingGeometry) log(`  ${missingGeometry} public places have no boundary geometry`);

  const index = buildSpatialIndex(polygons);
  log(`  spatial index: ${index.size.toLocaleString()} cells, ${index.largeCount} oversized boundaries`);

  // -- 3. Census ----------------------------------------------------------
  log("\nCensus 2021");
  const census = buildCensus(CACHE_DIR, log);

  // -- 4. OpenStreetMap amenities -----------------------------------------
  log("\nAmenities (OpenStreetMap)");
  const salCodeAt = (polyIdx) => dbf[polyIdx]?.SAL_CODE21 || null;
  const amenities = buildAmenities(CACHE_DIR, { polygons, index, salCodeAt, places }, log);

  // -- 5. Names, slugs and the duplicate-name problem ---------------------
  log("\nNaming");
  const disambiguated = assignSlugs(places);
  log(`  ${disambiguated.toLocaleString()} places needed more than their bare name to be unique in their state`);

  // -- 6. Assemble --------------------------------------------------------
  log("\nAssembling");
  const coverage = {
    population: 0, medianAge: 0, medianWeeklyRent: 0, medianWeeklyHouseholdIncome: 0,
    overseasBornPct: 0, topCountriesOfBirth: 0, rentedDwellingsPct: 0,
    amenityCounts: 0, nearestTransport: 0, centre: 0, postcode: 0, editorial: 0,
  };

  const details = new Map(); // bucket -> { salCode: detail }
  const rows = [];

  for (const p of places) {
    const c = census.get(p.salCode) || null;
    const a = amenities.byPlace.get(p.salCode) || null;
    const ed = EDITORIAL[p.salCode] || null;

    if (c?.population > 0) coverage.population++;
    if (c?.medianAge != null) coverage.medianAge++;
    if (c?.medianWeeklyRent != null) coverage.medianWeeklyRent++;
    if (c?.medianWeeklyHouseholdIncome != null) coverage.medianWeeklyHouseholdIncome++;
    if (c?.overseasBornPct != null) coverage.overseasBornPct++;
    if (c?.topCountriesOfBirth?.length) coverage.topCountriesOfBirth++;
    if (c?.rentedDwellingsPct != null) coverage.rentedDwellingsPct++;
    if (a && Object.keys(a.counts).length) coverage.amenityCounts++;
    if (a?.nearest?.length) coverage.nearestTransport++;
    if (p.centre) coverage.centre++;
    if (p.postcodes.length) coverage.postcode++;
    if (ed) coverage.editorial++;

    // The compact row the directory and the search index are built from.
    rows.push([
      p.salCode,
      p.displayName,
      p.slug,
      p.state,
      p.regionId,
      p.postcodes[0] || null,
      c?.population ?? 0,
      c?.overseasBornPct ?? null,
      p.centre?.lat ?? null,
      p.centre?.lng ?? null,
      p.disambiguatedBy === "lga" ? p.lgaQualifier : null,
      ed ? 1 : 0,
    ]);

    const bucket = bucketOf(p.salCode);
    if (!details.has(bucket)) details.set(bucket, {});
    details.get(bucket)[p.salCode] = {
      salCode: p.salCode,
      name: p.displayName,
      publishedName: p.publishedName,
      lgaQualifier: p.lgaQualifier,
      disambiguatedBy: p.disambiguatedBy,
      slug: p.slug,
      state: p.state,
      stateName: p.stateName,
      regionId: p.regionId,
      postcodes: p.postcodes,
      areaSqKm: p.areaSqKm,
      sectionOfState: p.sectionOfState,
      centre: p.centre,
      bbox: p.bbox,
      mapping: p.mapping,
      census: c,
      amenities: a ? { counts: a.counts, nearest: a.nearest } : null,
      editorial: ed
        ? {
            summary: ed.summary,
            loves: ed.loves,
            thingsToKnow: ed.thingsToKnow,
            transportNote: ed.transportNote || null,
            reviewedOn: EDITORIAL_REVIEWED_ON,
          }
        : null,
    };
  }

  // -- 7. Validate. A failure here fails the build, on purpose. -----------
  log("\nValidating");
  const problems = [];
  const seenCode = new Set();
  const seenUrl = new Set();
  const regionIds = new Set(geo.regions.map((r) => r.id));

  for (const p of places) {
    if (seenCode.has(p.salCode)) problems.push(`duplicate SAL code ${p.salCode}`);
    seenCode.add(p.salCode);

    const url = `${p.state.toLowerCase()}/${p.slug}`;
    if (seenUrl.has(url)) problems.push(`duplicate URL /suburb/${url} (SAL ${p.salCode})`);
    seenUrl.add(url);

    if (!p.state) problems.push(`${p.salCode} has no state`);
    if (!regionIds.has(p.regionId)) problems.push(`${p.salCode} points at unknown region ${p.regionId}`);
    if (!p.slug) problems.push(`${p.salCode} has an empty slug`);
    if (/^(no usual address|migratory|outside australia)/i.test(p.displayName)) {
      problems.push(`${p.salCode} "${p.displayName}" is a special-purpose code and must not be public`);
    }
  }

  // Two regions with the same name are indistinguishable on the page and in
  // a screen reader's list of headings. This is how the stray one-suburb
  // "Melbourne" was caught.
  const regionNames = new Map();
  for (const r of geo.regions) {
    if (regionNames.has(r.name)) {
      problems.push(`two regions are both called "${r.name}" (${regionNames.get(r.name)} and ${r.id})`);
    }
    regionNames.set(r.name, r.id);
  }

  if (problems.length) {
    console.error(`\n${problems.length} validation problems:`);
    for (const m of problems.slice(0, 25)) console.error(`  ${m}`);
    process.exit(1);
  }
  log(`  ${places.length.toLocaleString()} places, ${seenUrl.size.toLocaleString()} unique URLs, no problems`);

  // -- 8. Write -----------------------------------------------------------
  log("\nWriting");
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(join(OUT_DIR, "detail"), { recursive: true });

  const lock = readLock();
  const manifest = {
    generatedAt: startedAt.toISOString(),
    asgsEdition: ASGS_EDITION,
    censusYear: "2021",
    minPopulationForRates: MIN_POPULATION_FOR_RATES,
    minListingSample: MIN_LISTING_SAMPLE,
    counts: {
      rawSalRecords: geo.counts.raw,
      excludedSpecialPurpose: geo.counts.specialPurpose,
      publicPlaces: geo.counts.public,
      assignedToCapital: geo.counts.byCapital,
      assignedToUrbanArea: geo.counts.byUrbanArea,
      assignedToStateRemainder: geo.counts.byStateRemainder,
      failedValidation: geo.counts.failedValidation,
      regions: geo.regions.length,
      disambiguatedNames: disambiguated,
      missingBoundaryGeometry: missingGeometry,
    },
    coverage,
    excluded: geo.excluded,
    amenities: {
      fetchedAt: amenities.fetchedAt,
      categories: amenities.categories,
      unavailableCategories: amenities.missing,
      tilesUnanswered: Object.fromEntries(
        Object.entries(amenities.unanswered || {}).map(([k, v]) => [k, v.length]),
      ),
      allCategories: OSM_CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
    },
    sources: SOURCES.map((s) => ({
      id: s.id,
      group: s.group,
      organisation: s.organisation,
      dataset: s.dataset,
      edition: s.edition,
      referencePeriod: s.referencePeriod,
      geographyLevel: s.geographyLevel,
      url: s.url,
      landingUrl: s.landingUrl,
      licence: s.licence,
      provides: s.provides || [],
      limitations: s.limitations || null,
      tables: s.tables || null,
      downloadedAt: lock[s.id]?.downloadedAt || null,
      sha256: lock[s.id]?.sha256 || null,
      bytes: lock[s.id]?.bytes || null,
    })),
  };

  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  writeFileSync(
    join(OUT_DIR, "regions.json"),
    JSON.stringify(geo.regions, null, 2) + "\n",
  );
  writeFileSync(
    join(OUT_DIR, "places.json"),
    JSON.stringify({
      columns: [
        "salCode", "name", "slug", "state", "regionId", "postcode",
        "population", "overseasBornPct", "lat", "lng", "lgaQualifier", "hasEditorial",
      ],
      rows,
    }),
  );
  for (const [bucket, records] of details) {
    writeFileSync(join(OUT_DIR, "detail", `${bucket}.json`), JSON.stringify(records));
  }

  // The sixteen URLs that existed before this rebuild. /suburb/auburn has to
  // keep working, and "auburn" alone is ambiguous - there are two of them -
  // so the destination is resolved here, once, from the SAL code the
  // editorial was migrated onto.
  const legacy = {};
  const bySal = new Map(places.map((p) => [p.salCode, p]));
  for (const [slug, salCode] of Object.entries(LEGACY_SLUGS)) {
    const place = bySal.get(salCode);
    if (!place) throw new Error(`Legacy slug "${slug}" points at SAL ${salCode}, which is not a public place`);
    legacy[slug] = { salCode, state: place.state.toLowerCase(), slug: place.slug };
  }
  writeFileSync(join(OUT_DIR, "legacy-redirects.json"), JSON.stringify(legacy, null, 2) + "\n");
  log(`  ${Object.keys(legacy).length} legacy URL redirects`);

  // -- 9. Coverage report --------------------------------------------------
  const pct = (n) => `${((n / places.length) * 100).toFixed(1)}%`;
  log(`\n${"=".repeat(64)}`);
  log("COVERAGE REPORT");
  log("=".repeat(64));
  log(`Raw SAL records                  ${geo.counts.raw.toLocaleString()}`);
  log(`Excluded special-purpose codes   ${geo.counts.specialPurpose}`);
  log(`Public suburbs and localities    ${geo.counts.public.toLocaleString()}`);
  log(`  in a capital city              ${geo.counts.byCapital.toLocaleString()}`);
  log(`  in a regional urban area       ${geo.counts.byUrbanArea.toLocaleString()}`);
  log(`  in a regional/remote grouping  ${geo.counts.byStateRemainder.toLocaleString()}`);
  log(`Failed validation                ${geo.counts.failedValidation}`);
  log(`Regions                          ${geo.regions.length}`);
  log("");
  for (const [k, v] of Object.entries(coverage)) {
    log(`  ${k.padEnd(30)} ${String(v).padStart(6)}  ${pct(v)}`);
  }
  log("");
  log(`Detail buckets   ${details.size}`);
  log(`Output           ${OUT_DIR}`);
  log(`Elapsed          ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((err) => { console.error(err); process.exit(1); });
