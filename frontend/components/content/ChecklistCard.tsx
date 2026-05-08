import { useEffect, useState } from "react";
import { Check, Square } from "lucide-react";

interface ChecklistCardProps {
  title?: string;
  items: string[];
  storageKey?: string;
  gradient?: string;
}

export default function ChecklistCard({
  title = "Checklist",
  items,
  storageKey,
  gradient = "from-blue-500 to-indigo-500",
}: ChecklistCardProps) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(`migrent-checklist-${storageKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === items.length) {
          setChecked(parsed);
        }
      }
    } catch {}
  }, [storageKey, items.length]);

  const toggle = (i: number) => {
    const next = checked.map((c, idx) => (idx === i ? !c : c));
    setChecked(next);
    if (storageKey) {
      try {
        localStorage.setItem(`migrent-checklist-${storageKey}`, JSON.stringify(next));
      } catch {}
    }
  };

  const completed = checked.filter(Boolean).length;
  const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden my-6">
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{title}</h4>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {completed}/{items.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradient} transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-start gap-3 text-left group py-1.5"
              >
                <span
                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    checked[i]
                      ? `bg-gradient-to-br ${gradient} border-transparent`
                      : "border border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
                  }`}
                >
                  {checked[i] ? (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  ) : (
                    <Square className="w-3.5 h-3.5 opacity-0" />
                  )}
                </span>
                <span
                  className={`text-sm leading-relaxed ${
                    checked[i]
                      ? "text-slate-400 dark:text-slate-500 line-through"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {item}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
