import { useEffect, useRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import { TransferSearchForm } from "@/features/booking/components/TransferSearchForm";
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

const messages = {
  booking: {
    search: {
      airport: "Airport",
      city: "City",
      district: "District",
      selectAirport: "Select airport",
      selectCity: "Select city",
      selectDistrict: "Select district",
      searchAirport: "Search airport",
      searchCity: "Search city",
      searchDistrict: "Search district",
      noAirports: "No airports",
      noCities: "No cities",
      noDistricts: "No districts",
      tripType: "Trip type",
      oneWay: "One way",
      roundTrip: "Round trip",
      outboundDate: "Outbound date",
      outboundTime: "Outbound time",
      returnDate: "Return date",
      returnTime: "Return time",
      passengers: "Passengers",
      largeLuggage: "Large luggage",
      cabinLuggage: "Cabin luggage",
      submit: "Search",
      loading: "Loading",
    },
  },
};

function SearchHarness() {
  const { dispatch } = useBookingFlow();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;
    dispatch({ type: "SET_TRIP_TYPE", tripType: "ROUND_TRIP" });
  }, [dispatch]);

  return <TransferSearchForm />;
}

function renderForm(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <BookingFlowProvider
        airports={testAirports}
        cities={testCities}
        districts={testDistricts}
      >
        {ui}
      </BookingFlowProvider>
    </NextIntlClientProvider>,
  );
}

describe("TransferSearchForm", () => {
  it("reveals return fields for round trip", async () => {
    renderForm(<SearchHarness />);

    expect(await screen.findByLabelText("Return date")).toBeInTheDocument();
    expect(screen.getByLabelText("Return time")).toBeInTheDocument();
  });

  it("hides return fields for one way", async () => {
    const user = userEvent.setup();

    renderForm(
      <BookingFlowProvider
        airports={testAirports}
        cities={testCities}
        districts={testDistricts}
        initialSearch={{ tripType: "ROUND_TRIP", returnDate: "2026-08-12" }}
      >
        <TransferSearchForm />
      </BookingFlowProvider>,
    );

    expect(screen.getByLabelText("Return date")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "One way" }));
    expect(screen.queryByLabelText("Return date")).not.toBeInTheDocument();
  });
});
