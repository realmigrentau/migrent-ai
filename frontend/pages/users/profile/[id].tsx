import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../../components/Layout";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useAuth } from "../../../hooks/useAuth";
import ReportModal from "../../../components/ReportModal";
import VerificationModal from "../../../components/VerificationModal";

export default function PublicProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { profile, badges, loading, error } = useUserProfile(id as string | undefined);

  const [reportOpen, setReportOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);

  const isOwnProfile = user?.id === id;

  // Loading
  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Skeleton */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-[280px] shrink-0">
              <div className="card p-8 rounded-2xl flex flex-col items-center">
                <div className="w-28 h-28 rounded-full shimmer" />
                <div className="w-24 h-5 shimmer rounded mt-4" />
                <div className="w-16 h-3 shimmer rounded mt-2" />
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <div className="w-48 h-8 shimmer rounded" />
              <div className="w-full h-20 shimmer rounded-xl" />
              <div className="w-full h-32 shimmer rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Not found
  if (error || !profile) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="card p-8 rounded-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Profile not found</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">This user doesn&apos;t exist or their profile has been removed.</p>
            <Link href="/" className="btn-primary py-2.5 px-6 rounded-xl text-sm inline-block">Go home</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = profile.preferred_name || profile.name || "User";
  const isVerified = badges?.isVerified || false;
  const isSuperhost = badges?.isSuperhost || false;

  // Lifestyle icon mapping
  const lifestyleIcons: Record<string, string> = {
    "Quiet": "🤫", "Non-smoker": "🚭", "Early riser": "🌅", "Night owl": "🦉",
    "Clean & tidy": "✨", "Social": "🎉", "Student": "📚", "Professional": "💼",
    "No pets": "🚫", "Pet-friendly": "🐾", "Vegetarian/Vegan": "🥗", "LGBTQ+ friendly": "🏳️‍🌈",
  };

  // Interest icon mapping
  const interestIcons: Record<string, string> = {
    "Cooking": "🍳", "Gaming": "🎮", "Fitness": "💪", "Reading": "📖",
    "Music": "🎵", "Photography": "📷", "Travel": "✈️", "Art": "🎨",
    "Hiking": "🥾", "Movies": "🎬", "Coding": "💻", "Yoga": "🧘",
    "Sports": "⚽", "Dancing": "💃", "Gardening": "🌱", "Coffee": "☕",
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ═══════ LEFT SIDEBAR — Profile Card ═══════ */}
          <div className="lg:w-[280px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Main card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card rounded-2xl overflow-hidden"
              >
                {/* Profile photo + name */}
                <div className="p-6 pb-4 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div
                    onClick={() => setVerifyModalOpen(true)}
                    className="relative cursor-pointer group"
                  >
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-4xl overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-xl transition-all group-hover:shadow-rose-500/20 group-hover:ring-rose-200 dark:group-hover:ring-rose-500/30">
                      {profile.custom_pfp ? (
                        <img src={profile.custom_pfp} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        displayName[0].toUpperCase()
                      )}
                    </div>
                    {/* Verified badge on avatar */}
                    {isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-900 rounded-full p-1 shadow-md">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">{displayName}</h2>

                  {isSuperhost && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-slate-600 dark:text-slate-300">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Superhost
                    </div>
                  )}
                </div>

                {/* Stats divider */}
                <div className="border-t border-slate-100 dark:border-slate-800" />

                {/* Stats */}
                <div className="p-4 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
                  <div className="text-center px-2">
                    <div className="text-lg font-black text-slate-900 dark:text-white">{profile.reviews_count}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Reviews</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-0.5">
                      {profile.average_rating > 0 ? profile.average_rating.toFixed(1) : "—"}
                      {profile.average_rating > 0 && <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Rating</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-lg font-black text-slate-900 dark:text-white">{profile.months_on_platform || "<1"}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Months</div>
                  </div>
                </div>
              </motion.div>

              {/* Confirmed info card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="card p-5 rounded-2xl"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{displayName}&apos;s confirmed information</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Email address</span>
                  </div>
                  {isVerified && (
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm text-slate-600 dark:text-slate-300">Identity verified</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Phone number</span>
                  </div>
                </div>
                {!isVerified && !isOwnProfile && (
                  <button
                    onClick={() => setVerifyModalOpen(true)}
                    className="mt-3 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    Learn about identity verification
                  </button>
                )}
              </motion.div>

              {/* Report / Block */}
              {!isOwnProfile && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col gap-1">
                  <button
                    onClick={() => setReportOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    Report this profile
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Block this user
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* ═══════ RIGHT CONTENT ═══════ */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Title + Edit */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                  About {displayName}
                </h1>
                {isOwnProfile && (
                  <Link
                    href={profile.role === "owner" ? "/dashboard/owner-profile" : "/dashboard/seeker-profile"}
                    className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Edit profile
                  </Link>
                )}
              </div>
              {profile.member_since_label && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Joined {profile.member_since_label}</p>
              )}
            </motion.div>

            {/* ── Quick info pills ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-wrap gap-2">
              {profile.occupation && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <span className="text-base">💼</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">My work: {profile.occupation}</span>
                </div>
              )}
              {profile.languages.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <span className="text-base">🌐</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Speaks {profile.languages.join(", ")}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <span className="text-base">📍</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Lives in {profile.location}</span>
                </div>
              )}
              {profile.most_useless_skill && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
                  <span className="text-base">🎯</span>
                  <span className="text-sm text-purple-700 dark:text-purple-300">Useless skill: {profile.most_useless_skill}</span>
                </div>
              )}
              {isVerified && (
                <button
                  onClick={() => setVerifyModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Identity verified</span>
                </button>
              )}
            </motion.div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700" />

            {/* ── About / Bio ── */}
            {(profile.about_me || profile.bio) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <p className="text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {profile.about_me || profile.bio}
                </p>
              </motion.div>
            )}

            {/* ── Lifestyle ── */}
            {profile.lifestyle.length > 0 && (
              <>
                <div className="border-t border-slate-200 dark:border-slate-700" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Lifestyle</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.lifestyle.map((item) => (
                      <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <span>{lifestyleIcons[item] || "•"}</span>
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            {/* ── Interests ── */}
            {profile.interests.length > 0 && (
              <>
                <div className="border-t border-slate-200 dark:border-slate-700" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((item) => (
                      <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-500/20">
                        <span>{interestIcons[item] || "•"}</span>
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            {/* ── Badges ── */}
            {profile.badges.length > 0 && (
              <>
                <div className="border-t border-slate-200 dark:border-slate-700" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{displayName}&apos;s badges</h2>
                  <div className="flex flex-wrap gap-2">
                    {(showAllBadges ? profile.badges : profile.badges.slice(0, 6)).map((badge) => (
                      <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        {badge}
                      </span>
                    ))}
                  </div>
                  {profile.badges.length > 6 && !showAllBadges && (
                    <button onClick={() => setShowAllBadges(true)} className="mt-3 text-sm font-semibold text-slate-900 dark:text-white underline underline-offset-4 hover:text-rose-500 transition-colors">
                      Show all {profile.badges.length} badges
                    </button>
                  )}
                </motion.div>
              </>
            )}

            {/* ── Response stats ── */}
            <>
              <div className="border-t border-slate-200 dark:border-slate-700" />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Host details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-subtle p-4 rounded-xl">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{profile.response_rate}%</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Response rate</div>
                  </div>
                  <div className="card-subtle p-4 rounded-xl">
                    <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">{profile.response_time}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Response time</div>
                  </div>
                </div>
              </motion.div>
            </>

            {/* ── Reviews placeholder ── */}
            <>
              <div className="border-t border-slate-200 dark:border-slate-700" />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{displayName}&apos;s reviews</h2>
                {profile.reviews_count > 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {profile.reviews_count} review{profile.reviews_count !== 1 ? "s" : ""} from other users. Full review system coming soon.
                  </p>
                ) : (
                  <div className="card-subtle p-6 rounded-xl text-center">
                    <svg className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Reviews will appear after completed deals</p>
                  </div>
                )}
              </motion.div>
            </>

            {/* ── Listings placeholder ── */}
            <>
              <div className="border-t border-slate-200 dark:border-slate-700" />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{displayName}&apos;s listings</h2>
                {(profile.rooms_owned > 0 || profile.properties_owned > 0) ? (
                  <div className="card-subtle p-5 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {profile.rooms_owned} room{profile.rooms_owned !== 1 ? "s" : ""} · {profile.properties_owned} propert{profile.properties_owned !== 1 ? "ies" : "y"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Listing details coming soon</p>
                    </div>
                  </div>
                ) : (
                  <div className="card-subtle p-6 rounded-xl text-center">
                    <svg className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400">No listings yet</p>
                  </div>
                )}
              </motion.div>
            </>

            {/* ── Social links ── */}
            {(profile.social_twitter || profile.social_facebook || profile.social_linkedin) && (
              <>
                <div className="border-t border-slate-200 dark:border-slate-700" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Connect with {displayName}</h2>
                  <div className="flex items-center gap-3">
                    {profile.social_twitter && (
                      <a href={profile.social_twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-sky-500 hover:border-sky-200 dark:hover:border-sky-500/30 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      </a>
                    )}
                    {profile.social_facebook && (
                      <a href={profile.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      </a>
                    )}
                    {profile.social_linkedin && (
                      <a href={profile.social_linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-700 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      </a>
                    )}
                  </div>
                </motion.div>
              </>
            )}

            {/* ── Message CTA ── */}
            {!isOwnProfile && (
              <>
                <div className="border-t border-slate-200 dark:border-slate-700" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Link
                    href="/account/messages"
                    className="inline-flex items-center gap-2 btn-primary py-3 px-6 rounded-xl text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message {displayName}
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReportModal itemType="profile" itemId={profile.id} isOpen={reportOpen} onClose={() => setReportOpen(false)} />
      <VerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        profile={{ name: displayName, custom_pfp: profile.custom_pfp, is_verified: isVerified, verifiedLabel: badges?.verifiedLabel || null }}
      />
    </Layout>
  );
}
