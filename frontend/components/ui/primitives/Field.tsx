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
          className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
        >
          {label}
          {required && <span className="text-rose-600">*</span>}
          {optional && (
            <span className="text-xs font-normal text-slate-500">(optional)</span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <span className="text-xs text-rose-600">{error}</span>
      ) : (
        hint && <span className="text-xs text-slate-500">{hint}</span>
      )}
    </div>
  );
}
