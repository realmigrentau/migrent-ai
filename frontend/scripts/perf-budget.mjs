#!/usr/bin/env node
/**
 * Measure LCP, CLS and a click-to-paint INP proxy on representative pages
 * under emulated mobile conditions, and compare against budgets.
 *
 *   npm run build:test && npx next start -p 3100 &   (or let playwright's webServer run)
 *   node scripts/perf-budget.mjs http://127.0.0.1:3100
 *
 * Budgets (p75 targets from the brief): LCP < 2500ms, CLS < 0.1, INP < 200ms.
 * Numbers are from a local machine with 4x CPU throttling and a "Slow 4G"
 * network profile, so they are comparable run to run, not to field data.
 */
import { chromium } from "@playwright/test";

const base = process.argv[2] || "http://127.0.0.1:3100";
const RUNS = Number(process.env.PERF_RUNS || 3);
const PAGES = ["/", "/seeker/search?suburb=Kellyville", "/listing/11111111-1111-4111-8111-000000000001", "/pricing"];
const BUDGET = { lcp: 2500, cls: 0.1, inp: 200 };

const browser = await chromium.launch();
const results = {};
for (const path of PAGES) {
  const samples = [];
  for (let i = 0; i < RUNS; i++) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36" });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.__perf = { lcp: 0, cls: 0 };
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    // INP proxy: time from a click on the first button to the next paint.
    const inp = await page.evaluate(async () => {
      const btn = document.querySelector("button, a");
      if (!btn) return 0;
      const t0 = performance.now();
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return performance.now() - t0;
    });
    const m = await page.evaluate(() => window.__perf);
    samples.push({ lcp: m.lcp, cls: m.cls, inp });
    await context.close();
  }
  const p75 = (k) => samples.map((s) => s[k]).sort((a, b) => a - b)[Math.min(samples.length - 1, Math.floor(samples.length * 0.75))];
  results[path] = { lcp: Math.round(p75("lcp")), cls: Number(p75("cls").toFixed(3)), inp: Math.round(p75("inp")) };
}
await browser.close();

let failed = 0;
console.log("page".padEnd(60), "LCP(ms)", "CLS", "INP(ms)");
for (const [path, r] of Object.entries(results)) {
  const ok = r.lcp <= BUDGET.lcp && r.cls <= BUDGET.cls && r.inp <= BUDGET.inp;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${path}`.padEnd(60), String(r.lcp).padEnd(7), String(r.cls).padEnd(5), r.inp);
}
console.log(JSON.stringify(results));
process.exit(failed && process.env.PERF_STRICT ? 1 : 0);
