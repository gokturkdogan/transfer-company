import type { ExtraPricingMode } from "@/features/pricing/types";

export function resolveBillableExtraQuantity(
  pricingMode: ExtraPricingMode,
  quantity: number,
  includedQuantity: number,
): number {
  if (pricingMode === "FIXED") {
    return 1;
  }

  return Math.max(0, quantity - Math.max(0, includedQuantity));
}

export function calculateExtraTotalMinor(input: {
  pricingMode: ExtraPricingMode;
  quantity: number;
  unitPriceMinor: number;
  includedQuantity: number;
}): number {
  const billableQuantity = resolveBillableExtraQuantity(
    input.pricingMode,
    input.quantity,
    input.includedQuantity,
  );

  if (input.pricingMode === "FIXED") {
    return input.unitPriceMinor;
  }

  return input.unitPriceMinor * billableQuantity;
}
