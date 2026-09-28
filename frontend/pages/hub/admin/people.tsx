import { useEffect, useState } from "react";
import { Eye, Search, Users } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import { useHubNavigate } from "../../../components/hub/HubLink";
import { Button } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Field, Textarea } from "../../../components/hub/ui/Field";
import { PageHeader } from "../../../components/hub/ui/Layout";
import { Avatar } from "../../../components/hub/ui/Media";
import { Dialog } from "../../../components/hub/ui/Overlay";
import { useToast } from "../../../components/ui/Toast";
import { HubError } from "../../../lib/hub/api";
import { day } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import { siteUrl } from "../../../lib/hub/routes";
import { useHub } from "../../../lib/hub/session";

interface Account {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  member_since: string;
  suspended: boolean;
}

/** Find an account, and (with a recorded reason) see Migrent Hub as they do, read-only. */
export default function AdminPeoplePage() {
  const { me, startViewAs } = useHub();
  const navigate = useHubNavigate();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [needle, setNeedle] = useState("");
  const [viewing, setViewing] = useState<Account | null>(null);
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
    <HubShell title="People">
      <PageHeader title="People" description="Find a customer to help them. Account changes (suspending, deleting) stay in the admin console." />
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
              <Button variant="secondary" size="sm" icon={<Eye className="h-4 w-4" strokeWidth={1.75} />} disabled={u.id === me?.id} onClick={() => setViewing(u)}>
                View as
              </Button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-[13.5px] text-[color:var(--color-ink-3)]">
        Need to change an account?{" "}
        <a href={siteUrl("/admin/users")} className="font-semibold text-[color:var(--color-primary)] hover:underline">
          Open the admin console
        </a>
        .
      </p>

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
    </HubShell>
  );
}
