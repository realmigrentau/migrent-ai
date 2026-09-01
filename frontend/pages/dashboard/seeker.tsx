import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Search,
  Settings,
  Heart,
  Star,
  ArrowRight,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import EnableNotificationsCard from "../../components/notifications/EnableNotificationsCard";
import { useDashboard } from "../../hooks/useDashboard";
import { useSeekerData } from "../../hooks/useSeekerData";
import { useBookings } from "../../hooks/useBookings";
import SeekerMetrics from "../../components/dashboard/SeekerMetrics";
import DashboardSeekerBookings from "../../components/dashboard/SeekerBookingsTable";
import WishlistGrid from "../../components/dashboard/WishlistGrid";
import RecommendedMatches from "../../components/dashboard/RecommendedMatches";

export default function SeekerDashboard() {
  const router = useRouter();
  const { role, displayName, session, loading, setRole } = useDashboard();
  const { cancel } = useBookings("seeker");
  const {
    metrics,
    bookings,
    wishlist,
    recommended,
    loading: seekerLoading,
    refetch,
  } = useSeekerData();

  // Set role to seeker if not already
  useEffect(() => {
    if (!loading && session && role && role !== "seeker") {
      setRole("seeker");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session]);

  const handleCancel = async (bookingId: string) => {
    const result = await cancel(bookingId);
    refetch();
    return result;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Notification opt-in */}
        {session && <EnableNotificationsCard token={session.access_token} />}

        {/* 1. Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface-2)] border border-[var(--color-line)]/70 dark:border-slate-800 rounded-2xl p-6 md:p-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Hi {displayName || "there"} <span className="inline-block">&#128075;</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-2)]">
            {metrics ? (
              <>
                {metrics.recommended > 0 && (
                  <span className="font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)]">
                    {metrics.recommended} matches waiting
                  </span>
                )}
                {metrics.recommended > 0 && metrics.pending_requests > 0 && (
                  <span className="text-[var(--color-ink-3)]"> &middot; </span>
                )}
                {metrics.pending_requests > 0 && (
                  <span className="font-medium text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]">
                    {metrics.pending_requests} booking request
                    {metrics.pending_requests !== 1 ? "s" : ""} pending
                  </span>
                )}
                {!metrics.recommended && !metrics.pending_requests && (
                  <span>Find your perfect room and manage your search</span>
                )}
              </>
            ) : (
              "Find your perfect room and manage your search"
            )}
          </p>

          {/* Quick search bar */}
          <div className="mt-5 max-w-md">
            <button
              onClick={() => router.push("/seeker/search")}
              className="w-full flex items-center gap-3 px-4 h-11 rounded-xl bg-[var(--color-surface)] border border-[var(--color-line)]/70 dark:border-slate-800 text-[var(--color-ink-3)] hover:border-[var(--color-line-2)] dark:hover:border-slate-700 transition-colors text-left"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search rooms by suburb or postcode...</span>
            </button>
          </div>
        </motion.div>

        {/* 2. Metrics Row */}
        <section>
          <SeekerMetrics metrics={metrics} loading={seekerLoading} />
        </section>

        {/* 3. Bookings Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
              My Bookings
            </h2>
            {bookings.length > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]">
                {
                  bookings.filter((b) =>
                    ["PENDING_OWNER", "OWNER_ACCEPTED"].includes(b.status)
                  ).length
                }{" "}
                active
              </span>
            )}
          </div>
          <DashboardSeekerBookings
            bookings={bookings}
            loading={seekerLoading}
            onCancel={handleCancel}
          />
        </section>

        {/* 4. Saved Listings (Wishlist) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)] flex items-center gap-2">
              <Heart className="w-5 h-5 text-[var(--color-primary)]" />
              Saved Listings
            </h2>
            {wishlist.length > 0 && (
              <Link
                href="/seeker/wishlist"
                className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] font-medium flex items-center gap-1"
              >
                View all ({wishlist.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <WishlistGrid listings={wishlist} loading={seekerLoading} />
        </section>

        {/* 5. Recommended Matches */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)] flex items-center gap-2">
                <Star className="w-5 h-5 text-[var(--color-primary)]" />
                Perfect for You
              </h2>
              <p className="text-xs text-[var(--color-ink-3)] mt-1">
                AI-suggested based on your preferences
              </p>
            </div>
          </div>
          <RecommendedMatches listings={recommended} loading={seekerLoading} />
        </section>

        {/* 6. Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)] mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                href: "/seeker/search",
                label: "Find New Rooms",
                desc: "Browse all available listings",
                icon: <Search className="w-5 h-5" />,
                color: "text-[var(--color-primary)]",
                bg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10",
              },
              {
                href: "/seeker/wishlist",
                label: "Saved Searches",
                desc: "Your collections and saved rooms",
                icon: <Heart className="w-5 h-5" />,
                color: "text-[var(--color-primary)]",
                bg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10",
              },
              {
                href: "/account/settings",
                label: "Settings",
                desc: "Profile, verification, preferences",
                icon: <Settings className="w-5 h-5" />,
                color: "text-[var(--color-accent)]",
                bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10",
              },
            ].map((action) => (
              <motion.div
                key={action.href}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
              >
                <Link href={action.href}>
                  <div className="card p-5 rounded-2xl group cursor-pointer transition-colors">
                    <div
                      className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center mb-3`}
                    >
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-[var(--color-ink)] text-sm tracking-tight">
                      {action.label}
                    </h3>
                    <p className="text-xs text-[var(--color-ink-2)] mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Platform fee info */}
        <section className="card-subtle p-5 rounded-2xl text-sm text-[var(--color-ink-3)]">
          <p>
            When you successfully secure a place through MigRent, a small
            one-time platform fee of AUD 19 may be offered. This fee is optional
            at this stage and will always be shown clearly before you pay.
          </p>
        </section>

        {/* Disclaimers */}
        <section className="text-xs text-[var(--color-ink-3)] space-y-2 pb-4">
          <p>
            Match scores and any suggestions are assistive only and do not
            constitute advice or guarantees.
          </p>
          <p>
            Seekers must inspect properties and arrange agreements directly with
            owners.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
