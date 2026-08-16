export type TripType = "ONE_WAY" | "ROUND_TRIP";

export type ExtraPricingMode = "FIXED" | "PER_UNIT";

export type QuoteVehicleSelection = {
  vehicleCategoryId: string;
  vehicleCategoryName: string;
  quantity: number;
  oneWayPriceMinor: number;
  roundTripPriceMinor: number | null;
  isLuggageOverflowVehicle?: boolean;
};

export type QuoteExtraSelection = {
  extraServiceId: string;
  extraServiceName: string;
  pricingMode: ExtraPricingMode;
  quantity: number;
  includedQuantity: number;
  unitPriceMinor: number;
  currency: string;
};

export type QuoteLineItem = {
  type: "TRANSFER_VEHICLE" | "EXTRA_SERVICE";
  referenceId: string;
  name: string;
  quantity: number;
  unitPriceMinor: number;
  totalPriceMinor: number;
};

export type TransferQuoteInput = {
  tripType: TripType;
  currency: string;
  vehicles: QuoteVehicleSelection[];
  extras: QuoteExtraSelection[];
  pricingAdjustments?: {
    extraPriceMultiplier: number;
    luggageVehiclePriceMultiplier: number;
  };
};

export type TransferQuote = {
  currency: string;
  baseItems: QuoteLineItem[];
  extraItems: QuoteLineItem[];
  subtotalMinor: number;
  totalMinor: number;
};

export type TransferQuoteResult = {
  quote: TransferQuote;
  allItems: QuoteLineItem[];
};
