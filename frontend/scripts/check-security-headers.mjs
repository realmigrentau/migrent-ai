#!/usr/bin/env node
/**
 * Assert the security headers on a running site.
 *   node scripts/check-security-headers.mjs http://127.0.0.1:3100
 * Exit code 1 on any failure. Used by CI against the local prod server and
 * can be pointed at the live domain after a deploy.
 */
const base = process.argv[2] || "http://127.0.0.1:3100";
const checks = [
  ["content-security-policy", (v) => v.includes("default-src 'self'") && v.includes("frame-ancestors 'self'") && !v.includes("unsafe-eval") && !/script-src[^;]*unsafe-inline/.test(v)],
  ["strict-transport-security", (v) => /max-age=\d{6,}/.test(v)],
  ["x-content-type-options", (v) => v === "nosniff"],
  ["referrer-policy", (v) => v.includes("strict-origin")],
  ["permissions-policy", (v) => v.includes("camera=()")],
  ["cross-origin-opener-policy", (v) => v.includes("same-origin")],
  ["x-frame-options", (v) => v.toUpperCase() === "SAMEORIGIN"],
];
let failed = 0;
for (const path of ["/", "/seeker/search", "/signin"]) {
  const res = await fetch(base + path, { redirect: "manual" });
  for (const [name, ok] of checks) {
    const v = res.headers.get(name) || "";
    const pass = Boolean(v) && ok(v);
    if (!pass) failed++;
    console.log(`${pass ? "PASS" : "FAIL"} ${path} ${name}${pass ? "" : `: ${v || "(missing)"}`}`);
  }
}
if (failed) {
  console.error(`${failed} header check(s) failed`);
  process.exit(1);
}
console.log("all security headers present");
