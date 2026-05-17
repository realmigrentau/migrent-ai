import { motion } from "framer-motion";
import { DashboardMetrics } from "../../hooks/useDashboardData";
import { UserRole } from "../../hooks/useDashboard";
import {
  Building2,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface MetricsCardsProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  role: UserRole;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

interface MetricConfig {
  key: keyof DashboardMetrics;
  label: string;
  icon: React.ReactNode;
  format: (v: number) => string;
  color: string;
  iconBg: string;
}

const ownerMetrics: MetricConfig[] = [
  {
    key: "activeListings",
    label: "Active Listings",
    icon: <Building2 className="w-5 h-5" />,
    format: (v) => String(v),
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    iconBg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20",
  },
  {
    key: "totalRevenue",
    label: "Est. Revenue/mo",
    icon: <DollarSign className="w-5 h-5" />,
    format: (v) => `$${v.toLocaleString()}`,
    color: "text-[var(--color-accent)] dark:text-[var(--color-accent)]",
    iconBg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20",
  },
  {
    key: "responseRate",
    label: "Response Rate",
    icon: <Zap className="w-5 h-5" />,
    format: (v) => `${v}%`,
    color: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
  },
  {
    key: "occupancyRate",
    label: "Occupancy",
    icon: <TrendingUp className="w-5 h-5" />,
    format: (v) => `${v}%`,
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    iconBg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/20",
  },
  {
    key: "newInquiries",
    label: "New Inquiries",
    icon: <MessageSquare className="w-5 h-5" />,
    format: (v) => String(v),
    color: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
  },
  {
    key: "conversionRate",
    label: "Conversion",
    icon: <Users className="w-5 h-5" />,
    format: (v) => `${v}%`,
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    iconBg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/20",
  },
];

const seekerMetrics: MetricConfig[] = [
  {
    key: "newInquiries",
    label: "Applications Sent",
    icon: <MessageSquare className="w-5 h-5" />,
    format: (v) => String(v),
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    iconBg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20",
  },
  {
    key: "responseRate",
    label: "Response Rate",
    icon: <Zap className="w-5 h-5" />,
    format: (v) => `${v}%`,
    color: "text-[var(--color-accent)] dark:text-[var(--color-accent)]",
    iconBg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20",
  },
  {
    key: "activeListings",
    label: "Saved Rooms",
    icon: <Building2 className="w-5 h-5" />,
    format: (v) => String(v),
    color: "text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    iconBg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/20",
  },
];

export default function MetricsCards({ metrics, loading, role }: MetricsCardsProps) {
  const cards = role === "owner" ? ownerMetrics : seekerMetrics;

  return (
    <div className={`grid grid-cols-2 ${role === "owner" ? "lg:grid-cols-3" : "lg:grid-cols-3"} gap-3 md:gap-4`}>
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
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.color} flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>
                {metrics ? card.format(metrics[card.key]) : "-"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {card.label}
              </p>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}
