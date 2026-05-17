import { motion } from "framer-motion";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import { useNotificationCenter, type NotificationFilter } from "../../hooks/useNotificationCenter";
import { formatDistanceToNow } from "../../lib/timeUtils";
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
  Trash2,
  Loader2,
  Filter,
} from "lucide-react";

const TYPE_ICONS: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  booking_request_created: { icon: Calendar, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
  booking_approved: { icon: Calendar, color: "text-[var(--color-accent)]", bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10" },
  booking_declined: { icon: Calendar, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
  booking_confirmed: { icon: Calendar, color: "text-[var(--color-accent)]", bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10" },
  payment_received: { icon: DollarSign, color: "text-[var(--color-accent)]", bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10" },
  verification_status_changed: { icon: Shield, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
  message_received: { icon: MessageCircle, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10" },
  match_created: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10" },
  host_response_sent: { icon: Calendar, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
  listing_published: { icon: Home, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10" },
  listing_rejected: { icon: Home, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
  listing_changes_requested: { icon: Home, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
};

const FILTER_OPTIONS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "bookings", label: "Bookings" },
  { value: "messages", label: "Messages" },
  { value: "payments", label: "Payments" },
  { value: "verification", label: "Verification" },
  { value: "matches", label: "Matches" },
  { value: "listings", label: "Listings" },
];

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    filter,
    setFilter,
    showUnreadOnly,
    setShowUnreadOnly,
    markRead,
    markAllRead,
    removeNotification,
  } = useNotificationCenter();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:text-[var(--color-primary)] font-medium px-3 py-2 rounded-xl hover:bg-[var(--color-primary-soft)] dark:hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === opt.value
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}

          <div className="ml-auto">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showUnreadOnly
                  ? "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Filter className="w-3 h-3" />
              Unread only
            </button>
          </div>
        </motion.div>

        {/* Notification List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <BellOff className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
                {showUnreadOnly ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-xs">
                {showUnreadOnly
                  ? "All your notifications have been read. Try removing the unread filter."
                  : "When you receive bookings, messages, or updates, they will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {notifications.map((n, i) => {
                const typeConfig = TYPE_ICONS[n.type] || {
                  icon: Bell,
                  color: "text-slate-500",
                  bg: "bg-slate-50 dark:bg-slate-800",
                };
                const Icon = typeConfig.icon;

                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <div
                      className={`flex items-start gap-3 px-5 py-4 transition-colors group ${
                        !n.is_read
                          ? "bg-[var(--color-primary-soft)]/40 dark:bg-[var(--color-primary)]/5"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.bg}`}
                      >
                        <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                      </div>

                      {/* Content */}
                      <Link href={n.cta_url || "/dashboard"} className="flex-1 min-w-0" onClick={() => { if (!n.is_read) markRead(n.id); }}>
                        <p
                          className={`text-sm leading-snug ${
                            !n.is_read
                              ? "font-semibold text-slate-900 dark:text-white"
                              : "font-medium text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                          {formatDistanceToNow(n.created_at)}
                        </p>
                      </Link>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.is_read && (
                          <button
                            onClick={() => markRead(n.id)}
                            title="Mark as read"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] dark:hover:bg-[var(--color-primary)]/10 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(n.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Unread dot */}
                      {!n.is_read && (
                        <span className="mt-2 w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
