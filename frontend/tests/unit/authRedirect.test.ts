import { describe, expect, it } from "vitest";
import {
  authCallbackUrl,
  authErrorMessage,
  isRecentlyCreated,
  parseAuthCallback,
  postAuthDestination,
} from "../../lib/authRedirect";

describe("authCallbackUrl", () => {
  it("returns to /auth/callback on the origin the flow started on", () => {
    expect(authCallbackUrl("http://localhost:3000")).toBe("http://localhost:3000/auth/callback");
    expect(authCallbackUrl("https://migrent.vercel.app", "/onboarding")).toBe(
      "https://migrent.vercel.app/auth/callback?next=%2Fonboarding",
    );
  });
  it("carries extra parameters", () => {
    const url = new URL(authCallbackUrl("http://localhost:3000", "/dashboard", { polling_id: "abc" }));
    expect(url.pathname).toBe("/auth/callback");
    expect(url.searchParams.get("next")).toBe("/dashboard");
    expect(url.searchParams.get("polling_id")).toBe("abc");
  });
});

describe("parseAuthCallback", () => {
  it("reads a PKCE code and next", () => {
    const p = parseAuthCallback("http://localhost:3000/auth/callback?next=%2Fonboarding&code=a33b3db5");
    expect(p.code).toBe("a33b3db5");
    expect(p.next).toBe("/onboarding");
    expect(p.error).toBeNull();
    expect(p.tokens).toBeNull();
  });
  it("reads a token_hash link and ignores unknown types", () => {
    const ok = parseAuthCallback("https://x.test/auth/callback?token_hash=h&type=recovery");
    expect(ok.tokenHash).toBe("h");
    expect(ok.otpType).toBe("recovery");
    expect(parseAuthCallback("https://x.test/auth/callback?token_hash=h&type=bogus").otpType).toBeNull();
  });
  it("reads errors from the query or the fragment", () => {
    const q = parseAuthCallback(
      "https://x.test/auth/callback?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired",
    );
    expect(q.error).toEqual({ code: "otp_expired", description: "Email link is invalid or has expired" });
    const h = parseAuthCallback("https://x.test/#error=access_denied&error_description=Denied");
    expect(h.error).toEqual({ code: "access_denied", description: "Denied" });
  });
  it("takes implicit tokens from the fragment only", () => {
    const h = parseAuthCallback("https://x.test/auth/callback#access_token=a&refresh_token=r&type=signup");
    expect(h.tokens).toEqual({ accessToken: "a", refreshToken: "r" });
    expect(h.otpType).toBe("signup");
    expect(parseAuthCallback("https://x.test/auth/callback?access_token=a&refresh_token=r").tokens).toBeNull();
  });
});

describe("authErrorMessage", () => {
  it("explains expired links", () => {
    expect(authErrorMessage("otp_expired")).toMatch(/expired/);
    expect(authErrorMessage(undefined, "Email link is invalid or has expired")).toMatch(/expired/);
  });
  it("falls back to Supabase's description, then a generic line", () => {
    expect(authErrorMessage("something_new", "Specific reason")).toBe("Specific reason");
    expect(authErrorMessage(undefined)).toMatch(/could not sign you in/);
  });
});

describe("isRecentlyCreated", () => {
  const now = Date.parse("2026-09-26T02:00:00Z");
  it("is true inside ten minutes and false after", () => {
    expect(isRecentlyCreated("2026-09-26T01:55:00Z", now)).toBe(true);
    expect(isRecentlyCreated("2026-09-26T01:45:00Z", now)).toBe(false);
    expect(isRecentlyCreated(undefined, now)).toBe(false);
    expect(isRecentlyCreated("not a date", now)).toBe(false);
  });
});

describe("postAuthDestination", () => {
  const base = { next: null, otpType: null, onboardingCompleted: null, recentlyCreated: false } as const;

  it("sends password resets to the reset form", () => {
    expect(postAuthDestination({ ...base, otpType: "recovery" })).toBe("/reset-password");
    expect(postAuthDestination({ ...base, next: "/reset-password", onboardingCompleted: false })).toBe(
      "/reset-password",
    );
  });
  it("trusts the API's onboarding status when it answers", () => {
    expect(postAuthDestination({ ...base, onboardingCompleted: false })).toBe("/onboarding");
    expect(postAuthDestination({ ...base, next: "/onboarding", onboardingCompleted: true })).toBe("/dashboard");
    expect(postAuthDestination({ ...base, next: "/listing/abc", onboardingCompleted: true })).toBe("/listing/abc");
  });
  it("falls back to account age and the flow's next when the API is unreachable", () => {
    expect(postAuthDestination({ ...base, recentlyCreated: true })).toBe("/onboarding");
    expect(postAuthDestination({ ...base, next: "/onboarding" })).toBe("/onboarding");
    expect(postAuthDestination({ ...base })).toBe("/dashboard");
  });
  it("never follows an off-site next", () => {
    expect(postAuthDestination({ ...base, next: "https://evil.example", onboardingCompleted: true })).toBe(
      "/dashboard",
    );
    expect(postAuthDestination({ ...base, next: "//evil.example", onboardingCompleted: true })).toBe("/dashboard");
  });
});
