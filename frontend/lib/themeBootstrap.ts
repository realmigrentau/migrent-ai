/**
 * The inline theme bootstrap. Kept in one exported string so the CSP hash in
 * next.config.ts and the script tag in _document.tsx are computed from the
 * same bytes (the hash is recomputed at build, so editing this is safe).
 *
 * One preference for the whole of Migrent - the public site and Migrent Hub
 * share it: "light", "dark" or "system" (the default), stored under
 * THEME_STORAGE_KEY. It runs before first paint and puts `.dark` on <html>
 * when the resolved theme is dark, so there is no flash of the wrong theme
 * and server-rendered markup never has to guess.
 *
 * `data-theme-pref` records the preference itself, so the toggle can render
 * the right state on its first client render.
 */
export const THEME_STORAGE_KEY = "migrent-theme";

export const THEME_BOOTSTRAP_SCRIPT =
  "(function(){try{var d=document.documentElement,p=localStorage.getItem('migrent-theme');if(p!=='light'&&p!=='dark')p='system';var k=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',k);d.style.colorScheme=k?'dark':'light';d.setAttribute('data-theme-pref',p);}catch(e){}})();";
