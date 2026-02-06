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

/**
 * Hook for managing dashboard role state.
 * Fetches the user's role from their profile and provides methods to update it.
 *
 * What this does:
 * - Checks if the user has already chosen "seeker" or "owner"
 * - Returns the user's display name (first name or email)
 * - Provides a function to set/change the user's role
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
      if (!session) {
        setState((prev) => ({ ...prev, loading: false, profileLoaded: true }));
        return;
      }

      try {
        const profile = await getMyProfile(session.access_token);

        // Get display name: prefer preferred_name, then name, then email
        const displayName =
          profile?.preferred_name ||
          profile?.name ||
          user?.email?.split("@")[0] ||
          null;

        // Get role from profile table first, then fall back to user_metadata.type from signup
        const metadataType = user?.user_metadata?.type;
        const validMetadataRole = metadataType === "seeker" || metadataType === "owner" ? metadataType : null;
        const role: UserRole = profile?.role || validMetadataRole;

        setState({
          role,
          loading: false,
          profileLoaded: true,
          displayName,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setState((prev) => ({ ...prev, loading: false, profileLoaded: true }));
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
      if (!session) return false;

      try {
        const result = await updateMyProfile(session.access_token, {
          role: newRole,
        });

        if (result) {
          setState((prev) => ({ ...prev, role: newRole }));
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to update role:", err);
        return false;
      }
    },
    [session]
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

  return {
    ...state,
    isAuthenticated: !!session,
    user,
    session,
    authLoading,
    setRole,
    goToRoleDashboard,
  };
}
