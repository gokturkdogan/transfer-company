import { describe, expect, it, vi, afterEach } from "vitest";

import {
  buildTimeSlots,
  getEffectiveMinDateIso,
  sanitizeTimeForDate,
  toIsoDate,
} from "@/features/booking/lib/search-datetime";

describe("search-datetime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds 15-minute slots for a future date", () => {
    const slots = buildTimeSlots("2026-12-01", "2026-08-08");

    expect(slots[0]).toBe("00:00");
    expect(slots.at(-1)).toBe("23:45");
    expect(slots).toHaveLength(96);
  });

  it("filters past times on the minimum date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-08T12:10:00+03:00"));

    const slots = buildTimeSlots("2026-08-08", "2026-08-08");

    expect(slots[0]).toBe("13:15");
    expect(slots.includes("12:00")).toBe(false);
  });

  it("sanitizes invalid times to the first available slot", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-08T12:10:00+03:00"));

    expect(sanitizeTimeForDate("2026-08-08", "08:00", "2026-08-08")).toBe(
      "13:15",
    );
  });

  it("rolls the minimum date forward when today has no remaining slots", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-08T23:50:00+03:00"));

    const minDate = toIsoDate(new Date("2026-08-08T23:50:00+03:00"));

    expect(getEffectiveMinDateIso(minDate)).toBe("2026-08-09");
  });
});
