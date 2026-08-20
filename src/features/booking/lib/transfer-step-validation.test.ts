import { describe, expect, it } from "vitest";

import { getTransferValidationIssue } from "@/features/booking/lib/transfer-step-validation";
import { getDefaultSearchState } from "@/features/booking/lib/error-messages";

describe("getTransferValidationIssue", () => {
  it("requires return schedule and flight number for round trips", () => {
    const search = {
      ...getDefaultSearchState(),
      tripType: "ROUND_TRIP" as const,
      returnDate: "",
      returnTime: "",
    };

    expect(
      getTransferValidationIssue({
        search,
        flight: { outboundFlightNumber: "", returnFlightNumber: "" },
      }),
    ).toEqual({
      errorKey: "errors.schedule",
      fieldHighlight: "transfer.returnSchedule",
    });

    expect(
      getTransferValidationIssue({
        search: {
          ...search,
          returnDate: "2026-08-20",
          returnTime: "14:30",
        },
        flight: { outboundFlightNumber: "", returnFlightNumber: "" },
      }),
    ).toEqual({
      errorKey: "errors.returnFlightNumber",
      fieldHighlight: "transfer.returnFlightNumber",
    });
  });

  it("passes for one-way trips without return details", () => {
    expect(
      getTransferValidationIssue({
        search: getDefaultSearchState(),
        flight: { outboundFlightNumber: "", returnFlightNumber: "" },
      }),
    ).toBeNull();
  });
});
