import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
    "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

/**
 * Browser-side Supabase client using @supabase/ssr.
 * Stores auth tokens in cookies (readable by the proxy) and localStorage.
 *
 * NEXT_PUBLIC_AUTH_COOKIE_DOMAIN (e.g. ".migrent.com.au") widens the auth
 * cookie to every subdomain, so the public site and Migrent Hub on
 * hub.migrent.com.au share one sign-in. Leave it unset on *.vercel.app:
 * that is a public suffix and browsers refuse cookies scoped to it.
 */
const cookieDomain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN || undefined;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, cookieDomain ? { cookieOptions: { domain: cookieDomain } } : undefined);
