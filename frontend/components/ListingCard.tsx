import { motion } from "framer-motion";
import { ReviewBadge } from "./reviews/ReviewStats";

interface ListingCardProps {
  address: string;
  city?: string;
  postcode: string;
  weeklyPrice: number;
  description: string;
  matchScore?: number;
  avgRating?: number;
  reviewCount?: number;
  stationName?: string;
  stationWalkMin?: number;
  visaMatchLabel?: string;
  visaMatchScore?: number;
}

export default function ListingCard({
  address,
  city,
  postcode,
  weeklyPrice,
  description,
  matchScore,
  avgRating,
  reviewCount,
  stationName,
  stationWalkMin,
  visaMatchLabel,
  visaMatchScore,
}: ListingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group card p-5 hover:shadow-md dark:hover:shadow-2xl cursor-default"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">{address}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {city ? `${city}, ` : ""}
            {postcode}
          </p>
        </div>
        <div className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
          <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">
            ${weeklyPrice}
          </span>
          <span className="text-rose-400 dark:text-rose-500 text-xs">/wk</span>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Station pill - green for <15min, blue otherwise */}
      {stationName && stationWalkMin != null && (
        <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
          stationWalkMin <= 15
            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
            : "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20"
        }`}>
          <svg className={`w-3.5 h-3.5 ${stationWalkMin <= 15 ? "text-emerald-500" : "text-blue-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h4m4-8H6a2 2 0 00-2 2v14l4-3h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
          </svg>
          <span className={`text-xs font-medium ${
            stationWalkMin <= 15
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-blue-700 dark:text-blue-300"
          }`}>
            {stationWalkMin} min walk to {stationName}
          </span>
        </div>
      )}

      {/* Visa match badge */}
      {visaMatchLabel && visaMatchScore !== undefined && visaMatchScore >= 70 && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
            {visaMatchLabel} ({visaMatchScore}%)
          </span>
        </div>
      )}

      {/* Rating badge + match score */}
      <div className="mt-3 flex items-center gap-3">
        {avgRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
          <ReviewBadge avgRating={avgRating} reviewCount={reviewCount} />
        )}
        {matchScore !== undefined && (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${matchScore}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
              />
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {matchScore}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
