"use client";

import type { AirportDto, CityDto, DistrictDto } from "@/features/locations/types";
import { TransferSearchLauncher } from "@/features/booking/components/TransferSearchLauncher";
import { BookingFlowProvider } from "@/features/booking/context/booking-flow-context";
import type { AcceptedPaymentCurrency } from "@/features/currencies/types";
import type { BookingSearchState } from "@/features/booking/lib/types";

type HomeBookingWidgetProps = {
  airports: AirportDto[];
  cities: CityDto[];
  districts: DistrictDto[];
  acceptedPaymentCurrencies: AcceptedPaymentCurrency[];
  initialSearch: Partial<BookingSearchState>;
};

export function HomeBookingWidget({
  airports,
  cities,
  districts,
  acceptedPaymentCurrencies,
  initialSearch,
}: HomeBookingWidgetProps) {
  return (
    <BookingFlowProvider
      airports={airports}
      cities={cities}
      districts={districts}
      acceptedPaymentCurrencies={acceptedPaymentCurrencies}
      initialSearch={initialSearch}
    >
      <TransferSearchLauncher showSecondaryCta={false} variant="hero" />
    </BookingFlowProvider>
  );
}
