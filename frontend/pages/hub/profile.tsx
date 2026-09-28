import { useEffect, useMemo, useState } from "react";
import { Check, Eye, ShieldCheck } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import ApplicantSnapshot from "../../components/hub/applications/Snapshot";
import {
  AboutSection,
  DocumentsSection,
  HistorySection,
  HouseholdSection,
  MovingSection,
  RefereesSection,
  SectionCard,
  WorkSection,
  refereeErrors,
  type ProfileDraft,
} from "../../components/hub/profile/sections";
import { Button } from "../../components/hub/ui/Button";
import { ErrorState, InlineAlert, ProgressRing, SaveStatus, Skeleton, StatusBadge } from "../../components/hub/ui/Feedback";
import { Dialog } from "../../components/hub/ui/Overlay";
import { PageHeader, Panel } from "../../components/hub/ui/Layout";
import { Avatar } from "../../components/hub/ui/Media";
import { useToast } from "../../components/ui/Toast";
import { hubApi, HubError } from "../../lib/hub/api";
import { aud } from "../../lib/hub/format";
import { invalidate, setQueryData } from "../../lib/hub/query";
import { useHub } from "../../lib/hub/session";
import type { ApplicationSnapshot, DocumentMeta, RentalProfileResponse } from "../../lib/hub/types";
import { useRentalProfile } from "../../lib/hub/useRentalProfile";
import { cn } from "../../lib/cn";

const SECTIONS = [
  { id: "about", key: "about", title: "About you" },
  { id: "move", key: "move", title: "Your move" },
  { id: "household", key: "household", title: "Household" },
  { id: "work", key: "work", title: "Work and income" },
  { id: "history", key: "history", title: "Rental history" },
  { id: "referees", key: "referees", title: "References" },
  { id: "documents", key: "documents", title: "Documents" },
] as const;

function snapshotFrom(d: ProfileDraft, avatar: string | null, memberSince: string | null, verification: string): ApplicationSnapshot {
  return {
    name: d.display_name || "You",
    avatar_url: avatar,
    member_since: memberSince,
    intro: d.intro,
    household: { adults: d.household_adults, children: d.household_children, notes: d.household_notes, has_pets: d.has_pets, pet_details: d.pet_details },
    employment: { status: d.employment_status, employer: d.employer, job_title: d.job_title, since: d.employment_since },
    income_weekly: null,
    rental_history: d.rental_history,
    first_time_renter: d.first_time_renter,
    referees: d.referees,
    preferred_lease_months: d.preferred_lease_months,
    verification,
    captured_at: new Date().toISOString(),
  };
}

/** Optional identity check. Never required, never nagged about. */
function VerificationCard({ status }: { status: string }) {
  const { me } = useHub();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const f = me?.features;
  const fee = f?.fees.renter_verification_fee ?? 19;

  if (status === "verified") {
    return (
      <Panel className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-primary)]" strokeWidth={1.75} aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">Identity checked</p>
          <p className="text-[13.5px] leading-relaxed text-[color:var(--color-ink-2)]">Owners see that Migrent has checked your ID. They never see the document itself.</p>
        </div>
      </Panel>
    );
  }

  async function start() {
    setBusy(true);
    try {
      const res = await hubApi.post<{ checkout_url: string }>("/payments/create-verification-session", {});
      window.location.href = res.checkout_url;
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "Verification could not start.");
      setBusy(false);
    }
  }

  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
        <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">Identity check</p>
        <StatusBadge tone="neutral" icon={false}>
          Optional
        </StatusBadge>
      </div>
      {status === "pending" ? (
        <p className="text-[13.5px] leading-relaxed text-[color:var(--color-ink-2)]">We're checking your ID. This usually takes a working day. You can keep applying in the meantime.</p>
      ) : f?.renter_verification ? (
        <>
          <p className="text-[13.5px] leading-relaxed text-[color:var(--color-ink-2)]">
            A one-off {aud(fee)} check of your photo ID. Owners see a "checked" mark on your applications. You can apply to any home without it, and it doesn't change how we show your application.
          </p>
          {f.payments === "test" && <p className="text-[12.5px] text-[color:var(--color-ink-3)]">Payments are in test mode: no real card is charged.</p>}
          <Button variant="secondary" size="sm" loading={busy} onClick={() => void start()} className="w-fit">
            Check my ID for {aud(fee)}
          </Button>
        </>
      ) : (
        <p className="text-[13.5px] leading-relaxed text-[color:var(--color-ink-2)]">An optional ID check is coming. You can apply to any home without it, today and after it arrives.</p>
      )}
    </Panel>
  );
}

export default function RentalProfilePage() {
  const profile = useRentalProfile();
  const { me } = useHub();
  const [docs, setDocs] = useState<DocumentMeta[] | null>(null);
  const [preview, setPreview] = useState(false);
  const [active, setActive] = useState<string>("about");
  const data = profile.data;
  const d = profile.draft;

  useEffect(() => {
    if (data && docs === null) setDocs(data.documents);
  }, [data, docs]);

  // Highlight the section in view in the side index.
  useEffect(() => {
    if (!d) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [!!d]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = useMemo(() => Object.fromEntries((data?.completion.items ?? []).map((i) => [i.key, i.done])), [data?.completion.items]);
  const errors = useMemo(() => {
    if (!d) return {};
    const e: Record<string, string> = {};
    if (!d.display_name.trim()) e.display_name = "Add your name";
    return { ...e, ...refereeErrors(d.referees) };
  }, [d]);

  const refreshCompletion = () => {
    invalidate("/hub/rental-profile");
    invalidate("/hub/home");
  };

  if (profile.error) {
    return (
      <HubShell title="Rental Profile">
        <PageHeader title="Rental Profile" />
        <ErrorState message={profile.error.message} offline={profile.error.offline} onRetry={() => void profile.refetch()} />
      </HubShell>
    );
  }

  if (!data || !d) {
    return (
      <HubShell title="Rental Profile">
        <div className="flex flex-col gap-6" aria-busy="true">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-28 w-full rounded-[22px]" />
          <Skeleton className="h-72 w-full rounded-[22px]" />
        </div>
      </HubShell>
    );
  }

  const completion = data.completion;
  const missing = completion.items.filter((i) => !i.done);

  return (
    <HubShell title="Rental Profile">
      <PageHeader
        title="Rental Profile"
        description="One profile for every application. Owners only see it when you apply, as a copy taken at that moment."
        actions={
          <>
            <SaveStatus state={profile.state} onRetry={() => void profile.flush()} />
            <Button variant="secondary" icon={<Eye className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void profile.flush().then(() => setPreview(true))}>
              See what owners see
            </Button>
          </>
        }
      />
      {profile.saveError && (
        <InlineAlert tone="danger" className="mb-6" action={<Button size="sm" variant="secondary" onClick={() => void profile.flush()}>Try again</Button>}>
          {profile.saveError}
        </InlineAlert>
      )}

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-12">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-10 lg:self-start">
          <Panel className="flex items-center gap-4">
            <ProgressRing value={completion.percent} label="Profile complete" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">{completion.complete ? "Ready to apply" : `${completion.percent}% complete`}</p>
              <p className="text-[13px] leading-snug text-[color:var(--color-ink-3)]">{completion.complete ? "Everything an owner looks for is here." : `${missing.length} thing${missing.length === 1 ? "" : "s"} left`}</p>
            </div>
          </Panel>
          <nav aria-label="Profile sections" className="hidden lg:block">
            <ol className="flex flex-col gap-0.5">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? "location" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-[10px] px-3 text-[14px] font-medium transition-colors",
                      active === s.id ? "bg-[var(--color-surface)] text-[color:var(--color-ink)] shadow-[0_0_0_1px_var(--color-line)]" : "text-[color:var(--color-ink-2)] hover:bg-[var(--color-surface-hover)]",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        done[s.key] ? "border-transparent bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]" : "border-[var(--color-line-2)]",
                      )}
                    >
                      {done[s.key] && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    {s.title}
                    <span className="sr-only">{done[s.key] ? "(done)" : "(to do)"}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <VerificationCard status={data.verification} />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <SectionCard id="about" title="About you" description="Owners read this first. Say who you are, what you do and why you're moving.">
            <AboutSection value={d} onChange={profile.update} errors={errors} />
          </SectionCard>
          <SectionCard id="move" title="Your move" description="Used to pre-fill applications and to suggest homes. Only your budget and suburbs shape suggestions.">
            <MovingSection value={d} onChange={profile.update} />
          </SectionCard>
          <SectionCard id="household" title="Household" description="Everyone who'll live in the home.">
            <HouseholdSection value={d} onChange={profile.update} />
          </SectionCard>
          <SectionCard id="work" title="Work and income" description="Your income is private. It's only shared with an owner if you tick the box on that application.">
            <WorkSection value={d} onChange={profile.update} />
          </SectionCard>
          <SectionCard id="history" title="Rental history" description="Where you've lived before, in Australia or overseas. First rental? That's fine - just say so.">
            <HistorySection value={d} onChange={profile.update} />
          </SectionCard>
          <SectionCard id="referees" title="References" description="Someone who can vouch for you: a previous landlord, employer or teacher. We don't contact them.">
            <RefereesSection value={d} onChange={profile.update} errors={errors} />
          </SectionCard>
          <SectionCard id="documents" title="Documents" description="Stored privately. You choose which ones go with each application, and owners can only open them while it's active.">
            <DocumentsSection
              documents={docs ?? []}
              onUploaded={(doc) => {
                setDocs((xs) => [doc, ...(xs ?? [])]);
                refreshCompletion();
              }}
              onDeleted={(id) => {
                setDocs((xs) => (xs ?? []).filter((x) => x.id !== id));
                setQueryData<RentalProfileResponse>("/hub/rental-profile", (prev) => (prev ? { ...prev, documents: prev.documents.filter((x) => x.id !== id) } : prev!));
                refreshCompletion();
              }}
            />
          </SectionCard>
        </div>
      </div>

      <Dialog open={preview} onClose={() => setPreview(false)} title="What an owner sees" description="When you apply, the owner gets a copy of this, plus the documents you choose for that application. Income is only included if you tick the box." size="lg">
        <div className="mb-5 flex items-center gap-4">
          <Avatar name={d.display_name} src={data.avatar_url} size={56} />
          <div>
            <p className="text-[18px] font-semibold text-[color:var(--color-ink)]">{d.display_name || "Your name"}</p>
            <p className="text-[13.5px] text-[color:var(--color-ink-3)]">{data.verification === "verified" ? "Identity checked by Migrent" : "Identity not checked"}</p>
          </div>
        </div>
        <ApplicantSnapshot s={snapshotFrom(d, data.avatar_url, me?.member_since ?? null, data.verification)} documents={[]} />
        <p className="mt-4 text-[12.5px] text-[color:var(--color-ink-4)]">Documents are listed on each application once you choose them.</p>
      </Dialog>
    </HubShell>
  );
}
