import { useState } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import HubLink from "../../../components/hub/HubLink";
import { EmptyState, ErrorState, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { PageHeader } from "../../../components/hub/ui/Layout";
import { Avatar, HomeImage } from "../../../components/hub/ui/Media";
import { day, relative } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import type { ApplicationSummary } from "../../../lib/hub/types";

/** Owner-approved applications waiting for Migrent's final review, oldest first. */
export default function AdminReviewsPage() {
  const { data, error, loading, refetch } = useHubQuery<{ applications: ApplicationSummary[] }>("/hub/admin/applications");
  const [now] = useState(() => Date.now());

  return (
    <HubShell title="Final reviews">
      <PageHeader title="Final reviews" description="The owner has chosen these renters. Check the application, then finalise it, ask the renter for corrections, or stop it. Every decision is recorded in the audit log." />
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <RowSkeleton rows={4} />
      ) : data.applications.length === 0 ? (
        <EmptyState icon={<ShieldCheck className="h-6 w-6" strokeWidth={1.75} />} title="Nothing waiting" body="Applications appear here as soon as an owner approves one." />
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
          {data.applications.map((a) => {
            const waitedDays = a.owner_approved_at ? Math.floor((now - Date.parse(a.owner_approved_at)) / 86_400_000) : 0;
            return (
              <li key={a.id} className="border-t border-[var(--color-line)] first:border-0">
                <HubLink to={`/applications/${a.id}`} className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-[var(--color-surface-hover)] sm:px-5">
                  <HomeImage src={a.listing?.image ?? null} alt="" className="hidden h-14 w-20 shrink-0 sm:block" rounded="rounded-[12px]" sizes="80px" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Avatar name={a.person?.name} src={a.person?.avatar_url} size={22} />
                      <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">{a.person?.name ?? "Renter"}</p>
                    </div>
                    <p className="truncate text-[13.5px] text-[color:var(--color-ink-2)]">
                      {a.listing?.unit_label ? `${a.listing.unit_label}, ` : ""}
                      {a.listing?.title} · owner {a.owner?.name ?? "-"}
                    </p>
                    <p className="text-[12.5px] text-[color:var(--color-ink-3)]">
                      Approved by the owner {a.owner_approved_at ? relative(a.owner_approved_at) : ""}
                      {a.move_in_date ? ` · wants to move in ${day(a.move_in_date)}` : ""}
                    </p>
                  </div>
                  {waitedDays >= 2 && (
                    <span className="hidden sm:block">
                      <StatusBadge tone="warning">Waiting {waitedDays} days</StatusBadge>
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-ink-4)]" strokeWidth={2} aria-hidden />
                </HubLink>
              </li>
            );
          })}
        </ul>
      )}
    </HubShell>
  );
}
