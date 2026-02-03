/**
 * hCaptcha configuration for Supabase Auth.
 *
 * Supabase accepts the token via `options.captchaToken`
 * on signUp / signInWithPassword calls.
 */

export const HCAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";
