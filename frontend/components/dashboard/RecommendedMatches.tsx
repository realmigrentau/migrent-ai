import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Train, Star, ShieldCheck, ArrowRight } from "lucide-react";
import type { RecommendedListing } from "../../hooks/useSeekerData";

interface Props {
  listings: RecommendedListing[];
  loading: boolean;
}

function MatchBadge({ score }: { score: number }) {
  let color = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
  if (score >= 90) {
    color = "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 text-[var(--color-accent)] dark:text-[var(--color-accent)]";
  } else if (score >= 80) {
    color = "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400";
  } else if (score >= 70) {
    color = "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}% match
    </span>
  );
}

export default function RecommendedMatches({ listings, loading }: Props) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card rounded-xl overflow-hidden animate-pulse"
          >
            <div className="h-32 bg-slate-200 dark:bg-slate-700" />
            <div className="p-4 space-y-3">
              <div className="shimmer h-4 w-3/4 rounded" />
              <div className="shimmer h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <Star className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          No recommendations yet. Complete your profile to get personalized matches!
        </p>
        <Link
          href="/account/settings"
          className="inline-flex items-center gap-2 btn-primary py-2 px-4 rounded-xl text-sm font-medium"
        >
          Complete Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {listings.map((listing, i) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Link href={`/listing/${listing.id}`}>
              <div className="card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group hover:shadow-md hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-primary)]/30 transition-all">
                {/* Image */}
                <div className="relative h-32 bg-slate-200 dark:bg-slate-700">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title || listing.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <MapPin className="w-8 h-8" />
                    </div>
                  )}

                  {/* Match score badge */}
                  <div className="absolute top-2 right-2">
                    <MatchBadge score={listing.match_score} />
                  </div>

                  {/* Badges row */}
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
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {listing.title || listing.address}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.suburb || listing.city || listing.address}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-primary)] shrink-0">
                      ${listing.weekly_price}/wk
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    {listing.nearest_transport && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Train className="w-3 h-3" />
                        {listing.nearest_transport}
                      </span>
                    )}
                    {listing.owner?.verified && (
                      <span className="text-xs text-blue-500 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {(listing as any).visa_match && (listing as any).near_uni && (
                      <span className="text-xs text-[var(--color-primary)] flex items-center gap-1">
                        Near uni
                      </span>
                    )}
                    {(listing as any).visa_match && (listing as any).near_cbd && (
                      <span className="text-xs text-blue-500 flex items-center gap-1">
                        Near CBD
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Browse more link */}
      <Link
        href="/seeker/search"
        className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] py-2"
      >
        Find more rooms
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
