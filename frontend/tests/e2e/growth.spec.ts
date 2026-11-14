import { test, expect } from "@playwright/test";
import { siteIdentity } from "../../lib/siteIdentity";

/**
 * Phase E and F (MIGRENT_MASTER_AUDIT): pages search engines can find, and
 * the small fixes that go with them. Runs against the mock API.
 */

test("a suburb with rooms has its own indexable rooms page", async ({ page }) => {
  await page.goto("/rooms/nsw/parramatta");
  await expect(page.getByRole("heading", { name: "Rooms for rent in Parramatta", level: 1 })).toBeVisible();
  await expect(page.getByTestId("suburb-rooms").getByRole("link", { name: /Studio in Parramatta/ })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/rooms\/nsw\/parramatta$/);
});

test("a suburb with no rooms answers, but is not indexed", async ({ page }) => {
  await page.goto("/rooms/vic/fitzroy");
  await expect(page.getByText("No rooms here yet")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^noindex/);
});

test("search is not indexed but its links are followed", async ({ page }) => {
  await page.goto("/seeker/search");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
});

test("the homepage says who Migrent is to search engines", async ({ page }) => {
  await page.goto("/");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = blocks.map((b) => JSON.parse(b)["@type"]);
  expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite"]));
});

test("a mentor or profile that does not exist is a real 404", async ({ request }) => {
  expect((await request.get("/mentor/not-a-mentor")).status()).toBe(404);
  expect((await request.get("/users/profile/!!")).status()).toBe(404);
});

test("while mentors are closed, every mentor page is a real 404", async ({ request }) => {
  test.skip(siteIdentity.launchScope.mentors, "mentors are open");
  // /mentor-session-success sends signed-out visitors to sign in first (proxy.ts).
  for (const path of ["/mentors", "/become-mentor", "/mentor/11111111-1111-4111-8111-000000000001"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("/mentors");
  expect(sitemap).not.toContain("/become-mentor");
});

test("become a mentor has its heading in the server's HTML", async ({ request }) => {
  test.skip(!siteIdentity.launchScope.mentors, "mentors are closed at launch");
  const html = await (await request.get("/become-mentor")).text();
  expect(html).toContain("their feet.");
});

test("sign in: show the password, and a mistyped email says so", async ({ page }) => {
  await page.goto("/hub/sign-in");
  await page.waitForLoadState("networkidle");
  const password = page.getByLabel("Password", { exact: true });
  await password.fill("secret-pass");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByLabel("Email").fill("sam.example.com");
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await expect(page.getByText("That is not an email address")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeFocused();
});

test("the language menu is hidden while only English is offered", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop header");
  await page.goto("/pricing");
  await expect(page.getByRole("banner").getByRole("button", { name: /language/i })).toHaveCount(0);
});

test("while short stays are closed, pricing says hosts pay nothing", async ({ page }) => {
  test.skip(siteIdentity.launchScope.shortStays, "short stays are open");
  await page.goto("/pricing");
  const main = page.getByRole("main");
  await expect(main.getByText("Free to list. Free to find a tenant.")).toBeVisible();
  await expect(main).not.toContainText(`$${siteIdentity.fees.host.listingFee}`);
  await expect(main).not.toContainText(/mentor/i);
});

test.describe("example listings", () => {
  const EXAMPLE = "/example/parramatta-furnished-room";

  test("an example listing says so in its title, has no address and no way to apply", async ({ page }) => {
    const response = await page.goto(EXAMPLE);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^Example listing: /);
    await expect(page.getByTestId("example-listing")).toContainText("Parramatta, NSW");
    // Inside the listing, not the site header and footer.
    const listing = page.getByTestId("example-listing");
    for (const name of [/^Apply/, /book/i, /inspection/i, /^Message/, /^Save/, /^Report/]) {
      await expect(listing.getByRole("button", { name })).toHaveCount(0);
      await expect(listing.getByRole("link", { name })).toHaveCount(0);
    }
    await expect(page.getByTestId("example-listing")).not.toContainText(/ID-checked host/i);
    expect(await page.content()).toContain('name="robots" content="noindex');
  });

  test("example pages stay out of the sitemap, and an unknown one is a 404", async ({ request }) => {
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/example/");
    expect((await request.get("/example/not-a-real-example")).status()).toBe(404);
  });

  test("a search with no results shows examples while there are few real rooms", async ({ page }) => {
    // The catalogue-size check asks for one listing with no filters; say there are two rooms in all.
    await page.route(
      (url) => url.pathname.endsWith("/listings/search") && url.search === "?limit=1",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "X-Total-Count, X-Has-More", "X-Total-Count": "2" },
          body: "[]",
        }),
    );
    await page.goto("/seeker/search?suburb=Strathfield");
    await expect(page.getByTestId("search-empty")).toBeVisible();
    const examples = page.getByTestId("example-listings");
    await expect(examples.getByRole("link")).toHaveCount(3);
    await expect(examples.getByRole("link").first()).toHaveAttribute("href", "/example/strathfield-bright-room");
    for (const card of await examples.getByRole("heading", { level: 3 }).allTextContents()) expect(card).toMatch(/^Example listing: /);
  });

  test("examples disappear once there are enough real rooms", async ({ page }) => {
    // The mock catalogue has 26 rooms.
    await page.goto("/seeker/search?suburb=Nowhereville");
    await expect(page.getByTestId("search-empty")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("example-listings")).toHaveCount(0);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /move into/ })).toBeVisible();
    await expect(page.getByTestId("example-listings")).toHaveCount(0);
  });
});
