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
import { CalendarDays, Clock, Home, MessageSquare, type LucideIcon } from "lucide-react";

const TABS = [
  { key: "about", label: "About" },
  { key: "listings", label: "Listings" },
  { key: "reviews", label: "Reviews" },
  { key: "verification", label: "Checks" },
];

export default function PublicProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { profile, badges, loading, error } = useUserProfile(id as string | undefined);
  const { listings, loading: listingsLoading, hasMore, loadMore } = useProfileListings(profile?.public_id ?? undefined);
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
        <div className="site-card site-card--pad text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="site-h3 site-h3--lg mb-2">Profile not found</h1>
          <p className="site-body mb-6">This person is not on Migrent, or their profile has been removed.</p>
          <Link href="/" className="btn-primary">Go to the homepage</Link>
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
        <div className="mt-8 sticky top-[96px] z-20 bg-[var(--color-bg)]/85 backdrop-blur-lg py-3 -mx-4 px-4 md:-mx-0 md:px-0">
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
            <h2 className="site-h3 site-h3--lg mb-4">Host details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Only shown once measurable. These were invented from account
                  age before, so a brand new host looked like a proven one. */}
              {profile.response_rate !== null && (
                <StatCard value={`${profile.response_rate}%`} label="Response rate" icon={MessageSquare} />
              )}
              {profile.response_time !== null && (
                <StatCard value={profile.response_time} label="Response time" icon={Clock} />
              )}
              <StatCard value={`${profile.months_on_platform || "<1"}`} label="Months on Migrent" icon={CalendarDays} />
              <StatCard
                value={`${profile.rooms_owned + profile.properties_owned}`}
                label="Properties"
                icon={Home}
              />
            </div>
          </motion.section>

          {/* ── Verification Trust ── */}
          <motion.section
            id="verification"
            {...sectionAnim(0.3)}
          >
            <h2 className="site-h3 site-h3--lg mb-4">
              What we have checked
            </h2>
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
              <h2 className="site-h3 site-h3--lg mb-3">Badges</h2>
              <div className="flex flex-wrap gap-2">
                {(showAllBadges ? profile.badges : profile.badges.slice(0, 6)).map((badge) => (
                  <span key={badge} className="site-chip">
                    {badge}
                  </span>
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
            <h2 className="site-h3 site-h3--lg mb-4">Reviews</h2>
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
            <h2 className="site-h3 site-h3--lg mb-4">Listings</h2>
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
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-[var(--color-ink-3)] hover:bg-[var(--color-danger-50)] dark:hover:bg-[var(--color-danger-500)]/10 hover:text-[var(--color-danger-500)] dark:hover:text-[var(--color-danger-500)] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Report this profile
                </button>
                <button
                  type="button"
                  onClick={handleToggleBlock}
                  disabled={blockLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 ${
                    blocked
                      ? "text-[var(--color-accent)] dark:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] dark:hover:bg-[var(--color-accent)]/10"
                      : "text-[var(--color-ink-3)] hover:bg-[var(--color-danger-50)] dark:hover:bg-[var(--color-danger-500)]/10 hover:text-[var(--color-danger-500)] dark:hover:text-[var(--color-danger-500)]"
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
                type="button"
                aria-label="Share this profile"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${displayName} on Migrent`,
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

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: LucideIcon }) {
  return (
    <div className="site-card p-4">
      <span className="site-icon site-icon--quiet !h-9 !w-9" aria-hidden="true">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <div className="mt-3 text-[20px] font-semibold tracking-[-0.01em] text-[var(--color-ink)] first-letter:uppercase tabular-nums">{value}</div>
      <div className="site-meta">{label}</div>
    </div>
  );
}
