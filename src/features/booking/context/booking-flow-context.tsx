"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";

import {
  bookingFlowReducer,
  createInitialBookingFlowState,
  type BookingFlowAction,
} from "@/features/booking/lib/booking-flow-reducer";
import { fetchReservation, fetchTransferQuote } from "@/features/booking/lib/api";
import { mapApiErrorToKey } from "@/features/booking/lib/error-messages";
import {
  buildQuoteRequest,
  buildSearchSignature,
} from "@/features/booking/lib/search-signature";
import type {
  BookingFlowState,
  BookingSearchState,
  CustomerState,
  DestinationState,
  FlightState,
  SelectedExtra,
} from "@/features/booking/lib/types";
import type {
  AirportDto,
  CityDto,
  DistrictDto,
} from "@/features/locations/types";
import { track } from "@/lib/analytics";

type BookingFlowContextValue = {
  state: BookingFlowState;
  airports: AirportDto[];
  cities: CityDto[];
  districts: DistrictDto[];
  dispatch: React.Dispatch<BookingFlowAction>;
  requestQuote: () => Promise<void>;
  requestRequote: (extras: SelectedExtra[]) => Promise<void>;
  submitReservation: () => Promise<void>;
};

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

export function BookingFlowProvider({
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
  const locale = useLocale();
  const [state, dispatch] = useReducer(
    bookingFlowReducer,
    createInitialBookingFlowState(initialSearch),
  );

  const requestQuote = useCallback(async () => {
    dispatch({ type: "QUOTE_LOADING" });
    track({ name: "booking_search" });

    const body = buildQuoteRequest(state.search, locale);
    const result = await fetchTransferQuote(body);

    if (!result.success) {
      dispatch({
        type: "QUOTE_ERROR",
        errorKey: mapApiErrorToKey(result.error, result.status),
      });
      return;
    }

    dispatch({
      type: "QUOTE_SUCCESS",
      quote: result.data,
      searchSignature: buildSearchSignature(state.search),
    });
  }, [locale, state.search]);

  const requestRequote = useCallback(
    async (extras: SelectedExtra[]) => {
      if (!state.selectedVehicleCategoryId) {
        return;
      }

      dispatch({ type: "QUOTE_LOADING" });

      const body = buildQuoteRequest(state.search, locale, {
        vehicleCategoryId: state.selectedVehicleCategoryId,
        quantity: state.selectedQuantity,
        extras,
      });

      const result = await fetchTransferQuote(body);

      if (!result.success) {
        dispatch({
          type: "QUOTE_ERROR",
          errorKey: mapApiErrorToKey(result.error, result.status),
        });
        return;
      }

      dispatch({
        type: "QUOTE_SUCCESS",
        quote: result.data,
        searchSignature: buildSearchSignature(state.search),
      });
      dispatch({ type: "SET_EXTRAS", extras });
    },
    [
      locale,
      state.search,
      state.selectedQuantity,
      state.selectedVehicleCategoryId,
    ],
  );

  const submitReservation = useCallback(async () => {
    if (!state.quote || !state.selectedVehicleCategoryId) {
      return;
    }

    const idempotencyKey = state.idempotencyKey ?? crypto.randomUUID();
    dispatch({ type: "ENSURE_IDEMPOTENCY_KEY", key: idempotencyKey });
    dispatch({ type: "SUBMIT_START" });
    track({ name: "booking_submitted" });

    const outboundAt = `${state.search.outboundDate}T${state.search.outboundTime}`;
    const returnAt =
      state.search.tripType === "ROUND_TRIP" &&
      state.search.returnDate &&
      state.search.returnTime
        ? `${state.search.returnDate}T${state.search.returnTime}`
        : undefined;

    const pricedSelection = state.quote.selection;
    const totalMinor =
      pricedSelection?.quote.totalMinor ??
      state.quote.options.find(
        (option) =>
          option.vehicleCategoryId === state.selectedVehicleCategoryId,
      )?.quote.totalMinor ??
      0;

    const body = {
      routeId: state.quote.routeId,
      originAirportId: state.search.originAirportId,
      destinationDistrictId: state.search.destinationDistrictId,
      hotelLocationId:
        !state.destination.useCustomDestination && state.destination.hotelLocationId
          ? state.destination.hotelLocationId
          : undefined,
      customDestination:
        state.destination.useCustomDestination && state.destination.customName
          ? {
              name: state.destination.customName,
              address: state.destination.customAddress || undefined,
            }
          : undefined,
      tripType: state.search.tripType,
      outboundAt,
      returnAt,
      outboundFlightNumber: state.flight.outboundFlightNumber || undefined,
      returnFlightNumber:
        state.search.tripType === "ROUND_TRIP"
          ? state.flight.returnFlightNumber || undefined
          : undefined,
      passengerCount: state.search.passengerCount,
      largeLuggageCount: state.search.largeLuggageCount,
      cabinLuggageCount: state.search.cabinLuggageCount,
      vehicles: [
        {
          vehicleCategoryId: state.selectedVehicleCategoryId,
          quantity: state.selectedQuantity,
        },
      ],
      extras: state.selectedExtras,
      customer: {
        firstName: state.customer.firstName,
        lastName: state.customer.lastName,
        email: state.customer.email,
        phone: state.customer.phone,
        whatsappPhone: state.customer.whatsappPhone || undefined,
      },
      notes: state.notes || undefined,
      locale,
      clientQuotedTotalMinor: totalMinor,
      website: "",
      formStartedAt: state.formStartedAt,
    };

    const result = await fetchReservation(body, idempotencyKey);

    if (!result.success) {
      dispatch({
        type: "SUBMIT_ERROR",
        errorKey: mapApiErrorToKey(result.error, result.status),
      });
      return;
    }

    dispatch({ type: "SUBMIT_SUCCESS", reservation: result.data });
    track({ name: "booking_success", payload: { reference: result.data.reference } });
  }, [locale, state]);

  const value = useMemo(
    () => ({
      state,
      airports,
      cities,
      districts,
      dispatch,
      requestQuote,
      requestRequote,
      submitReservation,
    }),
    [state, airports, cities, districts, requestQuote, requestRequote, submitReservation],
  );

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
    </BookingFlowContext.Provider>
  );
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext);

  if (!context) {
    throw new Error("useBookingFlow must be used within BookingFlowProvider");
  }

  return context;
}

export type { CustomerState, DestinationState, FlightState, SelectedExtra };
