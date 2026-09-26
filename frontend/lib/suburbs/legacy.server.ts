/**
 * The sixteen URLs that existed before this rebuild.
 *
 * /suburb/auburn was a real, indexed, linked page. It cannot 404, and it
 * cannot guess: there are two Auburns, in NSW and Queensland, and the one
 * that was published was the NSW one. The ETL resolves each old slug to the
 * SAL code its editorial was migrated onto and writes the answer here, so the
 * redirect is a fact rather than a lookup by name.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface LegacyTarget {
  salCode: string;
  state: string;
  slug: string;
}

let cache: Record<string, LegacyTarget> | null = null;

export function legacyRedirects(): Record<string, LegacyTarget> {
  if (!cache) {
    cache = JSON.parse(
      readFileSync(join(process.cwd(), "data", "suburbs", "legacy-redirects.json"), "utf8"),
    ) as Record<string, LegacyTarget>;
  }
  return cache;
}

export function legacyTarget(slug: string): LegacyTarget | null {
  return legacyRedirects()[slug.toLowerCase()] ?? null;
}

/** The SAL codes that have a written guide, used to choose what to pre-render. */
export function editorialSalCodes(): string[] {
  return Object.values(legacyRedirects()).map((t) => t.salCode);
}
