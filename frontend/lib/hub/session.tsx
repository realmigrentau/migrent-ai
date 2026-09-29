/**
 * Who is using Migrent Hub, and whether they may see the page they asked for.
 *
 * States, in the order they are checked:
 *   loading           reading the session (from cookies/storage, no network)
 *   signed-out        no session: the shell sends them to sign-in with `next`
 *   needs-mfa         they enrolled an authenticator but this session has not
 *                     used it yet (Supabase AAL1 -> AAL2)
 *   needs-onboarding  signed in, but has not said what they are here to do
 *   ready
 *
 * proxy.ts has already refused private Hub pages to anyone without a
 * session, server-side; this is the client half, which also knows about
 * onboarding and MFA and keeps the page from flashing protected chrome.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { lockAdminPanel } from "./adminPanel";
import { getViewAs, hubApi, setViewAs } from "./api";
import { clearQueryCache, invalidate, useHubQuery } from "./query";
import type { HubMe, HubRole } from "./types";

export type HubStatus = "loading" | "signed-out" | "needs-mfa" | "needs-onboarding" | "ready" | "error";

interface HubContextValue {
  status: HubStatus;
  session: Session | null;
  me: HubMe | undefined;
  role: HubRole | null;
  meError: string | null;
  refreshMe: () => Promise<unknown>;
  signOut: () => Promise<void>;
  viewAs: { id: string; name: string } | null;
  startViewAs: (user: { id: string; name: string }, reason: string) => Promise<void>;
  endViewAs: () => Promise<void>;
}

const HubContext = createContext<HubContextValue | null>(null);

export function HubSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [aal, setAal] = useState<{ current: string | null; next: string | null } | null>(null);
  const [viewAs, setViewAsState] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setViewAsState(getViewAs());
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setSessionLoaded(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setSessionLoaded(true);
      if (event === "SIGNED_OUT") {
        lockAdminPanel();
        clearQueryCache();
        setViewAs(null);
        setViewAsState(null);
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "MFA_CHALLENGE_VERIFIED") invalidate("/hub/me");
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Assurance level: only relevant once there is a session.
  useEffect(() => {
    if (!session) {
      setAal(null);
      return;
    }
    let alive = true;
    supabase.auth.mfa
      .getAuthenticatorAssuranceLevel()
      .then(({ data }) => alive && setAal({ current: data?.currentLevel ?? null, next: data?.nextLevel ?? null }))
      .catch(() => alive && setAal({ current: null, next: null }));
    return () => {
      alive = false;
    };
  }, [session?.access_token]);

  const needsMfa = Boolean(aal && aal.next === "aal2" && aal.current !== "aal2");
  const meQuery = useHubQuery<HubMe>(session && !needsMfa ? "/hub/me" : null);
  const me = meQuery.data;

  let status: HubStatus = "loading";
  if (!sessionLoaded) status = "loading";
  else if (!session) status = "signed-out";
  else if (!aal) status = "loading";
  else if (needsMfa) status = "needs-mfa";
  else if (meQuery.error && !me) status = meQuery.error.status === 401 ? "signed-out" : "error";
  else if (!me) status = "loading";
  else if (!me.onboarded && !me.viewing_as) status = "needs-onboarding";
  else status = "ready";

  const signOut = useCallback(async () => {
    lockAdminPanel();
    setViewAs(null);
    setViewAsState(null);
    await supabase.auth.signOut();
    clearQueryCache();
  }, []);

  const startViewAs = useCallback(async (user: { id: string; name: string }, reason: string) => {
    await hubApi.post("/hub/admin/view-as", { user_id: user.id, reason });
    setViewAs(user);
    setViewAsState(user);
    clearQueryCache({ refetch: true });
  }, []);

  const endViewAs = useCallback(async () => {
    const current = getViewAs();
    setViewAs(null);
    setViewAsState(null);
    clearQueryCache({ refetch: true });
    if (current) await hubApi.post("/hub/admin/view-as/end", { user_id: current.id }).catch(() => {});
  }, []);

  const value = useMemo<HubContextValue>(
    () => ({
      status,
      session,
      me,
      role: me?.role ?? null,
      meError: meQuery.error?.message ?? null,
      refreshMe: meQuery.refetch,
      signOut,
      viewAs,
      startViewAs,
      endViewAs,
    }),
    [status, session, me, meQuery.error, meQuery.refetch, signOut, viewAs, startViewAs, endViewAs],
  );

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
}

export function useHub(): HubContextValue {
  const ctx = useContext(HubContext);
  if (!ctx) throw new Error("useHub must be used inside HubSessionProvider");
  return ctx;
}
