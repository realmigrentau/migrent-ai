import { CalendarClock, ChevronRight, FileText } from "lucide-react";
import HubLink from "../HubLink";
import { StatusBadge } from "../ui/Feedback";
import { HomeImage } from "../ui/Media";
import { weekly } from "../../../lib/hub/format";
import type { ListingCard } from "../../../lib/hub/types";

/** One listing (a room or the whole place) in an owner's portfolio. */
export default function UnitRow({ u, fallbackLabel }: { u: ListingCard; fallbackLabel?: string }) {
  return (
    <HubLink to={`/listings/${u.id}`} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--color-surface-hover)] sm:px-5">
      <HomeImage src={u.image} alt="" className="h-14 w-20 shrink-0" rounded="rounded-[12px]" sizes="80px" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">{u.unit_label || fallbackLabel || u.title}</p>
        <p className="truncate text-[13px] text-[color:var(--color-ink-3)]">
          {u.unit_label ? `${u.title} · ` : ""}
          {weekly(u.weekly_price)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[12.5px] text-[color:var(--color-ink-3)] sm:hidden">
          {u.status && (
            <StatusBadge tone={u.status.tone} icon={false}>
              {u.status.label}
            </StatusBadge>
          )}
        </div>
      </div>
      <div className="hidden items-center gap-4 sm:flex">
        {(u.pending_applications ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--color-primary)]">
            <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {u.pending_applications} to review
          </span>
        )}
        {(u.upcoming_inspections ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--color-ink-2)]">
            <CalendarClock className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {u.upcoming_inspections} open time{u.upcoming_inspections === 1 ? "" : "s"}
          </span>
        )}
        {u.status && (
          <StatusBadge tone={u.status.tone} icon={false}>
            {u.status.label}
          </StatusBadge>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-ink-4)]" strokeWidth={2} aria-hidden />
    </HubLink>
  );
}
