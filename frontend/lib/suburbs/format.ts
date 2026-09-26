/**
 * Formatting for the suburb pages.
 *
 * One place for it so a population reads the same on a card, in a heading and
 * inside a generated sentence, and so "no data" is never rendered as a zero.
 */

export const nf = new Intl.NumberFormat("en-AU");

export function formatNumber(value: number | null | undefined): string | null {
  return value == null ? null : nf.format(value);
}

/** "$630" - weekly amounts are always whole dollars in the Census. */
export function formatAud(value: number | null | undefined): string | null {
  return value == null ? null : `$${nf.format(Math.round(value))}`;
}

/** "42.5%" with the trailing ".0" dropped. */
export function formatPercent(value: number | null | undefined): string | null {
  if (value == null) return null;
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

/**
 * "450 m" under a kilometre, "2.4 km" above.
 * Always straight-line, so callers pair it with the word "straight-line".
 */
export function formatDistance(metres: number | null | undefined): string | null {
  if (metres == null) return null;
  if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(metres < 10000 ? 1 : 0)} km`;
}

export function formatArea(sqKm: number | null | undefined): string | null {
  if (sqKm == null) return null;
  if (sqKm < 10) return `${sqKm.toFixed(1)} km²`;
  return `${nf.format(Math.round(sqKm))} km²`;
}

/** "26 September 2026" - the form the sources panel and hero use. */
export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

/** "September 2026" - for "last updated" chips, where the day is noise. */
export function formatMonthYear(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
}

/** "Sydney, NSW" / "Regional and remote Victoria". */
export function regionLabel(regionName: string, state: string, kind: string): string {
  return kind === "rest" ? regionName : `${regionName}, ${state}`;
}

/**
 * Whether the ABS classifies this place as urban enough to call a suburb.
 * Everything else is a locality, which is what the ABS calls it too.
 */
export function placeNoun(sectionOfState: string | null): "suburb" | "locality" {
  return sectionOfState === "Major Urban" || sectionOfState === "Other Urban" ? "suburb" : "locality";
}
