import { useDashboard } from "./useDashboard";

/**
 * Lightweight hook to check if the current user is a signed-in owner.
 */
export function useOwner() {
  const { role, loading, isAuthenticated, authLoading } = useDashboard();

  return {
    isOwner: isAuthenticated && role === "owner",
    isAuthenticated,
    loading: loading || authLoading,
  };
}
