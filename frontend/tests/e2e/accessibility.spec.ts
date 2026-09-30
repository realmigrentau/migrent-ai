import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Every page of the public site after the 2026-09-29 redesign, plus the
// sign-in pages and a listing.
const PAGES = ["/", "/seeker/search?suburb=Kellyville", "/hub/sign-in", "/hub/sign-up", "/contact", "/pricing", "/how-renting-works", "/for-owners", "/guides", "/guides/rental-laws", "/help", "/about", "/legal", "/privacy-policy", "/listing/11111111-1111-4111-8111-000000000001"];

for (const path of PAGES) {
  test(`axe: ${path} has no serious or critical violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // Third-party embeds are not ours to fix.
      .exclude("iframe")
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.slice(0, 3).map((n) => n.target) })), null, 2)).toEqual([]);
  });
}

test("skip link and landmarks", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("main#main-content")).toBeFocused();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.locator("nav").first()).toBeVisible();
});

test("empty sign-in submission announces field errors", async ({ page }) => {
  await page.goto("/hub/sign-in");
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  const email = page.getByLabel("Email");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  const describedBy = await email.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.locator(`[id="${describedBy?.split(" ")[0]}"]`)).toContainText(/email/i);
  // Enter submits; a wrong password is announced.
  await email.fill("renter@example.test");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByLabel("Password").press("Enter");
  await expect(page.getByRole("alert").filter({ hasText: /do not match/i })).toBeVisible();
});

/* These two tests were first written against a header theme toggle that
   no longer exists; what each was for still holds, so they exercise
   controls the header does have.

   The first is the disclosure contract on the header's dropdowns: a
   button that says whether its panel is open. Asserted on /pricing
   because the homepage holds the header off-screen over the hero. */
test("header dropdowns expose their state", async ({ page, isMobile }) => {
  test.skip(isMobile, "below lg the dropdowns live in the phone menu");
  await page.goto("/pricing");
  const trigger = page.getByRole("banner").getByRole("button", { name: "For owners", exact: true });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});

/* The homepage header is hidden over the hero, but it must not be hidden
   from assistive technology: it carries the only route to the language
   and account controls. It used to be inert + aria-hidden up there, so
   tabbing from the top of the page skipped straight past them. Focus
   now reveals it, the same way scrolling does. */
test("homepage header is reachable by keyboard over the hero", async ({ page, isMobile }) => {
  await page.goto("/");
  const banner = page.getByRole("banner");
  await expect(banner).toBeAttached();
  const control = isMobile
    ? banner.getByRole("button", { name: "Open menu" })
    : banner.getByRole("link", { name: "Sign in" });
  await expect(control).toHaveCount(1);
  await control.focus();
  await expect(control).toBeInViewport();
});

/* The site FAQ is native <details>/<summary>, so the browser supplies the
   keyboard handling and the expanded state. This pins that it stays so. */
test("FAQ accordion is keyboard operable and announces state", async ({ page }) => {
  await page.goto("/help");
  const item = page.locator("main details.site-faq__item").nth(1);
  const summary = item.locator("summary");
  await expect(item).not.toHaveAttribute("open", "");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(item).toHaveAttribute("open", "");
  await expect(item.locator(".site-faq__a")).toBeVisible();
});

test("search filters are reachable by keyboard and the results region is announced", async ({ page, isMobile }) => {
  test.skip(isMobile, "filter sidebar is a drawer on mobile");
  await page.goto("/seeker/search?suburb=Kellyville");
  const status = page.getByTestId("results-status");
  await expect(status).toHaveAttribute("aria-live", "polite");
  await page.getByRole("search", { name: "Room filters" }).getByRole("button", { name: "Furnished" }).focus();
  await page.keyboard.press("Space");
  await expect(page).toHaveURL(/furnished=true/);
});
