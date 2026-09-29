/**
 * The Admin panel's unlock, held in this browser tab.
 *
 * Admins use the Hub as a normal renter or owner account. The admin tools
 * sit behind a second password, checked by the server
 * (backend/admin_panel.py). A correct password returns a short-lived unlock
 * token; hubFetch sends it with every Hub request and the server refuses
 * admin endpoints (423) without it.
 *
 * It lives in this tab only (sessionStorage, so a reload inside the 30
 * seconds keeps it and closing the tab ends it). It is dropped:
 *   - after IDLE_LOCK_MS with no mouse, keyboard, touch or scroll activity,
 *     including across a reload,
 *   - when the server's unlock expires,
 *   - on sign-out, and whenever the server answers 423.
 *
 * Locking itself after 30 idle seconds also raises the alarm: red and blue
 * police lights over the whole screen and a siren (AdminIdleAlarm, which
 * reads useAdminIdleAlert below).
 */
import { useSyncExternalStore } from "react";
import { primeAlarm } from "./alarm";

export const UNLOCK_HEADER = "X-Migrent-Admin-Unlock";
export const IDLE_LOCK_MS = 30_000;

const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
const STORE_KEY = "migrent-admin-panel";

/** Why the panel locked. Only "idle" raises the alarm. */
export type LockReason = "idle" | "manual" | "expired" | "server" | "signout";

let token: string | null = null;
let expiresAt = 0;
let lastActivity = 0;
let lastSaved = 0;
let expiryTimer: number | undefined;
let idleTimer: number | undefined;
let idleAlert = false;
const listeners = new Set<() => void>();
const lockHandlers = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Called on every lock (the query cache uses it to forget admin data). */
export function onAdminPanelLock(fn: () => void) {
  lockHandlers.add(fn);
  return () => {
    lockHandlers.delete(fn);
  };
}

export function adminUnlockToken(): string | null {
  return token;
}

export function isAdminPanelUnlocked(): boolean {
  return token !== null;
}

/** Milliseconds until the idle lock, while unlocked. */
export function adminIdleRemainingMs(): number {
  return token ? Math.max(0, IDLE_LOCK_MS - (Date.now() - lastActivity)) : 0;
}

function save() {
  lastSaved = Date.now();
  try {
    if (token) window.sessionStorage.setItem(STORE_KEY, JSON.stringify({ token, expiresAt, lastActivity }));
    else window.sessionStorage.removeItem(STORE_KEY);
  } catch {
    /* storage blocked: the unlock just won't survive a reload */
  }
}

// Activity is checked before it counts: coming back to a tab after a minute
// away must lock the panel, not quietly restart the 30 seconds.
function onActivity(e: Event) {
  if (!token) return;
  if (Date.now() - lastActivity >= IDLE_LOCK_MS) {
    lockAdminPanel("idle");
    return;
  }
  // A click or key press lets the page make sound later (after a reload
  // the Unlock click that allowed it belongs to the previous page).
  if (e.type === "pointerdown" || e.type === "keydown") primeAlarm();
  lastActivity = Date.now();
  if (lastActivity - lastSaved > 1000) save();
}

function checkIdle() {
  if (token && Date.now() - lastActivity >= IDLE_LOCK_MS) lockAdminPanel("idle");
}

function watchActivity(on: boolean) {
  if (typeof window === "undefined") return;
  for (const name of ACTIVITY_EVENTS) {
    if (on) window.addEventListener(name, onActivity, { capture: true, passive: true });
    else window.removeEventListener(name, onActivity, { capture: true });
  }
  if (on) document.addEventListener("visibilitychange", checkIdle);
  else document.removeEventListener("visibilitychange", checkIdle);
  window.clearInterval(idleTimer);
  if (on) idleTimer = window.setInterval(checkIdle, 1000);
}

function open(value: string, until: number, active: number) {
  token = value;
  expiresAt = until;
  lastActivity = active;
  window.clearTimeout(expiryTimer);
  // A few seconds early, so a request never leaves with an unlock that
  // expires on its way to the server.
  expiryTimer = window.setTimeout(() => lockAdminPanel("expired"), Math.max(1000, until - Date.now() - 5000));
  watchActivity(true);
  save();
  emit();
}

export function unlockAdminPanel(value: string, expiresInSeconds: number) {
  idleAlert = false;
  open(value, Date.now() + expiresInSeconds * 1000, Date.now());
}

export function lockAdminPanel(reason: LockReason = "manual") {
  if (token === null) return;
  token = null;
  expiresAt = 0;
  idleAlert = reason === "idle";
  if (typeof window !== "undefined") {
    window.clearTimeout(expiryTimer);
    save();
  }
  watchActivity(false);
  lockHandlers.forEach((fn) => fn());
  emit();
}

/** After a reload: pick the unlock back up if it is still inside both limits. */
function restore() {
  try {
    const raw = window.sessionStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as { token?: string; expiresAt?: number; lastActivity?: number };
    const now = Date.now();
    if (saved.token && (saved.expiresAt ?? 0) - now > 5000 && now - (saved.lastActivity ?? 0) < IDLE_LOCK_MS) {
      open(saved.token, saved.expiresAt!, saved.lastActivity!);
    } else {
      window.sessionStorage.removeItem(STORE_KEY);
    }
  } catch {
    /* nothing to restore */
  }
}

if (typeof window !== "undefined") restore();

export function useAdminPanelUnlocked(): boolean {
  return useSyncExternalStore(subscribe, isAdminPanelUnlocked, () => false);
}

/** True from an idle lock until the admin dismisses the alarm (or unlocks again). */
export function adminIdleAlertRaised(): boolean {
  return idleAlert;
}

export function dismissAdminIdleAlert() {
  if (!idleAlert) return;
  idleAlert = false;
  emit();
}

export function useAdminIdleAlert(): boolean {
  return useSyncExternalStore(subscribe, adminIdleAlertRaised, () => false);
}
