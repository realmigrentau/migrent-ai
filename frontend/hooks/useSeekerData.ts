import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  getSeekerMetrics,
  getSeekerBookings,
  getSeekerWishlist,
  getSeekerRecommended,
} from "../lib/api";

export interface SeekerMetrics {
  saved_listings: number;
  pending_requests: number;
  confirmed_bookings: number;
  recommended: number;
}

export interface SeekerBooking {
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
  owner?: {
    name: string | null;
    custom_pfp: string | null;
    verified: boolean;
  };
}

export interface WishlistListing {
  id: string;
  title: string | null;
  address: string;
  city: string | null;
  suburb: string | null;
  postcode: string | null;
  weekly_price: number;
  images: string[];
  description: string | null;
  place_type: string | null;
  furnished: boolean;
  bills_included: boolean;
  nearest_transport: string | null;
  owner_id: string;
  owner?: {
    name: string | null;
    custom_pfp: string | null;
    verified: boolean;
  };
}

export interface RecommendedListing extends WishlistListing {
  match_score: number;
}

export function useSeekerData() {
  const { session, refreshing } = useAuth();
  const [metrics, setMetrics] = useState<SeekerMetrics | null>(null);
  const [bookings, setBookings] = useState<SeekerBooking[]>([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [wishlist, setWishlist] = useState<WishlistListing[]>([]);
  const [recommended, setRecommended] = useState<RecommendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!session || refreshing) return;
    setLoading(true);
    setError(null);

    try {
      const [metricsData, bookingsData, wishlistData, recommendedData] =
        await Promise.all([
          getSeekerMetrics(session.access_token).catch(() => null),
          getSeekerBookings(session.access_token, 1, 20).catch(() => ({
            bookings: [],
            total: 0,
          })),
          getSeekerWishlist(session.access_token).catch(() => ({
            listings: [],
          })),
          getSeekerRecommended(session.access_token, 4).catch(() => ({
            listings: [],
          })),
        ]);

      if (metricsData) setMetrics(metricsData);
      setBookings(bookingsData.bookings || []);
      setBookingsTotal(bookingsData.total || 0);
      setWishlist(wishlistData.listings || []);
      setRecommended(recommendedData.listings || []);
    } catch (err: any) {
      setError(err.message || "Failed to load seeker data");
    } finally {
      setLoading(false);
    }
  }, [session, refreshing]);

  useEffect(() => {
    if (session && !refreshing) {
      fetchAll();
    }
  }, [session, refreshing, fetchAll]);

  return {
    metrics,
    bookings,
    bookingsTotal,
    wishlist,
    recommended,
    loading,
    error,
    refetch: fetchAll,
  };
}
