import { useEffect, useRef, useState } from "react";

import { API_BASE_URL as API_BASE } from "../lib/apiBase";
const POLL_OK_MS = 60_000;
const POLL_FAIL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 6_000;

type Status = "unknown" | "ok" | "down";

async function pingHealth(): Promise<boolean> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: "GET",
      cache: "no-store",
      signal: ctrl.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export default function BackendStatusBanner() {
  const [status, setStatus] = useState<Status>("unknown");
  const [dismissed, setDismissed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const ok = await pingHealth();
      if (cancelled) return;
      setStatus(ok ? "ok" : "down");
      timer.current = setTimeout(tick, ok ? POLL_OK_MS : POLL_FAIL_MS);
    };

    tick();

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (status !== "down" || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-[#f4e4cf] dark:bg-[#2c1e10] border-b border-[var(--color-warn-500)]/30 text-[var(--color-ink)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3 text-[13px]">
        <span className="inline-flex w-2 h-2 rounded-full bg-[var(--color-warn-500)] flex-shrink-0" />
        <span className="font-semibold text-[var(--color-warn-500)]">
          MigRent is having trouble reaching our servers.
        </span>
        <span className="text-[var(--color-ink-2)] hidden sm:inline">
          Search, messages, and bookings may be delayed. We&apos;re on it.
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors p-1 rounded"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
