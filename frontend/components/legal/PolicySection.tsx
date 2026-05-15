import { ReactNode } from "react";

interface PolicySectionProps {
  id: string;
  number?: string | number;
  title: string;
  summary?: string;
  children: ReactNode;
}

export default function PolicySection({ id, number, title, summary, children }: PolicySectionProps) {
  return (
    <section id={id} className="scroll-mt-24 group">
      <div className="flex items-baseline gap-3 mb-4">
        {number !== undefined && (
          <span className="font-mono text-xs text-slate-400 dark:text-slate-500 tabular-nums">
            {String(number).padStart(2, "0")}
          </span>
        )}
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          <a href={`#${id}`} className="hover:opacity-80 transition-opacity">
            {title}
          </a>
        </h2>
      </div>
      {summary && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border-l-2 border-slate-300 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-medium text-slate-800 dark:text-slate-200">In short: </span>
            {summary}
          </p>
        </div>
      )}
      <div className="prose-policy text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}
