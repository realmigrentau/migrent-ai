import { BadgeCheck } from "lucide-react";
import AdminPanelShell from "../../../components/hub/admin/AdminPanel";
import IdVerifiedBadge from "../../../components/hub/IdVerifiedBadge";
import { EmptyState, ErrorState, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { PageHeader } from "../../../components/hub/ui/Layout";
import { relative } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import type { Person } from "../../../lib/hub/types";

type Check = {
  user_id: string;
  person: Person | null;
  status: string;
  payment_status: string;
  failed_checks: number;
  checks_started: number;
  last_error: string | null;
  verified_name: string | null;
  document_type: string | null;
  document_country: string | null;
  stripe_session: string | null;
  paid_at: string | null;
  checked_at: string | null;
  refunded_at: string | null;
};

const STATUS: Record<string, { label: string; tone: "success" | "warning" | "neutral" | "danger" | "info" }> = {
  not_started: { label: "Not started", tone: "neutral" },
  pending: { label: "Stripe is checking", tone: "info" },
  retry: { label: "Failed, retrying", tone: "warning" },
  rejected: { label: "Failed 3 times", tone: "danger" },
  expired: { label: "Expired", tone: "neutral" },
};

/**
 * Admin > Renter IDs: every paid renter ID check (backend renter_id.py).
 * The name on the ID is here so Migrent can help if something goes wrong;
 * the document and selfie stay with Stripe (open the session in the Stripe
 * dashboard under Identity).
 */
function RenterIdsContent() {
  const { data, error, loading, refetch } = useHubQuery<{ checks: Check[] }>("/hub/admin/id-checks");
  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (loading || !data) return <RowSkeleton rows={4} />;
  return (
    <>
      <PageHeader title="Renter IDs" description="Renters who paid AUD 19 for the ID and selfie check. Documents and selfies stay with Stripe: search the Stripe session in Stripe > Identity." />
      {data.checks.length === 0 ? (
        <EmptyState icon={<BadgeCheck className="h-6 w-6" strokeWidth={1.75} />} title="No renter ID checks yet" body="They appear here when a renter pays for one." />
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]" data-testid="admin-renter-ids">
          {data.checks.map((c) => (
            <li key={c.user_id} className="flex flex-wrap items-center gap-3 border-t border-[var(--color-line)] px-4 py-3.5 first:border-0 sm:px-5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-[color:var(--color-ink)]">
                  {c.person?.name ?? "Renter"}
                  {c.verified_name && <span className="font-normal text-[color:var(--color-ink-3)]"> · name on ID: {c.verified_name}</span>}
                </span>
                <span className="block text-[13px] text-[color:var(--color-ink-3)]">
                  {[c.document_type?.replace("_", " "), c.document_country, `${c.failed_checks} failed`, c.stripe_session, relative(c.checked_at ?? c.paid_at ?? new Date().toISOString())].filter(Boolean).join(" · ")}
                </span>
              </span>
              {c.status === "verified" ? (
                <IdVerifiedBadge />
              ) : (
                <StatusBadge tone={STATUS[c.status]?.tone ?? "neutral"} icon={false}>
                  {STATUS[c.status]?.label ?? c.status}
                </StatusBadge>
              )}
              <StatusBadge tone={c.payment_status === "paid" ? "success" : "neutral"} icon={false}>
                {c.payment_status === "paid" ? "Paid" : c.payment_status === "refunded" ? "Refunded" : "Not paid"}
              </StatusBadge>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function AdminRenterIdsPage() {
  return (
    <AdminPanelShell title="Renter IDs">
      <RenterIdsContent />
    </AdminPanelShell>
  );
}
