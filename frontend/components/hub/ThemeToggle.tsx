import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "../../hooks/useTheme";
import { cn } from "../../lib/cn";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Match my device", icon: Monitor },
];

/** Three-way theme control. The same preference applies to the whole of Migrent. */
export function ThemeSegmented({ compact, className }: { compact?: boolean; className?: string }) {
  const { preference, setPreference, mounted } = useTheme();
  return (
    <div role="radiogroup" aria-label="Appearance" className={cn("inline-flex rounded-[12px] bg-[var(--color-surface-muted)] p-1", className)}>
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = mounted && preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setPreference(value)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-[9px] font-semibold transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
              compact ? "h-8 w-9" : "h-9 px-3 text-[13px]",
              selected ? "bg-[var(--color-surface)] text-[color:var(--color-ink)] shadow-[0_1px_2px_rgb(16_24_40/0.08),0_0_0_1px_var(--color-line)]" : "text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {!compact && <span>{value === "system" ? "Auto" : label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** A single icon button that flips light/dark, for headers. */
export function ThemeIconButton({ className }: { className?: string }) {
  const { theme, toggle, mounted } = useTheme();
  const dark = mounted && theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "hub-press inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-ink-2)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[color:var(--color-ink)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        className,
      )}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />}
    </button>
  );
}
