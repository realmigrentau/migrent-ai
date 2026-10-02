import { useEffect, useState } from "react";
import { hubApi } from "./api";

/**
 * The server's check of suburb, state and postcode against the ABS
 * localities (GET /hub/location-check, backend/listing_rules.py), run while
 * the host types. `problem` will stop the listing on submit; `hint` is advice.
 */
export interface LocationCheck {
  problem: string | null;
  hint: string | null;
  match: { suburb: string; state: string; postcode: string } | null;
}

const cache = new Map<string, LocationCheck>();

export function useLocationCheck(suburb?: string | null, postcode?: string | number | null, state?: string | null): LocationCheck | null {
  const s = (suburb ?? "").trim();
  const pc = String(postcode ?? "").trim();
  const ready = s.length >= 2 && /^\d{4}$/.test(pc);
  const key = `${s.toLowerCase()}|${pc}|${state ?? ""}`;
  const [result, setResult] = useState<{ key: string; check: LocationCheck } | null>(null);

  useEffect(() => {
    if (!ready || cache.has(key)) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ suburb: s, postcode: pc });
      if (state) params.set("state", state);
      hubApi
        .get<LocationCheck>(`/hub/location-check?${params}`, controller.signal)
        .then((check) => {
          cache.set(key, check);
          setResult({ key, check });
        })
        .catch(() => {
          // A failed check is not a problem: the server checks again on submit.
        });
    }, 400);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [key, ready, s, pc, state]);

  if (!ready) return null;
  return cache.get(key) ?? (result?.key === key ? result.check : null);
}
