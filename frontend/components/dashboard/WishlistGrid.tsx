import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, Train, Sparkles, ShieldCheck } from "lucide-react";
import type { WishlistListing } from "../../hooks/useSeekerData";

interface Props {
  listings: WishlistListing[];
  loading: boolean;
  onUnsave?: (id: string) => void;
}

export default function WishlistGrid({ listings, loading, onUnsave }: Props) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card rounded-xl overflow-hidden animate-pulse"
          >
            <div className="h-36 bg-slate-200 dark:bg-slate-700" />
            <div className="p-4 space-y-3">
              <div className="shimmer h-4 w-3/4 rounded" />
              <div className="shimmer h-3 w-1/2 rounded" />
              <div className="shimmer h-6 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <Heart className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          No saved listings yet. Browse rooms and tap the heart to save them!
        </p>
        <Link
          href="/seeker/search"
          className="inline-flex items-center gap-2 btn-primary py-2 px-4 rounded-xl text-sm font-medium"
        >
          Browse Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {listings.slice(0, 4).map((listing, i) => (
        <motion.div
          key={listing.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          className="card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group hover:shadow-md transition-shadow"
        >
          {/* Image */}
          <div className="relative h-36 bg-slate-200 dark:bg-slate-700">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt={listing.title || listing.address}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <MapPin className="w-8 h-8" />
              </div>
            )}

            {/* Unsave button */}
            {onUnsave && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onUnsave(listing.id);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Heart className="w-4 h-4 text-[var(--color-primary)] fill-[var(--color-coral-500)]" />
              </button>
            )}

            {/* Badges */}
            <div className="absolute bottom-2 left-2 flex gap-1.5">
              {listing.furnished && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary)]/90 text-white">
                  Furnished
                </span>
              )}
              {listing.bills_included && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)]0/90 text-white">
                  Bills incl.
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <Link href={`/listing/${listing.id}`}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {listing.title || listing.address}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.suburb || listing.city || listing.address}
                    {listing.postcode ? ` ${listing.postcode}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-primary)]">
                    ${listing.weekly_price}/wk
                  </p>
                </div>
              </div>

              {/* Station + verification */}
              <div className="flex items-center gap-3 mt-3">
                {listing.nearest_transport && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Train className="w-3 h-3" />
                    {listing.nearest_transport}
                  </span>
                )}
                {listing.owner?.verified && (
                  <span className="text-xs text-blue-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified owner
                  </span>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}

      {/* View all link */}
      {listings.length > 4 && (
        <Link
          href="/seeker/wishlist"
          className="card rounded-xl p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow border border-dashed border-slate-300 dark:border-slate-600"
        >
          <Sparkles className="w-8 h-8 text-[var(--color-primary)] mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            View all {listings.length} saved
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Compare side-by-side
          </p>
        </Link>
      )}
    </div>
  );
}
