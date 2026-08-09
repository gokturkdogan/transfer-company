import { describe, expect, it } from "vitest";

import { formatInternationalPhone, sanitizeNationalPhoneNumber } from "@/lib/phone/format";

describe("formatInternationalPhone", () => {
  it("combines country dial code with national digits", () => {
    expect(formatInternationalPhone("TR", "555 111 22 33")).toBe(
      "+905551112233",
    );
  });

  it("returns empty string when national number is blank", () => {
    expect(formatInternationalPhone("DE", "")).toBe("");
  });
});

describe("sanitizeNationalPhoneNumber", () => {
  it("strips non-digit characters", () => {
    expect(sanitizeNationalPhoneNumber("+90 (555) 111-22-33")).toBe(
      "905551112233",
    );
  });
});
