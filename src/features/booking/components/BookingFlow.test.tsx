import { useEffect, useRef } from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import { BookingFlow } from "@/features/booking/components/BookingFlow";
import {
  BookingFlowProvider,
  useBookingFlow,
} from "@/features/booking/context/booking-flow-context";
import {
  testAirports,
  testCities,
  testDistricts,
} from "@/features/booking/test/booking-test-fixtures";

vi.mock("@/features/booking/lib/api", () => ({
  fetchTransferQuote: vi.fn(),
  fetchReservation: vi.fn(),
  fetchHotelsForDistrict: vi.fn(),
}));

vi.mock("@/features/booking/components/BookingInlineSearchBar", () => ({
  BookingInlineSearchBar: () => null,
}));

const messages = {
  booking: {
    errors: {
      validation: "Please check the highlighted fields.",
    },
    actions: { back: "Back", continue: "Continue" },
    vehicle: { title: "Vehicle" },
    search: {
      airport: "Airport",
      district: "District",
      selectAirport: "Select",
      selectDistrict: "Select",
      searchAirport: "Search",
      searchDistrict: "Search",
      noAirports: "None",
      noDistricts: "None",
      tripType: "Trip",
      oneWay: "One way",
      roundTrip: "Round trip",
      outboundDate: "Outbound date",
      outboundTime: "Outbound time",
      returnDate: "Return date",
      returnTime: "Return time",
      passengers: "Passengers",
      largeLuggage: "Large",
      cabinLuggage: "Cabin",
      submit: "Search",
      loading: "Loading",
    },
    steps: {
      search: "Search",
      vehicle: "Vehicle",
      extras: "Extras",
      customer: "Details",
      review: "Review",
    },
  },
};

function ErrorHarness() {
  const { dispatch } = useBookingFlow();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    dispatch({ type: "QUOTE_ERROR", errorKey: "errors.validation" });
  }, [dispatch]);

  return <BookingFlow />;
}

describe("BookingFlow", () => {
  it("renders mapped validation error message", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <BookingFlowProvider
          airports={testAirports}
          cities={testCities}
          districts={testDistricts}
        >
          <ErrorHarness />
        </BookingFlowProvider>
      </NextIntlClientProvider>,
    );

    expect(
      await screen.findByText("Please check the highlighted fields."),
    ).toBeInTheDocument();
  });
});
