import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "../../lib/safeRedirect";

describe("safeRedirectPath", () => {
  it("accepts same-origin paths with query and hash", () => {
    expect(safeRedirectPath("/listing/abc?x=1#book")).toBe("/listing/abc?x=1#book");
    expect(safeRedirectPath("/dashboard/owner")).toBe("/dashboard/owner");
  });
  it("rejects open-redirect shapes", () => {
    for (const bad of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "/javascript:alert(1)",
      "\\\\evil",
      "/%0d%0aSet-Cookie:x",
      "/foo bar",
      "/foo\tbar",
      "/foo\u0000bar",
      "",
      undefined,
      42,
      ["/a", "/b"],
    ]) {
      expect(safeRedirectPath(bad)).toBe("/dashboard");
    }
  });
  it("never loops back into auth pages", () => {
    expect(safeRedirectPath("/signin?redirect=/x")).toBe("/dashboard");
    expect(safeRedirectPath("/auth/callback")).toBe("/dashboard");
  });
});
