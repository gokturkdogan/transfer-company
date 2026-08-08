import { createMoney, sumMoney } from "@/lib/money";

import { PricingDomainError } from "./errors";
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
): QuoteLineItem {
  const unitPriceMinor = resolveVehicleUnitPrice(vehicle, tripType);

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
): QuoteLineItem {
  const effectiveQuantity =
    extra.pricingMode === "FIXED" ? 1 : extra.quantity;

  return {
    type: "EXTRA_SERVICE",
    referenceId: extra.extraServiceId,
    name: extra.extraServiceName,
    quantity: effectiveQuantity,
    unitPriceMinor: extra.unitPriceMinor,
    totalPriceMinor: extra.unitPriceMinor * effectiveQuantity,
  };
}

export function calculateQuote(input: TransferQuoteInput): TransferQuoteResult {
  if (input.vehicles.length === 0) {
    throw new PricingDomainError("At least one vehicle selection is required");
  }

  const baseItems = input.vehicles.map((vehicle) =>
    buildVehicleLineItem(vehicle, input.tripType),
  );

  const extraItems = input.extras.map((extra) => {
    assertCurrencyMatch(input.currency, extra.currency, extra.extraServiceName);
    return buildExtraLineItem(extra);
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
