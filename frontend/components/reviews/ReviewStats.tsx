import { ReviewStats as ReviewStatsType } from "../../hooks/useReviews";

interface ReviewStatsProps {
  stats: ReviewStatsType;
  compact?: boolean;
}

// Compact badge for listing cards
export function ReviewBadge({ avgRating, reviewCount }: { avgRating: number; reviewCount: number }) {
  if (reviewCount === 0) return null;

  return (
    <div className="inline-flex items-center gap-1">
      <svg className="w-3.5 h-3.5 text-[var(--color-warn-500)]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="text-xs font-bold text-[var(--color-ink)]">
        {avgRating > 0 ? Number(avgRating).toFixed(1) : "--"}
      </span>
      <span className="text-xs text-[var(--color-ink-3)]">
        ({reviewCount})
      </span>
    </div>
  );
}

// Full stats display for profiles/listing detail
export default function ReviewStats({ stats, compact }: ReviewStatsProps) {
  if (stats.review_count === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--color-ink-3)]">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        No reviews yet
      </div>
    );
  }

  if (compact) {
    return <ReviewBadge avgRating={stats.avg_rating} reviewCount={stats.review_count} />;
  }

  const ratingPercent = (Number(stats.avg_rating) / 5) * 100;

  return (
    <div className="space-y-3">
      {/* Main rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <svg className="w-6 h-6 text-[var(--color-warn-500)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-2xl font-black text-[var(--color-ink)]">
            {Number(stats.avg_rating).toFixed(1)}
          </span>
        </div>
        <div className="flex-1">
          <div className="h-2 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] from-[var(--color-warn-500)] to-[var(--color-warn-500)] transition-all duration-500"
              style={{ width: `${ratingPercent}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-[var(--color-ink-3)] min-w-[80px] text-right">
          {stats.review_count} review{stats.review_count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Migrant friendliness */}
      {stats.avg_migrant_friendliness != null && Number(stats.avg_migrant_friendliness) > 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 text-xs font-medium text-[var(--color-primary-700)] dark:text-teal-300">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Migrant Friendly - {Number(stats.avg_migrant_friendliness).toFixed(1)}/5
          </span>
        </div>
      )}
    </div>
  );
}
