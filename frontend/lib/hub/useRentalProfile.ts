import { useCallback, useEffect, useRef, useState } from "react";
import { hubApi, HubError } from "./api";
import { invalidate, setQueryData, useHubQuery } from "./query";
import type { RentalProfileResponse } from "./types";
import { cleanForSave, type Patch, type ProfileDraft } from "../../components/hub/profile/sections";

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * The Rental Profile as an editable draft that saves itself.
 *
 * Edits apply locally at once and are written 900ms after the person stops
 * typing, so nothing is ever lost and no Save button is needed. `flush()`
 * saves immediately (before submitting an application, or leaving a step).
 */
export function useRentalProfile() {
  const q = useHubQuery<RentalProfileResponse>("/hub/rental-profile");
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const dirty = useRef(false);
  const timer = useRef<number | null>(null);
  const latest = useRef<ProfileDraft | null>(null);

  useEffect(() => {
    if (q.data && !draft) {
      const d = { ...q.data.profile, display_name: q.data.display_name || "" } as ProfileDraft;
      setDraft(d);
      latest.current = d;
    }
  }, [q.data, draft]);

  const save = useCallback(async () => {
    if (!latest.current || !dirty.current) return true;
    dirty.current = false;
    setState("saving");
    try {
      const { display_name, ...rest } = cleanForSave(latest.current);
      const res = await hubApi.put<RentalProfileResponse>("/hub/rental-profile", { ...rest, display_name: display_name?.trim() || undefined, user_id: undefined, updated_at: undefined });
      setQueryData("/hub/rental-profile", res);
      invalidate("/hub/home");
      invalidate("/hub/me");
      setState("saved");
      setError(null);
      return true;
    } catch (e) {
      dirty.current = true;
      setState("error");
      setError(e instanceof HubError ? e.message : "Your changes did not save.");
      return false;
    }
  }, []);

  const update = useCallback(
    (patch: Patch) => {
      setDraft((prev) => {
        const next = { ...(prev as ProfileDraft), ...patch };
        latest.current = next;
        return next;
      });
      dirty.current = true;
      setState("idle");
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void save(), 900);
    },
    [save],
  );

  const flush = useCallback(async () => {
    if (timer.current) window.clearTimeout(timer.current);
    return save();
  }, [save]);

  // Save on the way out, and warn if a save is still pending.
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        void save();
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      if (dirty.current) void save();
    };
  }, [save]);

  return { data: q.data, error: q.error, loading: q.loading, refetch: q.refetch, draft, update, flush, state, saveError: error };
}
