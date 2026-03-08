import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { getListings, getMyProfile, refreshBadges } from "../lib/api";

// ── Types ──
export interface DashboardMetrics {
  activeListings: number;
  totalRevenue: number;
  responseRate: number;
  occupancyRate: number;
  newInquiries: number;
  conversionRate: number;
}

export interface ActivityItem {
  id: string;
  type: "booking" | "payment" | "verification" | "inquiry" | "listing";
  icon: string;
  title: string;
  description: string;
  time: string;
  status: "success" | "warning" | "info" | "pending";
}

export interface ProfileData {
  name: string;
  bio: string;
  occupation: string;
  photo: string | null;
  badges: string[];
  interests: string[];
  lifestyle: string[];
  uselessSkill: string;
  // Seeker-specific
  age: string;
  visaType: string;
  budgetMin: string;
  budgetMax: string;
  preferredSuburbs: string;
  moveInDate: string;
  // Owner-specific
  phone: string;
  roomsOwned: number;
  propertiesOwned: number;
  // Verification (derived)
  emailVerified: boolean;
  idVerified: boolean;
  // Completeness
  completionPercent: number;
  missingFields: string[];
}

export interface DashboardData {
  metrics: DashboardMetrics;
  activity: ActivityItem[];
  listings: any[];
  profile: ProfileData | null;
}

// ── Cache (in-memory + localStorage for instant loads across sessions) ──
const LS_CACHE_KEY = "migrent_dashboard_data";
const CACHE_TTL = 5 * 60 * 1000; // 5 min for in-memory
const LS_CACHE_TTL = 30 * 60 * 1000; // 30 min for localStorage (stale-while-revalidate)

let cachedData: DashboardData | null = null;
let cacheTimestamp = 0;

function isCacheValid(): boolean {
  return cachedData !== null && Date.now() - cacheTimestamp < CACHE_TTL;
}

function loadFromLocalStorage(): DashboardData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < LS_CACHE_TTL && data) {
      return data as DashboardData;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToLocalStorage(data: DashboardData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore quota errors
  }
}

// ── Generate activity based on real listings + profile state ──
function generateActivity(listings: any[], profile: ProfileData | null): ActivityItem[] {
  const now = Date.now();
  const activities: ActivityItem[] = [];

  // Listing-based activity
  if (listings.length > 0) {
    listings.slice(0, 3).forEach((l, i) => {
      activities.push({
        id: `listing-${i}`,
        type: "listing",
        icon: "building",
        title: `Listing active: ${l.title || l.address || "Property"}`,
        description: l.city ? `${l.city} ${l.postcode || ""}` : "Your listing is live",
        time: formatTimeAgo(now - (i + 1) * 3600000),
        status: "success",
      });
    });
  }

  // Profile-aware activity items
  if (profile) {
    if (profile.completionPercent < 100) {
      const nextMissing = profile.missingFields[0];
      activities.push({
        id: "profile-incomplete",
        type: "inquiry",
        icon: "user",
        title: `Profile ${profile.completionPercent}% complete`,
        description: nextMissing ? `Add your ${nextMissing.toLowerCase()} to improve visibility` : "A few more fields to fill",
        time: "Action needed",
        status: "warning",
      });
    }

    if (!profile.photo) {
      activities.push({
        id: "no-photo",
        type: "inquiry",
        icon: "camera",
        title: "Add a profile photo",
        description: "Profiles with photos get 5x more engagement",
        time: "Tip",
        status: "info",
      });
    }

    if (!profile.idVerified) {
      activities.push({
        id: "verify-id",
        type: "verification",
        icon: "shield",
        title: "Verify your identity",
        description: "Verified profiles get 3x more responses",
        time: "Recommended",
        status: "pending",
      });
    }

    if (profile.badges.length > 0) {
      activities.push({
        id: "badges-earned",
        type: "verification",
        icon: "trophy",
        title: `${profile.badges.length} badge${profile.badges.length > 1 ? "s" : ""} earned`,
        description: "Your badges are visible on your profile",
        time: formatTimeAgo(now - 7200000),
        status: "success",
      });
    }
  } else if (listings.length === 0) {
    activities.push({
      id: "welcome",
      type: "inquiry",
      icon: "sparkles",
      title: "Welcome to MigRent!",
      description: "Complete your profile to get started",
      time: "Just now",
      status: "info",
    });
  }

  return activities;
}

function formatTimeAgo(ms: number): string {
  const now = Date.now();
  const diff = now - ms;
  if (diff < 0) return "Just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function computeMetrics(listings: any[]): DashboardMetrics {
  const activeListings = listings.length;
  const totalRevenue = listings.reduce((sum, l) => {
    const price = l.weekly_price || l.weeklyPrice || 0;
    return sum + price * 4; // monthly estimate
  }, 0);

  return {
    activeListings,
    totalRevenue: Math.round(totalRevenue),
    responseRate: activeListings > 0 ? 95 : 0,
    occupancyRate: activeListings > 0 ? 78 : 0,
    newInquiries: activeListings > 0 ? Math.min(activeListings * 2, 12) : 0,
    conversionRate: activeListings > 0 ? 24 : 0,
  };
}

// ── Parse profile from API response ──
function parseProfile(data: any, role: string | null): ProfileData {
  if (!data) {
    return emptyProfile();
  }

  const name = data.name || "";
  const bio = data.about_me || data.bio || "";
  const occupation = data.occupation || "";
  const rawPhoto = data.custom_pfp || null;
  const photo = rawPhoto && typeof rawPhoto === "string" && rawPhoto.startsWith("http") ? rawPhoto : null;
  const badges = data.badges || [];
  const interests = data.interests || [];
  const lifestyle = data.lifestyle || [];
  const uselessSkill = data.most_useless_skill || "";
  const age = data.age?.toString() || "";
  const visaType = data.visa_type || "";
  const budgetMin = data.budget_min?.toString() || "";
  const budgetMax = data.budget_max?.toString() || "";
  const preferredSuburbs = data.preferred_suburbs || "";
  const moveInDate = data.move_in_date || "";
  const phone = data.phone || "";
  const roomsOwned = data.rooms_owned || 0;
  const propertiesOwned = data.properties_owned || 0;

  // Derive verification status
  const emailVerified = true; // Always true if logged in via Supabase
  const idVerified = !!data.is_verified;

  // Compute completeness
  const { percent, missing } = computeCompleteness(
    { name, bio, photo, occupation, interests, uselessSkill, age, visaType, budgetMin, preferredSuburbs, phone, roomsOwned },
    role
  );

  return {
    name, bio, occupation, photo, badges, interests, lifestyle, uselessSkill,
    age, visaType, budgetMin, budgetMax, preferredSuburbs, moveInDate,
    phone, roomsOwned, propertiesOwned,
    emailVerified, idVerified,
    completionPercent: percent,
    missingFields: missing,
  };
}

function emptyProfile(): ProfileData {
  return {
    name: "", bio: "", occupation: "", photo: null, badges: [], interests: [],
    lifestyle: [], uselessSkill: "", age: "", visaType: "", budgetMin: "",
    budgetMax: "", preferredSuburbs: "", moveInDate: "", phone: "",
    roomsOwned: 0, propertiesOwned: 0, emailVerified: true, idVerified: false,
    completionPercent: 0, missingFields: ["name", "bio", "photo"],
  };
}

function computeCompleteness(
  fields: Record<string, any>,
  role: string | null
): { percent: number; missing: string[] } {
  const checks: { key: string; label: string; filled: boolean; roles?: string[] }[] = [
    { key: "name", label: "Display name", filled: !!fields.name },
    { key: "bio", label: "About me", filled: !!fields.bio },
    { key: "photo", label: "Profile photo", filled: !!fields.photo },
    { key: "occupation", label: "Occupation", filled: !!fields.occupation, roles: ["seeker"] },
    { key: "interests", label: "Interests", filled: fields.interests?.length > 0 },
    { key: "uselessSkill", label: "Useless skill", filled: !!fields.uselessSkill },
    { key: "age", label: "Age", filled: !!fields.age, roles: ["seeker"] },
    { key: "visaType", label: "Visa type", filled: !!fields.visaType, roles: ["seeker"] },
    { key: "budgetMin", label: "Budget range", filled: !!fields.budgetMin, roles: ["seeker"] },
    { key: "preferredSuburbs", label: "Preferred suburbs", filled: !!fields.preferredSuburbs, roles: ["seeker"] },
    { key: "phone", label: "Contact phone", filled: !!fields.phone, roles: ["owner"] },
  ];

  const relevant = checks.filter(c => !c.roles || !role || c.roles.includes(role));
  const filled = relevant.filter(c => c.filled);
  const missing = relevant.filter(c => !c.filled).map(c => c.label);
  const percent = relevant.length > 0 ? Math.round((filled.length / relevant.length) * 100) : 0;

  return { percent, missing };
}

// ── Hook ──
export function useDashboardData() {
  const { session } = useAuth();

  // Initialize from in-memory cache first, then localStorage fallback
  const initial = cachedData || loadFromLocalStorage();
  const [data, setData] = useState<DashboardData | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!session) return;

    if (showLoading && !isCacheValid()) {
      setLoading(true);
    }

    try {
      const [listingsResult, profileResult, badgesResult] = await Promise.all([
        getListings(session.access_token).catch(() => []),
        getMyProfile(session.access_token).catch(() => null),
        refreshBadges(session.access_token).catch(() => null),
      ]);

      const listings = Array.isArray(listingsResult)
        ? listingsResult
        : listingsResult?.listings ?? [];

      // Merge badges into profile data
      const profileWithBadges = profileResult
        ? { ...profileResult, badges: badgesResult?.badges || profileResult?.badges || [] }
        : null;

      const role = profileResult?.role || null;
      const parsed = parseProfile(profileWithBadges, role);

      // If DB has an invalid photo URL (blob:, data:, etc.), just ignore it locally
      // Don't try to clean it up via API call - it causes 400 errors

      const dashData: DashboardData = {
        metrics: computeMetrics(listings),
        activity: generateActivity(listings, parsed),
        listings,
        profile: parsed,
      };

      cachedData = dashData;
      cacheTimestamp = Date.now();
      saveToLocalStorage(dashData);
      setData(dashData);
      setError(null);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (fetchedRef.current) return;

    // If in-memory cache is valid, use it and revalidate in background
    if (isCacheValid() && cachedData) {
      setData(cachedData);
      setLoading(false);
      fetchedRef.current = true;
      fetchData(false);
      return;
    }

    // If localStorage has data, show it instantly and revalidate in background
    const lsData = loadFromLocalStorage();
    if (lsData) {
      setData(lsData);
      setLoading(false);
      fetchedRef.current = true;
      fetchData(false);
      return;
    }

    if (session) {
      fetchedRef.current = true;
      fetchData(true);
    }
  }, [session, fetchData]);

  const refetch = useCallback(() => {
    fetchedRef.current = false;
    cachedData = null;
    cacheTimestamp = 0;
    try { localStorage.removeItem(LS_CACHE_KEY); } catch {}
    return fetchData(true);
  }, [fetchData]);

  return { data, loading, error, refetch };
}
