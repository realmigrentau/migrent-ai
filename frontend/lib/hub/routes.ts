/**
 * Where Migrent Hub lives, and how to link into it.
 *
 * The Hub's pages are files under pages/hub. Where they are served depends
 * on configuration, and every link goes through these helpers so nothing
 * else has to know:
 *
 *   NEXT_PUBLIC_HUB_HOST unset (today)
 *     The Hub is served on the main site under /hub
 *     (migrent.vercel.app/hub/applications). Same origin, so one sign-in
 *     session covers the site and the Hub.
 *
 *   NEXT_PUBLIC_HUB_HOST=hub.migrent.com.au (once DNS exists)
 *     proxy.ts serves the Hub at the root of that host
 *     (hub.migrent.com.au/applications) and 308-redirects any /hub/* request
 *     on the main site there. NEXT_PUBLIC_AUTH_COOKIE_DOMAIN=.migrent.com.au
 *     lets both hosts share the session.
 *
 * A Hub path is always written without the prefix ("/applications"). The
 * Pages Router needs the file path as `href` and the address to show as
 * `as`, which is what hubLink() returns.
 */

export const HUB_HOST = (process.env.NEXT_PUBLIC_HUB_HOST || "").trim().toLowerCase();
export const HUB_PREFIX = "/hub";

/** The public site's origin, for links that leave the Hub on a hub host. */
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_ORIGIN || process.env.NEXT_PUBLIC_FRONTEND_URL || "").replace(/\/+$/, "");

export function hubOnOwnHost(): boolean {
  return Boolean(HUB_HOST);
}

function clean(path: string): string {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

/** The file route Next.js resolves: always /hub/... */
export function hubPage(path: string): string {
  return `${HUB_PREFIX}${clean(path)}` || HUB_PREFIX;
}

/** The address a person sees and shares. */
export function hubUrl(path: string): string {
  const p = clean(path);
  if (hubOnOwnHost()) return p || "/";
  return `${HUB_PREFIX}${p}`;
}

/** Absolute Hub URL, for leaving the public site (and for emails). */
export function hubAbsoluteUrl(path: string): string {
  if (hubOnOwnHost()) return `https://${HUB_HOST}${clean(path) || "/"}`;
  return hubUrl(path);
}

/** href/as pair for next/link and router.push inside the Hub. */
export function hubLink(path: string): { href: string; as: string } {
  const [pathname, rest = ""] = splitQuery(path);
  const suffix = rest ? `?${rest}` : "";
  return { href: `${hubPage(pathname)}${suffix}`, as: `${hubUrl(pathname)}${suffix}` };
}

function splitQuery(path: string): [string, string] {
  const hashFree = path.split("#")[0];
  const i = hashFree.indexOf("?");
  return i === -1 ? [hashFree, ""] : [hashFree.slice(0, i), hashFree.slice(i + 1)];
}

/**
 * A link from the Hub back to the public site. Relative while both share
 * an origin; absolute once the Hub has its own host.
 */
export function siteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (hubOnOwnHost() && SITE_ORIGIN) return `${SITE_ORIGIN}${p}`;
  return p;
}

/** Strip the /hub prefix from a router asPath, for `next` parameters. */
export function toHubPath(asPath: string): string {
  if (asPath === HUB_PREFIX) return "/";
  if (asPath.startsWith(`${HUB_PREFIX}/`) || asPath.startsWith(`${HUB_PREFIX}?`)) return asPath.slice(HUB_PREFIX.length) || "/";
  return asPath || "/";
}

/**
 * Validate a Hub `next` destination: a same-origin Hub path, never an
 * auth page (that loops) and never anything that could leave the site.
 */
export function safeHubPath(input: unknown, fallback = "/"): string {
  if (typeof input !== "string") return fallback;
  let value = input.trim();
  if (!value || value.length > 1024) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\") || value.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f\s]/.test(value) || /%0[ad]/i.test(value)) return fallback;
  if (/^\/[^/?#]*:/.test(value)) return fallback;
  value = toHubPath(value);
  const bare = value.split("?")[0].split("#")[0];
  if (/^\/(sign-in|sign-up|forgot-password|reset-password|auth|verify-mfa|locked)(\/|$)/.test(bare)) return fallback;
  return value;
}

/** Hub pages that do not need a session. */
export const HUB_PUBLIC_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/auth/callback", "/locked"];

export function isHubPublicPath(hubPath: string): boolean {
  const bare = hubPath.split("?")[0];
  return HUB_PUBLIC_PATHS.some((p) => bare === p || bare.startsWith(`${p}/`));
}

/** The sign-in URL that returns to `next` once signed in. */
export function hubSignInUrl(next?: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams();
  if (next && next !== "/") params.set("next", next);
  for (const [k, v] of Object.entries(extra ?? {})) params.set(k, v);
  const q = params.toString();
  return `${hubUrl("/sign-in")}${q ? `?${q}` : ""}`;
}

/**
 * Older signed-in pages and where they live in the Hub now. Used to route
 * notification links written before the Hub existed; next.config.ts sends
 * the same paths to the same places.
 */
const LEGACY_TO_HUB: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^\/dashboard(?:\/(?:owner|seeker))?\/?$/, () => "/"],
  [/^\/owner\/listings\/new\/?$/, () => "/properties/new"],
  [/^\/owner\/listings\/edit\/([^/?#]+)\/?$/, (m) => `/listings/${m[1]}/edit`],
  [/^\/owner\/listings\/?$/, () => "/properties"],
  [/^\/(?:account\/)?messages\/?$/, () => "/messages"],
  [/^\/account\/settings\/?$/, () => "/settings"],
  [/^\/seeker\/wishlist\/?$/, () => "/saved"],
  [/^\/seeker\/search\/?$/, () => "/discover"],
  [/^\/onboarding\/?$/, () => "/welcome"],
  // The old admin console (retired; see next.config.ts).
  [/^\/admin(?:\/(?:overview|analytics|revenue))?\/?$/, () => "/admin"],
  [/^\/admin\/moderation\/?$/, () => "/admin/listings"],
  [/^\/admin\/spam-moderation\/?$/, () => "/admin/listings?queue=flagged"],
  [/^\/admin\/listings\/?$/, () => "/admin/listings?queue=all"],
  [/^\/admin\/verification\/?$/, () => "/admin/id-checks"],
  [/^\/admin\/users\/?$/, () => "/admin/people"],
  [/^\/admin\/([^?#]+?)\/?$/, (m) => `/admin/${m[1]}`],
];

/**
 * Where a stored link (a notification's cta_url) should go: a Hub path to
 * open in place, or an address on the public site.
 */
export function resolveStoredLink(url: string | null | undefined): { hub: string } | { href: string } {
  if (!url) return { hub: "/activity" };
  let path = url.trim();
  try {
    if (/^https?:\/\//i.test(path)) {
      const u = new URL(path);
      const host = u.host.toLowerCase();
      const rest = `${u.pathname}${u.search}${u.hash}`;
      if (HUB_HOST && host === HUB_HOST) return { hub: rest || "/" };
      if (typeof window !== "undefined" && host !== window.location.host) return { href: u.toString() };
      path = rest;
    }
  } catch {
    return { hub: "/activity" };
  }
  if (path === HUB_PREFIX || path.startsWith(`${HUB_PREFIX}/`) || path.startsWith(`${HUB_PREFIX}?`)) return { hub: toHubPath(path) };
  const bare = path.split("?")[0].split("#")[0];
  for (const [re, to] of LEGACY_TO_HUB) {
    const m = bare.match(re);
    if (m) return { hub: to(m) };
  }
  return { href: siteUrl(path) };
}

/**
 * Links from the public site into the Hub. Absolute once the Hub has its
 * own host, /hub/... until then.
 */
export const hubFromSite = {
  home: () => hubAbsoluteUrl("/"),
  signIn: (returnTo?: string) => hubAbsoluteUrl(`/sign-in${returnTo ? `?return=${encodeURIComponent(returnTo)}` : ""}`),
  signUp: () => hubAbsoluteUrl("/sign-up"),
  /** Sign up as a host, landing in the listing wizard - optionally pre-filled
   *  from the homepage house (an encoded ?prefill= value). */
  listProperty: (prefill?: string) =>
    hubAbsoluteUrl(`/sign-up?intent=list&next=${encodeURIComponent(prefill ? `/properties/new?prefill=${prefill}` : "/properties/new")}`),
  path: (hubPath: string) => hubAbsoluteUrl(hubPath),
};
