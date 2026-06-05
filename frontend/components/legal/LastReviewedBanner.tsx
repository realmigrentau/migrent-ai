import { Clock, User, CalendarCheck } from "lucide-react";

interface LastReviewedBannerProps {
  lastReviewed: string;
  reviewedBy?: string;
  nextReview?: string;
  sourceLinksVerified?: string;
}

export default function LastReviewedBanner({
  lastReviewed,
  reviewedBy,
  nextReview,
  sourceLinksVerified,
}: LastReviewedBannerProps) {
  return (
    <div className="card p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Last reviewed: <span className="font-medium text-slate-700 dark:text-slate-300">{lastReviewed}</span>
        </span>
        {reviewedBy && (
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            By: <span className="font-medium text-slate-700 dark:text-slate-300">{reviewedBy}</span>
          </span>
        )}
        {nextReview && (
          <span className="flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5" />
            Next review: <span className="font-medium text-slate-700 dark:text-slate-300">{nextReview}</span>
          </span>
        )}
        {sourceLinksVerified && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Links verified: <span className="font-medium text-slate-700 dark:text-slate-300">{sourceLinksVerified}</span>
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
        Content may have changed since this review. Always check official sources for the most current information.
      </p>
    </div>
  );
}
