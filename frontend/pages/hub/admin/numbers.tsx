import AdminPanelShell from "../../../components/hub/admin/AdminPanel";
import { ErrorState, RowSkeleton } from "../../../components/hub/ui/Feedback";
import { PageHeader, Section } from "../../../components/hub/ui/Layout";
import { relative } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";

interface Metrics {
  generated_at: string;
  people: { accounts: number; renters: number; owners: number; joined_7_days: number; joined_30_days: number; id_checked_owners: number };
  homes: { live: number; in_review: number; paused: number; drafts: number; listed_30_days: number; median_review_hours: number | null };
  activity: { messages_7_days: number; applications_30_days: number; inspections_booked_30_days: number; stay_requests_30_days: number; active_tenancies: number };
  safety: { open_reports: number; reports_30_days: number; scam_flags_30_days: number; suspended_accounts: number; open_tickets: number; median_first_reply_hours: number | null };
}

function hours(h: number | null): string {
  if (h == null) return "No data yet";
  if (h < 1) return "Under an hour";
  if (h < 48) return `${Math.round(h)} hour${Math.round(h) === 1 ? "" : "s"}`;
  return `${Math.round(h / 24)} days`;
}

function Tiles({ items }: { items: { label: string; value: number | string; hint?: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((i) => (
        <div key={i.label} className="flex flex-col gap-1 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
          <dt className="text-[12.5px] font-medium leading-snug text-[color:var(--color-ink-3)]">{i.label}</dt>
          <dd className="m-0 text-[24px] font-semibold tracking-[-0.02em] text-[color:var(--color-ink)] tabular-nums">{i.value}</dd>
          {i.hint && <p className="text-[12px] text-[color:var(--color-ink-3)]">{i.hint}</p>}
        </div>
      ))}
    </dl>
  );
}

/**
 * Admin > Numbers (MIGRENT_MASTER_AUDIT MIG-024): plain counts from the
 * database at the moment the page opens (GET /hub/admin/metrics). No
 * estimates, no padding, no charts of numbers too small to chart yet.
 */
function NumbersContent() {
  const { data, error, loading, refetch } = useHubQuery<Metrics>("/hub/admin/metrics");
  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (loading || !data) return <RowSkeleton rows={4} />;
  const { people, homes, activity, safety } = data;

  return (
    <>
      <PageHeader title="Numbers" description={`Counted from the database ${relative(data.generated_at)}. Nothing here is estimated.`} />
      <div className="flex flex-col gap-10" data-testid="admin-numbers">
        <Section title="People">
          <Tiles
            items={[
              { label: "Accounts", value: people.accounts },
              { label: "Renters", value: people.renters },
              { label: "Owners", value: people.owners },
              { label: "Joined in 7 days", value: people.joined_7_days },
              { label: "Joined in 30 days", value: people.joined_30_days },
              { label: "Owners with ID checked", value: people.id_checked_owners },
            ]}
          />
        </Section>
        <Section title="Homes">
          <Tiles
            items={[
              { label: "Live", value: homes.live },
              { label: "Waiting for review", value: homes.in_review },
              { label: "Paused", value: homes.paused },
              { label: "Drafts", value: homes.drafts },
              { label: "Listed in 30 days", value: homes.listed_30_days },
              { label: "Typical time to review", value: hours(homes.median_review_hours), hint: "Median, decisions in 30 days" },
            ]}
          />
        </Section>
        <Section title="Activity">
          <Tiles
            items={[
              { label: "Messages in 7 days", value: activity.messages_7_days },
              { label: "Applications in 30 days", value: activity.applications_30_days },
              { label: "Inspections booked in 30 days", value: activity.inspections_booked_30_days },
              { label: "Stay requests in 30 days", value: activity.stay_requests_30_days },
              { label: "Active tenancies", value: activity.active_tenancies },
            ]}
          />
        </Section>
        <Section title="Safety and support">
          <Tiles
            items={[
              { label: "Open reports", value: safety.open_reports },
              { label: "Reports in 30 days", value: safety.reports_30_days },
              { label: "Scam flags in 30 days", value: safety.scam_flags_30_days, hint: "Raised by the message check" },
              { label: "Suspended accounts", value: safety.suspended_accounts },
              { label: "Support waiting", value: safety.open_tickets },
              { label: "Typical first reply", value: hours(safety.median_first_reply_hours), hint: "Median, tickets in 30 days" },
            ]}
          />
        </Section>
      </div>
    </>
  );
}

export default function AdminNumbersPage() {
  return (
    <AdminPanelShell title="Numbers">
      <NumbersContent />
    </AdminPanelShell>
  );
}
