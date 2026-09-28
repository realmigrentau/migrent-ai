import { Check, Circle, Clock3, X } from "lucide-react";
import { cn } from "../../../lib/cn";
import { dateTime, relative } from "../../../lib/hub/format";
import { APPLICATION_STEPS, applicationStepIndex, isClosed } from "../../../lib/hub/status";
import type { ApplicationEvent, ApplicationStatus } from "../../../lib/hub/types";

/** The journey at a glance: sent, owner review, approved, Migrent review, finalised. */
export function ApplicationProgress({ status }: { status: ApplicationStatus }) {
  const idx = applicationStepIndex(status);
  const closed = isClosed(status);
  return (
    <ol className="grid grid-cols-5 gap-1.5" aria-label="Application progress">
      {APPLICATION_STEPS.map((s, i) => {
        const done = !closed && i < idx;
        const current = !closed && i === idx;
        return (
          <li key={s.key} className="flex flex-col gap-2" aria-current={current ? "step" : undefined}>
            <span
              className={cn(
                "h-1.5 rounded-full transition-colors duration-500",
                closed ? "bg-[var(--color-line-2)]" : done || current ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-muted)]",
                current && status !== "finalised" && "animate-pulse",
              )}
              aria-hidden
            />
            <span className={cn("text-[12px] font-semibold leading-tight", current ? "text-[color:var(--color-ink)]" : done ? "text-[color:var(--color-ink-2)]" : "text-[color:var(--color-ink-4)]")}>
              {s.label}
              {done && <span className="sr-only"> (done)</span>}
              {current && <span className="sr-only"> (current)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const ICON: Record<string, typeof Check> = {
  declined: X,
  withdrawn: X,
  not_proceeding: X,
  migrent_review_started: Clock3,
  viewed: Circle,
};

/** Every step in plain words, newest last. Owner-only notes are marked. */
export default function ApplicationTimeline({ events, viewer }: { events: ApplicationEvent[]; viewer: "renter" | "owner" | "admin" }) {
  return (
    <ol className="relative flex flex-col gap-0">
      {events.map((e, i) => {
        const Icon = ICON[e.event] ?? Check;
        const negative = ["declined", "withdrawn", "not_proceeding"].includes(e.event);
        const last = i === events.length - 1;
        const who = e.actor_role === "renter" ? (viewer === "renter" ? "You" : "Applicant") : e.actor_role === "owner" ? (viewer === "owner" ? "You" : "Owner") : e.actor_role === "admin" ? "Migrent" : null;
        return (
          <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && <span aria-hidden className="absolute left-[13px] top-7 h-[calc(100%-20px)] w-px bg-[var(--color-line)]" />}
            <span
              aria-hidden
              className={cn(
                "relative z-[1] mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                negative ? "bg-[var(--color-surface-muted)] text-[color:var(--color-ink-3)]" : last ? "bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]" : "bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]",
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[14.5px] font-semibold text-[color:var(--color-ink)]">{e.label}</p>
              <p className="text-[12.5px] text-[color:var(--color-ink-3)]">
                <time dateTime={e.created_at} title={dateTime(e.created_at)}>
                  {relative(e.created_at)}
                </time>
                {who ? ` · ${who}` : ""}
              </p>
              {e.note && (
                <p className="mt-1 rounded-[12px] bg-[var(--color-surface-muted)] px-3.5 py-2.5 text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">
                  {e.note}
                  {viewer !== "renter" && e.event === "declined" && <span className="mt-1 block text-[12px] text-[color:var(--color-ink-4)]">Only you can see this note.</span>}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
