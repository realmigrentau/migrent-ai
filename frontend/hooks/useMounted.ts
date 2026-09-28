import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False during server rendering and hydration, true afterwards. For UI that
 * depends on browser-only state (the auth session, localStorage) so the
 * first client render matches the server HTML.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
