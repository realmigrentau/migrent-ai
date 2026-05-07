// A tiny in-page event bus for shortcut actions.
// Components subscribe to these events to handle contextual shortcuts
// (e.g. listing detail page listens for "shortcut:save-listing").

export type ShortcutEvent =
  | "shortcut:open-cheatsheet"
  | "shortcut:open-palette"
  | "shortcut:contact-owner";

export function emit(event: ShortcutEvent, detail?: unknown): boolean {
  if (typeof window === "undefined") return false;
  const ev = new CustomEvent(event, { detail, cancelable: true });
  return window.dispatchEvent(ev);
}

export function on(event: ShortcutEvent, handler: (e: CustomEvent) => void) {
  if (typeof window === "undefined") return () => {};
  const wrapped = (e: Event) => handler(e as CustomEvent);
  window.addEventListener(event, wrapped);
  return () => window.removeEventListener(event, wrapped);
}
