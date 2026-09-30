import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { AUDIT_ACTIONS, AUDIT_TARGETS, LISTING_ACTIONS, LISTING_STATE } from "../../lib/hub/admin";

/**
 * The admin screens must have words for everything the database can hold.
 * The allowed values come from the newest migration that sets each
 * admin_audit_log CHECK constraint, so a new action added there without a
 * label here fails this test instead of showing up raw in the audit log.
 */
const MIGRATIONS = path.resolve(__dirname, "../../../backend/migrations");

function checkValues(constraint: string): string[] {
  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
  let sql = "";
  for (const f of files) {
    const text = readFileSync(path.join(MIGRATIONS, f), "utf8");
    if (text.includes(`ADD CONSTRAINT ${constraint}`)) sql = text;
  }
  const from = sql.lastIndexOf(`ADD CONSTRAINT ${constraint}`);
  const block = sql.slice(from, sql.indexOf(");", from));
  return [...block.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
}

describe("admin labels cover the database", () => {
  it("has a sentence for every audit action", () => {
    const actions = checkValues("admin_audit_log_action_check");
    expect(actions.length).toBeGreaterThan(10);
    expect(actions.filter((a) => !AUDIT_ACTIONS[a])).toEqual([]);
  });

  it("has a noun for every audit target", () => {
    const targets = checkValues("admin_audit_log_target_type_check");
    expect(targets.filter((t) => !AUDIT_TARGETS[t])).toEqual([]);
  });

  it("names every listing state the moderation endpoints use", () => {
    for (const s of ["pending_approval", "changes_requested", "approved", "flagged", "hidden", "delete_requested", "paused", "deleted", "draft", "rejected", "expired"]) {
      expect(LISTING_STATE[s], s).toBeDefined();
    }
  });

  it("asks for a reason on every action that changes what the owner sees", () => {
    // Mirrors LISTING_ACTIONS_NEEDING_REASON in backend/routes_hub_admin.py.
    const needReason = Object.entries(LISTING_ACTIONS)
      .filter(([, c]) => c.reason)
      .map(([k]) => k)
      .sort();
    expect(needReason).toEqual(["hide", "pause", "reject", "request_changes", "request_removal"]);
  });

  it("never uses an em dash in admin copy", () => {
    const text = JSON.stringify({ AUDIT_ACTIONS, AUDIT_TARGETS, LISTING_ACTIONS, LISTING_STATE });
    expect(text).not.toMatch(/\u2014/);
  });
});
