import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface MarqueeListing {
  id: string;
  title: string;
  suburb: string;
  weeklyPrice: number;
  rating: number;
  reviewsCount: number;
  beds: number;
  photos: string[];
  nearestStation: string | null;
  ownerVerified: boolean;
  superhost: boolean;
}

const FALLBACK_LISTINGS: MarqueeListing[] = [];

export function useTopListings() {
  const [listings, setListings] = useState<MarqueeListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      try {
        // public_listings is the allow-listed, approved-and-available view;
        // anon has no grant on the listings table itself.
        const { data, error } = await supabase
          .from("public_listings")
          .select("id, title, suburb, city, weekly_price, beds, images, nearest_transport, created_at")
          .order("created_at", { ascending: false })
          .limit(16);

        if (cancelled) return;

        if (error || !data || data.length === 0) {
          setListings(FALLBACK_LISTINGS);
          setLoading(false);
          return;
        }

        const mapped: MarqueeListing[] = data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          title: (row.title as string) || "Beautiful Room",
          suburb: (row.suburb as string) || (row.city as string) || "Sydney",
          weeklyPrice: (row.weekly_price as number) || 250,
          rating: (row.rating as number) || 4.5,
          reviewsCount: (row.reviews_count as number) || 0,
          beds: (row.beds as number) || 1,
          photos: Array.isArray(row.images) && (row.images as string[]).length > 0
            ? row.images as string[]
            : Array.isArray(row.photos) && (row.photos as string[]).length > 0
              ? row.photos as string[]
              : ["/images/placeholder-room.jpg"],
          nearestStation: (row.nearest_transport as string) || null,
          // Verification is shown by the listing page from the API contract,
          // never asserted by a marquee tile.
          ownerVerified: false,
          superhost: (row.superhost as boolean) || false,
        }));

        // Only show real listings - if we have some, use them; otherwise show fallbacks
        if (mapped.length > 0) {
          setListings(mapped);
        } else {
          setListings(FALLBACK_LISTINGS);
        }
      } catch {
        if (!cancelled) {
          setListings(FALLBACK_LISTINGS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchListings();
    return () => { cancelled = true; };
  }, []);

  return { listings, loading };
}
