"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import {
  bookingFlowReducer,
  createInitialBookingFlowState,
  type BookingFlowAction,
} from "@/features/booking/lib/booking-flow-reducer";
import type { BookingSearchState } from "@/features/booking/lib/types";
import type {
  AirportDto,
  CityDto,
  DistrictDto,
} from "@/features/locations/types";

/** Search-only actions used by the homepage hero (no quote/reservation). */
export type HomeSearchAction = Extract<
  BookingFlowAction,
  | { type: "UPDATE_SEARCH" }
  | { type: "SET_AIRPORT" }
  | { type: "SET_CITY" }
  | { type: "SET_DISTRICT" }
  | { type: "SWAP_ROUTE_DIRECTION" }
  | { type: "SET_TRIP_TYPE" }
>;

export type HomeSearchContextValue = {
  search: BookingSearchState;
  airports: AirportDto[];
  cities: CityDto[];
  districts: DistrictDto[];
  dispatch: Dispatch<HomeSearchAction>;
};

const HomeSearchContext = createContext<HomeSearchContextValue | null>(null);

function homeSearchReducer(
  search: BookingSearchState,
  action: HomeSearchAction,
): BookingSearchState {
  return bookingFlowReducer(createInitialBookingFlowState(search), action)
    .search;
}

export function HomeSearchProvider({
  children,
  airports,
  cities,
  districts,
  initialSearch,
}: {
  children: ReactNode;
  airports: AirportDto[];
  cities: CityDto[];
  districts: DistrictDto[];
  initialSearch?: Partial<BookingSearchState>;
}) {
  const [search, dispatch] = useReducer(
    homeSearchReducer,
    createInitialBookingFlowState(initialSearch).search,
  );

  const value = useMemo<HomeSearchContextValue>(
    () => ({
      search,
      airports,
      cities,
      districts,
      dispatch,
    }),
    [airports, cities, districts, search],
  );

  return (
    <HomeSearchContext.Provider value={value}>
      {children}
    </HomeSearchContext.Provider>
  );
}

export function useHomeSearch() {
  const context = useContext(HomeSearchContext);

  if (!context) {
    throw new Error("useHomeSearch must be used within HomeSearchProvider");
  }

  return context;
}

export function useHomeSearchOptional() {
  return useContext(HomeSearchContext);
}
