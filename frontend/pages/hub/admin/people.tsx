import { useEffect, useState } from "react";
import { Ban, Eye, RotateCcw, Search, Users } from "lucide-react";
import AdminPanelShell from "../../../components/hub/admin/AdminPanel";
import { useHubNavigate } from "../../../components/hub/HubLink";
import { Button } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Field, Textarea } from "../../../components/hub/ui/Field";
import { PageHeader } from "../../../components/hub/ui/Layout";
import { Avatar } from "../../../components/hub/ui/Media";
import { Dialog } from "../../../components/hub/ui/Overlay";
import { useToast } from "../../../components/ui/Toast";
import { hubApi, HubError } from "../../../lib/hub/api";
import { day } from "../../../lib/hub/format";
import { invalidate, useHubQuery } from "../../../lib/hub/query";
import { useHub } from "../../../lib/hub/session";

interface Account {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  member_since: string;
  suspended: boolean;
  is_admin: boolean;
}

/** Suspend or reinstate an account, with a reason for the audit log. */
function SuspendDialog({ account, onClose }: { account: Account | null; onClose: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const reinstating = Boolean(account?.suspended);

  async function save() {
    if (!account) return;
    setBusy(true);
    try {
      await hubApi.post(`/hub/admin/users/${account.id}/${reinstating ? "unsuspend" : "suspend"}`, { reason: reason.trim() });
      invalidate("/hub/admin/users");
      toast.success(reinstating ? `${account.name} can use Migrent Hub again.` : `${account.name} is suspended.`);
      setReason("");
      onClose();
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={Boolean(account)}
      onClose={() => {
        setReason("");
        onClose();
      }}
      title={account ? (reinstating ? `Reinstate ${account.name}?` : `Suspend ${account.name}?`) : ""}
      description={
        reinstating
          ? "They'll be able to use Migrent Hub again straight away. Any listing you paused stays paused until you unpause it in Listings."
          : "They won't be able to use Migrent Hub until they are reinstated: no messages, applications or listing changes. Nothing is deleted. Their listings stay as they are, so pause any that shouldn't be seen from Listings."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={reinstating ? "primary" : "danger"} loading={busy} disabled={reason.trim().length < 5} onClick={() => void save()}>
            {reinstating ? "Reinstate" : "Suspend account"}
          </Button>
        </>
      }
    >
      <Field label="Why?" hint={reinstating ? "e.g. Appeal accepted after a phone call." : "e.g. Asked renters to pay a deposit outside Migrent (report 3f2a)."}>
        {({ id, describedBy }) => <Textarea id={id} rows={3} value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} aria-describedby={describedBy} autoFocus />}
      </Field>
      <p className="mt-3 text-[13px] text-[color:var(--color-ink-3)]">The reason and the time are recorded in the audit log.</p>
    </Dialog>
  );
}

/** Find an account, and (with a recorded reason) see Migrent Hub as they do, read-only. */
function AdminPeopleContent() {
  const { me, startViewAs } = useHub();
  const navigate = useHubNavigate();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [needle, setNeedle] = useState("");
  const [viewing, setViewing] = useState<Account | null>(null);
  const [suspending, setSuspending] = useState<Account | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setNeedle(q.trim()), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const { data, error, loading, refetch } = useHubQuery<{ users: Account[] }>(needle.length >= 2 ? `/hub/admin/users?q=${encodeURIComponent(needle)}` : null);

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
      <PageHeader title="People" description="Find a customer to help them: see Migrent Hub as they do, or suspend an account that is breaking the rules. Both need a reason, which goes in the audit log." />
      <div className="relative mb-6 max-w-[520px]">
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
      {needle.length < 2 ? (
        <EmptyState icon={<Users className="h-6 w-6" strokeWidth={1.75} />} title="Search for an account" body="Type at least two letters of a name or email address." />
      ) : error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <RowSkeleton rows={4} />
      ) : data.users.length === 0 ? (
        <EmptyState compact title="No one found" body="Check the spelling, or try part of their email address." />
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
          {data.users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-4 border-t border-[var(--color-line)] px-4 py-3.5 first:border-0 sm:px-5">
              <Avatar name={u.name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">{u.name}</p>
                <p className="truncate text-[13px] text-[color:var(--color-ink-3)]">
                  {u.email ?? "no email"} · {u.role ?? "no role"} · since {day(u.member_since)}
                </p>
              </div>
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
