import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "../../../components/Layout";
import AvatarWithVerification from "../../../components/AvatarWithVerification";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useAuth } from "../../../hooks/useAuth";

export default function PublicProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { profile, badges, loading, error } = useUserProfile(
    id as string | undefined
  );

  const isOwnProfile = user?.id === id;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="card p-8 rounded-2xl text-center">
            <svg
              className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Profile not found
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              This user profile doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/"
              className="btn-primary py-2.5 px-6 rounded-xl text-sm inline-block"
            >
              Go home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = profile.preferred_name || profile.name || "User";
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 md:p-8 rounded-2xl"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <AvatarWithVerification
                name={displayName}
                photo={profile.custom_pfp}
                isVerified={badges?.isVerified || false}
                verifiedLabel={badges?.verifiedLabel || null}
                size={96}
              />
              {badges?.isSuperhost && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Superhost
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                    About {displayName}
                  </h1>
                  {memberSince && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Member since {memberSince}
                    </p>
                  )}
                </div>
                {isOwnProfile && (
                  <Link
                    href={
                      profile.role === "owner"
                        ? "/dashboard/owner-profile"
                        : "/dashboard/seeker-profile"
                    }
                    className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Edit profile
                  </Link>
                )}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                {profile.reviews_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {profile.reviews_count}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Review{profile.reviews_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {profile.average_rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {profile.average_rating.toFixed(2)}
                    </span>
                    <svg
                      className="w-4 h-4 text-amber-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}
                {profile.months_hosting > 0 && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {profile.months_hosting} month
                    {profile.months_hosting !== 1 ? "s" : ""} hosting
                  </div>
                )}
              </div>

              {/* Verified badge */}
              {badges?.isVerified && badges.verifiedLabel && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Verified {badges.verifiedLabel}
                  </span>
                  <svg
                    className="w-4 h-4 text-rose-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* About section */}
        {(profile.about_me || profile.bio) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card p-6 md:p-8 rounded-2xl"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              About
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {profile.about_me || profile.bio}
            </p>
          </motion.div>
        )}

        {/* Response & Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 md:p-8 rounded-2xl"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Response rate */}
            <div className="card-subtle p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {profile.response_rate}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Response rate
              </div>
            </div>

            {/* Response time */}
            <div className="card-subtle p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {profile.response_time === "within 24h"
                  ? "24h"
                  : profile.response_time || "24h"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Response time
              </div>
            </div>

            {/* Languages */}
            <div className="card-subtle p-4 rounded-xl text-center col-span-2 sm:col-span-1">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {profile.languages?.join(", ") || "English"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Languages
              </div>
            </div>
          </div>

          {/* Work */}
          {profile.work && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <svg
                className="w-5 h-5 text-slate-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {profile.work}
              </span>
            </div>
          )}

          {/* Location */}
          {profile.location && (
            <div className="mt-2 flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <svg
                className="w-5 h-5 text-slate-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {profile.location}
              </span>
            </div>
          )}

          {/* Fun skill */}
          {profile.most_useless_skill && (
            <div className="mt-2 flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-lg shrink-0">🎯</span>
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Most useless skill
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {profile.most_useless_skill}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Photos */}
        {profile.profile_photos && profile.profile_photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6 md:p-8 rounded-2xl"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Where they&apos;ve been
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {profile.profile_photos.slice(0, 4).map((photo, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800"
                >
                  <img
                    src={photo}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Social Links */}
        {(profile.social_twitter ||
          profile.social_facebook ||
          profile.social_linkedin) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 md:p-8 rounded-2xl"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Connect
            </h2>
            <div className="flex items-center gap-3">
              {profile.social_twitter && (
                <a
                  href={profile.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-sky-500 hover:border-sky-200 dark:hover:border-sky-500/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {profile.social_facebook && (
                <a
                  href={profile.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {profile.social_linkedin && (
                <a
                  href={profile.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-700 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6 md:p-8 rounded-2xl"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Badges earned
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Ask about / CTA */}
        {!isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 md:p-8 rounded-2xl text-center"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Want to know more?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Send {displayName} a message to ask about their listings or get to
              know them.
            </p>
            <Link
              href="/account/messages"
              className="inline-flex items-center gap-2 btn-primary py-3 px-6 rounded-xl text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Message {displayName}
            </Link>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
