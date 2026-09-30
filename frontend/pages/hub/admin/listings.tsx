import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AlertTriangle, ChevronRight, ExternalLink, ListChecks, Mail, Search } from "lucide-react";
import AdminPanelShell from "../../../components/hub/admin/AdminPanel";
import { Button } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Checkbox, Field, Segmented, Textarea } from "../../../components/hub/ui/Field";
import { PageHeader, Tabs } from "../../../components/hub/ui/Layout";
import { Avatar, HomeImage } from "../../../components/hub/ui/Media";
import { Sheet } from "../../../components/hub/ui/Overlay";
import { useToast } from "../../../components/ui/Toast";
import { ID_CHECK, LISTING_ACTIONS, LISTING_QUEUES, PAUSE_FIXES, listingState, moderationEvent, type ListingAction, type ListingQueue } from "../../../lib/hub/admin";
import { hubApi, HubError } from "../../../lib/hub/api";
import { day, dateTime, placeTypeLabel, propertyTypeLabel, relative, viewerZone, weekly } from "../../../lib/hub/format";
import { invalidate, setQueryData, useHubQuery } from "../../../lib/hub/query";
import { siteUrl } from "../../../lib/hub/routes";
import type { ListingCard, Person } from "../../../lib/hub/types";

interface ModerationItem extends ListingCard {
  moderation_status: string;
  moderation_reason: string | null;
  moderation_notes: string | null;
  spam_score: number | null;
  spam_reasons: string[];
  flagged_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  street_address?: string | null;
  owner: Person & { email: string | null; id_check: "verified" | "pending" | "unverified" };
  actions: ListingAction[];
}

interface HistoryEvent {
  id: string;
  event_type: string;
  old_status: string | null;
  new_status: string | null;
  spam_score: number | null;
  notes: string | null;
  created_at: string;
  actor: Person | null;
  actor_type: string;
}

interface ModerationDetail extends ModerationItem {
  description: string | null;
  history: HistoryEvent[];
}

type Counts = Partial<Record<Exclude<ListingQueue, "all">, number>>;

const QUEUE_EMPTY: Record<ListingQueue, { title: string; body: string }> = {
  review: { title: "Nothing to review", body: "New listings appear here once the owner's ID is checked and they send the listing for review." },
  flagged: { title: "Nothing flagged", body: "Listings the spam check is unsure about wait here for a person to decide." },
  hidden: { title: "Nothing hidden", body: "Listings taken offline while someone looks into them appear here." },
  removal: { title: "No removals waiting", body: "A removal started from any queue has to be confirmed here before it happens." },
  paused: { title: "Nothing paused", body: "Listings paused until the owner fixes something appear here." },
  all: { title: "No listings match", body: "Try part of the title, the suburb, or the owner's name or email." },
};

/** The line under each row: why it is in this queue and for how long. */
function queueLine(l: ModerationItem): string {
  switch (l.moderation_status) {
    case "pending_approval":
      return `Sent for review ${relative(l.created_at)}`;
    case "flagged":
      return `Flagged ${relative(l.flagged_at ?? l.updated_at)}`;
    case "delete_requested":
      return `Removal started ${relative(l.updated_at)}${l.moderation_reason ? `: ${l.moderation_reason}` : ""}`;
    case "paused":
    case "hidden":
      return `${listingState(l.moderation_status).label} ${relative(l.updated_at)}${l.moderation_reason ? `: ${l.moderation_reason}` : ""}`;
    default:
      return `Updated ${relative(l.updated_at)}`;
  }
}

/** The form for one decision, shown inside the drawer. */
function DecisionPanel({ listing, action, onCancel, onDone }: { listing: ModerationDetail; action: ListingAction; onCancel: () => void; onDone: (l: ModerationDetail) => void }) {
  const toast = useToast();
  const copy = LISTING_ACTIONS[action];
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [fixes, setFixes] = useState<string[]>([]);
  const [mode, setMode] = useState<"review" | "restore">("review");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), []);

  const ready = !copy.reason || reason.trim().length >= 5;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const out = await hubApi.post<{ listing: ModerationDetail }>(`/hub/admin/listings/${listing.id}/action`, {
        action,
        reason: copy.reason ? reason.trim() : undefined,
        note: note.trim() || undefined,
        required_actions: action === "pause" ? fixes : undefined,
        mode: action === "unpause" ? mode : undefined,
      });
      toast.success(copy.done);
      onDone(out.listing);
    } catch (e) {
      setError(e instanceof HubError ? e.message : "That didn't save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={ref} role="group" aria-label={copy.title} className="flex flex-col gap-4 rounded-[18px] border border-[var(--color-line-2)] bg-[var(--color-surface-muted)] p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-semibold text-[color:var(--color-ink)]">{copy.title}</h3>
        <p className="text-[13.5px] leading-relaxed text-[color:var(--color-ink-2)]">{copy.explain}</p>
      </div>
      {action === "confirm_removal" && listing.moderation_reason && (
        <p className="rounded-[12px] bg-[var(--color-surface)] px-3 py-2 text-[13.5px] text-[color:var(--color-ink-2)]">
          <span className="font-semibold text-[color:var(--color-ink)]">Reason the owner will see: </span>
          {listing.moderation_reason}
        </p>
      )}
      {action === "unpause" && (
        <Segmented
          label="Where it goes"
          value={mode}
          onChange={setMode}
          options={[
            { value: "review", label: "Back to review" },
            { value: "restore", label: "Straight back live" },
          ]}
          className="w-fit"
        />
      )}
      {copy.reason && (
        <Field label={copy.reason.label} hint={copy.reason.hint}>
          {({ id, describedBy }) => <Textarea id={id} rows={3} value={reason} maxLength={1000} onChange={(e) => setReason(e.target.value)} aria-describedby={describedBy} autoFocus />}
        </Field>
      )}
      {action === "pause" && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-[13.5px] font-semibold text-[color:var(--color-ink)]">What must change before it comes back</legend>
          {PAUSE_FIXES.map((f) => (
            <Checkbox key={f} label={f} checked={fixes.includes(f)} onChange={(on) => setFixes((prev) => (on ? [...prev, f] : prev.filter((x) => x !== f)))} />
          ))}
        </fieldset>
      )}
      {copy.note && (
        <Field label="Note for the team" optional hint="Stored with the decision in the audit log. The owner doesn't see it.">
          {({ id, describedBy }) => <Textarea id={id} rows={2} className="min-h-[72px]" value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} aria-describedby={describedBy} />}
        </Field>
      )}
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant={copy.tone === "danger" ? "danger" : "primary"} loading={busy} disabled={!ready} onClick={() => void submit()}>
          {copy.confirm}
        </Button>
      </div>
    </div>
  );
}

function ListingDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const toast = useToast();
  const key = id ? `/hub/admin/listings/${id}` : null;
  const { data, error, loading, refetch } = useHubQuery<{ listing: ModerationDetail }>(key);
  const [deciding, setDeciding] = useState<ListingAction | null>(null);
  const [rescanning, setRescanning] = useState(false);
  useEffect(() => setDeciding(null), [id]);

  const l = data?.listing;
  const state = listingState(l?.moderation_status);

  function applied(next: ModerationDetail) {
    if (key) setQueryData(key, { listing: next });
    setDeciding(null);
    invalidate("/hub/admin/");
  }

  async function rescan() {
    if (!l) return;
    setRescanning(true);
    try {
      const out = await hubApi.post<{ listing: ModerationDetail }>(`/hub/admin/listings/${l.id}/action`, { action: "rescan" });
      applied(out.listing);
      toast.success(`Spam check finished: score ${out.listing.spam_score ?? 0} out of 100.`);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "The spam check didn't run.");
    } finally {
      setRescanning(false);
    }
  }

  const decisions = (l?.actions ?? []).filter((a) => a !== "rescan");

  return (
    <Sheet
      open={Boolean(id)}
      onClose={onClose}
      width={600}
      title={l ? l.title : "Listing"}
      footer={
        l && !deciding && decisions.length > 0 ? (
          <div className="flex w-full flex-wrap justify-end gap-2">
            {decisions.map((a, i) => {
              // The first allowed action is the usual one. Destructive ones
              // stay quiet unless they are the point of this queue.
              const danger = LISTING_ACTIONS[a].tone === "danger";
              const variant = i === 0 ? (danger ? "danger" : "primary") : danger ? "ghost" : "secondary";
              return (
                <Button key={a} size="sm" variant={variant} onClick={() => setDeciding(a)} className={i > 0 && danger ? "text-[color:var(--color-danger-500)]" : undefined}>
                  {LISTING_ACTIONS[a].label}
                </Button>
              );
            })}
          </div>
        ) : undefined
      }
    >
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !l ? (
        <RowSkeleton rows={4} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
            {typeof l.spam_score === "number" && l.spam_score > 0 && (
              <StatusBadge tone={l.spam_score >= 60 ? "danger" : l.spam_score >= 30 ? "warning" : "neutral"} icon={false}>
                Spam score {l.spam_score}/100
              </StatusBadge>
            )}
            {l.moderation_status === "approved" && l.public_state === "published" && (
              <a href={siteUrl(`/listing/${l.id}`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-[color:var(--color-primary)] hover:underline">
                View on Migrent <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </a>
            )}
          </div>

          {l.images.length > 0 ? (
            <div className="hub-scroll-x -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {l.images.map((src, i) => (
                <HomeImage key={`${src}-${i}`} src={src} alt={`Photo ${i + 1} of ${l.images.length}`} className="h-32 w-44 shrink-0" rounded="rounded-[14px]" sizes="176px" />
              ))}
            </div>
          ) : (
            <InlineAlert tone="warning">No photos. A listing can't go live without them.</InlineAlert>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
            <div className="col-span-2">
              <dt className="text-[12.5px] text-[color:var(--color-ink-3)]">Address</dt>
              <dd className="font-semibold text-[color:var(--color-ink)]">{[l.street_address, l.display_address].filter(Boolean).join(", ")}</dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-[color:var(--color-ink-3)]">Rent</dt>
              <dd className="font-semibold text-[color:var(--color-ink)]">{weekly(l.weekly_price)}</dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-[color:var(--color-ink-3)]">Space</dt>
              <dd className="font-semibold text-[color:var(--color-ink)]">{[placeTypeLabel(l.place_type), propertyTypeLabel(l.property_type)].filter(Boolean).join(" in a ") || "-"}</dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-[color:var(--color-ink-3)]">Available</dt>
              <dd className="font-semibold text-[color:var(--color-ink)]">
                {day(l.available_from)}
                {l.available_to ? ` to ${day(l.available_to)}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-[color:var(--color-ink-3)]">Sent</dt>
              <dd className="font-semibold text-[color:var(--color-ink)]">{l.created_at ? relative(l.created_at) : "-"}</dd>
            </div>
          </dl>

          <section aria-label="Owner" className="flex items-center gap-3 rounded-[16px] border border-[var(--color-line)] p-3">
            <Avatar name={l.owner.name} src={l.owner.avatar_url} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-semibold text-[color:var(--color-ink)]">{l.owner.name}</p>
              {l.owner.email && (
                <a href={`mailto:${l.owner.email}`} className="inline-flex max-w-full items-center gap-1 truncate text-[13px] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-primary)]">
                  <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="truncate">{l.owner.email}</span>
                </a>
              )}
            </div>
            <StatusBadge tone={ID_CHECK[l.owner.id_check]?.tone ?? "neutral"}>{ID_CHECK[l.owner.id_check]?.label ?? "ID not checked"}</StatusBadge>
          </section>

          {l.spam_reasons.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">Why the spam check flagged it</h3>
                {l.actions.includes("rescan") && (
                  <Button size="sm" variant="ghost" loading={rescanning} onClick={() => void rescan()}>
                    {LISTING_ACTIONS.rescan.label}
                  </Button>
                )}
              </div>
              <ul className="flex flex-col gap-1.5">
                {l.spam_reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13.5px] text-[color:var(--color-ink-2)]">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-warn-500)]" strokeWidth={2} aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(l.moderation_reason || l.moderation_notes) && (
            <section className="flex flex-col gap-1 rounded-[14px] bg-[var(--color-surface-muted)] px-4 py-3 text-[13.5px] text-[color:var(--color-ink-2)]">
              <h3 className="font-semibold text-[color:var(--color-ink)]">Last decision</h3>
              {l.moderation_reason && <p>{l.moderation_reason}</p>}
              {l.moderation_notes && <p className="whitespace-pre-wrap">{l.moderation_notes}</p>}
            </section>
          )}

          <section className="flex flex-col gap-2">
            <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">Description</h3>
            <p className="max-h-56 overflow-y-auto whitespace-pre-wrap text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">{l.description || "No description."}</p>
          </section>

          {deciding && <DecisionPanel listing={l} action={deciding} onCancel={() => setDeciding(null)} onDone={applied} />}

          <section className="flex flex-col gap-2">
            <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">History</h3>
            {l.history.length === 0 ? (
              <p className="text-[13.5px] text-[color:var(--color-ink-3)]">Nothing recorded yet.</p>
            ) : (
              <ol className="flex flex-col divide-y divide-[var(--color-line)]">
                {l.history.map((h) => (
                  <li key={h.id} className="flex flex-col gap-0.5 py-2.5">
                    <p className="text-[13.5px] text-[color:var(--color-ink)]">
                      <span className="font-semibold">{moderationEvent(h.event_type)}</span>
                      {h.actor ? ` by ${h.actor.name}` : h.actor_type === "system" ? " by the spam check" : ""}
                      {typeof h.spam_score === "number" ? ` (score ${h.spam_score})` : ""}
                    </p>
                    <p className="text-[12.5px] text-[color:var(--color-ink-3)]">{dateTime(h.created_at, viewerZone())}</p>
                    {h.notes && <p className="text-[13px] text-[color:var(--color-ink-2)]">{h.notes}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </Sheet>
  );
}

/**
 * Listing moderation: new listings to check, anything the spam check caught,
 * and every listing on Migrent when a report needs one found.
 */
function AdminListingsContent() {
  const router = useRouter();
  const queue: ListingQueue = LISTING_QUEUES.some((x) => x.value === router.query.queue) ? (router.query.queue as ListingQueue) : "review";
  const selected = typeof router.query.listing === "string" ? router.query.listing : null;
  const [q, setQ] = useState("");
  const [needle, setNeedle] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setNeedle(q.trim()), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const setParams = (next: { queue?: ListingQueue; listing?: string | null }) => {
    const query: Record<string, string> = {};
    const nq = next.queue ?? queue;
    if (nq !== "review") query.queue = nq;
    const nl = next.listing === undefined ? selected : next.listing;
    if (nl) query.listing = nl;
    void router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const key = `/hub/admin/listings?queue=${queue}${needle.length >= 2 ? `&q=${encodeURIComponent(needle)}` : ""}`;
  const { data, error, loading, refetch } = useHubQuery<{ listings: ModerationItem[]; counts: Counts }>(key);
  const counts = data?.counts;

  return (
    <>
      <PageHeader
        title="Listings"
        description="Check new listings before they go live and decide on anything the spam check caught. Every decision is recorded in the audit log, and the owner is emailed when it affects them."
      />
      <Tabs
        label="Listing queues"
        value={queue}
        onChange={(v) => setParams({ queue: v, listing: null })}
        tabs={LISTING_QUEUES.map((t) => ({ value: t.value, label: t.label, count: t.value === "all" ? undefined : counts?.[t.value] }))}
        className="mb-5"
      />
      <div className="relative mb-6 max-w-[520px]">
        <label htmlFor="listing-q" className="sr-only">
          Search listings by title, suburb or owner
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-ink-3)]" strokeWidth={1.9} aria-hidden />
        <input
          id="listing-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Title, suburb, or owner's name or email"
          autoComplete="off"
          className="h-12 w-full rounded-full border border-[var(--color-line-2)] bg-[var(--color-surface)] pl-11 pr-4 text-[15px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <RowSkeleton rows={4} />
      ) : data.listings.length === 0 ? (
        <EmptyState icon={<ListChecks className="h-6 w-6" strokeWidth={1.75} />} title={needle.length >= 2 ? "No listings match" : QUEUE_EMPTY[queue].title} body={needle.length >= 2 ? QUEUE_EMPTY.all.body : QUEUE_EMPTY[queue].body} />
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
          {data.listings.map((l) => {
            const state = listingState(l.moderation_status);
            return (
              <li key={l.id} className="border-t border-[var(--color-line)] first:border-0">
                <button type="button" onClick={() => setParams({ listing: l.id })} className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)] sm:px-5">
                  <HomeImage src={l.image} alt="" className="hidden h-14 w-20 shrink-0 sm:block" rounded="rounded-[12px]" sizes="80px" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">
                      {l.unit_label ? `${l.unit_label}, ` : ""}
                      {l.title}
                    </span>
                    <span className="truncate text-[13.5px] text-[color:var(--color-ink-2)]">
                      {l.display_address} · {weekly(l.weekly_price)} · {l.owner.name}
                    </span>
                    <span className="truncate text-[12.5px] text-[color:var(--color-ink-3)]">{queueLine(l)}</span>
                  </span>
                  <span className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                    {queue === "all" || queue === "review" ? <StatusBadge tone={state.tone}>{state.label}</StatusBadge> : null}
                    {typeof l.spam_score === "number" && l.spam_score > 0 && queue !== "review" && (
                      <StatusBadge tone={l.spam_score >= 60 ? "danger" : l.spam_score >= 30 ? "warning" : "neutral"} icon={false}>
                        Score {l.spam_score}
                      </StatusBadge>
                    )}
                    {l.owner.id_check !== "verified" && <StatusBadge tone={ID_CHECK[l.owner.id_check]?.tone ?? "neutral"}>{ID_CHECK[l.owner.id_check]?.label}</StatusBadge>}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-ink-4)]" strokeWidth={2} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ListingDrawer id={selected} onClose={() => setParams({ listing: null })} />
    </>
  );
}

/** Inside the Admin panel: nothing here loads until the admin password is entered. */
export default function AdminListingsPage() {
  return (
    <AdminPanelShell title="Listings">
      <AdminListingsContent />
    </AdminPanelShell>
  );
}
