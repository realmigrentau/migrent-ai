import { useState } from "react";
import { useRouter } from "next/router";
import { CalendarDays, FileText, KeyRound, MessageCircle, Scale } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import HubLink from "../../../components/hub/HubLink";
import ApplicantSnapshot from "../../../components/hub/applications/Snapshot";
import ApplicationTimeline, { ApplicationProgress } from "../../../components/hub/applications/Timeline";
import { HomeRow } from "../../../components/hub/cards";
import { docKindLabel } from "../../../components/hub/profile/sections";
import { Button, ButtonLink } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, Skeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Field, Textarea } from "../../../components/hub/ui/Field";
import { Avatar } from "../../../components/hub/ui/Media";
import { Dialog } from "../../../components/hub/ui/Overlay";
import { Fact, PageHeader, Panel, Section } from "../../../components/hub/ui/Layout";
import { useConfirm } from "../../../components/ui/ConfirmDialog";
import { useToast } from "../../../components/ui/Toast";
import { hubApi, HubError } from "../../../lib/hub/api";
import { day, relative } from "../../../lib/hub/format";
import { invalidate, setQueryData, useHubQuery } from "../../../lib/hub/query";
import { siteUrl } from "../../../lib/hub/routes";
import { applicationCopy, isClosed } from "../../../lib/hub/status";
import type { ApplicationDetail } from "../../../lib/hub/types";

function nextStepCopy(d: ApplicationDetail): { title: string; body: string } | null {
  const s = d.application.status;
  const owner = d.owner?.name?.split(" ")[0] || "The owner";
  switch (s) {
    case "submitted":
      return { title: `${owner} has your application`, body: "You'll be told as soon as it's opened. Booking an inspection, if you haven't, helps." };
    case "under_review":
      return { title: `${owner} is reviewing it`, body: "Nothing to do right now. You'll hear here and by email when there's a decision." };
    case "shortlisted":
      return { title: "You're on the shortlist", body: `${owner} is choosing between a few applicants. Replies to any questions help.` };
    case "changes_requested":
      return { title: "More information needed", body: "Update your application and send it again - it keeps its place." };
    case "migrent_review":
      return { title: "Approved - Migrent is finalising", body: `${owner} approved your application. Migrent checks the application is complete and the listing is genuine before anything is final. We'll let you know as soon as it's done.` };
    case "finalised":
      return { title: "Finalised - welcome home", body: "Your tenancy details are set up in My home. Sign your lease with the owner directly; never pay before you have." };
    case "declined":
      return { title: "Not this time", body: "The owner chose another applicant. Your Rental Profile is ready for the next one." };
    case "not_proceeding":
      return { title: "Migrent could not finalise this", body: "Contact support if you'd like to know more." };
    default:
      return null;
  }
}

function RenterView({ d }: { d: ApplicationDetail }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [withdrawing, setWithdrawing] = useState(false);
  const status = d.application.status;
  const next = nextStepCopy(d);
  const canWithdraw = !isClosed(status) && status !== "finalised";
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-10">
        {!isClosed(status) && status !== "draft" && (
          <Panel>
            <ApplicationProgress status={status} />
          </Panel>
        )}
        {next && (
          <InlineAlert tone={status === "changes_requested" ? "warning" : status === "finalised" ? "success" : isClosed(status) ? "neutral" : "info"} title={next.title} action={status === "changes_requested" ? <ButtonLink to={`/apply/${d.listing?.id}`} size="sm">Update application</ButtonLink> : status === "finalised" ? <ButtonLink to="/my-home" size="sm">Open My home</ButtonLink> : undefined}>
            {next.body}
          </InlineAlert>
        )}
        {status === "draft" && (
          <EmptyState compact title="This application hasn't been sent" body="Pick up where you left off - everything you've entered is saved." action={<ButtonLink to={`/apply/${d.listing?.id}`}>Continue application</ButtonLink>} />
        )}
        <Section title="What's happened">
          <ApplicationTimeline events={d.events} viewer="renter" />
        </Section>
        <Section title="What the owner can see">
          <Panel className="flex flex-col gap-3">
            <p className="text-[14.5px] leading-relaxed text-[color:var(--color-ink-2)]">
              A copy of your Rental Profile from the moment you sent this{d.application.share_income ? ", including your income" : " (without your income)"}, your note, and {d.documents.length ? `${d.documents.length} document${d.documents.length === 1 ? "" : "s"}` : "no documents"}. Editing your profile now doesn't change what they already have.
            </p>
            {d.documents.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {d.documents.map((doc) => (
                  <li key={doc.id} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-[13px] text-[color:var(--color-ink-2)]">
                    <FileText className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                    {doc.label || docKindLabel(doc.kind)}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </Section>
      </div>
      <aside className="flex flex-col gap-5">
        <Panel className="flex flex-col gap-4">
          <HomeRow listing={d.listing} to={`/homes/${d.listing?.id}`} />
          <dl className="grid grid-cols-2 gap-4 border-t border-[var(--color-line)] pt-4">
            <Fact label="Move in" value={d.application.move_in_date ? day(d.application.move_in_date) : "-"} />
            <Fact label="Stay" value={d.application.lease_months ? `${d.application.lease_months} months` : "Flexible"} />
            <Fact label="People" value={d.application.occupants ?? "-"} />
            <Fact label="Sent" value={d.application.submitted_at ? relative(d.application.submitted_at) : "Not yet"} />
          </dl>
        </Panel>
        {d.owner && d.listing && (
          <ButtonLink to={`/messages/${d.listing.id}_${d.owner.id}`} variant="secondary" icon={<MessageCircle className="h-4 w-4" strokeWidth={1.75} />} block>
            Message {d.owner.name.split(" ")[0]}
          </ButtonLink>
        )}
        {canWithdraw && (
          <Button
            variant="ghost"
            loading={withdrawing}
            onClick={async () => {
              const ok = await confirm({ title: "Withdraw this application?", description: "The owner will be told. You can apply again later if the home is still available.", confirmLabel: "Withdraw", tone: "danger" });
              if (!ok) return;
              setWithdrawing(true);
              try {
                const res = await hubApi.post<{ application: ApplicationDetail["application"] }>(`/hub/applications/${d.application.id}/withdraw`, {});
                setQueryData<ApplicationDetail>(`/hub/applications/${d.application.id}`, (prev) => (prev ? { ...prev, application: { ...prev.application, status: res.application.status } } : prev!));
                invalidate(`/hub/applications/${d.application.id}`);
                invalidate("/hub/applications");
                invalidate("/hub/home");
                toast.info("Application withdrawn");
              } catch (e) {
                toast.error(e instanceof HubError ? e.message : "That did not go through.");
              } finally {
                setWithdrawing(false);
              }
            }}
          >
            Withdraw application
          </Button>
        )}
      </aside>
    </div>
  );
}

const REQUEST_TEMPLATES = ["Could you add a recent payslip or proof of income?", "Could you add a reference from a previous landlord?", "Could you confirm your move-in date?"];

function OwnerView({ d, refetch, admin }: { d: ApplicationDetail; refetch: () => void; admin?: boolean }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [dialog, setDialog] = useState<null | "request_changes" | "decline">(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [notes, setNotes] = useState(d.owner_notes ?? []);
  const s = d.snapshot;
  const allowed = d.allowed_actions ?? [];
  const first = (s?.name || d.renter?.name || "the applicant").split(" ")[0];

  async function act(action: string, noteText?: string) {
    setPending(action);
    try {
      await hubApi.post(`/hub/applications/${d.application.id}/owner-action`, { action, note: noteText || undefined });
      invalidate(`/hub/applications/${d.application.id}`);
      invalidate("/hub/applications");
      invalidate("/hub/home");
      invalidate("/hub/counts");
      refetch();
      setDialog(null);
      setNote("");
      toast.success({ shortlist: "Shortlisted", request_changes: `Request sent to ${first}`, approve: "Approved - Migrent will finalise it", decline: `${first} has been told` }[action] ?? "Done");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That did not go through.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-8">
        <Panel className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={s?.name || d.renter?.name} src={s?.avatar_url} size={64} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 className="text-[22px] font-semibold tracking-[-0.015em] text-[color:var(--color-ink)]">{s?.name || d.renter?.name}</h2>
            <p className="text-[14px] text-[color:var(--color-ink-3)]">On Migrent since {day(s?.member_since || d.renter?.member_since || null)}</p>
            <div className="flex flex-wrap gap-2">
              {s?.verification === "verified" ? <StatusBadge tone="info">Identity checked by Migrent</StatusBadge> : <StatusBadge tone="neutral" icon={false}>Identity not checked</StatusBadge>}
            </div>
          </div>
          {!admin && (
            <ButtonLink to={`/messages/${d.listing?.id}_${d.renter?.id}`} variant="secondary" icon={<MessageCircle className="h-4 w-4" strokeWidth={1.75} />}>
              Message {first}
            </ButtonLink>
          )}
        </Panel>

        {d.application.message && (
          <Panel>
            <p className="mb-1.5 text-[13px] font-medium text-[color:var(--color-ink-3)]">Note to you</p>
            <p className="text-[15.5px] leading-relaxed text-[color:var(--color-ink)]">"{d.application.message}"</p>
          </Panel>
        )}

        <Panel>
          {s ? (
            <ApplicantSnapshot s={s} documents={d.documents} />
          ) : (
            <p className="text-[14.5px] text-[color:var(--color-ink-3)]">The applicant's details will appear here once they send the application.</p>
          )}
        </Panel>

        {(d.other_applications_with_you?.length ?? 0) > 0 && (
          <Section title={`${first}'s other applications with you`}>
            <div className="flex flex-col gap-3">
              {d.other_applications_with_you!.map((o) => (
                <HubLink key={o.id} to={`/applications/${o.id}`} className="flex items-center justify-between gap-3 rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 hover:bg-[var(--color-surface-hover)]">
                  <span className="text-[14.5px] font-semibold text-[color:var(--color-ink)]">{o.listing?.unit_label ? `${o.listing.unit_label} · ` : ""}{o.listing?.title}</span>
                  <StatusBadge tone={applicationCopy(o.status, "owner").tone}>{applicationCopy(o.status, "owner").label}</StatusBadge>
                </HubLink>
              ))}
            </div>
          </Section>
        )}

        {d.renter_reviews && (
          <Section title={`What other hosts said about ${first}`} description="From hosts after a tenancy or stay on Migrent. Only hosts see these.">
            {d.renter_reviews.count === 0 ? (
              <p className="text-[14px] text-[color:var(--color-ink-3)]">No reviews yet. Many people renting here are new to Australia, so this is normal.</p>
            ) : (
              <ul className="flex flex-col gap-3" data-testid="renter-reviews">
                {d.renter_reviews.reviews.map((r) => (
                  <li key={r.id} className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">
                      {"★".repeat(r.rating)}
                      <span className="text-[color:var(--color-ink-4)]">{"★".repeat(5 - r.rating)}</span>
                      <span className="sr-only">{r.rating} out of 5</span>
                      <span className="ml-2 text-[12.5px] font-medium text-[color:var(--color-ink-3)]">
                        {r.reviewer_name}, after a {r.kind === "stay" ? "stay" : "tenancy"} · {day(r.created_at)}
                      </span>
                    </p>
                    {r.review_text && <p className="mt-1.5 text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">{r.review_text}</p>}
                    {(r.payment_rating || r.cleanliness_rating) && (
                      <p className="mt-1.5 text-[12.5px] text-[color:var(--color-ink-3)]">
                        {r.payment_rating ? `Paid on time ${r.payment_rating}/5` : ""}
                        {r.payment_rating && r.cleanliness_rating ? " · " : ""}
                        {r.cleanliness_rating ? `Looked after the home ${r.cleanliness_rating}/5` : ""}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        <Section title="What's happened">
          <ApplicationTimeline events={d.events} viewer="owner" />
        </Section>
      </div>

      <aside className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 lg:sticky lg:top-10">
          <Panel className="flex flex-col gap-4">
            <HomeRow listing={d.listing} to={d.listing ? `/listings/${d.listing.id}` : undefined} />
            <dl className="grid grid-cols-2 gap-4 border-t border-[var(--color-line)] pt-4">
              <Fact label="Move in" value={d.application.move_in_date ? day(d.application.move_in_date) : "-"} icon={<CalendarDays className="h-4 w-4" strokeWidth={1.75} />} />
              <Fact label="Stay" value={d.application.lease_months ? `${d.application.lease_months} months` : "Flexible"} />
              <Fact label="People" value={d.application.occupants ?? "-"} />
              <Fact label="Sent" value={d.application.submitted_at ? relative(d.application.submitted_at) : "-"} />
            </dl>
          </Panel>

          {allowed.length > 0 ? (
            <Panel className="flex flex-col gap-2.5">
              <h2 className="text-[15px] font-semibold text-[color:var(--color-ink)]">Your decision</h2>
              {allowed.includes("approve") && (
                <Button
                  block
                  loading={pending === "approve"}
                  onClick={async () => {
                    const ok = await confirm({
                      title: `Approve ${first}?`,
                      description: "Migrent will do a final check before it's finalised, then you'll both be told. Other applicants stay open until you decide on them.",
                      confirmLabel: "Approve",
                    });
                    if (ok) void act("approve");
                  }}
                >
                  Approve
                </Button>
              )}
              {allowed.includes("shortlist") && (
                <Button variant="secondary" block loading={pending === "shortlist"} onClick={() => void act("shortlist")}>
                  Shortlist
                </Button>
              )}
              {allowed.includes("request_changes") && (
                <Button variant="secondary" block onClick={() => setDialog("request_changes")}>
                  Ask for more information
                </Button>
              )}
              {allowed.includes("decline") && (
                <Button variant="ghost" block onClick={() => setDialog("decline")}>
                  Decline
                </Button>
              )}
              <p className="mt-1 flex items-start gap-2 text-[12.5px] leading-snug text-[color:var(--color-ink-3)]">
                <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                Decide on the tenancy, not the person's background.{" "}
                <a href={siteUrl("/anti-discrimination")} className="font-semibold text-[color:var(--color-primary)] hover:underline" target="_blank" rel="noreferrer">
                  Fair housing
                </a>
              </p>
            </Panel>
          ) : (
            <InlineAlert tone={d.application.status === "finalised" ? "success" : "neutral"} title={applicationCopy(d.application.status, "owner").detail}>
              {d.application.status === "migrent_review" ? "Migrent is doing its final check. You'll both be told when it's finalised." : d.application.status === "finalised" ? "The tenancy is set up under Tenancies." : d.application.status === "changes_requested" ? `Waiting for ${first} to update it.` : null}
            </InlineAlert>
          )}
          {d.application.status === "finalised" && (
            <ButtonLink to="/tenancies" variant="secondary" icon={<KeyRound className="h-4 w-4" strokeWidth={1.75} />} block>
              Open Tenancies
            </ButtonLink>
          )}

          {!admin && (
          <Panel className="flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold text-[color:var(--color-ink)]">Private notes</h2>
            <p className="text-[12.5px] text-[color:var(--color-ink-3)]">Only you can see these. Keep them to facts about the tenancy.</p>
            {notes.length > 0 && (
              <ul className="flex flex-col gap-2">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-[12px] bg-[var(--color-surface-muted)] px-3 py-2 text-[14px] text-[color:var(--color-ink-2)]">
                    {n.body}
                    <span className="mt-0.5 block text-[11.5px] text-[color:var(--color-ink-4)]">{relative(n.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
            <form
              className="flex flex-col gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!noteDraft.trim()) return;
                try {
                  const res = await hubApi.post<{ note: { id: string; body: string; created_at: string } }>(`/hub/applications/${d.application.id}/notes`, { body: noteDraft.trim() });
                  setNotes((xs) => [...xs, res.note]);
                  setNoteDraft("");
                } catch (err) {
                  toast.error(err instanceof HubError ? err.message : "The note did not save.");
                }
              }}
            >
              <label htmlFor="owner-note" className="sr-only">
                Add a private note
              </label>
              <Textarea id="owner-note" rows={2} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value.slice(0, 2000))} placeholder="Add a note" className="min-h-[72px]" />
              <Button type="submit" size="sm" variant="secondary" disabled={!noteDraft.trim()} className="self-end">
                Save note
              </Button>
            </form>
          </Panel>
          )}
        </div>
      </aside>

      <Dialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialog === "decline" ? `Decline ${first}'s application?` : `Ask ${first} for more information`}
        description={dialog === "decline" ? `${first} will be told kindly that you've decided not to go ahead. Any reason you write here stays private to you.` : `${first} will see your request and can update the application.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button variant={dialog === "decline" ? "danger" : "primary"} loading={pending === dialog} disabled={dialog === "request_changes" && !note.trim()} onClick={() => void act(dialog!, note.trim())}>
              {dialog === "decline" ? "Decline application" : "Send request"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 pb-3">
          {dialog === "request_changes" && (
            <div className="flex flex-wrap gap-2">
              {REQUEST_TEMPLATES.map((t) => (
                <button key={t} type="button" onClick={() => setNote(t)} className="hub-press rounded-full border border-[var(--color-line-2)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--color-ink-2)] hover:border-[var(--color-primary)]">
                  {t}
                </button>
              ))}
            </div>
          )}
          <Field label={dialog === "decline" ? "Private reason (optional)" : "What do you need?"}>
            {({ id }) => <Textarea id={id} rows={4} value={note} onChange={(e) => setNote(e.target.value.slice(0, 2000))} data-autofocus />}
          </Field>
        </div>
      </Dialog>
    </div>
  );
}

function AdminView({ d, refetch }: { d: ApplicationDetail; refetch: () => void }) {
  const toast = useToast();
  const [action, setAction] = useState<null | "finalise" | "request_corrections" | "stop">(null);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const inReview = d.application.status === "migrent_review";
  return (
    <div className="flex flex-col gap-8">
      <InlineAlert tone="info" title="Migrent final review">
        The owner approved this application. Check the application is complete, the listing is genuine and nothing in reports or moderation stands in the way. Every decision is recorded in the audit log with your name.
      </InlineAlert>
      <OwnerView d={{ ...d, allowed_actions: [] }} refetch={refetch} admin />
      {inReview && (
        <div className="hub-sticky-bar flex flex-wrap justify-end gap-2 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-pop)]">
          <Button variant="ghost" onClick={() => setAction("stop")}>
            Stop
          </Button>
          <Button variant="secondary" onClick={() => setAction("request_corrections")}>
            Ask the renter for corrections
          </Button>
          <Button onClick={() => setAction("finalise")}>Finalise</Button>
        </div>
      )}
      <Dialog
        open={action !== null}
        onClose={() => setAction(null)}
        title={action === "finalise" ? "Finalise this application?" : action === "stop" ? "Stop this application?" : "Ask for corrections"}
        description={action === "finalise" ? "A tenancy is set up for both of them and the listing is taken off the market." : "Both parties are told. Your reason is recorded in the audit log."}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              variant={action === "stop" ? "danger" : "primary"}
              loading={pending}
              disabled={action !== "finalise" && reason.trim().length < 5}
              onClick={async () => {
                setPending(true);
                try {
                  await hubApi.post(`/hub/admin/applications/${d.application.id}/decision`, { action, reason: reason.trim() || undefined });
                  toast.success(action === "finalise" ? "Finalised" : "Recorded");
                  setAction(null);
                  invalidate("/hub/admin");
                  refetch();
                } catch (e) {
                  toast.error(e instanceof HubError ? e.message : "That did not go through.");
                } finally {
                  setPending(false);
                }
              }}
            >
              {action === "finalise" ? "Finalise" : action === "stop" ? "Stop application" : "Send"}
            </Button>
          </>
        }
      >
        <div className="pb-3">
          <Field label={action === "finalise" ? "Note for the audit log (optional)" : "Reason (required)"}>{({ id }) => <Textarea id={id} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} data-autofocus />}</Field>
        </div>
      </Dialog>
    </div>
  );
}

export default function ApplicationPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const { data, error, loading, refetch } = useHubQuery<ApplicationDetail>(id ? `/hub/applications/${id}` : null);

  const title = data ? (data.viewer === "renter" ? data.listing?.title ?? "Application" : data.snapshot?.name || data.renter?.name || "Application") : "Application";
  const copy = data ? applicationCopy(data.application.status, data.viewer === "renter" ? "renter" : "owner") : null;

  return (
    <HubShell title={title}>
      {error ? (
        error.status === 404 ? (
          <EmptyState title="Application not found" body="It may have been withdrawn, or the link is for a different account." action={<ButtonLink to="/applications">All applications</ButtonLink>} />
        ) : (
          <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
        )
      ) : loading || !data ? (
        <div className="flex flex-col gap-6" aria-busy="true">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-40 w-full rounded-[22px]" />
          <Skeleton className="h-72 w-full rounded-[22px]" />
        </div>
      ) : (
        <>
          <PageHeader
            back={{ to: data.viewer === "admin" ? "/admin/reviews" : "/applications", label: data.viewer === "admin" ? "Final reviews" : "Applications" }}
            eyebrow={data.viewer === "renter" ? "Your application" : data.viewer === "admin" ? "Final review" : "Application"}
            title={data.viewer === "renter" ? data.listing?.title : `${data.snapshot?.name || data.renter?.name} for ${data.listing?.unit_label ? `${data.listing.unit_label}, ` : ""}${data.listing?.title}`}
            actions={copy && <StatusBadge tone={copy.tone}>{copy.label}</StatusBadge>}
          />
          {data.viewer === "renter" ? <RenterView d={data} /> : data.viewer === "owner" ? <OwnerView d={data} refetch={() => void refetch()} /> : <AdminView d={data} refetch={() => void refetch()} />}
        </>
      )}
    </HubShell>
  );
}

