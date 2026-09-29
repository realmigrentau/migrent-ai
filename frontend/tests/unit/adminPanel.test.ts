import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  IDLE_LOCK_MS,
  adminIdleAlertRaised,
  adminUnlockToken,
  dismissAdminIdleAlert,
  isAdminPanelUnlocked,
  lockAdminPanel,
  onAdminPanelLock,
  unlockAdminPanel,
} from "../../lib/hub/adminPanel";

/**
 * The Admin panel locks itself: after 30 seconds without activity, when the
 * server's unlock runs out, and when someone comes back to the tab after
 * being away (their first mouse movement must lock it, not restart the
 * clock).
 */
let win: EventTarget;

beforeEach(() => {
  vi.useFakeTimers();
  win = new EventTarget();
  Object.assign(win, { setTimeout, clearTimeout, setInterval, clearInterval });
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", new EventTarget());
});

afterEach(() => {
  lockAdminPanel();
  dismissAdminIdleAlert();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const move = () => win.dispatchEvent(new Event("pointermove"));

describe("admin panel lock", () => {
  it("locks after 30 seconds without activity", () => {
    unlockAdminPanel("token-1", 1200);
    expect(adminUnlockToken()).toBe("token-1");
    vi.advanceTimersByTime(IDLE_LOCK_MS - 2000);
    expect(isAdminPanelUnlocked()).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(isAdminPanelUnlocked()).toBe(false);
    expect(adminUnlockToken()).toBeNull();
  });

  it("stays open while the admin is active", () => {
    unlockAdminPanel("token-1", 1200);
    for (let i = 0; i < 6; i++) {
      vi.advanceTimersByTime(20_000);
      move();
    }
    expect(isAdminPanelUnlocked()).toBe(true);
    vi.advanceTimersByTime(IDLE_LOCK_MS + 1000);
    expect(isAdminPanelUnlocked()).toBe(false);
  });

  it("locks on the first movement after being away, even if no timer ran", () => {
    unlockAdminPanel("token-1", 1200);
    vi.setSystemTime(Date.now() + IDLE_LOCK_MS + 5000); // a throttled background tab
    move();
    expect(isAdminPanelUnlocked()).toBe(false);
  });

  it("locks when the server's unlock runs out", () => {
    unlockAdminPanel("token-1", 60);
    for (let i = 0; i < 6; i++) {
      vi.advanceTimersByTime(10_000);
      move();
    }
    expect(isAdminPanelUnlocked()).toBe(false);
  });

  it("raises the alarm only when it locks itself for inactivity", () => {
    unlockAdminPanel("token-1", 1200);
    lockAdminPanel("manual");
    expect(adminIdleAlertRaised()).toBe(false);

    unlockAdminPanel("token-2", 1200);
    vi.advanceTimersByTime(IDLE_LOCK_MS + 1000);
    expect(adminIdleAlertRaised()).toBe(true);
    dismissAdminIdleAlert();
    expect(adminIdleAlertRaised()).toBe(false);

    // Coming back after being away counts as inactivity too.
    unlockAdminPanel("token-3", 1200);
    vi.setSystemTime(Date.now() + IDLE_LOCK_MS + 5000);
    move();
    expect(adminIdleAlertRaised()).toBe(true);

    // Unlocking again clears it.
    unlockAdminPanel("token-4", 1200);
    expect(adminIdleAlertRaised()).toBe(false);
  });

  it("does not raise the alarm when the unlock simply expires", () => {
    unlockAdminPanel("token-1", 60);
    for (let i = 0; i < 6; i++) {
      vi.advanceTimersByTime(10_000);
      move();
    }
    expect(isAdminPanelUnlocked()).toBe(false);
    expect(adminIdleAlertRaised()).toBe(false);
  });

  it("tells listeners, once, and ignores activity after locking", () => {
    const locked = vi.fn();
    const off = onAdminPanelLock(locked);
    unlockAdminPanel("token-1", 1200);
    lockAdminPanel();
    lockAdminPanel();
    move();
    expect(locked).toHaveBeenCalledTimes(1);
    expect(isAdminPanelUnlocked()).toBe(false);
    off();
  });
});
