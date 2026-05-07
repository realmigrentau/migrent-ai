import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, RotateCcw, Keyboard, Search, Smartphone } from "lucide-react";
import Kbd from "../../../components/shortcuts/Kbd";
import { buildRegistry, isShortcutEligible } from "../../../lib/shortcuts/registry";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  type ShortcutCategory,
  type ShortcutContext,
} from "../../../lib/shortcuts/types";
import {
  loadPrefs,
  resetPrefs,
  setCategoryEnabled,
  setEnabled,
} from "../../../lib/shortcuts/storage";
import { useAuth } from "../../../hooks/useAuth";
import { isTouchOnly } from "../../../lib/shortcuts/utils";
import { emit } from "../../../lib/shortcuts/events";

const ORDER: ShortcutCategory[] = [
  "navigation",
  "search",
  "listings",
  "messaging",
  "help",
];

export default function KeyboardSettingsPage() {
  const router = useRouter();
  const { session, user } = useAuth();
  const [prefs, setPrefsState] = useState(() => loadPrefs());
  const [query, setQuery] = useState("");
  const [touchOnly, setTouchOnly] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    setTouchOnly(isTouchOnly());
    const refresh = () => setPrefsState(loadPrefs());
    window.addEventListener("migrent:shortcut-prefs-changed", refresh);
    return () =>
      window.removeEventListener("migrent:shortcut-prefs-changed", refresh);
  }, []);

  const role = useMemo<"owner" | "seeker" | null>(() => {
    const meta = user?.user_metadata as { role?: string } | undefined;
    if (meta?.role === "owner" || meta?.role === "seeker") return meta.role;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("migrent_role");
        if (cached === "owner" || cached === "seeker") return cached;
      } catch {
        // ignore
      }
    }
    return null;
  }, [user]);

  const ctx: ShortcutContext = {
    pathname: router.pathname,
    role,
    isAuthenticated: !!session && !!user,
  };

  const registry = useMemo(() => buildRegistry(router), [router]);
  const visible = registry.filter((d) => isShortcutEligible(d, ctx));
  const filtered = visible.filter((d) =>
    query.trim() === ""
      ? true
      : d.label.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, d) => {
    (acc[d.category] = acc[d.category] || []).push(d);
    return acc;
  }, {});

  const onToggleMaster = (next: boolean) => {
    setPrefsState(setEnabled(next));
  };

  const onToggleCategory = (cat: ShortcutCategory, next: boolean) => {
    setPrefsState(setCategoryEnabled(cat, next));
  };

  const onReset = () => {
    setPrefsState(resetPrefs());
    setResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/account/settings"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to settings
          </Link>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shrink-0">
              <Keyboard className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                Keyboard shortcuts
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Move through MigRent faster. Press{" "}
                <Kbd keys={["?"]} /> any time to see the full list.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile banner */}
        {touchOnly && (
          <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 flex items-start gap-3">
            <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Keyboard shortcuts work best on desktop with a physical keyboard.
              They are disabled on touch-only devices.
            </p>
          </div>
        )}

        {/* Master toggle */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 mb-4">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">
                Enable keyboard shortcuts
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                When off, no MigRent shortcuts will fire. Browser shortcuts are
                not affected.
              </div>
            </div>
            <Toggle checked={prefs.enabled} onChange={onToggleMaster} />
          </label>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search shortcuts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
          />
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {ORDER.map((cat) => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            const catEnabled = prefs.categories[cat];
            const catActive = prefs.enabled && catEnabled;
            return (
              <section
                key={cat}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <header className="flex items-center justify-between gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 dark:text-white text-sm">
                      {CATEGORY_LABELS[cat]}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {CATEGORY_DESCRIPTIONS[cat]}
                    </div>
                  </div>
                  <Toggle
                    checked={catEnabled}
                    onChange={(v) => onToggleCategory(cat, v)}
                    disabled={!prefs.enabled}
                  />
                </header>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((def) => (
                    <li
                      key={def.id}
                      className={`flex items-center justify-between px-5 py-3 ${
                        catActive ? "" : "opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          aria-hidden="true"
                          className={`w-1.5 h-1.5 rounded-full ${
                            catActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-200 truncate">
                          {def.label}
                        </span>
                      </div>
                      <Kbd keys={def.keys} isSequence={def.isSequence} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {Object.keys(grouped).length === 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-10 text-center text-sm text-slate-500">
              No shortcuts match {`"${query}"`}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => emit("shortcut:open-cheatsheet")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Show cheatsheet
            <Kbd keys={["?"]} />
          </button>

          {!resetConfirm ? (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to defaults
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Reset all settings?</span>
              <button
                type="button"
                onClick={onReset}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                Yes, reset
              </button>
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        disabled
          ? "bg-slate-200 dark:bg-slate-700 opacity-50 cursor-not-allowed"
          : checked
          ? "bg-rose-600"
          : "bg-slate-200 dark:bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
