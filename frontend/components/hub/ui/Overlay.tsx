import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../../lib/cn";
import { IconButton } from "./Button";

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside an open dialog, closes on Escape, locks page
 * scroll, and hands focus back to whatever opened it.
 */
export function useFocusTrap(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const first = node?.querySelector<HTMLElement>("[data-autofocus]") ?? node?.querySelector<HTMLElement>(FOCUSABLE);
    window.setTimeout(() => (first ?? node)?.focus(), 30);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);
  return ref;
}

function Portal({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.body), []);
  return el ? createPortal(children, el) : null;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

/** Centred on desktop, a bottom sheet on phones. */
export function Dialog({ open, onClose, title, description, children, footer, size = "md" }: DialogProps) {
  const ref = useFocusTrap(open, onClose);
  const titleId = useId();
  const descId = useId();
  const reduce = useReducedMotion();
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
            <motion.div
              className="absolute inset-0 bg-[rgb(9_11_16/0.45)] backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-hidden
            />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descId : undefined}
              tabIndex={-1}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[24px] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-modal)] outline-none sm:rounded-[24px]",
                size === "sm" && "sm:max-w-[420px]",
                size === "md" && "sm:max-w-[560px]",
                size === "lg" && "sm:max-w-[760px]",
              )}
            >
              <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
                <div className="flex flex-col gap-1">
                  <h2 id={titleId} className="text-[19px] font-semibold tracking-[-0.01em] text-[color:var(--color-ink)]">
                    {title}
                  </h2>
                  {description && (
                    <p id={descId} className="text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">
                      {description}
                    </p>
                  )}
                </div>
                <IconButton label="Close" size="sm" onClick={onClose} className="-mr-2 -mt-1">
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </IconButton>
              </div>
              {children && <div className="overflow-y-auto px-6 py-3">{children}</div>}
              {footer && <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-line)] px-6 py-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "bottom";
  width?: number;
}

/** A side drawer on desktop (bottom sheet on phones). Used for filters, detail peeks. */
export function Sheet({ open, onClose, title, children, footer, side = "right", width = 440 }: SheetProps) {
  const ref = useFocusTrap(open, onClose);
  const titleId = useId();
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const set = () => setMobile(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  const fromBottom = side === "bottom" || mobile;
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80]">
            <motion.div
              className="absolute inset-0 bg-[rgb(9_11_16/0.4)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-hidden
            />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              initial={reduce ? { opacity: 0 } : fromBottom ? { y: "100%" } : { x: "100%" }}
              animate={reduce ? { opacity: 1 } : fromBottom ? { y: 0 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : fromBottom ? { y: "100%" } : { x: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={fromBottom ? undefined : { width: `min(${width}px, 100vw)` }}
              className={cn(
                "absolute flex flex-col bg-[var(--color-surface)] shadow-[var(--shadow-modal)] outline-none",
                fromBottom ? "inset-x-0 bottom-0 max-h-[88vh] rounded-t-[24px] border-t border-[var(--color-line)]" : "inset-y-0 right-0 border-l border-[var(--color-line)]",
              )}
            >
              {fromBottom && <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-[var(--color-line-2)]" />}
              <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] px-5 py-4">
                <h2 id={titleId} className="text-[17px] font-semibold text-[color:var(--color-ink)]">
                  {title}
                </h2>
                <IconButton label="Close" size="sm" onClick={onClose}>
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </IconButton>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
              {footer && <div className="flex gap-2 border-t border-[var(--color-line)] px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

interface MenuItem {
  label: ReactNode;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/**
 * An accessible dropdown menu: arrow keys, Home/End, Escape, click-away.
 * `side="top"` opens it upwards, for triggers near the bottom of the screen
 * (the account menu at the foot of the navigation rail), where opening
 * downwards would run off the page.
 */
export function Menu({
  trigger,
  items,
  align = "end",
  side = "bottom",
  label,
}: {
  trigger: (props: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "menu"; "aria-controls": string }) => ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
  side?: "top" | "bottom";
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    window.setTimeout(() => list.current?.querySelector<HTMLElement>("[role=menuitem]:not([aria-disabled=true])")?.focus(), 10);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const els = Array.from(list.current?.querySelectorAll<HTMLElement>("[role=menuitem]:not([aria-disabled=true])") ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      els[(i + 1) % els.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      els[(i - 1 + els.length) % els.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      els[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      els[els.length - 1]?.focus();
    } else if (e.key === "Escape" || e.key === "Tab") {
      close();
      if (e.key === "Escape") (wrap.current?.querySelector("[aria-haspopup]") as HTMLElement | null)?.focus();
    }
  };

  return (
    <div ref={wrap} className="relative">
      {trigger({ onClick: () => setOpen((v) => !v), "aria-expanded": open, "aria-haspopup": "menu", "aria-controls": menuId })}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={list}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={onKeyDown}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: side === "top" ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: side === "top" ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute z-[70] min-w-[220px] rounded-[16px] border border-[var(--color-line)] bg-[var(--color-surface-2)] p-1.5 shadow-[var(--shadow-pop)]",
              side === "top" ? "bottom-full mb-2 origin-bottom" : "mt-2 origin-top",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                role="menuitem"
                aria-disabled={item.disabled || undefined}
                tabIndex={-1}
                onClick={() => {
                  if (item.disabled) return;
                  close();
                  item.onSelect();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[14px] font-medium outline-none transition-colors",
                  "focus-visible:bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]",
                  item.danger ? "text-[color:var(--color-danger-500)]" : "text-[color:var(--color-ink)]",
                  item.disabled && "opacity-50",
                )}
              >
                {item.icon && <span aria-hidden className="text-[color:var(--color-ink-3)]">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
