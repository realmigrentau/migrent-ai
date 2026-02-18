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

const FALLBACK_LISTINGS: MarqueeListing[] = [
  {
    id: "fallback-1",
    title: "Sunny Loft - Harbour Views",
    suburb: "Surry Hills",
    weeklyPrice: 420,
    rating: 4.92,
    reviewsCount: 47,
    beds: 2,
    photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Central Station",
    ownerVerified: true,
    superhost: true,
  },
  {
    id: "fallback-2",
    title: "Modern Studio in CBD",
    suburb: "Sydney",
    weeklyPrice: 380,
    rating: 4.87,
    reviewsCount: 34,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Town Hall",
    ownerVerified: true,
    superhost: true,
  },
  {
    id: "fallback-3",
    title: "Cozy Room near Bondi",
    suburb: "Bondi Junction",
    weeklyPrice: 350,
    rating: 4.95,
    reviewsCount: 62,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Bondi Junction",
    ownerVerified: true,
    superhost: false,
  },
  {
    id: "fallback-4",
    title: "Spacious Share in Newtown",
    suburb: "Newtown",
    weeklyPrice: 290,
    rating: 4.81,
    reviewsCount: 28,
    beds: 2,
    photos: ["https://images.unsplash.com/photo-1598928506311-c55ece637a745?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Newtown Station",
    ownerVerified: true,
    superhost: true,
  },
  {
    id: "fallback-5",
    title: "Bright Room in Redfern",
    suburb: "Redfern",
    weeklyPrice: 310,
    rating: 4.89,
    reviewsCount: 41,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1540518614846-7eded433c457?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Redfern Station",
    ownerVerified: true,
    superhost: false,
  },
  {
    id: "fallback-6",
    title: "Chic Apartment in Darlinghurst",
    suburb: "Darlinghurst",
    weeklyPrice: 440,
    rating: 4.96,
    reviewsCount: 53,
    beds: 2,
    photos: ["https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Kings Cross",
    ownerVerified: true,
    superhost: true,
  },
  {
    id: "fallback-7",
    title: "Furnished Room in Glebe",
    suburb: "Glebe",
    weeklyPrice: 320,
    rating: 4.84,
    reviewsCount: 37,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Glebe Light Rail",
    ownerVerified: true,
    superhost: false,
  },
  {
    id: "fallback-8",
    title: "Budget Friendly in Homebush",
    suburb: "Homebush",
    weeklyPrice: 240,
    rating: 4.78,
    reviewsCount: 22,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Homebush Station",
    ownerVerified: true,
    superhost: false,
  },
  {
    id: "fallback-9",
    title: "Harbour View in Milsons Point",
    suburb: "Milsons Point",
    weeklyPrice: 490,
    rating: 4.97,
    reviewsCount: 71,
    beds: 2,
    photos: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Milsons Point",
    ownerVerified: true,
    superhost: true,
  },
  {
    id: "fallback-10",
    title: "Trendy Pad in Marrickville",
    suburb: "Marrickville",
    weeklyPrice: 280,
    rating: 4.82,
    reviewsCount: 31,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Marrickville Station",
    ownerVerified: true,
    superhost: true,
  },
  {
    id: "fallback-11",
    title: "Quiet Room in Epping",
    suburb: "Epping",
    weeklyPrice: 260,
    rating: 4.85,
    reviewsCount: 26,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Epping Station",
    ownerVerified: true,
    superhost: false,
  },
  {
    id: "fallback-12",
    title: "Share House in Parramatta",
    suburb: "Parramatta",
    weeklyPrice: 230,
    rating: 4.76,
    reviewsCount: 19,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Parramatta Station",
    ownerVerified: true,
    superhost: false,
  },
  {
    id: "fallback-13",
    title: "Stylish Room in Paddington",
    suburb: "Paddington",
    weeklyPrice: 410,
    rating: 4.91,
    reviewsCount: 44,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Edgecliff Station",
    ownerVerified: true,
    superhost: true,
  },
  {
    id: "fallback-14",
    title: "Cozy Flat in Ultimo",
    suburb: "Ultimo",
    weeklyPrice: 340,
    rating: 4.88,
    reviewsCount: 39,
    beds: 2,
    photos: ["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Central Station",
    ownerVerified: true,
    superhost: true,
  },
  {
    id: "fallback-15",
    title: "Sunny Room in Manly",
    suburb: "Manly",
    weeklyPrice: 370,
    rating: 4.93,
    reviewsCount: 56,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Manly Wharf",
    ownerVerified: true,
    superhost: false,
  },
  {
    id: "fallback-16",
    title: "Modern Room in Chatswood",
    suburb: "Chatswood",
    weeklyPrice: 330,
    rating: 4.86,
    reviewsCount: 33,
    beds: 1,
    photos: ["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=480&h=360&fit=crop&crop=center"],
    nearestStation: "Chatswood Station",
    ownerVerified: true,
    superhost: true,
  },
];

export function useTopListings() {
  const [listings, setListings] = useState<MarqueeListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("id, title, suburb, weekly_price, rating, reviews_count, beds, photos, nearest_station, owner_verified, superhost")
          .eq("owner_verified", true)
          .order("rating", { ascending: false })
          .order("reviews_count", { ascending: false })
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
          suburb: (row.suburb as string) || "Sydney",
          weeklyPrice: (row.weekly_price as number) || 250,
          rating: (row.rating as number) || 4.5,
          reviewsCount: (row.reviews_count as number) || 0,
          beds: (row.beds as number) || 1,
          photos: Array.isArray(row.photos) && row.photos.length > 0 ? row.photos as string[] : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=480&h=360&fit=crop&crop=center"],
          nearestStation: (row.nearest_station as string) || null,
          ownerVerified: true,
          superhost: (row.superhost as boolean) || false,
        }));

        // Fill with fallbacks if less than 16
        const result = [...mapped];
        if (result.length < 16) {
          const needed = 16 - result.length;
          result.push(...FALLBACK_LISTINGS.slice(0, needed));
        }

        setListings(result);
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
