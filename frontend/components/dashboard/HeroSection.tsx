import { motion } from "framer-motion";
import Link from "next/link";
import { UserRole } from "../../hooks/useDashboard";
import { DashboardMetrics, ProfileData } from "../../hooks/useDashboardData";
import RoleToggle from "./RoleToggle";
import { Plus, Sparkles, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  displayName: string | null;
  role: UserRole;
  metrics: DashboardMetrics | null;
  profile: ProfileData | null;
  onRoleToggle: (role: "seeker" | "owner") => void;
  roleChanging?: boolean;
}

export default function HeroSection({
  displayName,
  role,
  metrics,
  profile,
  onRoleToggle,
  roleChanging,
}: HeroSectionProps) {
  const isOwner = role === "owner";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-slate-800 p-6 md:p-8"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative z-10">
        {/* Top row: avatar + welcome + role toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Profile photo */}
            <Link href={isOwner ? "/dashboard/owner-profile" : "/dashboard/seeker-profile"}>
              <div className="relative shrink-0 group cursor-pointer">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden ring-2 ring-white/30 group-hover:ring-white/60 transition-all ${
                  profile?.photo ? "" : "bg-white/20 backdrop-blur-sm"
                }`}>
                  {profile?.photo ? (
                    <img src={profile.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (displayName || "U")[0].toUpperCase()
                  )}
                </div>
                {/* Verified badge */}
                {profile?.idVerified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-accent-soft)]0 border-2 border-white flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </Link>

            <div>
              <h1
                className="text-2xl md:text-3xl font-semibold text-white tracking-tight"
              >
                Welcome back, {displayName || "there"}{" "}
                <Sparkles className="inline w-6 h-6 text-yellow-300" />
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {profile?.occupation
                  ? `${profile.occupation} · ${isOwner ? "Property Owner" : "Room Seeker"}`
                  : isOwner
                    ? "Manage your properties and connect with tenants"
                    : "Find your perfect room and track applications"}
              </p>
            </div>
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
          {/* Profile completion pill */}
          {profile && profile.completionPercent < 100 && (
            <StatPill
              label="Profile"
              value={`${profile.completionPercent}%`}
              delay={0.3}
            />
          )}
        </div>

        {/* CTA */}
        <Link
          href={isOwner ? "/owner/listings/new" : "/seeker/search"}
          className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-[10px] text-sm hover:bg-slate-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isOwner ? "List a Room" : "Search Rooms"}
        </Link>
      </div>
    </motion.div>
  );
}

function StatPill({ label, value }: { label: string; value: string; delay?: number }) {
  return (
    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
      <span className="text-white font-semibold text-sm">{value}</span>
      <span className="text-white/70 text-xs">{label}</span>
    </div>
  );
}
