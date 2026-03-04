import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { UserProfile, ProfileBadges } from "./useUserProfile";

export interface ProfileListing {
  id: string;
  title: string;
  address: string;
  postcode: string;
  weekly_price: number;
  description: string;
  property_type: string;
  place_type: string;
  bedrooms: number;
  bathrooms: number;
  photos: string[];
  is_active: boolean;
  created_at: string;
}

export interface ProfileReview {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_photo: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

const LISTINGS_PER_PAGE = 12;

export function useProfileListings(userId: string | undefined) {
  const [listings, setListings] = useState<ProfileListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const fetchListings = useCallback(async (pageNum: number) => {
    if (!userId) return;
    setLoading(true);
    try {
      const from = pageNum * LISTINGS_PER_PAGE;
      const to = from + LISTINGS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("listings")
        .select("id, title, address, postcode, weekly_price, description, property_type, place_type, bedrooms, bathrooms, photos, is_active, created_at")
        .eq("owner_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Listings fetch error:", error);
        return;
      }

      const items = (data || []).map((d: any) => ({
        id: d.id,
        title: d.title || d.address,
        address: d.address || "",
        postcode: d.postcode?.toString() || "",
        weekly_price: d.weekly_price || 0,
        description: d.description || "",
        property_type: d.property_type || "House",
        place_type: d.place_type || "Private room",
        bedrooms: d.bedrooms || 1,
        bathrooms: d.bathrooms || 1,
        photos: Array.isArray(d.photos) ? d.photos.filter((p: string) => p && p.startsWith("http")) : [],
        is_active: d.is_active ?? true,
        created_at: d.created_at || "",
      }));

      if (pageNum === 0) {
        setListings(items);
      } else {
        setListings(prev => [...prev, ...items]);
      }
      setHasMore(items.length === LISTINGS_PER_PAGE);
    } catch (err) {
      console.error("useProfileListings error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setPage(0);
    fetchListings(0);
  }, [fetchListings]);

  const loadMore = useCallback(() => {
    const next = page + 1;
    setPage(next);
    fetchListings(next);
  }, [page, fetchListings]);

  return { listings, loading, hasMore, loadMore };
}

export function useProfileReviews(userId: string | undefined) {
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, reviewer_id, reviewer_name, reviewer_photo, rating, comment, created_at")
          .eq("reviewee_id", userId!)
          .order("created_at", { ascending: false })
          .limit(20);

        if (cancelled) return;
        if (error) {
          // Reviews table may not exist yet — that's fine
          console.warn("Reviews fetch:", error.message);
          setReviews([]);
        } else {
          setReviews((data || []).map((d: any) => ({
            id: d.id,
            reviewer_id: d.reviewer_id || "",
            reviewer_name: d.reviewer_name || "Anonymous",
            reviewer_photo: d.reviewer_photo && d.reviewer_photo.startsWith("http") ? d.reviewer_photo : null,
            rating: d.rating || 5,
            comment: d.comment || "",
            created_at: d.created_at || "",
          })));
        }
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  return { reviews, loading };
}
