import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

import { API_BASE_URL as BASE_URL } from "../lib/apiBase";
export interface Review {
  id: string;
  deal_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  listing_id: string | null;
  review_type: "seeker_to_owner" | "owner_to_seeker";
  rating: number;
  review_text: string | null;
  migrant_friendliness: number | null;
  communication_language: string | null;
  reliability_rating: number | null;
  cleanliness_rating: number | null;
  payment_rating: number | null;
  photos: string[];
  flagged: boolean;
  created_at: string;
  // Enriched fields from API
  reviewer_name?: string;
  reviewer_photo?: string | null;
}

export interface ReviewStats {
  review_count: number;
  avg_rating: number;
  avg_migrant_friendliness?: number | null;
  positive_count?: number;
}

export interface DealReviewContext {
  deal: {
    id: string;
    status: string;
    listing_id: string | null;
    owner_id: string;
    seeker_id: string;
  };
  listing: {
    id?: string;
    title?: string;
    address?: string;
    postcode?: number;
    weekly_price?: number;
  };
  other_user: {
    id: string;
    name: string;
    photo: string | null;
  };
  my_review: Review | null;
  other_review: Review | null;
  is_owner: boolean;
  can_review: boolean;
}

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// Fetch reviews for a listing
export function useListingReviews(listingId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ review_count: 0, avg_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchReviews = useCallback(async (pageNum: number) => {
    if (!listingId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/reviews/listing/${listingId}?page=${pageNum}&per_page=10`
      );
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      if (pageNum === 1) {
        setReviews(data.reviews || []);
      } else {
        setReviews(prev => [...prev, ...(data.reviews || [])]);
      }
      setStats(data.stats || { review_count: 0, avg_rating: 0 });
      setHasMore((data.reviews || []).length === 10);
    } catch (err) {
      console.error("useListingReviews error:", err);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    setPage(1);
    fetchReviews(1);
  }, [fetchReviews]);

  const loadMore = useCallback(() => {
    const next = page + 1;
    setPage(next);
    fetchReviews(next);
  }, [page, fetchReviews]);

  return { reviews, stats, loading, hasMore, loadMore };
}

// Fetch reviews for a user
export function useUserReviews(userId: string | undefined, reviewType?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Record<string, { review_count: number; avg_rating: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: "1", per_page: "20" });
        if (reviewType) params.set("review_type", reviewType);

        const res = await fetch(`${BASE_URL}/reviews/user/${userId}?${params}`);
        if (cancelled) return;
        if (!res.ok) throw new Error("Failed to fetch user reviews");
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(data.stats || {});
      } catch (err) {
        if (!cancelled) {
          console.warn("useUserReviews:", err);
          setReviews([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId, reviewType]);

  return { reviews, stats, loading };
}

// Fetch deal review context (for the review form page)
export function useDealReview(dealId: string | undefined) {
  const [context, setContext] = useState<DealReviewContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = useCallback(async () => {
    if (!dealId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) { setError("Not authenticated"); return; }

      const res = await fetch(`${BASE_URL}/reviews/deal/${dealId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to load deal");
      }
      const data = await res.json();
      setContext(data);
    } catch (err: any) {
      setError(err.message || "Failed to load review context");
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => { fetchContext(); }, [fetchContext]);

  return { context, loading, error, refetch: fetchContext };
}

// Submit a review
export async function submitReview(data: {
  deal_id: string;
  reviewed_user_id: string;
  listing_id?: string;
  review_type: "seeker_to_owner" | "owner_to_seeker";
  rating: number;
  review_text?: string;
  migrant_friendliness?: number;
  communication_language?: string;
  reliability_rating?: number;
  cleanliness_rating?: number;
  payment_rating?: number;
  photos?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getToken();
    if (!token) return { success: false, error: "Not authenticated" };

    const res = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.detail || "Failed to submit review" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// Flag a review
export async function flagReview(reviewId: string, reason: string): Promise<boolean> {
  try {
    const token = await getToken();
    if (!token) return false;

    const res = await fetch(`${BASE_URL}/reviews/${reviewId}/flag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    return res.ok;
  } catch {
    return false;
  }
}
