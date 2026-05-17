import { motion } from "framer-motion";
import Link from "next/link";
import { UserRole } from "../../hooks/useDashboard";
import { DashboardMetrics, ProfileData } from "../../hooks/useDashboardData";
import RoleToggle from "./RoleToggle";
import { Plus, Search } from "lucide-react";

interface HeroSectionProps {
  displayName: string | null;
  role: UserRole;
  metrics: DashboardMetrics | null;
  profile: ProfileData | null;
  onRoleToggle: (role: "seeker" | "owner") => void;
  roleChanging?: boolean;
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
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
  const firstName = (displayName || "there").split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">
            {isOwner ? "Hosting" : "Renting"} · Overview
          </div>
          <h1 className="font-serif text-[34px] md:text-[40px] leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]">
            {timeOfDay()}, {firstName}.
          </h1>
          {profile?.occupation && (
            <p className="mt-2 text-sm text-[var(--color-ink-2)]">
              {profile.occupation} · {isOwner ? "Property owner" : "Room seeker"}
              {metrics ? ` · ${isOwner ? metrics.activeListings : metrics.newInquiries} ${isOwner ? "active listings" : "new inquiries"}` : ""}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <RoleToggle
            role={role}
            onToggle={onRoleToggle}
            disabled={roleChanging}
          />
          <Link
            href={isOwner ? "/owner/listings/new" : "/seeker/search"}
            className="btn-primary h-10 px-4 text-sm rounded-[10px] inline-flex"
          >
            {isOwner ? <Plus className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            {isOwner ? "List a room" : "New search"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
