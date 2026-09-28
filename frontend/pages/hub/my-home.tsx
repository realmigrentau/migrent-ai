import { KeyRound } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import TenancyView from "../../components/hub/tenancy/TenancyView";
import { ButtonLink } from "../../components/hub/ui/Button";
import { CardSkeleton, EmptyState, ErrorState, StatusBadge } from "../../components/hub/ui/Feedback";
import { PageHeader } from "../../components/hub/ui/Layout";
import { HomeImage } from "../../components/hub/ui/Media";
import HubLink from "../../components/hub/HubLink";
import { aud, day } from "../../lib/hub/format";
import { useHubQuery } from "../../lib/hub/query";
import type { TenancyDetail, TenancySummary } from "../../lib/hub/types";

function Single({ id }: { id: string }) {
  const { data, error, refetch } = useHubQuery<TenancyDetail>(`/hub/tenancies/${id}`);
  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (!data) return <CardSkeleton />;
  return <TenancyView d={data} refetch={() => void refetch()} />;
}

/** Where a renter lives now: the lease, the rent record and repairs. */
export default function MyHomePage() {
  const { data, error, loading, refetch } = useHubQuery<{ tenancies: TenancySummary[] }>("/hub/tenancies");
  const list = data?.tenancies ?? [];

  return (
    <HubShell title="My home">
      <PageHeader title="My home" description={list.length === 1 ? undefined : "Your lease, rent record and repairs, in one place."} />
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <CardSkeleton />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<KeyRound className="h-6 w-6" strokeWidth={1.75} />}
          title="No home here yet"
          body="When Migrent finalises one of your applications, the lease, rent record and repair requests for that home appear here."
          action={<ButtonLink to="/applications">Your applications</ButtonLink>}
          secondary={<ButtonLink to="/discover" variant="ghost">Find a home</ButtonLink>}
        />
      ) : list.length === 1 ? (
        <Single id={list[0].id} />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {list.map((t) => (
            <li key={t.id}>
              <HubLink to={`/tenancies/${t.id}`} className="hub-lift flex flex-col overflow-hidden rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)]">
                <HomeImage src={t.listing?.image ?? null} alt="" className="aspect-[16/9] w-full" rounded="rounded-none" />
                <div className="flex flex-col gap-1.5 p-5">
                  <StatusBadge tone={t.status === "active" ? "success" : "info"} className="w-fit">
                    {t.status === "active" ? "Current" : "Starting soon"}
                  </StatusBadge>
                  <p className="text-[16px] font-semibold text-[color:var(--color-ink)]">{t.listing?.title}</p>
                  <p className="text-[13.5px] text-[color:var(--color-ink-3)]">
                    From {day(t.start_date)} · {aud(t.rent_amount)} a week
                  </p>
                </div>
              </HubLink>
            </li>
          ))}
        </ul>
      )}
    </HubShell>
  );
}
