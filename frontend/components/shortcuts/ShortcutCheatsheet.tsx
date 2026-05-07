import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { X, Search } from "lucide-react";
import Kbd from "./Kbd";
import { buildRegistry, isShortcutEligible } from "../../lib/shortcuts/registry";
import { CATEGORY_LABELS, type ShortcutCategory, type ShortcutContext } from "../../lib/shortcuts/types";
import { loadPrefs } from "../../lib/shortcuts/storage";

type Props = {
  open: boolean;
  onClose: () => void;
  ctx: ShortcutContext;
};

export default function ShortcutCheatsheet({ open, onClose, ctx }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const prefs = loadPrefs();
  const registry = useMemo(() => buildRegistry(router), [router]);
  const visible = registry.filter((d) => isShortcutEligible(d, ctx));

  const filtered = visible.filter((d) =>
    query.trim() === ""
      ? true
      : d.label.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce<Record<ShortcutCategory, typeof filtered>>(
    (acc, d) => {
      (acc[d.category] = acc[d.category] || []).push(d);
      return acc;
    },
    {} as Record<ShortcutCategory, typeof filtered>
  );

  // Focus management
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const input = dialogRef.current?.querySelector<HTMLInputElement>(
        'input[type="search"]'
      );
      input?.focus();
    }, 30);
    return () => {
      clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Escape and click-outside
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const orderedCategories: ShortcutCategory[] = [
    "navigation",
    "search",
    "listings",
    "messaging",
    "help",
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-cheatsheet-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-8 bg-slate-900/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2
              id="shortcuts-cheatsheet-title"
              className="text-base font-semibold text-slate-900 dark:text-white"
            >
              Keyboard shortcuts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Press a shortcut anywhere on MigRent
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search shortcuts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {orderedCategories.map((cat) => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            const categoryEnabled = prefs.categories[cat];
            return (
              <section key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {CATEGORY_LABELS[cat]}
                  </h3>
                  {!categoryEnabled && (
                    <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Disabled
                    </span>
                  )}
                </div>
                <ul className="rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {items.map((def) => (
                    <li
                      key={def.id}
                      className={`flex items-center justify-between px-4 py-2.5 ${
                        prefs.enabled && categoryEnabled
                          ? "bg-white dark:bg-slate-900"
                          : "bg-slate-50 dark:bg-slate-900/50 opacity-60"
                      }`}
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-200">
                        {def.label}
                      </span>
                      <Kbd keys={def.keys} isSequence={def.isSequence} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              No shortcuts match {`"${query}"`}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Tip: press <Kbd keys={["mod", "k"]} /> for the command palette
          </span>
          <Link
            href="/account/settings/keyboard"
            onClick={onClose}
            className="text-rose-600 dark:text-rose-400 hover:underline font-medium"
          >
            Manage shortcuts
          </Link>
        </div>
      </div>
    </div>
  );
}
