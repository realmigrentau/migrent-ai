import { useState } from "react";
import { motion } from "framer-motion";
import { Review, flagReview } from "../../hooks/useReviews";

interface ReviewCardProps {
  review: Review;
  showListingContext?: boolean;
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const starSize = size === "sm" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${starSize} ${
            s <= rating ? "text-amber-400" : "text-slate-200 dark:text-slate-700"
          }`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
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

export default function ReviewCard({ review, showListingContext }: ReviewCardProps) {
  const [flagging, setFlagging] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  const handleFlag = async () => {
    if (!flagReason.trim() || flagReason.length < 5) return;
    setFlagging(true);
    const ok = await flagReview(review.id, flagReason);
    if (ok) setFlagged(true);
    setFlagging(false);
    setShowFlagInput(false);
  };

  const isSeeker = review.review_type === "seeker_to_owner";

  return (
    <div className="card p-5 rounded-2xl">
      {/* Header: stars + time */}
      <div className="flex items-start justify-between">
        <StarDisplay rating={review.rating} />
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {formatTimeAgo(review.created_at)}
        </span>
      </div>

      {/* Review text */}
      {review.review_text && (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          &ldquo;{review.review_text}&rdquo;
        </p>
      )}

      {/* Sub-ratings */}
      <div className="mt-3 flex flex-wrap gap-2">
        {isSeeker && review.migrant_friendliness && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-xs text-teal-700 dark:text-teal-300">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Migrant Friendly {review.migrant_friendliness}/5
          </span>
        )}
        {isSeeker && review.communication_language && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-xs text-blue-700 dark:text-blue-300">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            {review.communication_language}
          </span>
        )}
        {!isSeeker && review.reliability_rating && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 text-xs text-[var(--color-accent)] dark:text-[var(--color-accent)]">
            Reliable {review.reliability_rating}/5
          </span>
        )}
        {!isSeeker && review.cleanliness_rating && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10 text-xs text-violet-700 dark:text-[var(--color-primary)]">
            Clean {review.cleanliness_rating}/5
          </span>
        )}
        {!isSeeker && review.payment_rating && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300">
            Payment {review.payment_rating}/5
          </span>
        )}
      </div>

      {/* Reviewer info */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center overflow-hidden">
            {review.reviewer_photo ? (
              <img src={review.reviewer_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white">
                {(review.reviewer_name || "A").charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {review.reviewer_name || "Anonymous"}
            </p>
            <p className="text-[10px] text-slate-400">
              {isSeeker ? "Tenant" : "Owner"}
            </p>
          </div>
        </div>

        {/* Flag button */}
        {!flagged && !showFlagInput && (
          <button
            onClick={() => setShowFlagInput(true)}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            title="Report this review"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          </button>
        )}
        {flagged && (
          <span className="text-xs text-red-400">Reported</span>
        )}
      </div>

      {/* Flag input */}
      {showFlagInput && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-3 space-y-2 overflow-hidden"
        >
          <input
            type="text"
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            placeholder="Why are you reporting this review?"
            className="input-field text-sm"
            maxLength={500}
          />
          <div className="flex gap-2">
            <button
              onClick={handleFlag}
              disabled={flagging || flagReason.length < 5}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {flagging ? "Reporting..." : "Report"}
            </button>
            <button
              onClick={() => { setShowFlagInput(false); setFlagReason(""); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export { StarDisplay };
