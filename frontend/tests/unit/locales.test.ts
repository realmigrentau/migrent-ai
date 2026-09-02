import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Locale completeness.
 *
 * For every locale that is ENABLED in production (NEXT_PUBLIC_ENABLED_LOCALES,
 * default "en") this test fails if any key from en/common.json is missing
 * or if a critical-UI key is still identical to the English string. For
 * locales that exist but are not enabled it prints a report so the gap is
 * visible without blocking the build.
 */

const LOCALES_DIR = path.resolve(__dirname, "../../public/locales");
const ENABLED = (process.env.NEXT_PUBLIC_ENABLED_LOCALES || "en").split(",").map((s) => s.trim()).filter(Boolean);

// Keys a visitor cannot use the site without. Mixed languages here are a
// release blocker; elsewhere they are a defect.
const CRITICAL_PREFIXES = ["nav.", "auth.", "footer.", "home.hero", "contact.form", "pricing."];

type Flat = Record<string, string>;
function flatten(obj: unknown, prefix = "", out: Flat = {}): Flat {
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else if (typeof obj === "string") {
    out[prefix] = obj;
  }
  return out;
}

function load(locale: string): Flat {
  return flatten(JSON.parse(readFileSync(path.join(LOCALES_DIR, locale, "common.json"), "utf8")));
}

const en = load("en");
const available = readdirSync(LOCALES_DIR).filter((d) => d !== "en");

describe("locale files", () => {
  it("every enabled locale has a translation file", () => {
    for (const code of ENABLED) {
      if (code === "en") continue;
      expect(available, `${code} is enabled but has no public/locales/${code}/common.json`).toContain(code);
    }
  });

  for (const code of available) {
    const enabled = ENABLED.includes(code);
    const target = load(code);
    const missing = Object.keys(en).filter((k) => !(k in target));
    const identical = Object.keys(en).filter((k) => k in target && target[k] === en[k] && en[k].length > 3 && /[a-z]{4,}/i.test(en[k]));
    const criticalIdentical = identical.filter((k) => CRITICAL_PREFIXES.some((p) => k.startsWith(p)));

    it(`${code}: ${enabled ? "MUST be complete" : "report only"} (${missing.length} missing, ${identical.length} untranslated, ${criticalIdentical.length} critical)`, () => {
      if (!enabled) return; // report in the test name only
      expect(missing, `missing keys in ${code}: ${missing.slice(0, 10).join(", ")}`).toEqual([]);
      expect(criticalIdentical, `critical UI still English in ${code}: ${criticalIdentical.slice(0, 10).join(", ")}`).toEqual([]);
    });
  }

  it("english has no empty strings", () => {
    const empty = Object.entries(en).filter(([, v]) => !v.trim()).map(([k]) => k);
    expect(empty).toEqual([]);
  });
});
