import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useProfileListings, useProfileReviews } from "../../../hooks/useProfileData";
import { useAuth } from "../../../hooks/useAuth";
import ReportModal from "../../../components/ReportModal";
import VerificationModal from "../../../components/VerificationModal";
import HeroHeader from "../../../components/profile/HeroHeader";
import StatsTabs from "../../../components/profile/StatsTabs";
import ListingsGrid from "../../../components/profile/ListingsGrid";
import ReviewCarousel from "../../../components/profile/ReviewCarousel";
import HostAbout from "../../../components/profile/HostAbout";
import VerificationCarousel from "../../../components/profile/VerificationCarousel";
import { blockUser, unblockUser, isUserBlocked } from "../../../lib/api";

const TABS = [
  { key: "about", label: "About", icon: "🏠" },
  { key: "listings", label: "Listings", icon: "📊" },
  { key: "reviews", label: "Reviews", icon: "💬" },
  { key: "verification", label: "Trust", icon: "🛡️" },
];

export default function PublicProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { profile, badges, loading, error } = useUserProfile(id as string | undefined);
  const { listings, loading: listingsLoading, hasMore, loadMore } = useProfileListings(id as string | undefined);
  const { reviews, loading: reviewsLoading } = useProfileReviews(id as string | undefined);

  const [activeTab, setActiveTab] = useState("about");
  const [reportOpen, setReportOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  const isOwnProfile = user?.id === id;

  // Scroll-triggered animation refs
  const aboutRef = useRef<HTMLDivElement>(null);
  const listingsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const verifyRef = useRef<HTMLDivElement>(null);

  const aboutInView = useInView(aboutRef, { once: true, margin: "-50px" });
  const listingsInView = useInView(listingsRef, { once: true, margin: "-50px" });
  const reviewsInView = useInView(reviewsRef, { once: true, margin: "-50px" });
  const verifyInView = useInView(verifyRef, { once: true, margin: "-50px" });

  // Check if user is blocked
  useEffect(() => {
    if (id && user && id !== user.id) {
      isUserBlocked(id as string).then(setBlocked);
    }
  }, [id, user]);

  // Update tab counts dynamically
  const tabsWithCounts = TABS.map(tab => ({
    ...tab,
    count: tab.key === "listings" ? listings.length
      : tab.key === "reviews" ? (reviews.length || profile?.reviews_count || 0)
      : undefined,
  }));

  const handleToggleBlock = async () => {
    if (!id || blockLoading) return;
    setBlockLoading(true);
    if (blocked) {
      const ok = await unblockUser(id as string);
      if (ok) setBlocked(false);
    } else {
      const ok = await blockUser(id as string);
      if (ok) setBlocked(true);
    }
    setBlockLoading(false);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      about: aboutRef,
      listings: listingsRef,
      reviews: reviewsRef,
      verification: verifyRef,
    };
    const ref = refMap[key];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero skeleton */}
        <div className="rounded-3xl overflow-hidden shimmer h-64 md:h-72" />
        {/* Tabs skeleton */}
        <div className="flex gap-2 mt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-28 h-10 shimmer rounded-xl" />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="mt-8 space-y-4">
          <div className="w-48 h-6 shimmer rounded" />
          <div className="w-full h-24 shimmer rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] shimmer" />
                <div className="p-4 space-y-2">
                  <div className="w-3/4 h-4 shimmer rounded" />
                  <div className="w-1/2 h-3 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (error || !profile || !badges) {
    return (
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
    );
  }

  const displayName = profile.preferred_name || profile.name || "User";

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">

        {/* ═══════ 1. HERO HEADER ═══════ */}
        <HeroHeader
          profile={profile}
          badges={badges}
          isOwnProfile={isOwnProfile}
          listingsCount={listings.length}
          onVerifyClick={() => setVerifyModalOpen(true)}
        />

        {/* ═══════ 2. STATS TABS ═══════ */}
        <div className="mt-6 sticky top-[76px] z-20 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-lg py-3 -mx-4 px-4 md:-mx-0 md:px-0">
          <StatsTabs
            tabs={tabsWithCounts}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* ═══════ CONTENT SECTIONS ═══════ */}
        <div className="mt-8 space-y-12">

          {/* ── About Section ── */}
          <motion.section
            ref={aboutRef}
            id="about"
            initial={{ opacity: 0, y: 24 }}
            animate={aboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <HostAbout profile={profile} />
          </motion.section>

          {/* ── Host Details ── */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={aboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Host details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard value={`${profile.response_rate}%`} label="Response rate" icon="📩" />
              <StatCard value={profile.response_time} label="Response time" icon="⚡" />
              <StatCard value={`${profile.months_on_platform || "<1"}`} label="Months on MigRent" icon="📅" />
              <StatCard
                value={`${profile.rooms_owned + profile.properties_owned}`}
                label="Properties"
                icon="🏠"
              />
            </div>
          </motion.section>

          {/* ── Verification Trust ── */}
          <motion.section
            ref={verifyRef}
            id="verification"
            initial={{ opacity: 0, y: 24 }}
            animate={verifyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {displayName}&apos;s verified information
            </h3>
            <VerificationCarousel
              profile={profile}
              badges={badges}
              onVerifyClick={() => setVerifyModalOpen(true)}
            />
          </motion.section>

          {/* ── Badges ── */}
          {profile.badges.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={verifyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{displayName}&apos;s badges</h3>
              <div className="flex flex-wrap gap-2">
                {(showAllBadges ? profile.badges : profile.badges.slice(0, 6)).map((badge) => (
                  <motion.span
                    key={badge}
                    whileHover={{ scale: 1.05, y: -1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 cursor-default"
                  >
                    <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    {badge}
                  </motion.span>
                ))}
              </div>
              {profile.badges.length > 6 && !showAllBadges && (
                <button onClick={() => setShowAllBadges(true)} className="mt-3 text-sm font-semibold text-slate-900 dark:text-white underline underline-offset-4 hover:text-rose-500 transition-colors">
                  Show all {profile.badges.length} badges
                </button>
              )}
            </motion.section>
          )}

          {/* ── Reviews ── */}
          <motion.section
            ref={reviewsRef}
            id="reviews"
            initial={{ opacity: 0, y: 24 }}
            animate={reviewsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{displayName}&apos;s reviews</h3>
            <ReviewCarousel
              reviews={reviews}
              reviewsCount={profile.reviews_count}
              averageRating={profile.average_rating}
              loading={reviewsLoading}
              ownerName={displayName}
            />
          </motion.section>

          {/* ── Listings ── */}
          <motion.section
            ref={listingsRef}
            id="listings"
            initial={{ opacity: 0, y: 24 }}
            animate={listingsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{displayName}&apos;s listings</h3>
            <ListingsGrid
              listings={listings}
              loading={listingsLoading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              ownerName={displayName}
            />
          </motion.section>

          {/* ── Report / Block ── */}
          {!isOwnProfile && (
            <section className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Report this profile
                </button>
                <button
                  onClick={handleToggleBlock}
                  disabled={blockLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 ${
                    blocked
                      ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  {blockLoading ? "..." : blocked ? "Unblock this user" : "Block this user"}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ═══════ MOBILE STICKY CTA BAR ═══════ */}
      {!isOwnProfile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 py-3 pb-safe-bottom">
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              <Link
                href={`/account/messages/${profile.id}`}
                className="flex-1 flex items-center justify-center gap-2 btn-primary py-3 rounded-xl text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </Link>
              {listings.length > 0 && (
                <a
                  href="#listings"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  Listings
                </a>
              )}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${displayName} on MigRent`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extra bottom padding on mobile for sticky CTA */}
      {!isOwnProfile && <div className="h-24 md:hidden" />}

      {/* Modals */}
      <ReportModal itemType="profile" itemId={profile.id} isOpen={reportOpen} onClose={() => setReportOpen(false)} />
      <VerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        profile={{ name: displayName, custom_pfp: profile.custom_pfp, is_verified: badges.isVerified, verifiedLabel: badges.verifiedLabel || null }}
      />
    </>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card p-4 rounded-xl text-center hover:shadow-md transition-shadow"
    >
      <span className="text-2xl">{icon}</span>
      <div className="text-lg font-black text-slate-900 dark:text-white mt-1 capitalize">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </motion.div>
  );
}
