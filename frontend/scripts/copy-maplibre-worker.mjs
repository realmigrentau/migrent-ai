#!/usr/bin/env node
/**
 * Serve MapLibre's web worker from this site.
 *
 * MapLibre 6 runs map work in a module worker it finds next to its own
 * script. Next.js bundles MapLibre, so that guess points at the page
 * itself and no map loads. This copies the worker and the chunk it imports
 * into public/vendor/maplibre-gl/<version>/, and lib/maplibre.ts points
 * MapLibre there. Same origin, so the CSP's worker-src 'self' covers it.
 *
 * Runs on every install (package.json "postinstall"), so the copy always
 * matches the installed version. The output is not committed.
 *
 *   node scripts/copy-maplibre-worker.mjs
 */
import { copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkgDir = path.join(root, "node_modules", "maplibre-gl");
const { version } = JSON.parse(readFileSync(path.join(pkgDir, "package.json"), "utf8"));
const base = path.join(root, "public", "vendor", "maplibre-gl");
const out = path.join(base, version);

// Only the installed version: old copies would be served for nothing.
rmSync(base, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(path.join(pkgDir, "dist", file), path.join(out, file));
}
console.log(`maplibre-gl ${version} worker copied to public/vendor/maplibre-gl/${version}/`);
