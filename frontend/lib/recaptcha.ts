/**
 * Cloudflare Turnstile configuration.
 *
 * Supabase Auth accepts the token via `options.captchaToken`
 * on signUp / signInWithPassword calls.
 */

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
