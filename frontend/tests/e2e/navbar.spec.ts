import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The site header: three 21st.dev components, one per layer.
 *
 *   Navbar 1              the floating pill and the phone menu
 *   Dorpdown Navigation   the triggers, hover pill and columned panels
 *   Tubelight Navbar      the lamp over the current section
 *
 * These pin the geometry that makes each layer recognisable, the three
 * bugs fixed on the way in (a click after hovering closed the panel, the
 * status banner hid under the header, the chat widget floated over the
 * open phone menu), and the keyboard and screen-reader contract.
 */

const banner = (page: Page) => page.getByRole("banner");
const trigger = (page: Page, name: string) => banner(page).getByRole("button", { name, exact: true });

test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile, "the desktop row is replaced by the phone menu below lg");

  test("floats as a 60px pill, 24px from the top", async ({ page }) => {
    await page.goto("/pricing");
    const bar = page.locator(".site-nav__bar");
    const box = await bar.boundingBox();
    expect(box?.y).toBe(24);
    expect(box?.height).toBe(60);
    const shadow = await bar.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("0px 10px 15px -3px");
  });

  test("fits on one line at the narrowest desktop width", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/pricing");
    await expect(page.locator(".site-nav__bar")).toHaveCSS("height", "60px");
    await expect(banner(page).getByRole("link", { name: "List a room" })).toBeInViewport();
  });

  test("the lamp marks the section you are in", async ({ page }) => {
    await page.goto("/suburbs");
    const stay = trigger(page, "Find a stay");
    await expect(stay).toHaveAttribute("data-active", "true");
    await expect(stay.locator(".site-nav__lamp-bar")).toHaveCount(1);
    await expect(page.locator(".site-nav__lamp-bar")).toHaveCount(1);

    // Tubelight's lamp sits 3px proud of the pill's top edge.
    const lamp = await stay.locator(".site-nav__lamp-bar").boundingBox();
    const bar = await page.locator(".site-nav__bar").boundingBox();
    expect(Math.round((bar?.y ?? 0) - (lamp?.y ?? 0))).toBe(3);

    await page.goto("/pricing");
    await expect(trigger(page, "For owners")).toHaveAttribute("data-active", "true");
    await expect(trigger(page, "Find a stay")).not.toHaveAttribute("data-active", "true");

    await page.goto("/mentors");
    await expect(banner(page).getByRole("link", { name: "Mentors" })).toHaveAttribute("aria-current", "page");
  });

  test("hover opens a panel of titled icon columns", async ({ page }) => {
    await page.goto("/pricing");
    await trigger(page, "Find a stay").hover();
    const panel = page.locator("#nav-panel-stay");
    await expect(panel).toBeVisible();
    await expect(panel.locator(".site-nav__col-title")).toHaveText(["Search", "Before you rent"]);
    await expect(panel.getByRole("list", { name: "Search" }).getByRole("link")).toHaveCount(2);
    await expect(panel.locator(".site-nav__box")).toHaveCount(4);
    // Dorpdown's panel is border-only: no shadow.
    await expect(panel).toHaveCSS("box-shadow", "none");
    await expect(panel).toHaveCSS("border-top-left-radius", "16px");
  });

  test("a click after a hover leaves the panel open", async ({ page }) => {
    await page.goto("/pricing");
    const resources = trigger(page, "Resources");
    // Playwright's click moves the pointer onto the button first, which is
    // exactly the hover-then-click that used to close it straight away.
    await resources.click();
    await expect(resources).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#nav-panel-resources")).toBeVisible();
    await resources.click();
    await expect(resources).toHaveAttribute("aria-expanded", "false");
  });

  test("every panel stays inside the window", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/pricing");
    for (const [name, id] of [["Find a stay", "stay"], ["For owners", "owners"], ["Resources", "resources"]]) {
      await trigger(page, name).hover();
      const box = await page.locator(`#nav-panel-${id}`).boundingBox();
      expect(box, name).not.toBeNull();
      expect(box!.x, `${name} left`).toBeGreaterThanOrEqual(12);
      expect(box!.x + box!.width, `${name} right`).toBeLessThanOrEqual(1024 - 12);
    }
  });

  test("is fully operable from the keyboard", async ({ page }) => {
    await page.goto("/pricing");
    const stay = trigger(page, "Find a stay");
    await stay.focus();
    await page.keyboard.press("Enter");
    const panel = page.locator("#nav-panel-stay");
    await expect(panel.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(panel.getByRole("link").nth(1)).toBeFocused();
    await page.keyboard.press("End");
    await expect(panel.getByRole("link").last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(panel.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(stay).toBeFocused();
  });

  test("does not swallow clicks beside the pill", async ({ page }) => {
    await page.goto("/pricing");
    const inHeader = await page.evaluate(() => {
      const el = document.elementFromPoint(4, 12);
      return !!el?.closest(".site-nav");
    });
    expect(inHeader).toBe(false);
  });

  test("axe: no serious violations with a panel open", async ({ page }) => {
    await page.goto("/pricing");
    await trigger(page, "For owners").hover();
    await expect(page.locator("#nav-panel-owners")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include(".site-nav")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })), null, 2)).toEqual([]);
  });
});

test.describe("phone", () => {
  test.skip(({ isMobile }) => !isMobile, "the phone menu only exists below lg");

  test("the pill carries only the logo and the menu button", async ({ page }) => {
    await page.goto("/pricing");
    await expect(banner(page).getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(banner(page).getByRole("link", { name: "List a room" })).toBeHidden();
  });

  test("the menu is a modal: focus goes in, stays in, and comes back", async ({ page }) => {
    await page.goto("/pricing");
    const open = banner(page).getByRole("button", { name: "Open menu" });
    await open.click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("button", { name: "Close menu" })).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    // Shift+Tab from the first control wraps to the last, not out behind.
    await page.keyboard.press("Shift+Tab");
    await expect(sheet.getByRole("link", { name: "List a room" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(open).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("dropdowns open in place with 44px rows", async ({ page }) => {
    await page.goto("/pricing");
    await banner(page).getByRole("button", { name: "Open menu" }).click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    const stay = sheet.getByRole("button", { name: "Find a stay" });
    await stay.click();
    await expect(stay).toHaveAttribute("aria-expanded", "true");
    const links = sheet.locator("#mobile-section-stay").getByRole("link");
    await expect(links).toHaveCount(4);
    for (const box of await links.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))) {
      expect(box).toBeGreaterThanOrEqual(44);
    }
  });

  test("sits above the support widget", async ({ page }) => {
    await page.goto("/pricing");
    // The widget loads after the page is interactive. Wait for it, or this
    // would pass by testing an empty corner.
    const launcher = page.getByRole("button", { name: "MigRent Support" });
    await expect(launcher).toBeVisible();
    const spot = await launcher.boundingBox();

    await banner(page).getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    const topmost = await page.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      return el?.closest("#mobile-nav-panel") ? "sheet" : el?.closest("button")?.getAttribute("aria-label") ?? el?.tagName;
    }, [spot!.x + spot!.width / 2, spot!.y + spot!.height / 2]);
    expect(topmost).toBe("sheet");
  });

  test("axe: no serious violations with the menu open", async ({ page }) => {
    await page.goto("/pricing");
    await banner(page).getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await page.waitForTimeout(700); // let the stagger finish so nothing is mid-fade
    const results = await new AxeBuilder({ page })
      .include("#mobile-nav-panel")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })), null, 2)).toEqual([]);
  });
});

/**
 * The backend-status banner used to sit in the page flow, underneath a
 * fixed header. It only appears after three failed health checks, 15s
 * apart, so this is slow on purpose.
 */
test("the status banner sits above the header, not under it", async ({ page }) => {
  test.slow();
  await page.route("**/health", (route) => route.abort());
  await page.goto("/pricing");
  const statusBar = page.locator('[role="status"].fixed');
  await expect(statusBar).toBeVisible({ timeout: 60_000 });

  const b = await statusBar.boundingBox();
  const pill = await page.locator(".site-nav__bar").boundingBox();
  expect(b!.y).toBe(0);
  expect(Math.round(pill!.y - (b!.y + b!.height))).toBe(24);

  await statusBar.getByRole("button", { name: "Dismiss" }).click();
  await expect(statusBar).toHaveCount(0);
  await expect.poll(async () => (await page.locator(".site-nav__bar").boundingBox())?.y).toBe(24);
});
