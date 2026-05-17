import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'accent' | 'link';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.005em] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] focus-visible:ring-[var(--color-ink)] disabled:opacity-45 disabled:cursor-not-allowed select-none whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-500)] active:bg-[var(--color-primary-700)]',
  secondary:
    'bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-line-2)] hover:bg-[var(--color-surface)] hover:border-[var(--color-ink-3)]',
  ghost:
    'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)]',
  destructive:
    'bg-[var(--color-danger-500)] text-white hover:opacity-90',
  accent:
    'bg-[var(--color-accent)] text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-600)]',
  link:
    'bg-transparent text-[var(--color-ink)] hover:underline underline-offset-[3px] decoration-[1.5px] !px-0',
};

const sizes: Record<Size, string> = {
  sm: 'h-[30px] px-3 text-[13px] rounded-[6px]',
  md: 'h-[38px] px-4 text-[14px] rounded-[10px]',
  lg: 'h-[46px] px-5 text-[15px] rounded-[10px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    leadingIcon,
    trailingIcon,
    loading = false,
    fullWidth = false,
    className,
    disabled,
    children,
    ...rest
  },
  ref
) {
  const isLink = variant === 'link';
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        base,
        variants[variant],
        isLink ? 'h-auto px-0 py-0 rounded-none' : sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        leadingIcon
      )}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});
