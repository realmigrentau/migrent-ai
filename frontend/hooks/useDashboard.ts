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

function getCachedProfile(userId: string): CachedProfile | null {
  if (typeof window === "undefined") return null;
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
    const data: CachedProfile = { userId, role, displayName, timestamp: Date.now() };
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

/**
 * Hook for managing dashboard role state.
 * Fetches the user's role from their profile and provides methods to update it.
 * Uses localStorage caching for fast page loads.
 */
export function useDashboard() {
  const { session, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [state, setState] = useState<DashboardState>({
    role: null,
    loading: true,
    profileLoaded: false,
    displayName: null,
  });

  // Fetch profile and role when session is available
  useEffect(() => {
    async function fetchProfile() {
      if (!session || !user) {
        setState((prev) => ({ ...prev, loading: false, profileLoaded: true }));
        return;
      }

      const userId = user.id;

      // Check cache first for instant load
      const cached = getCachedProfile(userId);
      if (cached) {
        setState({
          role: cached.role,
          loading: false,
          profileLoaded: true,
          displayName: cached.displayName,
        });
        // Still fetch in background to keep cache fresh
        fetchAndUpdateProfile(userId, false);
        return;
      }

      // No cache, fetch and show loading
      await fetchAndUpdateProfile(userId, true);
    }

    async function fetchAndUpdateProfile(userId: string, showLoading: boolean) {
      try {
        const profile = await getMyProfile(session!.access_token);

        // Get display name: prefer preferred_name, then name, then email
        const displayName =
          profile?.preferred_name ||
          profile?.name ||
          user?.email?.split("@")[0] ||
          null;

        // Get role from profile table first, then fall back to user_metadata.type from signup
        // Only accept "seeker" or "owner" as valid roles
        const profileRole = profile?.role;
        const validProfileRole = profileRole === "seeker" || profileRole === "owner" ? profileRole : null;
        const metadataType = user?.user_metadata?.type;
        const validMetadataRole = metadataType === "seeker" || metadataType === "owner" ? metadataType : null;
        const role: UserRole = validProfileRole || validMetadataRole;

        // Update cache
        setCachedProfile(userId, role, displayName);

        setState({
          role,
          loading: false,
          profileLoaded: true,
          displayName,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        if (showLoading) {
          setState((prev) => ({ ...prev, loading: false, profileLoaded: true }));
        }
      }
    }

    if (!authLoading) {
      fetchProfile();
    }
  }, [session, user, authLoading]);

  /**
   * Set the user's role (seeker or owner).
   * This saves the role to their profile in the database.
   */
  const setRole = useCallback(
    async (newRole: "seeker" | "owner") => {
      if (!session || !user) return false;

      try {
        const result = await updateMyProfile(session.access_token, {
          role: newRole,
        });

        if (result) {
          // Update state and cache immediately
          setState((prev) => ({ ...prev, role: newRole }));
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

  /**
   * Navigate to the appropriate dashboard based on role.
   */
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

  /**
   * Clear the profile cache (useful for sign out).
   */
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
