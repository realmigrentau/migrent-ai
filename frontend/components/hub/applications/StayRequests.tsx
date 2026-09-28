import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { hubApi, HubError } from "../../../lib/hub/api";
import { aud, day } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import { useHub } from "../../../lib/hub/session";
import { useConfirm } from "../../ui/ConfirmDialog";
import { useToast } from "../../ui/Toast";
import { Button } from "../ui/Button";
import { InlineAlert, StatusBadge } from "../ui/Feedback";
import { HomeImage } from "../ui/Media";
import { Section } from "../ui/Layout";

interface Booking {
  id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_price: number;
  message_to_owner: string | null;
  listing?: { id: string; title: string | null; city: string | null; images: string[] | null };
  other_party?: { name: string | null };
  created_at: string;
}

const COPY: Record<string, { label: string; tone: "info" | "success" | "neutral" | "warning" | "danger" }> = {
  PENDING_OWNER: { label: "Waiting for the owner", tone: "info" },
  OWNER_ACCEPTED: { label: "Accepted", tone: "success" },
  PAID: { label: "Confirmed", tone: "success" },
  COMPLETED: { label: "Completed", tone: "neutral" },
  OWNER_DECLINED: { label: "Declined", tone: "neutral" },
  SEEKER_CANCELLED: { label: "Cancelled", tone: "neutral" },
  EXPIRED: { label: "Expired", tone: "neutral" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
};

/**
 * Short-stay requests from the existing request-to-book flow
 * (routes_bookings.py). Longer tenancies go through applications; stays
 * with fixed dates still work exactly as before, and are shown here so
 * nothing from the old dashboard disappears. Hidden when there are none.
 */
export default function StayRequests() {
  const { role, me } = useHub();
  const toast = useToast();
  const confirm = useConfirm();
  const side = role === "owner" ? "owner" : "seeker";
  const { data, refetch } = useHubQuery<{ bookings: Booking[] }>(`/bookings/me?role=${side}`);
  const [pending, setPending] = useState<string | null>(null);
  const bookings = data?.bookings ?? [];
  if (!bookings.length) return null;

  async function respond(b: Booking, action: "accept" | "decline") {
    if (action === "accept") {
      const ok = await confirm({
        title: "Accept this stay?",
        description: `Migrent's host fee (AUD ${me?.features.fees.host_fee ?? 99}, once per property) is charged when you accept a first stay on a property.${me?.features.payments === "test" ? " Payments are in test mode: no real money is taken." : ""}`,
        confirmLabel: "Accept",
      });
      if (!ok) return;
    }
    setPending(b.id);
    try {
      const res = await hubApi.post<{ checkout_url?: string | null }>(`/bookings/${b.id}/respond`, { action });
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
      toast.success(action === "accept" ? "Stay accepted" : "Stay declined");
      void refetch();
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That did not go through.");
    } finally {
      setPending(null);
    }
  }

  async function cancel(b: Booking) {
    const ok = await confirm({ title: "Cancel this request?", description: "The owner will be told.", confirmLabel: "Cancel request", tone: "danger" });
    if (!ok) return;
    setPending(b.id);
    try {
      await hubApi.post(`/bookings/${b.id}/cancel`);
      toast.info("Request cancelled");
      void refetch();
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That did not go through.");
    } finally {
      setPending(null);
    }
  }

  return (
    <Section title="Short stays" description="Requests with fixed dates, from the request-to-book flow.">
      {me?.features.payments === "test" && role === "owner" && <InlineAlert tone="neutral">Payments are in test mode. Accepting takes you to a test checkout; no real money is charged.</InlineAlert>}
      <ul className="flex flex-col gap-3">
        {bookings.map((b) => {
          const c = COPY[b.status] ?? { label: b.status.toLowerCase(), tone: "neutral" as const };
          return (
            <li key={b.id} className="flex flex-col gap-4 rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center">
              <HomeImage src={b.listing?.images?.[0]} alt="" className="h-16 w-20 shrink-0" rounded="rounded-[14px]" sizes="96px" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">{b.listing?.title ?? "Stay"}</p>
                <p className="inline-flex items-center gap-1.5 text-[13.5px] text-[color:var(--color-ink-2)]">
                  <CalendarRange className="h-4 w-4 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
                  {day(b.check_in_date, { year: false })} to {day(b.check_out_date)} · {b.guests} guest{b.guests === 1 ? "" : "s"} · {aud(b.total_price)}
                </p>
                {role === "owner" && b.other_party?.name && <p className="text-[13px] text-[color:var(--color-ink-3)]">From {b.other_party.name}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={c.tone}>{c.label}</StatusBadge>
                {role === "owner" && b.status === "PENDING_OWNER" && (
                  <>
                    <Button size="sm" variant="ghost" loading={pending === b.id} onClick={() => void respond(b, "decline")}>
                      Decline
                    </Button>
                    <Button size="sm" loading={pending === b.id} onClick={() => void respond(b, "accept")}>
                      Accept
                    </Button>
                  </>
                )}
                {role !== "owner" && ["PENDING_OWNER", "OWNER_ACCEPTED"].includes(b.status) && (
                  <Button size="sm" variant="ghost" loading={pending === b.id} onClick={() => void cancel(b)}>
                    Cancel
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
