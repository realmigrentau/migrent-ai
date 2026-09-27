import { useCallback } from "react";
import { hubApi } from "./api";
import { invalidate, setQueryData, useHubQuery } from "./query";

/**
 * Saved homes, shared by every heart button in the Hub. Toggling is
 * optimistic: the heart fills at once and quietly reverts if the API says
 * no (for example, the home was just taken down).
 */
export function useSavedHomes(enabled = true) {
  const q = useHubQuery<{ ids: string[] }>(enabled ? "/hub/saved/ids" : null);
  const ids = new Set(q.data?.ids ?? []);

  const toggle = useCallback(async (listingId: string, save: boolean) => {
    setQueryData<{ ids: string[] }>("/hub/saved/ids", (prev) => {
      const set = new Set(prev?.ids ?? []);
      if (save) set.add(listingId);
      else set.delete(listingId);
      return { ids: Array.from(set) };
    });
    try {
      if (save) await hubApi.post("/hub/saved", { listing_id: listingId });
      else await hubApi.del(`/hub/saved/${listingId}`);
      invalidate("/hub/saved");
      invalidate("/hub/home");
      return true;
    } catch (e) {
      setQueryData<{ ids: string[] }>("/hub/saved/ids", (prev) => {
        const set = new Set(prev?.ids ?? []);
        if (save) set.delete(listingId);
        else set.add(listingId);
        return { ids: Array.from(set) };
      });
      throw e;
    }
  }, []);

  return { ids, loaded: Boolean(q.data), toggle };
}
