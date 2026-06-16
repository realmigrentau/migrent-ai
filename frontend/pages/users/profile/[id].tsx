import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
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
  const { reviews, loading: reviewsLoading, reviewsCount, averageRating } = useProfileReviews(id as string | undefined);

  const [activeTab, setActiveTab] = useState("about");
  const [reportOpen, setReportOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  const isOwnProfile = user?.id === id;

  // Staggered section animation helper
  const sectionAnim = (delay: number) => ({
    initial: { opacity: 0, y: 20 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.4, delay, ease: "easeOut" as const },
  });

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
      : tab.key === "reviews" ? (reviewsCount || reviews.length || profile?.reviews_count || 0)
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
    const el = document.getElementById(key);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Profile not found</h2>
          <p className="text-sm text-[var(--color-ink-3)] mb-6">This user doesn&apos;t exist or their profile has been removed.</p>
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
        <div className="mt-6 sticky top-[76px] z-20 bg-[var(--color-surface)]/80 dark:bg-[var(--color-bg)]/80 backdrop-blur-lg py-3 -mx-4 px-4 md:-mx-0 md:px-0">
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
            id="about"
            {...sectionAnim(0.1)}
          >
            <HostAbout profile={profile} />
          </motion.section>

          {/* ── Host Details ── */}
          <motion.section
            {...sectionAnim(0.2)}
          >
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-4">Host details</h3>
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
            id="verification"
            {...sectionAnim(0.3)}
          >
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-4">
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
              {...sectionAnim(0.35)}
            >
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-3">{displayName}&apos;s badges</h3>
              <div className="flex flex-wrap gap-2">
                {(showAllBadges ? profile.badges : profile.badges.slice(0, 6)).map((badge) => (
                  <motion.span
                    key={badge}
                    whileHover={{ scale: 1.05, y: -1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20 cursor-default"
                  >
                    <svg className="w-3.5 h-3.5 text-[var(--color-warn-500)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    {badge}
                  </motion.span>
                ))}
              </div>
              {profile.badges.length > 6 && !showAllBadges && (
                <button onClick={() => setShowAllBadges(true)} className="mt-3 text-sm font-semibold text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-primary)] transition-colors">
                  Show all {profile.badges.length} badges
                </button>
              )}
            </motion.section>
          )}

          {/* ── Reviews ── */}
          <motion.section
            id="reviews"
            {...sectionAnim(0.4)}
          >
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-4">{displayName}&apos;s reviews</h3>
            <ReviewCarousel
              reviews={reviews}
              reviewsCount={reviewsCount || profile.reviews_count}
              averageRating={averageRating || profile.average_rating}
              loading={reviewsLoading}
              ownerName={displayName}
            />
          </motion.section>

          {/* ── Listings ── */}
          <motion.section
            id="listings"
            {...sectionAnim(0.45)}
          >
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-4">{displayName}&apos;s listings</h3>
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
            <section className="border-t border-[var(--color-line)] pt-6">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-[var(--color-ink-3)] hover:bg-[var(--color-danger-50)] dark:hover:bg-[var(--color-danger-50)]0/10 hover:text-[var(--color-danger-500)] dark:hover:text-[var(--color-danger-500)] transition-all"
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
                      ? "text-[var(--color-accent)] dark:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] dark:hover:bg-[var(--color-accent-soft)]0/10"
                      : "text-[var(--color-ink-3)] hover:bg-[var(--color-danger-50)] dark:hover:bg-[var(--color-danger-50)]0/10 hover:text-[var(--color-danger-500)] dark:hover:text-[var(--color-danger-500)]"
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
          <div className="bg-white/95 dark:bg-[var(--color-surface)]/95 backdrop-blur-lg border-t border-[var(--color-line)] px-4 py-3 pb-safe-bottom">
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              <Link
                href={`/messages?userId=${profile.id}`}
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
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-[var(--color-line)] text-[var(--color-ink-2)]"
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
                className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl border border-[var(--color-line)] text-[var(--color-ink-3)]"
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
      <div className="text-lg font-black text-[var(--color-ink)] mt-1 capitalize">{value}</div>
      <div className="text-xs text-[var(--color-ink-3)]">{label}</div>
    </motion.div>
  );
}
