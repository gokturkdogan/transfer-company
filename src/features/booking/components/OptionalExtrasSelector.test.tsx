import { useEffect, useRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import { OptionalExtrasSelector } from "@/features/booking/components/OptionalExtrasSelector";
import {
  BookingFlowProvider,
  useBookingFlow,
} from "@/features/booking/context/booking-flow-context";
import type { TransferAvailabilityResponseDto } from "@/features/pricing/types/dto";

vi.mock("@/features/booking/lib/api", () => ({
  fetchTransferQuote: vi.fn(),
  fetchReservation: vi.fn(),
}));

import { fetchTransferQuote } from "@/features/booking/lib/api";

const messages = {
  booking: {
    extras: {
      quantityLabel: "Quantity",
      none: "No optional extras",
    },
  },
};

import {
  testAirports,
  testCities,
  testDistricts,
} from "@/features/booking/test/booking-test-fixtures";

const quoteFixture: TransferAvailabilityResponseDto = {
  routeId: "route-1",
  currency: "EUR",
  timeZone: "Europe/Istanbul",
  options: [
    {
      vehicleCategoryId: "vehicle-1",
      name: "Vito",
      code: "VITO",
      imageKey: null,
      galleryImageKeys: [],
      quantity: 1,
      passengerCapacity: 8,
      largeLuggageCapacity: 8,
      cabinLuggageCapacity: 2,
      eligibility: "ELIGIBLE",
      requiredLuggageVehicles: 0,
      warnings: [],
      requiredExtras: [],
      optionalExtras: [
        {
          extraServiceId: "child-seat",
          name: "Child seat",
          pricingMode: "PER_UNIT",
          quantity: 0,
          maxQuantity: 3,
          unitPriceMinor: 500,
          totalPriceMinor: 0,
          required: false,
        },
      ],
      features: [],
      quote: {
        currency: "EUR",
        baseItems: [],
        extraItems: [],
        subtotalMinor: 10000,
        totalMinor: 10000,
      },
    },
  ],
};

function ExtrasStepHarness() {
  const { dispatch } = useBookingFlow();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;
    dispatch({
      type: "QUOTE_SUCCESS",
      quote: quoteFixture,
      searchSignature: "sig",
    });
    dispatch({
      type: "SELECT_VEHICLE",
      vehicleCategoryId: "vehicle-1",
      quantity: 1,
    });
  }, [dispatch]);

  return <OptionalExtrasSelector />;
}

function renderExtrasStep() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <BookingFlowProvider
        airports={testAirports}
        cities={testCities}
        districts={testDistricts}
        initialSearch={{
          originAirportId: "loc-a",
          destinationDistrictId: "loc-b",
          cityId: "city-1",
          outboundDate: "2026-08-10",
          outboundTime: "10:00",
        }}
      >
        <ExtrasStepHarness />
      </BookingFlowProvider>
    </NextIntlClientProvider>,
  );
}

describe("OptionalExtrasSelector", () => {
  it("triggers debounced requote when optional extra changes", async () => {
    vi.mocked(fetchTransferQuote).mockResolvedValue({
      success: true,
      data: {
        ...quoteFixture,
        selection: {
          vehicleCategoryId: "vehicle-1",
          quantity: 1,
          eligibility: "ELIGIBLE",
          requiredExtras: [],
          quote: {
            currency: "EUR",
            baseItems: [],
            extraItems: [],
            subtotalMinor: 10500,
            totalMinor: 10500,
          },
          allItems: [],
        },
      },
    });

    const user = userEvent.setup();
    renderExtrasStep();

    await screen.findByText("Child seat");

    await user.click(screen.getByRole("button", { name: "Increase Child seat" }));

    await waitFor(
      () => {
        expect(fetchTransferQuote).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });
});
