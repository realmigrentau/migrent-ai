import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCaptcha } from "../../lib/captcha";
import AuthLayout, { AuthHeading, hubCallbackUrl } from "../../components/hub/AuthLayout";
import HubLink from "../../components/hub/HubLink";
import { Button } from "../../components/hub/ui/Button";
import { Field, Input } from "../../components/hub/ui/Field";
import { InlineAlert } from "../../components/hub/ui/Feedback";
import { supabase } from "../../lib/supabase";
import EmailInboxHelp from "../../components/EmailInboxHelp";

export default function ForgotPassword() {
  const router = useRouter();
  const captcha = useCaptcha();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof router.query.email === "string") setEmail(router.query.email);
  }, [router.query.email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter the email address on your account.");
      return;
    }
    setError(null);
    setLoading(true);
    let token: string | undefined;
    if (captcha?.executeInstance) token = (await captcha.executeInstance().catch(() => undefined)) ?? undefined;
    const { error: e2 } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: hubCallbackUrl("/reset-password"),
      ...(token ? { captchaToken: token } : {}),
    });
    captcha?.resetInstance?.();
    setLoading(false);
    // Say the same thing whether or not the account exists: the form must
    // not reveal who has an account.
    if (e2 && /rate/i.test(e2.message)) setError("Too many requests. Wait a minute and try again.");
    else setSent(true);
  }

  return (
    <AuthLayout title="Reset your password">
      {sent ? (
        <>
          <AuthHeading title="Check your email" body={<>If there is an account for <strong className="text-[color:var(--color-ink)]">{email.trim()}</strong>, a reset link is on its way. Open it in this browser.</>} />
          <EmailInboxHelp className="mb-4" />
          <HubLink to="/sign-in" className="text-[14px] font-semibold text-[color:var(--color-primary)] hover:underline">
            Back to sign in
          </HubLink>
        </>
      ) : (
        <>
          <AuthHeading title="Reset your password" body="We'll email you a link to choose a new one." />
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Field label="Email" error={error}>
              {({ id, describedBy, invalid }) => <Input id={id} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} autoFocus />}
            </Field>
            <Button type="submit" size="lg" block loading={loading}>
              Send reset link
            </Button>
            <HubLink to="/sign-in" className="text-center text-[14px] font-semibold text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]">
              Back to sign in
            </HubLink>
          </form>
          <InlineAlert tone="neutral" className="mt-8">
            Signed up with Google? You do not have a Migrent password - use Continue with Google on the sign-in page.
          </InlineAlert>
        </>
      )}
    </AuthLayout>
  );
}
