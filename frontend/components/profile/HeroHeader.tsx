import { motion } from "framer-motion";
import Link from "next/link";
import { UserProfile, ProfileBadges } from "../../hooks/useUserProfile";

interface HeroHeaderProps {
  profile: UserProfile;
  badges: ProfileBadges;
  isOwnProfile: boolean;
  listingsCount: number;
  onMessage?: () => void;
  onVerifyClick?: () => void;
}

export default function HeroHeader({
  profile,
  badges,
  isOwnProfile,
  listingsCount,
  onVerifyClick,
}: HeroHeaderProps) {
  const displayName = profile.preferred_name || profile.name || "User";
  const isVerified = badges.isVerified;
  const isSuperhost = badges.isSuperhost;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Gradient background */}
      <div className="profile-hero-gradient absolute inset-0 opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

      <div className="relative px-6 py-8 md:px-10 md:py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={onVerifyClick}
            className="relative cursor-pointer group shrink-0"
          >
            <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-white/40 shadow-2xl transition-all group-hover:ring-white/70 ${isVerified ? "verify-pulse" : ""}`}>
              {profile.custom_pfp ? (
                <img src={profile.custom_pfp} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-5xl md:text-6xl font-black text-white select-none">{displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            {/* Verified heart */}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-md">
                {displayName}
              </h1>
              {isSuperhost && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/90 text-amber-950 shadow-lg badge-glow">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Superhost
                </span>
              )}
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified
                </span>
              )}
            </div>

            {/* Bio one-liner */}
            {(profile.about_me || profile.bio) && (
              <p className="mt-2 text-white/80 text-sm md:text-base max-w-lg line-clamp-2">
                {profile.about_me || profile.bio}
              </p>
            )}

            {/* 4-metric row */}
            <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 mt-4 flex-wrap">
              <StatPill
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
                value={profile.average_rating > 0 ? profile.average_rating.toFixed(1) : "--"}
                label={`(${profile.reviews_count})`}
              />
              <StatPill
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                value={`${profile.response_rate}%`}
                label="Response"
              />
              <StatPill
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                value={profile.response_time.replace("within ", "")}
                label="Avg reply"
              />
              {listingsCount > 0 && (
                <StatPill
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                  value={`${listingsCount}`}
                  label="Listings"
                />
              )}
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center md:justify-start gap-3 mt-6 flex-wrap">
              {!isOwnProfile ? (
                <>
                  <Link
                    href={`/messages?userId=${profile.id}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Message
                  </Link>
                  {listingsCount > 0 && (
                    <a
                      href="#listings"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-white/20 text-white backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      View Listings
                    </a>
                  )}
                </>
              ) : (
                <Link
                  href={profile.role === "owner" ? "/dashboard/owner-profile" : "/dashboard/seeker-profile"}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/90">
      <span className="opacity-70">{icon}</span>
      <span className="text-sm font-bold">{value}</span>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  );
}
