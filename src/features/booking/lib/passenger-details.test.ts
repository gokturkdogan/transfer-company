import { describe, expect, it } from "vitest";

import {
  appendPassengerDetailsToNotes,
  arePassengerDetailsValid,
  buildPassengerSlots,
  syncPassengersWithSearch,
} from "@/features/booking/lib/passenger-details";

describe("passenger-details", () => {
  it("builds adult and child slots in order", () => {
    expect(buildPassengerSlots(2, 1)).toEqual([
      { kind: "adult", index: 1, fullName: "", idDocument: "" },
      { kind: "adult", index: 2, fullName: "", idDocument: "" },
      { kind: "child", index: 1, fullName: "", idDocument: "" },
    ]);
  });

  it("preserves existing passenger data when counts change", () => {
    const current = buildPassengerSlots(2, 1);
    current[0] = { ...current[0], fullName: "Ada Lovelace", idDocument: "123" };
    current[2] = { ...current[2], fullName: "Kid" };

    const synced = syncPassengersWithSearch(current, 3, 0);

    expect(synced).toHaveLength(3);
    expect(synced[0].fullName).toBe("Ada Lovelace");
    expect(synced[0].idDocument).toBe("123");
    expect(synced[2].fullName).toBe("");
  });

  it("requires every passenger name", () => {
    const passengers = buildPassengerSlots(2, 0);
    passengers[0].fullName = "Ada";

    expect(arePassengerDetailsValid(passengers)).toBe(false);

    passengers[1].fullName = "Grace";
    expect(arePassengerDetailsValid(passengers)).toBe(true);
  });

  it("formats passenger block for notes", () => {
    const passengers = buildPassengerSlots(1, 1);
    passengers[0].fullName = "Ada Lovelace";
    passengers[0].idDocument = "12345678901";
    passengers[1].fullName = "Child Name";

    const notes = appendPassengerDetailsToNotes(
      passengers,
      (passenger) =>
        passenger.kind === "adult"
          ? `${passenger.index}. Adult`
          : `${passenger.index}. Child`,
      "Passengers",
      "Flight arrives late",
    );

    expect(notes).toContain("Flight arrives late");
    expect(notes).toContain("1. Adult: Ada Lovelace (12345678901)");
    expect(notes).toContain("1. Child: Child Name");
  });
});
