import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { getMyProfile, updateMyProfile, uploadProfilePhoto } from "../lib/api";

/**
 * Canonical profile type - single source of truth for all profile data.
 * Used by: settings, dashboard owner-profile, dashboard seeker-profile, public profile.
 */
export interface Profile {
  id: string;
  name: string;
  email: string;
  role?: string;
  legal_name?: string;
  preferred_name?: string;
  phone?: string;
  phones?: string[];
  residential_address?: any;
  suburb_city?: string;
  nearest_station?: string;
  emergency_contact?: any;
  about_me?: string;
  bio?: string;
  interests?: string[];
  most_useless_skill?: string;
  preferred_language?: string;
  preferred_currency?: string;
  timezone?: string;
  identity_verified?: boolean;
  identity_verification_url?: string;
  phone_verified?: boolean;
  email_verified?: boolean;
  gov_id_verified?: boolean;
  is_verified?: boolean;
  verified_date?: string;
  custom_pfp?: string;
  social_twitter?: string;
  social_facebook?: string;
  social_linkedin?: string;
  social_discord?: string;
  location?: string;
  created_at?: string;
  badges?: string[];
  rooms_owned?: number;
  properties_owned?: number;
  average_rating?: number;
  reviews_count?: number;
  months_hosting?: number;
  wishlist?: string[];
  lifestyle?: string[];
  occupation?: string;
  age?: string;
  visa_type?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_suburbs?: string;
  move_in_date?: string;
  notify_email?: boolean;
  notify_sms?: boolean;
  onboarding_completed?: boolean;
}

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  /** Refresh profile from server */
  refresh: () => Promise<void>;
  /** Update profile fields - writes to Supabase via backend */
  update: (data: Record<string, any>) => Promise<boolean>;
  /** Upload profile photo - writes to Supabase storage */
  uploadPhoto: (file: File) => Promise<string | null>;
  /** Computed display name */
  displayName: string;
  /** Whether the user is an owner */
  isOwner: boolean;
}

/**
 * Single source of truth for the current user's profile.
 * Every page that needs profile data should use this hook.
 */
export function useProfile(): UseProfileReturn {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProfile(session.access_token);
      if (data) {
        setProfile({
          ...data,
          email: data.email || user?.email || "",
        });
      }
    } catch (err) {
      console.error("useProfile fetch error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, user?.email]);

  // Fetch on mount
  useEffect(() => {
    if (session?.access_token && user?.id && !fetchedRef.current) {
      fetchedRef.current = true;
      refresh();
    }
  }, [session?.access_token, user?.id, refresh]);

  const update = useCallback(
    async (data: Record<string, any>): Promise<boolean> => {
      if (!session?.access_token) return false;
      setSaving(true);
      try {
        const result = await updateMyProfile(session.access_token, data);
        if (result) {
          // Merge the returned data into the local profile
          setProfile((prev) => (prev ? { ...prev, ...result } : prev));
          return true;
        }
        return false;
      } catch (err) {
        console.error("useProfile update error:", err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [session?.access_token]
  );

  const uploadPhotoFn = useCallback(
    async (file: File): Promise<string | null> => {
      if (!session?.access_token) return null;
      setSaving(true);
      try {
        const url = await uploadProfilePhoto(session.access_token, file);
        if (url) {
          setProfile((prev) => (prev ? { ...prev, custom_pfp: url } : prev));
          return url;
        }
        return null;
      } catch {
        return null;
      } finally {
        setSaving(false);
      }
    },
    [session?.access_token]
  );

  const displayName =
    profile?.preferred_name ||
    profile?.legal_name ||
    profile?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const isOwner = profile?.role === "owner";

  return {
    profile,
    loading,
    saving,
    error,
    refresh,
    update,
    uploadPhoto: uploadPhotoFn,
    displayName,
    isOwner,
  };
}
