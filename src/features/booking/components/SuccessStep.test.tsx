import { useEffect, useRef } from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import { SuccessStep } from "@/features/booking/components/SuccessStep";
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
}));

const messages = {
  booking: {
    success: {
      title: "Request received",
      subtitle: "We will confirm shortly",
      reference: "Reference",
      backHome: "Back home",
    },
  },
  contact: {
    phone: "Call",
    whatsapp: "WhatsApp",
    hours: "Hours",
  },
};

function SuccessHarness() {
  const { dispatch } = useBookingFlow();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    dispatch({
      type: "SUBMIT_SUCCESS",
      reservation: {
        reference: "TC-ABC123",
        status: "PENDING",
        tripType: "ONE_WAY",
        outboundAt: "2026-08-10T10:00",
        returnAt: null,
        subtotalMinor: 10000,
        totalMinor: 10000,
        currency: "EUR",
        timeZone: "Europe/Istanbul",
        items: [],
      },
    });
  }, [dispatch]);

  return <SuccessStep />;
}

describe("SuccessStep", () => {
  it("shows reservation reference from server response", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <BookingFlowProvider
          airports={testAirports}
          cities={testCities}
          districts={testDistricts}
          initialSearch={{
            originAirportId: "loc-a",
            destinationDistrictId: "loc-b",
            outboundDate: "2026-08-10",
            outboundTime: "10:00",
          }}
        >
          <SuccessHarness />
        </BookingFlowProvider>
      </NextIntlClientProvider>,
    );

    expect(await screen.findByText("TC-ABC123")).toBeInTheDocument();
  });
});
