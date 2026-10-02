import { useEffect, useState } from "react";
import { Ban, Eye, RotateCcw, Search, Users } from "lucide-react";
import AdminPanelShell from "../../../components/hub/admin/AdminPanel";
import SuspendDialog from "../../../components/hub/admin/SuspendDialog";
import HubLink from "../../../components/hub/HubLink";
import { useHubNavigate } from "../../../components/hub/HubLink";
import { Button } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Field, Select, Textarea } from "../../../components/hub/ui/Field";
import { PageHeader } from "../../../components/hub/ui/Layout";
import { Avatar } from "../../../components/hub/ui/Media";
import { Dialog } from "../../../components/hub/ui/Overlay";
import { useToast } from "../../../components/ui/Toast";
import { HubError } from "../../../lib/hub/api";
import { day } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import { useHub } from "../../../lib/hub/session";

interface Account {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  member_since: string;
  suspended: boolean;
  is_admin: boolean;
  id_status?: string | null;
}

const ID_LABEL: Record<string, string> = { approved: "ID checked", pending: "ID waiting", rejected: "ID rejected", not_submitted: "No ID yet" };
const PAGE = 50;

function sinceIso(days: number) {
  const d = new Date(Date.now() - days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/** Find an account, and (with a recorded reason) see Migrent Hub as they do, read-only. */
function AdminPeopleContent() {
  const { me, startViewAs } = useHub();
  const navigate = useHubNavigate();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [needle, setNeedle] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [idStatus, setIdStatus] = useState("");
  const [joined, setJoined] = useState("");
  const [offset, setOffset] = useState(0);
  const [viewing, setViewing] = useState<Account | null>(null);
  const [suspending, setSuspending] = useState<Account | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setNeedle(q.trim());
      setOffset(0);
    }, 300);
    return () => window.clearTimeout(t);
  }, [q]);

  // Everyone, newest first; the search and filters narrow it (MIG-024).
  const params = new URLSearchParams();
  if (needle.length >= 2) params.set("q", needle);
  if (role) params.set("role", role);
  if (status) params.set("suspended", status === "suspended" ? "true" : "false");
  if (idStatus) params.set("id_status", idStatus);
  if (joined) params.set("joined_after", sinceIso(Number(joined)));
  if (offset) params.set("offset", String(offset));
  const { data, error, loading, refetch } = useHubQuery<{ users: Account[]; total: number; has_more: boolean }>(`/hub/admin/users?${params}`);
  const filter = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    set(e.target.value);
    setOffset(0);
  };

  async function start() {
    if (!viewing) return;
    setBusy(true);
    try {
      await startViewAs({ id: viewing.id, name: viewing.name }, reason.trim());
      void navigate("/");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't start.");
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="People" description="Everyone on Migrent, newest first. Open a person to see their listings, reports and history; see Migrent Hub as they do, or suspend an account that is breaking the rules. Both need a reason, which goes in the audit log." />
      <div className="relative mb-4 max-w-[520px]">
        <label htmlFor="people-q" className="sr-only">
          Search by name or email
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-ink-3)]" strokeWidth={1.9} aria-hidden />
        <input
          id="people-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name or email"
          autoComplete="off"
          className="h-12 w-full rounded-full border border-[var(--color-line-2)] bg-[var(--color-surface)] pl-11 pr-4 text-[15px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label="Filter people">
        <Select aria-label="Role" value={role} onChange={filter(setRole)}>
          <option value="">Everyone</option>
          <option value="renter">Renters</option>
          <option value="owner">Owners</option>
          <option value="admin">Admins</option>
        </Select>
        <Select aria-label="Account status" value={status} onChange={filter(setStatus)}>
          <option value="">Active and suspended</option>
          <option value="active">Active accounts</option>
          <option value="suspended">Suspended accounts</option>
        </Select>
        <Select aria-label="ID check" value={idStatus} onChange={filter(setIdStatus)}>
          <option value="">Any ID check</option>
          <option value="approved">ID checked</option>
          <option value="pending">ID waiting</option>
          <option value="rejected">ID rejected</option>
        </Select>
        <Select aria-label="Joined" value={joined} onChange={filter(setJoined)}>
          <option value="">Joined any time</option>
          <option value="7">Joined in the last 7 days</option>
          <option value="30">Joined in the last 30 days</option>
        </Select>
      </div>
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <RowSkeleton rows={4} />
      ) : data.users.length === 0 ? (
        <EmptyState compact icon={<Users className="h-6 w-6" strokeWidth={1.75} />} title="No one found" body="Check the spelling, try part of their email address, or loosen the filters." />
      ) : (
        <>
        <p className="mb-3 text-[13px] text-[color:var(--color-ink-3)]" role="status">
          {data.total === 1 ? "1 person" : `${data.total} people`}
          {data.total > PAGE ? `, showing ${offset + 1} to ${offset + data.users.length}` : ""}
        </p>
        <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
          {data.users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-4 border-t border-[var(--color-line)] px-4 py-3.5 first:border-0 sm:px-5">
              <Avatar name={u.name} size={40} />
              <div className="min-w-0 flex-1">
                <HubLink to={`/admin/people/${u.id}`} className="block truncate text-[15px] font-semibold text-[color:var(--color-ink)] hover:underline">
                  {u.name}
                </HubLink>
                <p className="truncate text-[13px] text-[color:var(--color-ink-3)]">
                  {u.email ?? "no email"} · {u.role ?? "no role"} · since {day(u.member_since)}
                </p>
              </div>
              {u.id_status && u.id_status !== "not_submitted" && (
                <StatusBadge tone={u.id_status === "approved" ? "info" : u.id_status === "rejected" ? "danger" : "warning"} icon={false}>
                  {ID_LABEL[u.id_status] ?? u.id_status}
                </StatusBadge>
              )}
              {u.suspended && <StatusBadge tone="danger">Suspended</StatusBadge>}
              {u.is_admin && (
                <StatusBadge tone="neutral" icon={false}>
                  Admin
                </StatusBadge>
              )}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={<Eye className="h-4 w-4" strokeWidth={1.75} />} disabled={u.id === me?.id} onClick={() => setViewing(u)}>
                  View as
                </Button>
                {!u.is_admin && u.id !== me?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={u.suspended ? <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> : <Ban className="h-4 w-4" strokeWidth={1.75} />}
                    className={u.suspended ? undefined : "text-[color:var(--color-danger-500)]"}
                    onClick={() => setSuspending(u)}
                  >
                    {u.suspended ? "Reinstate" : "Suspend"}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {(offset > 0 || data.has_more) && (
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={!data.has_more} onClick={() => setOffset(offset + PAGE)}>
              Next
            </Button>
          </div>
        )}
        </>
      )}
      <p className="mt-6 text-[13.5px] text-[color:var(--color-ink-3)]">Admin accounts are changed in the database, never from here.</p>
      <SuspendDialog account={suspending} onClose={() => setSuspending(null)} />

      <Dialog
        open={!!viewing}
        onClose={() => {
          setViewing(null);
          setReason("");
        }}
        title={viewing ? `View Migrent Hub as ${viewing.name}` : "View as"}
        description="You'll see exactly what they see, read-only: nothing can be sent, saved or changed. It ends when you stop, sign out or after an hour."
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewing(null)}>
              Cancel
            </Button>
            <Button loading={busy} disabled={reason.trim().length < 5} icon={<Eye className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void start()}>
              Start viewing
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <InlineAlert tone="warning">The reason and the time are recorded in the audit log, and other admins can see it.</InlineAlert>
          <Field label="Why do you need to?" hint="e.g. Support ticket 1234: renter can't see their inspection.">
            {({ id, describedBy }) => <Textarea id={id} rows={3} value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} aria-describedby={describedBy} autoFocus />}
          </Field>
        </div>
      </Dialog>
    </>
  );
}

/** Inside the Admin panel: nothing here loads until the admin password is entered. */
export default function AdminPeoplePage() {
  return (
    <AdminPanelShell title="People">
      <AdminPeopleContent />
    </AdminPanelShell>
  );
}
