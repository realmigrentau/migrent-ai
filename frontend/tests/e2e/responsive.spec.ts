import { test, expect } from "@playwright/test";

test("no horizontal overflow on key pages", async ({ page }) => {
  for (const path of ["/", "/seeker/search?suburb=Kellyville", "/pricing", "/listing/11111111-1111-4111-8111-000000000001", "/hub/sign-in"]) {
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
  const save = page.getByRole("button", { name: /^Save / }).first();
  const box = await save.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
});

test("the help panel fits a phone screen and answers from the Help centre", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  for (const width of [320, 375, 430]) {
    await page.setViewportSize({ width, height: 740 });
    await page.goto("/pricing");
    const launcher = page.getByRole("button", { name: "Help", exact: true });
    await expect(launcher).toBeVisible();
    await launcher.click();
    const panel = page.getByRole("dialog", { name: "Migrent help" });
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    // It used to be a fixed 448px wide and ran off the left edge of every phone.
    expect(box!.x, `help panel starts off-screen at ${width}px`).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width, `help panel overflows at ${width}px`).toBeLessThanOrEqual(width);
  }
  const panel = page.getByRole("dialog", { name: "Migrent help" });
  await panel.getByLabel("Your question").fill("Who holds my bond?");
  await panel.getByRole("button", { name: "Search the Help centre" }).click();
  await expect(panel.getByText(/bond authority/i)).toBeVisible();
  await expect(panel.getByText(/\bAI\b|Online/)).toHaveCount(0);
});
