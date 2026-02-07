import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./useAuth";
import { getMyProfile, updateMyProfile } from "../lib/api";

export type UserRole = "seeker" | "owner" | null;

interface DashboardState {
  role: UserRole;
  loading: boolean;
  profileLoaded: boolean;
  displayName: string | null;
  profilePhoto: string | null;
}

interface CachedProfile {
  role: UserRole;
  displayName: string | null;
  profilePhoto: string | null;
  userId: string;
  timestamp: number;
}

const CACHE_KEY = "migrent_dashboard_profile";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const ROLE_CHANGE_EVENT = "migrent_role_changed";

function getCachedProfile(): CachedProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CachedProfile = JSON.parse(cached);
    if (Date.now() - data.timestamp < CACHE_TTL) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

function setCachedProfile(userId: string, role: UserRole, displayName: string | null, profilePhoto: string | null = null) {
  if (typeof window === "undefined") return;
  try {
    const data: CachedProfile = { userId, role, displayName, profilePhoto, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    // Dispatch event to notify other hook instances
    window.dispatchEvent(new CustomEvent(ROLE_CHANGE_EVENT, { detail: { role, displayName, profilePhoto } }));
  } catch {
    // Ignore
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
 * Uses aggressive caching for instant page loads.
 */
export function useDashboard() {
  const { session, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const hasFetched = useRef(false);

  // Initialize from cache immediately
  const cached = typeof window !== "undefined" ? getCachedProfile() : null;
  const [state, setState] = useState<DashboardState>(() => {
    if (cached) {
      return {
        role: cached.role,
        loading: false,
        profileLoaded: true,
        displayName: cached.displayName,
        profilePhoto: cached.profilePhoto || null,
      };
    }
    return { role: null, loading: true, profileLoaded: false, displayName: null, profilePhoto: null };
  });

  // Listen for role changes from other hook instances
  useEffect(() => {
    const handleRoleChange = (event: CustomEvent<{ role: UserRole; displayName: string | null; profilePhoto?: string | null }>) => {
      setState(prev => ({
        ...prev,
        role: event.detail.role,
        displayName: event.detail.displayName ?? prev.displayName,
        profilePhoto: event.detail.profilePhoto ?? prev.profilePhoto,
      }));
    };

    window.addEventListener(ROLE_CHANGE_EVENT, handleRoleChange as EventListener);
    return () => {
      window.removeEventListener(ROLE_CHANGE_EVENT, handleRoleChange as EventListener);
    };
  }, []);

  useEffect(() => {
    // Skip if already fetched this session
    if (hasFetched.current) return;

    async function fetchProfile() {
      if (authLoading) return;

      if (!session || !user) {
        setState({ role: null, loading: false, profileLoaded: true, displayName: null, profilePhoto: null });
        return;
      }

      const userId = user.id;
      const existingCache = getCachedProfile();

      // If cache matches current user, use it and skip API call
      if (existingCache && existingCache.userId === userId) {
        setState({
          role: existingCache.role,
          loading: false,
          profileLoaded: true,
          displayName: existingCache.displayName,
          profilePhoto: existingCache.profilePhoto || null,
        });
        hasFetched.current = true;
        return;
      }

      // Need to fetch from API
      try {
        const profile = await getMyProfile(session.access_token);

        const displayName =
          profile?.preferred_name ||
          profile?.name ||
          user?.email?.split("@")[0] ||
          null;

        const profilePhoto = profile?.custom_pfp || null;

        const profileRole = profile?.role;
        const validProfileRole = profileRole === "seeker" || profileRole === "owner" ? profileRole : null;
        const metadataType = user?.user_metadata?.type;
        const validMetadataRole = metadataType === "seeker" || metadataType === "owner" ? metadataType : null;
        const role: UserRole = validProfileRole || validMetadataRole;

        setCachedProfile(userId, role, displayName, profilePhoto);
        hasFetched.current = true;

        setState({
          role,
          loading: false,
          profileLoaded: true,
          displayName,
          profilePhoto,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setState(prev => ({ ...prev, loading: false, profileLoaded: true }));
      }
    }

    fetchProfile();
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
          setCachedProfile(user.id, newRole, state.displayName, state.profilePhoto);
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
    hasFetched.current = false;
  }, []);

  const updateProfilePhoto = useCallback((newPhoto: string | null) => {
    if (!user) return;
    setState(prev => ({ ...prev, profilePhoto: newPhoto }));
    setCachedProfile(user.id, state.role, state.displayName, newPhoto);
  }, [user, state.role, state.displayName]);

  return {
    ...state,
    isAuthenticated: !!session,
    user,
    session,
    authLoading,
    setRole,
    goToRoleDashboard,
    clearCache,
    updateProfilePhoto,
  };
}
