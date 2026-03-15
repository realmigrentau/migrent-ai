import { useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useDashboard } from "../../hooks/useDashboard";
import { useOwnerData } from "../../hooks/useOwnerData";
import { useBookings } from "../../hooks/useBookings";
import OwnerMetricsCards from "../../components/dashboard/OwnerMetricsCards";
import OwnerBookingsPipeline from "../../components/dashboard/OwnerBookingsPipeline";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";
import QuickActions from "../../components/dashboard/QuickActions";
import EarningsChart from "../../components/dashboard/EarningsChart";

export default function OwnerDashboard() {
  const { role, displayName, session, loading, setRole } = useDashboard();
  const { respond } = useBookings("owner");
  const {
    metrics,
    bookings,
    activity,
    loading: ownerLoading,
    refetch,
  } = useOwnerData();

  // Set role to owner if not already
  useEffect(() => {
    if (!loading && session && role && role !== "owner") {
      setRole("owner");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session]);

  const handleAccept = async (bookingId: string) => {
    const result = await respond(bookingId, "accept");
    refetch();
    return result;
  };

  const handleDecline = async (bookingId: string) => {
    const result = await respond(bookingId, "decline");
    refetch();
    return result;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Owner{" "}
            <span className="gradient-text-accent">Dashboard</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {displayName
              ? `Welcome back, ${displayName}`
              : "Manage your listings and bookings"}
          </p>
        </div>

        {/* 1. Metrics Cards */}
        <section>
          <OwnerMetricsCards metrics={metrics} loading={ownerLoading} />
        </section>

        {/* 2. Bookings Pipeline */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bookings Pipeline
            </h2>
            {metrics && metrics.pending_requests > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse">
                {metrics.pending_requests} awaiting response
              </span>
            )}
          </div>
          <OwnerBookingsPipeline
            bookings={bookings}
            loading={ownerLoading}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </section>

        {/* 3. Recent Activity */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="card rounded-xl">
            <ActivityTimeline activities={activity} loading={ownerLoading} />
          </div>
        </section>

        {/* 4. Quick Actions */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <QuickActions />
        </section>

        {/* 5. Earnings Chart */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Earnings Overview
          </h2>
          <EarningsChart bookings={bookings} />
        </section>

        {/* Platform fee info */}
        <section className="card-subtle p-6 rounded-2xl space-y-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            MigRent AI ABN: 22 669 566 941
          </div>
          <p>
            <strong className="text-slate-700 dark:text-slate-300">
              Platform fee:
            </strong>{" "}
            MigRent charges a one-time AUD 99 platform fee to owners when you
            successfully match with a tenant via the platform.
          </p>
          <p>
            All future rent payments are arranged directly between you and the
            tenant, outside of MigRent.
          </p>
        </section>

        {/* Disclaimers */}
        <section className="text-xs text-slate-400 dark:text-slate-500 space-y-2 pb-4">
          <p>
            Match scores and any suggestions are assistive only and do not
            constitute advice or guarantees.
          </p>
          <p>
            Owners must verify tenant information and arrange agreements
            directly with seekers.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
