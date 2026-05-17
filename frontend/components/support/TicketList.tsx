import Link from "next/link";
import type { Ticket } from "../../lib/api";

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending_customer: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pending_internal: "bg-[var(--color-primary-soft)] text-primary-700 dark:bg-primary-900/30 dark:text-[var(--color-primary)]",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
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
  high: "bg-amber-500",
  urgent: "bg-red-500",
};

interface Props {
  tickets: Ticket[];
  basePath?: string;  // "/support/tickets" or "/support/agent"
}

export default function TicketList({ tickets, basePath = "/support/tickets" }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-slate-500 text-sm">No tickets yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map((t) => (
        <Link key={t.id} href={`${basePath}/${t.id}`}>
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[var(--color-primary-soft)] dark:hover:border-rose-800 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${priorityDots[t.priority] || priorityDots.normal}`} />
                  <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">{t.subject}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
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
