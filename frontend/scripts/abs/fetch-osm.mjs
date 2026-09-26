/**
 * Fetch public-transport stops and community amenities for Australia from
 * OpenStreetMap, via the Overpass API.
 *
 * This is the honest replacement for the "walkability score" the suburb pages
 * used to print. There is no free national walkability dataset for Australia,
 * so rather than invent a number out of ten we count things that are actually
 * mapped and say where the count came from. A count of zero means nothing is
 * mapped inside that boundary - which the UI states, because in remote
 * Australia that is a statement about OpenStreetMap, not about the town.
 *
 * Overpass will not answer "every bus stop in Australia" in one request - it
 * times out at the gateway. So the continent is cut into tiles and each tile
 * is asked separately; a tile that still times out is quartered and retried,
 * down to a floor, which concentrates the extra requests on the few tiles that
 * contain a capital city rather than on the many that are ocean.
 *
 * Overpass is a shared volunteer service. One tile at a time, sequentially,
 * with a pause between calls and a couple of retries on the 429/504 it returns
 * when it is busy. Progress is written after every tile, so an interrupted run
 * resumes instead of starting over.
 *
 * Usage:  node scripts/abs/fetch-osm.mjs [--force] [--only=supermarket,park]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CACHE_DIR } from "./fetch-sources.mjs";
import { OSM_CATEGORIES } from "./sources.mjs";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

// Australia including external territories, generous enough to cover Norfolk
// Island and Christmas Island without pulling in New Zealand or Indonesia.
const BBOX = { south: -44.0, west: 112.0, north: -9.0, east: 154.0 };

// Starting tile size in degrees. A tile that times out is quartered down to
// MIN_TILE, below which we accept the failure and record it rather than
// hammering a volunteer service.
const TILE_DEGREES = 7;
const MIN_TILE = 0.875;

const OUT = join(CACHE_DIR, "osm-amenities.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function tiles({ south, west, north, east }, step) {
  const out = [];
  for (let s = south; s < north; s += step) {
    for (let w = west; w < east; w += step) {
      out.push({ south: s, west: w, north: Math.min(s + step, north), east: Math.min(w + step, east) });
    }
  }
  return out;
}

function buildQuery(filters, b) {
  // `out center` gives ways and relations a representative point, so a
  // supermarket mapped as a building footprint counts the same as one mapped
  // as a node. `qt` sorts by quadtile, which Overpass answers fastest.
  const box = `${b.south},${b.west},${b.north},${b.east}`;
  const parts = filters
    .flatMap((f) => [`node${f}(${box});`, `way${f}(${box});`])
    .join("\n  ");
  return `[out:json][timeout:300];\n(\n  ${parts}\n);\nout center qt;`;
}

/** One Overpass request. Returns null if the server is overloaded for this tile. */
async function overpass(query, label) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    const endpoint = ENDPOINTS[attempt % ENDPOINTS.length];
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "User-Agent": "MigRent-suburb-directory-ETL/1.0 (+https://migrent.vercel.app)",
        },
        body: query,
      });
      if (res.status === 429 || res.status === 504 || res.status === 503) {
        lastError = new Error(`HTTP ${res.status}`);
        await sleep(15000 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      await sleep(10000);
    }
  }
  console.log(`    ${label}: giving up on this tile (${lastError?.message})`);
  return null;
}

/**
 * Fetch one tile, quartering it if Overpass cannot answer at this size.
 * Collected features are pushed into `sink`; unanswered tiles into `failed`.
 */
async function fetchTile(category, box, size, sink, failed) {
  const label = `${category.key} ${box.south.toFixed(1)},${box.west.toFixed(1)}`;
  const json = await overpass(buildQuery(category.filters, box), label);

  if (json === null) {
    if (size / 2 < MIN_TILE) { failed.push(box); return; }
    console.log(`    splitting ${label} into quarters`);
    const half = size / 2;
    for (const sub of tiles(box, half)) {
      await sleep(3000);
      await fetchTile(category, sub, half, sink, failed);
    }
    return;
  }

  // Keep only what the ETL needs: a point and a name. Tag soup is dropped
  // here so the cache file stays in the tens of megabytes, not hundreds.
  for (const el of json.elements || []) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (typeof lat !== "number" || typeof lon !== "number") continue;
    const f = [Math.round(lat * 1e5) / 1e5, Math.round(lon * 1e5) / 1e5];
    if (el.tags?.name) f.push(el.tags.name);
    sink.push(f);
  }
}

async function main() {
  const force = process.argv.includes("--force");
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.slice(7).split(",") : null;

  mkdirSync(CACHE_DIR, { recursive: true });
  const existing = !force && existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : null;
  const out = existing ?? { fetchedAt: null, bbox: BBOX, categories: {}, unanswered: {} };
  out.unanswered = out.unanswered || {};
  out.bbox = BBOX;

  for (const category of OSM_CATEGORIES) {
    if (only && !only.includes(category.key)) continue;
    if (!force && out.categories[category.key]) {
      console.log(`· ${category.key} cached (${out.categories[category.key].length} features)`);
      continue;
    }
    console.log(`↓ ${category.key}`);
    const sink = [];
    const failed = [];
    for (const box of tiles(BBOX, TILE_DEGREES)) {
      await fetchTile(category, box, TILE_DEGREES, sink, failed);
      await sleep(2500); // be a good citizen on a shared volunteer service
    }

    // Tiles overlap on their shared edges, and a way can be returned by two
    // neighbours, so identical points are collapsed.
    const seen = new Set();
    const unique = [];
    for (const f of sink) {
      const k = `${f[0]},${f[1]},${f[2] || ""}`;
      if (seen.has(k)) continue;
      seen.add(k);
      unique.push(f);
    }

    out.categories[category.key] = unique;
    if (failed.length) out.unanswered[category.key] = failed;
    else delete out.unanswered[category.key];
    console.log(`  ${category.key}: ${unique.length} features${failed.length ? ` (${failed.length} tiles unanswered)` : ""}`);

    out.fetchedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(out));
  }

  out.fetchedAt = out.fetchedAt || new Date().toISOString();
  writeFileSync(OUT, JSON.stringify(out));
  const total = Object.values(out.categories).reduce((n, a) => n + a.length, 0);
  console.log(`\nWrote ${OUT} - ${total.toLocaleString()} features across ${Object.keys(out.categories).length} categories`);
}

main().catch((err) => { console.error(err); process.exit(1); });
