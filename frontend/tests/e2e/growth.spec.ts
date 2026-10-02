import { test, expect } from "@playwright/test";

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

test("become a mentor has its heading in the server's HTML", async ({ request }) => {
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
