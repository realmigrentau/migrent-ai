import { motion } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { ActivityItem } from "../../hooks/useDashboardData";
import {
  Building2,
  CreditCard,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  ChevronRight,
  User,
  Camera,
  Trophy,
} from "lucide-react";

interface RecentActivityProps {
  activity: ActivityItem[];
  loading: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  building: <Building2 className="w-4 h-4" />,
  payment: <CreditCard className="w-4 h-4" />,
  shield: <ShieldCheck className="w-4 h-4" />,
  message: <MessageCircle className="w-4 h-4" />,
  sparkles: <Sparkles className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
  camera: <Camera className="w-4 h-4" />,
  trophy: <Trophy className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
  success: "bg-[var(--color-accent-soft)] text-[var(--color-accent)] dark:bg-[var(--color-accent-soft)]0/20 dark:text-[var(--color-accent)]",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  info: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:bg-[var(--color-primary)]/20 dark:text-[var(--color-primary)]",
  pending: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export default function RecentActivity({ activity, loading }: RecentActivityProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? activity : activity.slice(0, 5);

  if (loading) {
    return (
      <div className="card p-5">
        <Skeleton className="w-32 h-6 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Sparkles className="w-10 h-10 text-[var(--color-primary)] mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          No activity yet
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Activity will appear here as you use MigRent
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Recent Activity
        </h2>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {activity.length} items
        </span>
      </div>

      <div className="space-y-1">
        {visibleItems.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${statusColors[item.status]}`}>
              {iconMap[item.icon] || <Sparkles className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                {item.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {item.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {item.time}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[var(--color-primary)] transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {activity.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 py-2 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors"
        >
          {expanded ? "Show less" : `Show ${activity.length - 5} more`}
        </button>
      )}
    </div>
  );
}
