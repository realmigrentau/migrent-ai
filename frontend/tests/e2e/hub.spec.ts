import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Migrent Hub journeys against the mock API (tests/e2e/hub-mock.mjs).
 * The fixture accounts exist only in the mock. Its state is shared by
 * every test in the run, so journeys that change data run once, on the
 * desktop project, in order.
 */
const PASSWORD = "hub-test-pass-1";
const PANEL_PASSWORD = "panel-test-pass-1";
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

/** Enter the Admin panel's own password on the page that asks for it. */
async function unlockPanel(page: Page, password = PANEL_PASSWORD) {
  await page.getByLabel("Admin password").fill(password);
  await page.getByRole("button", { name: "Unlock" }).click();
}

async function signInToPanel(page: Page, email: string, next: string) {
  await signIn(page, email, next);
  await unlockPanel(page);
  await expect(page.getByText("Admin panel open")).toBeVisible();
}

/**
 * Count the siren: every oscillator started, and every audio context the
 * page opens (to check one is actually running, not blocked).
 */
async function listenForSiren(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __oscillators: number; __audio: AudioContext[] };
    w.__oscillators = 0;
    w.__audio = [];
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (this: OscillatorNode, ...args: Parameters<OscillatorNode["start"]>) {
      w.__oscillators += 1;
      return start.apply(this, args);
    };
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor(...args: ConstructorParameters<typeof AudioContext>) {
        super(...args);
        w.__audio.push(this);
      }
    };
  });
}

async function sirenPlaying(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as { __oscillators: number; __audio: AudioContext[] };
    return w.__oscillators > 0 && w.__audio.some((c) => c.state === "running");
  });
}

/** The panel locks after 30 seconds without activity; loops over pages keep the mouse moving. */
async function stayActive(page: Page, i: number) {
  await page.mouse.move(40 + (i % 7) * 13, 40 + (i % 5) * 11);
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

  test("Hub pages hydrate without React throwing the server's HTML away", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/hub/sign-in");
    await page.waitForLoadState("networkidle");
    await signIn(page, "owner@example.test", "/properties");
    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(errors.filter((e) => /#418|#423|Hydration/i.test(e))).toEqual([]);
  });

  test("wrong password is announced", async ({ page }) => {
    await page.goto("/hub/sign-in");
    await fillSignIn(page, "renter@example.test", "nope");
    await expect(page.getByRole("alert").filter({ hasText: /do not match/i })).toBeVisible();
  });

  test("an email's unsubscribe link asks once, then switches that kind of email off", async ({ page }) => {
    await page.goto("/unsubscribe?u=aaaa0000-0000-4000-8000-000000000005&g=saved_searches&t=test-token");
    await expect(page.getByRole("heading", { name: "Stop emails about saved search alerts?" })).toBeVisible();
    await page.getByRole("button", { name: "Unsubscribe" }).click();
    await expect(page.getByRole("heading", { name: "Done." })).toBeVisible();
    await expect(page.getByText("account and safety emails still reach you")).toBeVisible();
  });

  test("a forged unsubscribe link changes nothing and says so", async ({ page }) => {
    await page.goto("/unsubscribe?u=aaaa0000-0000-4000-8000-000000000005&g=messages&t=guessed");
    await page.getByRole("button", { name: "Unsubscribe" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "isn't valid" })).toBeVisible();
  });

  test("a property manager's agency and licence show on their listing", async ({ page }) => {
    await page.goto(`/listing/${STUDIO}`);
    const agency = page.getByTestId("owner-agency").first();
    await expect(agency).toContainText("Harbour Rentals");
    await expect(agency).toContainText("Licence 10012345");
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

  test("the Discover map loads its worker and pins the homes", async ({ page, isMobile }) => {
    test.skip(isMobile, "the map sits beside the list on desktop");
    // No map tiles offline: a plain local style is enough to start the map.
    // Grouping homes into pins happens in MapLibre's web worker, so pins
    // on the map mean the worker (lib/maplibre.ts) loaded.
    await page.route("https://api.maptiler.com/**", (route) =>
      route.fulfill({ contentType: "application/json", body: JSON.stringify({ version: 8, sources: {}, layers: [{ id: "bg", type: "background", paint: { "background-color": "#dfe7ee" } }] }) }),
    );
    const worker = page.waitForEvent("worker", { predicate: (w) => w.url().includes("/vendor/maplibre-gl/") });
    await signIn(page, "renter@example.test", "/discover");
    await worker;
    await expect(page.locator(".hub-price-marker").first()).toBeVisible({ timeout: 20_000 });
  });

  test("sign out is one tap away and really ends the session", async ({ page, isMobile }) => {
    await signIn(page, "renter@example.test");
    if (isMobile) {
      await page.getByRole("navigation", { name: "Migrent Hub" }).last().getByRole("link", { name: "Profile" }).click();
      await page.getByRole("button", { name: "Sign out" }).click();
    } else {
      await page.getByRole("navigation", { name: "Migrent Hub" }).first().getByRole("button", { name: "Sign out" }).click();
    }
    await expect(page).toHaveURL(/\/hub\/sign-in/);
    await page.goto("/hub/saved");
    await expect(page).toHaveURL(/\/hub\/sign-in\?next=%2Fsaved/);
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
    // A lease has to state its money up front, within Migrent's limits.
    await expect(page.getByLabel("Bond", { exact: true }).locator("option")).toHaveCount(6); // Choose, None, 1 to 4 weeks
    await page.getByLabel("Bond", { exact: true }).selectOption("4");
    await page.getByLabel("Rent in advance").selectOption("2");
    await expect(page.getByText("$1,920 to move in")).toBeVisible();
    await page.getByLabel("Available from").fill("2026-11-01");
    await page.getByRole("button", { name: /^Review/ }).last().click();
    await expect(page.getByText("Ready to send")).toBeVisible();
    await page.getByRole("button", { name: "Send for review" }).click();
    await expect(page.getByRole("heading", { name: "Sent for review" })).toBeVisible();
  });

  test("find listings by address and pause, then bring back, a selection", async ({ page }) => {
    await signIn(page, "owner@example.test", "/properties");
    await page.getByLabel("Search by address, suburb or title").fill("Church");
    const many = page.getByTestId("many-listings");
    await expect(many.getByRole("listitem")).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Smith Street share house/ })).toHaveCount(0);
    await many.getByText("Select all shown").click();
    await expect(many.getByText("1 selected")).toBeVisible();
    await many.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByText("1 listing updated")).toBeVisible();
    await expect(many.getByText("Paused", { exact: true })).toBeVisible();
    await many.getByText("Select all shown").click();
    await many.getByRole("button", { name: "Bring back" }).click();
    await expect(many.getByText("Live", { exact: true })).toBeVisible();
  });

  test("a property manager adds their agency in Settings", async ({ page }) => {
    await signIn(page, "boss@example.test", "/settings");
    await page.getByText("A property manager", { exact: true }).click();
    const agency = page.getByTestId("agency-fields");
    await agency.getByLabel("Agency name").fill("Hills Property Co");
    await agency.getByLabel(/Licence number/).fill("20098765");
    await agency.getByRole("button", { name: "Save agency details" }).click();
    await expect(page.getByText("Agency details saved")).toBeVisible();
    await page.getByText("The owner", { exact: true }).click();
    await expect(page.getByTestId("agency-fields")).toHaveCount(0);
  });
});

test.describe("trust and safety", () => {
  test.skip(({ isMobile }) => isMobile, "changes data");

  test("a tenant reviews their tenancy a month in", async ({ page }) => {
    await signIn(page, "tenant@example.test");
    const pending = page.getByTestId("pending-reviews");
    await expect(pending).toBeVisible();
    await pending.getByRole("button", { name: "Write a review" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("first name only");
    await dialog.getByRole("radio", { name: /^5 out of 5/ }).first().click();
    await dialog.getByLabel("What should the next renter know?").fill("Quiet house, and the host fixed the oven quickly.");
    await dialog.getByRole("button", { name: "Send review" }).click();
    await expect(page.getByText("Thanks for your review")).toBeVisible();
    await expect(page.getByTestId("pending-reviews")).toHaveCount(0);
  });

  test("a scam-looking message warns the renter, who can block and later unblock the sender", async ({ page }) => {
    await signIn(page, "owner@example.test", `/messages/${ROOM_1}_aaaa0000-0000-4000-8000-000000000001`);
    await page.getByLabel(/^Message /).fill("Please pay a deposit before the inspection so I can hold the room");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.getByText("Please pay a deposit before the inspection so I can hold the room", { exact: true })).toBeVisible();
    await page.getByRole("navigation", { name: "Migrent Hub" }).first().getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/hub\/sign-in/);

    await signIn(page, "renter@example.test", `/messages/${ROOM_1}_aaaa0000-0000-4000-8000-000000000002`);
    await expect(page.getByTestId("scam-warning").last()).toContainText("asks for money before you have inspected the home");
    await page.getByRole("button", { name: "Conversation options" }).click();
    await page.getByRole("menuitem", { name: /^Block / }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Block" }).click();
    await expect(page.getByTestId("conversation-closed")).toContainText("You blocked");

    await page.goto("/hub/settings#blocked");
    const blocked = page.locator("#blocked");
    await blocked.getByRole("button", { name: "Unblock" }).click();
    await expect(blocked).toContainText("You haven't blocked anyone.");
  });

  test("move-in: the renter pays, both sides get the green light and receipts with one code", async ({ page }) => {
    await signIn(page, "tenant@example.test", "/tenancies/ten-1");
    const pay = page.getByTestId("move-in-pay");
    await expect(pay).toContainText("bond is not paid through Migrent");
    // The renter sees the rent, the card fee they pay on top, and the total.
    await expect(pay.getByTestId("move-in-quote")).toContainText("Card fee");
    await expect(pay.getByTestId("move-in-quote")).toContainText("$295.53");
    await pay.getByRole("button", { name: /^Pay / }).click();
    const green = page.getByTestId("move-in-green-light");
    await expect(green).toContainText("Payment sent to the owner");
    await expect(green.getByTestId("security-code")).toContainText("K7PM2QX9RT");
    await green.getByRole("button", { name: "I've moved in and have the keys" }).click();
    await expect(green).toContainText("You confirmed you moved in");
    await green.getByRole("link", { name: "Receipt" }).click();
    const receipt = page.getByTestId("receipt");
    await expect(receipt).toContainText("Renter's receipt");
    await expect(receipt).toContainText("Priya Nair");
    await expect(receipt.getByTestId("security-code")).toContainText("K7PM2QX9RT");
    await page.getByRole("navigation", { name: "Migrent Hub" }).first().getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/hub\/sign-in/);

    await signIn(page, "owner@example.test", "/tenancies/ten-1/receipt");
    await expect(page.getByTestId("receipt")).toContainText("Tom Nguyen");
    await expect(page.getByTestId("receipt").getByTestId("security-code")).toContainText("K7PM2QX9RT");
  });

  test("a stay request shows how to pay the host safely", async ({ page }) => {
    await signIn(page, "renter@example.test");
    await page.goto("/listing/11111111-1111-4111-8111-000000000099");
    await expect(page.getByTestId("stay-payment-warning")).toContainText("Never by gift card, crypto");
  });
});

test.describe("admin", () => {
  test.skip(({ isMobile }) => isMobile, "changes data");

  test("viewing as a customer needs a recorded reason and is read-only", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin/people");
    await page.getByRole("searchbox", { name: /name or email/i }).fill("sarah");
    await expect(page.getByText("1 person", { exact: true })).toBeVisible();
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

  test("approve a new listing from the review queue, and it is audited", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin/listings");
    await expect(page.getByRole("heading", { name: "Listings", level: 1 })).toBeVisible();
    await page.getByRole("button", { name: /Bright room in Castle Hill/ }).click();
    const drawer = page.getByRole("dialog", { name: "Bright room in Castle Hill" });
    await expect(drawer.getByText("4 Pennant Street", { exact: false })).toBeVisible();
    await drawer.getByRole("button", { name: "Approve", exact: true }).click();
    await drawer.getByRole("button", { name: "Approve and publish" }).click();
    await expect(drawer.getByText("Approved", { exact: true }).first()).toBeVisible();
    await expect(drawer.getByText("Approved by Ada Admin")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.goto("/hub/admin/audit");
    await expect(page.getByText("Approved a listing").first()).toBeVisible();
  });

  test("a flagged listing needs a reason to hide, and removal takes two steps", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin/listings?queue=flagged");
    await page.getByRole("button", { name: /CHEAP ROOM pay deposit now/ }).click();
    const drawer = page.getByRole("dialog", { name: "CHEAP ROOM pay deposit now" });
    await expect(drawer.getByText("Asks for payment before a viewing")).toBeVisible();
    await drawer.getByRole("button", { name: "Hide", exact: true }).click();
    const confirmHide = drawer.getByRole("button", { name: "Hide listing" });
    await expect(confirmHide).toBeDisabled();
    await drawer.getByLabel("Why (for the team)").fill("Asks for a deposit before any viewing");
    await confirmHide.click();
    await expect(drawer.getByText("Hidden", { exact: true }).first()).toBeVisible();
    await drawer.getByRole("button", { name: "Start removal" }).click();
    await drawer.getByLabel(/Reason \(sent to the owner when removal is confirmed\)/).fill("Scam: asks for money before a viewing");
    await drawer.getByRole("button", { name: "Start removal" }).last().click();
    await expect(drawer.getByText("Removal pending", { exact: true }).first()).toBeVisible();
    await drawer.getByRole("button", { name: "Confirm removal" }).click();
    await expect(drawer.getByText("Scam: asks for money before a viewing").first()).toBeVisible();
    await drawer.getByRole("button", { name: "Remove listing" }).click();
    await expect(drawer.getByText("Removed", { exact: true }).first()).toBeVisible();
  });

  test("check an owner's ID: see the document, reject with a reason", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin/id-checks");
    await expect(page.getByText("Liam Park")).toBeVisible();
    await page.getByRole("button", { name: "View document" }).click();
    const doc = page.getByRole("dialog", { name: /Liam Park: Passport/ });
    await expect(doc.getByRole("img", { name: /passport/i })).toBeVisible();
    await doc.getByRole("button", { name: "Close" }).last().click();
    await page.getByRole("button", { name: "Reject", exact: true }).click();
    const reject = page.getByRole("dialog", { name: /Reject Liam Park's ID/ });
    await expect(reject.getByRole("button", { name: "Reject ID" })).toBeDisabled();
    await reject.getByLabel(/What was wrong/).fill("The photo is too blurry to read the name");
    await reject.getByRole("button", { name: "Reject ID" }).click();
    await expect(page.getByText("No ID checks waiting")).toBeVisible();
    await page.goto("/hub/admin/audit");
    await expect(page.getByText("Rejected an owner's ID").first()).toBeVisible();
  });

  test("approve a mentor once their ID is checked, and it is audited", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin/mentors");
    await expect(page.getByText("Twelve years in the Hills district.")).toBeVisible();
    await expect(page.getByText("ID checked")).toBeVisible();
    await page.getByRole("button", { name: "Approve and list" }).click();
    const dialog = page.getByRole("dialog", { name: /as a mentor\?/ });
    await dialog.getByRole("button", { name: "Approve and list" }).click();
    await expect(page.getByText("No mentors waiting")).toBeVisible();
    await page.goto("/hub/admin/audit");
    await expect(page.getByText("Approved a mentor").first()).toBeVisible();
  });

  test("suspend an account with a reason, then reinstate it", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin/people");
    await page.getByRole("searchbox", { name: /name or email/i }).fill("liam");
    await expect(page.getByText("1 person", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Suspend" }).click();
    const dialog = page.getByRole("dialog", { name: /Suspend Liam Park/ });
    await expect(dialog.getByRole("button", { name: "Suspend account" })).toBeDisabled();
    await dialog.getByLabel("Why?").fill("Asked renters to pay outside Migrent");
    await dialog.getByRole("button", { name: "Suspend account" }).click();
    await expect(page.getByText("Suspended", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Reinstate" }).click();
    const back = page.getByRole("dialog", { name: /Reinstate Liam Park/ });
    await back.getByLabel("Why?").fill("Appeal accepted after a call");
    await back.getByRole("button", { name: "Reinstate" }).click();
    await expect(page.getByRole("button", { name: "Suspend" })).toBeVisible();
  });

  test("everyone is listed without a search, filters narrow it, and a person's page brings it together", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin/people");
    await expect(page.getByText(/^\d+ people$/)).toBeVisible();
    await page.getByLabel("Role").selectOption("owner");
    await page.getByRole("searchbox", { name: /name or email/i }).fill("priya");
    await expect(page.getByText("1 person", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Priya Nair" }).click();
    await expect(page.getByRole("heading", { name: "Priya Nair", level: 1 })).toBeVisible();
    await expect(page.getByText("Possible scam: asks for money before an inspection")).toBeVisible();
    await expect(page.getByText(/scam check/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Listings \(\d+\)$/ })).toBeVisible();
  });

  test("Numbers counts what is in the database", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin");
    await page.getByRole("navigation", { name: "Admin panel" }).getByRole("link", { name: "Numbers" }).click();
    const numbers = page.getByTestId("admin-numbers");
    await expect(numbers.getByText("Accounts", { exact: true })).toBeVisible();
    await expect(numbers.getByText("Scam flags in 30 days")).toBeVisible();
    await expect(page.getByText("Nothing here is estimated.", { exact: false })).toBeVisible();
  });

  test("act from a report: read the flagged conversation, then pause a reported listing with a ready-made reason", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin/reports");
    const scam = page.getByRole("listitem").filter({ hasText: "by the scam check" });
    await scam.getByTestId("report-actions").getByRole("button", { name: "Read the conversation" }).click();
    const convo = page.getByRole("dialog", { name: "The conversation" });
    await expect(convo.getByTestId("reported-conversation")).toContainText("if that suits");
    await expect(convo.getByText(/· reported/)).toBeVisible();
    await page.keyboard.press("Escape");

    const listing = page.getByRole("listitem").filter({ hasText: "Looks like a scam" });
    await listing.getByTestId("report-actions").getByRole("button", { name: "Pause the listing" }).click();
    const pause = page.getByRole("dialog", { name: /^Pause / });
    await expect(pause.getByRole("button", { name: "Pause listing" })).toBeDisabled();
    await pause.getByLabel("Common reasons").selectOption({ index: 1 });
    await expect(pause.getByLabel("Reason (sent to the owner)")).toHaveValue("Paused while we look into a report from a renter.");
    await pause.getByRole("button", { name: "Pause listing" }).click();
    await expect(page.getByText("Listing paused")).toBeVisible();

    await page.goto("/hub/admin/audit");
    await expect(page.getByText("Read a reported conversation").first()).toBeVisible();
  });

  test("answer a support ticket and leave an internal note", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin/support");
    // Most urgent first.
    const first = page.locator("main li button").first();
    await expect(first).toContainText("An owner asked me for cash");
    await first.click();
    const drawer = page.getByRole("dialog", { name: "An owner asked me for cash" });
    await drawer.getByLabel("Your reply").fill("Please don't pay anything. We're contacting the owner today.");
    await drawer.getByRole("button", { name: "Send reply" }).click();
    await expect(drawer.getByText("We're contacting the owner today.", { exact: false })).toBeVisible();
    await expect(drawer.getByLabel("Status")).toHaveValue("pending_customer");
    await drawer.getByRole("radio", { name: "Internal note" }).click();
    await drawer.getByLabel("Note for the team").fill("Owner is Priya; checked her other listings.");
    await drawer.getByRole("button", { name: "Add note" }).click();
    await expect(drawer.getByText(/Internal note from Ada Admin/)).toBeVisible();
  });
});

test.describe("admin panel", () => {
  test.skip(({ isMobile }) => isMobile, "changes data");

  test("an admin's normal account has an Admin panel with its own password", async ({ page }) => {
    await signIn(page, "boss@example.test");
    // A normal owner account, with the Admin panel as one more place to go.
    const rail = page.getByRole("navigation", { name: "Migrent Hub" }).first();
    await expect(rail.getByRole("link", { name: "Properties" })).toBeVisible();
    await expect(page.getByText("Listings to moderate")).toHaveCount(0);
    await rail.getByRole("link", { name: "Admin panel" }).click();
    await expect(page).toHaveURL(/\/hub\/admin$/);
    await expect(page.getByText("You have 3 tries.")).toBeVisible();
    await unlockPanel(page, "not the password");
    await expect(page.getByRole("alert").filter({ hasText: "2 tries left" })).toBeVisible();
    await unlockPanel(page);
    await expect(page.getByText("Admin panel open")).toBeVisible();
    const sections = page.getByRole("navigation", { name: "Admin panel" });
    for (const name of ["Overview", "Listings", "ID checks", "Final reviews", "Reports", "Support", "People", "Audit log"]) {
      await expect(sections.getByRole("link", { name })).toBeVisible();
    }
    await expect(page.getByText("Listings to moderate")).toBeVisible();
    await sections.getByRole("link", { name: "Audit log" }).click();
    await expect(page.getByText("Opened the Admin panel").first()).toBeVisible();
    await expect(page.getByText("Entered a wrong Admin panel password").first()).toBeVisible();
    await page.getByRole("button", { name: "Lock now" }).click();
    await expect(page.getByLabel("Admin password")).toBeVisible();
    // Locking it yourself is quiet.
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
  });

  test("a server without the Admin panel yet says so plainly", async ({ page }) => {
    // The site can go live before the API it talks to has been updated.
    await page.route("**/hub/admin/panel", (route) => route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ detail: "Not Found" }) }));
    await signIn(page, "admin@example.test", "/admin");
    await expect(page.getByText("The Admin panel isn't switched on yet")).toBeVisible();
    await expect(page.getByText("Not Found", { exact: true })).toHaveCount(0);
    await page.unroute("**/hub/admin/panel");
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByLabel("Admin password")).toBeVisible();
  });

  test("the panel locks itself after 30 seconds without activity, with lights and a siren", async ({ page }) => {
    await listenForSiren(page);
    await page.clock.install();
    await signInToPanel(page, "admin@example.test", "/admin/audit");
    await page.clock.fastForward(20_000);
    await expect(page.getByText(/Locking in \d+s/)).toBeVisible();
    await page.mouse.move(200, 200);
    await page.clock.fastForward(20_000);
    await expect(page.getByText("Admin panel open")).toBeVisible();
    await page.clock.fastForward(12_000);

    const alarm = page.getByRole("alertdialog", { name: "Admin panel locked" });
    await expect(alarm).toBeVisible();
    await expect(alarm.getByText("No activity for 30 seconds")).toBeVisible();
    await expect(page.locator(".hub-threat-lights .hub-threat-blue")).toBeAttached();
    await expect.poll(() => sirenPlaying(page)).toBe(true);
    await expect(page.getByRole("heading", { name: "Audit log", level: 1 })).toHaveCount(0);

    await alarm.getByRole("button", { name: "Silence alarm" }).click();
    await expect(alarm.getByRole("button", { name: "Silence alarm" })).toHaveCount(0);
    await alarm.getByRole("button", { name: "Unlock again" }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await expect(page.getByLabel("Admin password")).toBeVisible();
    // A reload does not bring it back.
    await page.reload();
    await expect(page.getByLabel("Admin password")).toBeVisible();
  });

  test("three wrong passwords sign you out, sound the alarm and alert every admin", async ({ page }) => {
    await listenForSiren(page);
    await signIn(page, "grace@example.test");
    await page.getByRole("navigation", { name: "Migrent Hub" }).first().getByRole("link", { name: "Admin panel" }).click();
    await unlockPanel(page, "guess one");
    await expect(page.getByRole("alert").filter({ hasText: "2 tries left" })).toBeVisible();
    await unlockPanel(page, "guess two");
    await expect(page.getByRole("alert").filter({ hasText: "1 try left" })).toBeVisible();
    await unlockPanel(page, "guess three");

    await expect(page).toHaveURL(/\/hub\/locked$/);
    await expect(page.getByRole("heading", { name: "Potential threat" })).toBeVisible();
    await expect(page.getByText("Potential hack")).toBeVisible();
    await expect(page.getByText(/every Migrent admin has been alerted/)).toBeVisible();
    await expect.poll(() => sirenPlaying(page)).toBe(true);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
    await page.getByRole("button", { name: "Silence alarm" }).click();
    await expect(page.getByRole("button", { name: "Silence alarm" })).toHaveCount(0);
    // The lights calm down for anyone who asked for less motion.
    const lights = page.locator(".hub-threat-lights .hub-threat-red");
    await expect.poll(() => lights.evaluate((el) => getComputedStyle(el).animationName)).toBe("hub-threat-pulse");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => lights.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");

    // Signed out here too.
    await page.waitForLoadState("networkidle");
    await page.goto("/hub");
    await expect(page).toHaveURL(/\/hub\/sign-in/);

    // Every admin has the alert.
    await fillSignIn(page, "boss@example.test");
    await page.goto("/hub/activity");
    await expect(page.getByText("Potential threat: admin panel locked").first()).toBeVisible();
  });
});

test.describe("old admin console", () => {
  test("every old admin address goes to its Hub screen", async ({ request }) => {
    const cases: [string, string][] = [
      ["/admin", "/hub/admin"],
      ["/admin/overview", "/hub/admin"],
      ["/admin/analytics", "/hub/admin"],
      ["/admin/revenue", "/hub/admin"],
      ["/admin/moderation", "/hub/admin/listings"],
      ["/admin/spam-moderation", "/hub/admin/listings?queue=flagged"],
      ["/admin/listings", "/hub/admin/listings?queue=all"],
      ["/admin/verification", "/hub/admin/id-checks"],
      ["/admin/users", "/hub/admin/people"],
      ["/admin/reports", "/hub/admin/reports"],
      ["/admin/support", "/hub/admin/support"],
    ];
    for (const [from, to] of cases) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(307);
      const loc = new URL(res.headers()["location"], "http://x");
      expect(`${loc.pathname}${loc.search}`, from).toBe(to);
    }
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

  test("axe: Hub admin screens in light and dark", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin/listings");
    let i = 0;
    for (const path of ["/", "/admin", "/admin/listings", "/admin/id-checks", "/admin/mentors", "/admin/support", "/admin/people", "/admin/audit"]) {
      await stayActive(page, i++);
      await page.goto(`/hub${path === "/" ? "" : path}`);
      for (const theme of ["light", "dark"] as const) {
        await stayActive(page, i++);
        await page.evaluate((t) => localStorage.setItem("migrent-theme", t), theme);
        await page.reload();
        await page.waitForLoadState("networkidle");
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(serious, `${path} (${theme}): ${JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.slice(0, 3).map((n) => n.target) })), null, 2)}`).toEqual([]);
      }
    }
  });

  test("the account menu at the foot of the rail opens fully on screen", async ({ page, isMobile }) => {
    test.skip(isMobile, "the rail is a desktop control");
    await page.setViewportSize({ width: 1280, height: 720 });
    await signIn(page, "renter@example.test");
    await page.getByRole("navigation", { name: "Migrent Hub" }).first().getByRole("button", { name: "Account menu" }).click();
    const menu = page.getByRole("menu", { name: "Account" });
    for (const item of ["Rental Profile", "Settings", "Back to Migrent", "Sign out"]) {
      await expect(menu.getByRole("menuitem", { name: item })).toBeInViewport({ ratio: 1 });
    }
  });

  test("no horizontal overflow on Hub admin screens", async ({ page }) => {
    await signInToPanel(page, "admin@example.test", "/admin");
    let i = 0;
    for (const path of ["/", "/admin", "/admin/listings", "/admin/listings?queue=all", "/admin/id-checks", "/admin/mentors", "/admin/support", "/admin/people", "/admin/audit"]) {
      await stayActive(page, i++);
      await page.goto(`/hub${path === "/" ? "" : path}`);
      await expect(page.getByText("Admin panel open")).toBeVisible();
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });

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
