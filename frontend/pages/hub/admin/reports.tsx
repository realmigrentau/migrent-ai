import { useState } from "react";
import { useRouter } from "next/router";
import { ExternalLink, Flag, Siren, UserRound } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import { Button } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Field, Input, Segmented, Select, Textarea } from "../../../components/hub/ui/Field";
import { PageHeader, Tabs } from "../../../components/hub/ui/Layout";
import { Avatar, HomeImage } from "../../../components/hub/ui/Media";
import { Dialog } from "../../../components/hub/ui/Overlay";
import { useToast } from "../../../components/ui/Toast";
import { hubApi, HubError } from "../../../lib/hub/api";
import { relative } from "../../../lib/hub/format";
import { invalidate, useHubQuery } from "../../../lib/hub/query";
import { siteUrl } from "../../../lib/hub/routes";
import { REPORT_REASONS } from "../../../lib/hub/status";
import type { ListingCard, Person } from "../../../lib/hub/types";

type Tab = "open" | "all" | "emergencies";

interface Report {
  id: string;
  reason: string | null;
  details: string | null;
  status: "pending" | "reviewing" | "actioned" | "dismissed";
  priority: "low" | "normal" | "high" | "urgent" | null;
  resolution: string | null;
  action_taken: string | null;
  created_at: string;
  resolved_at: string | null;
  item_type: string;
  item_id: string | null;
  target: (ListingCard & Partial<Person>) | null;
  reporter: Person | null;
  assigned_to: Person | null;
}

interface Emergency {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  listing: ListingCard | null;
  owner: Person | null;
  renter: Person | null;
}

const PRIORITY_TONE = { urgent: "danger", high: "warning", normal: "neutral", low: "neutral" } as const;
const reasonLabel = (r: string | null) => REPORT_REASONS.find((x) => x.value === r)?.label ?? (r ? r.replace(/_/g, " ") : "Report");

function ResolveDialog({ report, onClose, onDone }: { report: Report | null; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [outcome, setOutcome] = useState<"actioned" | "dismissed">("actioned");
  const [resolution, setResolution] = useState("");
  const [action, setAction] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!report) return;
    setBusy(true);
    try {
      await hubApi.post(`/hub/admin/reports/${report.id}`, { status: outcome, resolution: resolution.trim(), action_taken: outcome === "actioned" ? action.trim() || undefined : undefined });
      onDone();
      onClose();
      setResolution("");
      setAction("");
      toast.success(outcome === "actioned" ? "Report resolved" : "Report dismissed");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={!!report}
      onClose={onClose}
      title="Close this report"
      description="What you record here goes into the audit log. The person who reported it isn't told the details."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={!resolution.trim()} onClick={() => void save()}>
            Close report
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Segmented
          label="Outcome"
          value={outcome}
          onChange={setOutcome}
          options={[
            { value: "actioned", label: "Action taken" },
            { value: "dismissed", label: "No action needed" },
          ]}
          className="w-fit"
        />
        {outcome === "actioned" && (
          <Field label="What was done" hint="e.g. Listing hidden, owner warned, account suspended.">
            {({ id, describedBy }) => <Input id={id} value={action} maxLength={200} onChange={(e) => setAction(e.target.value)} aria-describedby={describedBy} />}
          </Field>
        )}
        <Field label="Why" hint="Enough for someone else on the team to understand the decision later.">
          {({ id, describedBy }) => <Textarea id={id} rows={4} value={resolution} maxLength={2000} onChange={(e) => setResolution(e.target.value)} aria-describedby={describedBy} />}
        </Field>
      </div>
    </Dialog>
  );
}

function ReportsList({ status }: { status: "open" | "all" }) {
  const toast = useToast();
  const key = `/hub/admin/reports?status=${status}`;
  const { data, error, loading, refetch } = useHubQuery<{ reports: Report[] }>(key);
  const [closing, setClosing] = useState<Report | null>(null);

  async function triage(r: Report, patch: { priority?: string; assign_to_me?: boolean; status?: string }) {
    try {
      await hubApi.post(`/hub/admin/reports/${r.id}`, patch);
      invalidate("/hub/admin/");
      void refetch();
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    }
  }

  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (loading || !data) return <RowSkeleton rows={4} />;
  if (!data.reports.length) return <EmptyState icon={<Flag className="h-6 w-6" strokeWidth={1.75} />} title={status === "open" ? "No open reports" : "No reports"} body="Reports from the listing page, profiles and conversations land here." />;

  return (
    <>
      <ul className="flex flex-col gap-4">
        {data.reports.map((r) => {
          const open = r.status === "pending" || r.status === "reviewing";
          const listing = r.item_type === "listing" ? r.target : null;
          return (
            <li key={r.id} className="flex flex-col gap-4 rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={PRIORITY_TONE[r.priority ?? "normal"]} icon={false}>
                  {(r.priority ?? "normal").replace(/^\w/, (c) => c.toUpperCase())}
                </StatusBadge>
                <StatusBadge tone={open ? "info" : "neutral"} icon={false}>
                  {r.status === "pending" ? "New" : r.status === "reviewing" ? "Being reviewed" : r.status === "actioned" ? "Action taken" : "Dismissed"}
                </StatusBadge>
                <span className="text-[13px] text-[color:var(--color-ink-3)]">
                  {r.item_type} · reported {relative(r.created_at)}
                  {r.reporter ? ` by ${r.reporter.name}` : ""}
                </span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                {listing ? (
                  <a href={siteUrl(`/listing/${listing.id}`)} target="_blank" rel="noopener noreferrer" className="flex w-full shrink-0 items-center gap-3 rounded-[14px] border border-[var(--color-line)] p-2 hover:bg-[var(--color-surface-hover)] sm:w-[280px]">
                    <HomeImage src={listing.image} alt="" className="h-12 w-16 shrink-0" rounded="rounded-[10px]" sizes="64px" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-[color:var(--color-ink)]">{listing.title}</span>
                      <span className="block truncate text-[12.5px] text-[color:var(--color-ink-3)]">{listing.display_address}</span>
                    </span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
                  </a>
                ) : r.target ? (
                  <div className="flex w-full shrink-0 items-center gap-3 rounded-[14px] border border-[var(--color-line)] p-2 sm:w-[280px]">
                    <Avatar name={r.target.name} src={r.target.avatar_url} size={40} />
                    <span className="truncate text-[13.5px] font-semibold text-[color:var(--color-ink)]">{r.target.name}</span>
                  </div>
                ) : (
                  <div className="flex w-full shrink-0 items-center gap-2 rounded-[14px] border border-dashed border-[var(--color-line-2)] p-3 text-[13px] text-[color:var(--color-ink-3)] sm:w-[280px]">
                    <UserRound className="h-4 w-4" strokeWidth={1.75} aria-hidden /> {r.item_type} {r.item_id?.slice(0, 8)}
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">{reasonLabel(r.reason)}</p>
                  {r.details && <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">{r.details}</p>}
                  {!open && r.resolution && (
                    <p className="mt-2 rounded-[12px] bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] text-[color:var(--color-ink-2)]">
                      {r.action_taken ? <span className="font-semibold text-[color:var(--color-ink)]">{r.action_taken}. </span> : null}
                      {r.resolution}
                    </p>
                  )}
                </div>
              </div>
              {open && (
                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] pt-4">
                  <label className="sr-only" htmlFor={`prio-${r.id}`}>
                    Priority
                  </label>
                  <Select id={`prio-${r.id}`} value={r.priority ?? "normal"} onChange={(e) => void triage(r, { priority: e.target.value })} className="h-9 w-auto text-[13.5px]">
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </Select>
                  {r.assigned_to ? (
                    <span className="text-[13px] text-[color:var(--color-ink-3)]">With {r.assigned_to.name}</span>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => void triage(r, { assign_to_me: true, status: "reviewing" })}>
                      Take this
                    </Button>
                  )}
                  <span className="flex-1" />
                  <Button size="sm" onClick={() => setClosing(r)}>
                    Close report
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <ResolveDialog report={closing} onClose={() => setClosing(null)} onDone={() => void refetch()} />
    </>
  );
}

function Emergencies() {
  const { data, error, loading, refetch } = useHubQuery<{ requests: Emergency[] }>("/hub/admin/emergencies");
  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (loading || !data) return <RowSkeleton rows={3} />;
  if (!data.requests.length) return <EmptyState icon={<Siren className="h-6 w-6" strokeWidth={1.75} />} title="No open emergencies" body="Emergency repair requests appear here until the owner starts work on them." />;
  return (
    <ul className="flex flex-col gap-4">
      {data.requests.map((m) => (
        <li key={m.id} className="flex flex-col gap-3 rounded-[20px] border border-[color:color-mix(in_oklab,var(--color-danger-500)_30%,var(--color-line))] bg-[var(--color-surface)] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="danger">Emergency</StatusBadge>
            <span className="text-[13px] text-[color:var(--color-ink-3)]">
              Reported {relative(m.created_at)} · {m.status === "acknowledged" ? "acknowledged by the owner" : "not acknowledged yet"}
            </span>
          </div>
          <p className="text-[16px] font-semibold text-[color:var(--color-ink)]">{m.title}</p>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">{m.description}</p>
          <p className="text-[13px] text-[color:var(--color-ink-3)]">
            {m.listing?.title} · {m.listing?.display_address} · renter {m.renter?.name ?? "-"} · owner {m.owner?.name ?? "-"}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default function AdminReportsPage() {
  const router = useRouter();
  const tab: Tab = router.query.tab === "all" ? "all" : router.query.tab === "emergencies" ? "emergencies" : "open";
  const setTab = (t: Tab) => void router.replace({ pathname: router.pathname, query: t === "open" ? {} : { tab: t } }, undefined, { shallow: true });
  const overview = useHubQuery<{ open_reports: number; open_emergencies: number }>("/hub/admin/overview");

  return (
    <HubShell title="Reports">
      <PageHeader title="Reports" description="Most urgent first. Take a report to show the team you're on it; closing one needs a reason." />
      <Tabs
        label="Reports"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "open", label: "Open", count: overview.data?.open_reports },
          { value: "emergencies", label: "Emergency repairs", count: overview.data?.open_emergencies },
          { value: "all", label: "All" },
        ]}
        className="mb-6"
      />
      {tab === "emergencies" ? <Emergencies /> : <ReportsList key={tab} status={tab} />}
    </HubShell>
  );
}
