import { describe, expect, it } from "vitest";

import { buildReservationPdfFilename } from "@/features/admin/server/build-reservation-pdf";

describe("buildReservationPdfFilename", () => {
  it("uses customer name and outbound date in the filename", () => {
    expect(
      buildReservationPdfFilename(
        "Ahmet Yılmaz",
        new Date("2026-08-21T10:30:00.000Z"),
      ),
    ).toBe("Ahmet Yılmaz 21.08.2026.pdf");
  });

  it("sanitizes unsafe characters in customer name", () => {
    expect(
      buildReservationPdfFilename(
        "Test/User: Name",
        new Date("2026-01-05T08:00:00.000Z"),
      ),
    ).toBe("Test-User- Name 05.01.2026.pdf");
  });
});
