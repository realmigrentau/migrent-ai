import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./useAuth";
import { getMyProfile, updateMyProfile } from "../lib/api";

export type UserRole = "seeker" | "owner" | null;

interface DashboardState {
  role: UserRole;
  loading: boolean;
  profileLoaded: boolean;
  displayName: string | null;
}

interface CachedProfile {
  role: UserRole;
  displayName: string | null;
  userId: string;
  timestamp: number;
}

const CACHE_KEY = "migrent_dashboard_profile";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedProfile(userId: string | null): CachedProfile | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CachedProfile = JSON.parse(cached);
    // Check if cache is for same user and not expired
    if (data.userId === userId && Date.now() - data.timestamp < CACHE_TTL) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

function setCachedProfile(userId: string, role: UserRole, displayName: string | null) {
  if (typeof window === "undefined") return;
  try {
    const data: CachedProfile = { userId: userId, role, displayName, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

function clearCachedProfile() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore
  }
}

// Try to get initial state from cache (runs once at module load)
function getInitialState(): DashboardState {
  if (typeof window === "undefined") {
    return { role: null, loading: true, profileLoaded: false, displayName: null };
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedProfile = JSON.parse(cached);
      // If cache exists and isn't too old, use it for initial state
      if (Date.now() - data.timestamp < CACHE_TTL) {
        return {
          role: data.role,
          loading: false,
          profileLoaded: true,
          displayName: data.displayName,
        };
      }
    }
  } catch {
    // Ignore
  }

  return { role: null, loading: true, profileLoaded: false, displayName: null };
}

/**
 * Hook for managing dashboard role state.
 * Fetches the user's role from their profile and provides methods to update it.
 * Uses localStorage caching for fast page loads.
 */
export function useDashboard() {
  const { session, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Initialize from cache for instant render
  const [state, setState] = useState<DashboardState>(getInitialState);

  // Verify cache matches current user and fetch fresh data
  useEffect(() => {
    async function fetchProfile() {
      if (!session || !user) {
        setState({ role: null, loading: false, profileLoaded: true, displayName: null });
        return;
      }

      const userId = user.id;

      // Check if cached data is for current user
      const cached = getCachedProfile(userId);
      if (cached) {
        // Cache is valid for this user, use it immediately
        setState({
          role: cached.role,
          loading: false,
          profileLoaded: true,
          displayName: cached.displayName,
        });
        // Refresh in background
        fetchAndUpdateProfile(userId, false);
      } else {
        // No valid cache, need to fetch
        // But first check if we already have state from getInitialState that doesn't match user
        setState(prev => ({ ...prev, loading: true }));
        await fetchAndUpdateProfile(userId, true);
      }
    }

    async function fetchAndUpdateProfile(userId: string, updateLoading: boolean) {
      try {
        const profile = await getMyProfile(session!.access_token);

        const displayName =
          profile?.preferred_name ||
          profile?.name ||
          user?.email?.split("@")[0] ||
          null;

        const profileRole = profile?.role;
        const validProfileRole = profileRole === "seeker" || profileRole === "owner" ? profileRole : null;
        const metadataType = user?.user_metadata?.type;
        const validMetadataRole = metadataType === "seeker" || metadataType === "owner" ? metadataType : null;
        const role: UserRole = validProfileRole || validMetadataRole;

        setCachedProfile(userId, role, displayName);

        setState({
          role,
          loading: false,
          profileLoaded: true,
          displayName,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        if (updateLoading) {
          setState(prev => ({ ...prev, loading: false, profileLoaded: true }));
        }
      }
    }

    if (!authLoading) {
      fetchProfile();
    }
  }, [session, user, authLoading]);

  const setRole = useCallback(
    async (newRole: "seeker" | "owner") => {
      if (!session || !user) return false;

      try {
        const result = await updateMyProfile(session.access_token, {
          role: newRole,
        });

        if (result) {
          setState(prev => ({ ...prev, role: newRole }));
          setCachedProfile(user.id, newRole, state.displayName);
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to update role:", err);
        return false;
      }
    },
    [session, user, state.displayName]
  );

  const goToRoleDashboard = useCallback(
    (role: "seeker" | "owner") => {
      if (role === "seeker") {
        router.push("/dashboard/seeker");
      } else {
        router.push("/dashboard/owner");
      }
    },
    [router]
  );

  const clearCache = useCallback(() => {
    clearCachedProfile();
  }, []);

  return {
    ...state,
    isAuthenticated: !!session,
    user,
    session,
    authLoading,
    setRole,
    goToRoleDashboard,
    clearCache,
  };
}
