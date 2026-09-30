import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ChevronRight, Inbox, Lock, Mail } from "lucide-react";
import AdminPanelShell from "../../../components/hub/admin/AdminPanel";
import { Button } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Field, Segmented, Select, Textarea } from "../../../components/hub/ui/Field";
import { PageHeader, Tabs } from "../../../components/hub/ui/Layout";
import { Avatar } from "../../../components/hub/ui/Media";
import { Sheet } from "../../../components/hub/ui/Overlay";
import { useToast } from "../../../components/ui/Toast";
import { cn } from "../../../lib/cn";
import { PRIORITIES, TICKET_CATEGORIES, TICKET_STATUS, TICKET_VIEWS, type TicketView } from "../../../lib/hub/admin";
import { hubApi, HubError } from "../../../lib/hub/api";
import { dateTime, relative, viewerZone } from "../../../lib/hub/format";
import { invalidate, setQueryData, useHubQuery } from "../../../lib/hub/query";
import type { Person } from "../../../lib/hub/types";

interface Ticket {
  id: string;
  subject: string;
  status: keyof typeof TICKET_STATUS;
  priority: "low" | "normal" | "high" | "urgent";
  category: string | null;
  source: string;
  created_at: string;
  updated_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  csat_rating: number | null;
  csat_comment: string | null;
  requester: { id: string | null; name: string; email: string | null; avatar_url: string | null; has_account: boolean };
}

interface TicketDetail extends Ticket {
  messages: { id: string; body: string; sender_type: "user" | "agent" | "system"; is_internal: boolean; created_at: string; sender: Person | null }[];
}

const status = (s: string) => TICKET_STATUS[s] ?? { label: s, tone: "neutral" as const };

function TicketDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const toast = useToast();
  const key = id ? `/hub/admin/support/tickets/${id}` : null;
  const { data, error, loading, refetch } = useHubQuery<{ ticket: TicketDetail }>(key);
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setText("");
    setMode("reply");
  }, [id]);

  const t = data?.ticket;

  function applied(next: TicketDetail) {
    if (key) setQueryData(key, { ticket: next });
    invalidate("/hub/admin/");
  }

  async function change(patch: Partial<Pick<Ticket, "status" | "priority" | "category">>) {
    if (!t) return;
    try {
      const out = await hubApi.post<{ ticket: TicketDetail }>(`/hub/admin/support/tickets/${t.id}`, patch);
      applied(out.ticket);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    }
  }

  async function send() {
    if (!t || !text.trim()) return;
    setBusy(true);
    try {
      const out =
        mode === "reply"
          ? await hubApi.post<{ ticket: TicketDetail }>(`/hub/admin/support/tickets/${t.id}/reply`, { body: text.trim() })
          : await hubApi.post<{ ticket: TicketDetail }>(`/hub/admin/support/tickets/${t.id}`, { internal_note: text.trim() });
      applied(out.ticket);
      setText("");
      toast.success(mode === "reply" ? "Reply sent." : "Note added.");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't send.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={Boolean(id)} onClose={onClose} width={600} title={t ? t.subject : "Ticket"}>
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !t ? (
        <RowSkeleton rows={4} />
      ) : (
        <div className="flex flex-col gap-6">
          <section aria-label="From" className="flex items-center gap-3">
            <Avatar name={t.requester.name} src={t.requester.avatar_url} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-semibold text-[color:var(--color-ink)]">{t.requester.name}</p>
              <p className="truncate text-[13px] text-[color:var(--color-ink-3)]">
                {t.requester.has_account ? "Migrent account" : "No account"} · opened {relative(t.created_at)}
              </p>
            </div>
            {t.requester.email && (
              <a href={`mailto:${t.requester.email}?subject=${encodeURIComponent(`Re: ${t.subject}`)}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--color-primary)] hover:underline">
                <Mail className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                Email
              </a>
            )}
          </section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Status">
              {({ id: fid }) => (
                <Select id={fid} value={t.status} onChange={(e) => void change({ status: e.target.value as Ticket["status"] })} className="h-10 text-[14px]">
                  {Object.entries(TICKET_STATUS).map(([v, s]) => (
                    <option key={v} value={v}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Priority">
              {({ id: fid }) => (
                <Select id={fid} value={t.priority} onChange={(e) => void change({ priority: e.target.value as Ticket["priority"] })} className="h-10 text-[14px]">
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Topic">
              {({ id: fid }) => (
                <Select id={fid} value={t.category ?? "feedback"} onChange={(e) => void change({ category: e.target.value })} className="h-10 text-[14px]">
                  {Object.entries(TICKET_CATEGORIES).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          {t.csat_rating ? (
            <p className="rounded-[12px] bg-[var(--color-surface-muted)] px-3.5 py-2.5 text-[13.5px] text-[color:var(--color-ink-2)]">
              <span className="font-semibold text-[color:var(--color-ink)]">Rated {t.csat_rating} out of 5.</span> {t.csat_comment}
            </p>
          ) : null}

          <section aria-label="Conversation" className="flex flex-col gap-3">
            {t.messages.map((m) => {
              const ours = m.sender_type === "agent";
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-1 rounded-[16px] border px-4 py-3",
                    m.is_internal
                      ? "border-[color:color-mix(in_oklab,var(--color-warn-500)_35%,var(--color-line))] bg-[var(--color-warn-50)]"
                      : ours
                        ? "border-[color:color-mix(in_oklab,var(--color-primary)_20%,var(--color-line))] bg-[var(--color-primary-soft)] sm:ml-8"
                        : "border-[var(--color-line)] bg-[var(--color-surface)] sm:mr-8",
                  )}
                >
                  <p className="flex flex-wrap items-center gap-x-2 text-[12.5px] text-[color:var(--color-ink-3)]">
                    {m.is_internal && <Lock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}
                    <span className="font-semibold text-[color:var(--color-ink-2)]">{m.is_internal ? `Internal note from ${m.sender?.name ?? "the team"}` : ours ? m.sender?.name ?? "Migrent" : t.requester.name}</span>
                    <span>{dateTime(m.created_at, viewerZone())}</span>
                  </p>
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[color:var(--color-ink)]">{m.body}</p>
                </div>
              );
            })}
          </section>

          <section aria-label="Write" className="flex flex-col gap-3 border-t border-[var(--color-line)] pt-5">
            <Segmented
              label="Write a"
              value={mode}
              onChange={setMode}
              options={[
                { value: "reply", label: "Reply to them" },
                { value: "note", label: "Internal note" },
              ]}
              className="w-fit"
            />
            {mode === "reply" && t.status === "closed" ? (
              <InlineAlert tone="warning">This ticket is closed. Set the status back to New to reply.</InlineAlert>
            ) : (
              <>
                <Field label={mode === "reply" ? "Your reply" : "Note for the team"} hint={mode === "reply" ? "It appears on their ticket page, and the ticket then waits on them." : "Only the team sees this."}>
                  {({ id: fid, describedBy }) => <Textarea id={fid} rows={4} value={text} maxLength={10000} onChange={(e) => setText(e.target.value)} aria-describedby={describedBy} />}
                </Field>
                <div className="flex justify-end">
                  <Button loading={busy} disabled={!text.trim()} onClick={() => void send()}>
                    {mode === "reply" ? "Send reply" : "Add note"}
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </Sheet>
  );
}

/** Questions and problems people sent from Migrent's help button. */
function AdminSupportContent() {
  const router = useRouter();
  const view: TicketView = TICKET_VIEWS.some((v) => v.value === router.query.view) ? (router.query.view as TicketView) : "needs_reply";
  const selected = typeof router.query.ticket === "string" ? router.query.ticket : null;
  const setParams = (next: { view?: TicketView; ticket?: string | null }) => {
    const query: Record<string, string> = {};
    const nv = next.view ?? view;
    if (nv !== "needs_reply") query.view = nv;
    const nt = next.ticket === undefined ? selected : next.ticket;
    if (nt) query.ticket = nt;
    void router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const { data, error, loading, refetch } = useHubQuery<{ tickets: Ticket[]; counts: Partial<Record<TicketView, number>> }>(`/hub/admin/support/tickets?view=${view}`);

  return (
    <>
      <PageHeader title="Support" description="Questions and problems people sent from the help button on Migrent. Most urgent first. Replies appear on their ticket page; internal notes are only seen by the team." />
      <Tabs label="Support tickets" value={view} onChange={(v) => setParams({ view: v, ticket: null })} tabs={TICKET_VIEWS.map((t) => ({ value: t.value, label: t.label, count: t.value === "all" ? undefined : data?.counts?.[t.value] }))} className="mb-6" />
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <RowSkeleton rows={4} />
      ) : data.tickets.length === 0 ? (
        <EmptyState icon={<Inbox className="h-6 w-6" strokeWidth={1.75} />} title={view === "needs_reply" ? "Nobody is waiting on a reply" : "No tickets here"} body="Tickets arrive from the help button on the site and from the contact form." />
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
          {data.tickets.map((t) => (
            <li key={t.id} className="border-t border-[var(--color-line)] first:border-0">
              <button type="button" onClick={() => setParams({ ticket: t.id })} className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)] sm:px-5">
                <Avatar name={t.requester.name} src={t.requester.avatar_url} size={36} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">{t.subject}</span>
                  <span className="truncate text-[13px] text-[color:var(--color-ink-3)]">
                    {t.requester.name} · {TICKET_CATEGORIES[t.category ?? ""] ?? "General"} · {relative(t.created_at)}
                  </span>
                </span>
                <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                  {(t.priority === "urgent" || t.priority === "high") && (
                    <StatusBadge tone={t.priority === "urgent" ? "danger" : "warning"}>{t.priority === "urgent" ? "Urgent" : "High"}</StatusBadge>
                  )}
                  <StatusBadge tone={status(t.status).tone} icon={false}>
                    {status(t.status).label}
                  </StatusBadge>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-ink-4)]" strokeWidth={2} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <TicketDrawer id={selected} onClose={() => setParams({ ticket: null })} />
    </>
  );
}

/** Inside the Admin panel: nothing here loads until the admin password is entered. */
export default function AdminSupportPage() {
  return (
    <AdminPanelShell title="Support">
      <AdminSupportContent />
    </AdminPanelShell>
  );
}
