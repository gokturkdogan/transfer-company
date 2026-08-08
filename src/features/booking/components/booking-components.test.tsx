import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import { PriceSummary } from "@/features/booking/components/PriceSummary";
import { RequiredExtrasPanel } from "@/features/booking/components/RequiredExtrasPanel";
import { VehicleRecommendationCard } from "@/features/booking/components/VehicleRecommendationCard";
import type { TransferVehicleOptionDto } from "@/features/pricing/types/dto";

const messages = {
  booking: {
    vehicle: {
      select: "Select",
      selected: "Selected",
      capacity: "{passengers} passengers",
      eligibility: {
        ELIGIBLE: "Eligible",
        ELIGIBLE_WITH_EXTRAS: "With extras",
        INELIGIBLE: "Not suitable",
      },
      luggageVehicleRequired: "Luggage vehicle required",
    },
    extras: {
      requiredTitle: "Required extras",
      required: "Required",
      quantity: "Qty {count}",
    },
    review: {
      baseTransfer: "Base transfer",
      total: "Total",
    },
  },
};

function renderWithIntl(ui: React.ReactNode, locale = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

function createOption(
  overrides: Partial<TransferVehicleOptionDto> = {},
): TransferVehicleOptionDto {
  return {
    vehicleCategoryId: "vehicle-1",
    name: "Mercedes Vito",
    quantity: 1,
    passengerCapacity: 8,
    largeLuggageCapacity: 8,
    cabinLuggageCapacity: 2,
    eligibility: "ELIGIBLE",
    requiredLuggageVehicles: 0,
    warnings: [],
    requiredExtras: [],
    optionalExtras: [],
    quote: {
      currency: "EUR",
      baseItems: [
        {
          type: "TRANSFER_VEHICLE",
          referenceId: "vehicle-1",
          name: "Mercedes Vito",
          quantity: 1,
          unitPriceMinor: 10000,
          totalPriceMinor: 10000,
        },
      ],
      extraItems: [],
      subtotalMinor: 10000,
      totalMinor: 10000,
    },
    ...overrides,
  };
}

describe("VehicleRecommendationCard", () => {
  it("renders server option name and price", () => {
    renderWithIntl(
      <VehicleRecommendationCard
        option={createOption()}
        selected={false}
        disabled={false}
        onSelect={() => undefined}
      />,
    );

    expect(screen.getByText("Mercedes Vito")).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it("disables ineligible vehicles", () => {
    const { container } = renderWithIntl(
      <VehicleRecommendationCard
        option={createOption({
          eligibility: "INELIGIBLE",
          warnings: [{ code: "PASSENGER_OVERFLOW", message: "Too many passengers" }],
        })}
        selected={false}
        disabled
        onSelect={() => undefined}
      />,
    );

    expect(within(container).getByRole("button", { name: "Select" })).toBeDisabled();
    expect(screen.getByText("Too many passengers")).toBeInTheDocument();
  });

  it("does not call onSelect when disabled", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    const { container } = renderWithIntl(
      <VehicleRecommendationCard
        option={createOption({ eligibility: "INELIGIBLE" })}
        selected={false}
        disabled
        onSelect={onSelect}
      />,
    );

    await user.click(within(container).getByRole("button", { name: "Select" }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("RequiredExtrasPanel", () => {
  it("renders required extras without remove controls", () => {
    const { container } = renderWithIntl(
      <RequiredExtrasPanel
        currency="EUR"
        extras={[
          {
            extraServiceId: "extra-1",
            name: "Luggage Van",
            pricingMode: "PER_UNIT",
            quantity: 1,
            maxQuantity: 1,
            unitPriceMinor: 2500,
            totalPriceMinor: 2500,
            required: true,
          },
        ]}
      />,
    );

    expect(within(container).getByText("Luggage Van")).toBeInTheDocument();
    expect(within(container).getByText("Required")).toBeInTheDocument();
    expect(within(container).queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("PriceSummary", () => {
  it("shows server selection total when provided", () => {
    const option = createOption({
      requiredExtras: [
        {
          extraServiceId: "extra-1",
          name: "Luggage Van",
          pricingMode: "PER_UNIT",
          quantity: 1,
          maxQuantity: 1,
          unitPriceMinor: 2500,
          totalPriceMinor: 2500,
          required: true,
        },
      ],
      quote: {
        currency: "EUR",
        baseItems: [
          {
            type: "TRANSFER_VEHICLE",
            referenceId: "vehicle-1",
            name: "Mercedes Vito",
            quantity: 1,
            unitPriceMinor: 10000,
            totalPriceMinor: 10000,
          },
        ],
        extraItems: [],
        subtotalMinor: 12500,
        totalMinor: 12500,
      },
    });

    renderWithIntl(
      <PriceSummary
        option={option}
        selectionTotalMinor={13750}
        currency="EUR"
      />,
    );

    const totalRow = screen.getByText("Total").closest("div");
    expect(totalRow).not.toBeNull();
    expect(within(totalRow!).getByText(/137/)).toBeInTheDocument();
  });
});
