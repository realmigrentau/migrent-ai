/**
 * Download every source declared in the manifest into .abs-cache/ and record
 * its size and SHA-256.
 *
 * The cache is gitignored: ~280MB of ABS archives has no business in the
 * repository, and the build step that consumes them runs offline against the
 * generated data. Re-running is cheap - a file already present with a matching
 * checksum entry is skipped unless --force is passed.
 *
 * Usage:  node scripts/abs/fetch-sources.mjs [--force] [--only=<id>,<id>]
 */
import { createHash } from "node:crypto";
import { mkdirSync, existsSync, statSync, createReadStream, writeFileSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SOURCES } from "./sources.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CACHE_DIR = join(ROOT, ".abs-cache");
const LOCK_PATH = join(CACHE_DIR, "checksums.json");

function sha256(path) {
  return new Promise((resolve, reject) => {
    const h = createHash("sha256");
    createReadStream(path).on("data", (d) => h.update(d)).on("error", reject).on("end", () => resolve(h.digest("hex")));
  });
}

function human(bytes) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${(bytes / 1024).toFixed(0)}KB`;
}

export function readLock() {
  if (!existsSync(LOCK_PATH)) return {};
  try { return JSON.parse(readFileSync(LOCK_PATH, "utf8")); } catch { return {}; }
}

async function main() {
  const force = process.argv.includes("--force");
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.slice(7).split(",") : null;

  mkdirSync(CACHE_DIR, { recursive: true });
  const lock = readLock();

  // OpenStreetMap is a POST query against Overpass rather than a file at a
  // URL, and it is rate-limited, so it has its own fetcher (fetch-osm.mjs).
  const downloadable = SOURCES.filter(
    (s) => s.url && s.file && s.url.startsWith("http") && s.group !== "amenities",
  );
  for (const source of downloadable) {
    if (only && !only.includes(source.id)) continue;
    const dest = join(CACHE_DIR, source.file);

    if (!force && existsSync(dest) && lock[source.id]?.sha256) {
      const actual = await sha256(dest);
      if (actual === lock[source.id].sha256) {
        console.log(`· ${source.file} cached (${human(statSync(dest).size)})`);
        continue;
      }
      console.log(`! ${source.file} checksum changed, re-downloading`);
    }

    process.stdout.write(`↓ ${source.file} ... `);
    const res = await fetch(source.url, {
      headers: { "User-Agent": "MigRent-suburb-directory-ETL/1.0 (+https://migrent.vercel.app)" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`${source.id}: HTTP ${res.status} from ${source.url}`);
    const contentType = res.headers.get("content-type") || "";
    const body = Buffer.from(await res.arrayBuffer());

    // An ABS URL that has moved answers 200 with an HTML redirect shim. Writing
    // that to SAL_2021_AUST.xlsx would fail much later and much more
    // confusingly than it does here.
    if (contentType.includes("text/html") && !source.file.endsWith(".html")) {
      throw new Error(`${source.id}: expected a data file but got HTML from ${source.url}. The ABS may have moved it; update sources.mjs.`);
    }

    await writeFile(dest, body);
    const digest = createHash("sha256").update(body).digest("hex");
    lock[source.id] = {
      file: source.file,
      url: source.url,
      bytes: body.length,
      sha256: digest,
      contentType,
      downloadedAt: new Date().toISOString(),
    };
    console.log(`${human(body.length)}  sha256:${digest.slice(0, 12)}…`);
  }

  writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2) + "\n");
  console.log(`\nWrote ${LOCK_PATH}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
