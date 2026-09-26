/**
 * A dependency-free reader for the two parts of an ESRI shapefile the ETL
 * needs: each record's attributes (.dbf) and each record's bounding box (.shp).
 *
 * The ABS SAL boundary file is 142MB of polygon geometry, and we do not want
 * any of it - we want one reference point per suburb. The shapefile format is
 * generous here: every record stores its own bounding box in the first 32
 * bytes of its content, and the companion .shx index gives each record's byte
 * offset. So we read the 123KB index, then seek to 15,353 individual 44-byte
 * reads. Nothing decodes a polygon ring, and peak memory stays in kilobytes.
 *
 * The point we derive is the centre of the published extent, NOT a
 * population-weighted centroid. Every distance computed from it is labelled
 * approximate downstream, and the limitation is recorded in the source
 * manifest.
 */
import { openSync, readSync, closeSync, readFileSync, statSync } from "node:fs";

/**
 * Read a .dbf table. dBase III: a 32-byte header, 32 bytes per field
 * descriptor, a 0x0D terminator, then fixed-width records each prefixed with
 * a deletion flag.
 */
export function readDbf(path, { fields: wanted } = {}) {
  const buf = readFileSync(path);
  const recordCount = buf.readUInt32LE(4);
  const headerLength = buf.readUInt16LE(8);
  const recordLength = buf.readUInt16LE(10);

  const fields = [];
  let offsetInRecord = 1; // byte 0 of each record is the deletion flag
  for (let p = 32; p < headerLength - 1; p += 32) {
    if (buf[p] === 0x0d) break;
    let end = 0;
    while (end < 11 && buf[p + end] !== 0) end++;
    const name = buf.toString("latin1", p, p + end);
    const type = String.fromCharCode(buf[p + 11]);
    const length = buf[p + 16];
    fields.push({ name, type, length, offset: offsetInRecord });
    offsetInRecord += length;
  }

  const take = fields.filter((f) => !wanted || wanted.includes(f.name));
  const rows = [];
  for (let i = 0; i < recordCount; i++) {
    const start = headerLength + i * recordLength;
    if (buf[start] === 0x2a) { rows.push(null); continue; } // deleted record
    const row = {};
    for (const f of take) {
      const raw = buf.toString("utf8", start + f.offset, start + f.offset + f.length).trim();
      if (f.type === "N" || f.type === "F") {
        row[f.name] = raw === "" ? null : Number(raw);
      } else if (f.type === "L") {
        row[f.name] = /^[YyTt]$/.test(raw) ? true : /^[NnFf]$/.test(raw) ? false : null;
      } else {
        row[f.name] = raw;
      }
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Read one bounding box per record from a .shp, using the .shx index to seek.
 * Returns an array parallel to the .dbf rows; a record with no geometry (a
 * null shape, type 0) yields null.
 */
export function readShapeBounds(shpPath, shxPath) {
  const shx = readFileSync(shxPath);
  // The .shx is a 100-byte header then 8 bytes per record: offset and content
  // length, both big-endian and both counted in 16-bit words.
  const count = (shx.length - 100) / 8;
  const fd = openSync(shpPath, "r");
  const shpSize = statSync(shpPath).size;
  const head = Buffer.alloc(44);
  const out = [];
  try {
    for (let i = 0; i < count; i++) {
      const offsetWords = shx.readInt32BE(100 + i * 8);
      const recordStart = offsetWords * 2;
      // 8-byte record header, then 4-byte shape type, then the 32-byte box.
      if (recordStart + 44 > shpSize) { out.push(null); continue; }
      readSync(fd, head, 0, 44, recordStart);
      const shapeType = head.readInt32LE(8);
      if (shapeType === 0) { out.push(null); continue; } // null shape
      // Point shapes (1) carry x,y directly instead of a box.
      if (shapeType === 1 || shapeType === 11 || shapeType === 21) {
        out.push({
          xmin: head.readDoubleLE(12), ymin: head.readDoubleLE(20),
          xmax: head.readDoubleLE(12), ymax: head.readDoubleLE(20),
        });
        continue;
      }
      out.push({
        xmin: head.readDoubleLE(12),
        ymin: head.readDoubleLE(20),
        xmax: head.readDoubleLE(28),
        ymax: head.readDoubleLE(36),
      });
    }
  } finally {
    closeSync(fd);
  }
  return out;
}
