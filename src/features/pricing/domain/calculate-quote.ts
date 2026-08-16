import { createMoney, sumMoney } from "@/lib/money";

import { applyPriceMultiplier } from "./arabic-locale-pricing";
import { PricingDomainError } from "./errors";
import { calculateExtraTotalMinor } from "./extra-pricing";
import type {
  QuoteLineItem,
  TransferQuote,
  TransferQuoteInput,
  TransferQuoteResult,
} from "../types";

function assertCurrencyMatch(expected: string, actual: string, context: string) {
  if (expected !== actual) {
    throw new PricingDomainError(
      `Currency mismatch for ${context}: expected ${expected}, got ${actual}`,
    );
  }
}

function resolveVehicleUnitPrice(
  vehicle: TransferQuoteInput["vehicles"][number],
  tripType: TransferQuoteInput["tripType"],
): number {
  if (tripType === "ONE_WAY") {
    return vehicle.oneWayPriceMinor;
  }

  if (vehicle.roundTripPriceMinor === null) {
    throw new PricingDomainError(
      `Round trip is not available for vehicle category ${vehicle.vehicleCategoryName}`,
    );
  }

  return vehicle.roundTripPriceMinor;
}

function buildVehicleLineItem(
  vehicle: TransferQuoteInput["vehicles"][number],
  tripType: TransferQuoteInput["tripType"],
  pricingAdjustments: TransferQuoteInput["pricingAdjustments"],
): QuoteLineItem {
  const baseUnitPriceMinor = resolveVehicleUnitPrice(vehicle, tripType);
  const unitPriceMinor = vehicle.isLuggageOverflowVehicle
    ? applyPriceMultiplier(
        baseUnitPriceMinor,
        pricingAdjustments?.luggageVehiclePriceMultiplier ?? 1,
      )
    : baseUnitPriceMinor;

  return {
    type: "TRANSFER_VEHICLE",
    referenceId: vehicle.vehicleCategoryId,
    name: vehicle.vehicleCategoryName,
    quantity: vehicle.quantity,
    unitPriceMinor,
    totalPriceMinor: unitPriceMinor * vehicle.quantity,
  };
}

function buildExtraLineItem(
  extra: TransferQuoteInput["extras"][number],
  extraPriceMultiplier: number,
): QuoteLineItem {
  const unitPriceMinor = applyPriceMultiplier(
    extra.unitPriceMinor,
    extraPriceMultiplier,
  );
  const effectiveQuantity =
    extra.pricingMode === "FIXED" ? 1 : extra.quantity;
  const totalPriceMinor = calculateExtraTotalMinor({
    pricingMode: extra.pricingMode,
    quantity: extra.quantity,
    unitPriceMinor,
    includedQuantity: extra.includedQuantity,
  });

  return {
    type: "EXTRA_SERVICE",
    referenceId: extra.extraServiceId,
    name: extra.extraServiceName,
    quantity: effectiveQuantity,
    unitPriceMinor,
    totalPriceMinor,
  };
}

export function calculateQuote(input: TransferQuoteInput): TransferQuoteResult {
  if (input.vehicles.length === 0) {
    throw new PricingDomainError("At least one vehicle selection is required");
  }

  const extraPriceMultiplier =
    input.pricingAdjustments?.extraPriceMultiplier ?? 1;

  const baseItems = input.vehicles.map((vehicle) =>
    buildVehicleLineItem(vehicle, input.tripType, input.pricingAdjustments),
  );

  const extraItems = input.extras.map((extra) => {
    assertCurrencyMatch(input.currency, extra.currency, extra.extraServiceName);
    return buildExtraLineItem(extra, extraPriceMultiplier);
  });

  const allItems = [...baseItems, ...extraItems];

  const subtotalMinor = sumMoney(
    allItems.map((item) =>
      createMoney(item.totalPriceMinor, input.currency),
    ),
  ).amountMinor;

  const quote: TransferQuote = {
    currency: input.currency,
    baseItems,
    extraItems,
    subtotalMinor,
    totalMinor: subtotalMinor,
  };

  return { quote, allItems };
}
