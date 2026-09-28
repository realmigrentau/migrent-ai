import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AlertCircle, Check, ChevronDown } from "lucide-react";
import { cn } from "../../../lib/cn";

/**
 * Form fields. Every control has a real <label>, errors are announced and
 * tied to the input with aria-describedby, and nothing is ever disabled
 * without saying why.
 */

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
}

export function Field({ label, hint, error, optional, children, className }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">
        {label}
        {optional && <span className="ml-1.5 font-medium text-[color:var(--color-ink-3)]">Optional</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-[13px] leading-snug text-[color:var(--color-ink-3)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="flex items-start gap-1.5 text-[13px] leading-snug text-[color:var(--color-danger-500)]">
          <AlertCircle className="mt-[1px] h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export const controlClass =
  "w-full rounded-[12px] border bg-[var(--color-surface)] px-3.5 text-[15px] text-[color:var(--color-ink)] " +
  "placeholder:text-[color:var(--color-ink-4)] transition-[border-color,box-shadow] duration-150 " +
  "border-[var(--color-line-2)] hover:border-[color:color-mix(in_oklab,var(--color-line-2)_55%,var(--color-ink-4))] " +
  "focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_22%,transparent)] " +
  "disabled:opacity-60 disabled:cursor-not-allowed aria-[invalid=true]:border-[var(--color-danger-500)]";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { prefix?: ReactNode; suffix?: ReactNode }>(
  function Input({ className, prefix, suffix, ...rest }, ref) {
    if (!prefix && !suffix) return <input ref={ref} className={cn(controlClass, "h-11", className)} {...rest} />;
    return (
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] text-[color:var(--color-ink-3)]">{prefix}</span>}
        <input ref={ref} className={cn(controlClass, "h-11", prefix ? "pl-8" : "", suffix ? "pr-16" : "", className)} {...rest} />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] text-[color:var(--color-ink-3)]">{suffix}</span>}
      </div>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(controlClass, "min-h-[112px] py-3 leading-relaxed resize-y", className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...rest }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(controlClass, "h-11 appearance-none pr-10", className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
    </div>
  );
});

interface CheckProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
}

export function Checkbox({ checked, onChange, label, description, disabled, id: given }: CheckProps) {
  const auto = useId();
  const id = given ?? auto;
  return (
    <label htmlFor={id} className={cn("flex items-start gap-3 py-1", disabled ? "opacity-60" : "cursor-pointer")}>
      <span className="relative mt-[1px] inline-flex">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-[6px] border transition-colors duration-150",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--color-surface)]",
            checked ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]" : "border-[var(--color-line-2)] bg-[var(--color-surface)]",
          )}
        >
          {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[14.5px] text-[color:var(--color-ink)]">{label}</span>
        {description && <span className="text-[13px] leading-snug text-[color:var(--color-ink-3)]">{description}</span>}
      </span>
    </label>
  );
}

export function Switch({ checked, onChange, label, description, disabled, id: given }: CheckProps) {
  const auto = useId();
  const id = given ?? auto;
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <label htmlFor={id} className="flex flex-col gap-0.5">
        <span className="text-[14.5px] font-medium text-[color:var(--color-ink)]">{label}</span>
        {description && <span className="text-[13px] leading-snug text-[color:var(--color-ink-3)]">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] disabled:opacity-50",
          checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-line-2)]",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgb(16_24_40/0.25)] transition-transform duration-200 ease-[var(--ease-out)]",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; icon?: ReactNode }[];
  label: string;
  size?: "sm" | "md";
  className?: string;
}

/** A radio group drawn as segments. Arrow keys move between options. */
export function Segmented<T extends string>({ value, onChange, options, label, size = "md", className }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex rounded-[12px] bg-[var(--color-surface-muted)] p-1", className)}>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
              if (!step) return;
              e.preventDefault();
              const next = (i + step + options.length) % options.length;
              onChange(options[next].value);
              // Roving tabindex: focus follows the selection, or it is left
              // on a button that has just left the tab order.
              const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
              radios?.[next]?.focus();
            }}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-[9px] font-semibold transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
              size === "sm" ? "h-8 px-3 text-[12.5px]" : "h-9 px-3.5 text-[13.5px]",
              selected
                ? "bg-[var(--color-surface)] text-[color:var(--color-ink)] shadow-[0_1px_2px_rgb(16_24_40/0.08),0_0_0_1px_var(--color-line)]"
                : "text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  name: string;
  value: string;
}

/** A large radio option, for questions that deserve a moment's thought. */
export function ChoiceCard({ selected, onSelect, title, description, icon, name, value }: ChoiceCardProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "hub-lift group relative flex cursor-pointer gap-4 rounded-[16px] border p-4 transition-[border-color,background-color,box-shadow] duration-200",
        selected
          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] shadow-[0_0_0_1px_var(--color-primary)]"
          : "border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-line-2)]",
      )}
    >
      <input id={id} type="radio" name={name} value={value} checked={selected} onChange={onSelect} className="peer sr-only" />
      {icon && (
        <span
          aria-hidden
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] transition-colors",
            selected ? "bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]" : "bg-[var(--color-surface-muted)] text-[color:var(--color-ink-2)]",
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[15.5px] font-semibold text-[color:var(--color-ink)]">{title}</span>
        {description && <span className="text-[13.5px] leading-snug text-[color:var(--color-ink-2)]">{description}</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
          selected ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]" : "border-[var(--color-line-2)]",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-offset-2",
        )}
      >
        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </label>
  );
}

/** A counter for small whole numbers (bedrooms, people). */
export function Stepper({ value, onChange, min = 0, max = 20, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="inline-flex items-center rounded-[12px] border border-[var(--color-line-2)] bg-[var(--color-surface)]" role="group" aria-label={label}>
      <button
        type="button"
        className="hub-press h-11 w-11 text-[20px] text-[color:var(--color-ink-2)] disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Fewer: ${label}`}
      >
        -
      </button>
      <output className="w-10 text-center text-[15px] font-semibold tabular-nums text-[color:var(--color-ink)]" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className="hub-press h-11 w-11 text-[20px] text-[color:var(--color-ink-2)] disabled:opacity-40"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`More: ${label}`}
      >
        +
      </button>
    </div>
  );
}
