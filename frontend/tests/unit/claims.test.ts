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

const FORBIDDEN: { pattern: RegExp; why: string }[] = [
  { pattern: /MigRent AI/, why: "brand is MigRent" },
  { pattern: /Pty Ltd/, why: "entity type unconfirmed" },
  { pattern: /Sole Trader/, why: "entity type unconfirmed" },
  { pattern: /Naarm/, why: "location unconfirmed" },
  { pattern: /All systems operational/, why: "no status monitoring exists" },
  { pattern: /24\/7/, why: "support is weekdays by email" },
  { pattern: /MigRent Guarantee/, why: "no guarantee product exists" },
  { pattern: /thousands of (listings|migrants|verified)/i, why: "invented scale" },
  { pattern: /escrow/i, why: "MigRent holds no bond" },
  { pattern: /migrent-ai\.vercel\.app/, why: "old domain" },
  { pattern: /support@migrent\.com\.au|legal@migrent\.com\.au|privacy@migrent\.com\.au/, why: "mailbox does not exist" },
];

describe("public copy carries no unsupported claims", () => {
  const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
  for (const { pattern, why } of FORBIDDEN) {
    it(`${pattern} (${why})`, () => {
      const hits = files.filter((f) => {
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
    expect(line).toContain("MigRent");
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
