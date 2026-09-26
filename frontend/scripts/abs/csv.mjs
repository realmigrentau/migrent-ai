/**
 * A small CSV reader for the Census DataPack tables.
 *
 * DataPack CSVs are machine-generated: a header row of column codes, then
 * rows of a geography code and integers. They contain no embedded commas,
 * quotes or newlines, but this still handles quoting so a future ABS table
 * with a text column cannot silently shift every value one column left.
 *
 * `columns` restricts the parse to the columns actually needed, which matters:
 * G09 and G13 have ~200 columns each and only a few dozen are ever displayed.
 */

function splitLine(line) {
  if (line.indexOf('"') === -1) return line.split(",");
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else quoted = false;
      } else cur += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      out.push(cur); cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

/**
 * Parse CSV text into rows keyed by header name.
 * @param {string} text
 * @param {object} [opts]
 * @param {string[]|((header:string[])=>string[])} [opts.columns] columns to keep
 * @param {boolean} [opts.numeric] coerce kept values to numbers (blank -> null)
 */
export function parseCsv(text, { columns, numeric = false } = {}) {
  const lines = text.split(/\r?\n/);
  let first = 0;
  while (first < lines.length && lines[first].trim() === "") first++;
  if (first >= lines.length) return { header: [], rows: [] };

  const header = splitLine(lines[first]).map((h) => h.trim());
  const wanted = typeof columns === "function" ? columns(header) : columns;
  const keepIdx = [];
  const keepName = [];
  for (let i = 0; i < header.length; i++) {
    if (!wanted || wanted.includes(header[i])) { keepIdx.push(i); keepName.push(header[i]); }
  }

  const rows = [];
  for (let i = first + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === "" || line.trim() === "") continue;
    const cells = splitLine(line);
    const row = {};
    for (let k = 0; k < keepIdx.length; k++) {
      const raw = cells[keepIdx[k]];
      if (raw === undefined) { row[keepName[k]] = null; continue; }
      const v = raw.trim();
      row[keepName[k]] = numeric ? (v === "" ? null : Number(v)) : v;
    }
    rows.push(row);
  }
  return { header, rows };
}
