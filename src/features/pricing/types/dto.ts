import type { EligibilityStatus, CapacityWarning } from "@/features/capacity/types";
import type { ExtraPricingMode, TransferQuote } from "@/features/pricing/types";

export type TransferOptionExtraDto = {
  extraServiceId: string;
  name: string;
  pricingMode: ExtraPricingMode;
  quantity: number;
  maxQuantity: number | null;
  includedQuantity: number;
  unitPriceMinor: number;
  totalPriceMinor: number;
  required: boolean;
};

export type TransferVehicleOptionDto = {
  vehicleCategoryId: string;
  name: string;
  code: string;
  imageKey: string | null;
  galleryImageKeys: string[];
  quantity: number;
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
  eligibility: EligibilityStatus;
  requiredLuggageVehicles: number;
  requiredChildSeats: number;
  warnings: CapacityWarning[];
  requiredExtras: TransferOptionExtraDto[];
  optionalExtras: TransferOptionExtraDto[];
  features: string[];
  quote: TransferQuote;
};

export type PricedSelectionDto = {
  vehicleCategoryId: string;
  quantity: number;
  eligibility: EligibilityStatus;
  requiredExtras: TransferOptionExtraDto[];
  quote: TransferQuote;
  allItems: Array<{
    type: "TRANSFER_VEHICLE" | "EXTRA_SERVICE";
    referenceId: string;
    name: string;
    quantity: number;
    unitPriceMinor: number;
    totalPriceMinor: number;
  }>;
};

export type TransferAvailabilityResponseDto = {
  routeId: string;
  currency: string;
  timeZone: string;
  options: TransferVehicleOptionDto[];
  selection?: PricedSelectionDto;
};

export type ReservationLineItemDto = {
  type: "TRANSFER_VEHICLE" | "EXTRA_SERVICE";
  name: string;
  quantity: number;
  unitPriceMinor: number;
  totalPriceMinor: number;
};

export type ReservationResponseDto = {
  reference: string;
  status: "PENDING";
  tripType: "ONE_WAY" | "ROUND_TRIP";
  outboundAt: string;
  returnAt: string | null;
  subtotalMinor: number;
  totalMinor: number;
  currency: string;
  timeZone: string;
  items: ReservationLineItemDto[];
};
