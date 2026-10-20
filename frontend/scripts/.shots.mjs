import { chromium, devices } from "playwright";
const base = process.argv[2];
const out = process.argv[3];
const pages = process.argv.slice(4);
const browser = await chromium.launch();
const ctxs = {
  desktop: await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" }),
  mobile: await browser.newContext({ ...devices["Pixel 7"], colorScheme: "light" }),
};
for (const p of pages) {
  for (const [name, ctx] of Object.entries(ctxs)) {
    const page = await ctx.newPage();
    try {
      await page.goto(base + p, { waitUntil: "networkidle", timeout: 90000 });
      // let reveal animations run
      for (let y = 0; y < 30000; y += 700) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(60); }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const file = `${out}/${name}${p.replace(/[/?=&]/g, "_") || "_home"}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log(`${name} ${p} ok overflowX=${overflow}`);
    } catch (e) {
      console.log(`${name} ${p} FAIL ${e.message.split("\n")[0]}`);
    }
    await page.close();
  }
}
await browser.close();
