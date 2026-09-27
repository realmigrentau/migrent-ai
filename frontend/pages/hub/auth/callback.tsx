import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import AuthLayout, { AuthHeading } from "../../../components/hub/AuthLayout";
import { ButtonLink } from "../../../components/hub/ui/Button";
import { useHubNavigate } from "../../../components/hub/HubLink";
import { supabase } from "../../../lib/supabase";
import { authErrorMessage, parseAuthCallback } from "../../../lib/authRedirect";
import { hubApi } from "../../../lib/hub/api";
import { safeHubPath } from "../../../lib/hub/routes";
import type { HubMe } from "../../../lib/hub/types";

/**
 * Where Google sign-in, email links, sign-up confirmation and password
 * resets land for Migrent Hub. The parsing and error wording are shared
 * with the public site's /auth/callback (lib/authRedirect.ts).
 */
export default function HubAuthCallback() {
  const navigate = useHubNavigate();
  const [failure, setFailure] = useState<{ title: string; message: string; reset: boolean } | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const run = async () => {
      const p = parseAuthCallback(window.location.href);
      if (window.location.hash) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      const isReset = p.otpType === "recovery" || p.next === "/reset-password";
      const fail = (message: string) => setFailure({ title: "That link did not work", message, reset: isReset });

      if (p.error) return fail(authErrorMessage(p.error.code, p.error.description));
      if (p.tokenHash && p.otpType) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: p.tokenHash, type: p.otpType });
        if (error) return fail(authErrorMessage(error.code, error.message));
      } else if (p.tokens) {
        const { error } = await supabase.auth.setSession({ access_token: p.tokens.accessToken, refresh_token: p.tokens.refreshToken });
        if (error) return fail(authErrorMessage(error.code, error.message));
      } else {
        const { error } = await supabase.auth.initialize();
        if (error) return fail(authErrorMessage(error.code, error.message));
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        return setFailure({
          title: p.code ? "Finish signing in here" : "Nothing to sign in with",
          message: p.code
            ? "This link was opened in a different browser from the one you started in. If you were confirming your email, it is confirmed - sign in to continue."
            : "This page finishes a sign-in, but it was opened without a sign-in link.",
          reset: isReset,
        });
      }
      if (isReset) return void navigate("/reset-password", { replace: true });

      // The sign-up form records consent in metadata; copy it to the profile.
      if (data.session.user.user_metadata?.legal_accepted_at) {
        void hubApi.post("/auth/store-legal-acceptance").catch(() => {});
      }

      const next = safeHubPath(p.next);
      // Ask the API (briefly) whether onboarding is done, so a new account
      // goes to the one onboarding question instead of an empty home.
      const me = await Promise.race([hubApi.get<HubMe>("/hub/me").catch(() => null), new Promise<null>((r) => setTimeout(() => r(null), 5000))]);
      if (me && !me.onboarded && !next.startsWith("/welcome")) return void navigate(`/welcome?next=${encodeURIComponent(next)}`, { replace: true });
      void navigate(next, { replace: true });
    };
    run().catch(() =>
      setFailure({
        title: "We could not sign you in",
        message: typeof navigator !== "undefined" && !navigator.onLine ? "You appear to be offline. Reconnect, then open the link again." : "Something went wrong finishing your sign-in. Please try again.",
        reset: false,
      }),
    );
  }, [navigate]);

  return (
    <AuthLayout title="Signing you in">
      {failure ? (
        <>
          <AuthHeading title={failure.title} body={failure.message} />
          <ButtonLink to={failure.reset ? "/forgot-password" : "/sign-in"} size="lg" block>
            {failure.reset ? "Send a new reset link" : "Sign in"}
          </ButtonLink>
        </>
      ) : (
        <div role="status" className="flex items-center gap-3 text-[15px] text-[color:var(--color-ink-2)]">
          <Loader2 className="h-5 w-5 animate-spin text-[color:var(--color-primary)]" strokeWidth={2} aria-hidden />
          Signing you in...
        </div>
      )}
    </AuthLayout>
  );
}
