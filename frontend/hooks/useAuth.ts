import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

const SESSION_CACHE_KEY = "migrent_session_cache";

// Try to get cached session for instant load
function getCachedSession(): { session: Session | null; user: User | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached);
    // Check if session is expired
    if (data.session?.expires_at && data.session.expires_at * 1000 > Date.now()) {
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

  useEffect(() => {
    // Get fresh session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setCachedSession(session, session?.user ?? null);
      setLoading(false);
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

  return { session, user, loading, signOut };
}
