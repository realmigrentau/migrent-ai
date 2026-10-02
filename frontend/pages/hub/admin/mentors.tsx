import { useState } from "react";
import { HandHeart, Mail } from "lucide-react";
import AdminPanelShell from "../../../components/hub/admin/AdminPanel";
import { Button } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Field, Textarea } from "../../../components/hub/ui/Field";
import { PageHeader, Tabs } from "../../../components/hub/ui/Layout";
import { Avatar } from "../../../components/hub/ui/Media";
import { Dialog } from "../../../components/hub/ui/Overlay";
import { useToast } from "../../../components/ui/Toast";
import { hubApi, HubError } from "../../../lib/hub/api";
import { relative } from "../../../lib/hub/format";
import { invalidate, useHubQuery } from "../../../lib/hub/query";
import type { Person } from "../../../lib/hub/types";
import ReasonPicker from "../../../components/hub/admin/ReasonPicker";

type Status = "pending" | "approved" | "rejected";

interface MentorReview {
  id: string;
  user_id: string;
  person: Person;
  email: string | null;
  suburb: string | null;
  postcode: number | null;
  languages: string[];
  specialties: string[];
  bio: string;
  hourly_rate: number | null;
  status: Status;
  review_reason: string | null;
  submitted_at: string | null;
  id_status: "approved" | "pending" | "rejected" | "not_submitted";
  payouts_ready: boolean;
}

const ID_LABEL: Record<MentorReview["id_status"], { text: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  approved: { text: "ID checked", tone: "success" },
  pending: { text: "ID waiting in ID checks", tone: "warning" },
  rejected: { text: "ID rejected", tone: "danger" },
  not_submitted: { text: "No ID uploaded yet", tone: "neutral" },
};

function DecisionDialog({ mentor, action, onClose }: { mentor: MentorReview | null; action: "approve" | "reject"; onClose: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const approve = action === "approve";

  async function save() {
    if (!mentor) return;
    setBusy(true);
    try {
      await hubApi.post(`/hub/admin/mentors/${mentor.id}`, { action, reason: approve ? undefined : reason.trim() });
      toast.success(approve ? `${mentor.person.name} is now listed as a mentor.` : `${mentor.person.name} has been told what to change.`);
      invalidate("/hub/admin/");
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
      open={Boolean(mentor)}
      onClose={onClose}
      title={mentor ? (approve ? `List ${mentor.person.name} as a mentor?` : `Ask ${mentor.person.name} for changes`) : ""}
      description={
        approve
          ? "New arrivals will be able to find and pay them, and may meet them in person. Only approve someone whose ID is checked and whose introduction is genuine and safe. They are emailed and it is recorded in the audit log."
          : "They are emailed your reason and stay unlisted until they change their profile and you approve it. It is also recorded in the audit log."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={approve ? "primary" : "danger"} loading={busy} disabled={!approve && reason.trim().length < 5} onClick={() => void save()}>
            {approve ? "Approve and list" : "Send back"}
          </Button>
        </>
      }
    >
      {!approve && (
        <div className="flex flex-col gap-4">
          <ReasonPicker kind="mentor_reject" onPick={setReason} />
          <Field label="What to change (sent to them)" hint="e.g. Please don't ask people to contact you outside Migrent.">
            {({ id, describedBy }) => <Textarea id={id} rows={3} value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} aria-describedby={describedBy} autoFocus />}
          </Field>
        </div>
      )}
    </Dialog>
  );
}

/** People who signed up as mentors, waiting for Migrent's approval. */
function AdminMentorsContent() {
  const [status, setStatus] = useState<Status>("pending");
  const { data, error, loading, refetch } = useHubQuery<{ mentors: MentorReview[] }>(`/hub/admin/mentors?status=${status}`);
  const [deciding, setDeciding] = useState<{ mentor: MentorReview; action: "approve" | "reject" } | null>(null);

  return (
    <>
      <PageHeader
        title="Mentors"
        description="Mentors are paid through Migrent to help new arrivals, often in person, so nobody is listed until their government ID is checked (in ID checks) and you have read and approved their profile."
      />
      <Tabs
        label="Mentor status"
        value={status}
        onChange={(v) => setStatus(v as Status)}
        tabs={[
          { value: "pending", label: "To review" },
          { value: "approved", label: "Listed" },
          { value: "rejected", label: "Sent back" },
        ]}
        className="mb-6"
      />
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <RowSkeleton rows={3} />
      ) : data.mentors.length === 0 ? (
        <EmptyState
          icon={<HandHeart className="h-6 w-6" strokeWidth={1.75} />}
          title={status === "pending" ? "No mentors waiting" : status === "approved" ? "No mentors listed yet" : "Nobody sent back"}
          body={status === "pending" ? "People appear here as soon as they sign up as a mentor." : undefined}
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {data.mentors.map((m) => {
            const id = ID_LABEL[m.id_status] ?? ID_LABEL.not_submitted;
            return (
              <li key={m.id} className="flex flex-col gap-4 rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar name={m.person.name} src={m.person.avatar_url} size={44} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate text-[15.5px] font-semibold text-[color:var(--color-ink)]">{m.person.name}</p>
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="inline-flex max-w-full items-center gap-1 truncate text-[13px] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-primary)]">
                        <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                        <span className="truncate">{m.email}</span>
                      </a>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <StatusBadge tone={id.tone}>{id.text}</StatusBadge>
                      <StatusBadge tone={m.payouts_ready ? "success" : "neutral"}>{m.payouts_ready ? "Payouts set up" : "Payouts not set up"}</StatusBadge>
                      <span className="text-[12.5px] text-[color:var(--color-ink-3)]">
                        {[m.suburb, m.postcode].filter(Boolean).join(" ")}
                        {m.hourly_rate ? ` · $${Math.round(m.hourly_rate / 100)} a session` : ""} · {relative(m.submitted_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-[14px] bg-[var(--color-surface-muted)] p-4 text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">
                  <p className="whitespace-pre-line">{m.bio || "No introduction written."}</p>
                  {(m.languages.length > 0 || m.specialties.length > 0) && (
                    <p className="text-[13px] text-[color:var(--color-ink-3)]">
                      {[m.languages.join(", "), m.specialties.join(", ")].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {m.status === "rejected" && m.review_reason && <p className="text-[13px] text-[color:var(--color-danger-500)]">Sent back: {m.review_reason}</p>}
                </div>
                {m.status !== "approved" && (
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button variant="ghost" size="sm" className="text-[color:var(--color-danger-500)]" onClick={() => setDeciding({ mentor: m, action: "reject" })}>
                      Send back
                    </Button>
                    <Button size="sm" disabled={m.id_status !== "approved"} onClick={() => setDeciding({ mentor: m, action: "approve" })}>
                      Approve and list
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {status === "pending" && (
        <InlineAlert tone="info" className="mt-6">
          You can approve a mentor once their government ID is checked. If it is still waiting, open ID checks first.
        </InlineAlert>
      )}
      <DecisionDialog mentor={deciding?.mentor ?? null} action={deciding?.action ?? "approve"} onClose={() => setDeciding(null)} />
    </>
  );
}

/** Inside the Admin panel: nothing here loads until the admin password is entered. */
export default function AdminMentorsPage() {
  return (
    <AdminPanelShell title="Mentors">
      <AdminMentorsContent />
    </AdminPanelShell>
  );
}
