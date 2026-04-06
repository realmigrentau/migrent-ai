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
  booking_request_created: { icon: Calendar, color: "text-blue-500" },
  booking_approved: { icon: Calendar, color: "text-emerald-500" },
  booking_declined: { icon: Calendar, color: "text-red-500" },
  booking_confirmed: { icon: Calendar, color: "text-emerald-600" },
  payment_received: { icon: DollarSign, color: "text-emerald-500" },
  verification_status_changed: { icon: Shield, color: "text-amber-500" },
  message_received: { icon: MessageCircle, color: "text-pink-500" },
  match_created: { icon: Zap, color: "text-yellow-500" },
  host_response_sent: { icon: Calendar, color: "text-cyan-500" },
  listing_published: { icon: Home, color: "text-indigo-500" },
  listing_rejected: { icon: Home, color: "text-red-500" },
  listing_changes_requested: { icon: Home, color: "text-orange-500" },
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
      className="absolute left-0 lg:left-auto lg:right-0 top-full mt-2 w-[340px] sm:w-[380px] z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
          Notifications
        </h3>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <BellOff className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              No notifications yet
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
              You will be notified about bookings, messages, and important updates here.
            </p>
          </div>
        ) : (
          <div>
            {recentNotifications.map((n) => {
              const typeConfig = TYPE_ICONS[n.type] || { icon: Bell, color: "text-slate-500" };
              const Icon = typeConfig.icon;

              return (
                <Link
                  key={n.id}
                  href={n.cta_url || "/dashboard"}
                  onClick={() => handleClickNotification(n.id, n.is_read)}
                >
                  <div
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-b-0 cursor-pointer ${
                      !n.is_read ? "bg-indigo-50/50 dark:bg-indigo-500/5" : ""
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${typeConfig.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
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
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {formatDistanceToNow(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
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
        <div className="border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/dashboard/notifications"
            onClick={onClose}
            className="block text-center py-2.5 text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </motion.div>
  );
}
