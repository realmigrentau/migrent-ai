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
  const closeStation = showStation && stationWalkMin! <= 15;

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className="group bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[14px] p-5 hover:border-[var(--color-line-2)] transition-colors cursor-default"
    >
      {/* Eyebrow + Title row */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="min-w-0">
          {(city || postcode) && (
            <div className="eyebrow truncate">
              {city ? `${city}` : ""}{city && postcode ? " · " : ""}{postcode}
            </div>
          )}
          <h3 className="mt-1 font-semibold text-[var(--color-ink)] text-[15px] tracking-[-0.005em] leading-[1.3] line-clamp-2">
            {address}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[var(--color-ink)] font-bold text-[20px] tracking-[-0.02em] tabular-nums">
              ${weeklyPrice}
            </span>
            <span className="text-[var(--color-ink-3)] text-[12px] font-medium">
              AUD/wk
            </span>
          </div>
          {!billsIncluded && (
            <p className="text-[11px] text-[var(--color-ink-4)] mt-0.5 tabular-nums">
              ~${estimatedTotal} all-in
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-[13px] text-[var(--color-ink-2)] leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Meta pills */}
      {(showStation || showVisa || billsIncluded) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {billsIncluded && (
            <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full text-[11.5px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Bills inc.
            </span>
          )}
          {showStation && (
            <span
              className={`inline-flex items-center gap-1 h-[22px] px-2 rounded-full text-[11.5px] font-semibold ${
                closeStation
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)]"
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h4m4-8H6a2 2 0 00-2 2v14l4-3h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
              </svg>
              {stationWalkMin}m to {stationName}
            </span>
          )}
          {showVisa && (
            <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full text-[11.5px] font-semibold bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
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
        <div className="mt-4 pt-3 border-t border-[var(--color-line)] flex items-center gap-3">
          {avgRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
            <ReviewBadge avgRating={avgRating} reviewCount={reviewCount} />
          )}
          {matchScore !== undefined && (
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-[var(--color-surface-sunk)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${matchScore}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-[var(--color-accent)]"
                />
              </div>
              <span className="text-[11px] font-semibold text-[var(--color-accent)] tabular-nums">
                {matchScore}%
              </span>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
