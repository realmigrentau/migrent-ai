import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Zap } from "lucide-react";

interface SimilarListing {
  id: string;
  title?: string;
  address: string;
  suburb?: string;
  city?: string;
  postcode?: number;
  weekly_price: number;
  images?: string[];
  instant_book_enabled?: boolean;
}

interface SimilarListingsProps {
  listings: SimilarListing[];
  currentSuburb?: string;
}

export default function SimilarListings({
  listings,
  currentSuburb,
}: SimilarListingsProps) {
  if (!listings || listings.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Similar rooms
        {currentSuburb && (
          <span className="text-sm font-normal text-slate-400 ml-2">
            near {currentSuburb}
          </span>
        )}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {listings.map((listing, i) => (
          <Link key={listing.id} href={`/listing/${listing.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group card p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title || listing.address}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    No photo
                  </div>
                )}
                {listing.instant_book_enabled && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Zap className="w-3 h-3" />
                    Instant
                  </span>
                )}
                <div className="absolute bottom-2 right-2 text-sm font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                  ${listing.weekly_price}/wk
                </div>
              </div>

              {/* Details */}
              <div className="p-3">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {listing.title || listing.address}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3 h-3" />
                  {listing.suburb || listing.city || `${listing.postcode}`}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {currentSuburb && (
        <Link
          href={`/seeker/search?suburb=${encodeURIComponent(currentSuburb)}`}
          className="mt-4 block text-center text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
        >
          View all rooms in {currentSuburb}
        </Link>
      )}
    </div>
  );
}
