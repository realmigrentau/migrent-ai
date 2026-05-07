import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Search, ArrowRight, Home, LayoutDashboard, MessageSquare, Heart, List, Settings, Plus, Keyboard, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Kbd from "./Kbd";
import { emit } from "../../lib/shortcuts/events";
import { supabase } from "../../lib/supabase";

type Action = {
  id: string;
  label: string;
  hint?: string;
  group: "Navigation" | "Actions";
  icon: LucideIcon;
  keys?: string[];
  isSequence?: boolean;
  run: () => void;
  visible: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  role: "owner" | "seeker" | null;
  isAuthenticated: boolean;
};

export default function CommandPalette({ open, onClose, role, isAuthenticated }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const actions = useMemo<Action[]>(() => {
    const go = (href: string) => () => {
      void router.push(href);
      onClose();
    };

    const list: Action[] = [
      {
        id: "go.home",
        label: "Go to Home",
        group: "Navigation",
        icon: Home,
        keys: ["g", "h"],
        isSequence: true,
        run: go("/"),
        visible: true,
      },
      {
        id: "go.dashboard",
        label: "Go to Dashboard",
        group: "Navigation",
        icon: LayoutDashboard,
        keys: ["g", "d"],
        isSequence: true,
        run: go("/dashboard"),
        visible: isAuthenticated,
      },
      {
        id: "go.search",
        label: "Search listings",
        group: "Navigation",
        icon: Search,
        keys: ["g", "s"],
        isSequence: true,
        run: go("/seeker/search"),
        visible: true,
      },
      {
        id: "go.messages",
        label: "Go to Messages",
        group: "Navigation",
        icon: MessageSquare,
        keys: ["g", "m"],
        isSequence: true,
        run: go("/account/messages"),
        visible: isAuthenticated,
      },
      {
        id: "go.wishlist",
        label: "Go to Wishlist",
        group: "Navigation",
        icon: Heart,
        keys: ["g", "w"],
        isSequence: true,
        run: go("/seeker/wishlist"),
        visible: role === "seeker",
      },
      {
        id: "go.my-listings",
        label: "Go to My Listings",
        group: "Navigation",
        icon: List,
        keys: ["g", "l"],
        isSequence: true,
        run: go("/owner/listings"),
        visible: role === "owner",
      },
      {
        id: "go.settings",
        label: "Go to Settings",
        group: "Navigation",
        icon: Settings,
        keys: ["g", "p"],
        isSequence: true,
        run: go("/account/settings"),
        visible: isAuthenticated,
      },
      {
        id: "act.new-listing",
        label: "Create new listing",
        group: "Actions",
        icon: Plus,
        run: go("/owner/listings/new"),
        visible: role === "owner",
      },
      {
        id: "act.shortcuts",
        label: "Show keyboard shortcuts",
        group: "Actions",
        icon: Keyboard,
        keys: ["?"],
        run: () => {
          onClose();
          requestAnimationFrame(() => emit("shortcut:open-cheatsheet"));
        },
        visible: true,
      },
      {
        id: "act.signout",
        label: "Sign out",
        group: "Actions",
        icon: LogOut,
        run: async () => {
          onClose();
          await supabase.auth.signOut();
          void router.push("/");
        },
        visible: isAuthenticated,
      },
    ];
    return list.filter((a) => a.visible);
  }, [router, onClose, role, isAuthenticated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(q));
  }, [query, actions]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    } else {
      previouslyFocused.current?.focus?.();
    }
  }, [open]);

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Keyboard navigation within the palette
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[activeIdx];
        if (item) item.run();
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, activeIdx, onClose]);

  if (!open) return null;

  // Group filtered results
  const groups = filtered.reduce<Record<string, Action[]>>((acc, a) => {
    (acc[a.group] = acc[a.group] || []).push(a);
    return acc;
  }, {});

  let runningIdx = -1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[1000] flex items-start justify-center px-4 pt-[12vh] pb-8 bg-slate-900/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            aria-label="Command palette input"
          />
          <Kbd keys={["Escape"]} className="hidden sm:inline-flex" />
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-2">
          {Object.keys(groups).length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No matches for {`"${query}"`}
            </div>
          )}
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="py-1">
              <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group}
              </div>
              {items.map((a) => {
                runningIdx++;
                const idx = runningIdx;
                const Icon = a.icon;
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => a.run()}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{a.label}</span>
                    </span>
                    {a.keys ? (
                      <Kbd keys={a.keys} isSequence={a.isSequence} />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <Kbd keys={["arrowup"]} />
            <Kbd keys={["arrowdown"]} />
            to navigate
          </span>
          <span className="flex items-center gap-2">
            <Kbd keys={["Enter"]} />
            to run
          </span>
        </div>
      </div>
    </div>
  );
}
