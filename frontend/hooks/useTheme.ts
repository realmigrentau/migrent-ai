import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "../lib/themeBootstrap";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

/**
 * The shared light/dark preference for the public site and Migrent Hub.
 *
 * lib/themeBootstrap.ts applies it before first paint; this hook reads and
 * changes it afterwards. The <html> class is the single source of truth for
 * the resolved theme, so every component (and every tab, through the
 * storage event) agrees. "system" follows the OS live.
 */

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const p = window.localStorage.getItem(THEME_STORAGE_KEY);
    return p === "light" || p === "dark" ? p : "system";
  } catch {
    return "system";
  }
}

function systemDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

function apply(pref: ThemePreference) {
  const dark = pref === "dark" || (pref === "system" && systemDark());
  const root = document.documentElement;
  // Suppress transitions for the one frame the palette swaps, so a hundred
  // elements do not animate their colours at once.
  root.classList.add("theme-switching");
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  root.setAttribute("data-theme-pref", pref);
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => root.classList.remove("theme-switching")));
  listeners.forEach((l) => l());
}

let wired = false;
function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (readPreference() === "system") apply("system");
  });
  window.addEventListener("storage", (e) => {
    if (e.key === THEME_STORAGE_KEY) apply(readPreference());
  });
}

function subscribe(cb: () => void) {
  wire();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const snapshot = () => `${readPreference()}|${typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"}`;

export function useTheme() {
  const value = useSyncExternalStore(subscribe, snapshot, () => "server");
  const mounted = value !== "server";
  const [prefRaw, resolvedRaw] = mounted ? value.split("|") : ["system", "light"];
  const preference = prefRaw as ThemePreference;
  const theme = resolvedRaw as Theme;

  const setPreference = useCallback((p: ThemePreference) => {
    try {
      if (p === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
      else window.localStorage.setItem(THEME_STORAGE_KEY, p);
    } catch {
      /* private mode: still apply for this page */
    }
    apply(p);
  }, []);

  const setTheme = useCallback((t: Theme) => setPreference(t), [setPreference]);
  const toggle = useCallback(() => {
    const dark = document.documentElement.classList.contains("dark");
    setPreference(dark ? "light" : "dark");
  }, [setPreference]);

  return { theme, preference, setPreference, setTheme, toggle, mounted };
}
