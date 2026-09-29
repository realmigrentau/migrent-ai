import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CircleAlert, Eye, Info, PartyPopper, Plus, Send, ShieldCheck } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import { useHubNavigate } from "../../../components/hub/HubLink";
import { HomeCard } from "../../../components/hub/cards";
import PhotosStep from "../../../components/hub/wizard/PhotosStep";
import { DetailsStep, PropertyStep, RentStep, SpaceStep, previewCard } from "../../../components/hub/wizard/Steps";
import { Button, ButtonLink } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, SaveStatus, Skeleton } from "../../../components/hub/ui/Feedback";
import { Panel } from "../../../components/hub/ui/Layout";
import { useToast } from "../../../components/ui/Toast";
import { hubApi, HubError } from "../../../lib/hub/api";
import { aud } from "../../../lib/hub/format";
import { WIZARD_STEPS, draftProblems, stepOf, type Draft, type DraftData, type Problem, type StepKey } from "../../../lib/hub/listingDraft";
import { invalidate } from "../../../lib/hub/query";
import { useHub } from "../../../lib/hub/session";
import { decodePrefill } from "../../../lib/home/houseConfig";
import { cn } from "../../../lib/cn";

type SaveState = "idle" | "saving" | "saved" | "error";

function ReviewStep({ d, problems, goTo, verified, fee, payments }: { d: DraftData; problems: Problem[]; goTo: (k: StepKey) => void; verified: boolean; fee: number; payments: string }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-6">
        {problems.length > 0 ? (
          <InlineAlert tone="warning" title={`${problems.length} thing${problems.length === 1 ? "" : "s"} to finish`}>
            <ul className="mt-2 flex flex-col gap-1.5">
              {problems.map((p) => (
                <li key={`${p.step}-${p.field}`}>
                  <button type="button" onClick={() => goTo(stepOf(p.step))} className="text-left font-semibold underline underline-offset-2">
                    {p.message}
                  </button>
                </li>
              ))}
            </ul>
          </InlineAlert>
        ) : (
          <InlineAlert tone="success" title="Ready to send">
            Migrent reviews every listing before it goes live, usually within a working day. You'll get an email either way.
          </InlineAlert>
        )}
        {!verified && (
          <InlineAlert tone="info" title="Your ID check comes first">
            We only publish listings from owners whose ID Migrent has checked. Save it now: it waits as a draft until your check is done.
          </InlineAlert>
        )}
        <Panel className="flex flex-col gap-3">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">Description</p>
          <p className="text-[17px] font-semibold text-[color:var(--color-ink)]">{d.title || "No title yet"}</p>
          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-[color:var(--color-ink-2)]">{d.description || "No description yet."}</p>
        </Panel>
        <Panel className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-primary)]" strokeWidth={1.75} aria-hidden />
          <div className="flex flex-col gap-1 text-[13.5px] leading-relaxed text-[color:var(--color-ink-2)]">
            <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">What it costs</p>
            <p>
              Listing is free. Migrent&apos;s host fee is {aud(fee)} per property, charged once, when you accept the first stay booked through Migrent at that property. Migrent never handles rent or bond.
            </p>
            {payments !== "live" && <p className="text-[12.5px] text-[color:var(--color-ink-3)]">Card payments aren&apos;t switched on yet{payments === "test" ? " (test mode)" : ""}, so nothing is charged today.</p>}
          </div>
        </Panel>
      </div>
      <aside className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-[color:var(--color-ink-3)]">
          <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden /> How it looks in search
        </p>
        <div className="pointer-events-none" aria-hidden>
          <HomeCard listing={previewCard(d)} saveable={false} />
        </div>
      </aside>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function NewListingPage() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const toast = useToast();
  const reduce = useReducedMotion();
  const { me } = useHub();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [data, setData] = useState<DraftData>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>("idle");
  const [serverProblems, setServerProblems] = useState<Problem[] | null>(null);
  const [showErrors, setShowErrors] = useState<Set<StepKey>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ listing_id: string; property_id: string | null; needs_verification: boolean } | null>(null);
  const [fromHouse, setFromHouse] = useState(false);
  const started = useRef(false);
  const timer = useRef<number | null>(null);
  const dirty = useRef(false);
  const latest = useRef<{ data: DraftData; step: number }>({ data: {}, step: 0 });
  const top = useRef<HTMLDivElement>(null);

  const stepKey = (typeof router.query.step === "string" && WIZARD_STEPS.some((s) => s.key === router.query.step) ? router.query.step : "property") as StepKey;
  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === stepKey);

  // Start or resume a draft.
  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;
    const q = router.query;
    const existing = typeof q.draft === "string" ? q.draft : null;
    (async () => {
      try {
        let d: Draft;
        if (existing) {
          d = (await hubApi.get<{ draft: Draft }>(`/hub/listing-drafts/${existing}`)).draft;
        } else {
          // A draft started from the homepage house arrives with its answers
          // in ?prefill=. decodePrefill keeps only known fields and types.
          const prefill = decodePrefill(typeof q.prefill === "string" ? q.prefill : null);
          d = (
            await hubApi.post<{ draft: Draft }>("/hub/listing-drafts", {
              property_id: typeof q.property === "string" ? q.property : undefined,
              from_listing_id: typeof q.from === "string" ? q.from : undefined,
              data: prefill ?? undefined,
            })
          ).draft;
          if (prefill) setFromHouse(true);
          invalidate("/hub/properties");
        }
        setDraft(d);
        setData(d.data || {});
        latest.current = { data: d.data || {}, step: d.step || 0 };
        if (d.submitted_at && d.listing_id) setDone({ listing_id: d.listing_id, property_id: d.property_id, needs_verification: false });
        const step = typeof q.step === "string" ? q.step : WIZARD_STEPS[Math.min(d.step || 0, WIZARD_STEPS.length - 1)].key;
        void router.replace({ pathname: router.pathname, query: { draft: d.id, step } }, `${router.asPath.split("?")[0]}?draft=${d.id}&step=${step}`, { shallow: true });
      } catch (e) {
        setLoadError(e instanceof HubError ? e.message : "The listing couldn't be opened.");
      }
    })();
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback(async () => {
    if (!draft || !dirty.current) return true;
    dirty.current = false;
    setSave("saving");
    try {
      await hubApi.put(`/hub/listing-drafts/${draft.id}`, latest.current);
      setSave("saved");
      return true;
    } catch {
      dirty.current = true;
      setSave("error");
      return false;
    }
  }, [draft]);

  const set = useCallback(
    (patch: Partial<DraftData>) => {
      setData((prev) => {
        const next = { ...prev, ...patch };
        latest.current = { ...latest.current, data: next };
        return next;
      });
      setServerProblems(null);
      dirty.current = true;
      setSave("idle");
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void persist(), 800);
    },
    [persist],
  );

  // Never lose work: save on the way out.
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        void persist();
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      if (dirty.current) void persist();
    };
  }, [persist]);

  const localProblems = useMemo(() => draftProblems(data), [data]);
  const problems = serverProblems ?? localProblems;
  const problemsFor = (k: StepKey) => problems.filter((p) => stepOf(p.step) === k);
  const err = (field: string) => (showErrors.has(stepKey) || serverProblems ? problems.find((p) => p.field === field)?.message : undefined);

  const goTo = (k: StepKey) => {
    if (timer.current) window.clearTimeout(timer.current);
    setShowErrors((s) => new Set(s).add(stepKey));
    const idx = WIZARD_STEPS.findIndex((s) => s.key === k);
    latest.current = { ...latest.current, step: Math.max(latest.current.step, idx) };
    dirty.current = true;
    void persist();
    void router.replace({ pathname: router.pathname, query: { ...router.query, step: k } }, `${router.asPath.split("?")[0]}?draft=${draft?.id}&step=${k}`, { shallow: true, scroll: false });
    window.requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  async function submit() {
    if (!draft) return;
    setShowErrors(new Set(WIZARD_STEPS.map((s) => s.key)));
    if (localProblems.length) {
      toast.warning("A few things are still needed");
      return;
    }
    setSubmitting(true);
    if (timer.current) window.clearTimeout(timer.current);
    dirty.current = true;
    const ok = await persist();
    if (!ok) {
      setSubmitting(false);
      return toast.error("Your latest changes didn't save. Check your connection and try again.");
    }
    try {
      const res = await hubApi.post<{ listing_id: string; property_id: string | null; needs_verification: boolean }>(`/hub/listing-drafts/${draft.id}/submit`, {});
      invalidate("/hub/properties");
      invalidate("/hub/home");
      setDone(res);
      window.scrollTo({ top: 0 });
    } catch (e) {
      if (e instanceof HubError && e.problems?.length) {
        const list = e.problems.map((p) => ({ step: String(p.step ?? "review"), field: String(p.field ?? ""), message: String(p.message ?? "") }));
        setServerProblems(list);
        goTo(stepOf(list[0].step));
      }
      toast.error(e instanceof HubError ? e.message : "The listing didn't send.");
    } finally {
      setSubmitting(false);
    }
  }

  async function addAnother() {
    if (!done?.property_id) return navigate("/properties/new");
    try {
      const res = await hubApi.post<{ draft: Draft }>("/hub/listing-drafts", { property_id: done.property_id });
      window.location.assign(`${window.location.pathname}?draft=${res.draft.id}&step=space`);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't start.");
    }
  }

  const verified = me?.owner_verification?.status === "verified";
  const title = draft?.property_id ? "Add a listing" : "List a property";

  if (me && me.role !== "owner") {
    return (
      <HubShell title="List a property">
        <EmptyState title="Listing is for owner accounts" body="Your account is set up for renting. Switch to listing homes in Settings to list a property." action={<ButtonLink to="/settings#account-type">Open Settings</ButtonLink>} />
      </HubShell>
    );
  }

  if (loadError) {
    return (
      <HubShell title={title}>
        <ErrorState title="This listing couldn't be opened" message={loadError} onRetry={() => window.location.reload()} />
      </HubShell>
    );
  }

  if (done) {
    return (
      <HubShell title="Listing sent">
        <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex max-w-[560px] flex-col items-center gap-5 py-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]">
            {done.needs_verification || !verified ? <ShieldCheck className="h-8 w-8" strokeWidth={1.6} aria-hidden /> : <PartyPopper className="h-8 w-8" strokeWidth={1.6} aria-hidden />}
          </span>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[color:var(--color-ink)]">{done.needs_verification || !verified ? "Saved. Next, your ID check" : "Sent for review"}</h1>
          <p className="text-[15.5px] leading-relaxed text-[color:var(--color-ink-2)]">
            {done.needs_verification || !verified
              ? "Your listing is saved as a draft. Once Migrent has checked your ID, send it for review from the listing's page."
              : "Migrent reviews every listing before it goes live, usually within a working day. We'll email you when it's up, or if anything needs changing."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {done.needs_verification || !verified ? <ButtonLink to="/settings#verification">Check my ID</ButtonLink> : <ButtonLink to={`/listings/${done.listing_id}`}>View the listing</ButtonLink>}
            <Button variant="secondary" icon={<Plus className="h-4 w-4" strokeWidth={1.9} />} onClick={() => void addAnother()}>
              List another room here
            </Button>
          </div>
          <ButtonLink to="/properties" variant="ghost">
            Back to properties
          </ButtonLink>
        </motion.div>
      </HubShell>
    );
  }

  if (!draft) {
    return (
      <HubShell title={title}>
        <div className="flex flex-col gap-5" aria-busy="true">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-[420px] w-full rounded-[22px]" />
        </div>
      </HubShell>
    );
  }

  const step = WIZARD_STEPS[stepIndex];
  const last = stepIndex === WIZARD_STEPS.length - 1;
  const stepProps = { d: data, set, err };

  return (
    <HubShell title={title}>
      <div ref={top} className="scroll-mt-24" />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[color:var(--color-ink-3)]">
            {title} · Step {stepIndex + 1} of {WIZARD_STEPS.length}
          </p>
          <h1 className="hub-title text-[26px] font-semibold leading-[1.15] tracking-[-0.022em] text-[color:var(--color-ink)] sm:text-[30px]">{step.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <SaveStatus state={save} onRetry={() => void persist()} />
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (timer.current) window.clearTimeout(timer.current);
              await persist();
              void navigate("/properties");
            }}
          >
            Save and exit
          </Button>
        </div>
      </header>

      {fromHouse && (
        <InlineAlert tone="info" title="Started from the house you set up" className="mb-6">
          We filled in the rooms and features you chose on the homepage. Check each step: your home may differ from the model house.
        </InlineAlert>
      )}

      {/* Phone progress */}
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)] lg:hidden" role="progressbar" aria-valuemin={1} aria-valuemax={WIZARD_STEPS.length} aria-valuenow={stepIndex + 1} aria-label="Progress">
        <div className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-300" style={{ width: `${((stepIndex + 1) / WIZARD_STEPS.length) * 100}%` }} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:gap-12">
        <nav aria-label="Listing steps" className="hidden lg:sticky lg:top-10 lg:block lg:self-start">
          <ol className="flex flex-col gap-0.5">
            {WIZARD_STEPS.map((s, i) => {
              const open = problemsFor(s.key).length > 0 && s.key !== "review";
              const visited = i < latest.current.step || showErrors.has(s.key);
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => goTo(s.key)}
                    aria-current={s.key === stepKey ? "step" : undefined}
                    className={cn(
                      "flex h-11 w-full items-center gap-3 rounded-[12px] px-3 text-left text-[14px] font-medium transition-colors",
                      s.key === stepKey ? "bg-[var(--color-surface)] text-[color:var(--color-ink)] shadow-[0_0_0_1px_var(--color-line)]" : "text-[color:var(--color-ink-2)] hover:bg-[var(--color-surface-hover)]",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                        visited && !open && s.key !== "review" ? "bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]" : visited && open ? "bg-[color:color-mix(in_oklab,var(--color-warn-500)_18%,transparent)] text-[color:var(--color-warn-500)]" : "border border-[var(--color-line-2)] text-[color:var(--color-ink-3)]",
                      )}
                    >
                      {visited && !open && s.key !== "review" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : visited && open ? <CircleAlert className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
                    </span>
                    {s.short}
                    <span className="sr-only">{visited && open ? "(needs attention)" : visited ? "(done)" : ""}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={stepKey} initial={reduce ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
              <div className={cn(stepKey !== "review" && "rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-7")}>
                {stepKey === "property" && <PropertyStep {...stepProps} linked={Boolean(draft.property_id)} />}
                {stepKey === "space" && <SpaceStep {...stepProps} />}
                {stepKey === "details" && <DetailsStep {...stepProps} ai={Boolean(me?.features.ai_listing_assist)} />}
                {stepKey === "photos" && (
                  <>
                    <PhotosStep images={data.images ?? []} onChange={(images) => set({ images })} />
                    {err("images") && <p className="mt-4 text-[13px] font-medium text-[color:var(--color-danger-500)]">{err("images")}</p>}
                  </>
                )}
                {stepKey === "rent" && <RentStep {...stepProps} />}
                {stepKey === "review" && <ReviewStep d={data} problems={problems} goTo={goTo} verified={verified} fee={me?.features.fees.host_fee ?? 99} payments={me?.features.payments ?? "off"} />}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="hub-sticky-bar mt-8">
            <div className="flex items-center justify-between gap-3 rounded-[20px] border border-[var(--color-glass-line)] bg-[var(--color-glass)] p-2 shadow-[var(--shadow-pop)] backdrop-blur-xl">
              <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.9} />} onClick={() => goTo(WIZARD_STEPS[Math.max(0, stepIndex - 1)].key)} disabled={stepIndex === 0}>
                Back
              </Button>
              {last ? (
                <Button loading={submitting} icon={<Send className="h-4 w-4" strokeWidth={1.9} />} onClick={() => void submit()}>
                  {verified ? "Send for review" : "Save listing"}
                </Button>
              ) : (
                <Button iconRight={<ArrowRight className="h-4 w-4" strokeWidth={1.9} />} onClick={() => goTo(WIZARD_STEPS[stepIndex + 1].key)}>
                  {WIZARD_STEPS[stepIndex + 1].key === "review" ? "Review" : "Next"}
                </Button>
              )}
            </div>
          </div>
          {stepKey !== "review" && problemsFor(stepKey).length > 0 && showErrors.has(stepKey) && (
            <p className="mt-3 text-center text-[13px] text-[color:var(--color-ink-3)]">You can move on and come back: nothing is lost.</p>
          )}
        </div>
      </div>
    </HubShell>
  );
}
