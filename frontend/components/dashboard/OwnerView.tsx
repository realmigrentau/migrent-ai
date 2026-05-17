import { motion } from "framer-motion";
import Link from "next/link";
import { ProfileData } from "../../hooks/useDashboardData";
import CommunityHighlights from "./CommunityHighlights";
import {
  Plus,
  Pause,
  Download,
  Building2,
  ChevronRight,
  MapPin,
  DollarSign,
  Eye,
  Trophy,
  Home,
  Users,
} from "lucide-react";

interface OwnerViewProps {
  listings: any[];
  loading: boolean;
  profile: ProfileData | null;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export default function OwnerView({ listings, loading, profile }: OwnerViewProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-2">
        <Link href="/owner/listings/new">
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            List Room
          </motion.span>
        </Link>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Pause className="w-4 h-4" />
          Pause All
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </motion.button>
      </div>

      {/* Listings Table */}
      <div className="card overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Your Listings
            </h2>
            <Link
              href="/owner/listings"
              className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-2/3 h-4" />
                  <Skeleton className="w-1/3 h-3" />
                </div>
                <Skeleton className="w-16 h-6 shrink-0" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              No listings yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
              Create your first listing to start connecting with tenants
            </p>
            <Link href="/owner/listings/new">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white font-semibold px-5 py-2.5 rounded-xl text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Post Your First Room
              </motion.span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Header row - desktop */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Property</div>
              <div className="col-span-2">Rate</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Views</div>
              <div className="col-span-1"></div>
            </div>

            {listings.slice(0, 5).map((listing: any, i: number) => (
              <motion.div
                key={listing.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/listing/${listing.id || ""}`}
                  className="block md:grid md:grid-cols-12 gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Property info */}
                  <div className="col-span-5 flex items-center gap-3 mb-2 md:mb-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-primary-soft)] to-pink-100 dark:from-[var(--color-primary)]/20 dark:to-[var(--color-primary)]/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {listing.title || listing.address || "Untitled Listing"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.city || listing.suburb || ""} {listing.postcode || ""}
                      </p>
                    </div>
                  </div>

                  {/* Rate */}
                  <div className="col-span-2 flex items-center md:justify-start gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[var(--color-accent)] md:hidden" />
                    <span className="text-sm font-semibold text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                      ${listing.weekly_price || listing.weeklyPrice || 0}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">/wk</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] dark:bg-[var(--color-accent-soft)]0/20 dark:text-[var(--color-accent)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-soft)]0" />
                      Active
                    </span>
                  </div>

                  {/* Views */}
                  <div className="col-span-2 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <Eye className="w-3.5 h-3.5" />
                    {listing.views || "-"}
                  </div>

                  {/* Arrow */}
                  <div className="col-span-1 hidden md:flex items-center justify-end">
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Owner profile snapshot: badges + properties */}
      {profile && (profile.badges.length > 0 || profile.roomsOwned > 0 || profile.propertiesOwned > 0) && (
        <div className="card p-5 space-y-4">
          {/* Properties counter */}
          {(profile.roomsOwned > 0 || profile.propertiesOwned > 0) && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)]">
                <Home className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-sm font-semibold text-[var(--color-primary)] dark:text-[var(--color-primary)]">{profile.roomsOwned}</span>
                <span className="text-xs text-[var(--color-primary)]/70 dark:text-[var(--color-primary)]/70">rooms</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary)]/20">
                <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-sm font-semibold text-[var(--color-primary)] dark:text-[var(--color-primary)]">{profile.propertiesOwned}</span>
                <span className="text-xs text-[var(--color-primary)]/70 dark:text-primary-soft">properties</span>
              </div>
              <Link
                href="/dashboard/owner-profile"
                className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] font-medium ml-auto"
              >
                Edit
              </Link>
            </div>
          )}

          {/* Badges */}
          {profile.badges.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Your Badges
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                  >
                    <Trophy className="w-3 h-3" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mentor Network CTA */}
      <Link href="/mentors">
        <motion.div
          whileHover={{ y: -2 }}
          className="card p-6 text-center cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">
            Mentor Network
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Help new arrivals settle into your suburb. Earn $20-30 per session as a local guide.
          </p>
        </motion.div>
      </Link>

      {/* Community section - below badges */}
      <CommunityHighlights />
    </div>
  );
}
