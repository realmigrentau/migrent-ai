/**
 * The Migrent Hub API client.
 *
 * Every call carries the signed-in person's access token. Errors come back
 * as HubError with a message written for people (the API's own `detail`),
 * the HTTP status, and - for 422s - the list of things to fix. Nothing here
 * swallows a failure: callers decide between an inline error, a retry and a
 * toast.
 */
import { API_BASE_URL } from "../apiBase";
import { supabase } from "../supabase";
import { UNLOCK_HEADER, adminUnlockToken, lockAdminPanel } from "./adminPanel";

const VIEW_AS_KEY = "migrent-view-as";

export interface Problem {
  step?: string;
  field?: string;
  message: string;
}

export class HubError extends Error {
  status: number;
  problems: Problem[];
  offline: boolean;

  constructor(message: string, status: number, problems: Problem[] = [], offline = false) {
    super(message);
    this.name = "HubError";
    this.status = status;
    this.problems = problems;
    this.offline = offline;
  }
}

/** The customer an admin is viewing as, if any (session-scoped). */
export function getViewAs(): { id: string; name: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(VIEW_AS_KEY);
    return raw ? (JSON.parse(raw) as { id: string; name: string }) : null;
  } catch {
    return null;
  }
}

export function setViewAs(value: { id: string; name: string } | null) {
  try {
    if (value) window.sessionStorage.setItem(VIEW_AS_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(VIEW_AS_KEY);
  } catch {
    /* ignore */
  }
}

export async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

type Body = Record<string, unknown> | unknown[] | FormData | undefined;

export async function hubFetch<T>(path: string, init: { method?: string; body?: Body; signal?: AbortSignal; auth?: boolean } = {}): Promise<T> {
  const method = init.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.auth !== false) {
    const token = await accessToken();
    if (!token) throw new HubError("Your session has ended. Sign in again to continue.", 401);
    headers.Authorization = `Bearer ${token}`;
  }
  // Viewing as a customer is read-only and only ever shows their data.
  // Admin endpoints stay the admin's own. Anything else is refused here
  // rather than sent: a write would land on the admin's account, and
  // endpoints outside /hub do not understand view-as and would show the
  // admin's own data under the customer's name.
  const viewAs = getViewAs();
  if (viewAs && !path.startsWith("/hub/admin")) {
    if (method !== "GET") throw new HubError("Viewing as a customer is read-only. Nothing can be changed.", 403);
    if (!path.startsWith("/hub/")) throw new HubError("This isn't shown while viewing as a customer.", 403);
    headers["X-Migrent-View-As"] = viewAs.id;
  }
  // The Admin panel's unlock (lib/hub/adminPanel.ts), while it is open.
  const unlock = adminUnlockToken();
  if (unlock && path.startsWith("/hub/")) headers[UNLOCK_HEADER] = unlock;

  let body: BodyInit | undefined;
  if (init.body instanceof FormData) body = init.body;
  else if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body, signal: init.signal });
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") throw err;
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    throw new HubError(
      offline ? "You appear to be offline. Reconnect and try again." : "We could not reach Migrent just now. Check your connection and try again.",
      0,
      [],
      true,
    );
  }

  if (res.status === 204) return undefined as T;
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const detail = (data as { detail?: unknown })?.detail;
    let message = "Something went wrong. Please try again.";
    let problems: Problem[] = [];
    if (typeof detail === "string") message = detail;
    else if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      const d = detail as { message?: string; problems?: (string | Problem)[] };
      if (d.message) message = d.message;
      problems = (d.problems ?? []).map((p) => (typeof p === "string" ? { message: p } : p));
    } else if (Array.isArray(detail)) {
      // FastAPI validation errors: take the first one, in plain words.
      const first = detail[0] as { msg?: string; loc?: (string | number)[] } | undefined;
      const field = first?.loc?.slice(-1)[0];
      message = first?.msg ? `${first.msg.replace(/^Value error, /, "")}${field ? ` (${String(field).replace(/_/g, " ")})` : ""}` : message;
    }
    if (res.status === 401) message = "Your session has ended. Sign in again to continue.";
    if (res.status === 423) lockAdminPanel("server");
    if (res.status === 429) message = "That was a lot of requests in a short time. Wait a moment and try again.";
    if (res.status >= 500 && res.status !== 503) message = "Something went wrong on our side. Please try again.";
    throw new HubError(message, res.status, problems);
  }
  return data as T;
}

export const hubApi = {
  get: <T>(path: string, signal?: AbortSignal) => hubFetch<T>(path, { signal }),
  post: <T>(path: string, body?: Body) => hubFetch<T>(path, { method: "POST", body: body ?? {} }),
  put: <T>(path: string, body?: Body) => hubFetch<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: Body) => hubFetch<T>(path, { method: "PATCH", body }),
  del: <T>(path: string, body?: Body) => hubFetch<T>(path, { method: "DELETE", body }),
  upload: <T>(path: string, form: FormData) => hubFetch<T>(path, { method: "POST", body: form }),
};

/** Upload with progress (fetch cannot report upload progress). */
export function hubUploadWithProgress<T>(path: string, form: FormData, onProgress: (fraction: number) => void): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const token = await accessToken();
    if (!token) {
      reject(new HubError("Your session has ended. Sign in again to continue.", 401));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      let data: { detail?: unknown } | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data as T);
      else reject(new HubError(typeof data?.detail === "string" ? data.detail : "The upload did not finish. Please try again.", xhr.status));
    };
    xhr.onerror = () => reject(new HubError("The upload was interrupted. Check your connection and try again.", 0, [], true));
    xhr.send(form);
  });
}

/** Public, unauthenticated view tracking for listing pages. */
export function trackListingView(listingId: string, source: "public" | "hub") {
  if (typeof window === "undefined") return;
  let visitor = "";
  try {
    visitor = window.localStorage.getItem("migrent-visitor") || "";
    if (!visitor) {
      visitor = crypto.randomUUID();
      window.localStorage.setItem("migrent-visitor", visitor);
    }
  } catch {
    visitor = "";
  }
  void (async () => {
    const token = await accessToken().catch(() => null);
    fetch(`${API_BASE_URL}/hub/listing-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ listing_id: listingId, event: "view", visitor: visitor || undefined, source }),
      keepalive: true,
    }).catch(() => {});
  })();
}
