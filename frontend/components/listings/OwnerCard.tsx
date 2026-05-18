import Link from "next/link";
import { ShieldCheck, MessageCircle, Home, BadgeCheck } from "lucide-react";
import GlassCard from "../ui/GlassCard";

interface OwnerProfile {
  name: string;
  custom_pfp?: string | null;
  verified?: boolean;
  identity_verified?: boolean;
  bio?: string;
  badges?: string[];
  listings_count?: number;
}

interface OwnerCardProps {
  profile: OwnerProfile;
  ownerId: string;
  listingId: string;
}

export default function OwnerCard({
  profile,
  ownerId,
  listingId,
}: OwnerCardProps) {
  return (
    <GlassCard gradient="rose" padding="md">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Your host
      </h2>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        {profile.custom_pfp ? (
          <img
            src={profile.custom_pfp}
            alt={profile.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--color-primary-soft)] dark:ring-[var(--color-primary)]/20"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl ring-2 ring-[var(--color-primary-soft)] dark:ring-[var(--color-primary)]/20">
            {profile.name.charAt(0)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900 dark:text-white text-base">
              {profile.name}
            </p>
            {profile.verified && (
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
            {profile.listings_count != null && profile.listings_count > 0 && (
              <span className="flex items-center gap-1">
                <Home className="w-3 h-3" />
                {profile.listings_count} listing
                {profile.listings_count !== 1 ? "s" : ""}
              </span>
            )}
            {profile.identity_verified && (
              <span className="flex items-center gap-1 text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                <BadgeCheck className="w-3 h-3" />
                ID verified
              </span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">
              {profile.bio}
            </p>
          )}

          {/* Badges */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.badges.slice(0, 4).map((badge, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message button */}
      <Link
        href={`/dashboard/messages?listing=${listingId}&to=${ownerId}`}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        Message host
      </Link>
    </GlassCard>
  );
}
