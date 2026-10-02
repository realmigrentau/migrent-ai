/**
 * Write the suburb and postcode index the API checks listing addresses
 * against (backend/data/suburb_postcodes.json).
 *
 *   node scripts/abs/build-backend-index.mjs
 *
 * build-suburbs.mjs runs this at the end of every build, so a data refresh
 * keeps the API in step with the directory. It reads only the committed
 * detail files, so it can also be run on its own without the ABS cache.
 *
 * The backend is deployed separately (Render) and cannot read frontend/data,
 * hence a copy. It is reduced to what the check needs: name, state and every
 * postcode the ABS maps onto the place.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DETAIL_DIR = join(ROOT, "data", "suburbs", "detail");
const OUT_FILE = join(ROOT, "..", "backend", "data", "suburb_postcodes.json");

export function buildBackendIndex() {
  const rows = [];
  for (const file of readdirSync(DETAIL_DIR).filter((f) => f.endsWith(".json")).sort()) {
    const records = JSON.parse(readFileSync(join(DETAIL_DIR, file), "utf8"));
    for (const r of Object.values(records)) {
      rows.push([r.name, r.state, [...(r.postcodes || [])].sort()]);
    }
  }
  rows.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));
  const manifest = JSON.parse(readFileSync(join(ROOT, "data", "suburbs", "manifest.json"), "utf8"));
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify({
      source: "Built from frontend/data/suburbs by scripts/abs/build-backend-index.mjs",
      generatedAt: manifest.generatedAt ?? null,
      columns: ["name", "state", "postcodes"],
      rows,
    }),
  );
  return { places: rows.length, file: OUT_FILE };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { places, file } = buildBackendIndex();
  console.log(`Wrote ${places.toLocaleString()} places to ${file}`);
}
