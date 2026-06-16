import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Clock,
  DollarSign,
  Calendar,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Booking } from "../../hooks/useBookings";
import { useConfirm } from "../ui/ConfirmDialog";

interface OwnerBookingsTableProps {
  bookings: Booking[];
  loading: boolean;
  onAccept: (bookingId: string) => Promise<any>;
  onDecline: (bookingId: string) => Promise<any>;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING_OWNER: {
    label: "Awaiting your response",
    color: "text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]",
    bg: "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10",
  },
  OWNER_ACCEPTED: {
    label: "Accepted - Awaiting payment",
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10",
  },
  OWNER_DECLINED: {
    label: "Declined",
    color: "text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]",
    bg: "bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-50)]0/10",
  },
  SEEKER_CANCELLED: {
    label: "Cancelled by seeker",
    color: "text-[var(--color-ink-3)]",
    bg: "bg-[var(--color-surface)]",
  },
  PAID: {
    label: "Confirmed",
    color: "text-[var(--color-accent)] dark:text-[var(--color-accent)]",
    bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-[var(--color-ink-2)]",
    bg: "bg-[var(--color-surface)]",
  },
  EXPIRED: {
    label: "Expired",
    color: "text-[var(--color-ink-3)]",
    bg: "bg-[var(--color-surface)]",
  },
};

export default function OwnerBookingsTable({
  bookings,
  loading,
  onAccept,
  onDecline,
}: OwnerBookingsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const confirm = useConfirm();

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
          <div
            key={i}
            className="card rounded-xl p-4 animate-pulse h-20"
          />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <Calendar className="w-10 h-10 mx-auto text-[var(--color-ink-4)] mb-3" />
        <p className="text-sm text-[var(--color-ink-3)]">
          No booking requests yet. They will appear here when seekers request your listings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.EXPIRED;
        const isExpanded = expandedId === booking.id;
        const isPending = booking.status === "PENDING_OWNER";

        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card rounded-xl overflow-hidden border ${
              isPending
                ? "border-[var(--color-line-2)] dark:border-amber-500/30"
                : "border-[var(--color-line)]"
            }`}
          >
            {/* Main row */}
            <div
              className="p-4 cursor-pointer hover:bg-[var(--color-surface)]/30 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : booking.id)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                    {booking.listing?.title || booking.listing?.address || "Listing"}
                  </p>
                  <p className="text-xs text-[var(--color-ink-3)] mt-0.5">
                    {booking.other_party?.name || "Seeker"} - {booking.guests} guest
                    {booking.guests !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}
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
                    <p className="text-xs text-[var(--color-ink-3)] mb-0.5">Check-in</p>
                    <p className="font-medium text-[var(--color-ink)]">
                      {booking.check_in_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-ink-3)] mb-0.5">Check-out</p>
                    <p className="font-medium text-[var(--color-ink)]">
                      {booking.check_out_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-ink-3)] mb-0.5">Weekly rate</p>
                    <p className="font-medium text-[var(--color-ink)]">
                      AUD ${booking.weekly_price_at_time?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-ink-3)] mb-0.5">Est. total rent</p>
                    <p className="font-medium text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                      AUD ${booking.total_price?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {booking.message_to_owner && (
                  <div className="p-3 rounded-lg bg-[var(--color-surface)]">
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
                  Requested {new Date(booking.created_at).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {/* Actions for pending bookings */}
                {isPending && (
                  <div className="flex gap-3 pt-2">
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
  );
}
