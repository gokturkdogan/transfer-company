import { describe, expect, it } from "vitest";

import {
  bookingFlowReducer,
  createInitialBookingFlowState,
} from "@/features/booking/lib/booking-flow-reducer";
import { buildSearchSignature } from "@/features/booking/lib/search-signature";

describe("bookingFlowReducer", () => {
  it("invalidates quote when search signature changes", () => {
    const initial = createInitialBookingFlowState({
      originAirportId: "a",
      destinationDistrictId: "b",
      outboundDate: "2026-08-10",
      outboundTime: "10:00",
    });

    const withQuote = bookingFlowReducer(initial, {
      type: "QUOTE_SUCCESS",
      quote: {
        routeId: "route-1",
        currency: "EUR",
        timeZone: "Europe/Istanbul",
        options: [],
      },
      searchSignature: buildSearchSignature(initial.search),
    });

    const next = bookingFlowReducer(withQuote, {
      type: "UPDATE_SEARCH",
      search: { passengerCount: 5 },
    });

    expect(next.quote).toBeNull();
    expect(next.selectedVehicleCategoryId).toBeNull();
    expect(next.step).toBe("vehicle");
  });

  it("clears return fields when switching to one way", () => {
    const initial = createInitialBookingFlowState({
      tripType: "ROUND_TRIP",
      returnDate: "2026-08-12",
      returnTime: "12:00",
    });

    const next = bookingFlowReducer(initial, {
      type: "SET_TRIP_TYPE",
      tripType: "ONE_WAY",
    });

    expect(next.search.tripType).toBe("ONE_WAY");
    expect(next.search.returnDate).toBe("");
  });

  it("stores idempotency key when entering review", () => {
    const initial = createInitialBookingFlowState();

    const next = bookingFlowReducer(initial, {
      type: "SET_STEP",
      step: "review",
      idempotencyKey: "idem-123",
    });

    expect(next.step).toBe("review");
    expect(next.idempotencyKey).toBe("idem-123");
  });

  it("preserves idempotency key across review revisits", () => {
    const withKey = bookingFlowReducer(createInitialBookingFlowState(), {
      type: "SET_STEP",
      step: "review",
      idempotencyKey: "idem-123",
    });

    const backToCustomer = bookingFlowReducer(withKey, {
      type: "SET_STEP",
      step: "customer",
    });

    const reviewAgain = bookingFlowReducer(backToCustomer, {
      type: "SET_STEP",
      step: "review",
    });

    expect(reviewAgain.idempotencyKey).toBe("idem-123");
  });

  it("clears hotel when district changes", () => {
    const withHotel = bookingFlowReducer(createInitialBookingFlowState(), {
      type: "SET_HOTEL",
      hotelLocationId: "hotel-1",
      hotelName: "Maxx Royal",
    });

    const next = bookingFlowReducer(withHotel, {
      type: "SET_DISTRICT",
      districtId: "district-2",
    });

    expect(next.destination.hotelLocationId).toBe("");
    expect(next.destination.hotelName).toBe("");
  });
});
