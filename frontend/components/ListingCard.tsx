import { motion } from "framer-motion";
import { ReviewBadge } from "./reviews/ReviewStats";
import { BILLS_RANGE } from "../data/destinations";

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
  billsIncluded?: boolean;
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
  billsIncluded,
}: ListingCardProps) {
  const estimatedTotal = weeklyPrice + (billsIncluded ? 0 : BILLS_RANGE.default);
  const showStation = stationName && stationWalkMin != null;
  const showVisa = visaMatchLabel && visaMatchScore !== undefined && visaMatchScore >= 70;

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className="group bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-default"
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[15px] tracking-tight truncate">
            {address}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {city ? `${city}, ` : ""}
            {postcode}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-baseline gap-0.5">
            <span className="text-slate-900 dark:text-white font-semibold text-[17px] tabular-nums">
              ${weeklyPrice}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">/wk</span>
          </div>
          {!billsIncluded && (
            <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
              ~${estimatedTotal} all-in
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Meta pills - quieter */}
      {(showStation || showVisa) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {showStation && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                stationWalkMin! <= 15
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h4m4-8H6a2 2 0 00-2 2v14l4-3h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
              </svg>
              {stationWalkMin}m to {stationName}
            </span>
          )}
          {showVisa && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {visaMatchLabel} {visaMatchScore}%
            </span>
          )}
        </div>
      )}

      {/* Footer: rating + match */}
      {(avgRating !== undefined && reviewCount !== undefined && reviewCount > 0) || matchScore !== undefined ? (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          {avgRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
            <ReviewBadge avgRating={avgRating} reviewCount={reviewCount} />
          )}
          {matchScore !== undefined && (
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${matchScore}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                {matchScore}%
              </span>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
