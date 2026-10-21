/**
 * Homes saved in this browser by someone who is not signed in (the hearts
 * on /seeker/search), moved to the account at sign-in.
 *
 * A small external store over localStorage, read with useSyncExternalStore:
 * empty on the server and during hydration, then what this browser has.
 * Where storage is unavailable, hearts still work for this visit.
 */
import { useSyncExternalStore } from "react";

const KEY = "wishlist";
const EMPTY: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

// The last value read, so the same stored string gives the same Set
// (useSyncExternalStore compares snapshots by identity).
let lastRead: { raw: string | null; ids: ReadonlySet<string> } = { raw: null, ids: EMPTY };
let inMemory: ReadonlySet<string> | null = null;

function parse(raw: string | null): ReadonlySet<string> {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? new Set(parsed.filter((x): x is string => typeof x === "string")) : EMPTY;
  } catch {
    return EMPTY; // corrupt storage: start empty
  }
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function readWishlist(): ReadonlySet<string> {
  if (inMemory) return inMemory;
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== lastRead.raw) lastRead = { raw, ids: parse(raw) };
  return lastRead.ids;
}

export function writeWishlist(ids: ReadonlySet<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(ids)));
    inMemory = null;
  } catch {
    inMemory = ids; // storage unavailable
  }
  notify();
}

export function clearWishlist() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
  inMemory = null;
  notify();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useWishlist(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, readWishlist, () => EMPTY);
}
