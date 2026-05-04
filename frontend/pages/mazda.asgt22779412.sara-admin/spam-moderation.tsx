import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchFlaggedListings,
  fetchSpamStats,
  fetchModerationEvents,
  approveFlaggedListing,
  hideListing,
  requestDeleteListing,
  confirmDeleteListing,
  unflagListing,
  rescanListing,
  type FlaggedListing,
  type SpamStats,
  type ModerationEvent,
} from "../../lib/spamModerationApi";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "-";
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

function spamScoreBadge(score: number) {
  let bg = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (score >= 60) bg = "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400";
  else if (score >= 30) bg = "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg}`}>
      {score}/100
    </span>
  );
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    flagged: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    hidden: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
    delete_requested: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
    deleted: "bg-slate-100 dark:bg-slate-500/20 text-slate-500",
    approved: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  const label: Record<string, string> = {
    flagged: "Flagged",
    hidden: "Hidden",
    delete_requested: "Delete Pending",
    deleted: "Deleted",
    approved: "Approved",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${map[status] || "bg-slate-100 text-slate-500"}`}>
      {label[status] || status}
    </span>
  );
}

export default function SpamModerationPage() {
  const { session } = useAuth();
  const [listings, setListings] = useState<FlaggedListing[]>([]);
  const [stats, setStats] = useState<SpamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedListing, setSelectedListing] = useState<FlaggedListing | null>(null);
  const [events, setEvents] = useState<ModerationEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [actionModal, setActionModal] = useState<"delete" | "confirm-delete" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const token = session?.access_token || "";

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [flaggedRes, statsRes] = await Promise.all([
        fetchFlaggedListings(token, { status: statusFilter || undefined }),
        fetchSpamStats(token),
      ]);
      setListings(flaggedRes.listings);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed to load spam moderation data:", err);
    }
    setLoading(false);
  }, [token, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const openDrawer = async (listing: FlaggedListing) => {
    setSelectedListing(listing);
    setEventsLoading(true);
    try {
      const res = await fetchModerationEvents(token, listing.id);
      setEvents(res.events);
    } catch {
      setEvents([]);
    }
    setEventsLoading(false);
  };

  const closeDrawer = () => {
    setSelectedListing(null);
    setEvents([]);
    setActionModal(null);
    setActionReason("");
    setActionNotes("");
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await approveFlaggedListing(token, id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      showSuccess("Listing approved - owner notified");
      closeDrawer();
      loadData();
    } catch (err: any) {
      showSuccess(`Error: ${err.message}`);
    }
    setActionLoading(false);
  };

  const handleHide = async (id: string) => {
    setActionLoading(true);
    try {
      await hideListing(token, id);
      showSuccess("Listing hidden from public view");
      closeDrawer();
      loadData();
    } catch (err: any) {
      showSuccess(`Error: ${err.message}`);
    }
    setActionLoading(false);
  };

  const handleUnflag = async (id: string) => {
    setActionLoading(true);
    try {
      await unflagListing(token, id);
      showSuccess("Flag removed - listing returned to pending review");
      closeDrawer();
      loadData();
    } catch (err: any) {
      showSuccess(`Error: ${err.message}`);
    }
    setActionLoading(false);
  };

  const handleRequestDelete = async () => {
    if (!selectedListing || !actionReason) return;
    setActionLoading(true);
    try {
      await requestDeleteListing(token, selectedListing.id, actionReason, actionNotes || undefined);
      showSuccess("Deletion requested - needs your confirmation to finalize");
      setActionModal(null);
      closeDrawer();
      loadData();
    } catch (err: any) {
      showSuccess(`Error: ${err.message}`);
    }
    setActionLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedListing) return;
    setActionLoading(true);
    try {
      await confirmDeleteListing(token, selectedListing.id, actionNotes || undefined);
      showSuccess("Listing permanently deleted - owner notified");
      setActionModal(null);
      closeDrawer();
      loadData();
    } catch (err: any) {
      showSuccess(`Error: ${err.message}`);
    }
    setActionLoading(false);
  };

  const handleRescan = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await rescanListing(token, id);
      showSuccess(`Rescan complete - new score: ${res.spam_score}/100`);
      loadData();
      if (selectedListing?.id === id) {
        setSelectedListing((prev) => prev ? { ...prev, spam_score: res.spam_score, spam_reasons: res.reasons } : null);
        const evRes = await fetchModerationEvents(token, id);
        setEvents(evRes.events);
      }
    } catch (err: any) {
      showSuccess(`Error: ${err.message}`);
    }
    setActionLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            Spam <span className="gradient-text">Moderation</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review flagged listings. No listing is deleted without your confirmation.
          </p>
        </div>

        {/* Success toast */}
        <AnimatePresence>
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
        </AnimatePresence>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Flagged", value: stats.flagged, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
              { label: "Hidden", value: stats.hidden, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
              { label: "Delete Pending", value: stats.delete_requested, color: "text-red-700 dark:text-red-300", bg: "bg-red-100 dark:bg-red-500/20" },
              { label: "Avg Score", value: stats.avg_spam_score, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
            ].map((s) => (
              <div key={s.label} className="card rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{s.label}</p>
                <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "", label: "All", count: stats ? stats.total_requiring_action : 0 },
            { value: "flagged", label: "Flagged", count: stats?.flagged || 0 },
            { value: "hidden", label: "Hidden", count: stats?.hidden || 0 },
            { value: "delete_requested", label: "Delete Pending", count: stats?.delete_requested || 0 },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === tab.value
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-xs opacity-75">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
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
        ) : listings.length === 0 ? (
          <div className="card p-8 rounded-2xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">All clear!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No flagged or hidden listings requiring attention.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openDrawer(listing)}
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0]} alt={listing.title || "Listing"} className="w-full h-full object-cover" />
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                            {listing.title || "Untitled Listing"}
                          </h3>
                          {statusBadge(listing.moderation_status)}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {listing.suburb}{listing.city ? `, ${listing.city}` : ""} - ${listing.weekly_price}/week
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {spamScoreBadge(listing.spam_score)}
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {timeAgo(listing.flagged_at || listing.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Owner info */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden shrink-0">
                        {listing.owner_photo ? (
                          <img src={listing.owner_photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          listing.owner_name?.charAt(0).toUpperCase() || "?"
                        )}
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300">{listing.owner_name}</span>
                      {listing.owner_verified && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Spam reasons preview */}
                    {listing.spam_reasons && listing.spam_reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {listing.spam_reasons.slice(0, 3).map((reason, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                            {reason}
                          </span>
                        ))}
                        {listing.spam_reasons.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{listing.spam_reasons.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Review Drawer / Modal */}
        <AnimatePresence>
          {selectedListing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
              onClick={closeDrawer}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl"
              >
                {/* Drawer header */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review Listing</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {statusBadge(selectedListing.moderation_status)}
                      {spamScoreBadge(selectedListing.spam_score)}
                    </div>
                  </div>
                  <button onClick={closeDrawer} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="px-6 py-4 space-y-6">
                  {/* Listing preview */}
                  <div>
                    {selectedListing.images && selectedListing.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                        {selectedListing.images.slice(0, 5).map((img, idx) => (
                          <img key={idx} src={img} alt="" className="w-24 h-24 rounded-lg object-cover shrink-0" />
                        ))}
                      </div>
                    )}
                    <h3 className="font-bold text-slate-900 dark:text-white">{selectedListing.title || "Untitled"}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {selectedListing.address}, {selectedListing.suburb} {selectedListing.postcode}
                    </p>
                    <p className="text-sm font-semibold text-rose-500 mt-1">${selectedListing.weekly_price}/week</p>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</h4>
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {selectedListing.description || "No description"}
                    </div>
                  </div>

                  {/* Owner info */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                      {selectedListing.owner_photo ? (
                        <img src={selectedListing.owner_photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        selectedListing.owner_name?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedListing.owner_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedListing.owner_email}</p>
                    </div>
                    {selectedListing.owner_verified && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Spam Reasons */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Detection Reasons ({selectedListing.spam_reasons?.length || 0})
                    </h4>
                    {selectedListing.spam_reasons && selectedListing.spam_reasons.length > 0 ? (
                      <ul className="space-y-1.5">
                        {selectedListing.spam_reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                            </svg>
                            <span className="text-slate-600 dark:text-slate-400">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400">No detection reasons recorded.</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApprove(selectedListing.id)}
                        disabled={actionLoading}
                        className="text-sm font-semibold py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUnflag(selectedListing.id)}
                        disabled={actionLoading}
                        className="text-sm font-semibold py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                      >
                        Unflag
                      </button>
                      {selectedListing.moderation_status !== "hidden" && (
                        <button
                          onClick={() => handleHide(selectedListing.id)}
                          disabled={actionLoading}
                          className="text-sm font-semibold py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50"
                        >
                          Hide
                        </button>
                      )}
                      {selectedListing.moderation_status === "delete_requested" ? (
                        <button
                          onClick={() => setActionModal("confirm-delete")}
                          disabled={actionLoading}
                          className="text-sm font-semibold py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                        >
                          Confirm Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => setActionModal("delete")}
                          disabled={actionLoading}
                          className="text-sm font-semibold py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                        >
                          Request Delete
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleRescan(selectedListing.id)}
                        disabled={actionLoading}
                        className="text-xs font-medium py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                        Rescan
                      </button>
                      <button
                        onClick={() => window.open(`${FRONTEND_URL}/listing/${selectedListing.id}`, "_blank")}
                        className="text-xs font-medium py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Audit trail */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Audit Trail</h4>
                    {eventsLoading ? (
                      <div className="space-y-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : events.length === 0 ? (
                      <p className="text-sm text-slate-400">No events recorded.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {events.map((event) => (
                          <div key={event.id} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-500">
                              {event.actor_type === "system" ? "S" : event.actor_name?.charAt(0) || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-700 dark:text-slate-300">
                                <span className="font-medium">{event.actor_name || "System"}</span>{" "}
                                <span className="text-slate-500">{event.event_type.replace(/_/g, " ")}</span>
                                {event.spam_score != null && (
                                  <span className="text-slate-400"> (score: {event.spam_score})</span>
                                )}
                              </p>
                              {event.notes && (
                                <p className="text-slate-400 dark:text-slate-500 mt-0.5 truncate">{event.notes}</p>
                              )}
                            </div>
                            <span className="text-slate-400 whitespace-nowrap shrink-0">
                              {timeAgo(event.created_at)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Request Modal */}
        <AnimatePresence>
          {actionModal === "delete" && selectedListing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setActionModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="card p-6 rounded-2xl max-w-md w-full"
              >
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">Request Deletion</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  This marks the listing for deletion. You will need to confirm the deletion in a second step.
                </p>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reason (required)
                </label>
                <select
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="input-field text-sm mb-3"
                >
                  <option value="">Select a reason...</option>
                  <option value="Confirmed spam listing">Confirmed spam listing</option>
                  <option value="Scam or fraudulent listing">Scam or fraudulent listing</option>
                  <option value="Duplicate listing">Duplicate listing</option>
                  <option value="Prohibited content">Prohibited content</option>
                  <option value="Fake or misleading listing">Fake or misleading listing</option>
                  <option value="Policy violation">Policy violation</option>
                </select>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Internal notes..."
                  className="input-field text-sm resize-none h-20 mb-4"
                />

                <div className="flex gap-2">
                  <button onClick={() => setActionModal(null)} className="btn-secondary text-sm !py-2 flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestDelete}
                    disabled={actionLoading || !actionReason}
                    className="text-sm font-semibold py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors flex-1 disabled:opacity-50"
                  >
                    {actionLoading ? "Requesting..." : "Request Deletion"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm Delete Modal */}
        <AnimatePresence>
          {actionModal === "confirm-delete" && selectedListing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setActionModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="card p-6 rounded-2xl max-w-md w-full"
              >
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">Confirm Permanent Deletion</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  This will permanently remove <strong>{selectedListing.title || "this listing"}</strong> and notify the owner.
                </p>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 mb-4">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    This action cannot be undone. The listing data is preserved for audit but will no longer be visible.
                  </p>
                </div>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Final notes (optional)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Any final notes..."
                  className="input-field text-sm resize-none h-16 mb-4"
                />

                <div className="flex gap-2">
                  <button onClick={() => setActionModal(null)} className="btn-secondary text-sm !py-2 flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={actionLoading}
                    className="text-sm font-semibold py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors flex-1 disabled:opacity-50"
                  >
                    {actionLoading ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
