import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ProfileReview } from "../../hooks/useProfileData";

interface ReviewCarouselProps {
  reviews: ProfileReview[];
  reviewsCount: number;
  averageRating: number;
  loading: boolean;
  ownerName: string;
}

export default function ReviewCarousel({ reviews, reviewsCount, averageRating, loading, ownerName }: ReviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1].map(i => (
          <div key={i} className="card p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full shimmer" />
              <div className="flex-1 space-y-2">
                <div className="w-24 h-4 shimmer rounded" />
                <div className="w-16 h-3 shimmer rounded" />
              </div>
            </div>
            <div className="w-full h-12 shimmer rounded mt-3" />
          </div>
        ))}
      </div>
    );
  }

  // If there are real reviews from DB, show them
  if (reviews.length > 0) {
    return (
      <div>
        {/* Rating summary */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {reviewsCount} review{reviewsCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Review cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1"
        >
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="snap-start shrink-0 w-[300px] md:w-[340px]"
            >
              <div className="card p-5 rounded-2xl h-full">
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg
                      key={s}
                      className={`w-4 h-4 ${s < review.rating ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-4">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {/* Reviewer */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center overflow-hidden">
                    {review.reviewer_photo ? (
                      <img src={review.reviewer_photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-white">{review.reviewer_name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{review.reviewer_name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {formatTimeAgo(review.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll indicators */}
        {reviews.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {reviews.slice(0, Math.min(reviews.length, 6)).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentIndex ? "bg-[var(--color-primary)]" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // No reviews - show count or empty state
  if (reviewsCount > 0) {
    return (
      <div className="card-subtle p-6 rounded-2xl text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {averageRating > 0 ? averageRating.toFixed(1) : "--"}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {reviewsCount} review{reviewsCount !== 1 ? "s" : ""} from verified guests
        </p>
      </div>
    );
  }

  return (
    <div className="card-subtle p-8 rounded-2xl text-center">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No reviews yet</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Reviews appear after completed stays</p>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}
