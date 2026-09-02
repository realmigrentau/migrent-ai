import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import EnableNotificationsCard from "../../components/notifications/EnableNotificationsCard";
import { useDashboard } from "../../hooks/useDashboard";
import { useOwnerData } from "../../hooks/useOwnerData";
import { useBookings } from "../../hooks/useBookings";
import { getListings } from "../../lib/api";
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

  const [pendingCount, setPendingCount] = useState(0);

  // Set role to owner if not already
  useEffect(() => {
    if (!loading && session && role && role !== "owner") {
      setRole("owner");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session]);

  // Check for pending listings
  useEffect(() => {
    if (!session) return;
    getListings(session.access_token, true).then((data) => {
      if (data && Array.isArray(data)) {
        const pending = data.filter((l: any) => l.moderation_status === "pending_approval" || l.moderation_status === "changes_requested");
        setPendingCount(pending.length);
      }
    }).catch(() => {});
  }, [session]);

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
        {/* Notification opt-in */}
        {session && <EnableNotificationsCard token={session.access_token} />}

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Owner Dashboard
          </h1>
          <p className="mt-2 text-[15px] text-[var(--color-ink-2)]">
            {displayName
              ? `Welcome back, ${displayName}`
              : "Manage your listings and bookings"}
          </p>
        </div>

        {/* Pending Approval Banner */}
        {pendingCount > 0 && (
          <div className="p-4 rounded-xl bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10 border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-[var(--color-warn-500)]">
                  {pendingCount} listing{pendingCount !== 1 ? "s" : ""} pending approval
                </p>
                <p className="text-xs text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] mt-0.5">
                  Our team reviews new listings within 24 hours. You will be notified by email.
                </p>
              </div>
              <Link
                href="/owner/listings"
                className="text-xs font-semibold text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] hover:underline whitespace-nowrap"
              >
                View listings
              </Link>
            </div>
          </div>
        )}

        {/* 1. Metrics Cards */}
        <section>
          <OwnerMetricsCards metrics={metrics} loading={ownerLoading} />
        </section>

        {/* 2. Bookings Pipeline */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
              Bookings Pipeline
            </h2>
            {metrics && metrics.pending_requests > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] border border-[var(--color-line-2)]/70 dark:border-[var(--color-warn-500)]/20">
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
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)] mb-4">
            Recent Activity
          </h2>
          <div className="card rounded-xl">
            <ActivityTimeline activities={activity} loading={ownerLoading} />
          </div>
        </section>

        {/* 4. Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)] mb-4">
            Quick Actions
          </h2>
          <QuickActions />
        </section>

        {/* 5. Earnings Chart */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)] mb-4">
            Earnings Overview
          </h2>
          <EarningsChart bookings={bookings} />
        </section>

        {/* Platform fee info */}
        <section className="card-subtle p-6 rounded-2xl space-y-3 text-sm text-[var(--color-ink-3)]">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[var(--color-surface-muted)] text-[var(--color-ink)] dark:text-[var(--color-ink-4)] border border-[var(--color-line)]">
            MigRent ABN: 22 669 566 941
          </div>
          <p>
            <strong className="text-[var(--color-ink-2)]">
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
        <section className="text-xs text-[var(--color-ink-3)] space-y-2 pb-4">
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
