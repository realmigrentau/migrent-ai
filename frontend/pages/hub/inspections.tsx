import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { CalendarDays, CalendarPlus, Clock, Compass, MapPin, Navigation, Plus, Trash2, Users, X } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import HubLink from "../../components/hub/HubLink";
import { InspectionCard } from "../../components/hub/cards";
import { downloadIcs } from "../../components/hub/listing/InspectionPicker";
import { Button, ButtonLink } from "../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, RowSkeleton, StatusBadge } from "../../components/hub/ui/Feedback";
import { Field, Input, Select, Textarea } from "../../components/hub/ui/Field";
import { Avatar, HomeImage } from "../../components/hub/ui/Media";
import { Dialog, Sheet } from "../../components/hub/ui/Overlay";
import { PageHeader, Section, Tabs } from "../../components/hub/ui/Layout";
import { useConfirm } from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";
import { hubApi, HubError } from "../../lib/hub/api";
import { isoToZoned, relative, time, whenLabel, zonedToIso } from "../../lib/hub/format";
import { invalidate, useHubQuery } from "../../lib/hub/query";
import { useHub } from "../../lib/hub/session";
import type { InspectionBooking, InspectionSlot, ListingCard, Portfolio } from "../../lib/hub/types";

/* ── Renter ────────────────────────────────────────────── */

function RenterInspections() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const upcoming = useHubQuery<{ bookings: InspectionBooking[] }>("/hub/inspections");
  const all = useHubQuery<{ bookings: InspectionBooking[] }>(tab === "past" ? "/hub/inspections?scope=all" : null);
  const q = tab === "upcoming" ? upcoming : all;
  const list = tab === "upcoming" ? q.data?.bookings ?? [] : (q.data?.bookings ?? []).filter((b) => !b.upcoming);

  async function cancel(b: InspectionBooking) {
    const ok = await confirm({ title: "Cancel this inspection?", description: "The owner will be told. You can book another time from the listing.", confirmLabel: "Cancel inspection", cancelLabel: "Keep it", tone: "danger" });
    if (!ok) return;
    try {
      await hubApi.post(`/hub/inspections/bookings/${b.id}/cancel`);
      invalidate("/hub/inspections");
      invalidate("/hub/home");
      toast.info("Inspection cancelled");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That did not cancel.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs label="Inspections" value={tab} onChange={setTab} tabs={[{ value: "upcoming", label: "Upcoming", count: upcoming.data?.bookings.length }, { value: "past", label: "Past and cancelled" }]} />
      {q.error ? (
        <ErrorState message={q.error.message} offline={q.error.offline} onRetry={() => void q.refetch()} />
      ) : q.loading || !q.data ? (
        <RowSkeleton rows={3} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" strokeWidth={1.75} />}
          title={tab === "upcoming" ? "No inspections booked" : "Nothing here yet"}
          body={tab === "upcoming" ? "When an owner opens inspection times, you can book one straight from the home's page." : "Past and cancelled inspections show here."}
          action={tab === "upcoming" ? <ButtonLink to="/discover" icon={<Compass className="h-4 w-4" strokeWidth={1.9} />}>Explore homes</ButtonLink> : undefined}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((b) => {
            const address = b.listing?.street_address ? `${b.listing.street_address}, ${b.listing.display_address}` : null;
            return (
              <div key={b.id} className="flex flex-col gap-3">
                <InspectionCard
                  booking={b}
                  actions={
                    tab === "upcoming" ? (
                      <>
                        <Button size="sm" variant="secondary" icon={<CalendarPlus className="h-4 w-4" strokeWidth={1.75} />} onClick={() => downloadIcs({ id: b.id, starts_at: b.slot.starts_at, ends_at: b.slot.ends_at, title: b.listing?.title ?? "Inspection", location: address, instructions: b.slot.instructions })}>
                          Add to calendar
                        </Button>
                        {address && (
                          <ButtonLink to={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`} external size="sm" variant="ghost" icon={<Navigation className="h-4 w-4" strokeWidth={1.75} />}>
                            Directions
                          </ButtonLink>
                        )}
                        <ButtonLink to={`/homes/${b.listing?.id}#inspections`} size="sm" variant="ghost">
                          Change time
                        </ButtonLink>
                        <Button size="sm" variant="ghost" onClick={() => void cancel(b)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <StatusBadge tone="neutral">{b.status === "cancelled" ? "Cancelled" : b.status === "attended" ? "Attended" : "Past"}</StatusBadge>
                    )
                  }
                />
                {tab === "upcoming" && b.slot.instructions && (
                  <p className="flex items-start gap-2 px-1 text-[13.5px] text-[color:var(--color-ink-2)]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
                    {b.slot.instructions}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Owner ─────────────────────────────────────────────── */

interface NewSlotsForm {
  listingId: string;
  date: string;
  times: string[];
  duration: number;
  capacity: number;
  instructions: string;
}

function OpenTimesDialog({ open, onClose, units, preselect }: { open: boolean; onClose: () => void; units: ListingCard[]; preselect?: string }) {
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState<NewSlotsForm>({ listingId: preselect || units[0]?.id || "", date: today, times: ["10:00"], duration: 30, capacity: 6, instructions: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setF((p) => ({ ...p, listingId: preselect || p.listingId || units[0]?.id || "" }));
  }, [open, preselect, units]);
  const unit = units.find((u) => u.id === f.listingId);
  const tz = unit?.timezone || "Australia/Sydney";

  async function save() {
    setError(null);
    if (!f.listingId) return setError("Choose which home.");
    const times = Array.from(new Set(f.times.filter(Boolean))).sort();
    if (!times.length) return setError("Add at least one start time.");
    const slots = times.map((t) => ({ starts_at: zonedToIso(f.date, t, tz), duration_minutes: f.duration }));
    if (slots.some((s) => new Date(s.starts_at).getTime() < Date.now() + 30 * 60000)) return setError("Times need to be at least 30 minutes from now.");
    setSaving(true);
    try {
      await hubApi.post("/hub/inspections/slots", { listing_id: f.listingId, slots, capacity: f.capacity, instructions: f.instructions.trim() || undefined });
      invalidate("/hub/inspections");
      invalidate("/hub/home");
      invalidate(`/hub/listings/${f.listingId}/inspection-slots`);
      toast.success(`${slots.length} inspection time${slots.length === 1 ? "" : "s"} open`, { description: "Renters can book straight away." });
      onClose();
    } catch (e) {
      setError(e instanceof HubError ? e.message : "Those times could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Open inspection times"
      description="Renters book a place themselves. You'll get a notification for each booking."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={() => void save()}>
            Open {f.times.filter(Boolean).length > 1 ? `${f.times.filter(Boolean).length} times` : "time"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5 pb-3">
        <Field label="Home">
          {({ id }) => (
            <Select id={id} value={f.listingId} onChange={(e) => setF({ ...f, listingId: e.target.value })}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.unit_label ? `${u.unit_label} · ` : ""}
                  {u.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date" className="sm:col-span-1">
            {({ id }) => <Input id={id} type="date" min={today} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />}
          </Field>
          <Field label="Length">
            {({ id }) => (
              <Select id={id} value={f.duration} onChange={(e) => setF({ ...f, duration: Number(e.target.value) })}>
                {[15, 20, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Places">
            {({ id }) => <Input id={id} type="number" inputMode="numeric" min={1} max={100} value={f.capacity} onChange={(e) => setF({ ...f, capacity: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })} />}
          </Field>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-[13.5px] font-semibold text-[color:var(--color-ink)]">Start times ({tz.split("/")[1]?.replace("_", " ")} time)</legend>
          <div className="flex flex-wrap items-center gap-2">
            {f.times.map((t, i) => (
              <div key={i} className="flex items-center gap-1">
                <label className="sr-only" htmlFor={`slot-time-${i}`}>
                  Start time {i + 1}
                </label>
                <Input id={`slot-time-${i}`} type="time" step={900} value={t} onChange={(e) => setF({ ...f, times: f.times.map((x, j) => (j === i ? e.target.value : x)) })} className="w-[132px]" />
                {f.times.length > 1 && (
                  <button type="button" aria-label={`Remove start time ${i + 1}`} onClick={() => setF({ ...f, times: f.times.filter((_, j) => j !== i) })} className="flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--color-ink-3)] hover:bg-[var(--color-surface-hover)]">
                    <X className="h-4 w-4" strokeWidth={1.9} />
                  </button>
                )}
              </div>
            ))}
            {f.times.length < 12 && (
              <Button
                size="sm"
                variant="ghost"
                icon={<Plus className="h-4 w-4" strokeWidth={1.9} />}
                onClick={() => {
                  const last = f.times[f.times.length - 1] || "10:00";
                  const [h, m] = last.split(":").map(Number);
                  const mins = h * 60 + m + f.duration;
                  setF({ ...f, times: [...f.times, `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`] });
                }}
              >
                Add a time
              </Button>
            )}
          </div>
        </fieldset>
        <Field label="Instructions" optional hint="How to get in, where to park. Shown only to people who book.">
          {({ id, describedBy }) => <Textarea id={id} rows={3} value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value.slice(0, 1000) })} aria-describedby={describedBy} />}
        </Field>
        <InlineAlert tone="neutral">People who book are shown the street address, so they can find the home. Nobody else sees it.</InlineAlert>
        {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      </div>
    </Dialog>
  );
}

function AttendeesSheet({ slot, onClose }: { slot: InspectionSlot | null; onClose: () => void }) {
  const q = useHubQuery<{ attendees: { booking_id: string; status: string; note: string | null; person: { id: string; name: string; avatar_url: string | null } | null; booked_at: string }[] }>(slot ? `/hub/inspections/slots/${slot.id}/attendees` : null);
  const toast = useToast();
  const [openedAt] = useState(() => Date.now());
  const tz = slot?.listing?.timezone;
  async function mark(bookingId: string, status: "attended" | "no_show") {
    try {
      await hubApi.post(`/hub/inspections/bookings/${bookingId}/attendance`, { status });
      void q.refetch();
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That did not save.");
    }
  }
  const past = slot ? new Date(slot.starts_at).getTime() < openedAt : false;
  return (
    <Sheet open={Boolean(slot)} onClose={onClose} title={slot ? `${whenLabel(slot.starts_at, tz)}` : "Attendees"}>
      {slot && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <HomeImage src={slot.listing?.image} alt="" className="h-14 w-16" rounded="rounded-[12px]" sizes="64px" />
            <div>
              <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">{slot.listing?.title}</p>
              <p className="text-[13.5px] text-[color:var(--color-ink-2)]">
                {slot.booked} of {slot.capacity} booked
              </p>
            </div>
          </div>
          {q.loading ? (
            <RowSkeleton rows={3} />
          ) : !q.data?.attendees.length ? (
            <EmptyState compact icon={<Users className="h-6 w-6" strokeWidth={1.75} />} title="No bookings yet" body="You'll get a notification each time someone books." />
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--color-line)]">
              {q.data.attendees.map((a) => (
                <li key={a.booking_id} className="flex items-center gap-3 py-3">
                  <Avatar name={a.person?.name} src={a.person?.avatar_url} size={36} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-[14.5px] font-semibold text-[color:var(--color-ink)]">{a.person?.name}</p>
                    <p className="text-[12.5px] text-[color:var(--color-ink-3)]">{a.status === "cancelled" ? "Cancelled" : `Booked ${relative(a.booked_at)}`}</p>
                  </div>
                  {past && a.status === "booked" ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => void mark(a.booking_id, "attended")}>
                        Came
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void mark(a.booking_id, "no_show")}>
                        No-show
                      </Button>
                    </div>
                  ) : a.status !== "booked" && a.status !== "cancelled" ? (
                    <StatusBadge tone="neutral">{a.status === "attended" ? "Came" : "No-show"}</StatusBadge>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {slot.instructions && (
            <p className="rounded-[12px] bg-[var(--color-surface-muted)] px-3.5 py-2.5 text-[13.5px] text-[color:var(--color-ink-2)]">
              <span className="font-semibold text-[color:var(--color-ink)]">Instructions: </span>
              {slot.instructions}
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
}

function MoveSlotDialog({ slot, onClose }: { slot: InspectionSlot | null; onClose: () => void }) {
  const toast = useToast();
  const tz = slot?.listing?.timezone || "Australia/Sydney";
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (slot) {
      const z = isoToZoned(slot.starts_at, tz);
      setDate(z.date);
      setStart(z.time);
    }
  }, [slot, tz]);
  return (
    <Dialog
      open={Boolean(slot)}
      onClose={onClose}
      title="Move this inspection"
      description={slot?.booked ? `${slot.booked} ${slot.booked === 1 ? "person has" : "people have"} booked. They'll be told the new time.` : "Nobody has booked yet."}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            onClick={async () => {
              if (!slot) return;
              setSaving(true);
              try {
                await hubApi.patch(`/hub/inspections/slots/${slot.id}`, { starts_at: zonedToIso(date, start, tz) });
                invalidate("/hub/inspections");
                toast.success("Inspection moved");
                onClose();
              } catch (e) {
                toast.error(e instanceof HubError ? e.message : "That did not save.");
              } finally {
                setSaving(false);
              }
            }}
          >
            Move
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 pb-3">
        <Field label="Date">{({ id }) => <Input id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
        <Field label="Start time">{({ id }) => <Input id={id} type="time" step={900} value={start} onChange={(e) => setStart(e.target.value)} />}</Field>
      </div>
    </Dialog>
  );
}

function OwnerInspections({ openNew, setOpenNew }: { openNew: boolean; setOpenNew: (v: boolean) => void }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, error, loading, refetch } = useHubQuery<{ slots: InspectionSlot[] }>("/hub/inspections");
  const portfolio = useHubQuery<Portfolio>("/hub/properties");
  const units = useMemo(() => [...(portfolio.data?.properties.flatMap((p) => p.units) ?? []), ...(portfolio.data?.unassigned ?? [])].filter((u) => u.moderation_status !== "deleted"), [portfolio.data]);
  const [attendees, setAttendees] = useState<InspectionSlot | null>(null);
  const [moving, setMoving] = useState<InspectionSlot | null>(null);
  const preselect = typeof router.query.listing === "string" ? router.query.listing : undefined;

  // Deep link from the command palette or an owner's listing: ?new=1
  useEffect(() => {
    if (router.query.new === "1" && units.length) {
      setOpenNew(true);
      const { new: _drop, ...rest } = router.query;
      void _drop;
      void router.replace({ pathname: router.pathname, query: rest }, router.asPath.split("?")[0] + (rest.listing ? `?listing=${rest.listing}` : ""), { shallow: true });
    }
  }, [router, units.length, setOpenNew]);

  const slots = (data?.slots ?? []).filter((s) => s.status === "scheduled");
  const groups = new Map<string, InspectionSlot[]>();
  for (const s of slots) {
    const key = new Intl.DateTimeFormat("en-AU", { timeZone: s.listing?.timezone || "Australia/Sydney", weekday: "long", day: "numeric", month: "long" }).format(new Date(s.starts_at));
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }

  async function cancel(s: InspectionSlot) {
    const ok = await confirm({
      title: "Cancel this inspection time?",
      description: s.booked ? `${s.booked} ${s.booked === 1 ? "person has" : "people have"} booked. They'll be told it's cancelled.` : "Nobody has booked it yet.",
      confirmLabel: "Cancel time",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await hubApi.post(`/hub/inspections/slots/${s.id}/cancel`, {});
      invalidate("/hub/inspections");
      toast.info("Inspection time cancelled");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That did not cancel.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <RowSkeleton rows={4} />
      ) : slots.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" strokeWidth={1.75} />}
          title="No inspection times open"
          body={units.length ? "Open a few times and renters book themselves in. You'll see who's coming here." : "List a property first, then open inspection times for it."}
          action={units.length ? <Button icon={<Plus className="h-4 w-4" strokeWidth={1.9} />} onClick={() => setOpenNew(true)}>Open inspection times</Button> : <ButtonLink to="/properties/new">List a property</ButtonLink>}
        />
      ) : (
        Array.from(groups.entries()).map(([dayLabel, list]) => (
          <Section key={dayLabel} title={dayLabel}>
            <ul className="flex flex-col gap-3">
              {list.map((s) => (
                <li key={s.id} className="flex flex-col gap-4 rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <HomeImage src={s.listing?.image} alt="" className="h-14 w-16 shrink-0" rounded="rounded-[12px]" sizes="64px" />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[color:var(--color-ink)]">
                        <Clock className="h-4 w-4 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
                        {time(s.starts_at, s.listing?.timezone)} - {time(s.ends_at, s.listing?.timezone)}
                      </p>
                      <HubLink to={`/listings/${s.listing?.id}`} className="truncate text-[13.5px] text-[color:var(--color-ink-2)] hover:underline">
                        {s.listing?.unit_label ? `${s.listing.unit_label} · ` : ""}
                        {s.listing?.title}
                      </HubLink>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setAttendees(s)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--color-primary-soft)] px-3 text-[13px] font-semibold text-[color:var(--color-ink)] hover:brightness-95">
                      <Users className="h-4 w-4 text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden />
                      {s.booked} / {s.capacity} booked
                    </button>
                    <Button size="sm" variant="ghost" onClick={() => setMoving(s)}>
                      Move
                    </Button>
                    <Button size="sm" variant="ghost" aria-label="Cancel this time" icon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void cancel(s)} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        ))
      )}
      <OpenTimesDialog open={openNew} onClose={() => setOpenNew(false)} units={units} preselect={preselect} />
      <AttendeesSheet slot={attendees} onClose={() => setAttendees(null)} />
      <MoveSlotDialog slot={moving} onClose={() => setMoving(null)} />
      {slots.length > 0 && (
        <div className="lg:hidden">
          <Button block icon={<Plus className="h-4 w-4" strokeWidth={1.9} />} onClick={() => setOpenNew(true)}>
            Open inspection times
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Inspections() {
  const { role } = useHub();
  const owner = role === "owner";
  const [openNew, setOpenNew] = useState(false);
  return (
    <HubShell title="Inspections">
      <PageHeader
        title="Inspections"
        description={owner ? "Open times for your homes and see who's coming." : "Your booked inspections, with the address and how to get in."}
        actions={
          owner ? (
            <span className="hidden lg:block">
              <Button icon={<Plus className="h-4 w-4" strokeWidth={1.9} />} onClick={() => setOpenNew(true)}>
                Open inspection times
              </Button>
            </span>
          ) : undefined
        }
      />
      {owner ? <OwnerInspections openNew={openNew} setOpenNew={setOpenNew} /> : <RenterInspections />}
    </HubShell>
  );
}
