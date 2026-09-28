import { useState } from "react";
import { ScrollText } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import { EmptyState, ErrorState, RowSkeleton } from "../../../components/hub/ui/Feedback";
import { Select } from "../../../components/hub/ui/Field";
import { PageHeader } from "../../../components/hub/ui/Layout";
import { Avatar } from "../../../components/hub/ui/Media";
import { dateTime, viewerZone } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import type { Person } from "../../../lib/hub/types";

interface Entry {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  admin: Person | null;
}

const ACTIONS: Record<string, string> = {
  finalise_application: "Finalised an application",
  request_application_corrections: "Asked a renter for corrections",
  stop_application: "Stopped an application",
  view_as_start: "Started viewing as a customer",
  view_as_end: "Stopped viewing as a customer",
  assign_report: "Took a report",
  resolve_report: "Resolved a report",
  dismiss_report: "Dismissed a report",
};

const humanise = (a: string) => ACTIONS[a] ?? a.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** Every consequential admin action, who took it, and why. Read-only. */
export default function AdminAuditPage() {
  const [type, setType] = useState("");
  const { data, error, loading, refetch } = useHubQuery<{ entries: Entry[] }>(`/hub/admin/audit?limit=200${type ? `&target_type=${type}` : ""}`);

  return (
    <HubShell title="Audit log">
      <PageHeader
        title="Audit log"
        description="Final reviews, report decisions and every time someone viewed a customer's account. Entries can't be edited or removed."
        actions={
          <>
            <label htmlFor="audit-type" className="sr-only">
              Show
            </label>
            <Select id="audit-type" value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-auto">
              <option value="">Everything</option>
              <option value="application">Applications</option>
              <option value="report">Reports</option>
              <option value="user">Viewing as a customer</option>
              <option value="listing">Listings</option>
            </Select>
          </>
        }
      />
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <RowSkeleton rows={6} />
      ) : data.entries.length === 0 ? (
        <EmptyState icon={<ScrollText className="h-6 w-6" strokeWidth={1.75} />} title="Nothing recorded" body="Admin actions appear here as they happen." />
      ) : (
        <ol className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
          {data.entries.map((e) => (
            <li key={e.id} className="flex gap-4 border-t border-[var(--color-line)] px-4 py-3.5 first:border-0 sm:px-5">
              <Avatar name={e.admin?.name} src={e.admin?.avatar_url} size={32} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-[14.5px] text-[color:var(--color-ink)]">
                  <span className="font-semibold">{e.admin?.name ?? "An admin"}</span> · {humanise(e.action)}
                </p>
                <p className="text-[12.5px] text-[color:var(--color-ink-3)]">
                  {dateTime(e.created_at, viewerZone())}
                  {e.target_type ? ` · ${e.target_type} ${e.target_id?.slice(0, 8) ?? ""}` : ""}
                </p>
                {e.reason && <p className="mt-1 text-[13.5px] leading-snug text-[color:var(--color-ink-2)]">&ldquo;{e.reason}&rdquo;</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </HubShell>
  );
}
