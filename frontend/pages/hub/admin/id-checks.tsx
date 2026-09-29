import { useState } from "react";
import { BadgeCheck, ExternalLink, FileText, Mail } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import { Button } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Field, Textarea } from "../../../components/hub/ui/Field";
import { PageHeader } from "../../../components/hub/ui/Layout";
import { Avatar } from "../../../components/hub/ui/Media";
import { Dialog } from "../../../components/hub/ui/Overlay";
import { useToast } from "../../../components/ui/Toast";
import { ID_DOCUMENTS } from "../../../lib/hub/admin";
import { hubApi, HubError } from "../../../lib/hub/api";
import { plural, relative } from "../../../lib/hub/format";
import { invalidate, useHubQuery } from "../../../lib/hub/query";
import type { Person } from "../../../lib/hub/types";

interface IdCheck {
  user_id: string;
  person: Person;
  email: string | null;
  document_type: string | null;
  submitted_at: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  listings_waiting: number;
}

interface DocumentLink {
  url: string;
  kind: "image" | "pdf";
  expires_in_seconds: number;
}

const docLabel = (t: string | null) => (t ? ID_DOCUMENTS[t] ?? t.replace(/_/g, " ") : "Document");

function DocumentDialog({ check, onClose }: { check: IdCheck | null; onClose: () => void }) {
  const q = useHubQuery<DocumentLink>(check ? `/hub/admin/id-checks/${check.user_id}/document` : null);
  return (
    <Dialog
      open={Boolean(check)}
      onClose={onClose}
      size="lg"
      title={check ? `${check.person.name}: ${docLabel(check.document_type)}` : "Document"}
      description="Check the name and photo match their Migrent account. The link expires after five minutes. Don't download or share it."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {q.error ? (
        <ErrorState message={q.error.message} onRetry={() => void q.refetch()} />
      ) : !q.data ? (
        <RowSkeleton rows={2} />
      ) : q.data.kind === "pdf" ? (
        <div className="flex flex-col items-start gap-3 py-2">
          <p className="text-[14px] text-[color:var(--color-ink-2)]">This document is a PDF. It opens in a new tab.</p>
          <a href={q.data.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-[var(--color-primary)] px-4.5 text-[14px] font-semibold text-[color:var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)]">
            <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Open the PDF
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </a>
        </div>
      ) : (
        // A short-lived signed link to a private file: not something next/image should cache.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={q.data.url} alt={`${check?.person.name ?? "Owner"}'s ${docLabel(check?.document_type ?? null).toLowerCase()}`} className="max-h-[60vh] w-full rounded-[14px] bg-[var(--color-surface-muted)] object-contain" />
      )}
    </Dialog>
  );
}

function DecisionDialog({ check, action, onClose }: { check: IdCheck | null; action: "approve" | "reject"; onClose: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const approve = action === "approve";

  async function save() {
    if (!check) return;
    setBusy(true);
    try {
      await hubApi.post(`/hub/admin/id-checks/${check.user_id}`, { action, reason: approve ? undefined : reason.trim() });
      toast.success(approve ? `${check.person.name}'s ID is approved.` : `${check.person.name} has been told what to fix.`);
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
      open={Boolean(check)}
      onClose={onClose}
      title={check ? (approve ? `Approve ${check.person.name}'s ID?` : `Reject ${check.person.name}'s ID`) : ""}
      description={
        approve
          ? "They'll be able to publish listings. Only approve if the document is genuine and the name matches their account. The owner is emailed and it is recorded in the audit log."
          : "The owner is emailed your reason so they can upload a better document. It is also recorded in the audit log."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={approve ? "primary" : "danger"} loading={busy} disabled={!approve && reason.trim().length < 5} onClick={() => void save()}>
            {approve ? "Approve ID" : "Reject ID"}
          </Button>
        </>
      }
    >
      {!approve && (
        <Field label="What was wrong (sent to the owner)" hint="e.g. The photo is too blurry to read the name. Please upload a clearer photo of the whole page.">
          {({ id, describedBy }) => <Textarea id={id} rows={3} value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} aria-describedby={describedBy} autoFocus />}
        </Field>
      )}
    </Dialog>
  );
}

/** Owners who uploaded a government ID and are waiting for a person to check it. */
export default function AdminIdChecksPage() {
  const { data, error, loading, refetch } = useHubQuery<{ checks: IdCheck[] }>("/hub/admin/id-checks");
  const [viewing, setViewing] = useState<IdCheck | null>(null);
  const [deciding, setDeciding] = useState<{ check: IdCheck; action: "approve" | "reject" } | null>(null);

  return (
    <HubShell title="ID checks">
      <PageHeader title="ID checks" description="Owners can't publish listings until a person has checked their government ID. Look at the document, then approve it or tell the owner what to fix. Oldest first." />
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <RowSkeleton rows={3} />
      ) : data.checks.length === 0 ? (
        <EmptyState icon={<BadgeCheck className="h-6 w-6" strokeWidth={1.75} />} title="No ID checks waiting" body="Owners appear here as soon as they upload a document." />
      ) : (
        <ul className="flex flex-col gap-4">
          {data.checks.map((c) => (
            <li key={c.user_id} className="flex flex-col gap-4 rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={c.person.name} src={c.person.avatar_url} size={44} />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="truncate text-[15.5px] font-semibold text-[color:var(--color-ink)]">{c.person.name}</p>
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="inline-flex max-w-full items-center gap-1 truncate text-[13px] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-primary)]">
                      <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                      <span className="truncate">{c.email}</span>
                    </a>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <StatusBadge tone="neutral" icon={false}>
                      {docLabel(c.document_type)}
                    </StatusBadge>
                    <StatusBadge tone={c.email_verified ? "success" : "neutral"}>{c.email_verified ? "Email confirmed" : "Email not confirmed"}</StatusBadge>
                    {c.phone_verified && <StatusBadge tone="success">Phone confirmed</StatusBadge>}
                    {c.listings_waiting > 0 && <StatusBadge tone="warning">{plural(c.listings_waiting, "listing")} waiting</StatusBadge>}
                    <span className="text-[12.5px] text-[color:var(--color-ink-3)]">Sent {relative(c.submitted_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button variant="secondary" size="sm" icon={<FileText className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setViewing(c)}>
                  View document
                </Button>
                <Button variant="ghost" size="sm" className="text-[color:var(--color-danger-500)]" onClick={() => setDeciding({ check: c, action: "reject" })}>
                  Reject
                </Button>
                <Button size="sm" onClick={() => setDeciding({ check: c, action: "approve" })}>
                  Approve
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <InlineAlert tone="info" className="mt-6">
        Approving an ID does not publish anything by itself. Listings the owner saved while waiting stay as drafts until the owner sends them for review; they then appear in Listings.
      </InlineAlert>
      <DocumentDialog check={viewing} onClose={() => setViewing(null)} />
      <DecisionDialog check={deciding?.check ?? null} action={deciding?.action ?? "approve"} onClose={() => setDeciding(null)} />
    </HubShell>
  );
}
