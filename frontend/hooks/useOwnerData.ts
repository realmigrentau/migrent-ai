import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  getOwnerMetrics,
  getOwnerBookings,
  getOwnerActivity,
} from "../lib/api";

export interface OwnerMetrics {
  active_listings: number;
  pending_requests: number;
  earnings_this_month: number;
  response_rate: number;
}

export interface OwnerBooking {
  id: string;
  listing_id: string;
  owner_id: string;
  seeker_id: string;
  booking_type: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  weekly_price_at_time: number;
  total_price: number;
  owner_fee: number;
  seeker_fee: number;
  stripe_session_id: string | null;
  message_to_owner: string | null;
  created_at: string;
  updated_at: string;
  listing?: {
    title: string | null;
    address: string;
    city: string | null;
    weekly_price: number;
    images: string[];
  };
  seeker?: {
    name: string | null;
    custom_pfp: string | null;
    verified: boolean;
  };
}

export interface OwnerActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export function useOwnerData() {
  const { session, refreshing } = useAuth();
  const [metrics, setMetrics] = useState<OwnerMetrics | null>(null);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [activity, setActivity] = useState<OwnerActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!session || refreshing) return;
    setLoading(true);
    setError(null);

    try {
      const [metricsData, bookingsData, activityData] = await Promise.all([
        getOwnerMetrics(session.access_token).catch(() => null),
        getOwnerBookings(session.access_token, 1, 20).catch(() => ({ bookings: [], total: 0 })),
        getOwnerActivity(session.access_token, 10).catch(() => ({ activities: [] })),
      ]);

      if (metricsData) setMetrics(metricsData);
      setBookings(bookingsData.bookings || []);
      setBookingsTotal(bookingsData.total || 0);
      setBookingsPage(1);
      setActivity(activityData.activities || []);
    } catch (err: any) {
      setError(err.message || "Failed to load owner data");
    } finally {
      setLoading(false);
    }
  }, [session, refreshing]);

  const fetchBookingsPage = useCallback(async (page: number, status?: string) => {
    if (!session) return;
    try {
      const data = await getOwnerBookings(session.access_token, page, 20, status);
      setBookings(data.bookings || []);
      setBookingsTotal(data.total || 0);
      setBookingsPage(page);
    } catch (err: any) {
      console.error("Failed to fetch bookings page:", err);
    }
  }, [session]);

  useEffect(() => {
    if (session && !refreshing) {
      fetchAll();
    }
  }, [session, refreshing, fetchAll]);

  return {
    metrics,
    bookings,
    bookingsTotal,
    bookingsPage,
    activity,
    loading,
    error,
    refetch: fetchAll,
    fetchBookingsPage,
  };
}
