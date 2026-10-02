import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CircleCheckBig, MessageSquareWarning, Pencil } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import HubLink, { useHubNavigate } from "../../../components/hub/HubLink";
import {
  AboutSection,
  DocumentsSection,
  HistorySection,
  HouseholdSection,
  RefereesSection,
  WorkSection,
  docKindLabel,
  refereeErrors,
} from "../../../components/hub/profile/sections";
import { Button, ButtonLink } from "../../../components/hub/ui/Button";
import { Checkbox, Field, Input, Select, Stepper, Textarea } from "../../../components/hub/ui/Field";
import { EmptyState, ErrorState, InlineAlert, ProgressBar, SaveStatus, Skeleton } from "../../../components/hub/ui/Feedback";
import { HomeImage } from "../../../components/hub/ui/Media";
import { hubApi, HubError, type Problem } from "../../../lib/hub/api";
import { aud, day, weekly } from "../../../lib/hub/format";
import { invalidate, setQueryData, useHubQuery } from "../../../lib/hub/query";
import { useHub } from "../../../lib/hub/session";
import type { ApplicationDetail, DocumentMeta } from "../../../lib/hub/types";
import { useRentalProfile, type SaveState } from "../../../lib/hub/useRentalProfile";
import { cn } from "../../../lib/cn";
import { Events, trackEvent } from "../../../lib/analytics";

const STEPS = [
  { key: "about", label: "About you" },
  { key: "household", label: "Household" },
  { key: "work", label: "Work and income" },
  { key: "history", label: "Rental history" },
  { key: "referees", label: "Referees" },
  { key: "documents", label: "Documents" },
  { key: "home", label: "This home" },
  { key: "review", label: "Review and send" },
] as const;
type StepKey = (typeof STEPS)[number]["key"];

interface AppDraft {
  move_in_date: string;
  lease_months: number | null;
  occupants: number;
  message: string;
  share_income: boolean;
  document_ids: string[];
}

function useStartApplication(listingId: string | undefined) {
  const [state, setState] = useState<{ id?: string; error?: HubError; redirect?: string }>({});
  useEffect(() => {
    if (!listingId) return;
    let alive = true;
    hubApi
      .post<{ application: { id: string; status: string } }>("/hub/applications", { listing_id: listingId })
      .then(({ application }) => {
        if (!alive) return;
        if (!["draft", "changes_requested"].includes(application.status)) setState({ redirect: `/applications/${application.id}` });
        else setState({ id: application.id });
      })
      .catch((e) => alive && setState({ error: e instanceof HubError ? e : new HubError("This application could not start.", 0) }));
    return () => {
      alive = false;
    };
  }, [listingId]);
  return state;
}

export default function Apply() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const reduce = useReducedMotion();
  const { role } = useHub();
  const listingId = typeof router.query.listingId === "string" ? router.query.listingId : undefined;
  const start = useStartApplication(role === "owner" ? undefined : listingId);
  const detailQ = useHubQuery<ApplicationDetail>(start.id ? `/hub/applications/${start.id}` : null);
  const profile = useRentalProfile();
  const detail = detailQ.data;

  const step: StepKey = (STEPS.find((s) => s.key === router.query.step)?.key ?? "about") as StepKey;
  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const [app, setApp] = useState<AppDraft | null>(null);
  const [appState, setAppState] = useState<SaveState>("idle");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [sent, setSent] = useState(false);
  const appTimer = useRef<number | null>(null);
  const latestApp = useRef<AppDraft | null>(null);
  const appDirty = useRef(false);
  const docs = profile.data?.documents ?? [];
  const [localDocs, setLocalDocs] = useState<DocumentMeta[] | null>(null);
  const allDocs = localDocs ?? docs;

  useEffect(() => {
    if (start.redirect) void navigate(start.redirect, { replace: true });
  }, [start.redirect, navigate]);

  useEffect(() => {
    if (!detail || app) return;
    const d: AppDraft = {
      move_in_date: detail.application.move_in_date || "",
      lease_months: detail.application.lease_months,
      occupants: detail.application.occupants || 1,
      message: detail.application.message || "",
      share_income: detail.application.share_income,
      document_ids: detail.documents.map((x) => x.id),
    };
    setApp(d);
    latestApp.current = d;
  }, [detail, app]);

  const saveApp = useCallback(async () => {
    if (!start.id || !latestApp.current || !appDirty.current) return true;
    appDirty.current = false;
    setAppState("saving");
    try {
      const a = latestApp.current;
      const res = await hubApi.patch<ApplicationDetail>(`/hub/applications/${start.id}`, {
        move_in_date: a.move_in_date || null,
        lease_months: a.lease_months,
        occupants: a.occupants,
        message: a.message,
        share_income: a.share_income,
        document_ids: a.document_ids,
      });
      setQueryData(`/hub/applications/${start.id}`, res);
      setAppState("saved");
      return true;
    } catch (e) {
      appDirty.current = true;
      setAppState("error");
      setErrors((x) => ({ ...x, app: e instanceof HubError ? e.message : "Your changes did not save." }));
      return false;
    }
  }, [start.id]);

  const updateApp = (patch: Partial<AppDraft>) => {
    setApp((prev) => {
      const next = { ...(prev as AppDraft), ...patch };
      latestApp.current = next;
      return next;
    });
    appDirty.current = true;
    setAppState("idle");
    if (appTimer.current) window.clearTimeout(appTimer.current);
    appTimer.current = window.setTimeout(() => void saveApp(), 900);
  };

  const goTo = useCallback(
    async (key: StepKey) => {
      await Promise.all([profile.flush(), saveApp()]);
      setProblems([]);
      void router.push({ pathname: router.pathname, query: { listingId, step: key } }, `${router.asPath.split("?")[0]}?step=${key}`, { shallow: true, scroll: false });
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    },
    [profile, saveApp, router, listingId, reduce],
  );

  const validate = (key: StepKey): Record<string, string> => {
    const d = profile.draft;
    const e: Record<string, string> = {};
    if (!d || !app) return e;
    if (key === "about") {
      if (!d.display_name.trim()) e.display_name = "Add your name.";
      if ((d.intro || "").trim().length < 40) e.intro = "Write a few sentences (at least 40 characters).";
    }
    if (key === "work" && !d.employment_status) e.employment_status = "Choose the option that fits best.";
    if (key === "work" && (d.employment_status === "employed" || d.employment_status === "self_employed") && !(d.employer || "").trim()) e.employer = "Add your employer, or choose a different option.";
    if (key === "referees") Object.assign(e, refereeErrors(d.referees || []));
    if (key === "home") {
      if (!app.move_in_date) e.move_in_date = "Choose a move-in date.";
      else if (app.move_in_date < new Date().toISOString().slice(0, 10)) e.move_in_date = "Choose a date from today onwards.";
    }
    return e;
  };

  const next = async () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector("[aria-invalid=true]")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      return;
    }
    if (stepIndex < STEPS.length - 1) await goTo(STEPS[stepIndex + 1].key);
  };

  const submit = async () => {
    if (!start.id) return;
    if (!consent) {
      setErrors({ consent: "Confirm you're happy to share this with the owner." });
      return;
    }
    setSubmitting(true);
    setProblems([]);
    const saved = await Promise.all([profile.flush(), saveApp()]);
    if (saved.some((s) => !s)) {
      setSubmitting(false);
      setProblems([{ message: "Some changes did not save. Check your connection and try again." }]);
      return;
    }
    try {
      await hubApi.post(`/hub/applications/${start.id}/submit`);
      trackEvent(Events.APPLICATION_SUBMITTED);
      invalidate("/hub/applications");
      invalidate("/hub/home");
      invalidate("/hub/counts");
      setSent(true);
    } catch (e) {
      if (e instanceof HubError) setProblems(e.problems.length ? e.problems : [{ message: e.message }]);
      else setProblems([{ message: "The application did not send. Please try again." }]);
    } finally {
      setSubmitting(false);
    }
  };

  const listing = detail?.listing;
  const changesNote = useMemo(() => {
    if (detail?.application.status !== "changes_requested") return null;
    const ev = [...(detail.events ?? [])].reverse().find((x) => x.event === "changes_requested" || x.event === "corrections_requested");
    return ev?.note ?? null;
  }, [detail]);

  if (role === "owner") {
    return (
      <HubShell title="Apply">
        <EmptyState title="Applications come from renter accounts" body="Your account is set up for listing properties. To apply for a home, switch your account type in Settings." action={<ButtonLink to="/settings#account-type">Open Settings</ButtonLink>} />
      </HubShell>
    );
  }
  if (start.error) {
    return (
      <HubShell title="Apply">
        {start.error.status === 404 ? (
          <EmptyState title="This home isn't taking applications" body="It may have been taken or the listing has ended." action={<ButtonLink to="/discover">Find similar homes</ButtonLink>} />
        ) : (
          <ErrorState message={start.error.message} offline={start.error.offline} onRetry={() => router.reload()} />
        )}
      </HubShell>
    );
  }
  if (!detail || !profile.draft || !app) {
    return (
      <HubShell title="Apply">
        <div className="flex flex-col gap-6" role="status" aria-busy="true">
          <span className="sr-only">Preparing your application</span>
          <Skeleton className="h-9 w-80 max-w-full" />
          <Skeleton className="h-96 w-full rounded-[22px]" />
        </div>
      </HubShell>
    );
  }

  if (sent) {
    return (
      <HubShell title="Application sent">
        <motion.div initial={reduce ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mx-auto flex max-w-[560px] flex-col items-center gap-6 py-10 text-center">
          <motion.div initial={reduce ? false : { scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.1 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]">
            <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
          </motion.div>
          <div className="flex flex-col gap-2">
            <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-[color:var(--color-ink)]">Your application has been sent.</h1>
            <p className="text-[15.5px] leading-relaxed text-[color:var(--color-ink-2)]">
              {detail.owner?.name ? `${detail.owner.name.split(" ")[0]} will` : "The owner will"} see it now. You'll get a message here and by email at every step - when it's opened, and when there's a decision.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink to={`/applications/${start.id}`} size="lg">
              Track this application
            </ButtonLink>
            <ButtonLink to="/discover" size="lg" variant="secondary">
              Keep looking
            </ButtonLink>
          </div>
        </motion.div>
      </HubShell>
    );
  }

  const d = profile.draft;
  const combinedState: SaveState = profile.state === "error" || appState === "error" ? "error" : profile.state === "saving" || appState === "saving" ? "saving" : profile.state === "saved" || appState === "saved" ? "saved" : "idle";

  const body = (() => {
    switch (step) {
      case "about":
        return <AboutSection value={d} onChange={profile.update} errors={errors} />;
      case "household":
        return <HouseholdSection value={d} onChange={profile.update} />;
      case "work":
        return <WorkSection value={d} onChange={profile.update} errors={errors} shareIncome={app.share_income} onShareIncome={(v) => updateApp({ share_income: v })} />;
      case "history":
        return <HistorySection value={d} onChange={profile.update} />;
      case "referees":
        return <RefereesSection value={d} onChange={profile.update} errors={errors} />;
      case "documents":
        return (
          <>
            <p className="text-[14.5px] leading-relaxed text-[color:var(--color-ink-2)]">Tick the documents to share with this owner. They'll only be able to open them while your application is active.</p>
            <DocumentsSection documents={allDocs} selectable selected={app.document_ids} onSelect={(ids) => updateApp({ document_ids: ids })} onUploaded={(doc) => setLocalDocs([doc, ...allDocs])} />
          </>
        );
      case "home":
        return (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Move-in date" error={errors.move_in_date}>
                {({ id, describedBy, invalid }) => <Input id={id} type="date" min={new Date().toISOString().slice(0, 10)} value={app.move_in_date} onChange={(e) => updateApp({ move_in_date: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
              </Field>
              <Field label="How long would you like to stay?">
                {({ id }) => (
                  <Select id={id} value={app.lease_months ?? ""} onChange={(e) => updateApp({ lease_months: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">Flexible</option>
                    <option value="1">1 month</option>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="24">2 years</option>
                  </Select>
                )}
              </Field>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">How many people will live there, including you?</span>
              <Stepper label="People" value={app.occupants} min={1} max={20} onChange={(v) => updateApp({ occupants: v })} />
            </div>
            <Field label={`A note to ${detail.owner?.name?.split(" ")[0] || "the owner"}`} optional hint="Why this home suits you - the inspection, the location, your timing.">
              {({ id, describedBy }) => <Textarea id={id} rows={4} value={app.message} onChange={(e) => updateApp({ message: e.target.value.slice(0, 2000) })} aria-describedby={describedBy} />}
            </Field>
          </>
        );
      case "review":
        return (
          <ReviewStep
            detail={detail}
            profileName={d.display_name}
            intro={d.intro}
            household={`${d.household_adults} adult${d.household_adults === 1 ? "" : "s"}${d.household_children ? `, ${d.household_children} child${d.household_children === 1 ? "" : "ren"}` : ""}${d.has_pets ? `, pets (${d.pet_details || "details in profile"})` : ""}`}
            work={[d.employment_status ? d.employment_status.replace("_", " ") : "", d.employer, d.job_title].filter(Boolean).join(" · ")}
            income={app.share_income && d.income_weekly ? `${aud(d.income_weekly)} a week (shared)` : d.income_weekly ? "Not shared with this owner" : "Not provided"}
            history={d.first_time_renter && !(d.rental_history || []).length ? "First rental in Australia" : `${(d.rental_history || []).filter((h) => h.suburb.trim()).length} previous home(s)`}
            referees={(d.referees || []).filter((r) => r.name.trim()).map((r) => `${r.name} (${r.relationship})`)}
            documents={allDocs.filter((x) => app.document_ids.includes(x.id)).map((x) => x.label || docKindLabel(x.kind))}
            app={app}
            onEdit={(k) => void goTo(k)}
          />
        );
    }
  })();

  return (
    <HubShell title={`Apply: ${listing?.title ?? "home"}`}>
      <div className="flex flex-col gap-6 pb-28 lg:pb-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <HubLink to={listing ? `/homes/${listing.id}` : "/applications"} className="inline-flex items-center gap-1 text-[13.5px] font-medium text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Back to the home
          </HubLink>
          <div className="flex items-center gap-4">
            <SaveStatus state={combinedState} onRetry={() => void Promise.all([profile.flush(), saveApp()])} />
            <HubLink to="/applications" className="text-[13.5px] font-semibold text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]">
              Save and finish later
            </HubLink>
          </div>
        </div>

        <header className="flex items-center gap-4 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
          <HomeImage src={listing?.image} alt="" className="h-16 w-20 shrink-0" rounded="rounded-[14px]" sizes="96px" />
          <div className="flex min-w-0 flex-col">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-[color:var(--color-ink-3)]">{detail.application.status === "changes_requested" ? "Updating your application" : "Applying for"}</p>
            <h1 className="truncate text-[19px] font-semibold text-[color:var(--color-ink)]">{listing?.title}</h1>
            <p className="truncate text-[13.5px] text-[color:var(--color-ink-2)]">
              {weekly(listing?.weekly_price)} · {listing?.display_address}
            </p>
          </div>
        </header>

        {changesNote && (
          <InlineAlert tone="warning" title={detail.application.changes_requested_by === "migrent" ? "Migrent asked for more information" : "The owner asked for more information"}>
            {changesNote}
          </InlineAlert>
        )}

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Step list */}
          <nav aria-label="Application steps" className="hidden lg:block">
            <ol className="sticky top-10 flex flex-col gap-1">
              {STEPS.map((s, i) => {
                const current = s.key === step;
                const done = i < stepIndex;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => void goTo(s.key)}
                      aria-current={current ? "step" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[14px] font-semibold transition-colors",
                        current ? "bg-[var(--color-surface)] text-[color:var(--color-ink)] shadow-[0_0_0_1px_var(--color-line)]" : "text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-colors",
                          current ? "bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]" : done ? "bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]" : "bg-[var(--color-surface-muted)] text-[color:var(--color-ink-3)]",
                        )}
                        aria-hidden
                      >
                        {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                      </span>
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-2 lg:hidden">
              <p className="text-[13px] font-semibold text-[color:var(--color-ink-3)]">
                Step {stepIndex + 1} of {STEPS.length}
              </p>
              <ProgressBar value={((stepIndex + 1) / STEPS.length) * 100} label="Application progress" />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.section
                key={step}
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -16 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                aria-labelledby="apply-step-title"
                className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-7"
              >
                <h2 id="apply-step-title" className="mb-1 text-[21px] font-semibold tracking-[-0.015em] text-[color:var(--color-ink)]">
                  {STEPS[stepIndex].label}
                </h2>
                <p className="mb-6 text-[14px] text-[color:var(--color-ink-3)]">
                  {step === "review" ? "Check everything, then send." : stepIndex < 5 ? "Saved to your Rental Profile, so your next application is already done." : "Only for this application."}
                </p>
                <div className="flex flex-col gap-5">{body}</div>
                {step === "review" && (
                  <div className="mt-8 flex flex-col gap-4 border-t border-[var(--color-line)] pt-6">
                    <Checkbox
                      checked={consent}
                      onChange={(v) => {
                        setConsent(v);
                        setErrors((x) => ({ ...x, consent: undefined }));
                      }}
                      label={`I'm happy for ${detail.owner?.name?.split(" ")[0] || "the owner"} and Migrent to see this application`}
                      description="Owners see a copy of your profile as it is now, plus the documents you ticked. They never see anything else about you."
                    />
                    {errors.consent && <p role="alert" className="pl-8 text-[13px] text-[color:var(--color-danger-500)]">{errors.consent}</p>}
                    {problems.length > 0 && (
                      <InlineAlert tone="warning" title="A few things are needed first">
                        <ul className="mt-1 list-disc pl-4">
                          {problems.map((p) => (
                            <li key={p.message}>{p.message}</li>
                          ))}
                        </ul>
                      </InlineAlert>
                    )}
                  </div>
                )}
              </motion.section>
            </AnimatePresence>

            <div className="hub-sticky-bar flex items-center justify-between gap-3 rounded-[18px] border border-[var(--color-glass-line)] bg-[var(--color-glass)] p-3 backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.9} />} disabled={stepIndex === 0} onClick={() => void goTo(STEPS[Math.max(0, stepIndex - 1)].key)}>
                Back
              </Button>
              {step === "review" ? (
                <Button size="lg" loading={submitting} onClick={() => void submit()}>
                  {detail.application.status === "changes_requested" ? "Send updated application" : "Send application"}
                </Button>
              ) : (
                <Button size="lg" iconRight={<ArrowRight className="h-4 w-4" strokeWidth={1.9} />} onClick={() => void next()}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </HubShell>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] py-4 last:border-0">
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-[13px] font-medium text-[color:var(--color-ink-3)]">{label}</dt>
        <dd className="text-[15px] leading-relaxed text-[color:var(--color-ink)]">{value}</dd>
      </div>
      {onEdit && (
        <Button variant="ghost" size="sm" icon={<Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />} onClick={onEdit} aria-label={`Edit ${label}`}>
          Edit
        </Button>
      )}
    </div>
  );
}

function ReviewStep(props: {
  detail: ApplicationDetail;
  profileName: string;
  intro: string | null;
  household: string;
  work: string;
  income: string;
  history: string;
  referees: string[];
  documents: string[];
  app: AppDraft;
  onEdit: (k: StepKey) => void;
}) {
  const p = props;
  const missing = p.detail.completion?.items.filter((i) => !i.done) ?? [];
  return (
    <>
      {missing.length > 0 && (
        <InlineAlert tone="neutral" title="Optional, but owners notice">
          {missing.map((m) => m.label).join(", ")}. You can send without them.
        </InlineAlert>
      )}
      <dl>
        <ReviewRow label="You" value={<><span className="font-semibold">{p.profileName || "Name missing"}</span><br />{p.intro || <span className="text-[color:var(--color-danger-500)]">Introduction missing</span>}</>} onEdit={() => p.onEdit("about")} />
        <ReviewRow label="Household" value={p.household} onEdit={() => p.onEdit("household")} />
        <ReviewRow label="Work" value={p.work || <span className="text-[color:var(--color-danger-500)]">Not added</span>} onEdit={() => p.onEdit("work")} />
        <ReviewRow label="Income" value={p.income} onEdit={() => p.onEdit("work")} />
        <ReviewRow label="Rental history" value={p.history} onEdit={() => p.onEdit("history")} />
        <ReviewRow label="Referees" value={p.referees.length ? p.referees.join(", ") : "None added"} onEdit={() => p.onEdit("referees")} />
        <ReviewRow label="Documents shared" value={p.documents.length ? p.documents.join(", ") : "None"} onEdit={() => p.onEdit("documents")} />
        <ReviewRow
          label="This home"
          value={
            <>
              Moving in {p.app.move_in_date ? day(p.app.move_in_date) : <span className="text-[color:var(--color-danger-500)]">date missing</span>} · {p.app.lease_months ? `${p.app.lease_months} months` : "flexible length"} · {p.app.occupants} {p.app.occupants === 1 ? "person" : "people"}
              {p.app.message && (
                <>
                  <br />
                  <span className="text-[color:var(--color-ink-2)]">"{p.app.message}"</span>
                </>
              )}
            </>
          }
          onEdit={() => p.onEdit("home")}
        />
      </dl>
      <p className="flex items-start gap-2 text-[13px] leading-snug text-[color:var(--color-ink-3)]">
        <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        Decisions are made by the owner, then checked by Migrent. Nothing about your application is scored or ranked automatically.
      </p>
      <p className="flex items-start gap-2 text-[13px] leading-snug text-[color:var(--color-ink-3)]">
        <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        Never pay rent, bond or a holding deposit before you've inspected the home and signed an agreement.
      </p>
    </>
  );
}
