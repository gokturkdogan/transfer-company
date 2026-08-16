import type { TransferAvailabilityResponseDto } from "@/features/pricing/types/dto";

export function isTransferPricingUnavailable(
  quote: TransferAvailabilityResponseDto,
): boolean {
  if (quote.pricingUnavailable === true) {
    return true;
  }

  if (quote.options.length === 0) {
    return true;
  }

  return !quote.options.some((option) => option.eligibility !== "INELIGIBLE");
}
