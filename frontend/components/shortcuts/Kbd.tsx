import { formatKey } from "../../lib/shortcuts/utils";

type Props = {
  keys: string[];
  isSequence?: boolean;
  className?: string;
};

export default function Kbd({ keys, isSequence, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label={keys.map((k) => formatKey(k)).join(isSequence ? " then " : " plus ")}
    >
      {keys.map((k, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <kbd className="inline-flex items-center justify-center min-w-[1.6rem] h-6 px-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold font-mono shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            {formatKey(k)}
          </kbd>
          {i < keys.length - 1 && (
            <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {isSequence ? "then" : "+"}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
