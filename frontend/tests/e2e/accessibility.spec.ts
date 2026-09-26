import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// /resources/* are the consolidated Resources hubs; they replaced /faq,
// /guides, /blog and /help, whose URLs are 301s now.
const PAGES = ["/", "/seeker/search?suburb=Kellyville", "/signin", "/signup", "/contact", "/pricing", "/resources", "/resources/guides", "/resources/tools", "/resources/help", "/listing/11111111-1111-4111-8111-000000000001"];

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
  await page.goto("/signin");
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  const email = page.getByLabel("Email");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  const describedBy = await email.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.locator(`#${describedBy}`)).toContainText(/email/i);
  await expect(page.locator("#signin-status[role=alert]")).toContainText(/./);
  // Enter submits the form.
  await email.fill("someone@example.com");
  await page.getByLabel("Password").fill("x");
  await page.getByLabel("Password").press("Enter");
  await expect(page.locator("#signin-status")).toContainText(/./);
});

/* Dark mode was retired (lib/themeBootstrap.ts), and with it the header's
   theme toggle. These two tests were written against that toggle and had
   been failing since it went; what each was for still holds, so they now
   exercise controls the header does have.

   The first is the disclosure contract on the header's dropdowns: a
   button that says whether its panel is open. Asserted on /pricing
   because the homepage holds the header off-screen over the hero. */
test("header dropdowns expose their state", async ({ page, isMobile }) => {
  test.skip(isMobile, "below lg the dropdowns live in the phone menu");
  await page.goto("/pricing");
  const trigger = page.getByRole("banner").getByRole("button", { name: "Resources" });
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

test("FAQ accordion is keyboard operable and announces state", async ({ page }) => {
  await page.goto("/resources/help");
  const first = page.locator("main h3 > button[aria-expanded]").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("aria-expanded", "true");
  const controls = await first.getAttribute("aria-controls");
  await expect(page.locator(`#${controls}`)).toBeVisible();
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
