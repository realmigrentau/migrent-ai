import { useEffect, useState } from "react";
import AuthLayout, { AuthHeading } from "../../components/hub/AuthLayout";
import HubLink, { useHubNavigate } from "../../components/hub/HubLink";
import { Button } from "../../components/hub/ui/Button";
import { Field, Input } from "../../components/hub/ui/Field";
import { InlineAlert } from "../../components/hub/ui/Feedback";
import { supabase } from "../../lib/supabase";

/** Reached from the reset email via /hub/auth/callback, which signs the person in. */
export default function ResetPassword() {
  const navigate = useHubNavigate();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 10 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setError("Use at least 10 characters, with letters and a number.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: e2 } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (e2) {
      setError(/same/i.test(e2.message) ? "Choose a password you have not used before." : "The password could not be changed. Request a new reset link and try again.");
      return;
    }
    setDone(true);
    window.setTimeout(() => void navigate("/", { replace: true }), 1400);
  }

  return (
    <AuthLayout title="Choose a new password">
      {hasSession === false ? (
        <>
          <AuthHeading title="This link has expired" body="Reset links work once, in the browser you requested them from." />
          <HubLink to="/forgot-password" className="text-[14px] font-semibold text-[color:var(--color-primary)] hover:underline">
            Send a new reset link
          </HubLink>
        </>
      ) : done ? (
        <InlineAlert tone="success" title="Password changed">
          Taking you to Migrent Hub.
        </InlineAlert>
      ) : (
        <>
          <AuthHeading title="Choose a new password" />
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Field label="New password" hint="At least 10 characters, with letters and a number.">
              {({ id, describedBy }) => <Input id={id} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby={describedBy} autoFocus />}
            </Field>
            <Field label="Type it again">
              {({ id }) => <Input id={id} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />}
            </Field>
            {error && <InlineAlert tone="danger">{error}</InlineAlert>}
            <Button type="submit" size="lg" block loading={loading} disabled={hasSession === null}>
              Save password
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
