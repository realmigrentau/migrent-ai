import { test, expect } from "@playwright/test";

test("robots.txt blocks private surfaces and points at the sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  const body = await res.text();
  for (const p of ["/admin", "/dashboard", "/messages", "/signin", "/payment-success"]) expect(body).toContain(`Disallow: ${p}`);
  expect(body).toContain("Sitemap: https://migrent.vercel.app/sitemap.xml");
});

test("sitemap lists only public canonical pages with real dates", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  for (const hidden of ["/signin", "/admin", "/dashboard", "/resources/roi-calculator", "/resources/discord", "/press", "/careers"]) {
    expect(xml, `${hidden} must not be in the sitemap`).not.toContain(`<loc>https://migrent.vercel.app${hidden}</loc>`);
  }
  expect(xml).toContain("<loc>https://migrent.vercel.app/pricing</loc>");
  expect(xml).toContain("<loc>https://migrent.vercel.app/listing/11111111-1111-4111-8111-000000000001</loc>");
  expect(xml).not.toContain("22222222-2222-4222-8222-000000000001");
  // Not every entry stamped with today.
  const today = new Date().toISOString().slice(0, 10);
  const lastmods = [...xml.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].map((m) => m[1]);
  expect(lastmods.length).toBeGreaterThan(10);
  expect(lastmods.filter((d) => d !== today).length).toBeGreaterThan(0);
});

for (const path of ["/", "/pricing", "/for-seekers", "/blog", "/listing/11111111-1111-4111-8111-000000000001"]) {
  test(`metadata is unique and single on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("head title")).toHaveCount(1);
    await expect(page.locator('head meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('head meta[name="theme-color"]')).toHaveCount(2); // light + dark, from _document only
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title).not.toContain("MigRent AI");
  });
}

for (const path of ["/signin", "/signup", "/forgot-password"]) {
  test(`${path} is noindex`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
}

test("no unsupported claims on public pages", async ({ page }) => {
  for (const path of ["/", "/pricing", "/for-seekers", "/features", "/contact", "/listing/11111111-1111-4111-8111-000000000001"]) {
    await page.goto(path);
    const text = await page.locator("body").innerText();
    for (const claim of ["24/7", "All systems operational", "MigRent Guarantee", "thousands of", "MigRent AI", "Pty Ltd", "Sole Trader", "Naarm"]) {
      expect(text, `${claim} on ${path}`).not.toContain(claim);
    }
  }
});

test("structured data is valid JSON and only asserts real facts", async ({ page }) => {
  await page.goto("/listing/11111111-1111-4111-8111-000000000001");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks.length).toBeGreaterThan(0);
  for (const b of blocks) {
    const parsed = JSON.parse(b);
    expect(parsed["@context"]).toBe("https://schema.org");
    if (parsed["@type"] === "Accommodation") {
      expect(parsed.offers.priceCurrency).toBe("AUD");
      expect(parsed.address.streetAddress).toBeUndefined();
    }
  }
});
