import { motion } from "framer-motion";
import type { AdminStats } from "../../lib/adminModerationApi";

interface AdminMetricsProps {
  stats: AdminStats | null;
  loading: boolean;
}

export default function AdminMetrics({ stats, loading }: AdminMetricsProps) {
  const cards = [
    {
      label: "Pending Review",
      value: stats?.pending ?? 0,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/20",
    },
    {
      label: "Approved Today",
      value: stats?.approved_today ?? 0,
      color: "text-[var(--color-accent)]",
      bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10",
      border: "border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]",
    },
    {
      label: "Rejected Today",
      value: stats?.rejected_today ?? 0,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-500/10",
      border: "border-red-200 dark:border-red-500/20",
    },
    {
      label: "Approval Rate",
      value: stats ? `${stats.approval_rate}%` : "-%",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-4 rounded-xl animate-pulse">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`p-4 rounded-xl border ${card.border} ${card.bg}`}
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {card.label}
          </p>
          <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
