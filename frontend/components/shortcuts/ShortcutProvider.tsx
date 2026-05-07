import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useShortcuts } from "../../lib/shortcuts/useShortcuts";
import { on, emit } from "../../lib/shortcuts/events";
import { isTouchOnly } from "../../lib/shortcuts/utils";
import ShortcutCheatsheet from "./ShortcutCheatsheet";
import CommandPalette from "./CommandPalette";
import { useRouter } from "next/router";
import { Keyboard, X } from "lucide-react";

const TIP_KEY = "migrent_shortcut_tip_seen_v1";

// Mounted once at the app root. Wires the global keyboard listener,
// the cheatsheet (?), and the command palette (Cmd/Ctrl+K).
export default function ShortcutProvider() {
  const router = useRouter();
  const { session, user } = useAuth();
  const isAuthenticated = !!session && !!user;
  const [role, setRole] = useState<"owner" | "seeker" | null>(null);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tipVisible, setTipVisible] = useState(false);

  // Read role from user metadata when available.
  useEffect(() => {
    const meta = user?.user_metadata as { role?: string } | undefined;
    if (meta?.role === "owner" || meta?.role === "seeker") {
      setRole(meta.role);
      return;
    }
    // Fall back to a session-cached profile role if the app stores one.
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("migrent_role");
        if (cached === "owner" || cached === "seeker") setRole(cached);
      } catch {
        // ignore
      }
    }
  }, [user]);

  // Subscribe to event-bus triggers from the registry.
  useEffect(() => {
    const offCheat = on("shortcut:open-cheatsheet", () => setCheatsheetOpen(true));
    const offPal = on("shortcut:open-palette", () => setPaletteOpen(true));
    return () => {
      offCheat();
      offPal();
    };
  }, []);

  // Close on route change.
  useEffect(() => {
    setCheatsheetOpen(false);
    setPaletteOpen(false);
  }, [router.pathname]);

  // First-visit tip: show once after user signs in, on desktop only.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (isTouchOnly()) return;
    try {
      if (localStorage.getItem(TIP_KEY)) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setTipVisible(true), 2500);
    return () => clearTimeout(t);
  }, [isAuthenticated]);

  const dismissTip = () => {
    setTipVisible(false);
    try {
      localStorage.setItem(TIP_KEY, "1");
    } catch {
      // ignore
    }
  };

  // The global keyboard hook.
  useShortcuts({
    isAuthenticated,
    role,
    paletteOpen,
    cheatsheetOpen,
  });

  return (
    <>
      <ShortcutCheatsheet
        open={cheatsheetOpen}
        onClose={() => setCheatsheetOpen(false)}
        ctx={{ pathname: router.pathname, role, isAuthenticated }}
      />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        role={role}
        isAuthenticated={isAuthenticated}
      />
      {tipVisible && !cheatsheetOpen && !paletteOpen && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[900] hidden md:flex items-center gap-3 max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl px-4 py-3 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shrink-0">
            <Keyboard className="w-4 h-4 text-white dark:text-slate-900" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Keyboard shortcuts are on
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-semibold">
                ?
              </kbd>{" "}
              any time to see them.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  dismissTip();
                  emit("shortcut:open-cheatsheet");
                }}
                className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
              >
                Show me
              </button>
              <button
                type="button"
                onClick={dismissTip}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Got it
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissTip}
            aria-label="Dismiss"
            className="ml-2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
