import { describe, expect, it } from "vitest";
import { searchHelp } from "../../lib/helpSearch";

describe("support widget quick answers", () => {
  it("answers common questions from the Help centre", () => {
    expect(searchHelp("who holds my bond?")?.text).toMatch(/bond authority/i);
    expect(searchHelp("Do I need an Australian rental history")?.text).toMatch(/Rental Profile/);
    expect(searchHelp("how much does it cost to rent")?.text).toMatch(/Nothing to search/);
  });

  it("links every answer to the Help centre", () => {
    const answer = searchHelp("how do I delete my account");
    expect(answer?.link?.href).toMatch(/^\/help/);
  });

  it("understands everyday words for the same thing", () => {
    expect(searchHelp("deposit")?.text).toMatch(/bond/i);
  });

  it("never describes features Migrent does not have", () => {
    for (const q of ["superhost", "AI matching", "promotional pricing", "dashboard"]) {
      const text = searchHelp(q)?.text ?? "";
      expect(text).not.toMatch(/superhost|learns your preferences|promotional|dashboard/i);
    }
  });

  it("says nothing rather than guessing", () => {
    expect(searchHelp("")).toBeNull();
    expect(searchHelp("purple elephants")).toBeNull();
  });
});
