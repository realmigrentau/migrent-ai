import { test, expect } from "@playwright/test";

test("robots.txt blocks private surfaces and points at the sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  const body = await res.text();
  for (const p of ["/admin", "/hub", "/dashboard", "/messages", "/signin", "/booking-success"]) expect(body).toContain(`Disallow: ${p}`);
  expect(body).toContain("Sitemap: https://migrent.vercel.app/sitemap.xml");
});

test("sitemap lists only public canonical pages with real dates", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  const merged = ["/for-seekers", "/features", "/safety-verification", "/no-agency", "/resources", "/resources/guides", "/resources/help", "/faq", "/blog"];
  for (const hidden of ["/signin", "/admin", "/dashboard", "/resources/roi-calculator", "/resources/discord", "/press", "/careers", ...merged]) {
    expect(xml, `${hidden} must not be in the sitemap`).not.toContain(`<loc>https://migrent.vercel.app${hidden}</loc>`);
  }
  for (const kept of ["/pricing", "/how-renting-works", "/for-owners", "/guides", "/guides/rental-laws", "/help", "/about", "/legal"]) {
    expect(xml, `${kept} should be in the sitemap`).toContain(`<loc>https://migrent.vercel.app${kept}</loc>`);
  }
  expect(xml).toContain("<loc>https://migrent.vercel.app/listing/11111111-1111-4111-8111-000000000001</loc>");
  expect(xml).not.toContain("22222222-2222-4222-8222-000000000001");
  // Not every entry stamped with today.
  const today = new Date().toISOString().slice(0, 10);
  const lastmods = [...xml.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].map((m) => m[1]);
  expect(lastmods.length).toBeGreaterThan(10);
  expect(lastmods.filter((d) => d !== today).length).toBeGreaterThan(0);
});

for (const path of ["/", "/pricing", "/how-renting-works", "/guides", "/help", "/listing/11111111-1111-4111-8111-000000000001"]) {
  test(`metadata is unique and single on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("head title")).toHaveCount(1);
    await expect(page.locator('head meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('head meta[name="theme-color"]')).toHaveCount(2); // light + dark, from _document only
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title).not.toContain("Migrent AI");
  });
}

for (const path of ["/hub/sign-in", "/hub/sign-up", "/hub/forgot-password"]) {
  test(`${path} is noindex`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
}

test("no unsupported claims on public pages", async ({ page }) => {
  for (const path of ["/", "/pricing", "/how-renting-works", "/for-owners", "/about", "/contact", "/help", "/listing/11111111-1111-4111-8111-000000000001"]) {
    await page.goto(path);
    const text = await page.locator("body").innerText();
    for (const claim of ["24/7", "All systems operational", "Migrent Guarantee", "thousands of", "Migrent AI", "Pty Ltd", "Sole Trader", "Naarm", "Superhost", "AI-powered", "proof of property", "VEVO"]) {
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

/**
 * The 2026-09-29 redesign merged thin pages into a few fuller ones. The old
 * URLs must keep working (they redirect), and the articles under the merged
 * indexes must not move.
 */
test("merged pages redirect to their new home, and their articles do not", async ({ page }) => {
  const moved: [string, string][] = [
    ["/for-seekers", "/how-renting-works"],
    ["/safety-verification", "/how-renting-works"],
    ["/no-agency", "/how-renting-works"],
    ["/features", "/for-owners"],
    ["/resources", "/guides"],
    ["/resources/guides", "/guides"],
    ["/blog", "/guides"],
    ["/rental-laws", "/guides/rental-laws"],
    ["/faq", "/help"],
    ["/resources/help", "/help"],
    ["/careers", "/about"],
    ["/press", "/about"],
  ];
  for (const [from, to] of moved) {
    await page.goto(from);
    expect(new URL(page.url()).pathname, `${from} should land on ${to}`).toBe(to);
  }

  const kept = ["/blog/bond-rights-migrants", "/help/verify-your-identity", "/guides/rental-laws"];
  for (const path of kept) {
    const res = await page.goto(path);
    expect(res?.status(), `${path} should still be served`).toBe(200);
    expect(new URL(page.url()).pathname, `${path} must not redirect`).toBe(path);
  }
});

test("the owners dropdown stays small", async ({ page, isMobile }) => {
  test.skip(isMobile, "the dropdown is an accordion below lg");
  await page.goto("/pricing");
  await page.getByRole("banner").getByRole("button", { name: "For owners", exact: true }).click();
  const panel = page.locator("#nav-panel-owners");
  await expect(panel).toBeVisible();
  const count = await panel.getByRole("link").count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(4);
});
