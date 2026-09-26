/**
 * Stage 3 - what is actually mapped inside each suburb.
 *
 * This replaces the "walkability 6.5/10" and "transport score 7.8/10" the old
 * pages printed. Neither had a methodology, and there is no free national
 * dataset that would support one, so instead of scoring we count: how many
 * supermarkets, stations, schools and parks OpenStreetMap has inside this
 * suburb's boundary, and which station is nearest.
 *
 * Two deliberate restraints:
 *
 *  - Features are assigned by point-in-polygon against the real SAL boundary,
 *    not by bounding box. Inner-city suburbs interlock, and a rectangle drawn
 *    around Balmain contains most of Birchgrove.
 *  - The distance to the nearest station is straight-line from the suburb's
 *    extent centre, and is labelled as such everywhere it appears. We have no
 *    routing engine, so we do not publish walking minutes and we do not
 *    publish commute times. A guessed "12 min walk" is exactly the kind of
 *    number this rebuild exists to remove.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { haversineMetres } from "../geo.mjs";
import { OSM_CATEGORIES } from "../sources.mjs";

/** Categories whose nearest feature is worth naming on the page. */
const TRANSPORT = ["train_station", "tram_stop", "ferry_terminal"];

/** Beyond this, "nearest station" stops being a useful fact about a place. */
const NEAREST_LIMIT_METRES = 20000;

export function buildAmenities(cacheDir, { polygons, index, salCodeAt, places }, log = console.log) {
  const path = join(cacheDir, "osm-amenities.json");
  if (!existsSync(path)) {
    log("  no OpenStreetMap cache - amenity counts will be unavailable");
    return { byPlace: new Map(), categories: [], fetchedAt: null, missing: OSM_CATEGORIES.map((c) => c.key) };
  }

  const osm = JSON.parse(readFileSync(path, "utf8"));
  const available = OSM_CATEGORIES.filter((c) => Array.isArray(osm.categories?.[c.key]));
  const missing = OSM_CATEGORIES.filter((c) => !Array.isArray(osm.categories?.[c.key])).map((c) => c.key);
  if (missing.length) log(`  categories not in the cache, left unavailable: ${missing.join(", ")}`);

  const byPlace = new Map(); // salCode -> { counts, nearest }
  const ensure = (code) => {
    let r = byPlace.get(code);
    if (!r) { r = { counts: {}, nearest: [] }; byPlace.set(code, r); }
    return r;
  };

  // -- Counts inside each boundary ----------------------------------------
  for (const category of available) {
    const features = osm.categories[category.key];
    let placed = 0;
    for (let i = 0; i < features.length; i++) {
      const [lat, lon] = features[i];
      const polyIndex = index.locate(lon, lat);
      if (polyIndex < 0) continue;
      const code = salCodeAt(polyIndex);
      if (!code) continue;
      const rec = ensure(code);
      rec.counts[category.key] = (rec.counts[category.key] || 0) + 1;
      placed++;
    }
    log(`  ${category.key}: ${placed.toLocaleString()} of ${features.length.toLocaleString()} fell inside a suburb`);
  }

  // -- Nearest transport stop, straight line from the extent centre --------
  const stops = [];
  for (const key of TRANSPORT) {
    const features = osm.categories?.[key];
    if (!Array.isArray(features)) continue;
    for (const f of features) stops.push([f[0], f[1], f[2] || null, key]);
  }

  if (stops.length) {
    log(`  nearest-stop search over ${stops.length.toLocaleString()} stops`);
    for (const place of places) {
      if (!place.centre) continue;
      const { lat, lng } = place.centre;
      const best = new Map(); // category -> [distance, name]
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        // Cheap rejection before the trigonometry: one degree of latitude is
        // ~111km, so anything further than the limit in raw degrees cannot win.
        if (Math.abs(s[0] - lat) > 0.2 || Math.abs(s[1] - lng) > 0.25) continue;
        const d = haversineMetres(lat, lng, s[0], s[1]);
        if (d > NEAREST_LIMIT_METRES) continue;
        const cur = best.get(s[3]);
        if (!cur || d < cur[0]) best.set(s[3], [d, s[2]]);
      }
      if (!best.size) continue;
      const rec = ensure(place.salCode);
      rec.nearest = [...best.entries()]
        .map(([category, [distance, name]]) => ({
          category,
          name: name || null,
          distanceMetres: Math.round(distance),
        }))
        .sort((a, b) => a.distanceMetres - b.distanceMetres);
    }
  }

  return {
    byPlace,
    categories: available.map((c) => ({ key: c.key, label: c.label })),
    missing,
    fetchedAt: osm.fetchedAt || null,
    unanswered: osm.unanswered || {},
  };
}
