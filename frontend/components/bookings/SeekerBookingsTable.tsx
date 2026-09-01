import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Ban,
} from "lucide-react";
import type { Booking } from "../../hooks/useBookings";
import { useConfirm } from "../ui/ConfirmDialog";

interface SeekerBookingsTableProps {
  bookings: Booking[];
  loading: boolean;
  onCancel: (bookingId: string) => Promise<any>;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  PENDING_OWNER: {
    label: "Awaiting owner response",
    icon: Clock,
    color: "text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]",
    bg: "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10",
  },
  OWNER_ACCEPTED: {
    label: "Accepted - Complete payment",
    icon: CreditCard,
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10",
  },
  OWNER_DECLINED: {
    label: "Declined by owner",
    icon: XCircle,
    color: "text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]",
    bg: "bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-500)]/10",
  },
  SEEKER_CANCELLED: {
    label: "Cancelled",
    icon: Ban,
    color: "text-[var(--color-ink-3)]",
    bg: "bg-[var(--color-surface-muted)]/50",
  },
  PAID: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-[var(--color-accent)] dark:text-[var(--color-accent)]",
    bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10",
  },
  COMPLETED: {
    label: "Stay completed",
    icon: CheckCircle,
    color: "text-[var(--color-ink-2)]",
    bg: "bg-[var(--color-surface-muted)]/50",
  },
  EXPIRED: {
    label: "Expired",
    icon: Clock,
    color: "text-[var(--color-ink-3)]",
    bg: "bg-[var(--color-surface-muted)]/50",
  },
};

export default function SeekerBookingsTable({
  bookings,
  loading,
  onCancel,
}: SeekerBookingsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const confirm = useConfirm();

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

  if (bookings.length === 0) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <Calendar className="w-10 h-10 mx-auto text-[var(--color-ink-4)] mb-3" />
        <p className="text-sm text-[var(--color-ink-3)]">
          No bookings yet. Browse listings and send your first booking request!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.EXPIRED;
        const StatusIcon = status.icon;
        const isExpanded = expandedId === booking.id;
        const canCancel = ["PENDING_OWNER", "OWNER_ACCEPTED"].includes(booking.status);
        const needsPayment = booking.status === "OWNER_ACCEPTED";

        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card rounded-xl overflow-hidden border border-[var(--color-line)]"
          >
            {/* Main row */}
            <div
              className="p-4 cursor-pointer hover:bg-[var(--color-surface)]/30 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : booking.id)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Listing image thumbnail */}
                  {booking.listing?.images?.[0] && (
                    <img
                      src={booking.listing.images[0]}
                      alt={booking.listing?.title ? `${booking.listing.title} listing photo` : "Listing photo"}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                      {booking.listing?.title || booking.listing?.address || "Listing"}
                    </p>
                    <p className="text-xs text-[var(--color-ink-3)] mt-0.5">
                      {booking.check_in_date} to {booking.check_out_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${status.bg} ${status.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
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
                      {booking.other_party?.name || "Owner"}
                      {booking.other_party?.verified && (
                        <span className="ml-1 text-[var(--color-primary)]" title="Verified">
                          &#10003;
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-ink-3)] mb-0.5">Guests</p>
                    <p className="font-medium text-[var(--color-ink)]">
                      {booking.guests}
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

                <p className="text-xs text-[var(--color-ink-3)]">
                  Requested{" "}
                  {new Date(booking.created_at).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {needsPayment && booking.stripe_session_id && (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/bookings/${booking.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Complete Payment
                      <ExternalLink className="w-3 h-3" />
                    </motion.a>
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
  );
}
