import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Migrent Hub journeys against the mock API (tests/e2e/hub-mock.mjs).
 * The fixture accounts exist only in the mock. Its state is shared by
 * every test in the run, so journeys that change data run once, on the
 * desktop project, in order.
 */
const PASSWORD = "hub-test-pass-1";
const ROOM_1 = "11111111-1111-4111-8111-000000000001";
const STUDIO = "11111111-1111-4111-8111-000000000002";

async function fillSignIn(page: Page, email: string, password = PASSWORD) {
  // Typing before hydration finishes is lost when React takes over the
  // inputs, so wait for the page to settle and check what landed.
  await page.waitForLoadState("networkidle");
  const emailBox = page.getByLabel("Email");
  const passwordBox = page.getByLabel("Password");
  await expect(async () => {
    await emailBox.fill(email);
    await passwordBox.fill(password);
    await expect(emailBox).toHaveValue(email, { timeout: 500 });
    await expect(passwordBox).toHaveValue(password, { timeout: 500 });
  }).toPass({ timeout: 10_000 });
  await page.getByRole("button", { name: /^Sign in$/ }).click();
}

async function signIn(page: Page, email: string, next = "/") {
  await page.goto(`/hub/sign-in${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`);
  await fillSignIn(page, email);
  await expect(page).not.toHaveURL(/sign-in/, { timeout: 20_000 });
}

test.describe("signed out", () => {
  test("a Hub page sends you to sign in and back to it", async ({ page }) => {
    await page.goto("/hub/saved?tab=searches");
    await expect(page).toHaveURL(/\/hub\/sign-in\?next=%2Fsaved%3Ftab%3Dsearches/);
    await fillSignIn(page, "renter@example.test");
    await expect(page).toHaveURL(/\/hub\/saved\?tab=searches/);
    await expect(page.getByRole("heading", { name: "Saved", level: 1 })).toBeVisible();
  });

  test("the listing page hands off to the Hub with an intent", async ({ page }) => {
    await page.goto(`/listing/${ROOM_1}`);
    const apply = page.getByRole("link", { name: "Apply for this home" }).first();
    await expect(apply).toHaveAttribute("href", new RegExp(`/hub/sign-in\\?next=%2Fapply%2F${ROOM_1}&intent=apply`));
    await apply.click();
    await expect(page.getByText("Sign in to apply.")).toBeVisible();
  });

  test("wrong password is announced", async ({ page }) => {
    await page.goto("/hub/sign-in");
    await fillSignIn(page, "renter@example.test", "nope");
    await expect(page.getByRole("alert").filter({ hasText: /do not match/i })).toBeVisible();
  });
});

test.describe("renter", () => {
  test("home, navigation and the phone tab bar", async ({ page, isMobile }) => {
    await signIn(page, "renter@example.test");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sarah");
    if (isMobile) {
      const tabs = page.getByRole("navigation", { name: "Migrent Hub" }).last();
      await expect(tabs).toBeVisible();
      await tabs.getByRole("link", { name: /Messages/ }).click();
      await expect(page).toHaveURL(/\/hub\/messages/);
    } else {
      await page.getByRole("navigation", { name: "Migrent Hub" }).first().getByRole("link", { name: "Applications" }).click();
      await expect(page).toHaveURL(/\/hub\/applications/);
      await expect(page.getByRole("heading", { name: "Applications", level: 1 })).toBeVisible();
    }
  });

  test.describe.serial("changes", () => {
    test.skip(({ isMobile }) => isMobile, "journeys that change data run once");

    test("save a home and find it under Saved", async ({ page }) => {
      await signIn(page, "renter@example.test", `/homes/${ROOM_1}`);
      const save = page.getByRole("button", { name: /^Save / }).first();
      await save.click();
      await expect(page.getByRole("button", { name: /^Remove .* from saved/ }).first()).toBeVisible();
      await page.goto("/hub/saved");
      await expect(page.getByText("Sunny room near the station").first()).toBeVisible();
    });

    test("finish and send an application", async ({ page }) => {
      await signIn(page, "renter@example.test", `/apply/${STUDIO}?step=review`);
      await expect(page.getByRole("button", { name: "Send application" })).toBeVisible();
      await page.getByRole("button", { name: "Send application" }).click();
      await expect(page.getByRole("alert").filter({ hasText: /Confirm you're happy/ })).toBeVisible();
      await page.getByText(/I'm happy for .* and Migrent to see this application/).click();
      await page.getByRole("button", { name: "Send application" }).click();
      await expect(page.getByRole("heading", { name: "Your application has been sent." })).toBeVisible();
    });

    test("send a message in a conversation", async ({ page }) => {
      await signIn(page, "renter@example.test", "/messages");
      await page.getByRole("link", { name: /Priya Nair/ }).first().click();
      const box = page.getByRole("textbox", { name: /Message Priya/ });
      await box.fill("Is there parking nearby?");
      await box.press("Enter");
      await expect(page.getByRole("region", { name: "Conversation" }).getByText("Is there parking nearby?")).toBeVisible();
      await expect(box).toHaveValue("");
    });
  });
});

test.describe("tenant", () => {
  test.skip(({ isMobile }) => isMobile, "changes data");

  test("my home shows the lease, and an emergency repair gets the right advice first", async ({ page }) => {
    await signIn(page, "tenant@example.test", "/my-home");
    await expect(page.getByRole("heading", { name: "My home", level: 1 })).toBeVisible();
    await expect(page.getByText("Migrent does not collect rent or bond", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Request a repair" }).click();
    const dialog = page.getByRole("dialog", { name: "Request a repair" });
    await dialog.getByText("Emergency", { exact: true }).click();
    await expect(dialog.getByRole("link", { name: "Call 000" })).toBeVisible();
    await dialog.getByLabel("What's it about?").selectOption("plumbing");
    await dialog.getByLabel("In a few words").fill("Burst pipe under the sink");
    await dialog.getByLabel("What's happening?").fill("Water is coming out fast. I've turned off the mains.");
    await dialog.getByRole("button", { name: "Send request" }).click();
    await expect(page).toHaveURL(/\/hub\/maintenance\//);
    await expect(page.getByRole("heading", { name: "Burst pipe under the sink" })).toBeVisible();
  });
});

test.describe("owner", () => {
  test.skip(({ isMobile }) => isMobile, "changes data");

  test("portfolio, a listing, and shortlisting an applicant", async ({ page }) => {
    await signIn(page, "owner@example.test", "/properties");
    await expect(page.getByRole("heading", { name: "Properties", level: 1 })).toBeVisible();
    await page.getByRole("link", { name: /Smith Street share house/ }).click();
    await expect(page.getByText("Tom Nguyen")).toBeVisible();
    await page.goto("/hub/applications/app-1");
    await page.getByRole("button", { name: "Shortlist" }).click();
    await expect(page.getByText("Shortlisted").first()).toBeVisible();
  });

  test("list a property with the wizard", async ({ page }) => {
    await signIn(page, "owner@example.test", "/properties/new");
    await expect(page).toHaveURL(/draft=/);
    await page.getByLabel("Street address").fill("22 Wattle Avenue");
    await page.getByLabel("Suburb").fill("Rouse Hill");
    await page.getByLabel("Postcode").fill("2155");
    await page.getByRole("button", { name: "House", exact: true }).click();
    await page.getByRole("button", { name: /^Next/ }).click();
    await page.getByText("A private room", { exact: true }).click();
    await page.getByRole("button", { name: /^Next/ }).click();
    await page.getByLabel("Title").fill("Quiet room near Rouse Hill station");
    await page.getByLabel("Description").fill("A bright, quiet room in a family home, five minutes' walk from the metro.");
    await page.getByRole("button", { name: /^Next/ }).click();
    await page.locator('input[type="file"]').first().setInputFiles({ name: "room.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64") });
    await expect(page.getByRole("img", { name: /Photo 1 \(cover\)/ })).toBeVisible();
    await page.getByRole("button", { name: /^Next/ }).click();
    await page.getByLabel("Rent a week").fill("320");
    await page.getByLabel("Available from").fill("2026-11-01");
    await page.getByRole("button", { name: /^Review/ }).last().click();
    await expect(page.getByText("Ready to send")).toBeVisible();
    await page.getByRole("button", { name: "Send for review" }).click();
    await expect(page.getByRole("heading", { name: "Sent for review" })).toBeVisible();
  });
});

test.describe("admin", () => {
  test.skip(({ isMobile }) => isMobile, "changes data");

  test("viewing as a customer needs a recorded reason and is read-only", async ({ page }) => {
    await signIn(page, "admin@example.test", "/admin/people");
    await page.getByRole("searchbox", { name: /name or email/i }).fill("sarah");
    await page.getByRole("button", { name: "View as" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: "Start viewing" })).toBeDisabled();
    await dialog.getByLabel("Why do you need to?").fill("Support ticket 1234");
    await dialog.getByRole("button", { name: "Start viewing" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Viewing as Sarah Chen" })).toBeVisible();
    await page.getByRole("button", { name: "Stop viewing" }).click();
    await page.goto("/hub/admin/audit");
    await expect(page.getByText("Started viewing as a customer").first()).toBeVisible();
    await expect(page.getByText("Support ticket 1234").first()).toBeVisible();
  });
});

test.describe("appearance and accessibility", () => {
  for (const path of ["/", "/applications", "/messages", "/saved", "/settings"]) {
    test(`axe: Hub ${path} in light and dark`, async ({ page }) => {
      await signIn(page, "renter@example.test", path);
      for (const theme of ["light", "dark"] as const) {
        await page.evaluate((t) => {
          localStorage.setItem("migrent-theme", t);
        }, theme);
        await page.reload();
        await page.waitForLoadState("networkidle");
        await expect(page.locator("html")).toHaveClass(theme === "dark" ? /\bdark\b/ : /^(?!.*\bdark\b)/);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).exclude(".maplibregl-map").analyze();
        const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(serious, `${path} (${theme}): ${JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.slice(0, 3).map((n) => n.target) })), null, 2)}`).toEqual([]);
      }
    });
  }

  test("no horizontal overflow on Hub pages", async ({ page }) => {
    await signIn(page, "owner@example.test");
    for (const path of ["/", "/properties", "/applications", "/inspections", "/messages", "/tenancies", "/insights", "/settings", "/activity"]) {
      await page.goto(`/hub${path === "/" ? "" : path}`);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });
});
