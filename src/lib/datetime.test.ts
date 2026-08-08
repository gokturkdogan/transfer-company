import { describe, expect, it } from "vitest";

import { PROJECT_TIME_ZONE } from "@/config/constants";
import {
  utcToZonedWallClock,
  zonedWallClockToUtc,
} from "@/lib/datetime";

describe("datetime", () => {
  it("converts Istanbul wall-clock to UTC and back", () => {
    const wallClock = "2026-08-08T15:30";
    const utc = zonedWallClockToUtc(wallClock, PROJECT_TIME_ZONE);
    const roundTrip = utcToZonedWallClock(utc, PROJECT_TIME_ZONE);

    expect(roundTrip).toBe(wallClock);
  });

  it("rejects invalid wall-clock format", () => {
    expect(() => zonedWallClockToUtc("08-08-2026 15:30")).toThrow();
  });
});
