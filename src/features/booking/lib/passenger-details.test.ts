import { describe, expect, it } from "vitest";

import {
  arePassengerDetailsValid,
  buildPassengerSlots,
  formatPassengerDisplayLine,
  syncPassengersWithSearch,
  toReservationPassengerSnapshots,
} from "@/features/booking/lib/passenger-details";

describe("passenger-details", () => {
  it("builds adult, child, and infant slots in order", () => {
    expect(buildPassengerSlots(2, 1, 1)).toEqual([
      { kind: "adult", index: 1, fullName: "", idDocument: "" },
      { kind: "adult", index: 2, fullName: "", idDocument: "" },
      { kind: "child", index: 1, fullName: "", idDocument: "" },
      { kind: "infant", index: 1, fullName: "", idDocument: "" },
    ]);
  });

  it("preserves existing passenger data when counts change", () => {
    const current = buildPassengerSlots(2, 1, 1);
    current[0] = { ...current[0], fullName: "Ada Lovelace", idDocument: "123" };
    current[2] = { ...current[2], fullName: "Kid" };
    current[3] = { ...current[3], fullName: "Baby" };

    const synced = syncPassengersWithSearch(current, 3, 0, 1);

    expect(synced).toHaveLength(4);
    expect(synced[0].fullName).toBe("Ada Lovelace");
    expect(synced[0].idDocument).toBe("123");
    expect(synced[3].fullName).toBe("Baby");
  });

  it("requires every passenger name", () => {
    const passengers = buildPassengerSlots(2, 0);
    passengers[0].fullName = "Ada";

    expect(arePassengerDetailsValid(passengers)).toBe(false);

    passengers[1].fullName = "Grace";
    expect(arePassengerDetailsValid(passengers)).toBe(true);
  });

  it("maps filled passengers to reservation snapshots without empty slots", () => {
    const passengers = buildPassengerSlots(1, 1);
    passengers[0].fullName = "Ada Lovelace";
    passengers[0].idDocument = "12345678901";
    passengers[1].fullName = "Child Name";

    expect(toReservationPassengerSnapshots(passengers)).toEqual([
      {
        kind: "adult",
        index: 1,
        fullName: "Ada Lovelace",
        idDocument: "12345678901",
      },
      {
        kind: "child",
        index: 1,
        fullName: "Child Name",
      },
    ]);
  });

  it("formats a passenger display line with optional id", () => {
    expect(
      formatPassengerDisplayLine(
        { fullName: "Ada Lovelace", idDocument: "123" },
        "1. Adult",
      ),
    ).toBe("1. Adult: Ada Lovelace (123)");

    expect(
      formatPassengerDisplayLine({ fullName: "Child Name" }, "1. Child"),
    ).toBe("1. Child: Child Name");
  });
});
