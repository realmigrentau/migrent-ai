import { motion } from "framer-motion";
import Link from "next/link";
import {
  Bell,
  BellOff,
  CheckCheck,
  Calendar,
  DollarSign,
  Shield,
  MessageCircle,
  Zap,
  Home,
  X,
  Loader2,
} from "lucide-react";
import { useNotificationCenter } from "../../hooks/useNotificationCenter";
import { formatDistanceToNow } from "../../lib/timeUtils";

interface NotificationDropdownProps {
  onClose: () => void;
}

const TYPE_ICONS: Record<string, { icon: typeof Bell; color: string }> = {
  booking_request_created: { icon: Calendar, color: "text-[var(--color-primary)]" },
  booking_approved: { icon: Calendar, color: "text-[var(--color-accent)]" },
  booking_declined: { icon: Calendar, color: "text-[var(--color-danger-500)]" },
  booking_confirmed: { icon: Calendar, color: "text-[var(--color-accent)]" },
  payment_received: { icon: DollarSign, color: "text-[var(--color-accent)]" },
  verification_status_changed: { icon: Shield, color: "text-[var(--color-warn-500)]" },
  message_received: { icon: MessageCircle, color: "text-[var(--color-primary)]" },
  match_created: { icon: Zap, color: "text-yellow-500" },
  host_response_sent: { icon: Calendar, color: "text-[var(--color-primary)]" },
  listing_published: { icon: Home, color: "text-[var(--color-primary)]" },
  listing_rejected: { icon: Home, color: "text-[var(--color-danger-500)]" },
  listing_changes_requested: { icon: Home, color: "text-[var(--color-warn-500)]" },
};

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, loading, markRead, markAllRead, unreadCount } = useNotificationCenter();

  // Show only the latest 8 in the dropdown
  const recentNotifications = notifications.slice(0, 8);

  const handleClickNotification = (id: string, isRead: boolean) => {
    if (!isRead) markRead(id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 lg:left-auto lg:right-0 top-full mt-2 w-[340px] sm:w-[380px] z-50 backdrop-blur-xl bg-white/95 dark:bg-[var(--color-surface)]/95 border border-[var(--color-line)]/60 dark:border-[var(--color-line)]/50 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-line)]">
        <h3 className="font-semibold text-[var(--color-ink)] text-sm">
          Notifications
        </h3>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:text-[var(--color-primary)] font-medium px-2 py-1 rounded-lg hover:bg-[var(--color-primary-soft)] dark:hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] hover:bg-[var(--color-surface-muted)] dark:hover:text-[var(--color-ink-4)] dark:hover:bg-[var(--color-ink)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-[var(--color-ink-3)] animate-spin" />
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center mb-3">
              <BellOff className="w-5 h-5 text-[var(--color-ink-3)]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-ink-2)]">
              No notifications yet
            </p>
            <p className="text-xs text-[var(--color-ink-3)] text-center mt-1">
              You will be notified about bookings, messages, and important updates here.
            </p>
          </div>
        ) : (
          <div>
            {recentNotifications.map((n) => {
              const typeConfig = TYPE_ICONS[n.type] || { icon: Bell, color: "text-[var(--color-ink-3)]" };
              const Icon = typeConfig.icon;

              return (
                <Link
                  key={n.id}
                  href={n.cta_url || "/dashboard"}
                  onClick={() => handleClickNotification(n.id, n.is_read)}
                >
                  <div
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-surface)]/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-b-0 cursor-pointer ${
                      !n.is_read ? "bg-[var(--color-primary-soft)]/50 dark:bg-[var(--color-primary)]/5" : ""
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${typeConfig.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          !n.is_read
                            ? "font-semibold text-[var(--color-ink)]"
                            : "font-medium text-[var(--color-ink-2)]"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-[var(--color-ink-3)] mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-[var(--color-ink-3)] mt-1">
                        {formatDistanceToNow(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentNotifications.length > 0 && (
        <div className="border-t border-[var(--color-line)]">
          <Link
            href="/dashboard/notifications"
            onClick={onClose}
            className="block text-center py-2.5 text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:text-[var(--color-primary)] hover:bg-[var(--color-surface)]/50 transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </motion.div>
  );
}
