import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCaptcha } from "../../lib/captcha";
import { MailCheck } from "lucide-react";
import AuthLayout, { AuthHeading, Divider, GoogleButton, hubCallbackUrl } from "../../components/hub/AuthLayout";
import HubLink, { useHubNavigate } from "../../components/hub/HubLink";
import { Button } from "../../components/hub/ui/Button";
import { Checkbox, Field, Input } from "../../components/hub/ui/Field";
import { InlineAlert } from "../../components/hub/ui/Feedback";
import { supabase } from "../../lib/supabase";
import { safeHubPath, siteUrl } from "../../lib/hub/routes";
import { useHub } from "../../lib/hub/session";
import { Events, trackEvent } from "../../lib/analytics";
import EmailInboxHelp from "../../components/EmailInboxHelp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordProblem(p: string): string | null {
  if (p.length < 10) return "Use at least 10 characters.";
  if (!/[a-zA-Z]/.test(p) || !/\d/.test(p)) return "Mix letters and at least one number.";
  return null;
}

export default function SignUp() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const { status } = useHub();
  const captcha = useCaptcha();
  const next = safeHubPath(router.query.next);
  const intent = typeof router.query.intent === "string" ? router.query.intent : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; agreed?: string }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (status === "ready" || status === "needs-onboarding") void navigate(next, { replace: true });
  }, [status, next, navigate]);

  // After confirming, onboarding asks the one question that matters.
  const welcome = `/welcome?next=${encodeURIComponent(next)}${intent === "list" ? "&role=owner" : ""}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const errs: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address.";
    const pw = passwordProblem(password);
    if (pw) errs.password = pw;
    if (!agreed) errs.agreed = "You need to accept the terms to create an account.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    trackEvent(Events.SIGNUP_STARTED, { intent: intent || "none" });
    try {
      let token: string | undefined;
      if (captcha?.executeInstance) token = (await captcha.executeInstance().catch(() => undefined)) ?? undefined;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: hubCallbackUrl(welcome),
          data: { legal_accepted_at: new Date().toISOString() },
          ...(token ? { captchaToken: token } : {}),
        },
      });
      if (error) {
        const m = error.message.toLowerCase();
        if (m.includes("already")) setMessage("There is already an account with that email. Sign in instead.");
        else if (m.includes("password")) setMessage(error.message);
        else if (m.includes("rate")) setMessage("Too many attempts. Wait a few minutes and try again.");
        else setMessage("We could not create the account. Please try again.");
        return;
      }
      // With email confirmation off, Supabase returns a session at once.
      if (data.session) void navigate(welcome, { replace: true });
      else setSent(true);
    } catch {
      setMessage("We could not create the account. Check your connection and try again.");
    } finally {
      captcha?.resetInstance?.();
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Confirm your email">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]">
          <MailCheck className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
        <AuthHeading title="Confirm your email" body={<>We sent a link to <strong className="text-[color:var(--color-ink)]">{email.trim()}</strong>. Open it to finish setting up - it takes you straight back here.</>} />
        <EmailInboxHelp className="mb-4" />
        {resent ? (
          <InlineAlert tone="success">Sent again. It can take a minute to arrive.</InlineAlert>
        ) : (
          <Button
            variant="secondary"
            onClick={async () => {
              await supabase.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: hubCallbackUrl(welcome) } });
              setResent(true);
            }}
          >
            Send the email again
          </Button>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account">
      <AuthHeading title="Create your Migrent account" body={intent === "list" ? "List a property, review applicants and manage tenancies in one place." : "Find, apply for and manage your next home in one place. Free for renters."} />
      <GoogleButton next={welcome} label="Sign up with Google" />
      <Divider label="or with email" />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Email" error={errors.email}>
          {({ id, describedBy, invalid }) => <Input id={id} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} autoFocus />}
        </Field>
        <Field label="Password" hint="At least 10 characters, with letters and a number." error={errors.password}>
          {({ id, describedBy, invalid }) => <Input id={id} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />}
        </Field>
        <div className="flex flex-col gap-1">
          <Checkbox
            checked={agreed}
            onChange={setAgreed}
            label={
              <>
                I agree to the{" "}
                <a href={siteUrl("/terms-of-service")} className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href={siteUrl("/privacy-policy")} className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                  Privacy Policy
                </a>
              </>
            }
          />
          {errors.agreed && (
            <p role="alert" className="pl-8 text-[13px] text-[color:var(--color-danger-500)]">
              {errors.agreed}
            </p>
          )}
        </div>
        {message && <InlineAlert tone="danger">{message}</InlineAlert>}
        <Button type="submit" size="lg" block loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-8 text-center text-[14px] text-[color:var(--color-ink-2)]">
        Already have an account?{" "}
        <HubLink to={`/sign-in${router.query.next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-[color:var(--color-primary)] hover:underline">
          Sign in
        </HubLink>
      </p>
    </AuthLayout>
  );
}
