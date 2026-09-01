import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Ban,
  User,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import type { SeekerBooking } from "../../hooks/useSeekerData";
import { useConfirm } from "../ui/ConfirmDialog";

interface Props {
  bookings: SeekerBooking[];
  loading: boolean;
  onCancel: (bookingId: string) => Promise<any>;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING_OWNER: {
    label: "Awaiting Response",
    color: "text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]",
    bg: "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10",
  },
  OWNER_ACCEPTED: {
    label: "Pay Now",
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10",
  },
  PAID: {
    label: "Confirmed",
    color: "text-[var(--color-accent)] dark:text-[var(--color-accent)]",
    bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-[var(--color-ink-2)]",
    bg: "bg-[var(--color-surface-sunk)]/50",
  },
  OWNER_DECLINED: {
    label: "Declined",
    color: "text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]",
    bg: "bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-500)]/10",
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
  { key: "OWNER_ACCEPTED", label: "Pay Now" },
  { key: "PAID", label: "Confirmed" },
  { key: "COMPLETED", label: "Completed" },
];

export default function DashboardSeekerBookings({
  bookings,
  loading,
  onCancel,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const confirm = useConfirm();

  const filtered =
    activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  const handleCancel = async (bookingId: string) => {
    const ok = await confirm({
      title: "Cancel this booking?",
      description: "The room will be released and the host will be notified. This can't be undone.",
      confirmLabel: "Cancel booking",
      cancelLabel: "Keep booking",
      tone: "danger",
    });
    if (!ok) return;
    setCancelLoading(bookingId);
    try {
      await onCancel(bookingId);
    } finally {
      setCancelLoading(null);
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
              ? "No bookings yet. Browse listings and send your first booking request!"
              : `No ${activeTab.toLowerCase().replace("_", " ")} bookings.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table header - desktop only */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium text-[var(--color-ink-3)] uppercase tracking-wider">
            <div className="col-span-3">Listing</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Dates</div>
            <div className="col-span-2">Total Cost</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {filtered.map((booking) => {
            const status =
              STATUS_CONFIG[booking.status] || STATUS_CONFIG.EXPIRED;
            const isExpanded = expandedId === booking.id;
            const canCancel = ["PENDING_OWNER", "OWNER_ACCEPTED"].includes(
              booking.status
            );
            const needsPayment = booking.status === "OWNER_ACCEPTED";

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card rounded-xl overflow-hidden border transition-colors ${
                  needsPayment
                    ? "border-[var(--color-primary-100)] dark:border-blue-500/30"
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
                    {booking.listing?.images?.[0] ? (
                      <img
                        src={booking.listing.images[0]}
                        alt={booking.listing?.title ? `${booking.listing.title} listing photo` : "Listing photo"}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-line)] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                        {booking.listing?.title ||
                          booking.listing?.address ||
                          "Listing"}
                      </p>
                      <p className="text-xs text-[var(--color-ink-3)] truncate">
                        {booking.listing?.city || ""}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-line)] flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-[var(--color-ink-3)]" />
                    </div>
                    <p className="text-sm text-[var(--color-ink-2)] truncate">
                      {booking.owner?.name || "Owner"}
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
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      ${booking.total_price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--color-ink-3)]">
                      ${booking.weekly_price_at_time}/wk
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
                    {needsPayment && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `/booking-success?booking_id=${booking.id}`,
                            "_blank"
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)] flex items-center gap-1"
                      >
                        <CreditCard className="w-3 h-3" /> Pay
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(booking.id);
                        }}
                        disabled={cancelLoading === booking.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-line)] text-[var(--color-ink-2)] hover:bg-[var(--color-surface)]/50 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" /> Cancel
                      </button>
                    )}
                    {!canCancel && !needsPayment && (
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
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {booking.listing?.images?.[0] ? (
                        <img
                          src={booking.listing.images[0]}
                          alt={booking.listing?.title ? `${booking.listing.title} listing photo` : "Listing photo"}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[var(--color-line)] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                          {booking.listing?.title ||
                            booking.listing?.address ||
                            "Listing"}
                        </p>
                        <p className="text-xs text-[var(--color-ink-3)] mt-0.5">
                          ${booking.total_price?.toLocaleString()} total
                        </p>
                      </div>
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
                        <p className="text-xs text-[var(--color-ink-3)] mb-0.5">Owner</p>
                        <p className="font-medium text-[var(--color-ink)]">
                          {booking.owner?.name || "Owner"}
                          {booking.owner?.verified && (
                            <span
                              className="ml-1 text-[var(--color-primary)]"
                              title="Verified"
                            >
                              &#10003;
                            </span>
                          )}
                        </p>
                      </div>
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
                          Weekly rate
                        </p>
                        <p className="font-medium text-[var(--color-ink)]">
                          ${booking.weekly_price_at_time?.toLocaleString()}/wk
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-ink-3)] mb-0.5">
                          Total cost
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
                          Your message to owner
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
                        }
                      )}
                    </p>

                    {/* Mobile actions */}
                    <div className="flex gap-3 pt-2 md:hidden">
                      {needsPayment && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            window.open(
                              `/booking-success?booking_id=${booking.id}`,
                              "_blank"
                            )
                          }
                          className="flex-1 btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          Complete Payment
                          <ExternalLink className="w-3 h-3" />
                        </motion.button>
                      )}
                      {canCancel && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelLoading === booking.id}
                          className={`${needsPayment ? "" : "flex-1"} py-2.5 px-4 rounded-xl text-sm font-semibold border border-[var(--color-line)] text-[var(--color-ink-2)] hover:bg-[var(--color-surface)]/50 flex items-center justify-center gap-2 disabled:opacity-50`}
                        >
                          {cancelLoading === booking.id ? (
                            <span className="w-4 h-4 border-2 border-[var(--color-line-2)] border-t-slate-600 rounded-full animate-spin" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                          Cancel
                        </motion.button>
                      )}
                    </div>
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
