/**
 * Production dependency audit for CI (npm run audit:prod).
 *
 * Runs `npm audit --omit=dev --json` and fails on any high or critical
 * advisory, the same bar as `npm audit --audit-level=high`, except the ones
 * listed in SKIP. A skipped advisory is only skipped while npm has no
 * non-breaking fix for it: as soon as `npm audit fix` could fix it without a
 * major version change, this fails again, so the fix gets applied instead
 * of skipped for ever.
 *
 * Moderate and low advisories never fail the build (as before), but they are
 * printed so they stay visible.
 */
import { execFileSync } from "node:child_process";

/** Advisory id -> the package it is reported on, and why it is skipped. */
const SKIP = {
  "GHSA-fc5q-39xc-vjpf": {
    pkg: "picomatch",
    // ReDoS in picomatch, every version up to 4.0.7, with no fixed release
    // yet. It arrives through @sentry/nextjs -> @rollup/plugin-commonjs and
    // only runs at build time, on glob patterns from our own config; the live
    // site never ships it. npm's only offered fix is downgrading
    // @sentry/nextjs to 8.38.0, a major version back. Skipped 2026-11-18
    // (owner decision).
    since: "2026-11-18",
  },
};

const BLOCKING = new Set(["high", "critical"]);

let raw;
try {
  raw = execFileSync("npm", ["audit", "--omit=dev", "--json"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch (err) {
  // npm audit exits 1 whenever it finds anything; the report is still on stdout.
  raw = err.stdout;
  if (!raw) throw err;
}

const report = JSON.parse(raw);
if (report.error) {
  console.error(`npm audit could not run: ${report.error.summary ?? JSON.stringify(report.error)}`);
  process.exit(1);
}

const failures = [];
const skipped = [];
const minor = [];
const seen = new Set();

for (const [name, vuln] of Object.entries(report.vulnerabilities ?? {})) {
  for (const via of vuln.via) {
    // A string means "vulnerable because of that package"; the advisory
    // itself is listed (as an object) under that package's own entry.
    if (typeof via !== "object") continue;
    const id = via.url ? via.url.split("/").pop() : `npm-${via.source}`;
    const line = `${name} ${via.range} (${via.severity}) ${id}: ${via.title}`;
    if (!BLOCKING.has(via.severity)) {
      minor.push(line);
      continue;
    }
    const skip = SKIP[id];
    if (skip && skip.pkg === name) {
      seen.add(id);
      if (vuln.fixAvailable === true) {
        failures.push(`${line}\n    A fix is out now. Run \`npm audit fix\`, then remove ${id} from SKIP in scripts/audit-prod.mjs.`);
      } else {
        skipped.push(`${line}\n    Skipped since ${skip.since}: no non-breaking fix yet.`);
      }
      continue;
    }
    failures.push(line);
  }
}

for (const id of Object.keys(SKIP)) {
  if (!seen.has(id)) console.log(`::notice::${id} no longer appears in npm audit. Remove it from SKIP in scripts/audit-prod.mjs.`);
}
if (minor.length) console.log(`Moderate or low (not blocking):\n  ${minor.join("\n  ")}`);
if (skipped.length) console.log(`::warning::Skipped high advisories with no fix yet:\n  ${skipped.join("\n  ")}`);

if (failures.length) {
  console.error(`High or critical advisories in production dependencies:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("No high or critical advisories in production dependencies (apart from the skipped ones above).");
