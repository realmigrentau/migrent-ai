import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
} from "lucide-react";
import type { OwnerBooking } from "../../hooks/useOwnerData";

interface Props {
  bookings: OwnerBooking[];
  loading: boolean;
  onAccept: (bookingId: string) => Promise<any>;
  onDecline: (bookingId: string) => Promise<any>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_OWNER: {
    label: "Pending",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  OWNER_ACCEPTED: {
    label: "Approved",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  PAID: {
    label: "Paid",
    color: "text-[var(--color-accent)] dark:text-[var(--color-accent)]",
    bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800/50",
  },
  OWNER_DECLINED: {
    label: "Declined",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
  },
  SEEKER_CANCELLED: {
    label: "Cancelled",
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800/50",
  },
  EXPIRED: {
    label: "Expired",
    color: "text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800/50",
  },
};

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "PENDING_OWNER", label: "Pending" },
  { key: "OWNER_ACCEPTED", label: "Approved" },
  { key: "PAID", label: "Paid" },
  { key: "COMPLETED", label: "Completed" },
];

export default function OwnerBookingsPipeline({
  bookings,
  loading,
  onAccept,
  onDecline,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  const handleAccept = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const result = await onAccept(bookingId);
      if (result?.checkout_url) {
        window.open(result.checkout_url, "_blank");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    if (!confirm("Are you sure you want to decline this booking request?"))
      return;
    setActionLoading(bookingId);
    try {
      await onDecline(bookingId);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card rounded-xl p-4 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? bookings.length
              : bookings.filter((b) => b.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card rounded-xl p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {activeTab === "all"
              ? "No bookings yet. They will appear here when seekers request your listings."
              : `No ${activeTab.toLowerCase().replace("_", " ")} bookings.`}
          </p>
        </div>
      ) : (
        /* Table header - desktop only */
        <div className="space-y-2">
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Seeker</div>
            <div className="col-span-3">Listing</div>
            <div className="col-span-2">Dates</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {filtered.map((booking) => {
            const status =
              STATUS_CONFIG[booking.status] || STATUS_CONFIG.EXPIRED;
            const isExpanded = expandedId === booking.id;
            const isPending = booking.status === "PENDING_OWNER";

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card rounded-xl overflow-hidden border transition-colors ${
                  isPending
                    ? "border-amber-200 dark:border-amber-500/30"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                {/* Desktop row */}
                <div
                  className="hidden md:grid grid-cols-12 gap-3 items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : booking.id)
                  }
                >
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {booking.seeker?.name || "Seeker"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                      {booking.listing?.title ||
                        booking.listing?.address ||
                        "Listing"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {booking.check_in_date}
                    </p>
                    <p className="text-xs text-slate-400">
                      to {booking.check_out_date}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      ${booking.total_price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    {isPending ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(booking.id);
                          }}
                          disabled={actionLoading === booking.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-accent-soft)]0 text-white hover:bg-[var(--color-accent)] disabled:opacity-50 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecline(booking.id);
                          }}
                          disabled={actionLoading === booking.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Decline
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile row */}
                <div
                  className="md:hidden p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : booking.id)
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {booking.seeker?.name || "Seeker"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {booking.listing?.title ||
                          booking.listing?.address ||
                          "Listing"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}
                      >
                        {status.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">
                          Check-in
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {booking.check_in_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">
                          Check-out
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {booking.check_out_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">
                          Weekly rate
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          ${booking.weekly_price_at_time?.toLocaleString()}/wk
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">
                          Total rent
                        </p>
                        <p className="font-medium text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                          ${booking.total_price?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {booking.message_to_owner && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Message from seeker
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {booking.message_to_owner}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-slate-400">
                      Requested{" "}
                      {new Date(booking.created_at).toLocaleDateString(
                        "en-AU",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>

                    {/* Mobile actions */}
                    {isPending && (
                      <div className="flex gap-3 pt-2 md:hidden">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAccept(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="flex-1 btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading === booking.id ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDecline(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Decline
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
