import { motion } from "framer-motion";
import ModerationActions from "./ModerationActions";
import type { PendingListing } from "../../lib/adminModerationApi";

interface PendingListingsTableProps {
  listings: PendingListing[];
  loading: boolean;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string, notes?: string) => Promise<void>;
  onRequestChanges: (id: string, notes: string) => Promise<void>;
  onPause?: (id: string, reason: string, requiredActions: string[]) => Promise<void>;
  onPreview: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export default function PendingListingsTable({
  listings,
  loading,
  onApprove,
  onReject,
  onRequestChanges,
  onPause,
  onPreview,
}: PendingListingsTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-4 rounded-xl animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="card p-8 rounded-2xl text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">All caught up!</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No listings pending review right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((listing, i) => (
        <motion.div
          key={listing.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="card p-4 rounded-xl hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title || "Listing"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {listing.title || "Untitled Listing"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {listing.suburb}{listing.city ? `, ${listing.city}` : ""} - ${listing.weekly_price}/week
                  </p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {timeAgo(listing.created_at)}
                </span>
              </div>

              {/* Owner info */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center text-white text-[9px] font-bold overflow-hidden shrink-0">
                  {listing.owner_photo ? (
                    <img src={listing.owner_photo} alt={`${listing.owner_name || "Owner"} profile photo`} className="w-full h-full object-cover" />
                  ) : (
                    listing.owner_name?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {listing.owner_name}
                </span>
                {listing.owner_verified && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                    Verified
                  </span>
                )}
                {(!listing.images || listing.images.length === 0) && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-medium">
                    No photos
                  </span>
                )}
                {listing.images && listing.images.length > 0 && (
                  <span className="text-[10px] text-slate-400">
                    {listing.images.length} photo{listing.images.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Quick details */}
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                {listing.bedrooms && <span>{listing.bedrooms} bed</span>}
                {listing.property_type && <span>{listing.property_type}</span>}
                {listing.furnished && <span>Furnished</span>}
                {listing.bills_included && <span>Bills incl.</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="shrink-0">
              <ModerationActions
                listingId={listing.id}
                listingTitle={listing.title || "Untitled"}
                onApprove={onApprove}
                onReject={onReject}
                onRequestChanges={onRequestChanges}
                onPause={onPause}
                onPreview={onPreview}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
