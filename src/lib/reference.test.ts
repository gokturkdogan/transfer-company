import { describe, expect, it } from "vitest";

import {
  generateReservationReference,
  isValidReservationReference,
} from "@/lib/reference";

describe("reservation reference", () => {
  it("generates a prefixed reference with fixed length", () => {
    const reference = generateReservationReference();

    expect(reference.startsWith("TR-")).toBe(true);
    expect(reference.length).toBe("TR-".length + 6);
    expect(isValidReservationReference(reference)).toBe(true);
  });

  it("rejects invalid references", () => {
    expect(isValidReservationReference("TR-ABC")).toBe(false);
    expect(isValidReservationReference("XX-ABCDEF")).toBe(false);
  });
});
