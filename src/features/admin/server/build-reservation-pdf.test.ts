import { describe, expect, it } from "vitest";

import { buildReservationPdfFilename } from "@/features/admin/server/build-reservation-pdf";

describe("buildReservationPdfFilename", () => {
  it("sanitizes reference for filesystem-safe filename", () => {
    expect(buildReservationPdfFilename("RR-2026/001")).toBe(
      "rezervasyon-RR-2026-001.pdf",
    );
  });
});
