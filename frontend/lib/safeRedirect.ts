/**
 * Allow-list a post-sign-in redirect target.
 *
 * Only same-origin, absolute-path destinations survive. Protocol-relative
 * URLs (`//evil.example`), absolute URLs, backslash tricks, javascript: and
 * data: schemes, and anything with control characters fall back to the
 * dashboard. Unit tests: tests/unit/safeRedirect.test.ts.
 */

const DEFAULT = "/dashboard";
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export function safeRedirectPath(input: unknown, fallback: string = DEFAULT): string {
  if (typeof input !== "string") return fallback;
  const value = input.trim();
  if (!value || value.length > 2048) return fallback;
  // Must be an absolute path on this origin: exactly one leading slash.
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // No control characters, whitespace, encoded newlines or backslashes.
  if (CONTROL_CHARS.test(value) || /\s/.test(value) || /%0[ad]/i.test(value) || value.includes("\\")) return fallback;
  // No scheme smuggling in the first segment ("/javascript:alert(1)").
  if (/^\/[^/?#]*:/.test(value)) return fallback;
  // Never bounce back into auth pages: that loops.
  const path = value.split("?")[0].split("#")[0];
  if (/^\/(signin|signup|auth|forgot-password|reset-password|magic-link-login|magic-link-signup)(\/|$)/.test(path)) return fallback;
  return value;
}
