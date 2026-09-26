import { useCallback } from "react";

/* Deliberately still a union. The hook only ever answers "light", but
   several call sites compare against "dark" to pick a class or an icon,
   and narrowing the type turns each of those into a compile error for no
   benefit. They now take their light branch and nothing else changes. */
type Theme = "light" | "dark";

/**
 * The site is light only.
 *
 * There used to be a real light/dark toggle here, reading the stored choice
 * or the OS preference and putting a `.dark` class on <html>. It went
 * because the homepage hero is a sunrise: the page performs night turning
 * into morning and then hands the reader to the sections below, which live
 * in the morning it arrived at. A dark theme puts that walk somewhere it
 * cannot land, and the two halves of the site stop agreeing about what time
 * of day it is.
 *
 * The hook is kept rather than deleted because it is imported in several
 * places and each one only wants `theme` to render an icon or a label. It
 * now always answers "light", never touches the document, and `toggle` is a
 * no-op. Every `:where(.dark)` rule in the stylesheets is dead code rather
 * than a bug - harmless, and the obvious place to start if dark mode ever
 * comes back.
 */
export function useTheme() {
  const setTheme = useCallback((_t: Theme) => {
    /* Intentionally empty: the preference no longer has anywhere to go. */
  }, []);
  const toggle = useCallback(() => {
    /* Intentionally empty - see the note above. */
  }, []);

  /* `mounted` is false on purpose, and it is the switch that actually
     removes the button.
     Every theme toggle in the app - both of them in the header, one more in
     the admin sidebar - is wrapped in `{mounted && ...}`, because a toggle
     that renders before the stored theme is read would flash the wrong
     icon. Answering false means none of them render at all, which retires
     the control from components this change does not otherwise touch. */
  return { theme: "light" as Theme, setTheme, toggle, mounted: false };
}
