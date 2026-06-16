import { motion } from "framer-motion";
import Link from "next/link";
import { ProfileListing } from "../../hooks/useProfileData";

interface ListingsGridProps {
  listings: ProfileListing[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  ownerName: string;
}

export default function ListingsGrid({ listings, loading, hasMore, onLoadMore, ownerName }: ListingsGridProps) {
  if (!loading && listings.length === 0) {
    return (
      <div className="card-subtle p-8 rounded-2xl text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[var(--color-surface-muted)] flex items-center justify-center">
          <svg className="w-7 h-7 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--color-ink-2)]">{ownerName} hasn&apos;t listed any properties yet</p>
        <p className="text-xs text-[var(--color-ink-3)] mt-1">Check back later for new listings</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing, i) => (
          <ListingItem key={listing.id} listing={listing} index={i} />
        ))}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={`skel-${i}`} className="card rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] shimmer" />
            <div className="p-4 space-y-2">
              <div className="w-3/4 h-4 shimmer rounded" />
              <div className="w-1/2 h-3 shimmer rounded" />
              <div className="w-1/3 h-5 shimmer rounded mt-2" />
            </div>
          </div>
        ))}
      </div>

      {hasMore && !loading && (
        <div className="text-center mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLoadMore}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-[var(--color-line)] text-[var(--color-ink-2)] hover:bg-[var(--color-surface)] transition-colors"
          >
            Load more listings
          </motion.button>
        </div>
      )}
    </div>
  );
}

function ListingItem({ listing, index }: { listing: ProfileListing; index: number }) {
  const photo = listing.photos[0];
  const typeIcon = listing.property_type === "Apartment" ? "🏢" : listing.property_type === "Studio" ? "🏠" : "🏡";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/owner/listings/${listing.id}`} className="block group">
        <div className="card rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-2xl transition-all">
          {/* Photo */}
          <div className="aspect-[4/3] bg-[var(--color-surface-muted)] relative overflow-hidden">
            {photo ? (
              <img
                src={photo}
                alt={listing.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">{typeIcon}</span>
              </div>
            )}
            {/* Price badge */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-[var(--color-surface)]/90 backdrop-blur-sm shadow-md">
              <span className="text-sm font-bold text-[var(--color-ink)]">${listing.weekly_price}</span>
              <span className="text-xs text-[var(--color-ink-3)]">/wk</span>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-bold text-sm text-[var(--color-ink)] truncate group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-primary)] transition-colors">
              {listing.title}
            </h3>
            <p className="text-xs text-[var(--color-ink-3)] mt-1 truncate">
              {listing.address} · {listing.postcode}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-ink-3)]">
              <span>{listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{listing.bathrooms} bath{listing.bathrooms !== 1 ? "s" : ""}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{listing.place_type}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
