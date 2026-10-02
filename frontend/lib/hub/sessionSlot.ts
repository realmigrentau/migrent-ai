import type { ComponentType, ReactNode } from "react";

/**
 * Where the Hub's session provider is left for _app.tsx.
 *
 * _app.tsx must not import lib/hub/session itself, or every public page
 * would download the Hub's session code and the Supabase client. Loading
 * it with next/dynamic instead made every Hub page fail hydration: the
 * provider was not there yet when React took over, so React threw the
 * server's HTML away and drew the page again (React error 418).
 *
 * Hub pages import lib/hub/session anyway (useHub), and a page's imports
 * run before _app renders it, on the server and in the browser. So
 * session.tsx puts its provider here and _app picks it up on the first
 * render, with no extra download and nothing to wait for.
 */
type Provider = ComponentType<{ children: ReactNode }>;

let provider: Provider | null = null;

export function setHubSessionProvider(p: Provider) {
  provider = p;
}

export function hubSessionProvider(): Provider | null {
  return provider;
}
