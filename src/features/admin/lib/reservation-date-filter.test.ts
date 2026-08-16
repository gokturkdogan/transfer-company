import { describe, expect, it } from "vitest";

import {
  addDaysToIsoDate,
  buildAdminReservationsHref,
  isValidIsoDate,
  parseReservationDateRangeFilter,
} from "./reservation-date-filter";

describe("reservation-date-filter", () => {
  it("validates ISO dates", () => {
    expect(isValidIsoDate("2026-08-16")).toBe(true);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
    expect(isValidIsoDate("invalid")).toBe(false);
  });

  it("parses single-day filter when to is missing", () => {
    const range = parseReservationDateRangeFilter("2026-08-16");

    expect(range).not.toBeNull();
    expect(range?.fromIso).toBe("2026-08-16");
    expect(range?.toIso).toBe("2026-08-16");
    expect(range?.outboundToExclusive.getTime()).toBeGreaterThan(
      range!.outboundFrom.getTime(),
    );
  });

  it("parses inclusive date range", () => {
    const range = parseReservationDateRangeFilter("2026-08-10", "2026-08-16");

    expect(range?.fromIso).toBe("2026-08-10");
    expect(range?.toIso).toBe("2026-08-16");
  });

  it("ignores invalid to date before from", () => {
    const range = parseReservationDateRangeFilter("2026-08-16", "2026-08-10");

    expect(range?.fromIso).toBe("2026-08-16");
    expect(range?.toIso).toBe("2026-08-16");
  });

  it("builds reservation list href with filters", () => {
    expect(buildAdminReservationsHref({})).toBe("/admin/reservations");
    expect(
      buildAdminReservationsHref({
        status: "PENDING",
        from: "2026-08-10",
        to: "2026-08-16",
      }),
    ).toBe("/admin/reservations?status=PENDING&from=2026-08-10&to=2026-08-16");
    expect(
      buildAdminReservationsHref({ from: "2026-08-16" }),
    ).toBe("/admin/reservations?from=2026-08-16");
  });

  it("adds calendar days to ISO date", () => {
    expect(addDaysToIsoDate("2026-08-16", 1)).toBe("2026-08-17");
  });
});
