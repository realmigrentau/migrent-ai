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

test("private routes redirect to sign-in and admin is hidden", async ({ request }) => {
  for (const path of ["/dashboard", "/messages", "/owner/listings", "/account/settings", "/onboarding", "/booking-success"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(307);
    expect(res.headers()["location"]).toContain("/signin?redirect=");
  }
  const admin = await request.get("/admin/overview", { maxRedirects: 0 });
  expect(admin.status()).toBe(307);
});

test("redirect parameter cannot leave the origin", async ({ page }) => {
  await page.goto("/signin?redirect=https://evil.example");
  // The page keeps the value only if it is a same-origin path.
  const html = await page.content();
  expect(html).not.toContain('href="https://evil.example');
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
