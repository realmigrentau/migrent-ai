import { test, expect } from "@playwright/test";

test("security headers are present on every response", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("default-src 'self'");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'self'");
  expect(h["content-security-policy"]).not.toContain("unsafe-eval");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toContain("camera=()");
  expect(h["cross-origin-opener-policy"]).toBe("same-origin-allow-popups");
});

test("old signed-in pages redirect into Migrent Hub", async ({ request }) => {
  const moved: [string, string][] = [
    ["/dashboard", "/hub"],
    ["/messages", "/hub/messages"],
    ["/owner/listings", "/hub/properties"],
    ["/owner/listings/new", "/hub/properties/new"],
    ["/account/settings", "/hub/settings"],
    ["/seeker/wishlist", "/hub/saved"],
    ["/onboarding", "/hub/welcome"],
    ["/signin", "/hub/sign-in"],
  ];
  for (const [path, to] of moved) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(307);
    expect(new URL(res.headers()["location"], "http://x").pathname, path).toBe(to);
  }
});

test("private pages need a session, and admin is hidden", async ({ request }) => {
  // Hub pages go to Hub sign-in and come back to the same page.
  const hub = await request.get("/hub/applications?tab=shortlisted", { maxRedirects: 0 });
  expect(hub.status()).toBe(307);
  const loc = new URL(hub.headers()["location"], "http://x");
  expect(loc.pathname).toBe("/hub/sign-in");
  expect(loc.searchParams.get("next")).toBe("/applications?tab=shortlisted");
  expect(hub.headers()["x-robots-tag"] ?? "").toContain("noindex");

  // Site pages that still need a session return there after Hub sign-in.
  const site = await request.get("/booking-success", { maxRedirects: 0 });
  expect(site.status()).toBe(307);
  const back = new URL(site.headers()["location"], "http://x");
  expect(back.pathname).toBe("/hub/sign-in");
  expect(back.searchParams.get("return")).toBe("/booking-success");

  // The old admin console is retired: its addresses go to the Hub's Admin
  // panel, which needs a session like every other Hub page.
  const admin = await request.get("/admin/overview", { maxRedirects: 0 });
  expect(admin.status()).toBe(307);
  expect(new URL(admin.headers()["location"], "http://x").pathname).toBe("/hub/admin");
});

test("sign-in destinations cannot leave the origin", async ({ page }) => {
  await page.goto("/hub/sign-in?next=https://evil.example&return=//evil.example");
  const html = await page.content();
  expect(html).not.toContain('href="https://evil.example');
  expect(html).not.toContain('href="//evil.example');
});

test("email relay refuses anonymous callers", async ({ request }) => {
  const res = await request.post("/api/emails/send", { data: { type: "welcome", to: "victim@example.com" } });
  expect(res.status()).toBe(401);
  const suite = await request.post("/api/emails/welcome-suite", { data: { email: "victim@example.com" } });
  expect(suite.status()).toBe(401);
  const admin = await request.post("/api/admin/verify", { data: { username: "a", password: "b" } });
  expect(admin.status()).toBe(401);
});

test("no secrets in the client bundle", async ({ request }) => {
  const res = await request.get("/");
  const html = await res.text();
  const chunks = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g)].map((m) => m[1]);
  expect(chunks.length).toBeGreaterThan(0);
  const patterns = [/sk_live_[A-Za-z0-9]{8,}/, /sk_test_[A-Za-z0-9]{8,}/, /whsec_[A-Za-z0-9]{8,}/, /service_role/i, /SUPABASE_SERVICE_ROLE_KEY/];
  for (const chunk of chunks.slice(0, 40)) {
    const js = await (await request.get(chunk)).text();
    for (const p of patterns) expect(js, `${p} in ${chunk}`).not.toMatch(p);
  }
});

test("security.txt is served", async ({ request }) => {
  const res = await request.get("/.well-known/security.txt");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("Contact: mailto:");
});
