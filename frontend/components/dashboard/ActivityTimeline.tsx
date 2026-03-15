import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  XCircle,
  Info,
} from "lucide-react";
import type { OwnerActivity } from "../../hooks/useOwnerData";

interface Props {
  activities: OwnerActivity[];
  loading: boolean;
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

const iconMap: Record<string, React.ReactNode> = {
  booking_request: <Clock className="w-4 h-4" />,
  booking_accepted: <CheckCircle2 className="w-4 h-4" />,
  payment_received: <DollarSign className="w-4 h-4" />,
  booking_declined: <XCircle className="w-4 h-4" />,
  booking_completed: <CheckCircle2 className="w-4 h-4" />,
  listing_active: <Info className="w-4 h-4" />,
};

const colorMap: Record<string, { dot: string; icon: string }> = {
  pending: {
    dot: "bg-amber-400",
    icon: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
  },
  success: {
    dot: "bg-emerald-400",
    icon: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
  },
  declined: {
    dot: "bg-red-400",
    icon: "text-red-500 bg-red-50 dark:bg-red-500/10",
  },
  info: {
    dot: "bg-blue-400",
    icon: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
  },
};

export default function ActivityTimeline({ activities, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card rounded-xl p-4 animate-pulse h-16" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No recent activity. Events will appear here as your listings get
          engagement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((item, i) => {
        const colors = colorMap[item.status] || colorMap.info;
        const icon = iconMap[item.type] || <Info className="w-4 h-4" />;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
          >
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-8 h-8 rounded-full ${colors.icon} flex items-center justify-center`}
              >
                {icon}
              </div>
              {i < activities.length - 1 && (
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {item.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {item.description}
              </p>
            </div>

            {/* Time */}
            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
              {formatTimeAgo(item.timestamp)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
