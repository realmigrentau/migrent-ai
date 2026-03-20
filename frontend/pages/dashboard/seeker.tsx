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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/10 to-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Hi {displayName || "there"}{" "}
              <span className="inline-block animate-pulse">&#128075;</span>{" "}
              <span className="gradient-text">Welcome back</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {metrics ? (
                <>
                  {metrics.recommended > 0 && (
                    <span className="font-medium text-indigo-500">
                      {metrics.recommended} matches waiting
                    </span>
                  )}
                  {metrics.recommended > 0 && metrics.pending_requests > 0 && (
                    <span> | </span>
                  )}
                  {metrics.pending_requests > 0 && (
                    <span className="font-medium text-amber-500">
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
            <div className="mt-4 max-w-md">
              <button
                onClick={() => router.push("/seeker/search")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-rose-300 dark:hover:border-rose-500/30 transition-colors text-left"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search rooms by suburb or postcode...</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* 2. Metrics Row */}
        <section>
          <SeekerMetrics metrics={metrics} loading={seekerLoading} />
        </section>

        {/* 3. Bookings Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              My Bookings
            </h2>
            {bookings.length > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Saved Listings
            </h2>
            {wishlist.length > 0 && (
              <Link
                href="/seeker/wishlist"
                className="text-sm text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1"
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-indigo-500" />
                Perfect for You
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                AI-suggested based on your preferences
              </p>
            </div>
          </div>
          <RecommendedMatches listings={recommended} loading={seekerLoading} />
        </section>

        {/* 6. Quick Actions */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                href: "/seeker/search",
                label: "Find New Rooms",
                desc: "Browse all available listings",
                icon: <Search className="w-5 h-5" />,
                color: "text-rose-500",
                bg: "bg-rose-100 dark:bg-rose-500/20",
              },
              {
                href: "/seeker/wishlist",
                label: "Saved Searches",
                desc: "Your collections and saved rooms",
                icon: <Heart className="w-5 h-5" />,
                color: "text-indigo-500",
                bg: "bg-indigo-100 dark:bg-indigo-500/20",
              },
              {
                href: "/account/settings",
                label: "Settings",
                desc: "Profile, verification, preferences",
                icon: <Settings className="w-5 h-5" />,
                color: "text-emerald-500",
                bg: "bg-emerald-100 dark:bg-emerald-500/20",
              },
            ].map((action) => (
              <motion.div
                key={action.href}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
                <Link href={action.href}>
                  <div className="card p-5 rounded-2xl hover:shadow-md dark:hover:shadow-2xl group cursor-pointer">
                    <div
                      className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      {action.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {action.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Platform fee info */}
        <section className="card-subtle p-5 rounded-2xl text-sm text-slate-500 dark:text-slate-400">
          <p>
            When you successfully secure a place through MigRent, a small
            one-time platform fee of AUD 19 may be offered. This fee is optional
            at this stage and will always be shown clearly before you pay.
          </p>
        </section>

        {/* Disclaimers */}
        <section className="text-xs text-slate-400 dark:text-slate-500 space-y-2 pb-4">
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
