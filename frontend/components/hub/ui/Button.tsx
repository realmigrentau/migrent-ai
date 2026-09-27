import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/cn";
import HubLink from "../HubLink";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "soft";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "hub-press relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-[var(--ease-out)] " +
  "disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[color:var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-pressed)] shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,0_1px_2px_rgb(16_24_40/0.12)]",
  secondary:
    "bg-[var(--color-surface)] text-[color:var(--color-ink)] border border-[var(--color-line-2)] hover:bg-[var(--color-surface-hover)] hover:border-[color:color-mix(in_oklab,var(--color-line-2)_60%,var(--color-ink-4))]",
  ghost: "bg-transparent text-[color:var(--color-ink-2)] hover:bg-[var(--color-surface-hover)] hover:text-[color:var(--color-ink)]",
  soft: "bg-[var(--color-primary-soft)] text-[color:var(--color-primary-700)] dark:text-[color:var(--color-primary)] hover:bg-[color:color-mix(in_oklab,var(--color-primary-soft)_80%,var(--color-primary)_20%)]",
  danger: "bg-[var(--color-danger-500)] text-white dark:text-[#1a0b09] hover:bg-[var(--color-danger-600)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-[10px]",
  md: "h-11 px-4.5 text-[14px] rounded-[12px]",
  lg: "h-12 px-6 text-[15px] rounded-[12px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, iconRight, block, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
});

interface ButtonLinkProps {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
  className?: string;
  children: ReactNode;
  external?: boolean;
}

/** A link that looks like a button: to a Hub path, or (external) any URL. */
export function ButtonLink({ to, variant = "primary", size = "md", icon, iconRight, block, className, children, external }: ButtonLinkProps) {
  const cls = cn(base, variants[variant], sizes[size], block && "w-full", className);
  if (external) {
    return (
      <a href={to} className={cls}>
        {icon}
        {children}
        {iconRight}
      </a>
    );
  }
  return (
    <HubLink to={to} className={cls}>
      {icon}
      {children}
      {iconRight}
    </HubLink>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md";
  tone?: "default" | "glass";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = "md", tone = "default", className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "hub-press inline-flex items-center justify-center rounded-full transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        size === "sm" ? "h-9 w-9" : "h-11 w-11",
        tone === "glass"
          ? "bg-[var(--color-glass)] backdrop-blur-md border border-[var(--color-glass-line)] text-[color:var(--color-ink)] hover:bg-[var(--color-surface)]"
          : "text-[color:var(--color-ink-2)] hover:bg-[var(--color-surface-hover)] hover:text-[color:var(--color-ink)]",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
