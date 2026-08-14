import { describe, expect, it } from "vitest";

import {
  formatFleetDisplayLabel,
  normalizeFleetVehicleCode,
  toFleetVehiclePath,
} from "@/features/marketing/lib/fleet-vehicle-slug";

describe("fleet vehicle slug", () => {
  it("builds lowercase path from code", () => {
    expect(toFleetVehiclePath("VITO")).toBe("/fleet/vito");
  });

  it("normalizes slug to uppercase code", () => {
    expect(normalizeFleetVehicleCode("sprinter")).toBe("SPRINTER");
  });

  it("formats underscore codes for display", () => {
    expect(formatFleetDisplayLabel("LUGGAGE_VAN")).toBe("Luggage Van");
    expect(formatFleetDisplayLabel("VITO")).toBe("VITO");
    expect(formatFleetDisplayLabel("leather_seats")).toBe("Leather Seats");
  });
});
