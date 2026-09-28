import { useSyncExternalStore } from "react";

/**
 * The compare tray: up to four homes, kept in this browser while someone
 * shops around. Nothing here is sent anywhere until they open Compare.
 */
const KEY = "migrent-compare";
export const COMPARE_MAX = 4;
const subs = new Set<() => void>();

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, COMPARE_MAX) : [];
  } catch {
    return [];
  }
}

let cache = "";
function snapshot() {
  const v = JSON.stringify(read());
  if (v !== cache) cache = v;
  return cache;
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids.slice(0, COMPARE_MAX)));
  } catch {
    /* private mode */
  }
  subs.forEach((f) => f());
}

export function useCompare() {
  const raw = useSyncExternalStore(
    (f) => {
      subs.add(f);
      const onStorage = (e: StorageEvent) => e.key === KEY && f();
      window.addEventListener("storage", onStorage);
      return () => {
        subs.delete(f);
        window.removeEventListener("storage", onStorage);
      };
    },
    snapshot,
    () => "[]",
  );
  const ids: string[] = JSON.parse(raw);
  return {
    ids,
    has: (id: string) => ids.includes(id),
    full: ids.length >= COMPARE_MAX,
    toggle: (id: string) => write(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]),
    remove: (id: string) => write(ids.filter((x) => x !== id)),
    clear: () => write([]),
  };
}
