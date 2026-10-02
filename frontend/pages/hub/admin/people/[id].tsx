import { useState } from "react";
import { useRouter } from "next/router";
import { Ban, Flag, Home, RotateCcw, ShieldCheck } from "lucide-react";
import AdminPanelShell from "../../../../components/hub/admin/AdminPanel";
import SuspendDialog from "../../../../components/hub/admin/SuspendDialog";
import HubLink from "../../../../components/hub/HubLink";
import { Button } from "../../../../components/hub/ui/Button";
import { EmptyState, ErrorState, RowSkeleton, StatusBadge } from "../../../../components/hub/ui/Feedback";
import { Fact, PageHeader, Panel, Section } from "../../../../components/hub/ui/Layout";
import { Avatar } from "../../../../components/hub/ui/Media";
import { AUDIT_ACTIONS } from "../../../../lib/hub/admin";
import { day, relative } from "../../../../lib/hub/format";
import { useHubQuery } from "../../../../lib/hub/query";
import { useHub } from "../../../../lib/hub/session";
import type { Person } from "../../../../lib/hub/types";

interface PersonDetail {
  person: { id: string; name: string; email: string | null; role: string | null; member_since: string; suspended: boolean; is_admin: boolean; owner_kind: string | null; agency_name: string | null; agency_licence: string | null };
  id_check: { id_status: string | null; id_document_type: string | null; id_reviewed_at: string | null; id_rejection_reason: string | null; email_verified: boolean | null; phone_verified: boolean | null } | null;
  mentor: { id: string; status: string; active: boolean } | null;
  listings: { id: string; title: string | null; suburb: string | null; postcode: number | null; weekly_price: number | null; moderation_status: string; created_at: string }[];
  activity: { applications_sent: number; applications_received: number; tenancies_as_renter: number; tenancies_as_owner: number; blocked_by: number };
  reports_about: { id: string; item_type: string; item_id: string; reason: string; status: string; source?: string; created_at: string }[];
  reports_by: { id: string; item_type: string; item_id: string; reason: string; status: string; created_at: string }[];
  history: { id: string; action: string; target_type: string; target_id: string; reason: string | null; created_at: string; admin: Person | null }[];
}

const LISTING_TONE: Record<string, "success" | "warning" | "danger" | "neutral" | "info"> = {
  approved: "success",
  pending_approval: "warning",
  flagged: "danger",
  hidden: "danger",
  paused: "neutral",
  draft: "neutral",
};
const ID_COPY: Record<string, string> = { approved: "Checked", pending: "Waiting for review", rejected: "Rejected", not_submitted: "Not sent yet" };

/**
 * One person, for an admin (MIGRENT_MASTER_AUDIT MIG-024): who they are,
 * their ID check, their listings, what they have done, reports about them
 * and by them, and every admin action taken on them.
 */
function PersonContent() {
  const router = useRouter();
  const { me } = useHub();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const { data, error, loading, refetch } = useHubQuery<PersonDetail>(id ? `/hub/admin/users/${id}` : null);
  const [suspending, setSuspending] = useState(false);

  if (error) return error.status === 404 ? <EmptyState title="Person not found" /> : <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (loading || !data) return <RowSkeleton rows={5} />;
  const p = data.person;
  const c = data.id_check;

  return (
    <>
      <PageHeader
        title={p.name}
        back={{ to: "/admin/people", label: "People" }}
        description={`${p.email ?? "no email"} · ${p.role ?? "no role"} · joined ${day(p.member_since)}`}
        actions={
          !p.is_admin && p.id !== me?.id ? (
            <Button
              variant={p.suspended ? "secondary" : "danger"}
              icon={p.suspended ? <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> : <Ban className="h-4 w-4" strokeWidth={1.75} />}
              onClick={() => setSuspending(true)}
            >
              {p.suspended ? "Reinstate" : "Suspend"}
            </Button>
          ) : undefined
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Avatar name={p.name} size={44} />
        {p.suspended && <StatusBadge tone="danger">Suspended</StatusBadge>}
        {p.is_admin && (
          <StatusBadge tone="neutral" icon={false}>
            Admin
          </StatusBadge>
        )}
        {p.owner_kind === "property_manager" && (
          <StatusBadge tone="info" icon={false}>
            Property manager{p.agency_name ? `: ${p.agency_name}` : ""}
            {p.agency_licence ? ` (licence ${p.agency_licence})` : ""}
          </StatusBadge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Section title={`Listings (${data.listings.length})`}>
            {data.listings.length === 0 ? (
              <p className="text-[14px] text-[color:var(--color-ink-3)]">No listings.</p>
            ) : (
              <ul className="flex flex-col overflow-hidden rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)]">
                {data.listings.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 border-t border-[var(--color-line)] px-4 py-3 first:border-0">
                    <Home className="h-4 w-4 shrink-0 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
                    <HubLink to={`/admin/listings?queue=all&listing=${l.id}`} className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-[color:var(--color-ink)] hover:underline">
                      {l.title || "Untitled"}
                      <span className="ml-2 font-normal text-[color:var(--color-ink-3)]">
                        {[l.suburb, l.postcode].filter(Boolean).join(" ")}
                      </span>
                    </HubLink>
                    <StatusBadge tone={LISTING_TONE[l.moderation_status] ?? "neutral"} icon={false}>
                      {l.moderation_status.replace(/_/g, " ")}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Reports about them (${data.reports_about.length})`} description="About them, their listings, or messages they sent.">
            {data.reports_about.length === 0 ? (
              <p className="text-[14px] text-[color:var(--color-ink-3)]">None.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.reports_about.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-[14px]">
                    <Flag className="h-4 w-4 shrink-0 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-[color:var(--color-ink)]">
                      {r.reason} <span className="text-[color:var(--color-ink-3)]">· {r.item_type}{r.source === "system" ? " · scam check" : ""} · {relative(r.created_at)}</span>
                    </span>
                    <StatusBadge tone={r.status === "pending" || r.status === "reviewing" ? "warning" : "neutral"} icon={false}>
                      {r.status}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
            <HubLink to="/admin/reports" className="text-[13.5px] font-semibold text-[color:var(--color-primary)] hover:underline">
              Open the Reports queue
            </HubLink>
          </Section>

          <Section title="Admin history" description="Every admin action on this person and their listings.">
            {data.history.length === 0 ? (
              <p className="text-[14px] text-[color:var(--color-ink-3)]">None yet.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {data.history.map((h) => (
                  <li key={h.id} className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-[14px]">
                    <p className="text-[color:var(--color-ink)]">
                      {AUDIT_ACTIONS[h.action] ?? h.action}
                      <span className="text-[color:var(--color-ink-3)]">
                        {h.admin ? ` by ${h.admin.name}` : ""} · {relative(h.created_at)}
                      </span>
                    </p>
                    {h.reason && <p className="mt-0.5 text-[13.5px] text-[color:var(--color-ink-2)]">{h.reason}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Section>
        </div>

        <aside className="flex flex-col gap-5">
          <Panel>
            <p className="flex items-center gap-2 text-[15px] font-semibold text-[color:var(--color-ink)]">
              <ShieldCheck className="h-4 w-4 text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden /> ID check
            </p>
            <dl className="mt-3 grid grid-cols-1 gap-3">
              <Fact label="Status" value={ID_COPY[c?.id_status ?? "not_submitted"] ?? c?.id_status ?? "Not sent yet"} />
              {c?.id_document_type && <Fact label="Document" value={c.id_document_type} />}
              {c?.id_reviewed_at && <Fact label="Decided" value={day(c.id_reviewed_at)} />}
              {c?.id_rejection_reason && <Fact label="Reason given" value={c.id_rejection_reason} />}
              <Fact label="Email confirmed" value={c?.email_verified ? "Yes" : "No"} />
            </dl>
            {c?.id_status === "pending" && (
              <HubLink to="/admin/id-checks" className="mt-3 inline-block text-[13.5px] font-semibold text-[color:var(--color-primary)] hover:underline">
                Review it in ID checks
              </HubLink>
            )}
          </Panel>
          <Panel>
            <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">Activity</p>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <Fact label="Applications sent" value={data.activity.applications_sent} />
              <Fact label="Applications received" value={data.activity.applications_received} />
              <Fact label="Tenancies as renter" value={data.activity.tenancies_as_renter} />
              <Fact label="Tenancies as owner" value={data.activity.tenancies_as_owner} />
              <Fact label="Reports they made" value={data.reports_by.length} />
              <Fact label="People who blocked them" value={data.activity.blocked_by} />
            </dl>
          </Panel>
          {data.mentor && (
            <Panel>
              <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">Mentor</p>
              <p className="mt-2 text-[14px] text-[color:var(--color-ink-2)]">
                {data.mentor.status}
                {data.mentor.active ? "" : " (inactive)"} ·{" "}
                <HubLink to="/admin/mentors" className="font-semibold text-[color:var(--color-primary)] hover:underline">
                  Mentors
                </HubLink>
              </p>
            </Panel>
          )}
        </aside>
      </div>

      <SuspendDialog account={suspending ? { id: p.id, name: p.name, suspended: p.suspended } : null} onClose={() => setSuspending(false)} onDone={() => void refetch()} />
    </>
  );
}

export default function AdminPersonPage() {
  return (
    <AdminPanelShell title="Person">
      <PersonContent />
    </AdminPanelShell>
  );
}
