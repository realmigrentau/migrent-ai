// Helpers for the keyboard shortcut system.

export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || "");
}

export function isTouchOnly(): boolean {
  if (typeof window === "undefined") return false;
  // No fine pointer means we treat the device as touch-only.
  if (window.matchMedia && window.matchMedia("(any-hover: none)").matches) {
    return !window.matchMedia("(any-pointer: fine)").matches;
  }
  return false;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  // role=textbox is also a typing surface.
  if (target.getAttribute("role") === "textbox") return true;
  return false;
}

/** Render a key for display in the cheatsheet. */
export function formatKey(key: string): string {
  const mac = isMac();
  switch (key.toLowerCase()) {
    case "mod":
      return mac ? "⌘" : "Ctrl";
    case "shift":
      return mac ? "⇧" : "Shift";
    case "alt":
      return mac ? "⌥" : "Alt";
    case "enter":
      return "Enter";
    case "escape":
      return "Esc";
    case "arrowup":
      return "↑";
    case "arrowdown":
      return "↓";
    case "arrowleft":
      return "←";
    case "arrowright":
      return "→";
    case " ":
    case "space":
      return "Space";
    default:
      return key.length === 1 ? key.toUpperCase() : key;
  }
}

/** Build a single string key for matching (e.g. "mod+k", "g", "?"). */
export function comboString(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.metaKey || e.ctrlKey) parts.push("mod");
  if (e.shiftKey) parts.push("shift");
  if (e.altKey) parts.push("alt");
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  // Ignore lone modifier presses.
  if (key === "Control" || key === "Meta" || key === "Shift" || key === "Alt") {
    return "";
  }
  parts.push(key);
  return parts.join("+");
}

/** Convert a registry combo (e.g. ["mod","k"]) to a comparable string. */
export function defKeyString(keys: string[]): string {
  return keys
    .map((k) => (k === "mod" ? "mod" : k.length === 1 ? k.toLowerCase() : k))
    .join("+");
}
