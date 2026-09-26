import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The suburb directory and the suburb pages.
 *
 * Two things these tests exist to protect. First the interaction contract:
 * Sydney open, six previews, everything else shut, and "view all" paging -
 * which is what keeps a 15,334-suburb page from rendering 15,334 cards.
 * Second the honesty contract: every figure shown has a visible source, and
 * none of the invented scores the old pages carried has come back.
 */

/**
 * This file is 68 tests that all drive one `next start` through search and
 * accordion round trips. At Playwright's default unbounded worker count they
 * contend for that single server and an interaction assertion occasionally
 * times out - the suite is reproducibly green at `--workers=2`, and the
 * failures move around rather than landing on the same test. CI already
 * retries once for exactly this reason; this matches it locally so the
 * signal stays honest either way.
 */
test.describe.configure({ retries: 1 });

const cards = (page: Page) => page.locator('.sub-accordion[data-open="true"] .sub-card__link');
/** The search field. Native <select> filters also expose role=combobox, so
 *  this is addressed by its accessible name rather than by role alone. */
const searchBox = (page: Page) => page.getByRole("combobox", { name: /Search every Australian/ });
const section = (page: Page, name: string) =>
  page.locator(".sub-accordion").filter({ has: page.getByRole("button", { name: new RegExp(`^${name}`) }) });

test.describe("directory", () => {
  test("opens with Sydney expanded and six previews, everything else shut", async ({ page }) => {
    await page.goto("/suburbs");

    const sydney = page.getByRole("button", { name: /^Sydney/ });
    await expect(sydney).toHaveAttribute("aria-expanded", "true");
    await expect(cards(page)).toHaveCount(6);

    for (const city of ["Melbourne", "Brisbane", "Perth", "Adelaide"]) {
      await expect(page.getByRole("button", { name: new RegExp(`^${city}`) })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    }
    // A collapsed city renders no cards at all.
    await expect(page.locator('.sub-accordion[data-open="false"] .sub-card__link')).toHaveCount(0);
  });

  test("each city header states how many suburbs it holds", async ({ page }) => {
    await page.goto("/suburbs");
    const sydney = page.getByRole("button", { name: /^Sydney/ });
    await expect(sydney).toContainText(/\d{3} suburbs/);
  });

  test("expanding another city reveals six previews", async ({ page }) => {
    await page.goto("/suburbs");
    await page.getByRole("button", { name: /^Melbourne/ }).click();

    const melbourne = section(page, "Melbourne");
    await expect(melbourne.locator(".sub-card__link")).toHaveCount(6);
    await expect(page.getByRole("button", { name: /^Melbourne/ })).toHaveAttribute("aria-expanded", "true");
  });

  test("view all pages through the rest of a city", async ({ page }) => {
    await page.goto("/suburbs");
    const sydney = section(page, "Sydney");

    await sydney.getByRole("button", { name: /View all [\d,]+ suburbs/ }).click();
    await expect(sydney.locator(".sub-card__link")).toHaveCount(30, { timeout: 15_000 });
    await expect(sydney).toContainText(/Showing 30 of [\d,]+/);

    await sydney.getByRole("button", { name: "Show fewer" }).click();
    await expect(sydney.locator(".sub-card__link")).toHaveCount(6);
  });

  test("accordion state survives the Back button", async ({ page }) => {
    await page.goto("/suburbs");
    await page.getByRole("button", { name: /^Brisbane/ }).click();
    await expect(page).toHaveURL(/region=brisbane/);
    await expect(page.getByRole("button", { name: /^Brisbane/ })).toHaveAttribute("aria-expanded", "true");

    await page.goBack();
    await expect(page.getByRole("button", { name: /^Sydney/ })).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", { name: /^Brisbane/ })).toHaveAttribute("aria-expanded", "false");
  });

  test("every accordion is operable from the keyboard alone", async ({ page }) => {
    await page.goto("/suburbs");
    const melbourne = page.getByRole("button", { name: /^Melbourne/ });
    await melbourne.focus();
    await page.keyboard.press("Enter");
    await expect(melbourne).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Enter");
    await expect(melbourne).toHaveAttribute("aria-expanded", "false");
  });

  test("filters narrow the regions on the page", async ({ page }) => {
    await page.goto("/suburbs");
    const stateFilter = page.getByLabel("State or territory");
    // The filter row scrolls sideways on a phone, so bring it into view
    // rather than relying on where it happens to sit.
    await stateFilter.scrollIntoViewIfNeeded();
    await stateFilter.selectOption("TAS");
    await expect(page.getByRole("button", { name: /^Hobart/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Sydney/ })).toHaveCount(0);
  });
});

test.describe("search", () => {
  test("finds a suburb and is driven entirely by the keyboard", async ({ page }) => {
    await page.goto("/suburbs");
    const input = searchBox(page);
    await input.fill("Kellyville");

    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    await expect(listbox.getByRole("option").first()).toContainText("Kellyville");

    await input.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", /opt-0/);
    await input.press("Enter");
    await expect(page).toHaveURL(/\/suburb\/nsw\/kellyville/);
  });

  test("shows the state so duplicate names can be told apart", async ({ page }) => {
    await page.goto("/suburbs");
    await searchBox(page).fill("Richmond");
    const options = page.getByRole("listbox").getByRole("option");
    await expect(options.first()).toBeVisible();
    const labels = await options.allTextContents();
    const richmonds = labels.filter((l) => l.includes("Richmond"));
    expect(richmonds.length).toBeGreaterThan(1);
    // Each carries a state, and no two read identically.
    expect(new Set(richmonds).size).toBe(richmonds.length);
  });

  test("accepts a state abbreviation alongside the name", async ({ page }) => {
    await page.goto("/suburbs");
    await searchBox(page).fill("richmond vic");
    const options = page.getByRole("listbox").getByRole("option");
    await expect(options.first()).toBeVisible();

    // Assert on the whole list rather than on whichever option happens to
    // rank first - a matching city can legitimately be offered above the
    // suburbs, and that is not what this test is about.
    const texts = await options.allTextContents();
    expect(texts.some((t) => t.includes("Richmond") && t.includes("VIC"))).toBe(true);
    const otherStates = texts.filter((t) => /\b(NSW|QLD|SA|WA|TAS|NT|ACT)\b/.test(t));
    expect(otherStates, `state filter leaked: ${otherStates.join(" | ")}`).toHaveLength(0);
  });

  test("accepts a postcode", async ({ page }) => {
    await page.goto("/suburbs");
    await searchBox(page).fill("2150");
    await expect(page.getByRole("listbox").getByRole("option").first()).toContainText("2150");
  });

  test("finds a suburb whose city section is collapsed", async ({ page }) => {
    await page.goto("/suburbs");
    // Darwin is shut on arrival; its suburbs are still searchable.
    await expect(page.getByRole("button", { name: /^Darwin/ })).toHaveAttribute("aria-expanded", "false");
    await searchBox(page).fill("Nightcliff");
    await expect(page.getByRole("listbox").getByRole("option").first()).toContainText("Nightcliff");
  });

  test("survives a typo", async ({ page }) => {
    await page.goto("/suburbs");
    await searchBox(page).fill("kelyville");
    // The fuzzy pass only runs when the literal passes come up short, and it
    // walks the whole national index, so it is the slowest query the search
    // can be asked. Give it room on a loaded CI box.
    await expect(page.getByRole("listbox").getByRole("option").first()).toContainText("Kellyville", {
      timeout: 20_000,
    });
  });

  test("says so when nothing matches, and clears", async ({ page }) => {
    await page.goto("/suburbs");
    const input = searchBox(page);
    await input.fill("zzzxqvwpl");
    await expect(page.locator(".sub-search__empty")).toContainText("Nothing matched");
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(input).toHaveValue("");
    await expect(page.locator(".sub-search__empty")).toHaveCount(0);
  });

  test("Escape closes the list without losing the text", async ({ page }) => {
    await page.goto("/suburbs");
    const input = searchBox(page);
    await input.fill("Kellyville");
    await expect(page.getByRole("listbox")).toBeVisible();
    await input.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(input).toHaveValue("Kellyville");
  });

  test("typing writes the search into the URL", async ({ page }) => {
    await page.goto("/suburbs");
    await searchBox(page).fill("Kellyville");
    // The URL trails the keystrokes by a 400ms debounce on purpose, so this
    // waits for the navigation rather than asserting on the current URL.
    await page.waitForURL(/q=Kellyville/, { timeout: 30_000 });
  });

  test("a shared search URL restores the search", async ({ page }) => {
    await page.goto("/suburbs?q=Footscray");
    await expect(searchBox(page)).toHaveValue("Footscray");
    await expect(page.getByRole("listbox").getByRole("option").first()).toContainText("Footscray");
  });
});

test.describe("suburb pages", () => {
  test("every figure shown carries a visible source", async ({ page }) => {
    await page.goto("/suburb/nsw/kellyville");
    const stats = page.locator(".sub-stat");
    const count = await stats.count();
    expect(count).toBeGreaterThan(4);
    for (let i = 0; i < count; i++) {
      await expect(stats.nth(i).locator(".sub-stat__source")).toBeVisible();
    }
  });

  test("shows no invented score, and explains the absence", async ({ page }) => {
    await page.goto("/suburb/nsw/auburn");

    // No statistic on the page claims a score we cannot source. The old page
    // carried "Safety 6.9/10" and "Walkability 6.5/10", both unexplained.
    const stats = (await page.locator(".sub-stat").allTextContents()).join(" ").toLowerCase();
    expect(stats).not.toContain("safety");
    expect(stats).not.toContain("walkability");
    expect(stats).not.toContain("vacancy");
    expect(stats).not.toMatch(/\d\s*\/\s*10\b/);

    const body = (await page.locator("body").innerText()).toLowerCase();
    expect(body).not.toMatch(/\bn\/a\b/);
    expect(body).not.toContain("undefined");
    expect(body).not.toContain("null");
    // Where availability is mentioned, it is explicitly not a vacancy rate.
    if (body.includes("vacancy")) expect(body).toContain("not a vacancy rate");

    // And the page says why those numbers are gone rather than dropping them
    // silently, which is the part a reader can actually check us on.
    await page.locator(".sub-sources").getByText("Sources and methodology").click();
    const sources = (await page.locator(".sub-sources__body").innerText()).toLowerCase();
    expect(sources).toContain("what we do not publish");
    expect(sources).toContain("walkability");
    expect(sources).toContain("commute times");
    expect(sources).toContain("vacancy rates");
  });

  test("states the Census rent is not a room rent", async ({ page }) => {
    await page.goto("/suburb/vic/footscray");
    await expect(page.getByRole("heading", { name: "Housing and renting" })).toBeVisible();
    await expect(page.locator(".sub-detail")).toContainText(/not a room rent/i);
  });

  test("explains its sources and methodology", async ({ page }) => {
    await page.goto("/suburb/qld/sunnybank");
    const panel = page.locator(".sub-sources");
    await panel.getByText("Sources and methodology").click();
    await expect(panel).toContainText("Australian Bureau of Statistics");
    await expect(panel).toContainText("Creative Commons Attribution 4.0");
    await expect(panel).toContainText("mesh blocks");
    await expect(panel).toContainText("What we do not publish");
  });

  test("keeps editorial opinion separate and dated", async ({ page }) => {
    await page.goto("/suburb/nsw/newtown");
    const editorial = page.locator(".sub-editorial");
    await expect(editorial.getByRole("heading", { name: "From the MigRent team" })).toBeVisible();
    await expect(editorial).toContainText("What we love");
    await expect(editorial).toContainText("Things to know");
    await expect(editorial).toContainText(/reviewed by the MigRent team on/i);
    await expect(editorial).toContainText("opinion, not data");
  });

  test("a locality with no written guide shows only sourced sections", async ({ page }) => {
    await page.goto("/suburb/nsw/aarons-pass");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Aarons Pass");
    await expect(page.locator(".sub-editorial")).toHaveCount(0);
    await expect(page.locator(".sub-detail")).toContainText("2021 Census");
  });

  test("related suburbs and the room search link work", async ({ page }) => {
    await page.goto("/suburb/nsw/newtown");
    const nearby = page.locator(".sub-nearby a").first();
    await expect(nearby).toBeVisible();
    const href = await nearby.getAttribute("href");
    expect(href).toMatch(/^\/suburb\/[a-z]{2,3}\//);
    await nearby.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goto("/suburb/nsw/newtown");
    const cta = page.getByRole("link", { name: /Browse rooms in Newtown/ });
    await expect(cta).toHaveAttribute("href", "/seeker/search?suburb=Newtown");
  });

  test("carries unique metadata and Place structured data", async ({ page }) => {
    await page.goto("/suburb/nsw/kellyville");
    await expect(page.locator("head title")).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://migrent.vercel.app/suburb/nsw/kellyville",
    );
    const blocks = await page.locator('head script[type="application/ld+json"]').allTextContents();
    const types = blocks.map((b) => JSON.parse(b)["@type"]);
    expect(types).toContain("Place");
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("FAQPage");
  });
});

test.describe("legacy URLs", () => {
  test("the old Auburn guide still resolves, to the NSW one", async ({ page }) => {
    const res = await page.goto("/suburb/auburn");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(/\/suburb\/nsw\/auburn$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Auburn");
  });

  test("all sixteen original guides still resolve", async ({ page }) => {
    const slugs = [
      "auburn", "bankstown", "blacktown", "hurstville", "kellyville", "kingsford",
      "lakemba", "marrickville", "newtown", "parramatta", "strathfield",
      "sunnybank", "west-end", "brunswick", "carlton", "footscray",
    ];
    for (const slug of slugs) {
      const res = await page.goto(`/suburb/${slug}`);
      expect(res?.status(), `${slug} should resolve`).toBe(200);
      await expect(page).toHaveURL(new RegExp(`/suburb/[a-z]{2,3}/`));
    }
  });

  test("an ambiguous old-style name offers a choice rather than guessing", async ({ page }) => {
    await page.goto("/suburb/richmond");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("More than one Richmond");
    const options = page.locator(".sub-disambig__list a");
    expect(await options.count()).toBeGreaterThan(2);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("duplicate names do not collide across states", async ({ page }) => {
    await page.goto("/suburb/nsw/richmond");
    const nsw = await page.getByRole("heading", { level: 1 }).innerText();
    const nswCrumb = await page.locator(".sub-crumbs").innerText();

    await page.goto("/suburb/vic/richmond");
    const vicCrumb = await page.locator(".sub-crumbs").innerText();
    expect(vicCrumb).not.toBe(nswCrumb);
    expect(nsw).toContain("Richmond");
    await expect(page.locator(".sub-detail__eyebrow")).toContainText("Melbourne");
  });

  test("a name nobody has returns 404", async ({ page }) => {
    const res = await page.goto("/suburb/notarealsuburbanywhere");
    expect(res?.status()).toBe(404);
  });
});

test.describe("quality", () => {
  test("the directory renders without console errors or hydration warnings", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") problems.push(m.text()); });
    page.on("pageerror", (e) => problems.push(e.message));

    await page.goto("/suburbs");
    await page.getByRole("button", { name: /^Melbourne/ }).click();
    await expect(section(page, "Melbourne").locator(".sub-card__link").first()).toBeVisible();
    await searchBox(page).fill("Kellyville");
    await expect(page.getByRole("listbox")).toBeVisible();

    const real = problems.filter((p) => !/favicon|maptiler|sentry|hcaptcha/i.test(p));
    expect(real, real.join("\n")).toHaveLength(0);
  });

  test("a suburb page renders without console errors", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") problems.push(m.text()); });
    page.on("pageerror", (e) => problems.push(e.message));
    await page.goto("/suburb/nsw/kellyville");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const real = problems.filter((p) => !/favicon|maptiler|sentry|hcaptcha/i.test(p));
    expect(real, real.join("\n")).toHaveLength(0);
  });

  /**
   * MigRent is light only. lib/themeBootstrap.ts removes `.dark` before first
   * paint and clears any stored preference, because the theme toggle was
   * removed and a visitor whose laptop is dark would otherwise be stranded on
   * a dark site with no way back.
   *
   * So there are two things to hold: the suburb pages must stay light like
   * the rest of the site, and their stylesheet must still carry dark values -
   * every other stylesheet here does - so that reinstating the theme later is
   * a product decision rather than a redesign of this section.
   */
  test("stays light, as the whole site does", async ({ page }) => {
    await page.goto("/suburbs");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(false);
    const bg = await page.locator(".sub-hero").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(250, 248, 245)");
  });

  test("carries dark values for if the theme ever returns", async ({ page }) => {
    await page.goto("/suburbs");
    const tokens = await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      // getComputedStyle returns a live object, so both values have to be
      // read out as strings before the class comes off again.
      const sand = getComputedStyle(document.documentElement)
        .getPropertyValue("--sub-sand")
        .trim();
      const hero = getComputedStyle(document.querySelector(".sub-hero")!).backgroundColor;
      document.documentElement.classList.remove("dark");
      return { sand, hero };
    });
    expect(tokens.sand).toBe("#161a15");
    expect(tokens.hero).not.toBe("rgb(250, 248, 245)");
  });

  /**
   * The accordions and the combobox are the two things here most likely to
   * be inaccessible, so they are audited open rather than shut - a collapsed
   * section hides most of the page from axe and would pass trivially.
   */
  for (const [label, path] of [
    ["directory", "/suburbs"],
    ["suburb page", "/suburb/nsw/kellyville"],
    ["small locality", "/suburb/nsw/aarons-pass"],
    ["disambiguation", "/suburb/richmond"],
  ] as const) {
    test(`axe: ${label} has no serious or critical violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .exclude("iframe")
        .analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        serious,
        JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.slice(0, 3).map((n) => n.target) })), null, 2),
      ).toEqual([]);
    });
  }

  test("axe: the directory with a city expanded and the search open", async ({ page }) => {
    await page.goto("/suburbs");
    await page.getByRole("button", { name: /^Melbourne/ }).click();
    await expect(section(page, "Melbourne").locator(".sub-card__link").first()).toBeVisible();
    await searchBox(page).fill("Kellyville");
    await expect(page.getByRole("listbox")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("iframe")
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      serious,
      JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.slice(0, 3).map((n) => n.target) })), null, 2),
    ).toEqual([]);
  });

  test("the suburb sitemap is a valid index over chunks", async ({ request }) => {
    const index = await request.get("/sitemap-suburbs.xml");
    expect(index.status()).toBe(200);
    const xml = await index.text();
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("sitemap-suburbs.xml?page=0");

    const chunk = await request.get("/sitemap-suburbs.xml?page=0");
    const chunkXml = await chunk.text();
    expect(chunkXml).toContain("<urlset");
    expect(chunkXml).toMatch(/<loc>https:\/\/migrent\.vercel\.app\/suburb\/[a-z]{2,3}\/[^<]+<\/loc>/);
  });
});
