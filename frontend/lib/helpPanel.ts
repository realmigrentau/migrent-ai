/**
 * The help panel (components/support/SupportWidget.tsx) can be opened from
 * anywhere on the public site, not only by its own floating button: the
 * phone tab bar's Help tab uses this. The widget loads after the page is
 * interactive, so a tap that lands first is kept and replayed on mount.
 */
export const HELP_OPEN_EVENT = "migrent:help-open";
export const HELP_STATE_EVENT = "migrent:help-state";

type HelpWindow = Window & { __migrentHelpPending?: boolean };

export function openHelp(open = true) {
  if (typeof window === "undefined") return;
  (window as HelpWindow).__migrentHelpPending = open;
  window.dispatchEvent(new CustomEvent(HELP_OPEN_EVENT, { detail: { open } }));
}

/** Called by the widget on mount: was it asked to open before it loaded? */
export function takePendingHelp(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as HelpWindow;
  const pending = Boolean(w.__migrentHelpPending);
  w.__migrentHelpPending = false;
  return pending;
}

/** The widget announces every open and close, so a tab can show it. */
export function announceHelp(open: boolean) {
  if (typeof window === "undefined") return;
  (window as HelpWindow).__migrentHelpPending = false;
  window.dispatchEvent(new CustomEvent(HELP_STATE_EVENT, { detail: { open } }));
}
