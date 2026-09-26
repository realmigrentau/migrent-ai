/**
 * A minimal, dependency-free XLSX reader.
 *
 * The ABS publishes its allocation and correspondence files as .xlsx, and the
 * ETL has to read a 368,000-row mesh-block sheet. Pulling in a spreadsheet
 * library for that would add a dependency to the site's package.json purely
 * for an offline build step, so this reads the format directly.
 *
 * An .xlsx is a ZIP of XML. The two parts that matter are
 * xl/worksheets/sheet1.xml (the grid) and xl/sharedStrings.xml (the string
 * pool every text cell points into). ABS sheets are flat tables of strings
 * and numbers with no formulas, merged cells or styles that change a value,
 * so a streaming regex pass over the row/cell elements is both correct and
 * an order of magnitude faster than a DOM parse of a 400MB expansion.
 */
import { inflateRawSync } from "node:zlib";
import { readFileSync } from "node:fs";

/** Read a ZIP central directory and return { name -> Buffer } for wanted entries. */
function unzip(buf, wanted) {
  // Find the End Of Central Directory record, scanning back from the tail.
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66000; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("Not a ZIP file (no EOCD record)");

  let count = buf.readUInt16LE(eocd + 10);
  let cdOffset = buf.readUInt32LE(eocd + 16);

  // ZIP64: the 32-bit fields saturate on archives this size.
  if (cdOffset === 0xffffffff || count === 0xffff) {
    const locatorSig = 0x07064b50;
    for (let i = eocd - 20; i >= 0; i--) {
      if (buf.readUInt32LE(i) === locatorSig) {
        const z64 = Number(buf.readBigUInt64LE(i + 8));
        count = Number(buf.readBigUInt64LE(z64 + 32));
        cdOffset = Number(buf.readBigUInt64LE(z64 + 48));
        break;
      }
    }
  }

  const out = {};
  let p = cdOffset;
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    let localOffset = buf.readUInt32LE(p + 42);

    if (localOffset === 0xffffffff) {
      // Walk the extra field for the ZIP64 extended information header.
      let e = p + 46 + nameLen;
      const end = e + extraLen;
      while (e + 4 <= end) {
        const id = buf.readUInt16LE(e);
        const size = buf.readUInt16LE(e + 2);
        if (id === 0x0001) {
          let q = e + 4;
          if (buf.readUInt32LE(p + 24) === 0xffffffff) q += 8; // uncompressed
          if (buf.readUInt32LE(p + 20) === 0xffffffff) q += 8; // compressed
          localOffset = Number(buf.readBigUInt64LE(q));
          break;
        }
        e += 4 + size;
      }
    }

    if (wanted.includes(name)) {
      const method = buf.readUInt16LE(p + 10);
      const compSize = buf.readUInt32LE(p + 20);
      const lnLen = buf.readUInt16LE(localOffset + 26);
      const leLen = buf.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + lnLen + leLen;
      const raw = buf.subarray(start, start + compSize);
      out[name] = method === 0 ? raw : inflateRawSync(raw);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
function decodeXml(s) {
  if (s.indexOf("&") === -1) return s;
  return s.replace(/&(?:#(\d+)|#x([0-9a-fA-F]+)|(\w+));/g, (m, dec, hex, name) => {
    if (dec) return String.fromCodePoint(Number(dec));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return ENTITIES[name] ?? m;
  });
}

/** Parse xl/sharedStrings.xml into a flat array of plain strings. */
function parseSharedStrings(xml) {
  const strings = [];
  // <si> may hold a single <t> or several <r><t> runs; concatenate either way.
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  const tRe = /<t[^>]*>([\s\S]*?)<\/t>/g;
  let si;
  while ((si = siRe.exec(xml)) !== null) {
    const inner = si[1];
    if (inner.indexOf("<r>") === -1) {
      const m = /<t[^>]*>([\s\S]*?)<\/t>/.exec(inner);
      strings.push(m ? decodeXml(m[1]) : "");
    } else {
      let t, acc = "";
      tRe.lastIndex = 0;
      while ((t = tRe.exec(inner)) !== null) acc += decodeXml(t[1]);
      strings.push(acc);
    }
  }
  return strings;
}

/** Column reference ("AB7") -> zero-based column index. */
function colIndex(ref) {
  let n = 0;
  for (let i = 0; i < ref.length; i++) {
    const c = ref.charCodeAt(i);
    if (c < 65 || c > 90) break;
    n = n * 26 + (c - 64);
  }
  return n - 1;
}

/**
 * Read a worksheet as an array of objects keyed by the header row.
 * `sheet` is 1-based. Empty cells are omitted, so callers get `undefined`
 * rather than "" and can tell "blank" from "empty string".
 *
 * `columns` restricts the result to the named headers. The ABS allocation
 * files are 368,000 rows of 19 columns and the ETL wants six of them; keeping
 * all nineteen costs about a gigabyte of resident objects for no purpose.
 *
 * `onRow` hands each row to a callback instead of accumulating an array, for
 * the same reason - the caller reduces as it goes and nothing is retained.
 */
export function readSheet(filePath, { sheet = 1, headerRow = 1, columns, onRow } = {}) {
  const sheetPath = `xl/worksheets/sheet${sheet}.xml`;
  const parts = unzip(readFileSync(filePath), [sheetPath, "xl/sharedStrings.xml"]);
  if (!parts[sheetPath]) throw new Error(`${filePath}: no ${sheetPath}`);
  const shared = parts["xl/sharedStrings.xml"]
    ? parseSharedStrings(parts["xl/sharedStrings.xml"].toString("utf8"))
    : [];
  const xml = parts[sheetPath].toString("utf8");

  const rows = [];
  const rowRe = /<row[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  const cellRe = /<c\b([^>]*)\/>|<c\b([^>]*)>([\s\S]*?)<\/c>/g;
  let rowM;
  while ((rowM = rowRe.exec(xml)) !== null) {
    const rowNum = Number(rowM[1]);
    const cells = [];
    let cellM;
    cellRe.lastIndex = 0;
    while ((cellM = cellRe.exec(rowM[2])) !== null) {
      const attrs = cellM[1] ?? cellM[2];
      const body = cellM[3] ?? "";
      const refM = /\br="([A-Z]+\d+)"/.exec(attrs);
      if (!refM) continue;
      const idx = colIndex(refM[1]);
      const type = /\bt="([^"]+)"/.exec(attrs)?.[1];
      let value;
      if (type === "s") {
        const vM = /<v>([\s\S]*?)<\/v>/.exec(body);
        value = vM ? shared[Number(vM[1])] : undefined;
      } else if (type === "inlineStr") {
        const tM = /<t[^>]*>([\s\S]*?)<\/t>/.exec(body);
        value = tM ? decodeXml(tM[1]) : undefined;
      } else {
        const vM = /<v>([\s\S]*?)<\/v>/.exec(body);
        value = vM ? decodeXml(vM[1]) : undefined;
      }
      if (value !== undefined && value !== "") cells[idx] = value;
    }
    rows[rowNum] = cells;
  }

  const header = rows[headerRow];
  if (!header) throw new Error(`${filePath}: header row ${headerRow} is empty`);
  const keys = header.map((h) => (h == null ? "" : String(h).trim()));

  const keep = columns ? new Set(columns) : null;
  if (keep) {
    for (const c of keep) {
      if (!keys.includes(c)) throw new Error(`${filePath}: no column "${c}" (have ${keys.filter(Boolean).join(", ")})`);
    }
  }

  const out = onRow ? null : [];
  for (let r = headerRow + 1; r < rows.length; r++) {
    const cells = rows[r];
    if (!cells) continue;
    const obj = {};
    let any = false;
    for (let c = 0; c < keys.length; c++) {
      if (!keys[c]) continue;
      if (keep && !keep.has(keys[c])) continue;
      const v = cells[c];
      if (v !== undefined) { obj[keys[c]] = v; any = true; }
    }
    if (!any) continue;
    if (onRow) onRow(obj); else out.push(obj);
    rows[r] = undefined; // let the raw cell array go as we walk
  }
  return out;
}

export { unzip };
