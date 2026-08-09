import { describe, expect, it } from "vitest";

import {
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
});
