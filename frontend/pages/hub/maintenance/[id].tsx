import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { CalendarClock, Check, CircleDot, ImagePlus, Lock, MessageCircle, Wrench } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import { EmergencyPanel } from "../../../components/hub/tenancy/MaintenanceForm";
import { HomeRow } from "../../../components/hub/cards";
import { Button, ButtonLink } from "../../../components/hub/ui/Button";
import { CardSkeleton, EmptyState, ErrorState, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Checkbox, Field, Input, Textarea } from "../../../components/hub/ui/Field";
import { PageHeader, Panel, Section } from "../../../components/hub/ui/Layout";
import { Avatar } from "../../../components/hub/ui/Media";
import { Dialog } from "../../../components/hub/ui/Overlay";
import { useToast } from "../../../components/ui/Toast";
import { hubApi, hubUploadWithProgress, HubError } from "../../../lib/hub/api";
import { dateTime, relative, whenLabel, zonedToIso } from "../../../lib/hub/format";
import { invalidate, setQueryData, useHubQuery } from "../../../lib/hub/query";
import { MAINTENANCE_CATEGORIES, MAINTENANCE_STATUS, URGENCY } from "../../../lib/hub/status";
import type { MaintenanceDetail, MaintenanceStatus } from "../../../lib/hub/types";
import { cn } from "../../../lib/cn";

const ACTION_LABEL: Record<MaintenanceStatus, string> = {
  submitted: "Reopen",
  acknowledged: "Acknowledge",
  scheduled: "Schedule",
  in_progress: "Work has started",
  resolved: "Mark as fixed",
  closed: "Close",
};

function ScheduleDialog({ open, onClose, tz, onSave }: { open: boolean; onClose: () => void; tz: string; onSave: (iso: string, note: string) => Promise<void> }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Schedule the repair"
      description={`Times are in the property's time zone (${tz.replace("Australia/", "")}). The renter is notified.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={busy}
            disabled={!date || !time}
            onClick={async () => {
              setBusy(true);
              await onSave(zonedToIso(date, time, tz), note);
              setBusy(false);
            }}
          >
            Schedule
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">{({ id }) => <Input id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
        <Field label="Time">{({ id }) => <Input id={id} type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} />}</Field>
        <div className="sm:col-span-2">
          <Field label="Note to the renter" optional hint="Who's coming and anything they need.">
            {({ id, describedBy }) => <Textarea id={id} rows={3} value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} aria-describedby={describedBy} />}
          </Field>
        </div>
      </div>
    </Dialog>
  );
}

export default function MaintenancePage() {
  const router = useRouter();
  const toast = useToast();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const key = id ? `/hub/maintenance/${id}` : null;
  const { data, error, refetch } = useHubQuery<MaintenanceDetail>(key);
  const [text, setText] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  async function post(payload: { body?: string; status_to?: MaintenanceStatus; internal?: boolean; scheduled_for?: string }, label: string) {
    if (!id) return;
    setBusy(label);
    try {
      const res = await hubApi.post<MaintenanceDetail>(`/hub/maintenance/${id}/updates`, payload);
      setQueryData(key!, res);
      invalidate("/hub/maintenance");
      invalidate("/hub/tenancies");
      invalidate("/hub/counts");
      if (payload.body) setText("");
      if (payload.status_to) toast.success(MAINTENANCE_STATUS[payload.status_to].label);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(null);
    }
  }

  async function addPhotos(list: FileList | null) {
    if (!list || !id || !data) return;
    const room = 8 - data.photos.length;
    const files = Array.from(list).slice(0, room);
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      setUploading(`Adding ${i + 1} of ${files.length}`);
      const form = new FormData();
      form.append("file", files[i], files[i].name);
      try {
        await hubUploadWithProgress(`/hub/maintenance/${id}/photos`, form, () => {});
      } catch {
        failed++;
      }
    }
    setUploading(null);
    if (file.current) file.current.value = "";
    if (failed) toast.error(`${failed} photo${failed === 1 ? "" : "s"} didn't upload.`);
    void refetch();
  }

  if (error) {
    return (
      <HubShell title="Repair">
        <PageHeader title="Repair" back={{ to: "/tenancies?tab=repairs", label: "Repairs" }} />
        {error.status === 404 ? <EmptyState title="Request not found" body="It may belong to a different account." /> : <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />}
      </HubShell>
    );
  }
  if (!data) {
    return (
      <HubShell title="Repair">
        <CardSkeleton />
      </HubShell>
    );
  }

  const r = data.request;
  const owner = data.viewer === "owner";
  const other = owner ? data.renter : data.owner;
  const tz = data.listing?.timezone || "Australia/Sydney";
  const open = r.status !== "resolved" && r.status !== "closed";
  const st = MAINTENANCE_STATUS[r.status];
  const category = MAINTENANCE_CATEGORIES.find((c) => c.value === r.category)?.label ?? "Repair";

  return (
    <HubShell title={r.title}>
      <PageHeader
        eyebrow={category}
        title={r.title}
        back={owner ? { to: "/tenancies?tab=repairs", label: "Repairs" } : { to: r.tenancy_id ? `/tenancies/${r.tenancy_id}` : "/my-home", label: "My home" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
            {r.urgency !== "routine" && <StatusBadge tone={URGENCY[r.urgency].tone}>{URGENCY[r.urgency].label}</StatusBadge>}
            <span className="text-[13.5px] text-[color:var(--color-ink-3)]">Reported {relative(r.created_at)}</span>
          </span>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-8">
          {r.urgency === "emergency" && open && data.emergency && <EmergencyPanel g={data.emergency} />}
          {r.status === "scheduled" && r.scheduled_for && (
            <Panel className="flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-[color:var(--color-primary)]" strokeWidth={1.75} aria-hidden />
              <p className="text-[15px] text-[color:var(--color-ink)]">
                Booked for <span className="font-semibold">{whenLabel(r.scheduled_for, tz)}</span>
              </p>
            </Panel>
          )}

          <Panel className="flex flex-col gap-4">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[color:var(--color-ink)]">{r.description}</p>
            {r.access_notes && (
              <p className="rounded-[12px] bg-[var(--color-surface-muted)] px-3.5 py-2.5 text-[13.5px] text-[color:var(--color-ink-2)]">
                <span className="font-semibold text-[color:var(--color-ink)]">Access: </span>
                {r.access_notes}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {data.photos.map((src, i) => (
                <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block h-24 w-24 overflow-hidden rounded-[12px] bg-[var(--color-surface-muted)] sm:h-28 sm:w-28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1} of the problem`} className="h-full w-full object-cover" loading="lazy" />
                </a>
              ))}
              {data.photos.length < 8 && r.status !== "closed" && (
                <button
                  type="button"
                  disabled={!!uploading}
                  onClick={() => file.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-[12px] border border-dashed border-[var(--color-line-2)] px-2 text-center text-[12px] font-semibold text-[color:var(--color-ink-2)] hover:border-[var(--color-primary)] hover:text-[color:var(--color-primary)] sm:h-28 sm:w-28"
                >
                  <ImagePlus className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  {uploading ?? "Add photos"}
                </button>
              )}
              <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => void addPhotos(e.target.files)} />
            </div>
          </Panel>

          <Section title="Updates">
            <ol className="relative flex flex-col gap-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-[var(--color-line)]">
              {data.updates.map((u) => {
                const mine = u.author_role === data.viewer;
                return (
                  <li key={u.id} className="relative flex gap-3.5">
                    <span
                      aria-hidden
                      className={cn(
                        "relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-bg)]",
                        u.status_to ? "bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]" : "bg-[var(--color-surface-muted)] text-[color:var(--color-ink-3)]",
                      )}
                    >
                      {u.status_to === "resolved" || u.status_to === "closed" ? <Check className="h-4 w-4" strokeWidth={2.2} /> : u.status_to ? <CircleDot className="h-4 w-4" strokeWidth={2} /> : <MessageCircle className="h-4 w-4" strokeWidth={1.9} />}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
                      <p className="text-[13.5px] text-[color:var(--color-ink-3)]">
                        <span className="font-semibold text-[color:var(--color-ink)]">{mine ? "You" : u.author_role === "owner" ? "Owner" : "Renter"}</span>
                        {u.status_to ? ` · ${u.status_to === "submitted" && !u.status_from ? "Reported" : MAINTENANCE_STATUS[u.status_to as MaintenanceStatus]?.label ?? u.status_to}` : ""} · {dateTime(u.created_at, tz)}
                      </p>
                      {u.body && (
                        <p className={cn("whitespace-pre-wrap rounded-[14px] px-3.5 py-2.5 text-[14.5px] leading-relaxed", u.internal ? "border border-dashed border-[var(--color-line-2)] bg-transparent text-[color:var(--color-ink-2)]" : "bg-[var(--color-surface-muted)] text-[color:var(--color-ink)]")}>
                          {u.internal && (
                            <span className="mb-1 flex items-center gap-1 text-[12px] font-semibold text-[color:var(--color-ink-3)]">
                              <Lock className="h-3 w-3" strokeWidth={2} aria-hidden /> Private note - only you can see this
                            </span>
                          )}
                          {u.body}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {r.status !== "closed" && (
              <form
                className="mt-2 flex flex-col gap-3 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)] p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) void post({ body: text.trim(), internal: owner && internal }, "send");
                }}
              >
                <label htmlFor="m-update" className="sr-only">
                  Add an update
                </label>
                <Textarea id="m-update" rows={3} value={text} maxLength={2000} placeholder={owner ? "Add an update for the renter" : "Add details or reply to the owner"} onChange={(e) => setText(e.target.value)} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {owner ? <Checkbox checked={internal} onChange={setInternal} label="Private note (the renter won't see it)" /> : <span />}
                  <Button type="submit" size="sm" loading={busy === "send"} disabled={!text.trim()}>
                    {owner && internal ? "Save note" : "Send update"}
                  </Button>
                </div>
              </form>
            )}
          </Section>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-10 lg:self-start">
          {data.next_statuses.length > 0 && (
            <Panel className="flex flex-col gap-3">
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">{owner ? "Update the status" : "Is it fixed?"}</p>
              {!owner && r.status === "resolved" && <p className="text-[13.5px] leading-snug text-[color:var(--color-ink-2)]">The owner marked this as fixed. If it isn't, add an update and they'll be notified.</p>}
              {data.next_statuses.map((s, i) => (
                <Button
                  key={s}
                  variant={i === 0 ? "primary" : "secondary"}
                  block
                  loading={busy === s}
                  onClick={() => (s === "scheduled" ? setScheduleOpen(true) : void post({ status_to: s }, s))}
                >
                  {!owner && s === "closed" ? "Yes, it's fixed" : r.status === "resolved" && s === "in_progress" ? "Reopen" : ACTION_LABEL[s]}
                </Button>
              ))}
            </Panel>
          )}
          {data.listing && (
            <div className="overflow-hidden rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)]">
              <HomeRow listing={data.listing} to={owner ? `/listings/${data.listing.id}` : r.tenancy_id ? `/tenancies/${r.tenancy_id}` : "/my-home"} />
            </div>
          )}
          {other && (
            <Panel className="flex items-center gap-3">
              <Avatar name={other.name} src={other.avatar_url} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">{other.name}</p>
                <p className="text-[12.5px] text-[color:var(--color-ink-3)]">{owner ? "Renter" : "Owner"}</p>
              </div>
              {data.listing && (
                <ButtonLink to={`/messages/${data.listing.id}_${other.id}`} variant="ghost" size="sm" icon={<MessageCircle className="h-4 w-4" strokeWidth={1.75} />}>
                  Message
                </ButtonLink>
              )}
            </Panel>
          )}
          {!data.next_statuses.length && r.status === "closed" && (
            <p className="flex items-center gap-2 px-1 text-[13.5px] text-[color:var(--color-ink-3)]">
              <Wrench className="h-4 w-4" strokeWidth={1.75} aria-hidden /> Closed {r.closed_at ? relative(r.closed_at) : ""}
            </p>
          )}
        </aside>
      </div>

      {owner && (
        <ScheduleDialog
          open={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          tz={tz}
          onSave={async (iso, note) => {
            await post({ status_to: "scheduled", scheduled_for: iso, body: note.trim() || undefined }, "scheduled");
            setScheduleOpen(false);
          }}
        />
      )}
    </HubShell>
  );
}
