import { useRouter } from "next/router";
import { ChevronRight, KeyRound, Wrench } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import HubLink from "../../../components/hub/HubLink";
import { ButtonLink } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { PageHeader, Tabs } from "../../../components/hub/ui/Layout";
import { Avatar, HomeImage } from "../../../components/hub/ui/Media";
import { aud, day, relative } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import { MAINTENANCE_STATUS, URGENCY } from "../../../lib/hub/status";
import { useHub } from "../../../lib/hub/session";
import type { MaintenanceSummary, TenancySummary } from "../../../lib/hub/types";

type Tab = "current" | "repairs" | "past";

function TenancyRow({ t, owner }: { t: TenancySummary; owner: boolean }) {
  const person = owner ? t.renter : t.owner;
  const next = t.next_payment;
  const today = new Date().toISOString().slice(0, 10);
  const late = next && next.due_date < today;
  return (
    <HubLink to={`/tenancies/${t.id}`} className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-[var(--color-surface-hover)] sm:px-5">
      <HomeImage src={t.listing?.image ?? null} alt="" className="hidden h-14 w-20 shrink-0 sm:block" rounded="rounded-[12px]" sizes="80px" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          {person && <Avatar name={person.name} src={person.avatar_url} size={22} />}
          <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">{person?.name ?? "Tenancy"}</p>
        </div>
        <p className="truncate text-[13.5px] text-[color:var(--color-ink-2)]">
          {t.listing?.unit_label ? `${t.listing.unit_label} · ` : ""}
          {t.listing?.title}
        </p>
        <p className="text-[12.5px] text-[color:var(--color-ink-3)]">
          {day(t.start_date)} - {t.end_date ? day(t.end_date) : "ongoing"} · {aud(t.rent_amount)} a week
        </p>
      </div>
      <div className="hidden flex-col items-end gap-1.5 sm:flex">
        {t.status === "upcoming" && <StatusBadge tone="info">Starting {day(t.start_date, { year: false })}</StatusBadge>}
        {t.status === "ended" && <StatusBadge tone="neutral">Ended</StatusBadge>}
        {t.status === "cancelled" && <StatusBadge tone="neutral">Cancelled</StatusBadge>}
        {t.ending_soon && t.status === "active" && <StatusBadge tone="warning">Lease ends soon</StatusBadge>}
        {t.open_maintenance > 0 && (
          <StatusBadge tone="warning" icon={false}>
            {t.open_maintenance} open repair{t.open_maintenance === 1 ? "" : "s"}
          </StatusBadge>
        )}
        {next && (t.status === "active" || t.status === "upcoming") && (
          <span className={late ? "text-[12.5px] font-semibold text-[color:var(--color-warn-500)]" : "text-[12.5px] text-[color:var(--color-ink-3)]"}>
            {late ? "Rent not recorded since" : "Rent due"} {day(next.due_date, { year: false })}
          </span>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-ink-4)]" strokeWidth={2} aria-hidden />
    </HubLink>
  );
}

function Repairs({ owner }: { owner: boolean }) {
  const { data, error, loading, refetch } = useHubQuery<{ requests: MaintenanceSummary[] }>("/hub/maintenance?status=all");
  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (loading || !data) return <RowSkeleton rows={4} />;
  if (!data.requests.length)
    return <EmptyState icon={<Wrench className="h-6 w-6" strokeWidth={1.75} />} title="No repair requests" body={owner ? "Requests from your renters appear here, most urgent first." : "Requests you make from My home appear here."} />;
  return (
    <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
      {data.requests.map((m) => (
        <li key={m.id} className="border-t border-[var(--color-line)] first:border-0">
          <HubLink to={`/maintenance/${m.id}`} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--color-surface-hover)] sm:px-5">
            <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-surface-muted)] text-[color:var(--color-ink-2)]">
              <Wrench className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[14.5px] font-semibold text-[color:var(--color-ink)]">{m.title}</span>
              <span className="truncate text-[12.5px] text-[color:var(--color-ink-3)]">
                {owner && m.renter ? `${m.renter.name} · ` : ""}
                {m.listing?.unit_label ? `${m.listing.unit_label}, ` : ""}
                {m.listing?.title} · {relative(m.created_at)}
              </span>
            </span>
            {m.urgency !== "routine" && (
              <StatusBadge tone={URGENCY[m.urgency].tone} icon={false}>
                {URGENCY[m.urgency].label}
              </StatusBadge>
            )}
            <span className="hidden sm:block">
              <StatusBadge tone={MAINTENANCE_STATUS[m.status].tone} icon={false}>
                {MAINTENANCE_STATUS[m.status].label}
              </StatusBadge>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-ink-4)]" strokeWidth={2} aria-hidden />
          </HubLink>
        </li>
      ))}
    </ul>
  );
}

export default function TenanciesPage() {
  const router = useRouter();
  const { role } = useHub();
  const owner = role === "owner";
  const tab: Tab = router.query.tab === "repairs" ? "repairs" : router.query.tab === "past" ? "past" : "current";
  const setTab = (t: Tab) => void router.replace({ pathname: router.pathname, query: t === "current" ? {} : { tab: t } }, undefined, { shallow: true });
  const q = useHubQuery<{ tenancies: TenancySummary[] }>(tab === "repairs" ? null : `/hub/tenancies${tab === "past" ? "?scope=all" : ""}`);
  const counts = useHubQuery<{ maintenance: number }>("/hub/counts");
  const list = (q.data?.tenancies ?? []).filter((t) => (tab === "past" ? t.status === "ended" || t.status === "cancelled" : true));

  return (
    <HubShell title="Tenancies">
      <PageHeader title="Tenancies" description={owner ? "Who lives where, what rent you've recorded, and repairs." : "Homes you rent through Migrent."} />
      <Tabs
        label="Tenancies"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "current", label: "Current" },
          { value: "repairs", label: "Repairs", count: counts.data?.maintenance || undefined },
          { value: "past", label: "Past" },
        ]}
        className="mb-6"
      />
      {tab === "repairs" ? (
        <Repairs owner={owner} />
      ) : q.error ? (
        <ErrorState message={q.error.message} offline={q.error.offline} onRetry={() => void q.refetch()} />
      ) : !q.data ? (
        <RowSkeleton rows={3} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<KeyRound className="h-6 w-6" strokeWidth={1.75} />}
          title={tab === "past" ? "No past tenancies" : "No tenancies yet"}
          body={tab === "past" ? "Ended tenancies stay here with their rent record." : owner ? "When Migrent finalises an application you approved, the tenancy appears here with its rent dates." : "When an application is finalised, your home appears here."}
          action={tab === "current" && owner ? <ButtonLink to="/applications">Review applications</ButtonLink> : undefined}
        />
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
          {list.map((t) => (
            <li key={t.id} className="border-t border-[var(--color-line)] first:border-0">
              <TenancyRow t={t} owner={owner} />
            </li>
          ))}
        </ul>
      )}
    </HubShell>
  );
}
