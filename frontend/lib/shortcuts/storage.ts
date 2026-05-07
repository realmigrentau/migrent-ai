import { DEFAULT_PREFS, type ShortcutCategory, type ShortcutPrefs } from "./types";

const STORAGE_KEY = "migrent_shortcut_prefs_v1";

export function loadPrefs(): ShortcutPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<ShortcutPrefs>;
    return {
      enabled: parsed.enabled ?? DEFAULT_PREFS.enabled,
      categories: { ...DEFAULT_PREFS.categories, ...(parsed.categories || {}) },
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: ShortcutPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    // Notify listeners in the same tab.
    window.dispatchEvent(new CustomEvent("migrent:shortcut-prefs-changed"));
  } catch {
    // Ignore quota errors.
  }
}

export function setEnabled(enabled: boolean): ShortcutPrefs {
  const next = { ...loadPrefs(), enabled };
  savePrefs(next);
  return next;
}

export function setCategoryEnabled(
  category: ShortcutCategory,
  enabled: boolean
): ShortcutPrefs {
  const current = loadPrefs();
  const next: ShortcutPrefs = {
    ...current,
    categories: { ...current.categories, [category]: enabled },
  };
  savePrefs(next);
  return next;
}

export function resetPrefs(): ShortcutPrefs {
  savePrefs(DEFAULT_PREFS);
  return DEFAULT_PREFS;
}
