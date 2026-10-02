import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/router";
import { BadgeCheck, BarChart3, Flag, Wallet, HandHeart, Inbox, LayoutGrid, ListChecks, Lock, LockKeyhole, ScrollText, ShieldCheck, Users } from "lucide-react";
import { cn } from "../../../lib/cn";
import { IDLE_LOCK_MS, adminIdleRemainingMs, lockAdminPanel, unlockAdminPanel, useAdminPanelUnlocked } from "../../../lib/hub/adminPanel";
import { primeAlarm } from "../../../lib/hub/alarm";
import { HubError, hubApi } from "../../../lib/hub/api";
import { useHubQuery } from "../../../lib/hub/query";
import { toHubPath } from "../../../lib/hub/routes";
import { useHub } from "../../../lib/hub/session";
import HubShell from "../HubShell";
import HubLink, { useHubNavigate } from "../HubLink";
import { isActive, type NavItem } from "../nav";
import { Button } from "../ui/Button";
import { EmptyState, InlineAlert, Skeleton } from "../ui/Feedback";
import { Field, Input } from "../ui/Field";

/** Everything inside the Admin panel. */
export const ADMIN_SECTIONS: NavItem[] = [
  { label: "Overview", to: "/admin", icon: LayoutGrid },
  { label: "Listings", to: "/admin/listings", icon: ListChecks },
  { label: "ID checks", to: "/admin/id-checks", icon: BadgeCheck },
  { label: "Mentors", to: "/admin/mentors", icon: HandHeart },
  { label: "Final reviews", to: "/admin/reviews", icon: ShieldCheck },
  { label: "Reports", to: "/admin/reports", icon: Flag },
  { label: "Support", to: "/admin/support", icon: Inbox },
  { label: "People", to: "/admin/people", icon: Users },
  { label: "Numbers", to: "/admin/numbers", icon: BarChart3 },
  { label: "Move-ins", to: "/admin/move-ins", icon: Wallet },
  { label: "Audit log", to: "/admin/audit", icon: ScrollText },
];

const IDLE_SECONDS = Math.round(IDLE_LOCK_MS / 1000);

interface PanelState {
  attempts_left: number;
  locked: boolean;
  /** The server will not open the panel on a session without an
   *  authenticator code (backend admin_panel.require_admin_mfa). */
  mfa_required?: boolean;
}

interface UnlockResult {
  unlocked: boolean;
  locked?: boolean;
  attempts_left?: number;
  token?: string;
  expires_in_seconds?: number;
}

function UnlockForm() {
  const state = useHubQuery<PanelState>("/hub/admin/panel");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useHubNavigate();

  useEffect(() => input.current?.focus(), []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    // This click or key press is what lets the page sound the alarm later
    // (browsers block sound a page makes on its own).
    primeAlarm();
    if (!password) {
      setError("Enter the admin password.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const r = await hubApi.post<UnlockResult>("/hub/admin/unlock", { password });
      if (r.unlocked && r.token) {
        unlockAdminPanel(r.token, r.expires_in_seconds ?? 20 * 60);
        return;
      }
      if (r.locked) {
        // Three strikes. The server has already signed this account out
        // everywhere and alerted every admin; the locked page ends this
        // tab's session too. An in-app navigation, not a page load, so the
        // alarm primed above may still sound.
        void navigate("/locked", { replace: true });
        return;
      }
      const left = r.attempts_left ?? 0;
      setError(`That is not the admin password. ${left} ${left === 1 ? "try" : "tries"} left before you are signed out.`);
      setPassword("");
      state.mutate({ attempts_left: left, locked: false });
      input.current?.focus();
    } catch (err) {
      setError(err instanceof HubError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (state.error) {
    // Only an admin reaches this form, so a 404 means the server has not
    // been updated to a version with the Admin panel yet (the site can go
    // live before the API does).
    if (state.error.status === 404) {
      return (
        <InlineAlert
          tone="warning"
          title="The Admin panel isn't switched on yet"
          action={
            <Button variant="secondary" size="sm" onClick={() => void state.refetch().catch(() => {})}>
              Try again
            </Button>
          }
        >
          The website has the Admin panel, but the Migrent server hasn&apos;t been updated to include it yet. It works as soon as that update is live, usually a few minutes after it is released.
        </InlineAlert>
      );
    }
    return (
      <InlineAlert
        tone="danger"
        title="The Admin panel could not load"
        action={
          <Button variant="secondary" size="sm" onClick={() => void state.refetch().catch(() => {})}>
            Try again
          </Button>
        }
      >
        {state.error.message}
      </InlineAlert>
    );
  }
  if (!state.data) return <Skeleton className="mx-auto h-[320px] w-full max-w-[440px] rounded-[22px]" />;

  const { attempts_left: left, locked, mfa_required: needsMfa } = state.data;
  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-6 pt-6 text-center sm:pt-12">
      <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]">
        <LockKeyhole className="h-7 w-7" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="hub-title text-[26px] font-semibold tracking-[-0.022em] text-[color:var(--color-ink)]">Admin panel</h1>
        <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-2)]">
          Enter the admin password to open it. It locks again after {IDLE_SECONDS} seconds without any activity.
        </p>
      </div>
      {needsMfa ? (
        <InlineAlert tone="warning" title="Turn on two-step verification first" className="w-full text-left">
          The Admin panel only opens when you have signed in with a code from an authenticator app as well as your password. Set it up in{" "}
          <HubLink to="/settings#security" className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline">
            Settings, Sign-in and security
          </HubLink>
          , then sign out and back in with your code and open the panel again.
        </InlineAlert>
      ) : locked ? (
        <InlineAlert tone="danger" title="Locked" className="w-full text-left">
          Three wrong passwords were entered on this account, so the Admin panel is locked for 15 minutes and every admin was alerted.
        </InlineAlert>
      ) : (
        <form onSubmit={submit} noValidate className="flex w-full flex-col gap-4 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-left sm:p-6">
          <Field label="Admin password" error={error} hint={left < 3 ? `${left} ${left === 1 ? "try" : "tries"} left` : "You have 3 tries."}>
            {({ id, describedBy, invalid }) => (
              <Input
                ref={input}
                id={id}
                type="password"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
              />
            )}
          </Field>
          <Button type="submit" size="lg" block loading={pending} icon={<Lock className="h-4 w-4" strokeWidth={2} aria-hidden />}>
            Unlock
          </Button>
        </form>
      )}
    </div>
  );
}

/** "Open", the idle countdown in its last seconds, and a way to lock now. */
function PanelBar() {
  const [left, setLeft] = useState(IDLE_LOCK_MS);
  useEffect(() => {
    const id = window.setInterval(() => setLeft(adminIdleRemainingMs()), 500);
    return () => window.clearInterval(id);
  }, []);
  const seconds = Math.ceil(left / 1000);
  const soon = seconds <= 10;
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5">
      <p className="flex items-center gap-2 text-[13.5px] text-[color:var(--color-ink-2)]">
        <ShieldCheck className="h-4 w-4 text-[color:var(--color-primary)]" strokeWidth={2} aria-hidden />
        <span className="font-semibold text-[color:var(--color-ink)]">Admin panel open</span>
        <span className={cn(soon && "font-semibold text-[color:var(--color-danger-500)]")}>
          {soon ? `Locking in ${seconds}s` : `Locks after ${IDLE_SECONDS}s without activity`}
        </span>
        {/* One announcement, not one a second. */}
        <span className="sr-only" aria-live="polite">
          {soon ? "The Admin panel locks in a few seconds unless you move the mouse or press a key." : ""}
        </span>
      </p>
      <Button variant="secondary" size="sm" onClick={() => lockAdminPanel("manual")} icon={<Lock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}>
        Lock now
      </Button>
    </div>
  );
}

function SectionNav() {
  const router = useRouter();
  const hubPath = toHubPath(router.asPath);
  return (
    <nav aria-label="Admin panel" className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1.5">
        {ADMIN_SECTIONS.map((s) => {
          // Overview is only /admin itself, not everything under it.
          const active = s.to === "/admin" ? hubPath.split("?")[0] === "/admin" : isActive(s, hubPath);
          return (
            <li key={s.to}>
              <HubLink
                to={s.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-[13.5px] font-semibold transition-colors",
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]"
                    : "border-[var(--color-line)] bg-[var(--color-surface)] text-[color:var(--color-ink-2)] hover:bg-[var(--color-surface-hover)] hover:text-[color:var(--color-ink)]",
                )}
              >
                <s.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                {s.label}
              </HubLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Shows `children` only to an admin who has unlocked the Admin panel, and
 * the password form to an admin who has not. Nothing inside mounts (so
 * nothing is fetched) until then. The server checks the unlock on every
 * request as well; this only decides what the page shows.
 */
export function AdminPanelGate({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  const { me, viewAs } = useHub();
  const unlocked = useAdminPanelUnlocked();
  if (viewAs) {
    return (
      <EmptyState
        icon={<LockKeyhole className="h-6 w-6" strokeWidth={1.75} />}
        title="Not while viewing as a customer"
        body={`Use Stop viewing at the top of the page to leave ${viewAs.name}'s account and get back to the Admin panel.`}
      />
    );
  }
  if (!me?.is_admin) {
    return <EmptyState icon={<LockKeyhole className="h-6 w-6" strokeWidth={1.75} />} title="Page not found" body="This page isn't part of your account." />;
  }
  if (!unlocked) return <UnlockForm />;
  return (
    <>
      <PanelBar />
      {nav && <SectionNav />}
      {children}
    </>
  );
}

/** A page inside the Admin panel: the Hub frame, then the gate. */
export default function AdminPanelShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <HubShell title={title}>
      <AdminPanelGate>{children}</AdminPanelGate>
    </HubShell>
  );
}

/** Change the Admin panel password (inside the unlocked panel). */
export function AdminPasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string; form?: string }>({});
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found: typeof errors = {};
    if (!current) found.current = "Enter the current admin password.";
    if (next.length < 8) found.next = "Use at least 8 characters.";
    else if (next !== confirm) found.confirm = "The two new passwords don't match.";
    setErrors(found);
    setDone(false);
    if (Object.keys(found).length) return;
    setPending(true);
    try {
      await hubApi.post("/hub/admin/password", { current_password: current, new_password: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      setDone(true);
    } catch (err) {
      const message = err instanceof HubError ? err.message : "Something went wrong. Please try again.";
      setErrors(err instanceof HubError && err.status === 400 && /current/i.test(message) ? { current: message } : { form: message });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex max-w-[480px] flex-col gap-4 rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      {done && <InlineAlert tone="success">Admin password changed. Share the new one only with other admins, in person.</InlineAlert>}
      {errors.form && <InlineAlert tone="danger">{errors.form}</InlineAlert>}
      <Field label="Current admin password" error={errors.current}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="password" autoComplete="off" value={current} onChange={(e) => setCurrent(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid || undefined} />
        )}
      </Field>
      <Field label="New admin password" hint="At least 8 characters. Don't reuse your Migrent sign-in password." error={errors.next}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid || undefined} />
        )}
      </Field>
      <Field label="New admin password again" error={errors.confirm}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid || undefined} />
        )}
      </Field>
      <div>
        <Button type="submit" loading={pending}>
          Change admin password
        </Button>
      </div>
    </form>
  );
}
