import { motion } from "framer-motion";
import { Building2, Clock, DollarSign, Zap } from "lucide-react";
import type { OwnerMetrics } from "../../hooks/useOwnerData";

interface Props {
  metrics: OwnerMetrics | null;
  loading: boolean;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

const cards = [
  {
    key: "active_listings" as const,
    label: "Active Listings",
    icon: <Building2 className="w-5 h-5" />,
    format: (v: number) => String(v),
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    iconBg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20",
  },
  {
    key: "pending_requests" as const,
    label: "Pending Requests",
    icon: <Clock className="w-5 h-5" />,
    format: (v: number) => String(v),
    color: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
  },
  {
    key: "earnings_this_month" as const,
    label: "This Month",
    icon: <DollarSign className="w-5 h-5" />,
    format: (v: number) => `$${v.toLocaleString()}`,
    color: "text-[var(--color-accent)] dark:text-[var(--color-accent)]",
    iconBg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20",
  },
  {
    key: "response_rate" as const,
    label: "Response Rate",
    icon: <Zap className="w-5 h-5" />,
    format: (v: number) => `${v}%`,
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    iconBg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/20",
  },
];

export default function OwnerMetricsCards({ metrics, loading }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          className="card p-4 md:p-5 cursor-default"
        >
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="w-10 h-10" />
              <Skeleton className="w-16 h-7" />
              <Skeleton className="w-20 h-4" />
            </div>
          ) : (
            <>
              <div
                className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.color} flex items-center justify-center mb-3`}
              >
                {card.icon}
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>
                {metrics ? card.format(metrics[card.key]) : "-"}
              </p>
              <p className="text-xs text-[var(--color-ink-3)] mt-1 font-medium">
                {card.label}
              </p>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}
