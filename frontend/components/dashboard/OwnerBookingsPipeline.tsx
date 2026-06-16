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
import { useConfirm } from "../ui/ConfirmDialog";

interface Props {
  bookings: OwnerBooking[];
  loading: boolean;
  onAccept: (bookingId: string) => Promise<any>;
  onDecline: (bookingId: string) => Promise<any>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_OWNER: {
    label: "Pending",
    color: "text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]",
    bg: "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10",
  },
  OWNER_ACCEPTED: {
    label: "Approved",
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10",
  },
  PAID: {
    label: "Paid",
    color: "text-[var(--color-accent)] dark:text-[var(--color-accent)]",
    bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-[var(--color-ink-2)]",
    bg: "bg-[var(--color-surface-sunk)]/50",
  },
  OWNER_DECLINED: {
    label: "Declined",
    color: "text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]",
    bg: "bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-50)]0/10",
  },
  SEEKER_CANCELLED: {
    label: "Cancelled",
    color: "text-[var(--color-ink-3)]",
    bg: "bg-[var(--color-surface-sunk)]",
  },
  EXPIRED: {
    label: "Expired",
    color: "text-[var(--color-ink-3)]",
    bg: "bg-[var(--color-surface-sunk)]",
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
  const confirm = useConfirm();

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
    const ok = await confirm({
      title: "Decline this booking request?",
      description: "The seeker will be notified that you can't host them this time.",
      confirmLabel: "Decline request",
      cancelLabel: "Keep reviewing",
      tone: "danger",
    });
    if (!ok) return;
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
                  : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card rounded-xl p-8 text-center">
          <p className="text-sm text-[var(--color-ink-3)]">
            {activeTab === "all"
              ? "No bookings yet. They will appear here when seekers request your listings."
              : `No ${activeTab.toLowerCase().replace("_", " ")} bookings.`}
          </p>
        </div>
      ) : (
        /* Table header - desktop only */
        <div className="space-y-2">
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium text-[var(--color-ink-3)] uppercase tracking-wider">
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
                    ? "border-[var(--color-line-2)] dark:border-amber-500/30"
                    : "border-[var(--color-line)]"
                }`}
              >
                {/* Desktop row */}
                <div
                  className="hidden md:grid grid-cols-12 gap-3 items-center p-4 cursor-pointer hover:bg-[var(--color-surface)]/30 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : booking.id)
                  }
                >
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-line)] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[var(--color-ink-3)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                        {booking.seeker?.name || "Seeker"}
                      </p>
                      <p className="text-xs text-[var(--color-ink-3)]">
                        {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm text-[var(--color-ink-2)] truncate">
                      {booking.listing?.title ||
                        booking.listing?.address ||
                        "Listing"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[var(--color-ink-2)]">
                      {booking.check_in_date}
                    </p>
                    <p className="text-xs text-[var(--color-ink-3)]">
                      to {booking.check_out_date}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
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
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-danger-500)]/30 dark:border-red-500/30 text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)] hover:bg-[var(--color-danger-50)] dark:hover:bg-[var(--color-danger-50)]0/10 disabled:opacity-50 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Decline
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[var(--color-ink-3)]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[var(--color-ink-3)]" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile row */}
                <div
                  className="md:hidden p-4 cursor-pointer hover:bg-[var(--color-surface)]/30 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : booking.id)
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                        {booking.seeker?.name || "Seeker"}
                      </p>
                      <p className="text-xs text-[var(--color-ink-3)] mt-0.5 truncate">
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
                        <ChevronUp className="w-4 h-4 text-[var(--color-ink-3)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--color-ink-3)]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-[var(--color-line)] p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-[var(--color-ink-3)] mb-0.5">
                          Check-in
                        </p>
                        <p className="font-medium text-[var(--color-ink)]">
                          {booking.check_in_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-ink-3)] mb-0.5">
                          Check-out
                        </p>
                        <p className="font-medium text-[var(--color-ink)]">
                          {booking.check_out_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-ink-3)] mb-0.5">
                          Weekly rate
                        </p>
                        <p className="font-medium text-[var(--color-ink)]">
                          ${booking.weekly_price_at_time?.toLocaleString()}/wk
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-ink-3)] mb-0.5">
                          Total rent
                        </p>
                        <p className="font-medium text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                          ${booking.total_price?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {booking.message_to_owner && (
                      <div className="p-3 rounded-lg bg-[var(--color-surface-sunk)]">
                        <p className="text-xs text-[var(--color-ink-3)] mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Message from seeker
                        </p>
                        <p className="text-sm text-[var(--color-ink-2)]">
                          {booking.message_to_owner}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-[var(--color-ink-3)]">
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
                          className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border border-[var(--color-danger-500)]/30 dark:border-red-500/30 text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)] hover:bg-[var(--color-danger-50)] dark:hover:bg-[var(--color-danger-50)]0/10 flex items-center justify-center gap-2 disabled:opacity-50"
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
