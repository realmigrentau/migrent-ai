import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import AdminMetrics from "../../components/admin/AdminMetrics";
import PendingListingsTable from "../../components/admin/PendingListingsTable";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchPendingListings,
  fetchAdminModerationStats,
  fetchAdminActivity,
  approveListing,
  rejectListing,
  requestListingChanges,
  type PendingListing,
  type AdminStats,
  type AdminActivity,
} from "../../lib/adminModerationApi";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function actionIcon(action: string) {
  switch (action) {
    case "approve":
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      );
    case "reject":
      return (
        <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    case "request_changes":
      return (
        <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

function actionLabel(action: string): string {
  switch (action) {
    case "approve": return "Approved";
    case "reject": return "Rejected";
    case "request_changes": return "Requested changes on";
    default: return action;
  }
}

export default function ModerationPage() {
  const { session } = useAuth();
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [suburbFilter, setSuburbFilter] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const token = session?.access_token || "";

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pendingRes, statsRes, activityRes] = await Promise.all([
        fetchPendingListings(token, { suburb: suburbFilter || undefined }),
        fetchAdminModerationStats(token),
        fetchAdminActivity(token, 10),
      ]);
      setListings(pendingRes.listings);
      setStats(statsRes);
      setActivities(activityRes.activities);
    } catch (err) {
      console.error("Failed to load moderation data:", err);
    }
    setLoading(false);
  }, [token, suburbFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleApprove = async (id: string, notes?: string) => {
    await approveListing(token, id, notes);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setStats((prev) => prev ? { ...prev, pending: prev.pending - 1, approved_today: prev.approved_today + 1 } : prev);
    showSuccess("Listing approved - owner notified by email");
    // Refresh activity
    fetchAdminActivity(token, 10).then((res) => setActivities(res.activities));
  };

  const handleReject = async (id: string, reason: string, notes?: string) => {
    await rejectListing(token, id, reason, notes);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setStats((prev) => prev ? { ...prev, pending: prev.pending - 1, rejected_today: prev.rejected_today + 1 } : prev);
    showSuccess("Listing rejected - owner notified with reason");
    fetchAdminActivity(token, 10).then((res) => setActivities(res.activities));
  };

  const handleRequestChanges = async (id: string, changeNotes: string) => {
    await requestListingChanges(token, id, changeNotes);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setStats((prev) => prev ? { ...prev, pending: prev.pending - 1, changes_requested_today: (prev.changes_requested_today || 0) + 1 } : prev);
    showSuccess("Changes requested - owner notified by email");
    fetchAdminActivity(token, 10).then((res) => setActivities(res.activities));
  };

  const handlePreview = (id: string) => {
    window.open(`${FRONTEND_URL}/listing/${id}`, "_blank");
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            Listing <span className="gradient-text">Moderation</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review and approve new listings before they go live.
          </p>
        </div>

        {/* Success toast */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMessage}
          </motion.div>
        )}

        {/* Stats Cards */}
        <AdminMetrics stats={stats} loading={loading} />

        {/* Pending Listings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Pending Review
              {stats && stats.pending > 0 && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse">
                  {stats.pending} listing{stats.pending !== 1 ? "s" : ""}
                </span>
              )}
            </h2>
            <input
              type="text"
              value={suburbFilter}
              onChange={(e) => setSuburbFilter(e.target.value)}
              placeholder="Filter by suburb..."
              className="input-field text-sm max-w-[200px]"
            />
          </div>

          <PendingListingsTable
            listings={listings}
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestChanges={handleRequestChanges}
            onPreview={handlePreview}
          />
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="card rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
            {activities.length === 0 && !loading && (
              <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                No moderation activity yet.
              </div>
            )}
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 px-4 py-3">
                {actionIcon(activity.action)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">{activity.admin_name}</span>{" "}
                    {actionLabel(activity.action)}{" "}
                    <span className="font-medium">{activity.listing_title}</span>
                    {activity.listing_suburb && (
                      <span className="text-slate-400"> in {activity.listing_suburb}</span>
                    )}
                  </p>
                  {activity.reason && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      Reason: {activity.reason}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                  {timeAgo(activity.created_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
