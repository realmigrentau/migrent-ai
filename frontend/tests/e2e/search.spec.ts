import { test, expect, type Page } from "@playwright/test";

const LIVE_ID = "11111111-1111-4111-8111-000000000001";
const EXPIRED_ID = "22222222-2222-4222-8222-000000000001";

async function collectPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

test.describe("search survives without WebGL", () => {
  test("results list works when WebGL is unavailable", async ({ page }) => {
    // Force the "no WebGL" path the way a locked-down corporate browser or a
    // VM would: getContext returns null for every WebGL context type.
    await page.addInitScript(() => {
      (window as unknown as { __MIGRENT_DISABLE_WEBGL__: boolean }).__MIGRENT_DISABLE_WEBGL__ = true;
      const original = HTMLCanvasElement.prototype.getContext;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: any[]) {
        if (String(type).includes("webgl")) return null;
        return (original as unknown as (t: string, ...r: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    const errors = await collectPageErrors(page);

    await page.goto("/seeker/search?suburb=Kellyville");
    await expect(page.getByTestId("results-status")).toContainText(/room/i);
    await expect(page.getByTestId("listing-card").first()).toBeVisible();
    // The framework error overlay must never appear.
    await expect(page.locator("text=Application error")).toHaveCount(0);
    await expect(page.locator("nextjs-portal")).toHaveCount(0);

    const width = page.viewportSize()?.width ?? 0;
    if (width >= 1280) {
      await expect(page.getByTestId("map-unavailable")).toBeVisible();
      await expect(page.getByTestId("map-unavailable")).toContainText("Map unavailable");
    }
    expect(errors.filter((e) => /webgl|Failed to initialize/i.test(e))).toHaveLength(0);
    // Vercel's analytics scripts 404 outside Vercel; everything else must be clean.
    expect(errors.filter((e) => !/webgl|favicon|Download the React DevTools|_vercel\/|404 \(Not Found\)/i.test(e))).toHaveLength(0);
  });

  test("results are server-rendered before any script runs", async ({ request }) => {
    const res = await request.get("/seeker/search?suburb=Parramatta");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain("Studio in Parramatta");
    expect(html).toContain('data-testid="listing-card"');
  });
});

test.describe("move-in date", () => {
  test("homepage move-in date reaches the search URL and filters results", async ({ page }) => {
    await page.goto("/");
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 45);
    const iso = nextMonth.toISOString().slice(0, 10);
    await page.getByLabel("City or suburb").fill("Kellyville");
    await page.getByLabel("Move-in from").fill(iso);
    await page.getByRole("button", { name: /Search rooms up to/ }).click();
    await expect(page).toHaveURL(new RegExp(`/seeker/search\\?.*checkIn=${iso}`));
    // The page canonicalises legacy `city` to `suburb`.
    await expect(page).toHaveURL(/suburb=Kellyville/);
    await expect(page.getByTestId("listing-card").filter({ hasText: "Available next month" })).toHaveCount(1);
    // Move the date earlier: the not-yet-available room disappears.
    await page.locator('input[name="checkIn"]').first().fill(new Date().toISOString().slice(0, 10));
    await expect(page.getByTestId("listing-card").filter({ hasText: "Available next month" })).toHaveCount(0);
    await expect(page).toHaveURL(/checkIn=/);
  });

  test("impossible ranges are rejected client-side and the URL stays sane", async ({ page }) => {
    await page.goto("/seeker/search?suburb=Kellyville&checkIn=2062-01-01&checkOut=2020-01-01");
    await expect(page).not.toHaveURL(/2062/);
    await expect(page.getByTestId("listing-card").first()).toBeVisible();
  });

  test("back and forward restore filters", async ({ page, isMobile }) => {
    test.skip(isMobile, "the filter panel is a drawer on mobile; covered by responsive.spec.ts");
    await page.goto("/seeker/search?suburb=Kellyville");
    const furnished = page.getByRole("search", { name: "Room filters" }).getByRole("button", { name: "Furnished" });
    await furnished.click();
    await expect(page).toHaveURL(/furnished=true/);
    await page.goto("/seeker/search?suburb=Parramatta");
    await page.goBack();
    await expect(page).toHaveURL(/furnished=true/);
    await expect(furnished).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("error and empty states", () => {
  test("API failure shows a retry state instead of 'no rooms'", async ({ page }) => {
    await page.goto("/seeker/search?suburb=__boom__");
    await expect(page.getByTestId("search-error")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expect(page.getByTestId("search-empty")).toHaveCount(0);
  });

  test("no matches shows the empty state with recovery actions", async ({ page }) => {
    await page.goto("/seeker/search?suburb=Nowhereville");
    await expect(page.getByTestId("search-empty")).toBeVisible();
    await expect(page.getByRole("button", { name: "Kellyville" })).toBeVisible();
  });

  test("pagination loads more and reports totals honestly", async ({ page }) => {
    await page.goto("/seeker/search");
    await expect(page.getByTestId("results-status")).toContainText(/Showing 20 of 26 rooms/);
    await page.getByRole("button", { name: "Load more rooms" }).click();
    await expect(page.getByTestId("listing-card")).toHaveCount(26);
  });
});

test.describe("verification and listing state", () => {
  test("an unverified host is never shown as verified", async ({ page }) => {
    await page.goto("/seeker/search?suburb=Kellyville");
    const card = page.getByTestId("listing-card").filter({ hasText: "unverified host" });
    await expect(card.locator("[data-verification-status]")).toHaveAttribute("data-verification-status", "unverified");
    await expect(card).toContainText("Not yet verified");
    await expect(card).not.toContainText("ID verified host");
    const verifiedCard = page.getByTestId("listing-card").filter({ hasText: "Sunny room" }).first();
    await expect(verifiedCard.locator("[data-verification-status]")).toHaveAttribute("data-verification-status", "verified");
  });

  test("expired listing URL returns 410 and an honest page", async ({ page }) => {
    const response = await page.goto(`/listing/${EXPIRED_ID}`);
    expect(response?.status()).toBe(410);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Beautiful Rooms in Kellyville");
    await expect(page.getByText("No longer available")).toBeVisible();
    await expect(page.getByText(/25 April 2026/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Request to book|Instant book/ })).toHaveCount(0);
    const html = await page.content();
    expect(html).toContain('name="robots" content="noindex');
  });

  test("public listing page never contains private fields", async ({ request }) => {
    const res = await request.get(`/listing/${LIVE_ID}`);
    const html = await res.text();
    for (const forbidden of ['"latitude"', '"longitude"', '"owner_id"', '"moderation_notes"', '"spam_score"', '"hidden_at"', '"street_address"', '"geocoded_address"', '"streetAddress"']) {
      expect(html, `${forbidden} leaked into the public page`).not.toContain(forbidden);
    }
    expect(html).toContain('"precision":"approximate"');
    expect(html).toContain("Street address is shared once a booking is agreed");
  });
});
