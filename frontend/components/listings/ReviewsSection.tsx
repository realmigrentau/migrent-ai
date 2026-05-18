import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronDown } from "lucide-react";
import { useListingReviews } from "../../hooks/useReviews";
import ReviewStats from "../reviews/ReviewStats";

interface ReviewsSectionProps {
  listingId: string;
  initialStats?: {
    review_count: number;
    avg_rating: number;
    avg_migrant_friendliness?: number | null;
    positive_count?: number;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 dark:text-slate-700"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: {
    id: string;
    rating: number;
    review_text: string | null;
    migrant_friendliness: number | null;
    photos: string[];
    created_at: string;
    reviewer_name?: string;
    reviewer_photo?: string | null;
  };
}) {
  const date = new Date(review.created_at);
  const relativeDate = getRelativeTime(date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4 border-b border-slate-100 dark:border-slate-800 last:border-0"
    >
      <div className="flex items-start gap-3">
        {review.reviewer_photo ? (
          <img
            src={review.reviewer_photo}
            alt={review.reviewer_name || "Reviewer"}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">
            {(review.reviewer_name || "A").charAt(0)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">
              {review.reviewer_name || "Anonymous"}
            </p>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {relativeDate}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <StarRating rating={review.rating} />
            {review.migrant_friendliness != null &&
              review.migrant_friendliness > 0 && (
                <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                  Migrant friendly: {review.migrant_friendliness}/5
                </span>
              )}
          </div>

          {review.review_text && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {review.review_text}
            </p>
          )}

          {review.photos && review.photos.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {review.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
}

export default function ReviewsSection({
  listingId,
  initialStats,
}: ReviewsSectionProps) {
  const { reviews, stats, loading, hasMore, loadMore } =
    useListingReviews(listingId);
  const [expanded, setExpanded] = useState(false);

  const displayStats = stats.review_count > 0 ? stats : initialStats || stats;

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Reviews
        </h2>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Reviews
      </h2>

      <ReviewStats stats={displayStats} />

      {reviews.length > 0 ? (
        <div className="mt-4">
          {(expanded ? reviews : reviews.slice(0, 3)).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {reviews.length > 3 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-3 flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              Show all {reviews.length} reviews
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {expanded && hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="mt-3 flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load more reviews"}
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
          No reviews yet. Be the first to book and review this place.
        </p>
      )}
    </div>
  );
}
