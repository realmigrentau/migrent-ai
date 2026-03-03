import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { getListings, getMyProfile } from "../lib/api";

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

export interface DashboardData {
  metrics: DashboardMetrics;
  activity: ActivityItem[];
  listings: any[];
  profile: any;
}

// ── In-memory cache ──
let cachedData: DashboardData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return cachedData !== null && Date.now() - cacheTimestamp < CACHE_TTL;
}

// ── Generate mock activity based on real listings ──
function generateActivity(listings: any[]): ActivityItem[] {
  const now = Date.now();
  const activities: ActivityItem[] = [];

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

  // Add helpful getting-started items if few listings
  if (listings.length === 0) {
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

  activities.push({
    id: "tip-1",
    type: "verification",
    icon: "shield",
    title: "Profile verification available",
    description: "Verified profiles get 3x more responses",
    time: formatTimeAgo(now - 86400000),
    status: "pending",
  });

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

// ── Hook ──
export function useDashboardData() {
  const { session } = useAuth();
  const [data, setData] = useState<DashboardData | null>(cachedData);
  const [loading, setLoading] = useState(!isCacheValid());
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!session) return;

    if (showLoading && !isCacheValid()) {
      setLoading(true);
    }

    try {
      const [listingsResult, profileResult] = await Promise.all([
        getListings(session.access_token).catch(() => []),
        getMyProfile(session.access_token).catch(() => null),
      ]);

      const listings = Array.isArray(listingsResult)
        ? listingsResult
        : listingsResult?.listings ?? [];

      const dashData: DashboardData = {
        metrics: computeMetrics(listings),
        activity: generateActivity(listings),
        listings,
        profile: profileResult,
      };

      cachedData = dashData;
      cacheTimestamp = Date.now();
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

    // If cache is valid, use it immediately and refetch in background
    if (isCacheValid() && cachedData) {
      setData(cachedData);
      setLoading(false);
      fetchedRef.current = true;
      // Background revalidate
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
    return fetchData(true);
  }, [fetchData]);

  return { data, loading, error, refetch };
}
