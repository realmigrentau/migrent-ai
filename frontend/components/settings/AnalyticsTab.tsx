import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import { BarChart3, TrendingUp, Search, Users } from "lucide-react";
import type { ProfileData } from "../../hooks/useSettingsData";

interface AnalyticsTabProps {
  profile: ProfileData | null;
}

export default function AnalyticsTab({ profile }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* Analytics Empty State */}
      <GlassCard delay={0.05}>
        <div className="text-center py-12 px-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-primary-soft)] to-purple-100 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-[var(--color-primary)]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Your dashboard will populate as you host
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Publish a listing to start collecting views, search ranking, and
            booking data. The charts below preview what you&apos;ll see here.
          </p>
        </div>
      </GlassCard>

      {/* What you will see */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: TrendingUp,
            label: "Revenue trends",
            desc: "Track your monthly earnings",
            gradient: "from-[var(--color-accent)] to-teal-500",
            bg: "bg-[var(--color-accent-soft)]/80 dark:bg-[var(--color-accent-soft)]0/10 border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]",
          },
          {
            icon: Search,
            label: "Search insights",
            desc: "See how seekers find you",
            gradient: "from-[var(--color-primary)] to-[var(--color-primary)]",
            bg: "bg-[var(--color-primary-soft)]/80 dark:bg-[var(--color-primary-soft)]0/10 border-pink-100 dark:border-[var(--color-primary)]/20",
          },
          {
            icon: Users,
            label: "Audience data",
            desc: "Understand your viewers",
            gradient: "from-blue-400 to-[var(--color-primary)]",
            bg: "bg-blue-50/80 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className={`rounded-xl p-4 border ${item.bg} opacity-60`}
            >
              <div className={`w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] ${item.gradient} flex items-center justify-center shadow-sm mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {item.label}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
