import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

const SESSION_CACHE_KEY = "migrent_session_cache";

// Try to get cached session for instant load.
// We intentionally don't check access token expiry here - the access token
// expires every hour, but the refresh token lasts days. We use the cache
// purely for instant UI rendering; the background getSession() call will
// refresh the token or clear the session if truly invalid.
function getCachedSession(): { session: Session | null; user: User | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached);
    if (data.session && data.user) {
      return { session: data.session, user: data.user };
    }
    return null;
  } catch {
    return null;
  }
}

function setCachedSession(session: Session | null, user: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ session, user }));
    } else {
      localStorage.removeItem(SESSION_CACHE_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Listen for Supabase auth state changes.
 * Uses localStorage caching for instant initial load.
 */
export function useAuth(redirectTo?: string) {
  const router = useRouter();

  // Initialize from cache for instant render
  const cached = typeof window !== "undefined" ? getCachedSession() : null;
  const [session, setSession] = useState<Session | null>(cached?.session ?? null);
  const [user, setUser] = useState<User | null>(cached?.user ?? null);
  const [loading, setLoading] = useState(!cached);
  // True until getSession() validates/refreshes the token with Supabase.
  // Consumers that need a fresh access_token (API calls) should wait for this.
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    // Get fresh session from Supabase (refreshes expired access tokens)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setCachedSession(session, session?.user ?? null);
      setLoading(false);
      setRefreshing(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setCachedSession(session, session?.user ?? null);
      setLoading(false);
      if (session && redirectTo) {
        router.push(redirectTo);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [redirectTo, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setCachedSession(null, null);
    // Also clear dashboard cache
    localStorage.removeItem("migrent_dashboard_profile");
  };

  return { session, user, loading, refreshing, signOut };
}
