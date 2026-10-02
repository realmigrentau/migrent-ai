import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Briefcase, Building2, Home, Search } from "lucide-react";
import { HubMark } from "../../components/hub/HubShell";
import { ThemeIconButton } from "../../components/hub/ThemeToggle";
import { useHubNavigate } from "../../components/hub/HubLink";
import { Button } from "../../components/hub/ui/Button";
import { Checkbox, ChoiceCard, Field, Input } from "../../components/hub/ui/Field";
import { InlineAlert, Skeleton } from "../../components/hub/ui/Feedback";
import { hubApi, HubError } from "../../lib/hub/api";
import { setQueryData } from "../../lib/hub/query";
import { hubSignInUrl, safeHubPath, siteUrl } from "../../lib/hub/routes";
import { useHub } from "../../lib/hub/session";
import type { HubMe } from "../../lib/hub/types";
import { Events, trackEvent } from "../../lib/analytics";

/**
 * Onboarding is one screen: what are you here to do, what should we call
 * you, and the two confirmations the law and our terms need. Everything
 * else is asked for later, when it is needed.
 */
export default function Welcome() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const { status, me, session } = useHub();
  const reduce = useReducedMotion();
  const next = safeHubPath(router.query.next);
  const [role, setRole] = useState<"renter" | "owner" | null>(null);
  const [kind, setKind] = useState<"individual" | "property_manager">("individual");
  const [name, setName] = useState("");
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.role === "owner" || next.startsWith("/properties/new")) setRole((r) => r ?? "owner");
    if (next.startsWith("/apply") || next.startsWith("/homes")) setRole((r) => r ?? "renter");
  }, [router.isReady, router.query.role, next]);

  useEffect(() => {
    if (status === "signed-out") void router.replace(hubSignInUrl(`/welcome?next=${encodeURIComponent(next)}`));
    if (status === "ready") void navigate(next, { replace: true });
  }, [status, next, router, navigate]);

  useEffect(() => {
    if (!name) {
      const meta = session?.user.user_metadata ?? {};
      const guess = me?.name || meta.full_name || meta.name || "";
      if (guess) setName(String(guess));
    }
  }, [me, session]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return setError("Choose what you are here to do.");
    if (!name.trim()) return setError("Tell us what to call you.");
    if (!adult || !terms) return setError("Please confirm both boxes to continue.");
    setError(null);
    setSaving(true);
    try {
      const updated = await hubApi.post<HubMe>("/hub/onboarding", { role, name: name.trim(), owner_kind: role === "owner" ? kind : undefined, over_18: adult, accept_terms: terms });
      setQueryData("/hub/me", updated);
      trackEvent(Events.ONBOARDING_COMPLETED, { role });
      const dest = next === "/" && role === "owner" ? "/" : next;
      void navigate(dest, { replace: true });
    } catch (err) {
      setError(err instanceof HubError ? err.message : "That did not save. Please try again.");
      setSaving(false);
    }
  }

  const loading = status === "loading" || !router.isReady;

  return (
    <div className="hub min-h-[100dvh]">
      <Head>
        <title>Welcome · Migrent Hub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mx-auto flex min-h-[100dvh] max-w-[640px] flex-col px-5 pb-12 pt-6">
        <div className="flex items-center justify-between">
          <HubMark />
          <ThemeIconButton />
        </div>
        {loading ? (
          <div className="mt-16 flex flex-col gap-4" role="status" aria-busy="true">
            <span className="sr-only">Loading</span>
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full rounded-[16px]" />
            <Skeleton className="h-24 w-full rounded-[16px]" />
          </div>
        ) : (
          <form onSubmit={submit} className="mt-12 flex flex-col gap-10" noValidate>
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">Welcome to Migrent Hub</p>
              <h1 className="hub-display text-[36px] leading-[1.1] text-[color:var(--color-ink)] sm:text-[42px]">What are you here to do?</h1>
              <p className="text-[15px] text-[color:var(--color-ink-2)]">This shapes your Hub. You can change it later in Settings.</p>
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">What are you here to do?</legend>
              <ChoiceCard name="role" value="renter" selected={role === "renter"} onSelect={() => setRole("renter")} icon={<Search className="h-5 w-5" strokeWidth={1.75} />} title="Find a place" description="I want to find and apply for somewhere to live." />
              <ChoiceCard name="role" value="owner" selected={role === "owner"} onSelect={() => setRole("owner")} icon={<Building2 className="h-5 w-5" strokeWidth={1.75} />} title="List a property" description="I own or manage a property I want to rent out." />
            </fieldset>

            <AnimatePresence initial={false}>
              {role === "owner" && (
                <motion.fieldset
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduce ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-3 overflow-hidden"
                >
                  <legend className="mb-3 text-[15px] font-semibold text-[color:var(--color-ink)]">Is it yours, or are you managing it?</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceCard name="kind" value="individual" selected={kind === "individual"} onSelect={() => setKind("individual")} icon={<Home className="h-5 w-5" strokeWidth={1.75} />} title="It's mine" description="I own the property or room." />
                    <ChoiceCard name="kind" value="property_manager" selected={kind === "property_manager"} onSelect={() => setKind("property_manager")} icon={<Briefcase className="h-5 w-5" strokeWidth={1.75} />} title="I manage it" description="I manage it for the owner." />
                  </div>
                </motion.fieldset>
              )}
            </AnimatePresence>

            <Field label="What should we call you?" hint="Owners and renters see this name.">
              {({ id, describedBy }) => <Input id={id} autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} aria-describedby={describedBy} maxLength={80} />}
            </Field>

            <div className="flex flex-col gap-2 rounded-[16px] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <Checkbox checked={adult} onChange={setAdult} label="I am 18 or older" />
              <Checkbox
                checked={terms}
                onChange={setTerms}
                label={
                  <>
                    I accept the{" "}
                    <a href={siteUrl("/terms-of-service")} target="_blank" rel="noreferrer" className="font-semibold text-[color:var(--color-primary)] hover:underline">
                      Terms of Service
                    </a>
                    ,{" "}
                    <a href={siteUrl("/privacy-policy")} target="_blank" rel="noreferrer" className="font-semibold text-[color:var(--color-primary)] hover:underline">
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href={siteUrl("/anti-discrimination")} target="_blank" rel="noreferrer" className="font-semibold text-[color:var(--color-primary)] hover:underline">
                      fair housing policy
                    </a>
                  </>
                }
              />
            </div>

            {error && <InlineAlert tone="danger">{error}</InlineAlert>}
            <div className="flex items-center gap-3">
              <Button type="submit" size="lg" loading={saving} className="min-w-[180px]">
                {role === "owner" ? "Set up my Hub" : "Continue"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
