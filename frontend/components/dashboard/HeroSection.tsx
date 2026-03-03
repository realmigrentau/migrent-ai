import { motion } from "framer-motion";
import Link from "next/link";
import { UserRole } from "../../hooks/useDashboard";
import { DashboardMetrics } from "../../hooks/useDashboardData";
import RoleToggle from "./RoleToggle";
import { Plus, Sparkles } from "lucide-react";

interface HeroSectionProps {
  displayName: string | null;
  role: UserRole;
  metrics: DashboardMetrics | null;
  onRoleToggle: (role: "seeker" | "owner") => void;
  roleChanging?: boolean;
}

export default function HeroSection({
  displayName,
  role,
  metrics,
  onRoleToggle,
  roleChanging,
}: HeroSectionProps) {
  const isOwner = role === "owner";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl gradient-indigo-pink p-6 md:p-8"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative z-10">
        {/* Top row: welcome + role toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <motion.h1
              className="text-2xl md:text-3xl font-black text-white tracking-tight"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Welcome back, {displayName || "there"}{" "}
              <Sparkles className="inline w-6 h-6 text-yellow-300" />
            </motion.h1>
            <p className="text-white/70 text-sm mt-1">
              {isOwner
                ? "Manage your properties and connect with tenants"
                : "Find your perfect room and track applications"}
            </p>
          </div>

          <RoleToggle
            role={role}
            onToggle={onRoleToggle}
            disabled={roleChanging}
          />
        </div>

        {/* Quick stats row */}
        <div className="flex flex-wrap gap-3 mb-6">
          {metrics && (
            <>
              <StatPill
                label="Active"
                value={String(metrics.activeListings)}
                delay={0.15}
              />
              {isOwner && metrics.totalRevenue > 0 && (
                <StatPill
                  label="Est. Monthly"
                  value={`$${(metrics.totalRevenue / 100).toFixed(0)}${metrics.totalRevenue >= 100 ? "" : ""}`}
                  delay={0.2}
                />
              )}
              {isOwner && (
                <StatPill
                  label="Response"
                  value={`${metrics.responseRate}%`}
                  delay={0.25}
                />
              )}
              {!isOwner && (
                <StatPill
                  label="Inquiries"
                  value={String(metrics.newInquiries)}
                  delay={0.2}
                />
              )}
            </>
          )}
        </div>

        {/* CTA */}
        <Link
          href={isOwner ? "/owner/listings/new" : "/seeker/search"}
        >
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isOwner ? "List a Room" : "Search Rooms"}
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
}

function StatPill({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5"
    >
      <span className="text-white font-bold text-sm">{value}</span>
      <span className="text-white/70 text-xs">{label}</span>
    </motion.div>
  );
}
