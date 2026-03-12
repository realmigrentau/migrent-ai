import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  createBooking,
  getMyBookings,
  respondToBooking,
  cancelBooking,
  CreateBookingPayload,
} from "../lib/api";

export interface Booking {
  id: string;
  listing_id: string;
  owner_id: string;
  seeker_id: string;
  booking_type: "REQUEST_TO_BOOK" | "INSTANT_BOOK";
  status:
    | "PENDING_OWNER"
    | "OWNER_ACCEPTED"
    | "OWNER_DECLINED"
    | "SEEKER_CANCELLED"
    | "PAID"
    | "COMPLETED"
    | "EXPIRED";
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
  other_party?: {
    name: string | null;
    custom_pfp: string | null;
    verified: boolean;
  };
}

export function useBookings(role: "seeker" | "owner" = "seeker") {
  const { session, refreshing } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!session || refreshing) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBookings(session.access_token, role);
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [session, refreshing, role]);

  useEffect(() => {
    if (session && !refreshing) {
      fetchBookings();
    }
  }, [session, refreshing, fetchBookings]);

  const submitBooking = async (payload: CreateBookingPayload) => {
    if (!session) throw new Error("Not authenticated");
    const result = await createBooking(session.access_token, payload);
    await fetchBookings();
    return result;
  };

  const respond = async (bookingId: string, action: "accept" | "decline") => {
    if (!session) throw new Error("Not authenticated");
    const result = await respondToBooking(session.access_token, bookingId, action);
    await fetchBookings();
    return result;
  };

  const cancel = async (bookingId: string) => {
    if (!session) throw new Error("Not authenticated");
    const result = await cancelBooking(session.access_token, bookingId);
    await fetchBookings();
    return result;
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    submitBooking,
    respond,
    cancel,
  };
}
