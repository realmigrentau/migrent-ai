import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * MapLibre 6 needs its web worker served by the site (lib/maplibre.ts,
 * scripts/copy-maplibre-worker.mjs). Without it every map stays blank, so
 * check the install step produced a copy of exactly the installed version.
 */
const root = path.resolve(__dirname, "../..");
const pkg = path.join(root, "node_modules", "maplibre-gl");
const { version } = JSON.parse(readFileSync(path.join(pkg, "package.json"), "utf8")) as { version: string };

describe("MapLibre worker", () => {
  it("is copied into public/ for the installed version", () => {
    for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
      const served = readFileSync(path.join(root, "public", "vendor", "maplibre-gl", version, file));
      expect(served.equals(readFileSync(path.join(pkg, "dist", file))), file).toBe(true);
    }
  });

  it("is where lib/maplibre.ts tells MapLibre to look", () => {
    const source = readFileSync(path.join(root, "lib", "maplibre.ts"), "utf8");
    expect(source).toContain("/vendor/maplibre-gl/${maplibregl.getVersion()}/maplibre-gl-worker.mjs");
    expect(source).toContain("setWorkerUrl(MAPLIBRE_WORKER_PATH)");
  });

  it("is the only way the app imports MapLibre", () => {
    for (const file of ["components/ListingsMap.tsx", "components/hub/discover/HubMap.tsx", "components/listings/KeyDetails.tsx"]) {
      const source = readFileSync(path.join(root, file), "utf8");
      expect(source, file).not.toMatch(/from "maplibre-gl"|import\("maplibre-gl"\)/);
    }
  });
});
