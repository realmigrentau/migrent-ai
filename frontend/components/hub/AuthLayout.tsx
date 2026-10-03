import { useEffect, useState, type ReactNode } from "react";
import Head from "next/head";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CalendarCheck, FileCheck2, KeyRound, MessagesSquare, Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { authCallbackUrl } from "../../lib/authRedirect";
import { hubUrl, siteUrl } from "../../lib/hub/routes";
import { HubMark } from "./HubShell";
import { ThemeIconButton } from "./ThemeToggle";
import { Logo } from "../ui/Logo";

const JOURNEY = [
  { icon: Search, title: "Find", body: "Homes and rooms from ID-checked owners." },
  { icon: MessagesSquare, title: "Ask and inspect", body: "Message owners and book inspection times." },
  { icon: FileCheck2, title: "Apply once", body: "One Rental Profile, reused for every application." },
  { icon: CalendarCheck, title: "Get approved", body: "Every step of the decision, in plain words." },
  { icon: KeyRound, title: "Move in and manage", body: "Your lease details, rent record and repairs." },
];

/**
 * The frame for Hub sign-in, sign-up and recovery. On a wide screen the
 * left half says what the Hub is for; on a phone the form comes first.
 */
export default function AuthLayout({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="hub min-h-[100dvh]">
      <Head>
        <title>{`${title} · Migrent Hub`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <aside className="relative hidden overflow-hidden lg:block" aria-hidden>
          <div className="absolute inset-3 overflow-hidden rounded-[28px] bg-[var(--color-deep)]">
            {/* The homepage sunrise, darkened: the same sky the public site opens on. */}
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url(/hero/sky-1152.webp)" }} />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(12_17_34/0.35)_0%,rgb(12_17_34/0.72)_55%,rgb(12_17_34/0.94)_100%)]" />
            <div className="relative flex h-full flex-col justify-between p-12 text-white">
              <span className="inline-flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white/15 backdrop-blur">
                  <Logo size={22} title="" />
                </span>
                <span className="text-[17px] font-extrabold tracking-[-0.02em]">Migrent</span>
                <span className="text-[13px] font-semibold text-white/70">Hub</span>
              </span>
              <div className="flex flex-col gap-8">
                <p className="hub-display max-w-[460px] text-[40px] leading-[1.08] text-white">Everything about your next home, in one place.</p>
                <ol className="flex flex-col gap-4">
                  {JOURNEY.map((step, i) => (
                    <motion.li
                      key={step.title}
                      initial={reduce ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-start gap-3.5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white/12 ring-1 ring-white/15">
                        <step.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[15px] font-semibold">{step.title}</span>
                        <span className="text-[13.5px] text-white/75">{step.body}</span>
                      </span>
                    </motion.li>
                  ))}
                </ol>
              </div>
              <p className="text-[12.5px] text-white/60">For renters, owners and property managers across Australia.</p>
            </div>
          </div>
        </aside>
        <main className="flex flex-col px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            <a href={siteUrl("/")} className="inline-flex items-center gap-1.5 rounded-[8px] text-[13.5px] font-medium text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Back to Migrent
            </a>
            <ThemeIconButton />
          </div>
          <div className="flex flex-1 items-center justify-center py-10">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[420px]"
            >
              <div className="mb-8 lg:hidden">
                <HubMark />
              </div>
              {children}
            </motion.div>
          </div>
          {aside}
        </main>
      </div>
    </div>
  );
}

export function AuthHeading({ title, body }: { title: string; body?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-2">
      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-[color:var(--color-ink)]">{title}</h1>
      {body && <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-2)]">{body}</p>}
    </div>
  );
}

/** The Hub's auth callback, on this origin, with a Hub `next`. */
export function hubCallbackUrl(next?: string, extra?: Record<string, string>) {
  // authCallbackUrl builds /auth/callback; the Hub has its own callback page.
  const url = new URL(authCallbackUrl(window.location.origin, next, extra));
  url.pathname = hubUrl("/auth/callback");
  return url.toString();
}

export function GoogleButton({ next, label = "Continue with Google" }: { next?: string; label?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setPending(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={async () => {
          setPending(true);
          setError("");
          const { error: e } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: hubCallbackUrl(next) } });
          if (e) {
            setPending(false);
            setError("Google sign-in is not available right now. Use your email instead, or try again shortly.");
          }
        }}
        className="hub-press flex h-12 w-full items-center justify-center gap-3 rounded-[12px] border border-[var(--color-line-2)] bg-[var(--color-surface)] text-[15px] font-semibold text-[color:var(--color-ink)] transition-colors hover:bg-[var(--color-surface-hover)] disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {pending ? "Opening Google..." : label}
      </button>
      {error && (
        <p role="alert" className="text-center text-[13px] text-[color:var(--color-danger-500)]">
          {error}
        </p>
      )}
    </div>
  );
}

export function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-[12.5px] font-medium text-[color:var(--color-ink-4)]" role="separator">
      <span className="h-px flex-1 bg-[var(--color-line)]" />
      {label}
      <span className="h-px flex-1 bg-[var(--color-line)]" />
    </div>
  );
}
