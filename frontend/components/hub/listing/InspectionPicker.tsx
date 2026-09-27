import { useState } from "react";
import { CalendarCheck, CalendarDays, CalendarPlus, Clock, Users } from "lucide-react";
import { cn } from "../../../lib/cn";
import { dateTime, inspectionIcs, time, whenLabel } from "../../../lib/hub/format";
import { hubApi, HubError } from "../../../lib/hub/api";
import { invalidate, useHubQuery } from "../../../lib/hub/query";
import type { InspectionBooking, InspectionSlot } from "../../../lib/hub/types";
import { useToast } from "../../ui/Toast";
import { useConfirm } from "../../ui/ConfirmDialog";
import { Button } from "../ui/Button";
import { EmptyState, InlineAlert, Skeleton } from "../ui/Feedback";

interface SlotsResponse {
  timezone: string;
  slots: InspectionSlot[];
}

export function downloadIcs(booking: { id: string; starts_at: string; ends_at: string; title: string; location?: string | null; instructions?: string | null }) {
  const ics = inspectionIcs({ id: booking.id, title: `Inspection: ${booking.title}`, start: booking.starts_at, end: booking.ends_at, location: booking.location, description: booking.instructions ? `${booking.instructions}\n\nBooked through Migrent Hub.` : "Booked through Migrent Hub." });
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "migrent-inspection.ics";
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Open inspection times for one home, grouped by day, in the home's own
 * time zone. Booking reveals the street address and any instructions.
 */
export default function InspectionPicker({ listingId, title, isOwner }: { listingId: string; title: string; isOwner?: boolean }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { data, error, loading, refetch } = useHubQuery<SlotsResponse>(`/hub/listings/${listingId}/inspection-slots`);
  const [pending, setPending] = useState<string | null>(null);
  const [booked, setBooked] = useState<InspectionBooking | null>(null);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2" aria-busy="true">
        <Skeleton className="h-16 w-40 rounded-[14px]" />
        <Skeleton className="h-16 w-40 rounded-[14px]" />
      </div>
    );
  }
  if (error || !data) return <InlineAlert tone="neutral">Inspection times could not load. <button className="font-semibold underline" onClick={() => void refetch()}>Try again</button></InlineAlert>;

  const mine = data.slots.find((s) => s.my_booking);
  const tz = data.timezone;

  if (!data.slots.length) {
    return (
      <EmptyState
        compact
        icon={<CalendarDays className="h-6 w-6" strokeWidth={1.75} />}
        title={isOwner ? "No inspection times open" : "No inspection times yet"}
        body={isOwner ? "Open a few times and renters can book themselves in." : "Message the owner to ask for a time. You'll be told here when times open."}
      />
    );
  }

  async function book(slot: InspectionSlot) {
    setPending(slot.id);
    try {
      const res = mine?.my_booking
        ? await hubApi.post<{ booking: InspectionBooking }>(`/hub/inspections/bookings/${mine.my_booking.id}/reschedule`, { slot_id: slot.id })
        : await hubApi.post<{ booking: InspectionBooking }>("/hub/inspections/bookings", { slot_id: slot.id });
      setBooked(res.booking);
      invalidate(`/hub/listings/${listingId}/inspection-slots`);
      invalidate("/hub/inspections");
      invalidate("/hub/home");
      toast.success(mine ? "Inspection moved" : "Inspection booked", { description: `${whenLabel(slot.starts_at, tz)}. The address is in your booking.` });
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That time could not be booked.");
      void refetch();
    } finally {
      setPending(null);
    }
  }

  async function cancel() {
    if (!mine?.my_booking) return;
    const ok = await confirm({ title: "Cancel this inspection?", description: "The owner will be told. You can book another time.", confirmLabel: "Cancel inspection", cancelLabel: "Keep it", tone: "danger" });
    if (!ok) return;
    try {
      await hubApi.post(`/hub/inspections/bookings/${mine.my_booking.id}/cancel`);
      setBooked(null);
      invalidate(`/hub/listings/${listingId}/inspection-slots`);
      invalidate("/hub/inspections");
      invalidate("/hub/home");
      toast.info("Inspection cancelled");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That did not cancel. Please try again.");
    }
  }

  // Group by the property's local day.
  const groups = new Map<string, InspectionSlot[]>();
  for (const s of data.slots) {
    const key = new Intl.DateTimeFormat("en-AU", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(new Date(s.starts_at));
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }

  return (
    <div className="flex flex-col gap-5">
      {mine && (
        <div className="flex flex-col gap-3 rounded-[16px] border border-[color:color-mix(in_oklab,var(--color-primary)_30%,transparent)] bg-[var(--color-primary-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden />
            <div>
              <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">You're booked for {whenLabel(mine.starts_at, tz)}</p>
              <p className="text-[13.5px] text-[color:var(--color-ink-2)]">{booked?.listing?.street_address ? `${booked.listing.street_address}, ${booked.listing.display_address}` : "The address and instructions are in your Inspections."}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" icon={<CalendarPlus className="h-4 w-4" strokeWidth={1.9} />} onClick={() => downloadIcs({ id: mine.my_booking!.id, starts_at: mine.starts_at, ends_at: mine.ends_at, title, location: booked?.listing?.street_address, instructions: mine.instructions })}>
              Add to calendar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void cancel()}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      {Array.from(groups.entries()).map(([dayLabel, slots]) => (
        <div key={dayLabel} className="flex flex-col gap-2.5">
          <p className="text-[13.5px] font-semibold text-[color:var(--color-ink-2)]">{dayLabel}</p>
          <div className="flex flex-wrap gap-2.5">
            {slots.map((s) => {
              const isMine = Boolean(s.my_booking);
              const full = s.spaces_left <= 0 && !isMine;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={full || isMine || isOwner || pending !== null}
                  onClick={() => void book(s)}
                  aria-label={`${dateTime(s.starts_at, tz)}${full ? ", full" : isMine ? ", you're booked" : `, ${s.spaces_left} places left`}`}
                  className={cn(
                    "hub-press flex min-w-[148px] flex-col items-start gap-1 rounded-[14px] border px-4 py-3 text-left transition-colors",
                    isMine
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : full
                        ? "border-[var(--color-line)] opacity-55"
                        : "border-[var(--color-line-2)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]",
                    "disabled:cursor-default",
                  )}
                >
                  <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[color:var(--color-ink)]">
                    <Clock className="h-3.5 w-3.5 text-[color:var(--color-ink-3)]" strokeWidth={1.9} aria-hidden />
                    {time(s.starts_at, tz)} - {time(s.ends_at, tz)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12.5px] text-[color:var(--color-ink-3)]">
                    <Users className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                    {isMine ? "You're booked" : full ? "Full" : `${s.spaces_left} place${s.spaces_left === 1 ? "" : "s"} left`}
                  </span>
                  {pending === s.id && <span className="text-[12px] font-semibold text-[color:var(--color-primary)]">Booking...</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!isOwner && <p className="text-[13px] text-[color:var(--color-ink-3)]">{mine ? "Choosing another time moves your booking." : "Times are shown in the property's local time."} Booking shares the street address with you.</p>}
    </div>
  );
}
