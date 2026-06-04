import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Promise-based confirmation dialog.
 *
 * Replaces the native browser `confirm()` popup. Usage:
 *
 *     const confirm = useConfirm();
 *     const ok = await confirm({
 *       title: "Cancel booking?",
 *       description: "This will release the room and notify the host.",
 *       confirmLabel: "Cancel booking",
 *       cancelLabel: "Keep booking",
 *       tone: "danger",
 *     });
 *     if (ok) { ...proceed... }
 *
 * Drop-in replacement for `if (!confirm("...")) return;`.
 *
 * Features:
 * - Promise-based, so flows read top-to-bottom (no callbacks)
 * - Tone "danger" colours the confirm button red for destructive actions
 * - Keyboard: Esc cancels, Enter confirms (when confirm button is focused)
 * - Focus trap: opens with the cancel button focused (safer default)
 * - Backdrop click cancels
 * - Animated entrance + exit (respects prefers-reduced-motion globally)
 * - aria-modal, role="dialog", labelled by title for screen readers
 */

export type ConfirmTone = "neutral" | "danger";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
}

type Resolver = (value: boolean) => void;

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): (opts: ConfirmOptions) => Promise<boolean> {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    // Safe fallback: fall through to native confirm so callers never crash
    // if the provider is missing for some reason (e.g. in tests).
    return (opts) =>
      Promise.resolve(
        typeof window !== "undefined" ? window.confirm(opts.title) : false,
      );
  }
  return ctx.confirm;
}

interface ActiveDialog extends Required<Omit<ConfirmOptions, "tone">> {
  tone: ConfirmTone;
  resolve: Resolver;
}

const DEFAULTS = {
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  description: "",
  tone: "neutral" as ConfirmTone,
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveDialog | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        // Capture focus so we can restore it when the dialog closes
        previouslyFocused.current =
          typeof document !== "undefined"
            ? (document.activeElement as HTMLElement | null)
            : null;
        setActive({
          title: opts.title,
          description: opts.description ?? DEFAULTS.description,
          confirmLabel: opts.confirmLabel ?? DEFAULTS.confirmLabel,
          cancelLabel: opts.cancelLabel ?? DEFAULTS.cancelLabel,
          tone: opts.tone ?? DEFAULTS.tone,
          resolve,
        });
      }),
    [],
  );

  const close = useCallback(
    (value: boolean) => {
      if (!active) return;
      active.resolve(value);
      setActive(null);
      // Restore focus to the trigger so keyboard users land where they started
      window.setTimeout(() => previouslyFocused.current?.focus?.(), 0);
    },
    [active],
  );

  // Auto-focus the safe default (cancel) when the dialog opens
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => cancelBtnRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [active]);

  // Keyboard handling: Esc cancels, Enter confirms when no input is focused
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      } else if (e.key === "Enter") {
        // Don't hijack Enter inside fields - only act if the dialog buttons
        // are focused
        const target = e.target as HTMLElement | null;
        if (target === confirmBtnRef.current || target === cancelBtnRef.current) {
          e.preventDefault();
          close(target === confirmBtnRef.current);
        }
      } else if (e.key === "Tab") {
        // Tiny focus trap between the two buttons
        e.preventDefault();
        const next =
          document.activeElement === confirmBtnRef.current
            ? cancelBtnRef.current
            : confirmBtnRef.current;
        next?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, close]);

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            key="confirm-root"
            className="fixed inset-0 z-[110] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close dialog"
              onClick={() => close(false)}
              className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Dialog card */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              aria-describedby={active.description ? "confirm-dialog-desc" : undefined}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 shadow-2xl p-6 sm:p-7"
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    active.tone === "danger"
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {active.tone === "danger" ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <h2
                    id="confirm-dialog-title"
                    className="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
                  >
                    {active.title}
                  </h2>
                  {active.description && (
                    <p
                      id="confirm-dialog-desc"
                      className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                    >
                      {active.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  ref={cancelBtnRef}
                  type="button"
                  onClick={() => close(false)}
                  className="inline-flex justify-center items-center h-11 px-5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  {active.cancelLabel}
                </button>
                <button
                  ref={confirmBtnRef}
                  type="button"
                  onClick={() => close(true)}
                  className={`inline-flex justify-center items-center h-11 px-5 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm ${
                    active.tone === "danger"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  }`}
                >
                  {active.confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
