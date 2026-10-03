import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { siteIdentity, copyrightLine, businessDetails } from "../../lib/siteIdentity";

/**
 * Claims hygiene. Fails the build if an unsupported claim or a conflicting
 * identity string creeps back into public copy.
 */

const ROOT = path.resolve(__dirname, "../..");
const SCAN_DIRS = ["pages", "components", "lib", "public/locales/en"];
const SKIP = new Set(["lib/siteIdentity.ts", "pages/admin"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(ROOT, full);
    if ([...SKIP].some((s) => rel.startsWith(s))) continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|json)$/.test(entry)) out.push(full);
  }
  return out;
}

// Legal text is published word for word until a lawyer reviews it (the
// 2026-09-29 redesign moved it without editing it). These files may still
// carry the old product wording for patterns marked `legal: true`; every
// other file may not.
const LEGAL_VERBATIM = ["pages/abn-terms.tsx", "pages/privacy-policy.tsx", "pages/how-renting-works.tsx"];

const FORBIDDEN: { pattern: RegExp; why: string; legal?: boolean }[] = [
  { pattern: /Migrent AI/, why: "brand is Migrent" },
  { pattern: /Pty Ltd/, why: "entity type unconfirmed" },
  { pattern: /Sole Trader/, why: "entity type unconfirmed" },
  { pattern: /Naarm/, why: "location unconfirmed" },
  { pattern: /All systems operational/, why: "no status monitoring exists" },
  { pattern: /24\/7/, why: "support is weekdays by email" },
  { pattern: /Migrent Guarantee/, why: "no guarantee product exists" },
  { pattern: /thousands of (listings|migrants|verified)/i, why: "invented scale" },
  { pattern: /escrow/i, why: "Migrent holds no bond" },
  { pattern: /migrent-ai\.vercel\.app/, why: "old domain" },
  { pattern: /support@migrent\.com\.au|legal@migrent\.com\.au|privacy@migrent\.com\.au/, why: "mailbox does not exist" },
  { pattern: /Superhost/, why: "no such programme; count badges read 'Hosts 3+ homes'" },
  { pattern: /proof of property/i, why: "hosts show government ID only" },
  { pattern: /\bVEVO\b/, why: "Migrent does not check visas" },
  // Only renters who passed the paid ID check (backend renter_id.py) are
  // verified, so the copy must say "ID-verified", never all renters.
  { pattern: /(?<!ID-)verified (seekers?|renters?|tenants?)/i, why: "only renters who passed the ID check are verified: say 'ID-verified renters'" },
  { pattern: /\bAI[- ](powered|matching|match)/i, why: "matching is rules-based", legal: true },
];

describe("public copy carries no unsupported claims", () => {
  const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
  for (const { pattern, why, legal } of FORBIDDEN) {
    it(`${pattern} (${why})`, () => {
      const hits = files.filter((f) => {
        if (legal && LEGAL_VERBATIM.includes(path.relative(ROOT, f))) return false;
        const text = readFileSync(f, "utf8");
        // Comments explaining a removed claim are fine; rendered text is not.
        return text.split("\n").some((line) => pattern.test(line) && !/^\s*(\/\/|\*|\/\*)/.test(line) && !/removedClaims/.test(line));
      });
      expect(hits.map((f) => path.relative(ROOT, f))).toEqual([]);
    });
  }
});

describe("site identity", () => {
  it("copyright line asserts only confirmed facts", () => {
    const line = copyrightLine(2026);
    expect(line).toContain("Migrent");
    expect(line).toContain(siteIdentity.abn);
    expect(line).not.toMatch(/Pty|Trader|Sydney|Melbourne|Naarm/);
  });
  it("business details omit the structure until confirmed", () => {
    const labels = businessDetails().map((r) => r.label);
    expect(labels).toContain("ABN");
    expect(labels.includes("Structure")).toBe(siteIdentity.legalEntity.confirmed);
  });
  it("fees are internally consistent", () => {
    expect(siteIdentity.fees.seeker.platformFee).toBe(0);
    expect(siteIdentity.fees.holdsRentOrBond).toBe(false);
    expect(siteIdentity.fees.seeker.verification.enabled).toBe(false);
  });
});
