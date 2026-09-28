import { describe, expect, it } from "vitest";
import { aud, day, isoToZoned, weekly, zonedToIso } from "../../lib/hub/format";

describe("hub format", () => {
  it("formats AUD without cents by default", () => {
    expect(aud(650)).toBe("$650");
    expect(weekly(650)).toBe("$650 / week");
    expect(aud(1234.5, { cents: true })).toBe("$1,234.50");
    expect(weekly(null)).toBe("Price on request");
  });

  it("never shifts a calendar date by time zone", () => {
    expect(day("2026-10-01")).toBe("1 Oct 2026");
  });

  it("converts a property-local time to UTC, both sides of daylight saving", () => {
    // Sydney is UTC+10 in winter and UTC+11 in summer (DST from 4 Oct 2026).
    expect(zonedToIso("2026-09-30", "10:30", "Australia/Sydney")).toBe("2026-09-30T00:30:00.000Z");
    expect(zonedToIso("2026-10-10", "10:30", "Australia/Sydney")).toBe("2026-10-09T23:30:00.000Z");
    // Brisbane has no daylight saving; Perth is UTC+8.
    expect(zonedToIso("2026-10-10", "10:30", "Australia/Brisbane")).toBe("2026-10-10T00:30:00.000Z");
    expect(zonedToIso("2026-10-10", "10:30", "Australia/Perth")).toBe("2026-10-10T02:30:00.000Z");
  });

  it("round-trips a UTC instant back to the local date and time", () => {
    expect(isoToZoned("2026-10-09T23:30:00.000Z", "Australia/Sydney")).toEqual({ date: "2026-10-10", time: "10:30" });
  });
});
