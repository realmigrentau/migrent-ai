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

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface InternalToast extends Required<Omit<ToastOptions, "duration">> {
  id: string;
  duration: number;
}

interface ToastContextValue {
  toast: (opts: ToastOptions | string) => string;
  success: (msg: string, opts?: Omit<ToastOptions, "variant">) => string;
  error: (msg: string, opts?: Omit<ToastOptions, "variant">) => string;
  info: (msg: string, opts?: Omit<ToastOptions, "variant">) => string;
  warning: (msg: string, opts?: Omit<ToastOptions, "variant">) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe fallback so callers never crash if provider missing.
    return {
      toast: () => "",
      success: () => "",
      error: () => "",
      info: () => "",
      warning: () => "",
      dismiss: () => {},
    };
  }
  return ctx;
}

const ICONS: Record<ToastVariant, ReactNode> = {
  success: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
};

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success:
    "bg-emerald-50/95 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-100",
  error:
    "bg-rose-50/95 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-100",
  info:
    "bg-slate-50/95 dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100",
  warning:
    "bg-amber-50/95 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-100",
};

const ICON_BG: Record<ToastVariant, string> = {
  success: "bg-emerald-500 text-white",
  error: "bg-rose-500 text-white",
  info: "bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900",
  warning: "bg-amber-500 text-white",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<InternalToast[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const timer = timersRef.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timersRef.current[id];
    }
  }, []);

  const push = useCallback(
    (opts: ToastOptions | string) => {
      const normalised: ToastOptions =
        typeof opts === "string" ? { description: opts } : opts;
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      const variant: ToastVariant = normalised.variant ?? "info";
      const duration = normalised.duration ?? 4500;
      const next: InternalToast = {
        id,
        title: normalised.title ?? "",
        description: normalised.description ?? "",
        variant,
        duration,
      };
      setToasts((t) => [...t, next]);
      if (duration > 0) {
        timersRef.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: push,
      success: (msg, opts) => push({ ...opts, description: msg, variant: "success" }),
      error: (msg, opts) => push({ ...opts, description: msg, variant: "error" }),
      info: (msg, opts) => push({ ...opts, description: msg, variant: "info" }),
      warning: (msg, opts) => push({ ...opts, description: msg, variant: "warning" }),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:top-6 sm:right-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border backdrop-blur-md shadow-lg px-4 py-3 ${VARIANT_STYLES[t.variant]}`}
              role={t.variant === "error" ? "alert" : "status"}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${ICON_BG[t.variant]}`}
                aria-hidden="true"
              >
                {ICONS[t.variant]}
              </span>
              <div className="flex-1 min-w-0">
                {t.title && (
                  <p className="text-sm font-semibold leading-tight">{t.title}</p>
                )}
                {t.description && (
                  <p className={`text-sm leading-snug ${t.title ? "mt-0.5 opacity-90" : ""}`}>
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="ml-1 rounded-full p-1 text-current/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
