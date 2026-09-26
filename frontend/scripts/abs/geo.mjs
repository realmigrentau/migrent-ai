/**
 * Suburb polygons, and the spatial index that makes "which suburb is this
 * point in?" answerable 500,000 times without waiting all afternoon.
 *
 * The ETL needs real geometry for exactly one job: deciding which suburb an
 * OpenStreetMap feature belongs to. Counting by bounding box instead would be
 * wrong in a way that matters - Sydney Harbour's suburbs interlock, and a
 * rectangle around Balmain contains a good deal of Birchgrove - so this reads
 * the actual rings and does a point-in-polygon test.
 *
 * Everything here is dependency-free and reads the ESRI format directly. The
 * .shp is 136MB and expands to about 8.4 million coordinate pairs, which is
 * fine held as typed arrays and would not be fine held as JavaScript objects.
 */
import { openSync, readSync, closeSync, statSync } from "node:fs";

/** Shape types that carry polygon rings. Z/M variants append arrays we skip. */
const POLYGON_TYPES = new Set([5, 15, 25]);

/**
 * Read every polygon record from a .shp, using the .shx index to find them.
 *
 * Returns an array parallel to the .dbf rows. Each entry is
 * `{ xmin, ymin, xmax, ymax, parts: Int32Array, xs: Float64Array, ys: Float64Array }`
 * where `parts` holds the start offset of each ring. A record with no geometry
 * yields null.
 */
export function readPolygons(shpPath, shxPath) {
  const shx = readFileSyncBuf(shxPath);
  const count = (shx.length - 100) / 8;
  const fd = openSync(shpPath, "r");
  const shpSize = statSync(shpPath).size;
  const out = new Array(count);

  // One reusable buffer, grown on demand, so 15,353 records do not allocate
  // 15,353 large temporaries.
  let scratch = Buffer.alloc(1 << 20);

  try {
    for (let i = 0; i < count; i++) {
      const start = shx.readInt32BE(100 + i * 8) * 2;
      const contentLength = shx.readInt32BE(104 + i * 8) * 2;
      if (start + 8 + contentLength > shpSize || contentLength < 44) { out[i] = null; continue; }

      if (scratch.length < contentLength) scratch = Buffer.alloc(contentLength);
      readSync(fd, scratch, 0, contentLength, start + 8);

      const type = scratch.readInt32LE(0);
      if (!POLYGON_TYPES.has(type)) { out[i] = null; continue; }

      const xmin = scratch.readDoubleLE(4);
      const ymin = scratch.readDoubleLE(12);
      const xmax = scratch.readDoubleLE(20);
      const ymax = scratch.readDoubleLE(28);
      const numParts = scratch.readInt32LE(36);
      const numPoints = scratch.readInt32LE(40);
      if (numParts <= 0 || numPoints <= 0) { out[i] = null; continue; }

      const partsOffset = 44;
      const pointsOffset = partsOffset + numParts * 4;

      const parts = new Int32Array(numParts);
      for (let p = 0; p < numParts; p++) parts[p] = scratch.readInt32LE(partsOffset + p * 4);

      const xs = new Float64Array(numPoints);
      const ys = new Float64Array(numPoints);
      for (let p = 0; p < numPoints; p++) {
        const o = pointsOffset + p * 16;
        xs[p] = scratch.readDoubleLE(o);
        ys[p] = scratch.readDoubleLE(o + 8);
      }

      out[i] = { xmin, ymin, xmax, ymax, parts, xs, ys };
    }
  } finally {
    closeSync(fd);
  }
  return out;
}

function readFileSyncBuf(path) {
  const fd = openSync(path, "r");
  try {
    const size = statSync(path).size;
    const buf = Buffer.alloc(size);
    readSync(fd, buf, 0, size, 0);
    return buf;
  } finally {
    closeSync(fd);
  }
}

/**
 * Even-odd ray casting across every ring of the polygon at once.
 *
 * Shapefile holes are rings wound the other way, and the even-odd rule
 * handles them for free: a point inside an outer ring and inside a hole
 * crosses an even number of edges and correctly tests as outside.
 */
export function pointInPolygon(poly, x, y) {
  if (x < poly.xmin || x > poly.xmax || y < poly.ymin || y > poly.ymax) return false;
  const { parts, xs, ys } = poly;
  const n = xs.length;
  let inside = false;

  for (let p = 0; p < parts.length; p++) {
    const start = parts[p];
    const end = p + 1 < parts.length ? parts[p + 1] : n;
    for (let i = start, j = end - 1; i < end; j = i++) {
      const yi = ys[i], yj = ys[j];
      if ((yi > y) === (yj > y)) continue;
      const xi = xs[i], xj = xs[j];
      if (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/**
 * A uniform-grid index over polygon bounding boxes.
 *
 * Polygons bigger than `largeThreshold` degrees across go in a separate list
 * that every lookup scans. Without that, one 8-degree pastoral locality in
 * the Northern Territory would insert itself into 25,000 grid cells and the
 * index would cost more memory than the geometry.
 */
export function buildSpatialIndex(polygons, { cell = 0.05, largeThreshold = 1 } = {}) {
  const grid = new Map();
  const large = [];

  for (let i = 0; i < polygons.length; i++) {
    const poly = polygons[i];
    if (!poly) continue;
    if (poly.xmax - poly.xmin > largeThreshold || poly.ymax - poly.ymin > largeThreshold) {
      large.push(i);
      continue;
    }
    const x0 = Math.floor(poly.xmin / cell), x1 = Math.floor(poly.xmax / cell);
    const y0 = Math.floor(poly.ymin / cell), y1 = Math.floor(poly.ymax / cell);
    for (let gx = x0; gx <= x1; gx++) {
      for (let gy = y0; gy <= y1; gy++) {
        const key = gx * 100000 + gy;
        let bucket = grid.get(key);
        if (!bucket) { bucket = []; grid.set(key, bucket); }
        bucket.push(i);
      }
    }
  }

  return {
    cell,
    size: grid.size,
    largeCount: large.length,
    /** Index of the polygon containing (lon, lat), or -1. */
    locate(x, y) {
      const bucket = grid.get(Math.floor(x / cell) * 100000 + Math.floor(y / cell));
      if (bucket) {
        for (let k = 0; k < bucket.length; k++) {
          if (pointInPolygon(polygons[bucket[k]], x, y)) return bucket[k];
        }
      }
      for (let k = 0; k < large.length; k++) {
        if (pointInPolygon(polygons[large[k]], x, y)) return large[k];
      }
      return -1;
    },
  };
}

/**
 * Centre of the published extent - NOT a population-weighted centroid.
 *
 * For a compact suburb these are near enough the same thing. For a long
 * coastal locality they are not, which is why every distance derived from
 * this point is labelled approximate and the limitation is recorded against
 * the boundary file in the source manifest.
 */
export function extentCentre(poly) {
  if (!poly) return null;
  return {
    lat: Math.round(((poly.ymin + poly.ymax) / 2) * 1e6) / 1e6,
    lng: Math.round(((poly.xmin + poly.xmax) / 2) * 1e6) / 1e6,
  };
}

/** Great-circle distance in metres. Used for "nearest stop" only. */
export function haversineMetres(lat1, lon1, lat2, lon2) {
  const R = 6371008.8;
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
