#!/usr/bin/env node
/**
 * Derive genuine last-modified dates for sitemap entries from git history.
 *
 * Vercel builds have no git history, so this runs locally (or in CI before
 * the build) and commits data/contentLastmod.json. Each static page maps
 * to the newest commit touching its source file; blog posts, guides and
 * help articles map to the commit touching their data file. The sitemap
 * never stamps "today" onto every URL again.
 *
 *   node scripts/content-lastmod.mjs
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(root, "..");

// One git walk instead of one process per file: newest commit wins.
const log = execFileSync(
  "git",
  ["log", "-n", "600", "--format=__COMMIT__ %cI", "--name-only", "--", "frontend/pages", "frontend/data", "frontend/lib/helpData.ts"],
  { cwd: repo, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
);

const newest = new Map();
let current = null;
for (const line of log.split("\n")) {
  if (line.startsWith("__COMMIT__ ")) {
    current = line.slice("__COMMIT__ ".length).trim().slice(0, 10);
    continue;
  }
  const file = line.trim();
  if (!file || !current) continue;
  if (!newest.has(file)) newest.set(file, current);
}

const result = {};
for (const [file, date] of newest) {
  if (file.startsWith("frontend/pages/")) {
    const rel = file.slice("frontend/pages/".length);
    if (rel.startsWith("_") || rel.startsWith("api/") || !rel.endsWith(".tsx") || rel.includes("[")) continue;
    const route = "/" + rel.replace(/\.tsx$/, "").replace(/\/index$/, "").replace(/^index$/, "");
    result[route === "/" ? "/" : route.replace(/\/$/, "")] = date;
  } else if (file === "frontend/data/blogPosts.ts") result["data:blogPosts"] = date;
  else if (file === "frontend/data/guidesContent.ts") result["data:guidesContent"] = date;
  else if (file === "frontend/lib/helpData.ts") result["data:helpData"] = date;
}

const out = path.join(root, "data", "contentLastmod.json");
writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
console.log(`wrote ${Object.keys(result).length} entries`);
