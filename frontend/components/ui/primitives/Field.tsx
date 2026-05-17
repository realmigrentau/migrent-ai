import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  optional,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[12.5px] font-semibold text-[var(--color-ink-2)] tracking-[-0.005em] flex items-center gap-1.5"
        >
          {label}
          {required && <span className="text-[var(--color-danger-500)]">*</span>}
          {optional && (
            <span className="text-xs font-normal text-[var(--color-ink-3)]">(optional)</span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <span className="text-xs text-[var(--color-danger-500)]">{error}</span>
      ) : (
        hint && <span className="text-xs text-[var(--color-ink-3)]">{hint}</span>
      )}
    </div>
  );
}
