import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import { getMyProfile, updateMyProfile } from "../lib/api";

// ── Types ──

export interface WishlistListing {
  id: string;
  address: string;
  suburb: string;
  postcode: string;
  weeklyPrice: number;
  originalPrice?: number;
  roomType: string;
  furnished: boolean;
  billsIncluded: boolean;
  verified: boolean;
  superhost: boolean;
  rating: number;
  reviewCount: number;
  photos: string[];
  description: string;
  ownerName: string;
  ownerPhoto?: string;
  ownerVerified: boolean;
  nearestStation?: string;
  stationWalkMin?: number;
  ownerReply?: string;
  savedAt: string;
  collectionId?: string;
}

export interface WishlistCollection {
  id: string;
  name: string;
  color: string;
  gradient: string;
  emoji: string;
  count: number;
  isSmartCollection?: boolean;
}

export interface ActivityItem {
  id: string;
  type: "price_drop" | "owner_reply" | "new_review" | "new_match";
  listingId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type SortOption = "recent" | "price-low" | "price-high" | "rating" | "verified" | "station";

// ── Gradient palette for collections ──

export const COLLECTION_GRADIENTS = [
  { color: "#8b5cf6", gradient: "from-violet-500 to-purple-600" },
  { color: "#f97316", gradient: "from-orange-400 to-amber-500" },
  { color: "#10b981", gradient: "from-emerald-400 to-teal-500" },
  { color: "#3b82f6", gradient: "from-blue-400 to-indigo-500" },
  { color: "#ec4899", gradient: "from-pink-400 to-rose-500" },
  { color: "#14b8a6", gradient: "from-teal-400 to-cyan-500" },
  { color: "#f43f5e", gradient: "from-rose-400 to-red-500" },
  { color: "#6366f1", gradient: "from-indigo-400 to-violet-500" },
  { color: "#eab308", gradient: "from-yellow-400 to-amber-500" },
  { color: "#06b6d4", gradient: "from-cyan-400 to-sky-500" },
  { color: "#d946ef", gradient: "from-fuchsia-400 to-purple-500" },
  { color: "#84cc16", gradient: "from-lime-400 to-green-500" },
];

// ── Default smart collections ──

const SMART_COLLECTIONS: WishlistCollection[] = [
  {
    id: "all",
    name: "All Listings",
    color: "#f43f5e",
    gradient: "from-rose-500 to-pink-500",
    emoji: "heart",
    count: 0,
    isSmartCollection: true,
  },
  {
    id: "near-station",
    name: "Near Station",
    color: "#10b981",
    gradient: "from-emerald-400 to-teal-500",
    emoji: "train",
    count: 0,
    isSmartCollection: true,
  },
  {
    id: "budget",
    name: "Under $450/wk",
    color: "#eab308",
    gradient: "from-yellow-400 to-amber-500",
    emoji: "money",
    count: 0,
    isSmartCollection: true,
  },
  {
    id: "price-drops",
    name: "Price Drops",
    color: "#f97316",
    gradient: "from-orange-400 to-red-500",
    emoji: "fire",
    count: 0,
    isSmartCollection: true,
  },
  {
    id: "superhost",
    name: "Superhosts",
    color: "#8b5cf6",
    gradient: "from-violet-500 to-purple-600",
    emoji: "star",
    count: 0,
    isSmartCollection: true,
  },
];

// Activities will come from real wishlist tracking in a future update

// ── Gamification levels ──

const LEVELS = [
  { level: 1, name: "Browser", min: 0, max: 5 },
  { level: 2, name: "Explorer", min: 5, max: 15 },
  { level: 3, name: "Collector", min: 15, max: 30 },
  { level: 4, name: "Curator", min: 30, max: 50 },
  { level: 5, name: "Connoisseur", min: 50, max: 100 },
  { level: 6, name: "Legend", min: 100, max: 200 },
];

export function getWishlistLevel(count: number) {
  const level = LEVELS.find((l) => count >= l.min && count < l.max) || LEVELS[LEVELS.length - 1];
  const progress = Math.min(((count - level.min) / (level.max - level.min)) * 100, 100);
  return { ...level, progress, count };
}

// ── Collections storage ──

const COLLECTIONS_KEY = "migrent_wishlist_collections";

function getStoredCollections(): WishlistCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeCollections(collections: WishlistCollection[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

// ── Listing-collection mapping ──

const COLLECTION_MAP_KEY = "migrent_wishlist_collection_map";

function getCollectionMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(COLLECTION_MAP_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function storeCollectionMap(map: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COLLECTION_MAP_KEY, JSON.stringify(map));
}

// ── Main hook ──

export function useWishlist() {
  const { session, user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [listings, setListings] = useState<WishlistListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [activeCollection, setActiveCollection] = useState("all");
  const [customCollections, setCustomCollections] = useState<WishlistCollection[]>([]);
  const [collectionMap, setCollectionMap] = useState<Record<string, string>>({});
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [activities] = useState<ActivityItem[]>([]);

  // Load initial data
  useEffect(() => {
    loadWishlist();
    setCustomCollections(getStoredCollections());
    setCollectionMap(getCollectionMap());
  }, [session, user?.id]);

  const loadWishlist = async () => {
    setLoading(true);
    let ids: string[] = [];

    if (session && user?.id) {
      try {
        const profile = await getMyProfile(session.access_token);
        if (profile?.wishlist && profile.wishlist.length > 0) {
          ids = profile.wishlist;
        } else {
          const saved = localStorage.getItem("wishlist");
          if (saved) {
            try {
              ids = JSON.parse(saved);
              await updateMyProfile(session.access_token, { wishlist: ids });
            } catch (e) {
              console.error("Failed to parse wishlist:", e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load wishlist:", err);
        const saved = localStorage.getItem("wishlist");
        if (saved) {
          try { ids = JSON.parse(saved); } catch {}
        }
      }
    } else {
      const saved = localStorage.getItem("wishlist");
      if (saved) {
        try { ids = JSON.parse(saved); } catch {}
      }
    }

    // If no saved wishlist items, just show empty
    if (ids.length === 0) {
      setWishlistIds([]);
      setListings([]);
      setLoading(false);
      return;
    }

    setWishlistIds(ids);
    // Try to fetch real listing data for saved IDs
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const fetched: WishlistListing[] = [];
      for (const id of ids) {
        try {
          const res = await fetch(`${BASE_URL}/listings/${id}`, {
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const d = await res.json();
            fetched.push({
              id: d.id,
              address: d.address || "",
              suburb: d.suburb || d.city || "",
              postcode: d.postcode ? String(d.postcode) : "",
              weeklyPrice: d.weekly_price ?? 0,
              rating: d.rating ?? 4.5,
              reviewCount: d.review_count ?? 0,
              photos: d.images || d.photos || [],
              description: d.description || "",
              roomType: d.place_type || "Private room",
              furnished: d.furnished ?? false,
              billsIncluded: d.bills_included ?? false,
              verified: d.verified ?? false,
              ownerName: d.owner_profile?.name || "Owner",
              ownerPhoto: d.owner_profile?.custom_pfp || null,
              ownerVerified: d.owner_profile?.verified ?? false,
              nearestStation: d.nearest_transport || null,
              superhost: false,
              savedAt: new Date().toISOString(),
            });
          }
        } catch {}
      }
      setListings(fetched);
    } catch {
      setListings([]);
    }
    setLoading(false);
  };

  const removeFromWishlist = useCallback(async (id: string) => {
    const updated = wishlistIds.filter((wid) => wid !== id);
    setWishlistIds(updated);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setCompareIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    localStorage.setItem("wishlist", JSON.stringify(updated));

    // Remove from collection map
    const newMap = { ...collectionMap };
    delete newMap[id];
    setCollectionMap(newMap);
    storeCollectionMap(newMap);

    if (session && user?.id) {
      try {
        await updateMyProfile(session.access_token, { wishlist: updated });
      } catch (err) {
        console.error("Failed to sync wishlist:", err);
      }
    }
  }, [wishlistIds, collectionMap, session, user?.id]);

  // Collections with computed counts
  const allCollections = useMemo(() => {
    const smartWithCounts = SMART_COLLECTIONS.map((c) => {
      let count = 0;
      switch (c.id) {
        case "all":
          count = listings.length;
          break;
        case "near-station":
          count = listings.filter((l) => l.stationWalkMin && l.stationWalkMin <= 10).length;
          break;
        case "budget":
          count = listings.filter((l) => l.weeklyPrice < 450).length;
          break;
        case "price-drops":
          count = listings.filter((l) => l.originalPrice && l.originalPrice > l.weeklyPrice).length;
          break;
        case "superhost":
          count = listings.filter((l) => l.superhost && l.rating >= 4.8).length;
          break;
      }
      return { ...c, count };
    });

    const customWithCounts = customCollections.map((c) => ({
      ...c,
      count: Object.values(collectionMap).filter((cid) => cid === c.id).length,
    }));

    return [...smartWithCounts, ...customWithCounts];
  }, [listings, customCollections, collectionMap]);

  // Filtered listings by active collection
  const filteredListings = useMemo(() => {
    let filtered = listings;

    switch (activeCollection) {
      case "all":
        break;
      case "near-station":
        filtered = listings.filter((l) => l.stationWalkMin && l.stationWalkMin <= 10);
        break;
      case "budget":
        filtered = listings.filter((l) => l.weeklyPrice < 450);
        break;
      case "price-drops":
        filtered = listings.filter((l) => l.originalPrice && l.originalPrice > l.weeklyPrice);
        break;
      case "superhost":
        filtered = listings.filter((l) => l.superhost && l.rating >= 4.8);
        break;
      default:
        // Custom collection
        filtered = listings.filter((l) => collectionMap[l.id] === activeCollection);
        break;
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.weeklyPrice - b.weeklyPrice);
        break;
      case "price-high":
        sorted.sort((a, b) => b.weeklyPrice - a.weeklyPrice);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "verified":
        sorted.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
        break;
      case "station":
        sorted.sort((a, b) => (a.stationWalkMin || 99) - (b.stationWalkMin || 99));
        break;
      default:
        sorted.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    }

    return sorted;
  }, [listings, activeCollection, sortBy, collectionMap]);

  // Stats
  const stats = useMemo(() => {
    const priceDrops = listings.filter((l) => l.originalPrice && l.originalPrice > l.weeklyPrice).length;
    const ownerReplies = listings.filter((l) => l.ownerReply).length;
    const totalSaved = listings.reduce((sum, l) => {
      if (l.originalPrice) return sum + (l.originalPrice - l.weeklyPrice);
      return sum;
    }, 0);
    return {
      total: listings.length,
      priceDrops,
      ownerReplies,
      totalSaved,
      avgPrice: listings.length > 0 ? Math.round(listings.reduce((s, l) => s + l.weeklyPrice, 0) / listings.length) : 0,
    };
  }, [listings]);

  // Compare mode
  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const compareListings = useMemo(() => {
    return listings.filter((l) => compareIds.has(l.id));
  }, [listings, compareIds]);

  // Add collection
  const addCollection = useCallback((name: string, gradientIndex: number, emoji: string) => {
    const gradient = COLLECTION_GRADIENTS[gradientIndex % COLLECTION_GRADIENTS.length];
    const newCollection: WishlistCollection = {
      id: `custom-${Date.now()}`,
      name,
      color: gradient.color,
      gradient: gradient.gradient,
      emoji,
      count: 0,
    };
    const updated = [...customCollections, newCollection];
    setCustomCollections(updated);
    storeCollections(updated);
    return newCollection.id;
  }, [customCollections]);

  // Remove collection
  const removeCollection = useCallback((id: string) => {
    const updated = customCollections.filter((c) => c.id !== id);
    setCustomCollections(updated);
    storeCollections(updated);

    // Remove listings from this collection
    const newMap = { ...collectionMap };
    Object.keys(newMap).forEach((key) => {
      if (newMap[key] === id) delete newMap[key];
    });
    setCollectionMap(newMap);
    storeCollectionMap(newMap);

    if (activeCollection === id) setActiveCollection("all");
  }, [customCollections, collectionMap, activeCollection]);

  // Move listing to collection
  const moveToCollection = useCallback((listingId: string, collectionId: string) => {
    const newMap = { ...collectionMap };
    if (collectionId === "all") {
      delete newMap[listingId];
    } else {
      newMap[listingId] = collectionId;
    }
    setCollectionMap(newMap);
    storeCollectionMap(newMap);
  }, [collectionMap]);

  const unreadActivityCount = useMemo(
    () => activities.filter((a) => !a.read).length,
    [activities]
  );

  return {
    listings: filteredListings,
    allListings: listings,
    loading,
    sortBy,
    setSortBy,
    removeFromWishlist,
    // Collections
    collections: allCollections,
    activeCollection,
    setActiveCollection,
    addCollection,
    removeCollection,
    moveToCollection,
    collectionMap,
    // Compare
    compareMode,
    setCompareMode,
    compareIds,
    toggleCompare,
    compareListings,
    // Stats & gamification
    stats,
    level: getWishlistLevel(listings.length),
    // Activity
    activities,
    unreadActivityCount,
  };
}
