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

  it("preserves customer step when search changes with preserveFlow", () => {
    const initial = createInitialBookingFlowState({
      originAirportId: "a",
      destinationDistrictId: "b",
      outboundDate: "2026-08-10",
      outboundTime: "10:00",
    });

    const onCustomerStep = bookingFlowReducer(
      {
        ...initial,
        step: "customer",
        selectedVehicleCategoryId: "vehicle-1",
        selectedQuantity: 1,
        searchSignature: buildSearchSignature(initial.search),
      },
      {
        type: "UPDATE_SEARCH",
        search: { outboundTime: "12:00" },
        preserveFlow: true,
      },
    );

    expect(onCustomerStep.step).toBe("customer");
    expect(onCustomerStep.selectedVehicleCategoryId).toBe("vehicle-1");
    expect(onCustomerStep.search.outboundTime).toBe("12:00");
    expect(onCustomerStep.quote).toBeNull();
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

  it("syncs passenger slots when search counts change", () => {
    const initial = createInitialBookingFlowState({
      passengerCount: 2,
      childCount: 0,
    });

    const next = bookingFlowReducer(initial, {
      type: "UPDATE_SEARCH",
      search: { passengerCount: 1, childCount: 1 },
      preserveFlow: true,
    });

    expect(next.passengers).toHaveLength(2);
    expect(next.passengers[0]).toMatchObject({ kind: "adult", index: 1 });
    expect(next.passengers[1]).toMatchObject({ kind: "child", index: 1 });
  });

  it("updates a passenger entry", () => {
    const initial = createInitialBookingFlowState({
      passengerCount: 1,
      childCount: 0,
    });

    const next = bookingFlowReducer(initial, {
      type: "UPDATE_PASSENGER",
      kind: "adult",
      index: 1,
      passenger: { fullName: "Ada Lovelace", idDocument: "123" },
    });

    expect(next.passengers[0]).toMatchObject({
      fullName: "Ada Lovelace",
      idDocument: "123",
    });
  });

  it("restores search draft when modal edits are discarded", () => {
    const initial = createInitialBookingFlowState({
      originAirportId: "a",
      destinationDistrictId: "b",
      outboundDate: "2026-08-10",
      outboundTime: "10:00",
      passengerCount: 2,
      childCount: 0,
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

    const edited = bookingFlowReducer(withQuote, {
      type: "UPDATE_SEARCH",
      search: { passengerCount: 5 },
    });

    expect(edited.search.passengerCount).toBe(5);

    const restored = bookingFlowReducer(edited, {
      type: "RESTORE_SEARCH_DRAFT",
      snapshot: {
        search: withQuote.search,
        destination: withQuote.destination,
        quote: withQuote.quote,
        searchSignature: withQuote.searchSignature,
        selectedVehicleCategoryId: withQuote.selectedVehicleCategoryId,
        selectedQuantity: withQuote.selectedQuantity,
        selectedExtras: withQuote.selectedExtras,
        passengers: withQuote.passengers,
      },
    });

    expect(restored.search.passengerCount).toBe(2);
    expect(restored.quote).toBe(withQuote.quote);
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
