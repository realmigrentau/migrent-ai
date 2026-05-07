import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { buildRegistry, isShortcutEligible } from "./registry";
import { loadPrefs } from "./storage";
import { isTouchOnly, isTypingTarget, comboString, defKeyString } from "./utils";
import type { ShortcutContext, ShortcutPrefs } from "./types";

const SEQUENCE_TIMEOUT_MS = 1200;

type Args = {
  isAuthenticated: boolean;
  role: "owner" | "seeker" | null;
  paletteOpen: boolean;
  cheatsheetOpen: boolean;
};

export function useShortcuts({
  isAuthenticated,
  role,
  paletteOpen,
  cheatsheetOpen,
}: Args) {
  const router = useRouter();
  const prefsRef = useRef<ShortcutPrefs>(loadPrefs());
  const sequenceRef = useRef<{ key: string; expiresAt: number } | null>(null);

  // Reload prefs when they change (same tab) or storage event (other tab).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const refresh = () => {
      prefsRef.current = loadPrefs();
    };
    window.addEventListener("migrent:shortcut-prefs-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("migrent:shortcut-prefs-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Touch-only devices don't need keyboard listeners.
    if (isTouchOnly()) return;

    const handler = (e: KeyboardEvent) => {
      const prefs = prefsRef.current;
      if (!prefs.enabled) return;

      // While the palette or cheatsheet is open, those components handle
      // their own keys. We only let mod+k toggle the palette closed and
      // Esc bubble up to close them.
      if (paletteOpen || cheatsheetOpen) return;

      // Build context.
      const ctx: ShortcutContext = {
        pathname: router.pathname,
        role,
        isAuthenticated,
      };

      const typing = isTypingTarget(e.target);
      const combo = comboString(e);
      if (!combo) return;

      const registry = buildRegistry(router);

      // First, try modifier-based combos (mod+k, mod+enter, etc.).
      for (const def of registry) {
        if (def.isSequence) continue;
        if (!prefs.categories[def.category]) continue;
        if (!isShortcutEligible(def, ctx)) continue;
        if (typing && !def.allowInInput) continue;
        const expected = defKeyString(def.keys);
        if (combo === expected) {
          e.preventDefault();
          // Reset any pending sequence.
          sequenceRef.current = null;
          def.action(ctx);
          return;
        }
      }

      // Sequence matching (e.g. "g" then "d").
      // Only process when there is no modifier and we're not typing.
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;
      if (hasModifier || typing) return;

      const now = Date.now();
      const pending = sequenceRef.current;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      // If we have a pending first key, try to match a sequence.
      if (pending && pending.expiresAt > now) {
        for (const def of registry) {
          if (!def.isSequence || def.keys.length !== 2) continue;
          if (!prefs.categories[def.category]) continue;
          if (!isShortcutEligible(def, ctx)) continue;
          const [first, second] = def.keys;
          if (pending.key === first && key === second) {
            e.preventDefault();
            sequenceRef.current = null;
            def.action(ctx);
            return;
          }
        }
        // No match - clear and fall through to start a new sequence.
        sequenceRef.current = null;
      }

      // Try non-sequence single-key shortcuts (e.g. "?", "/", "n", "s", "c").
      for (const def of registry) {
        if (def.isSequence) continue;
        if (def.keys.length !== 1) continue;
        if (!prefs.categories[def.category]) continue;
        if (!isShortcutEligible(def, ctx)) continue;
        const expected = def.keys[0].toLowerCase();
        if (key === expected) {
          e.preventDefault();
          def.action(ctx);
          return;
        }
      }

      // If this key is the first key of any sequence, start a sequence.
      const startsSequence = registry.some(
        (def) =>
          def.isSequence &&
          prefs.categories[def.category] &&
          isShortcutEligible(def, ctx) &&
          def.keys[0].toLowerCase() === key
      );
      if (startsSequence) {
        sequenceRef.current = { key, expiresAt: now + SEQUENCE_TIMEOUT_MS };
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, role, isAuthenticated, paletteOpen, cheatsheetOpen]);
}
