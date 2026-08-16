import { describe, expect, it } from "vitest";

import {
  formatAuthorFullName,
  formatAuthorInitials,
} from "@/features/testimonials/domain/format-author-initials";

describe("formatAuthorInitials", () => {
  it("returns initials from first and last name", () => {
    expect(formatAuthorInitials("Sarah", "Miller")).toBe("SM");
  });

  it("returns first two letters when only first name is provided", () => {
    expect(formatAuthorInitials("Sarah", "")).toBe("SA");
  });

  it("returns first two letters when only last name is provided", () => {
    expect(formatAuthorInitials("", "Miller")).toBe("MI");
  });

  it("returns question mark when both names are empty", () => {
    expect(formatAuthorInitials("", "")).toBe("?");
    expect(formatAuthorInitials("  ", "  ")).toBe("?");
  });
});

describe("formatAuthorFullName", () => {
  it("joins trimmed first and last names", () => {
    expect(formatAuthorFullName("Sarah", "Miller")).toBe("Sarah Miller");
    expect(formatAuthorFullName("Sarah", "")).toBe("Sarah");
    expect(formatAuthorFullName("", "Miller")).toBe("Miller");
  });
});
