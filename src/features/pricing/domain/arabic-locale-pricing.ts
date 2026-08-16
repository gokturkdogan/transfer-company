import { ARABIC_LOCALE } from "@/config/constants";

export const ARABIC_EXTRA_PRICE_MULTIPLIER = 2;
export const ARABIC_LUGGAGE_VEHICLE_PRICE_MULTIPLIER = 2;

export type ArabicPricingAdjustments = {
  extraPriceMultiplier: number;
  luggageVehiclePriceMultiplier: number;
};

export function resolveArabicPricingAdjustments(
  locale: string,
): ArabicPricingAdjustments | null {
  if (locale !== ARABIC_LOCALE) {
    return null;
  }

  return {
    extraPriceMultiplier: ARABIC_EXTRA_PRICE_MULTIPLIER,
    luggageVehiclePriceMultiplier: ARABIC_LUGGAGE_VEHICLE_PRICE_MULTIPLIER,
  };
}

export function applyPriceMultiplier(
  unitPriceMinor: number,
  multiplier: number,
): number {
  if (multiplier === 1) {
    return unitPriceMinor;
  }

  return unitPriceMinor * multiplier;
}

export function resolveExtraUnitPriceMinor(
  unitPriceMinor: number,
  adjustments: ArabicPricingAdjustments | null,
): number {
  return applyPriceMultiplier(
    unitPriceMinor,
    adjustments?.extraPriceMultiplier ?? 1,
  );
}
