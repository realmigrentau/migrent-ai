/**
 * A small stale-while-revalidate cache for Hub reads.
 *
 * Moving between Hub screens shows the last known data instantly and
 * refreshes it in the background, so navigation never lands on a blank
 * page after the first visit. Writes call `invalidate(prefix)` (or
 * `setQueryData` for an optimistic update) and every mounted reader of that
 * key re-renders. Deliberately tiny: no dependency, one Map.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HubError, hubApi } from "./api";

type Entry = { data?: unknown; error?: HubError; at: number; promise?: Promise<unknown> };

const cache = new Map<string, Entry>();
const subs = new Map<string, Set<() => void>>();
const STALE_MS = 30_000;

function emit(key: string) {
  subs.get(key)?.forEach((f) => f());
}

function subscribe(key: string, fn: () => void) {
  let set = subs.get(key);
  if (!set) subs.set(key, (set = new Set()));
  set.add(fn);
  return () => set!.delete(fn);
}

async function load<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = cache.get(key);
  if (existing?.promise) return existing.promise as Promise<T>;
  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, at: Date.now() });
      emit(key);
      return data;
    })
    .catch((error: unknown) => {
      const err = error instanceof HubError ? error : new HubError("Something went wrong. Please try again.", 0);
      cache.set(key, { ...cache.get(key), error: err, at: Date.now(), promise: undefined });
      emit(key);
      throw err;
    });
  cache.set(key, { ...existing, at: existing?.at ?? 0, promise });
  emit(key);
  return promise;
}

export function setQueryData<T>(key: string, updater: T | ((prev: T | undefined) => T)) {
  const prev = cache.get(key)?.data as T | undefined;
  const data = typeof updater === "function" ? (updater as (p: T | undefined) => T)(prev) : updater;
  cache.set(key, { data, at: Date.now() });
  emit(key);
}

export function getQueryData<T>(key: string): T | undefined {
  return cache.get(key)?.data as T | undefined;
}

/** Mark every key starting with `prefix` stale and refetch mounted ones. */
export function invalidate(prefix: string) {
  for (const key of Array.from(cache.keys())) {
    if (key.startsWith(prefix)) {
      const e = cache.get(key)!;
      cache.set(key, { ...e, at: 0 });
      if (subs.get(key)?.size) void load(key, () => hubApi.get(key)).catch(() => {});
    }
  }
}

export function clearQueryCache() {
  cache.clear();
}

/**
 * Read a Hub endpoint. `key` is the API path (e.g. "/hub/home"); pass null
 * to wait (for example until a session exists).
 */
export function useHubQuery<T>(key: string | null, opts: { enabled?: boolean } = {}) {
  const enabled = opts.enabled !== false && Boolean(key);
  const k = key ?? "";
  const entry = useSyncExternalStore(
    useCallback((fn) => (k ? subscribe(k, fn) : () => {}), [k]),
    () => (k ? cache.get(k) : undefined),
    () => undefined,
  );
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const e = cache.get(k);
    if (!e || (!e.promise && Date.now() - e.at > STALE_MS)) void load(k, () => hubApi.get<T>(k)).catch(() => {});
  }, [k, enabled]);

  // Refresh when the tab comes back into view.
  useEffect(() => {
    if (!enabled) return;
    const onFocus = () => {
      const e = cache.get(k);
      if (e && !e.promise && Date.now() - e.at > STALE_MS) void load(k, () => hubApi.get<T>(k)).catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [k, enabled]);

  const refetch = useCallback(() => (k ? load(k, () => hubApi.get<T>(k)) : Promise.resolve(undefined as T)), [k]);
  const mutate = useCallback((updater: T | ((prev: T | undefined) => T)) => k && setQueryData<T>(k, updater), [k]);

  return {
    data: entry?.data as T | undefined,
    error: entry?.data === undefined ? entry?.error : undefined,
    staleError: entry?.error,
    loading: enabled && entry?.data === undefined && !entry?.error,
    refreshing: Boolean(entry?.promise) && entry?.data !== undefined,
    refetch,
    mutate,
  };
}

/** Run a write with pending/error state; returns null on failure. */
export function useHubMutation<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<HubError | null>(null);
  const run = useCallback(
    async (...args: A): Promise<R | null> => {
      setPending(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        const err = e instanceof HubError ? e : new HubError("Something went wrong. Please try again.", 0);
        setError(err);
        return null;
      } finally {
        setPending(false);
      }
    },
    [fn],
  );
  return { run, pending, error, setError };
}
