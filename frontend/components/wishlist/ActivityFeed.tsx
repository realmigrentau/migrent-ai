import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingDown,
  MessageCircle,
  Star,
  Bell,
  ChevronRight,
  X,
} from "lucide-react";
import type { ActivityItem } from "../../hooks/useWishlist";

const ACTIVITY_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  price_drop: {
    icon: <TrendingDown className="w-4 h-4" />,
    color: "text-[var(--color-accent)]",
    bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10",
  },
  owner_reply: {
    icon: <MessageCircle className="w-4 h-4" />,
    color: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10",
  },
  new_review: {
    icon: <Star className="w-4 h-4" />,
    color: "text-[var(--color-warn-500)]",
    bg: "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10",
  },
  new_match: {
    icon: <Bell className="w-4 h-4" />,
    color: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10",
  },
};

interface ActivityFeedProps {
  activities: ActivityItem[];
  unreadCount: number;
  show: boolean;
  onClose: () => void;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityFeed({
  activities,
  unreadCount,
  show,
  onClose,
}: ActivityFeedProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--color-surface-2)] border-l border-[var(--color-line)] z-50 overflow-y-auto lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:rounded-2xl lg:border lg:relative lg:w-full"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/90 dark:bg-[var(--color-surface)]/90 backdrop-blur-md z-10 px-4 py-4 border-b border-[var(--color-line)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--color-ink)]">
                  Activity
                </h3>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary)] text-white"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors lg:hidden"
              >
                <X className="w-4 h-4 text-[var(--color-ink-3)]" />
              </button>
            </div>

            {/* Activity items */}
            <div className="p-3 space-y-1">
              {activities.map((activity, i) => {
                const config = ACTIVITY_ICONS[activity.type];
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer group ${
                      !activity.read
                        ? "bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]"
                        : "hover:bg-[var(--color-surface)]/30"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      {config.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs leading-relaxed ${
                        !activity.read
                          ? "text-[var(--color-ink)] font-medium"
                          : "text-[var(--color-ink-2)]"
                      }`}>
                        {activity.message}
                      </p>
                      <p className="text-[10px] text-[var(--color-ink-3)] mt-1">
                        {timeAgo(activity.timestamp)}
                      </p>
                    </div>
                    {!activity.read && (
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0 mt-1.5" />
                    )}
                    <ChevronRight className="w-3 h-3 text-[var(--color-ink-4)] shrink-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                );
              })}
            </div>

            {/* Pro tip */}
            <div className="p-4 mx-3 mb-3 rounded-2xl bg-[var(--color-primary-soft)] from-violet-50 to-[var(--color-primary-50)] dark:from-violet-950/30 dark:to-[var(--color-surface-muted)] border border-[var(--color-primary-soft)]/50 dark:border-[var(--color-primary)]/20">
              <p className="text-xs font-bold text-violet-700 dark:text-[var(--color-primary)] mb-1">
                Pro Tip
              </p>
              <p className="text-xs text-[var(--color-primary)]/70 dark:text-[var(--color-primary)]/60 leading-relaxed">
                Add a special request when messaging owners - it leads to 40% faster responses!
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
