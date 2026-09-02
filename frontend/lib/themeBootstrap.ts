/**
 * The inline theme bootstrap. Kept in one exported string so the CSP hash in
 * next.config.ts and the script tag in _document.tsx are computed from the
 * same bytes. Do not add whitespace inside the script without knowing the
 * hash changes with it (it is recomputed at build, so that is fine).
 */
export const THEME_BOOTSTRAP_SCRIPT =
  "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();";
