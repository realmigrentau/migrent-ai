import { test, expect } from "@playwright/test";

test("no horizontal overflow on key pages", async ({ page }) => {
  for (const path of ["/", "/seeker/search?suburb=Kellyville", "/pricing", "/listing/11111111-1111-4111-8111-000000000001", "/signin"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(1);
  }
});

test("mobile filters open as a dialog and apply", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/seeker/search?suburb=Kellyville");
  await page.getByRole("button", { name: /^Filters/ }).click();
  const dialog = page.getByRole("dialog", { name: "Filters" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Furnished" }).click();
  await dialog.getByRole("button", { name: "Search rooms" }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/furnished=true/);
});

test("touch targets on the search card are at least 44px", async ({ page }) => {
  await page.goto("/seeker/search?suburb=Kellyville");
  const save = page.getByRole("button", { name: /Save .* to wishlist/ }).first();
  const box = await save.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
});
