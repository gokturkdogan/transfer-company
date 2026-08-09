import { describe, expect, it } from "vitest";

import {
  formatFullName,
  parseFullName,
} from "@/features/booking/lib/parse-full-name";

describe("parseFullName", () => {
  it("splits on the first space", () => {
    expect(parseFullName("Ayşe Yılmaz")).toEqual({
      firstName: "Ayşe",
      lastName: "Yılmaz",
    });
  });

  it("keeps remaining words in the last name", () => {
    expect(parseFullName("Mehmet Ali Demir")).toEqual({
      firstName: "Mehmet",
      lastName: "Ali Demir",
    });
  });

  it("returns empty values for blank input", () => {
    expect(parseFullName("   ")).toEqual({ firstName: "", lastName: "" });
  });
});

describe("formatFullName", () => {
  it("joins first and last name", () => {
    expect(formatFullName("Ayşe", "Yılmaz")).toBe("Ayşe Yılmaz");
  });
});
