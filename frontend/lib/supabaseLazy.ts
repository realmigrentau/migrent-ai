import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The browser Supabase client, loaded on first use.
 *
 * supabase-js (auth, database, storage and realtime) is one of the largest
 * things the site ships, and most public pages only need it to confirm a
 * sign-in in the background. Importing it through here keeps it out of the
 * first download: the header renders from the remembered session straight
 * away (hooks/useAuth.ts) and the client arrives a moment later.
 *
 * It is the same singleton as lib/supabase.ts, so modules that still import
 * that directly share one client and one session.
 */
let client: Promise<SupabaseClient> | null = null;

export function loadSupabase(): Promise<SupabaseClient> {
  if (!client) client = import("./supabase").then((m) => m.supabase);
  return client;
}
