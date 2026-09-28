/**
 * Formatting for Migrent Hub: Australian dollars, and dates and times in
 * the property's own time zone.
 *
 * An inspection at a Perth listing is at 10:30 in Perth, whoever is
 * looking. Every API timestamp is UTC; nothing is shown raw.
 */

const LOCALE = "en-AU";

export function aud(value: number | null | undefined, opts: { cents?: boolean } = {}): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  }).format(Number(value));
}

/** "$650 / week" */
export function weekly(value: number | null | undefined): string {
  return value === null || value === undefined ? "Price on request" : `${aud(value)} / week`;
}

export function perFrequency(amount: number, frequency: "weekly" | "fortnightly" | "monthly"): string {
  return `${aud(amount)} / ${frequency === "weekly" ? "week" : frequency === "fortnightly" ? "fortnight" : "month"}`;
}

const DEFAULT_TZ = "Australia/Sydney";

function tzOk(tz?: string | null): string {
  if (!tz) return DEFAULT_TZ;
  try {
    new Intl.DateTimeFormat(LOCALE, { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TZ;
  }
}

function asDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/** A calendar date (YYYY-MM-DD) with no time: never shifted by time zone. */
export function day(value: string | null | undefined, opts: { weekday?: boolean; year?: boolean } = {}): string {
  if (!value) return "-";
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "-";
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: opts.weekday ? "short" : undefined,
    day: "numeric",
    month: "short",
    year: opts.year === false ? undefined : "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function time(value: string, tz?: string | null): string {
  return new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit", timeZone: tzOk(tz) }).format(asDate(value)).replace(" ", "\u00a0");
}

export function dateTime(value: string, tz?: string | null, opts: { weekday?: boolean } = { weekday: true }): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: opts.weekday ? "short" : undefined,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: tzOk(tz),
  }).format(asDate(value));
}

/** Short zone label, e.g. "AEST", for when it differs from the viewer's. */
export function zoneLabel(value: string, tz?: string | null): string {
  const parts = new Intl.DateTimeFormat(LOCALE, { timeZone: tzOk(tz), timeZoneName: "short" }).formatToParts(asDate(value));
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

export function viewerZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return DEFAULT_TZ;
  }
}

/** "Tomorrow, 10:30 am" / "Sat 12 Oct, 10:30 am" in the property's zone. */
export function whenLabel(value: string, tz?: string | null): string {
  const zone = tzOk(tz);
  const target = asDate(value);
  const key = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const today = key(new Date());
  const tomorrow = key(new Date(Date.now() + 86_400_000));
  const k = key(target);
  const t = time(value, zone);
  const suffix = zone !== viewerZone() ? ` ${zoneLabel(value, zone)}` : "";
  if (k === today) return `Today, ${t}${suffix}`;
  if (k === tomorrow) return `Tomorrow, ${t}${suffix}`;
  return `${dateTime(value, zone)}${suffix}`;
}

export function relative(value: string | null | undefined): string {
  if (!value) return "";
  const diff = Date.now() - asDate(value).getTime();
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return diff >= 0 ? `${m} min ago` : `in ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return diff >= 0 ? `${h} h ago` : `in ${h} h`;
  const d = Math.round(h / 24);
  if (d < 7) return diff >= 0 ? `${d} day${d === 1 ? "" : "s"} ago` : `in ${d} day${d === 1 ? "" : "s"}`;
  return day(asDate(value).toISOString(), { year: d > 300 });
}

/** Message-list timestamp: time today, weekday this week, date otherwise. */
export function inboxStamp(value: string): string {
  const d = asDate(value);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit" }).format(d);
  if (now.getTime() - d.getTime() < 6 * 86_400_000) return new Intl.DateTimeFormat(LOCALE, { weekday: "short" }).format(d);
  return new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short" }).format(d);
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function firstName(name: string | null | undefined): string {
  return (name || "").trim().split(/\s+/)[0] || "";
}

export function plural(n: number, one: string, many?: string): string {
  return `${n} ${n === 1 ? one : many ?? `${one}s`}`;
}

export function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function placeTypeLabel(v: string | null | undefined): string {
  return (
    {
      entire_place: "Entire place",
      entire_home: "Entire place",
      private_room: "Private room",
      shared_room: "Shared room",
    } as Record<string, string>
  )[v || ""] || "";
}

export function propertyTypeLabel(v: string | null | undefined): string {
  if (!v) return "";
  const map: Record<string, string> = {
    house: "House",
    apartment: "Apartment",
    townhouse: "Townhouse",
    unit: "Unit",
    granny_flat: "Granny flat",
    studio: "Studio",
    student: "Student accommodation",
    student_accommodation: "Student accommodation",
    villa: "Villa",
  };
  return map[v] || v.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

/** ICS calendar file for an inspection, built in the browser. */
export function inspectionIcs(opts: { id: string; title: string; start: string; end: string; location?: string | null; description?: string | null }): string {
  const stamp = (v: string) => asDate(v).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Migrent//Hub//EN",
    "BEGIN:VEVENT",
    `UID:${opts.id}@migrent`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(opts.start)}`,
    `DTEND:${stamp(opts.end)}`,
    `SUMMARY:${esc(opts.title)}`,
    opts.location ? `LOCATION:${esc(opts.location)}` : "",
    opts.description ? `DESCRIPTION:${esc(opts.description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/** Minutes the zone is ahead of UTC at a given instant (DST-aware). */
function zoneOffsetMinutes(instant: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tzOk(tz), hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/**
 * "2026-10-03" + "10:30" in Australia/Perth -> the UTC ISO instant. Owners
 * type times in the property's own zone; the API stores UTC.
 */
export function zonedToIso(date: string, hhmm: string, tz: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, h, mi));
  let offset = zoneOffsetMinutes(guess, tz);
  let utc = new Date(guess.getTime() - offset * 60000);
  // Re-check across a daylight-saving boundary.
  const second = zoneOffsetMinutes(utc, tz);
  if (second !== offset) {
    offset = second;
    utc = new Date(guess.getTime() - offset * 60000);
  }
  return utc.toISOString();
}

/** The YYYY-MM-DD and HH:MM an instant falls on in a zone (for editing). */
export function isoToZoned(iso: string, tz: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tzOk(tz), hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}
