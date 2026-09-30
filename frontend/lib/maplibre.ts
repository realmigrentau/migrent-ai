/**
 * MapLibre, set up for this site. Import maps from here, not from
 * "maplibre-gl" directly.
 *
 * MapLibre 6 looks for its web worker next to its own script, which inside
 * a Next.js bundle is the page itself, so no map would load.
 * scripts/copy-maplibre-worker.mjs copies the worker into
 * public/vendor/maplibre-gl/<version>/ on install; this points MapLibre at
 * that copy before any map is created.
 */
import * as maplibregl from "maplibre-gl";

export const MAPLIBRE_WORKER_PATH = `/vendor/maplibre-gl/${maplibregl.getVersion()}/maplibre-gl-worker.mjs`;

maplibregl.setWorkerUrl(MAPLIBRE_WORKER_PATH);

export default maplibregl;
