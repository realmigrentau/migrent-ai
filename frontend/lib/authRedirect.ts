/**
 * Where Supabase sends people back to after Google or an email link, and
 * how /auth/callback reads what it was handed.
 *
 * Every auth flow returns to /auth/callback on the origin it started on:
 *
 *  - PKCE. The browser that starts a sign-in keeps half of the secret (the
 *    code verifier) in a cookie on its own origin. The ?code= Supabase hands
 *    back cannot be redeemed anywhere else, so returning to a different host
 *    (production after starting on localhost, or the reverse) signs no one
 *    in and says nothing about it.
 *  - One page decides where a signed-in person goes next, instead of every
 *    flow landing on the homepage.
 *
 * Each URL built here must match Supabase > Authentication > URL
 * Configuration > Redirect URLs, or Supabase falls back to the Site URL.
 * Unit tests: tests/unit/authRedirect.test.ts.
 */
import { safeRedirectPath } from "./safeRedirect";

export const AUTH_CALLBACK_PATH = "/auth/callback";
export const RESET_PASSWORD_PATH = "/reset-password";
export const ONBOARDING_PATH = "/onboarding";

// Mirrors EmailOtpType in @supabase/auth-js.
const EMAIL_OTP_TYPES = ["signup", "invite", "magiclink", "recovery", "email_change", "email"] as const;
export type EmailOtpType = (typeof EMAIL_OTP_TYPES)[number];

/**
 * The URL to hand Supabase as redirectTo / emailRedirectTo.
 * `next` is where the person should end up once signed in.
 */
export function authCallbackUrl(origin: string, next?: string, extra?: Record<string, string>): string {
  const url = new URL(AUTH_CALLBACK_PATH, origin);
  if (next) url.searchParams.set("next", next);
  for (const [key, value] of Object.entries(extra ?? {})) url.searchParams.set(key, value);
  return url.toString();
}

export interface AuthCallbackParams {
  code: string | null;
  tokenHash: string | null;
  otpType: EmailOtpType | null;
  next: string | null;
  pollingId: string | null;
  /** Implicit-flow tokens. Only ever read from the fragment. */
  tokens: { accessToken: string; refreshToken: string } | null;
  error: { code: string; description: string } | null;
}

/**
 * Read the callback URL. Supabase puts PKCE results in the query string and
 * implicit-flow results (including some errors) in the fragment, so both
 * are checked. Implicit results still arrive for some emails even with PKCE
 * on: auth.resend() sends a link that returns #access_token=...
 */
export function parseAuthCallback(href: string): AuthCallbackParams {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const get = (key: string) => url.searchParams.get(key) ?? hash.get(key);

  const type = get("type");
  const errorCode = get("error_code") || get("error");
  const errorDescription = get("error_description");
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");

  return {
    code: get("code"),
    tokenHash: get("token_hash"),
    otpType: EMAIL_OTP_TYPES.includes(type as EmailOtpType) ? (type as EmailOtpType) : null,
    next: get("next"),
    pollingId: get("polling_id"),
    tokens: accessToken && refreshToken ? { accessToken, refreshToken } : null,
    error:
      errorCode || errorDescription
        ? { code: errorCode || "unknown", description: errorDescription || "" }
        : null,
  };
}

/** Supabase's error codes, in words a person can act on. */
export function authErrorMessage(code: string | undefined, description?: string): string {
  const c = (code || "").toLowerCase();
  const d = (description || "").toLowerCase();
  if (c === "otp_expired" || d.includes("expired") || d.includes("invalid or has expired")) {
    return "This link has expired or has already been used. Links only work once, so request a fresh one.";
  }
  if (c === "flow_state_not_found" || c === "flow_state_expired") {
    return "This sign-in took too long to finish. Start again and it will work.";
  }
  if (c === "bad_code_verifier" || c === "pkce_code_verifier_not_found") {
    return "This link was opened in a different browser from the one you started in. Start again in this browser.";
  }
  if (c === "access_denied") {
    return "Sign-in was cancelled before it finished.";
  }
  if (c === "user_banned") {
    return "This account has been suspended. Contact support if you think this is a mistake.";
  }
  return description || "We could not sign you in. Please try again.";
}

/** A brand-new account, by creation time. Used when the API cannot say. */
export function isRecentlyCreated(createdAt: string | undefined, now: number = Date.now()): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  return Number.isFinite(created) && now - created < 10 * 60 * 1000;
}

/**
 * Where a person goes once the callback has a session.
 *
 * `onboardingCompleted` comes from the API; null means it could not be
 * reached, and the account's age plus the `next` the flow asked for stand in.
 */
export function postAuthDestination(opts: {
  next: string | null;
  otpType: EmailOtpType | null;
  onboardingCompleted: boolean | null;
  recentlyCreated: boolean;
}): string {
  const { next, otpType, onboardingCompleted, recentlyCreated } = opts;
  if (otpType === "recovery" || next === RESET_PASSWORD_PATH) return RESET_PASSWORD_PATH;

  const needsOnboarding =
    onboardingCompleted === null ? recentlyCreated || next === ONBOARDING_PATH : !onboardingCompleted;
  if (needsOnboarding) return ONBOARDING_PATH;

  // Onboarding is done, so a sign-up flow's "next: /onboarding" no longer applies.
  return safeRedirectPath(next === ONBOARDING_PATH ? null : next);
}
