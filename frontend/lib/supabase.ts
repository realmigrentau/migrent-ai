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
 * Stores auth tokens in cookies (readable by middleware)
 * AND localStorage (for backward compatibility).
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
