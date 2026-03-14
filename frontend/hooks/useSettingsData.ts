import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { useTheme } from "./useTheme";
import {
  getMyProfile,
  updateMyProfile,
  listTickets,
  createVerificationSession,
  type Ticket,
} from "../lib/api";
import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────
export type SettingsTab =
  | "account"
  | "verification"
  | "profile"
  | "notifications"
  | "payments"
  | "analytics"
  | "preferences"
  | "support";

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  role?: string;
  legal_name?: string;
  preferred_name?: string;
  phone?: string;
  phones?: string[];
  residential_address?: any;
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
  average_rating?: number;
  reviews_count?: number;
  months_hosting?: number;
  wishlist?: string[];
  lifestyle?: string[];
  occupation?: string;
  age?: string;
}

export interface NotificationPrefs {
  email_bookings: boolean;
  email_payments: boolean;
  email_verification: boolean;
  email_messages: boolean;
  email_weekly_summary: boolean;
  push_matches: boolean;
  push_host_responses: boolean;
  push_new_listings: boolean;
}

export interface SessionInfo {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

// ─── Verification Progress ────────────────────────────────────────
export function computeVerificationProgress(profile: ProfileData | null): {
  percentage: number;
  steps: { label: string; done: boolean; icon: string }[];
} {
  if (!profile) return { percentage: 0, steps: [] };

  const steps = [
    { label: "Email Verified", done: !!profile.email_verified || !!profile.email, icon: "📧" },
    { label: "Phone Verified", done: !!profile.phone_verified || !!(profile.phones?.length || profile.phone), icon: "📱" },
    { label: "Profile Photo", done: !!profile.custom_pfp, icon: "📸" },
    { label: "About Me", done: !!(profile.about_me || profile.bio), icon: "📝" },
    { label: "Government ID", done: !!profile.gov_id_verified || !!profile.identity_verified, icon: "🪪" },
    { label: "Address Added", done: !!profile.residential_address, icon: "🏠" },
    { label: "Interests Added", done: !!(profile.interests && profile.interests.length > 0), icon: "🎯" },
    { label: "Social Links", done: !!(profile.social_twitter || profile.social_linkedin || profile.social_discord), icon: "🔗" },
  ];

  const done = steps.filter((s) => s.done).length;
  const percentage = Math.round((done / steps.length) * 100);

  return { percentage, steps };
}

// ─── Default notification preferences ────────────────────────────
const defaultNotifPrefs: NotificationPrefs = {
  email_bookings: true,
  email_payments: true,
  email_verification: true,
  email_messages: true,
  email_weekly_summary: true,
  push_matches: true,
  push_host_responses: true,
  push_new_listings: false,
};

// ─── Main hook ───────────────────────────────────────────────────
export function useSettingsData() {
  const { session, user, loading: authLoading, signOut } = useAuth();
  const { theme, setTheme, toggle: toggleTheme } = useTheme();

  // Core state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" }>({
    text: "",
    type: "info",
  });

  // Active tab
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Notifications preferences (local state)
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(defaultNotifPrefs);

  // Support tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  // Google connected & password status
  const [googleConnected, setGoogleConnected] = useState(false);
  const [isGoogleOnlyUser, setIsGoogleOnlyUser] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);

  // Ref to prevent double-fetches
  const fetchedRef = useRef(false);

  // ─── Fetch Profile ──────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!session?.access_token) return;
    setLoadingProfile(true);
    try {
      const data = await getMyProfile(session.access_token);
      if (data) {
        setProfile(data);

        // Load saved notification prefs from profile or localStorage
        const savedNotifs = localStorage.getItem("migrent_notif_prefs");
        if (savedNotifs) {
          try {
            setNotifPrefs({ ...defaultNotifPrefs, ...JSON.parse(savedNotifs) });
          } catch { /* use defaults */ }
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      showMessage("Failed to load profile data", "error");
    } finally {
      setLoadingProfile(false);
    }
  }, [session?.access_token]);

  // ─── Check OAuth ────────────────────────────────────────────
  const checkOAuth = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser?.app_metadata?.providers?.includes("google")) {
        setGoogleConnected(true);
      }
      // Check if user is Google-only (no email/password login)
      const providers = authUser?.app_metadata?.providers || [];
      const provider = authUser?.app_metadata?.provider || "email";
      if (provider === "google" && !providers.includes("email")) {
        setIsGoogleOnlyUser(true);
        setHasPassword(false);
      }
    } catch { /* ignore */ }
  }, []);

  // ─── Generate mock sessions ─────────────────────────────────
  const generateSessions = useCallback(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isMac = ua.includes("Mac");
    const isMobile = /iPhone|Android/i.test(ua);

    const currentSession: SessionInfo = {
      id: "current",
      device: isMobile ? "Mobile Browser" : isMac ? "MacBook Pro" : "Desktop Browser",
      location: "Sydney, Australia",
      lastActive: "Active now",
      current: true,
    };

    setSessions([currentSession]);
  }, []);

  // ─── Fetch Tickets ──────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    if (!session?.access_token) return;
    setTicketsLoading(true);
    try {
      const data = await listTickets(session.access_token);
      if (data?.tickets) {
        setTickets(data.tickets);
      }
    } catch { /* ignore */ }
    finally {
      setTicketsLoading(false);
    }
  }, [session?.access_token]);

  // ─── Init ──────────────────────────────────────────────────
  useEffect(() => {
    if (session && user?.id && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchProfile();
      checkOAuth();
      generateSessions();
    }
  }, [session, user?.id, fetchProfile, checkOAuth, generateSessions]);

  // ─── Lazy-load tickets when support tab is active ───────────
  useEffect(() => {
    if (activeTab === "support" && tickets.length === 0 && !ticketsLoading) {
      fetchTickets();
    }
  }, [activeTab, tickets.length, ticketsLoading, fetchTickets]);

  // ─── Show message helper ────────────────────────────────────
  const showMessage = useCallback(
    (text: string, type: "success" | "error" | "info" = "info") => {
      setMessage({ text, type });
      setTimeout(() => setMessage({ text: "", type: "info" }), 4000);
    },
    []
  );

  // ─── Update Profile ─────────────────────────────────────────
  const updateProfile = useCallback(
    async (data: Record<string, any>) => {
      if (!session?.access_token) return false;
      setSaving(true);
      try {
        const result = await updateMyProfile(session.access_token, data);
        if (result) {
          setProfile((prev) => (prev ? { ...prev, ...data } : prev));
          showMessage("Saved successfully! ✨", "success");
          return true;
        } else {
          showMessage("Failed to save changes", "error");
          return false;
        }
      } catch (err) {
        console.error("Update profile error:", err);
        showMessage("Failed to save changes", "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [session?.access_token, showMessage]
  );

  // ─── Change Password ────────────────────────────────────────
  const changePassword = useCallback(
    async (newPassword: string) => {
      setSaving(true);
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          showMessage(error.message, "error");
          return false;
        }
        showMessage("Password changed successfully!", "success");
        return true;
      } catch (err) {
        showMessage("Failed to change password", "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [showMessage]
  );

  const setNewPassword = useCallback(
    async (password: string) => {
      setSaving(true);
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          showMessage(error.message, "error");
          return false;
        }
        showMessage("Password set successfully! You can now use it to sign in and confirm actions.", "success");
        setHasPassword(true);
        return true;
      } catch (err) {
        showMessage("Failed to set password", "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [showMessage]
  );

  // ─── Delete Account ─────────────────────────────────────────
  const deleteAccount = useCallback(async () => {
    if (!session?.access_token) return false;
    setSaving(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${BASE_URL}/account/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        showMessage("Account deleted. Signing out...", "info");
        setTimeout(async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }, 1500);
        return true;
      } else {
        const error = await res.json();
        showMessage(error.detail || "Failed to delete account", "error");
        return false;
      }
    } catch (err) {
      showMessage("Failed to delete account", "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [session?.access_token, showMessage]);

  // ─── Upload Profile Photo ──────────────────────────────────
  const uploadPhoto = useCallback(
    async (file: File) => {
      if (!session?.access_token || !user?.id) return null;
      setSaving(true);
      try {
        const { uploadProfilePhoto } = await import("../lib/api");
        const url = await uploadProfilePhoto(session.access_token, file);
        if (url) {
          setProfile((prev) => (prev ? { ...prev, custom_pfp: url } : prev));
          showMessage("Photo updated! 📸", "success");
          return url;
        }
        showMessage("Failed to upload photo", "error");
        return null;
      } catch {
        showMessage("Failed to upload photo", "error");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [session?.access_token, user?.id, showMessage]
  );

  // ─── Notification prefs ─────────────────────────────────────
  const updateNotifPrefs = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      setNotifPrefs((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem("migrent_notif_prefs", JSON.stringify(updated));
        return updated;
      });
      showMessage("Notification preference saved", "success");
    },
    [showMessage]
  );

  // ─── Start ID Verification ──────────────────────────────────
  const startIdVerification = useCallback(async () => {
    if (!session?.access_token) return null;
    setSaving(true);
    try {
      const result = await createVerificationSession(session.access_token, "full");
      if (result?.url) {
        return result.url;
      }
      showMessage("Failed to start verification", "error");
      return null;
    } catch {
      showMessage("Failed to start verification", "error");
      return null;
    } finally {
      setSaving(false);
    }
  }, [session?.access_token, showMessage]);

  // ─── Computed values ────────────────────────────────────────
  const verificationProgress = computeVerificationProgress(profile);
  const isOwner = profile?.role === "owner";
  const displayName =
    profile?.preferred_name || profile?.legal_name || profile?.name || user?.email?.split("@")[0] || "User";

  return {
    // Auth
    session,
    user,
    authLoading,
    signOut,
    // Theme
    theme,
    setTheme,
    toggleTheme,
    // Profile
    profile,
    loadingProfile,
    saving,
    message,
    fetchProfile,
    updateProfile,
    uploadPhoto,
    // Tab
    activeTab,
    setActiveTab,
    // Computed
    verificationProgress,
    isOwner,
    displayName,
    // Security
    changePassword,
    setNewPassword,
    deleteAccount,
    googleConnected,
    isGoogleOnlyUser,
    hasPassword,
    sessions,
    // Notifications
    notifPrefs,
    updateNotifPrefs,
    // Tickets
    tickets,
    ticketsLoading,
    fetchTickets,
    // Verification
    startIdVerification,
    // Show message
    showMessage,
  };
}
