import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useHCaptcha } from "@hcaptcha/react-hcaptcha/hooks";
import { Mail } from "lucide-react";
import AuthLayout, { AuthHeading, Divider, GoogleButton, hubCallbackUrl } from "../../components/hub/AuthLayout";
import HubLink, { useHubNavigate } from "../../components/hub/HubLink";
import { Button } from "../../components/hub/ui/Button";
import { Field, Input } from "../../components/hub/ui/Field";
import { InlineAlert } from "../../components/hub/ui/Feedback";
import { supabase } from "../../lib/supabase";
import { safeHubPath } from "../../lib/hub/routes";
import { useHub } from "../../lib/hub/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Migrent Hub sign-in. `next` (a Hub path) is where the person was going -
 * "Apply for this home", "Save", "Message the owner" - and they land there,
 * not on a generic home screen.
 */
export default function SignIn() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const { status } = useHub();
  const captcha = useHCaptcha();
  const next = safeHubPath(router.query.next);
  const intent = typeof router.query.intent === "string" ? router.query.intent : "";

  const [mode, setMode] = useState<"password" | "link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Already signed in: go straight on.
  useEffect(() => {
    if (!router.isReady) return;
    if (status === "ready" || status === "needs-onboarding" || status === "needs-mfa") void navigate(next, { replace: true });
  }, [status, router.isReady, next, navigate]);

  const reason =
    intent === "apply"
      ? "Sign in to apply. Your Rental Profile comes with you to every application."
      : intent === "save"
        ? "Sign in to save this home and get told if anything changes."
        : intent === "message"
          ? "Sign in to message the owner. Replies arrive in your Migrent Hub inbox."
          : intent === "inspect"
            ? "Sign in to book an inspection time."
            : intent === "list"
              ? "Sign in to list your property."
              : "Welcome back.";

  async function captchaToken(): Promise<string | undefined> {
    if (!captcha?.executeInstance) return undefined;
    try {
      return (await captcha.executeInstance()) ?? undefined;
    } catch {
      return undefined;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const errs: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = "Enter the email address you signed up with.";
    if (mode === "password" && !password) errs.password = "Enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const token = await captchaToken();
      if (mode === "link") {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: hubCallbackUrl(next), shouldCreateUser: false, ...(token ? { captchaToken: token } : {}) },
        });
        if (error) {
          const m = error.message.toLowerCase();
          setMessage(m.includes("rate") ? "Too many requests. Wait a minute and try again." : m.includes("signups not allowed") || m.includes("not found") ? "There is no account with that email. Create one instead." : error.message);
        } else setSent(true);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password, options: token ? { captchaToken: token } : undefined });
      if (error) {
        const m = error.message.toLowerCase();
        if (m.includes("invalid")) setMessage("That email and password do not match. Check both, or reset your password.");
        else if (m.includes("not confirmed")) setMessage("Confirm your email first - we sent you a link when you signed up.");
        else if (m.includes("rate") || m.includes("too many")) setMessage("Too many attempts. Wait a few minutes and try again.");
        else if (m.includes("captcha")) setMessage("The security check did not complete. Please try again.");
        else setMessage(error.message);
        return;
      }
      // The session provider picks up the new session; the effect above routes on.
    } catch {
      setMessage(typeof navigator !== "undefined" && !navigator.onLine ? "You appear to be offline. Reconnect and try again." : "Sign-in did not complete. Please try again.");
    } finally {
      captcha?.resetInstance?.();
      setLoading(false);
    }
  }

  const signUpHref = `/sign-up${router.query.next ? `?next=${encodeURIComponent(next)}` : ""}${intent ? `${router.query.next ? "&" : "?"}intent=${intent}` : ""}`;

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <AuthHeading title="Check your email" body={<>We sent a sign-in link to <strong className="text-[color:var(--color-ink)]">{email.trim()}</strong>. Open it on this device to finish signing in.</>} />
        <InlineAlert tone="info">Links work once and expire after an hour. Nothing arrived? Check spam, or try again in a minute.</InlineAlert>
        <Button variant="ghost" className="mt-6" onClick={() => setSent(false)}>
          Use a different email
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sign in">
      <AuthHeading title="Sign in to Migrent Hub" body={reason} />
      <GoogleButton next={next} />
      <Divider label="or with email" />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Email" error={errors.email}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} autoFocus />
          )}
        </Field>
        {mode === "password" && (
          <div className="flex flex-col gap-1.5">
            <Field label="Password" error={errors.password}>
              {({ id, describedBy, invalid }) => <Input id={id} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />}
            </Field>
            <HubLink to={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="self-end text-[13px] font-semibold text-[color:var(--color-primary)] hover:underline">
              Forgot your password?
            </HubLink>
          </div>
        )}
        {message && <InlineAlert tone="danger">{message}</InlineAlert>}
        <Button type="submit" size="lg" block loading={loading}>
          {mode === "password" ? "Sign in" : "Email me a sign-in link"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "password" ? "link" : "password");
            setMessage(null);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] py-2 text-[14px] font-semibold text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]"
        >
          <Mail className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {mode === "password" ? "Email me a sign-in link instead" : "Use my password instead"}
        </button>
      </form>
      <p className="mt-8 text-center text-[14px] text-[color:var(--color-ink-2)]">
        New to Migrent?{" "}
        <HubLink to={signUpHref} className="font-semibold text-[color:var(--color-primary)] hover:underline">
          Create an account
        </HubLink>
      </p>
    </AuthLayout>
  );
}
