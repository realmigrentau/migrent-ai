import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, CheckCircle2, Clock, IdCard, PencilLine, Wallet } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { PageHero } from "../components/site";
import StatusPage from "../components/site/StatusPage";
import { Field, Input, Textarea } from "../components/hub/ui/Field";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ui/Toast";
import { hubFromSite } from "../lib/hub/routes";
import { API_BASE_URL as BASE_URL } from "../lib/apiBase";

/**
 * Sign up as a local mentor. One form instead of the old three steps.
 * The numbers are the backend's (routes_mentors.py): a price per session
 * from $15 to $100, and Migrent keeps 30%. New profiles are listed straight
 * away; payouts go through Stripe once the mentor sets them up.
 */

const PLATFORM_SHARE = 0.3;

const SPECIALTIES = [
  "Suburb orientation",
  "Public transport",
  "Shopping & groceries",
  "Healthcare & Medicare",
  "Banking setup",
  "School enrollment",
  "Local community groups",
  "Restaurant & food spots",
  "Safety tips",
  "Cultural guidance",
];

const LANGUAGES = ["English", "Mandarin", "Hindi", "Arabic", "Korean", "Vietnamese", "Tagalog", "Spanish", "Japanese", "Cantonese", "Tamil", "Urdu", "Thai", "Indonesian", "Nepali"];

type ReviewStatus = "pending" | "approved" | "rejected";
type MentorProfile = {
  suburb: string;
  postcode?: number | null;
  hourly_rate: number;
  languages?: string[];
  specialties?: string[];
  bio?: string | null;
  stripe_onboarding_complete?: boolean;
  review_status?: ReviewStatus;
  review_reason?: string | null;
};

function Chips({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-[13.5px] font-semibold text-[color:var(--color-ink)]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={selected.includes(o)} onClick={() => onToggle(o)} className="hc-chip !h-9 !w-auto !rounded-[10px] !px-3 !text-[13px]">
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function BecomeMentorPage() {
  const router = useRouter();
  const { session } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<MentorProfile | null>(null);
  const [checking, setChecking] = useState(true);
  const [created, setCreated] = useState(false);
  // After creating: "id_check" when they still need to upload a photo ID.
  const [nextStep, setNextStep] = useState<"id_check" | "approval" | null>(null);
  // Editing a profile Migrent sent back (or updating a listed one).
  const [editing, setEditing] = useState(false);
  // null until asked: whether Stripe can pay this mentor yet.
  const [payoutsReady, setPayoutsReady] = useState<boolean | null>(null);

  const [suburb, setSuburb] = useState("");
  const [postcode, setPostcode] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [rate, setRate] = useState(25);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!session?.access_token) {
      setChecking(false);
      return;
    }
    fetch(`${BASE_URL}/mentors/me/profile`, { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.mentor) {
          setExisting(data.mentor);
          setPayoutsReady(Boolean(data.mentor.stripe_onboarding_complete));
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [session]);

  // Back from Stripe's payout setup. Stripe sends people here whether or not
  // they finished, so ask the API what Stripe actually has on file.
  const stripeReturn = typeof router.query.stripe === "string" ? router.query.stripe : "";
  useEffect(() => {
    if (!stripeReturn || !session?.access_token) return;
    fetch(`${BASE_URL}/mentors/me/payout-status`, { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setPayoutsReady(Boolean(data.ready));
        if (data.ready) toast.success("Payouts are set up. People can now book you.");
        else toast.info("Payout setup is not finished yet. Pick up where you left off.");
      })
      .catch(() => {});
  }, [stripeReturn, session?.access_token, toast]);

  const toggle = (list: string[], set: (v: string[]) => void) => (v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const suburbError = touched && suburb.trim().length < 2 ? "Enter the suburb you know best." : null;
  const postcodeError = touched && postcode && !/^\d{3,4}$/.test(postcode) ? "A postcode is 4 digits." : null;
  const languageError = touched && languages.length === 0 ? "Pick at least one language." : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!session?.access_token) {
      window.location.assign(hubFromSite.signIn(router.asPath));
      return;
    }
    if (suburb.trim().length < 2 || languages.length === 0 || (postcode && !/^\d{3,4}$/.test(postcode))) return;
    setLoading(true);
    try {
      const updating = editing && existing;
      const res = await fetch(`${BASE_URL}/mentors${updating ? "/me" : ""}`, {
        method: updating ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          suburb: suburb.trim(),
          postcode: postcode ? parseInt(postcode, 10) : null,
          languages,
          bio: bio.trim() || null,
          specialties,
          hourly_rate: rate * 100,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "We could not save your mentor profile. Please try again.");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (updating) {
        setExisting(data.mentor ?? existing);
        setEditing(false);
        toast.success("Saved. Migrent will read your profile again before it is listed.");
        return;
      }
      setNextStep(data.next_step ?? null);
      setCreated(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startPayouts = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/mentors/stripe-onboard`, { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = res.ok ? await res.json() : null;
      if (data?.url) window.location.href = data.url;
      else toast.error("We could not start payout setup. Please try again.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // The page's heading and pitch render on the server too (MIG-051); only
  // the form waits for the check of an existing mentor profile.
  const intro = (
    <>
      <SEOHead title="Become a mentor" description="Help new arrivals settle into your suburb. You set your price per session; Migrent keeps 30%." />

      <PageHero
        eyebrow="Local mentors"
        crumbs={[{ label: "Home", href: "/" }, { label: "Local mentors", href: "/mentors" }, { label: "Become a mentor" }]}
        title={
          <>
            Help someone find <strong>their feet.</strong>
          </>
        }
        lead="Show a new arrival your suburb: the train, the shops, the doctor who speaks their language. You set your price per session, and Migrent keeps 30% of it."
        narrow
      />
    </>
  );

  if (checking) {
    return (
      <>
        {intro}
        <div className="min-h-[40vh]" aria-busy="true" />
      </>
    );
  }

  const startEditing = () => {
    if (!existing) return;
    setSuburb(existing.suburb || "");
    setPostcode(existing.postcode ? String(existing.postcode) : "");
    setLanguages(existing.languages?.length ? existing.languages : ["English"]);
    setSpecialties(existing.specialties ?? []);
    setBio(existing.bio ?? "");
    setRate(Math.round((existing.hourly_rate || 2500) / 100));
    setEditing(true);
  };

  if ((created || existing) && !editing) {
    const needsPayouts = !payoutsReady;
    // Mentors meet new arrivals, often in person, and are paid through
    // Migrent: nobody is listed until Migrent has checked their photo ID and
    // read their profile (backend routes_mentors, review_status).
    const status: ReviewStatus = created ? "pending" : existing?.review_status ?? "pending";
    const idLink = hubFromSite.path("/settings#verification");
    return (
      <>
        <SEOHead title={status === "approved" ? "Your mentor profile" : "Your mentor profile is in review"} noIndex />
        <StatusPage
          icon={status === "approved" ? <CheckCircle2 className="h-6 w-6" strokeWidth={1.9} /> : <Clock className="h-6 w-6" strokeWidth={1.9} />}
          tone={status === "approved" ? "success" : "primary"}
          eyebrow="Local mentor"
          title={
            status === "approved" ? (
              <>
                You are <strong>a mentor.</strong>
              </>
            ) : status === "rejected" ? (
              <>
                Your profile needs <strong>a change.</strong>
              </>
            ) : (
              <>
                Your profile is <strong>in review.</strong>
              </>
            )
          }
          actions={
            <>
              {status === "pending" && nextStep !== "approval" && (
                <a href={idLink} className="btn-primary btn-lg">
                  <IdCard className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" /> Upload your photo ID
                </a>
              )}
              {status === "rejected" && (
                <button type="button" onClick={startEditing} className="btn-primary btn-lg">
                  <PencilLine className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" /> Change your profile
                </button>
              )}
              {needsPayouts && (
                <button type="button" onClick={startPayouts} disabled={loading} data-state={loading ? "loading" : undefined} className={status === "approved" ? "btn-primary btn-lg" : "btn-secondary btn-lg"}>
                  <Wallet className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" /> Set up payouts
                </button>
              )}
              {status === "approved" && (
                <>
                  <button type="button" onClick={startEditing} className="btn-secondary btn-lg">
                    <PencilLine className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" /> Edit your profile
                  </button>
                  <Link href="/mentors" className="btn-secondary btn-lg">
                    See the mentor list
                  </Link>
                </>
              )}
            </>
          }
        >
          {status === "approved" && existing && (
            <p className="m-0">
              Listed in {existing.suburb}, ${(existing.hourly_rate / 100).toFixed(0)} a session. Changing your introduction sends it back to Migrent to read again.
            </p>
          )}
          {status === "pending" && (
            <p className="m-0">
              New arrivals may meet you in person, so Migrent lists a mentor only after checking their photo ID and reading their profile.{" "}
              {nextStep === "approval" ? "Your ID is already checked, so we only need to read your profile." : "Upload a passport, driver licence, national ID or visa grant notice in Migrent Hub."} We email you as soon as you are listed.
            </p>
          )}
          {status === "rejected" && <p className="m-0">Migrent asked for this before listing you: {existing?.review_reason || "please update your introduction."}</p>}
          {needsPayouts ? (
            <p className="m-0">People can book you once you are listed and have connected a bank account through Stripe. It takes a few minutes, and your 70% of each session is paid straight to you.</p>
          ) : (
            <p className="m-0">Payouts are set up. Your 70% of each session goes straight to your bank account through Stripe.</p>
          )}
        </StatusPage>
      </>
    );
  }

  const keep = Math.round(rate * (1 - PLATFORM_SHARE));

  return (
    <>
      {intro}

      <section className="site-section site-section--flush" aria-label="Mentor sign-up">
        <div className="site-shell site-shell--narrow">
          <form onSubmit={submit} noValidate className="site-card grid gap-10 p-[clamp(20px,3vw,40px)] lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
            <div>
              <p className="eyebrow">01</p>
              <h2 className="site-h3 site-h3--lg mt-2">Where you live</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_160px]">
              <Field label="Suburb" error={suburbError}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="Parramatta" autoComplete="address-level2" aria-describedby={describedBy} aria-invalid={invalid} />
                )}
              </Field>
              <Field label="Postcode" optional error={postcodeError}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} value={postcode} onChange={(e) => setPostcode(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="2150" autoComplete="postal-code" aria-describedby={describedBy} aria-invalid={invalid} />
                )}
              </Field>
            </div>

            <div className="border-t border-[var(--color-line)] pt-8 lg:col-span-2 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
              <div className="mb-6 lg:mb-0">
                <p className="eyebrow">02</p>
                <h2 className="site-h3 site-h3--lg mt-2">What you can help with</h2>
              </div>
              <div className="space-y-6">
                <Chips label="Languages you speak" options={LANGUAGES} selected={languages} onToggle={toggle(languages, setLanguages)} />
                {languageError && (
                  <p role="alert" className="-mt-3 text-[13px] text-[color:var(--color-danger-500)]">
                    {languageError}
                  </p>
                )}
                <Chips label="Things you know well" options={SPECIALTIES} selected={specialties} onToggle={toggle(specialties, setSpecialties)} />
              </div>
            </div>

            <div className="border-t border-[var(--color-line)] pt-8 lg:col-span-2 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
              <div className="mb-6 lg:mb-0">
                <p className="eyebrow">03</p>
                <h2 className="site-h3 site-h3--lg mt-2">About you and your price</h2>
              </div>
              <div className="space-y-6">
                <Field label="A short introduction" optional hint="How long you have lived there, and what you would show someone new.">
                  {({ id, describedBy }) => (
                    <Textarea id={id} value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={2000} placeholder="I have lived in Parramatta for ten years and I speak Hindi and English..." aria-describedby={describedBy} />
                  )}
                </Field>

                <div>
                  <label htmlFor="mentor-rate" className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">
                    Price per session
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <input id="mentor-rate" type="range" min={15} max={100} value={rate} onChange={(e) => setRate(parseInt(e.target.value, 10))} aria-valuetext={`$${rate} a session`} className="flex-1 accent-[var(--color-primary)]" />
                    <span className="min-w-[72px] text-right text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink)] tabular-nums">${rate}</span>
                  </div>
                  <p className="site-meta mt-2">
                    You receive about ${keep}. Migrent keeps ${rate - keep} (30%).
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3">
                  <button type="submit" disabled={loading} data-state={loading ? "loading" : undefined} className="btn-primary btn-lg">
                    {!session ? "Sign in to continue" : editing ? "Save and send for review" : "Create my mentor profile"}
                    <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  </button>
                  <p className="site-meta m-0">Migrent checks your photo ID and reads your profile before it is listed. To be paid, you then connect a bank account through Stripe.</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
