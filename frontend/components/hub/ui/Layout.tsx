import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "../../../lib/cn";
import HubLink from "../HubLink";

/** The top of every Hub page: title, one line of context, and actions. */
export function PageHeader({
  title,
  description,
  actions,
  back,
  eyebrow,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex min-w-0 flex-col gap-2">
        {back && (
          <HubLink to={back.to} className="group -ml-1 inline-flex w-fit items-center gap-1 rounded-[8px] px-1 py-0.5 text-[13.5px] font-medium text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={2} aria-hidden />
            {back.label}
          </HubLink>
        )}
        {eyebrow && <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">{eyebrow}</p>}
        <h1 className="hub-title text-[26px] font-semibold leading-[1.15] tracking-[-0.022em] text-[color:var(--color-ink)] sm:text-[30px]">{title}</h1>
        {description && <p className="max-w-[640px] text-[15px] leading-relaxed text-[color:var(--color-ink-2)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

/** A titled section of a page. */
export function Section({ title, description, action, children, className, id }: { title?: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  const headingId = useId();
  return (
    <section id={id} aria-labelledby={title ? headingId : undefined} className={cn("flex flex-col gap-4", className)}>
      {(title || action) && (
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title && (
              <h2 id={headingId} className="text-[19px] font-semibold tracking-[-0.015em] text-[color:var(--color-ink)] sm:text-[20px]">
                {title}
              </h2>
            )}
            {description && <p className="text-[14px] leading-relaxed text-[color:var(--color-ink-3)]">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** A surface panel. Borders over shadows; shadows only when elevated. */
export function Panel({ children, className, padded = true, as: As = "div" }: { children: ReactNode; className?: string; padded?: boolean; as?: "div" | "section" | "article" | "aside" }) {
  return <As className={cn("rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)]", padded && "p-5 sm:p-6", className)}>{children}</As>;
}

export function TextLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <HubLink to={to} className={cn("inline-flex items-center gap-1 rounded-[6px] text-[14px] font-semibold text-[color:var(--color-primary)] hover:underline hover:underline-offset-4", className)}>
      {children}
    </HubLink>
  );
}

interface TabsProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  tabs: { value: T; label: ReactNode; count?: number }[];
  label: string;
  className?: string;
}

/** Underline tabs with a sliding indicator. */
export function Tabs<T extends string>({ value, onChange, tabs, label, className }: TabsProps<T>) {
  const group = useId();
  const reduce = useReducedMotion();
  return (
    <div role="tablist" aria-label={label} className={cn("hub-scroll-x -mx-1 flex gap-1 overflow-x-auto border-b border-[var(--color-line)] px-1", className)}>
      {tabs.map((t, i) => {
        const selected = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") onChange(tabs[(i + 1) % tabs.length].value);
              if (e.key === "ArrowLeft") onChange(tabs[(i - 1 + tabs.length) % tabs.length].value);
            }}
            className={cn(
              "relative flex h-11 shrink-0 items-center gap-2 rounded-t-[8px] px-3 text-[14px] font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]",
              selected ? "text-[color:var(--color-ink)]" : "text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]",
            )}
          >
            {t.label}
            {typeof t.count === "number" && t.count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-surface-muted)] px-1.5 text-[11.5px] font-bold tabular-nums text-[color:var(--color-ink-2)]">
                {t.count}
              </span>
            )}
            {selected && (
              <motion.span
                layoutId={`tab-${group}`}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[var(--color-primary)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** A small key-value fact, for property attributes and application details. */
export function Fact({ label, value, icon }: { label: ReactNode; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <span aria-hidden className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-surface-muted)] text-[color:var(--color-ink-2)]">
          {icon}
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <dt className="text-[12.5px] font-medium text-[color:var(--color-ink-3)]">{label}</dt>
        <dd className="text-[14.5px] font-semibold text-[color:var(--color-ink)]">{value}</dd>
      </div>
    </div>
  );
}

/** Fades page content in once; skipped under reduced motion. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
