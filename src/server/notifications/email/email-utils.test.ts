import { describe, expect, it } from "vitest";

import {
  escapeHtml,
  formatMultilineHtml,
} from "@/server/notifications/email/email-utils";

describe("email-utils", () => {
  it("escapes html entities", () => {
    expect(escapeHtml(`<a href="x">A&B</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;A&amp;B&lt;/a&gt;",
    );
  });

  it("formats multiline text for email html", () => {
    expect(formatMultilineHtml("note\n--- Passengers ---\n1. Adult: Ada")).toBe(
      "note<br />--- Passengers ---<br />1. Adult: Ada",
    );
  });
});
