import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, CornerDownLeft, Plus, Search } from "lucide-react";
import { useHub } from "../../lib/hub/session";
import { cn } from "../../lib/cn";
import { useTheme } from "../../hooks/useTheme";
import { useFocusTrap } from "./ui/Overlay";
import { useHubNavigate } from "./HubLink";
import { navFor, footerNav } from "./nav";

interface Command {
  id: string;
  label: string;
  group: string;
  hint?: string;
  keywords?: string;
  icon?: React.ReactNode;
  run: () => void;
}

const RECENT_KEY = "migrent-hub-recent";

function score(q: string, text: string): number {
  // Subsequence match with a bonus for word starts and contiguous runs.
  const t = text.toLowerCase();
  const query = q.toLowerCase().trim();
  if (!query) return 1;
  if (t.includes(query)) return 100 - t.indexOf(query);
  let ti = 0;
  let s = 0;
  let run = 0;
  for (const ch of query) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return 0;
    run = found === ti ? run + 1 : 0;
    s += 1 + run + (found === 0 || t[found - 1] === " " ? 3 : 0);
    ti = found + 1;
  }
  return s;
}

function isMac() {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}

/** ⌘K / Ctrl+K. A quick way to anywhere - never the only way. */
export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { role, me, viewAs } = useHub();
  const isAdmin = Boolean(me?.is_admin && !viewAs);
  const navigate = useHubNavigate();
  const { toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const trapRef = useFocusTrap(open, close);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const go = useCallback(
    (to: string, label: string) => {
      try {
        const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as { to: string; label: string }[];
        const next = [{ to, label }, ...recent.filter((r) => r.to !== to)].slice(0, 4);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      close();
      void navigate(to);
    },
    [close, navigate],
  );

  const commands = useMemo<Command[]>(() => {
    const { primary } = navFor(role, { hasHome: true, isAdmin });
    const nav: Command[] = [...primary, ...footerNav, { label: "Profile and account", to: "/me", icon: ArrowRight }].map((n) => ({
      id: `nav-${n.to}`,
      label: n.label,
      group: "Go to",
      icon: <n.icon className="h-4 w-4" strokeWidth={1.75} />,
      run: () => go(n.to, n.label),
    }));
    const actions: Command[] = [];
    if (role === "owner") {
      actions.push(
        { id: "add-property", label: "List a property", group: "Actions", keywords: "add new listing room create", icon: <Plus className="h-4 w-4" strokeWidth={1.75} />, run: () => go("/properties/new", "List a property") },
        { id: "create-inspection", label: "Open inspection times", group: "Actions", keywords: "inspection schedule slot create", icon: <Plus className="h-4 w-4" strokeWidth={1.75} />, run: () => go("/inspections?new=1", "Open inspection times") },
        { id: "review-apps", label: "Review applications", group: "Actions", keywords: "applicants", icon: <ArrowRight className="h-4 w-4" strokeWidth={1.75} />, run: () => go("/applications", "Applications") },
      );
    } else if (role !== "admin") {
      actions.push(
        { id: "search", label: "Search homes", group: "Actions", keywords: "find rooms rent discover", icon: <Search className="h-4 w-4" strokeWidth={1.75} />, run: () => go("/discover", "Discover") },
        { id: "edit-profile", label: "Edit my Rental Profile", group: "Actions", keywords: "profile references documents", icon: <ArrowRight className="h-4 w-4" strokeWidth={1.75} />, run: () => go("/profile", "Rental Profile") },
        { id: "saved-searches", label: "My saved searches", group: "Actions", keywords: "alerts", icon: <ArrowRight className="h-4 w-4" strokeWidth={1.75} />, run: () => go("/saved?tab=searches", "Saved searches") },
      );
    }
    actions.push({ id: "theme", label: "Switch light or dark mode", group: "Actions", keywords: "theme appearance dark light", icon: <ArrowRight className="h-4 w-4" strokeWidth={1.75} />, run: () => { toggle(); close(); } });
    let recent: Command[] = [];
    try {
      recent = (JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as { to: string; label: string }[]).map((r) => ({
        id: `recent-${r.to}`,
        label: r.label,
        group: "Recent",
        icon: <Clock className="h-4 w-4" strokeWidth={1.75} />,
        run: () => go(r.to, r.label),
      }));
    } catch {
      recent = [];
    }
    return [...recent, ...actions, ...nav];
  }, [role, isAdmin, go, toggle, close]);

  const results = useMemo(() => {
    const q = query.trim();
    const list = commands
      .filter((c) => (q ? c.group !== "Recent" : true))
      .map((c) => ({ c, s: score(q, `${c.label} ${c.keywords ?? ""}`) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => (q ? b.s - a.s : 0))
      .map((r) => r.c);
    if (q && role !== "owner" && role !== "admin") {
      list.push({ id: "search-q", label: `Search homes for "${q}"`, group: "Search", icon: <Search className="h-4 w-4" strokeWidth={1.75} />, run: () => go(`/discover?q=${encodeURIComponent(q)}`, "Discover") });
    }
    return list.slice(0, 12);
  }, [commands, query, role, go]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    }
  };

  const headers = results.map((c, i) => (i === 0 || results[i - 1].group !== c.group ? c.group : null));
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-3 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-[rgb(9_11_16/0.35)] backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={close} aria-hidden />
          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[600px] overflow-hidden rounded-[20px] border border-[var(--color-glass-line)] bg-[var(--color-surface-2)] shadow-[var(--shadow-modal)]"
          >
            <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4">
              <Search className="h-5 w-5 shrink-0 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
              <input
                data-autofocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Where to?"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="hub-command-list"
                aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                className="h-14 flex-1 bg-transparent text-[16px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] focus:outline-none"
              />
              <kbd className="hidden rounded-[6px] border border-[var(--color-line-2)] px-1.5 py-0.5 text-[11px] font-semibold text-[color:var(--color-ink-3)] sm:inline">Esc</kbd>
            </div>
            <div ref={listRef} id="hub-command-list" role="listbox" aria-label="Commands" className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 && <p className="px-3 py-8 text-center text-[14px] text-[color:var(--color-ink-3)]">Nothing matches that.</p>}
              {results.map((c, i) => {
                const header = headers[i];
                return (
                  <div key={c.id}>
                    {header && <p className="px-3 pb-1 pt-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-4)]">{header}</p>}
                    <div
                      id={`cmd-${c.id}`}
                      data-index={i}
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => setActive(i)}
                      onClick={() => c.run()}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14.5px] font-medium",
                        i === active ? "bg-[var(--color-primary-soft)] text-[color:var(--color-ink)]" : "text-[color:var(--color-ink-2)]",
                      )}
                    >
                      <span aria-hidden className={cn(i === active ? "text-[color:var(--color-primary)]" : "text-[color:var(--color-ink-3)]")}>
                        {c.icon}
                      </span>
                      <span className="flex-1 truncate">{c.label}</span>
                      {i === active && <CornerDownLeft className="h-4 w-4 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 border-t border-[var(--color-line)] px-4 py-2.5 text-[12px] text-[color:var(--color-ink-3)]">
              <span>
                <kbd className="font-semibold">↑↓</kbd> to move
              </span>
              <span>
                <kbd className="font-semibold">Enter</kbd> to open
              </span>
              <span className="ml-auto">{isMac() ? "⌘K" : "Ctrl K"} anywhere</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
