import Link from "next/link";
import type { Ticket } from "../../lib/api";

const statusColors: Record<string, string> = {
  open: "bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-blue-900/30 dark:text-[var(--color-primary)]",
  pending_customer: "bg-[var(--color-warn-50)] text-[var(--color-warn-600)] dark:bg-amber-900/30 dark:text-[var(--color-warn-500)]",
  pending_internal: "bg-[var(--color-primary-soft)] text-primary-700 dark:bg-primary-900/30 dark:text-[var(--color-primary)]",
  resolved: "bg-[var(--color-accent-50)] text-[var(--color-accent-700)] dark:bg-green-900/30 dark:text-[var(--color-accent)]",
  closed: "bg-[var(--color-surface-muted)] text-[var(--color-ink-3)] dark:bg-[var(--color-surface-muted)] dark:text-[var(--color-ink-3)]",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  pending_customer: "Awaiting Reply",
  pending_internal: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const priorityDots: Record<string, string> = {
  low: "bg-slate-400",
  normal: "bg-blue-400",
  high: "bg-[var(--color-warn-500)]",
  urgent: "bg-[var(--color-danger-500)]",
};

interface Props {
  tickets: Ticket[];
  basePath?: string;  // "/support/tickets" or "/support/agent"
}

export default function TicketList({ tickets, basePath = "/support/tickets" }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-12 h-12 text-[var(--color-ink-4)] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-[var(--color-ink-3)] text-sm">No tickets yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map((t) => (
        <Link key={t.id} href={`${basePath}/${t.id}`}>
          <div className="p-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] hover:border-[var(--color-primary-soft)] dark:hover:border-rose-800 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${priorityDots[t.priority] || priorityDots.normal}`} />
                  <h3 className="font-medium text-sm text-[var(--color-ink)] truncate">{t.subject}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-ink-3)]">
                  <span className="font-mono">{t.id.slice(0, 8)}</span>
                  <span>{t.category?.replace("_", " ")}</span>
                  <span>{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status] || statusColors.open}`}>
                {statusLabels[t.status] || t.status}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
