/**
 * The inline theme bootstrap. Kept in one exported string so the CSP hash in
 * next.config.ts and the script tag in _document.tsx are computed from the
 * same bytes. Do not add whitespace inside the script without knowing the
 * hash changes with it (it is recomputed at build, so that is fine).
 *
 * MigRent is light only. This used to read localStorage, fall back to the OS
 * `prefers-color-scheme`, and put `.dark` on <html> before first paint - and
 * it was the real switch, not the button in the header. Removing the button
 * and leaving this in place would have kept every visitor whose laptop is in
 * dark mode on a dark site with no way back.
 *
 * It still runs, because two things need undoing rather than merely not
 * doing: a `.dark` class cached in a prerendered document, and a stored
 * "dark" from before the change that would otherwise sit in the reader's
 * browser forever. So it clears both, once, before first paint.
 */
export const THEME_BOOTSTRAP_SCRIPT =
  "(function(){try{document.documentElement.classList.remove('dark');if(localStorage.getItem('theme')){localStorage.removeItem('theme');}}catch(e){}})();";
