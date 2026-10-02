import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LifeBuoy, Mail, Newspaper, Scale, ShieldAlert } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { PageHero, Reveal } from "../components/site";
import { Segmented } from "../components/hub/ui/Field";
import { submitSupportRequest } from "../lib/api";
import { siteIdentity, supportPromise } from "../lib/siteIdentity";
import { Events, trackEvent } from "../lib/analytics";

/**
 * Contact: one form, and the right door for the things a form is wrong for
 * (an emergency, a legal notice, the press). The form posts to the same
 * support endpoint as before (lib/api.ts submitSupportRequest), which opens a
 * ticket in the Admin panel's Support queue. Reply times are the one promise
 * lib/siteIdentity.ts makes, nothing faster. ?topic=SAFETY&subject=... (from
 * a listing's "Tell us here") pre-fills the form.
 */

type Role = "seeker" | "owner" | "other";

const TOPICS = [
  { value: "ACCOUNT", label: "My account or signing in" },
  { value: "VERIFY", label: "ID checks" },
  { value: "LISTING", label: "A listing I manage" },
  { value: "APPLICATION", label: "An application or inspection" },
  { value: "BOOKING", label: "A stay booking or a fee" },
  { value: "SAFETY", label: "Safety, or reporting someone" },
  { value: "GENERAL", label: "Something else" },
] as const;

type Topic = (typeof TOPICS)[number]["value"];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("seeker");
  const [topic, setTopic] = useState<Topic>("GENERAL");
  const [subject, setSubject] = useState("");
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;
    const t = typeof router.query.topic === "string" ? router.query.topic.toUpperCase() : "";
    if (TOPICS.some((x) => x.value === t)) setTopic(t as Topic);
    const sub = typeof router.query.subject === "string" ? router.query.subject.slice(0, 120) : "";
    if (sub) setSubject(sub);
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [trap, setTrap] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Please tell us your name.";
    if (!email.trim()) e.email = "We need your email to reply.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "That email address does not look right.";
    if (!message.trim()) e.message = "Please add a short message.";
    else if (message.trim().length < 10) e.message = "Please write a little more, at least 10 characters, so we can help.";
    if (message.length > 2000) e.message = "Please keep it under 2,000 characters.";
    return e;
  }, [name, email, message]);

  const show = (k: string) => (touched[k] ? errors[k] : undefined);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errors).length) return;
    setSubmitting(true);
    setError("");
    const result = await submitSupportRequest({
      name: name.trim(),
      email: email.trim(),
      role: role === "owner" ? "owner" : "seeker",
      topic,
      subject: subject.trim() || undefined,
      message: role === "other" ? `${message.trim()}\n\n(They chose "Something else" for what they use Migrent for.)` : message.trim(),
      website: trap || undefined,
    });
    setSubmitting(false);
    if (!result) {
      setError(`We could not send your message just now. Please email ${siteIdentity.emails.support} instead.`);
      return;
    }
    if ("error" in result && typeof result.error === "string") {
      setError(result.error);
      return;
    }
    setReference(typeof result.reference === "string" ? result.reference : "");
    trackEvent(Events.CONTACT_FORM_SENT, { topic });
    setSubmitted(true);
  };

  return (
    <>
      <SEOHead title="Contact" description={`Contact Migrent. ${supportPromise()} Safety reports, legal notices and press enquiries each have their own route.`} />

      <PageHero
        eyebrow="Contact"
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        title={
          <>
            Talk to <strong>us.</strong>
          </>
        }
        lead={supportPromise()}
      />

      <section className="site-section site-section--flush" aria-label="Contact form and other routes">
        <div className="site-shell grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-8">
          <div className="site-card p-[clamp(20px,3vw,36px)]" id="contact-form">
            {submitted ? (
              <div className="flex flex-col items-start gap-4 py-6" role="status">
                <CheckCircle2 className="h-9 w-9 text-[color:var(--color-success-500)]" strokeWidth={1.75} aria-hidden="true" />
                <h2 className="site-h2 !text-[clamp(1.6rem,2.6vw,2.1rem)]">Thanks, {name.trim().split(" ")[0] || "we have it"}.</h2>
                <p className="site-body">
                  Your message is with us{reference ? ` (reference ${reference})` : ""}, and a confirmation is on its way. We will reply to {email.trim()}. {supportPromise()}
                </p>
                <Link href="/help" className="site-link">
                  Browse help while you wait <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5">
                <h2 className="site-h3 site-h3--lg">Send us a message</h2>
                {/* Spam trap: hidden from people and screen readers; bots fill it. */}
                <div aria-hidden="true" className="absolute -left-[10000px] top-0 h-px w-px overflow-hidden">
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="field-label">Your name</label>
                    <input id="c-name" className="input-field" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))} autoComplete="name" aria-invalid={Boolean(show("name"))} aria-describedby={show("name") ? "c-name-err" : undefined} />
                    {show("name") && <p id="c-name-err" className="field-error">{show("name")}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-email" className="field-label">Email</label>
                    <input id="c-email" type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} autoComplete="email" aria-invalid={Boolean(show("email"))} aria-describedby={show("email") ? "c-email-err" : undefined} />
                    {show("email") && <p id="c-email-err" className="field-error">{show("email")}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="field-label !mb-0" id="c-role-label">I am</span>
                  <Segmented<Role>
                    label="I am"
                    value={role}
                    onChange={setRole}
                    className="w-fit"
                    options={[
                      { value: "seeker", label: "Renting" },
                      { value: "owner", label: "Hosting" },
                      { value: "other", label: "Something else" },
                    ]}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-topic" className="field-label">What is it about?</label>
                    <select id="c-topic" className="input-field" value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>
                      {TOPICS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="c-subject" className="field-label">
                      Subject <span className="font-normal text-[color:var(--color-ink-3)]">(optional)</span>
                    </label>
                    <input id="c-subject" className="input-field" value={subject} maxLength={120} onChange={(e) => setSubject(e.target.value)} />
                  </div>
                </div>

                {topic === "SAFETY" && (
                  <p className="site-card site-card--muted site-card--pad site-body m-0" role="note">
                    If you are in danger, call 000 first. To report a listing or a conversation, you can also use its Report button.
                  </p>
                )}

                <div>
                  <label htmlFor="c-message" className="field-label">Message</label>
                  <textarea id="c-message" className="input-field min-h-[160px]" value={message} maxLength={2000} onChange={(e) => setMessage(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, message: true }))} aria-invalid={Boolean(show("message"))} aria-describedby={`c-message-count${show("message") ? " c-message-err" : ""}`} />
                  <div className="mt-1.5 flex justify-between gap-4">
                    {show("message") ? <p id="c-message-err" className="field-error !mt-0">{show("message")}</p> : <span />}
                    <span id="c-message-count" className="site-meta tabular-nums">{message.length} / 2,000</span>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="site-card site-card--pad site-body m-0 border-[var(--color-danger-500)]">
                    {error}
                  </p>
                )}

                <button type="submit" className="btn-primary btn-lg self-start" disabled={submitting} data-state={submitting ? "loading" : undefined}>
                  {submitting ? "Sending" : "Send message"}
                  {!submitting && <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />}
                </button>
              </form>
            )}
          </div>

          <aside className="flex flex-col gap-4" aria-label="Other ways to reach us">
            <Reveal className="site-card site-card--pad">
              <ShieldAlert className="h-5 w-5 text-[color:var(--color-danger-500)]" strokeWidth={1.9} aria-hidden="true" />
              <h2 className="site-h3 mt-3">Feel unsafe?</h2>
              <p className="site-body mt-1">Call 000 first. Then see <Link href="/safety-reporting" className="underline underline-offset-2">safety and reporting</Link>.</p>
            </Reveal>
            <Reveal delay={0.04} className="site-card site-card--pad">
              <LifeBuoy className="h-5 w-5 text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden="true" />
              <h2 className="site-h3 mt-3">Quick answers</h2>
              <p className="site-body mt-1">Most questions are answered in <Link href="/help" className="underline underline-offset-2">Help</Link>.</p>
            </Reveal>
            <Reveal delay={0.08} className="site-card site-card--pad">
              <Mail className="h-5 w-5 text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden="true" />
              <h2 className="site-h3 mt-3">Email</h2>
              <p className="site-body mt-1">
                <a href={`mailto:${siteIdentity.emails.support}`} className="underline underline-offset-2 [overflow-wrap:anywhere]">{siteIdentity.emails.support}</a>
              </p>
            </Reveal>
            <Reveal delay={0.12} className="site-card site-card--pad">
              <div className="flex gap-3">
                <Scale className="h-5 w-5 shrink-0 text-[color:var(--color-ink-2)]" strokeWidth={1.9} aria-hidden="true" />
                <p className="site-body m-0">Legal notices: <Link href="/contact-legal" className="underline underline-offset-2">legal contact</Link>.</p>
              </div>
              <div className="mt-3 flex gap-3">
                <Newspaper className="h-5 w-5 shrink-0 text-[color:var(--color-ink-2)]" strokeWidth={1.9} aria-hidden="true" />
                <p className="site-body m-0">Press: <Link href="/about#press" className="underline underline-offset-2">press details</Link>.</p>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
