import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { getMyProfile, updateMyProfile } from "../../lib/api";

const PLACEHOLDER_LISTINGS: Record<string, any> = {
  "1": {
    id: "1",
    address: "12 Crown St",
    suburb: "Surry Hills",
    postcode: "2010",
    weeklyPrice: 250,
    roomType: "private",
    furnished: true,
    billsIncluded: true,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    ],
    description:
      "Bright private room in friendly sharehouse near Central Station.",
  },
  "2": {
    id: "2",
    address: "45 George St",
    suburb: "Redfern",
    postcode: "2016",
    weeklyPrice: 220,
    roomType: "shared",
    furnished: true,
    billsIncluded: false,
    verified: false,
    photos: [
      "https://images.unsplash.com/photo-1598928506311-c55ez637a745?w=400&h=300&fit=crop",
    ],
    description: "Affordable shared room close to USYD campus.",
  },
  "3": {
    id: "3",
    address: "8 Botany Rd",
    suburb: "Waterloo",
    postcode: "2017",
    weeklyPrice: 280,
    roomType: "ensuite",
    furnished: true,
    billsIncluded: true,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    ],
    description: "Ensuite room with own bathroom in modern apartment.",
  },
};

export default function WishlistPage() {
  const { session, user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);

    // Try to load from backend if logged in
    if (session && user?.id) {
      try {
        const profile = await getMyProfile(session.access_token);
        if (profile?.wishlist) {
          setWishlistIds(profile.wishlist);
        }
      } catch (err) {
        console.error("Failed to load wishlist from backend:", err);
        // Fall back to localStorage
        const saved = localStorage.getItem("wishlist");
        if (saved) {
          try {
            setWishlistIds(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse wishlist:", e);
          }
        }
      }
    } else {
      // Load from localStorage
      const saved = localStorage.getItem("wishlist");
      if (saved) {
        try {
          setWishlistIds(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse wishlist:", e);
        }
      }
    }

    // Fetch listing details (mock)
    const items = wishlistIds
      .map((id) => PLACEHOLDER_LISTINGS[id])
      .filter((l) => l);
    setListings(items);
    setLoading(false);
  };

  const removeFromWishlist = async (id: string) => {
    const updated = wishlistIds.filter((wid) => wid !== id);
    setWishlistIds(updated);
    setListings(listings.filter((l) => l.id !== id));

    // Update localStorage
    localStorage.setItem("wishlist", JSON.stringify(updated));

    // Update backend if logged in
    if (session && user?.id) {
      try {
        await updateMyProfile(session.access_token, {
          wishlist: updated,
        });
      } catch (err) {
        console.error("Failed to sync wishlist to backend:", err);
      }
    }
  };

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === "price-low") return a.weeklyPrice - b.weeklyPrice;
    if (sortBy === "price-high") return b.weeklyPrice - a.weeklyPrice;
    if (sortBy === "verified") return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
    return 0; // recent (default order)
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              My <span className="gradient-text">Wishlist</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {listings.length} saved {listings.length === 1 ? "listing" : "listings"}
            </p>
          </div>
          <Link
            href="/seeker/search"
            className="btn-secondary px-4 py-2.5 rounded-xl text-sm"
          >
            ← Back to search
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 rounded-2xl text-center"
        >
          <svg
            className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.906 0 5.744.474 8.48 1.379m-12.552 6.711c.666.164 1.326.316 1.989.425m5.546-1.429a.75.75 0 100-1.5.75.75 0 000 1.5m5.617 2.805a.75.75 0 100-1.5.75.75 0 000 1.5m-9.5 9.5c-1.577 0-2.355-.581-2.4-.9a.75.75 0 010-1.5h.008a.75.75 0 01.75.75c0 .414.336.75.75.75h15a.75.75 0 00.75-.75.75.75 0 011.5 0c0 .414.336.75.75.75h.008a.75.75 0 010 1.5c-.045.319-.823.9-2.4.9h-13z"
            />
          </svg>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Start adding rooms to your wishlist to compare and plan your move.
          </p>
          <Link
            href="/seeker/search"
            className="btn-primary px-6 py-2.5 rounded-xl text-sm inline-block"
          >
            Explore listings
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Sort controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between gap-4"
          >
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field text-sm"
              >
                <option value="recent">Most recent</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
                <option value="verified">Verified first</option>
              </select>
            </div>
          </motion.div>

          {/* Listings grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {sortedListings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={listing.photos[0]}
                    alt={listing.address}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    onClick={() => removeFromWishlist(listing.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:scale-110 transition-transform"
                  >
                    ✕
                  </button>

                  {/* Price badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-rose-500 text-white shadow-lg">
                    <span className="font-bold">AUD ${listing.weeklyPrice}</span>
                    <span className="text-sm">/wk</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {listing.address}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {listing.suburb}, {listing.postcode}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                      {listing.roomType}
                    </span>
                    {listing.furnished && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Furnished
                      </span>
                    )}
                    {listing.billsIncluded && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Bills incl.
                      </span>
                    )}
                    {listing.verified && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/seeker/room/${listing.id}`}
                      className="btn-primary py-2 px-4 rounded-lg text-xs flex-1 text-center"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
