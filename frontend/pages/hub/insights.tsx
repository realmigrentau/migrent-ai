import { useState } from "react";
import { BarChart3 } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import { FUNNEL_STEPS, FunnelRows } from "../../components/hub/owner/FunnelTable";
import { ButtonLink } from "../../components/hub/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "../../components/hub/ui/Feedback";
import { Segmented } from "../../components/hub/ui/Field";
import { PageHeader, Panel, Section } from "../../components/hub/ui/Layout";
import { aud, day } from "../../lib/hub/format";
import { useHubQuery } from "../../lib/hub/query";
import type { ListingCard } from "../../lib/hub/types";

interface Insights {
  days: number;
  tracking_since: string | null;
  funnel: Record<string, number>;
  listings: ({ listing: ListingCard } & Record<string, number>)[];
  occupancy: { occupied: number; units: number };
  median_days_vacant: number | null;
  median_reply_hours: number | null;
  rent_recorded: number | null;
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Panel className="flex flex-col gap-1">
      <p className="text-[13px] text-[color:var(--color-ink-3)]">{label}</p>
      <p className="text-[26px] font-semibold tabular-nums tracking-[-0.02em] text-[color:var(--color-ink)]">{value}</p>
      {note && <p className="text-[12.5px] leading-snug text-[color:var(--color-ink-3)]">{note}</p>}
    </Panel>
  );
}

export default function InsightsPage() {
  const [days, setDays] = useState<"7" | "30" | "90">("30");
  const { data, error, loading, refetch } = useHubQuery<Insights>(`/hub/insights?days=${days}`);

  const funnel = data?.funnel ?? {};
  const max = Math.max(1, ...FUNNEL_STEPS.map((s) => funnel[s.key] ?? 0));
  const views = funnel.view ?? 0;

  return (
    <HubShell title="Insights">
      <PageHeader
        title="Insights"
        description="What's happening with your listings, from real activity on Migrent. Nothing here is estimated."
        actions={
          <Segmented
            label="Period"
            value={days}
            onChange={setDays}
            options={[
              { value: "7", label: "7 days" },
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
            ]}
          />
        }
      />
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <div className="flex flex-col gap-6" aria-busy="true">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-[22px]" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-[22px]" />
        </div>
      ) : data.listings.length === 0 ? (
        <EmptyState icon={<BarChart3 className="h-6 w-6" strokeWidth={1.75} />} title="Nothing to show yet" body="Once you have a listing on Migrent, you'll see how many people view it, save it, enquire and apply." action={<ButtonLink to="/properties/new">List a property</ButtonLink>} />
      ) : (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="Occupied" value={`${data.occupancy.occupied} of ${data.occupancy.units}`} note="Listings marked as lived in." />
            <Kpi label="Days vacant (median)" value={data.median_days_vacant != null ? String(data.median_days_vacant) : "-"} note={data.median_days_vacant != null ? "Across live listings, since their available date." : "No live, vacant listings."} />
            <Kpi label="Reply time (median)" value={data.median_reply_hours != null ? `${data.median_reply_hours} h` : "-"} note={data.median_reply_hours != null ? "How quickly you reply to new enquiries." : "Not enough replies yet to measure."} />
            <Kpi label={`Rent recorded, ${days} days`} value={data.rent_recorded != null ? aud(data.rent_recorded) : "-"} note={data.rent_recorded != null ? "What you've marked as received." : "No rent recorded in this period."} />
          </div>

          <Section title="From view to application" description={data.tracking_since ? `Counted since ${day(data.tracking_since)}. Your own visits aren't counted.` : "Nothing recorded in this period yet."}>
            <Panel className="flex flex-col gap-4">
              {FUNNEL_STEPS.map((s, i) => {
                const n = funnel[s.key] ?? 0;
                const prev = i > 0 ? funnel[FUNNEL_STEPS[i - 1].key] ?? 0 : null;
                return (
                  <div key={s.key} className="grid grid-cols-[140px_minmax(0,1fr)_64px] items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)_80px]">
                    <span className="text-[14px] text-[color:var(--color-ink-2)]">{s.label}</span>
                    <span className="h-3 overflow-hidden rounded-full bg-[var(--color-surface-muted)]" aria-hidden>
                      <span className="block h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-500" style={{ width: `${(n / max) * 100}%` }} />
                    </span>
                    <span className="text-right text-[15px] font-semibold tabular-nums text-[color:var(--color-ink)]">
                      {n}
                      {prev ? <span className="block text-[11.5px] font-medium text-[color:var(--color-ink-4)]">{Math.round((n / prev) * 100)}%</span> : null}
                    </span>
                  </div>
                );
              })}
              {views > 0 && <p className="text-[13px] text-[color:var(--color-ink-3)]">{funnel.unique_views ?? 0} different people viewed your listings. Percentages compare each step with the one before.</p>}
            </Panel>
          </Section>

          <Section title="By listing">
            <FunnelRows rows={data.listings.map((r) => ({ listing: r.listing, values: r }))} />
          </Section>
        </div>
      )}
    </HubShell>
  );
}
