import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Ban, ExternalLink, Flag, MessagesSquare, Pause, Siren, UserRound } from "lucide-react";
import HubLink from "../../../components/hub/HubLink";
import ReasonPicker from "../../../components/hub/admin/ReasonPicker";
import SuspendDialog, { type SuspendTarget } from "../../../components/hub/admin/SuspendDialog";
import AdminPanelShell from "../../../components/hub/admin/AdminPanel";
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
  /** Listing or person; for a message or review, what was said and between whom. */
  target: (ListingCard & Partial<Person> & { text?: string; from?: Person | null; to?: Person | null; rating?: number; about?: string; hidden?: boolean }) | null;
  reporter: Person | null;
  /** "system" when the scam check raised it rather than a person. */
  source?: "user" | "system";
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

/** Pause a reported listing without leaving the report (MIG-024). */
function PauseListingDialog({ listing, onClose, onDone }: { listing: { id: string; title: string } | null; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!listing) return;
    setBusy(true);
    try {
      await hubApi.post(`/hub/admin/listings/${listing.id}/action`, { action: "pause", reason: reason.trim() });
      toast.success("Listing paused", { description: "The owner is told why. Close the report when you have finished." });
      setReason("");
      onDone();
      onClose();
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={!!listing}
      onClose={onClose}
      title={listing ? `Pause ${listing.title}?` : ""}
      description="It goes offline at once. The owner is emailed the reason and cannot bring it back themselves; you unpause it from Listings."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={busy} disabled={reason.trim().length < 5} onClick={() => void save()}>
            Pause listing
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ReasonPicker kind="listing_pause" onPick={setReason} />
        <Field label="Reason (sent to the owner)">
          {({ id, describedBy }) => <Textarea id={id} rows={3} value={reason} maxLength={1000} onChange={(e) => setReason(e.target.value)} aria-describedby={describedBy} />}
        </Field>
      </div>
    </Dialog>
  );
}

interface Thread {
  reported_message_id: string;
  people: Record<string, Person | null>;
  messages: { id: string; from: string; text: string; attachment_name: string | null; created_at: string }[];
}

/** The messages around a reported one. Opening it is audited (view_conversation). */
function ConversationDialog({ reportId, onClose }: { reportId: string | null; onClose: () => void }) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;
    let alive = true;
    hubApi
      .get<Thread>(`/hub/admin/reports/${reportId}/conversation`)
      .then((t) => alive && setThread(t))
      .catch((e) => alive && setError(e instanceof HubError ? e.message : "The conversation didn't load."));
    return () => {
      alive = false;
      setThread(null);
      setError(null);
    };
  }, [reportId]);

  return (
    <Dialog open={!!reportId} onClose={onClose} size="lg" title="The conversation" description="Reading it is recorded in the audit log. Only the two people in it and Migrent's admins can see it.">
      {error ? (
        <p role="alert" className="text-[14px] text-[color:var(--color-danger-500)]">
          {error}
        </p>
      ) : !thread ? (
        <RowSkeleton rows={3} />
      ) : (
        <ol className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto" data-testid="reported-conversation">
          {thread.messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-[14px] border px-3.5 py-2.5 text-[14px] ${m.id === thread.reported_message_id ? "border-[var(--color-danger-500)] bg-[color:color-mix(in_oklab,var(--color-danger-500)_8%,var(--color-surface))]" : "border-[var(--color-line)] bg-[var(--color-surface)]"}`}
            >
              <p className="text-[12.5px] font-semibold text-[color:var(--color-ink-3)]">
                {thread.people[m.from]?.name ?? "Someone"} · {relative(m.created_at)}
                {m.id === thread.reported_message_id ? " · reported" : ""}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-[color:var(--color-ink)]">{m.text || m.attachment_name || "(attachment)"}</p>
            </li>
          ))}
        </ol>
      )}
    </Dialog>
  );
}

function ReportsList({ status }: { status: "open" | "all" }) {
  const toast = useToast();
  const key = `/hub/admin/reports?status=${status}`;
  const { data, error, loading, refetch } = useHubQuery<{ reports: Report[] }>(key);
  const [closing, setClosing] = useState<Report | null>(null);
  const [pausing, setPausing] = useState<{ id: string; title: string } | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<SuspendTarget | null>(null);
  const [readingFor, setReadingFor] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<{ id: string; hide: boolean } | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  async function saveReview() {
    if (!reviewAction) return;
    if (reviewReason.trim().length < 5) return toast.warning("Say why, in a few words.");
    setSavingReview(true);
    try {
      await hubApi.post(`/hub/admin/user-reviews/${reviewAction.id}`, { hidden: reviewAction.hide, reason: reviewReason.trim() });
      toast.success(reviewAction.hide ? "Review hidden" : "Review is back up");
      setReviewAction(null);
      setReviewReason("");
      void refetch();
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setSavingReview(false);
    }
  }

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
                  {r.source === "system" ? " by the scam check" : r.reporter ? ` by ${r.reporter.name}` : ""}
                </span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                {(r.item_type === "message" || r.item_type === "review") && r.target?.text !== undefined ? (
                  <div className="flex w-full shrink-0 flex-col gap-2 rounded-[14px] border border-[var(--color-line)] p-3 sm:w-[320px]" data-testid="reported-text">
                    <p className="text-[12.5px] text-[color:var(--color-ink-3)]">
                      {r.item_type === "review" ? `Review of ${r.target.about}` : "Message"}
                      {r.target.from ? ` from ${r.target.from.name}` : ""}
                      {r.target.to ? ` to ${r.target.to.name}` : ""}
                      {r.item_type === "review" && r.target.rating ? ` · ${r.target.rating}/5` : ""}
                    </p>
                    <blockquote className="whitespace-pre-wrap border-l-2 border-[var(--color-line-2)] pl-3 text-[13.5px] leading-relaxed text-[color:var(--color-ink)]">{r.target.text || "(no text)"}</blockquote>
                    {r.item_type === "review" && r.item_id && (
                      <div className="flex items-center gap-2">
                        {r.target.hidden && <StatusBadge tone="neutral" icon={false}>Hidden</StatusBadge>}
                        <Button size="sm" variant="secondary" onClick={() => setReviewAction({ id: r.item_id!, hide: !r.target!.hidden })}>
                          {r.target.hidden ? "Put the review back" : "Hide the review"}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : listing ? (
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
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Act on this report" data-testid="report-actions">
                  {listing && (
                    <>
                      <Button size="sm" variant="secondary" icon={<Pause className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setPausing({ id: listing.id, title: listing.title || "this listing" })}>
                        Pause the listing
                      </Button>
                      <HubLink to={`/admin/listings?queue=all&listing=${listing.id}`} className="text-[13.5px] font-semibold text-[color:var(--color-primary)] hover:underline">
                        Review it in Listings
                      </HubLink>
                    </>
                  )}
                  {(r.item_type === "user" || r.item_type === "profile") && r.item_id && (
                    <>
                      <HubLink to={`/admin/people/${r.item_id}`} className="text-[13.5px] font-semibold text-[color:var(--color-primary)] hover:underline">
                        Open their page
                      </HubLink>
                      {r.target?.name && (
                        <Button size="sm" variant="secondary" icon={<Ban className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setSuspendTarget({ id: r.item_id!, name: r.target!.name!, suspended: false })}>
                          Suspend
                        </Button>
                      )}
                    </>
                  )}
                  {r.item_type === "message" && (
                    <Button size="sm" variant="secondary" icon={<MessagesSquare className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setReadingFor(r.id)}>
                      Read the conversation
                    </Button>
                  )}
                  {(r.item_type === "message" || r.item_type === "review") && r.target?.from && (
                    <>
                      <HubLink to={`/admin/people/${r.target.from.id}`} className="text-[13.5px] font-semibold text-[color:var(--color-primary)] hover:underline">
                        Open {r.target.from.name}&apos;s page
                      </HubLink>
                      <Button size="sm" variant="secondary" icon={<Ban className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setSuspendTarget({ id: r.target!.from!.id, name: r.target!.from!.name, suspended: false })}>
                        Suspend {r.target.from.name}
                      </Button>
                    </>
                  )}
                </div>
              )}
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
      <Dialog
        open={Boolean(reviewAction)}
        onClose={() => setReviewAction(null)}
        title={reviewAction?.hide ? "Hide this review?" : "Put this review back?"}
        description={reviewAction?.hide ? "Hide reviews that are abusive, share private details or are not about the tenancy or stay. Disagreeing with a review is not a reason." : "It will show again on the listing."}
        footer={
          <>
            <Button variant="ghost" onClick={() => setReviewAction(null)}>
              Cancel
            </Button>
            <Button loading={savingReview} onClick={() => void saveReview()}>
              {reviewAction?.hide ? "Hide the review" : "Put it back"}
            </Button>
          </>
        }
      >
        <Field label="Why" hint="Recorded in the audit log.">
          {({ id, describedBy }) => <Textarea id={id} rows={3} value={reviewReason} maxLength={1000} onChange={(e) => setReviewReason(e.target.value)} aria-describedby={describedBy} />}
        </Field>
      </Dialog>
      <ResolveDialog report={closing} onClose={() => setClosing(null)} onDone={() => void refetch()} />
      <PauseListingDialog listing={pausing} onClose={() => setPausing(null)} onDone={() => void refetch()} />
      <SuspendDialog account={suspendTarget} onClose={() => setSuspendTarget(null)} onDone={() => void refetch()} />
      <ConversationDialog reportId={readingFor} onClose={() => setReadingFor(null)} />
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

function AdminReportsContent() {
  const router = useRouter();
  const tab: Tab = router.query.tab === "all" ? "all" : router.query.tab === "emergencies" ? "emergencies" : "open";
  const setTab = (t: Tab) => void router.replace({ pathname: router.pathname, query: t === "open" ? {} : { tab: t } }, undefined, { shallow: true });
  const overview = useHubQuery<{ open_reports: number; open_emergencies: number }>("/hub/admin/overview");

  return (
    <>
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
    </>
  );
}

/** Inside the Admin panel: nothing here loads until the admin password is entered. */
export default function AdminReportsPage() {
  return (
    <AdminPanelShell title="Reports">
      <AdminReportsContent />
    </AdminPanelShell>
  );
}
