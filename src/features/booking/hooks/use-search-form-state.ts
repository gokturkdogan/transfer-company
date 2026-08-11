"use client";

import type { Dispatch } from "react";

import { useBookingFlowOptional } from "@/features/booking/context/booking-flow-context";
import {
  useHomeSearchOptional,
  type HomeSearchAction,
} from "@/features/booking/context/home-search-context";
import type { BookingFlowAction } from "@/features/booking/lib/booking-flow-reducer";
import type { BookingSearchState } from "@/features/booking/lib/types";
import type {
  AirportDto,
  CityDto,
  DistrictDto,
} from "@/features/locations/types";

/** Search-form actions shared by home hero and booking flow. */
export type SearchFormAction = HomeSearchAction | BookingFlowAction;

export type SearchFormState = {
  search: BookingSearchState;
  airports: AirportDto[];
  cities: CityDto[];
  districts: DistrictDto[];
  dispatch: Dispatch<SearchFormAction>;
  isLoadingQuote: boolean;
};

/**
 * Shared adapter for HeroSearchBar / TransferSearchLauncher.
 * Prefers lightweight `HomeSearchProvider` on the homepage;
 * falls back to full `BookingFlowProvider` on the booking page.
 */
export function useSearchFormState(): SearchFormState {
  const home = useHomeSearchOptional();
  const booking = useBookingFlowOptional();

  if (home) {
    return {
      search: home.search,
      airports: home.airports,
      cities: home.cities,
      districts: home.districts,
      dispatch: home.dispatch as Dispatch<SearchFormAction>,
      isLoadingQuote: false,
    };
  }

  if (booking) {
    return {
      search: booking.state.search,
      airports: booking.airports,
      cities: booking.cities,
      districts: booking.districts,
      dispatch: booking.dispatch as Dispatch<SearchFormAction>,
      isLoadingQuote: booking.state.isLoadingQuote,
    };
  }

  throw new Error(
    "useSearchFormState must be used within HomeSearchProvider or BookingFlowProvider",
  );
}
