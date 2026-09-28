import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ShieldCheck } from "lucide-react";
import AuthLayout, { AuthHeading } from "../../components/hub/AuthLayout";
import { useHubNavigate } from "../../components/hub/HubLink";
import { Button } from "../../components/hub/ui/Button";
import { Field, Input } from "../../components/hub/ui/Field";
import { InlineAlert } from "../../components/hub/ui/Feedback";
import { supabase } from "../../lib/supabase";
import { hubSignInUrl, safeHubPath } from "../../lib/hub/routes";
import { useHub } from "../../lib/hub/session";

/**
 * The second step for accounts with an authenticator app (Supabase TOTP
 * MFA). The session only reaches assurance level 2 once a current code has
 * been verified; until then the Hub stays closed.
 */
export default function VerifyMfa() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const { status, signOut } = useHub();
  const next = safeHubPath(router.query.next);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "signed-out") void router.replace(hubSignInUrl(next));
    if (status === "ready" || status === "needs-onboarding") void navigate(next, { replace: true });
  }, [status, next, router, navigate]);

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.find((f) => f.status === "verified");
      setFactorId(totp?.id ?? null);
    });
  }, []);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: e2 } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setLoading(false);
    if (e2) {
      setError("That code did not work. Codes change every 30 seconds - try the current one.");
      setCode("");
      inputRef.current?.focus();
      return;
    }
    // The session provider re-reads the assurance level and routes on.
    window.location.reload();
  }

  return (
    <AuthLayout title="Confirm it's you">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]">
        <ShieldCheck className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </div>
      <AuthHeading title="Confirm it's you" body="Enter the 6-digit code from your authenticator app." />
      <form onSubmit={verify} className="flex flex-col gap-4" noValidate>
        <Field label="Authentication code" error={error}>
          {({ id, describedBy, invalid }) => (
            <Input
              ref={inputRef}
              id={id}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className="text-center text-[22px] tracking-[0.4em]"
              autoFocus
            />
          )}
        </Field>
        {!factorId && status === "needs-mfa" && <InlineAlert tone="neutral">Looking up your authenticator...</InlineAlert>}
        <Button type="submit" size="lg" block loading={loading} disabled={!factorId}>
          Verify
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            await signOut();
            void router.replace(hubSignInUrl(next));
          }}
        >
          Sign in with a different account
        </Button>
      </form>
      <p className="mt-8 text-[13.5px] leading-relaxed text-[color:var(--color-ink-3)]">Lost access to your authenticator? Contact Migrent support from the email address on your account and we will help you back in.</p>
    </AuthLayout>
  );
}
