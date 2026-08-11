"use client";

import type { AirportDto, CityDto, DistrictDto } from "@/features/locations/types";
import { TransferSearchLauncher } from "@/features/booking/components/TransferSearchLauncher";
import { HomeSearchProvider } from "@/features/booking/context/home-search-context";
import type { BookingSearchState } from "@/features/booking/lib/types";

type HomeBookingWidgetProps = {
  airports: AirportDto[];
  cities: CityDto[];
  districts: DistrictDto[];
  initialSearch: Partial<BookingSearchState>;
};

export function HomeBookingWidget({
  airports,
  cities,
  districts,
  initialSearch,
}: HomeBookingWidgetProps) {
  return (
    <HomeSearchProvider
      airports={airports}
      cities={cities}
      districts={districts}
      initialSearch={initialSearch}
    >
      <TransferSearchLauncher showSecondaryCta={false} variant="hero" />
    </HomeSearchProvider>
  );
}
