import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getFeaturedProfiles } from "../../lib/api";
import {
  Trophy,
  Building2,
  Crown,
  ChevronRight,
  Users,
  Star,
} from "lucide-react";

interface FeaturedProfile {
  id: string;
  name: string | null;
  preferred_name: string | null;
  custom_pfp: string | null;
  badges: string[];
  occupation: string | null;
  about_me: string | null;
  listing_count?: number;
}

interface FeaturedData {
  top_listers: FeaturedProfile[];
  top_members: FeaturedProfile[];
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export default function CommunityHighlights() {
  const [data, setData] = useState<FeaturedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listers" | "members">("listers");

  useEffect(() => {
    let cancelled = false;
    getFeaturedProfiles().then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="card p-5">
        <Skeleton className="w-40 h-5 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-2/3 h-4" />
                <Skeleton className="w-1/3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const listers = data?.top_listers || [];
  const members = data?.top_members || [];
  const hasListers = listers.length > 0;
  const hasMembers = members.length > 0;

  if (!hasListers && !hasMembers) return null;

  const activeList = activeTab === "listers" ? listers : members;

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[var(--color-ink)] flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--color-primary)]" />
          Community
        </h2>
      </div>

      {/* Tabs */}
      {hasListers && hasMembers && (
        <div className="flex gap-1 mb-4 bg-[var(--color-surface-sunk)] rounded-lg p-1">
          <button
            onClick={() => setActiveTab("listers")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "listers"
                ? "bg-[var(--color-surface-2)] text-[var(--color-primary)] dark:text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] dark:hover:text-[var(--color-ink-4)]"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Top Listers
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "members"
                ? "bg-[var(--color-surface-2)] text-[var(--color-primary)] dark:text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] dark:hover:text-[var(--color-ink-4)]"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Top Members
          </button>
        </div>
      )}

      {/* If only one tab exists, show a label */}
      {hasListers && !hasMembers && (
        <p className="text-xs font-semibold text-[var(--color-ink-3)] uppercase tracking-wider mb-3">
          Top Listers
        </p>
      )}
      {!hasListers && hasMembers && (
        <p className="text-xs font-semibold text-[var(--color-ink-3)] uppercase tracking-wider mb-3">
          Top Members
        </p>
      )}

      {/* Profile list */}
      <div className="space-y-1">
        {activeList.slice(0, 5).map((profile, i) => {
          const displayName = profile.preferred_name || profile.name || "User";
          const badgeCount = profile.badges?.length || 0;

          return (
            <div key={profile.id}>
              <Link
                href={`/users/profile/${profile.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-surface)]/50 transition-colors group"
              >
                {/* Rank */}
                <span className={`w-6 text-center text-xs font-bold shrink-0 ${
                  i === 0 ? "text-[var(--color-warn-500)]" : i === 1 ? "text-[var(--color-ink-3)]" : i === 2 ? "text-[var(--color-warn-600)] dark:text-[var(--color-warn-600)]" : "text-[var(--color-ink-4)]"
                }`}>
                  {i === 0 ? (
                    <Crown className="w-4 h-4 mx-auto text-[var(--color-warn-500)]" />
                  ) : (
                    `#${i + 1}`
                  )}
                </span>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 ${
                  profile.custom_pfp ? "" : "bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)]"
                }`}>
                  {profile.custom_pfp ? (
                    <img src={profile.custom_pfp} alt={`${profile.name || "Community member"} profile photo`} className="w-full h-full object-cover" />
                  ) : (
                    displayName[0]?.toUpperCase() || "U"
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-ink)] truncate group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-primary)] transition-colors">
                    {displayName}
                  </p>
                  <p className="text-xs text-[var(--color-ink-3)] truncate">
                    {activeTab === "listers" && profile.listing_count
                      ? `${profile.listing_count} listing${profile.listing_count > 1 ? "s" : ""}`
                      : profile.occupation || (badgeCount > 0 ? `${badgeCount} badge${badgeCount > 1 ? "s" : ""}` : "Community member")}
                  </p>
                </div>

                {/* Badge pill */}
                {badgeCount > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20 shrink-0">
                    <Trophy className="w-2.5 h-2.5" />
                    {badgeCount}
                  </span>
                )}

                {activeTab === "listers" && profile.listing_count && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] shrink-0">
                    <Building2 className="w-2.5 h-2.5" />
                    {profile.listing_count}
                  </span>
                )}

                <ChevronRight className="w-3.5 h-3.5 text-[var(--color-ink-4)] group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
