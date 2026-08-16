"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";

import { useGlobalLoaderSync } from "@/components/shared/global-loader-provider";
import {
  bookingFlowReducer,
  createInitialBookingFlowState,
  type BookingFlowAction,
} from "@/features/booking/lib/booking-flow-reducer";
import { fetchReservation, fetchTransferQuote } from "@/features/booking/lib/api";
import { buildOrderPricing } from "@/features/booking/lib/build-order-pricing";
import { mapApiErrorToKey } from "@/features/booking/lib/error-messages";
import { toReservationPassengerSnapshots } from "@/features/booking/lib/passenger-details";
import { formatInternationalPhone } from "@/lib/phone/format";
import { getTotalPassengerCount } from "@/features/booking/lib/passenger-count";
import {
  getRequiredCapacityPassengerCount,
  hasSufficientPassengerCapacity,
} from "@/features/booking/lib/vehicle-selection";
import { sumSelectedLargeLuggageCapacity } from "@/features/booking/lib/vehicle-selection-context";
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
import type { AcceptedPaymentCurrency } from "@/features/currencies/types";
import { track } from "@/lib/analytics";

type BookingFlowContextValue = {
  state: BookingFlowState;
  airports: AirportDto[];
  cities: CityDto[];
  districts: DistrictDto[];
  acceptedPaymentCurrencies: AcceptedPaymentCurrency[];
  dispatch: React.Dispatch<BookingFlowAction>;
  requestQuote: (
    searchOverride?: Partial<BookingSearchState>,
    options?: { preserveStep?: boolean },
  ) => Promise<void>;
  setSelectedExtras: (extras: SelectedExtra[]) => void;
  updateOutboundSchedule: (
    outboundDate: string,
    outboundTime: string,
  ) => Promise<void>;
  updateLuggageCount: (largeLuggageCount: number) => Promise<void>;
  confirmVehicleSelection: () => Promise<void>;
  submitReservation: () => Promise<void>;
};

export const BookingFlowContext =
  createContext<BookingFlowContextValue | null>(null);

export function BookingFlowProvider({
  children,
  airports,
  cities,
  districts,
  acceptedPaymentCurrencies,
  initialSearch,
}: {
  children: ReactNode;
  airports: AirportDto[];
  cities: CityDto[];
  districts: DistrictDto[];
  acceptedPaymentCurrencies: AcceptedPaymentCurrency[];
  initialSearch?: Partial<BookingSearchState>;
}) {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const [state, dispatch] = useReducer(
    bookingFlowReducer,
    createInitialBookingFlowState(initialSearch),
  );
  const quoteRequestIdRef = useRef(0);

  useGlobalLoaderSync(
    state.isLoadingQuote || state.isSubmitting,
    tCommon("loading"),
  );

  const requestQuote = useCallback(
    async (
      searchOverride?: Partial<BookingSearchState>,
      options?: { preserveStep?: boolean },
    ) => {
      const search = { ...state.search, ...searchOverride };
      const requestId = ++quoteRequestIdRef.current;

      if (searchOverride) {
        dispatch({ type: "UPDATE_SEARCH", search: searchOverride });
      }

      dispatch({ type: "QUOTE_LOADING" });
      track({ name: "booking_search" });

      const body = buildQuoteRequest(search, locale);
      const result = await fetchTransferQuote(body);

      if (requestId !== quoteRequestIdRef.current) {
        return;
      }

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
        searchSignature: buildSearchSignature(search),
        preserveStep: options?.preserveStep,
      });
    },
    [locale, state.search],
  );

  const setSelectedExtras = useCallback((extras: SelectedExtra[]) => {
    dispatch({ type: "SET_EXTRAS", extras });
  }, []);

  const updateOutboundSchedule = useCallback(
    async (outboundDate: string, outboundTime: string) => {
      const search = { ...state.search, outboundDate, outboundTime };

      if (state.selectedVehicles.length === 0) {
        dispatch({ type: "UPDATE_SEARCH", search });
        return;
      }

      const requestId = ++quoteRequestIdRef.current;

      dispatch({
        type: "UPDATE_SEARCH",
        search: { outboundDate, outboundTime },
        preserveFlow: true,
      });
      dispatch({ type: "QUOTE_LOADING" });

      const body = buildQuoteRequest(search, locale, {
        vehicles: state.selectedVehicles,
        extras: state.selectedExtras,
      });

      const result = await fetchTransferQuote(body);

      if (requestId !== quoteRequestIdRef.current) {
        return;
      }

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
        searchSignature: buildSearchSignature(search),
        preserveStep: true,
      });
    },
    [
      locale,
      state.search,
      state.selectedExtras,
      state.selectedVehicles,
    ],
  );

  const confirmVehicleSelection = useCallback(async () => {
    if (!state.quote || state.selectedVehicles.length === 0) {
      return;
    }

    const requiredPassengers = getRequiredCapacityPassengerCount(state.search);

    if (
      !hasSufficientPassengerCapacity(
        state.selectedVehicles,
        state.quote.options,
        requiredPassengers,
      )
    ) {
      dispatch({
        type: "QUOTE_ERROR",
        errorKey: "errors.insufficientPassengerCapacity",
      });
      return;
    }

    const requestId = ++quoteRequestIdRef.current;

    dispatch({ type: "QUOTE_LOADING" });

    const body = buildQuoteRequest(state.search, locale, {
      vehicles: state.selectedVehicles,
      extras: [],
    });

    const result = await fetchTransferQuote(body);

    if (requestId !== quoteRequestIdRef.current) {
      return;
    }

    if (!result.success) {
      dispatch({
        type: "QUOTE_ERROR",
        errorKey: mapApiErrorToKey(result.error, result.status),
      });
      return;
    }

    if (result.data.selection?.eligibility === "INELIGIBLE") {
      dispatch({
        type: "QUOTE_ERROR",
        errorKey: "errors.vehicleUnavailable",
      });
      return;
    }

    dispatch({
      type: "QUOTE_SUCCESS",
      quote: result.data,
      searchSignature: buildSearchSignature(state.search),
      preserveStep: true,
    });
    dispatch({ type: "CONFIRM_VEHICLE_SELECTION" });
  }, [locale, state.quote, state.search, state.selectedVehicles]);

  const updateLuggageCount = useCallback(
    async (largeLuggageCount: number) => {
      const search = {
        ...state.search,
        largeLuggageCount,
        cabinLuggageCount: 0,
      };

      dispatch({
        type: "UPDATE_LUGGAGE",
        largeLuggageCount,
        cabinLuggageCount: 0,
      });

      if (state.selectedVehicles.length === 0 || !state.quote) {
        return;
      }

      const capacity = sumSelectedLargeLuggageCapacity(
        state.selectedVehicles,
        state.quote.options,
      );
      const previousCount = state.search.largeLuggageCount;
      const previouslyOverCapacity = previousCount > capacity;
      const nextOverCapacity = largeLuggageCount > capacity;
      const requiresRequote = previouslyOverCapacity || nextOverCapacity;

      if (!requiresRequote) {
        return;
      }

      const requestId = ++quoteRequestIdRef.current;

      dispatch({ type: "QUOTE_LOADING" });

      const body = buildQuoteRequest(search, locale, {
        vehicles: state.selectedVehicles,
        extras: state.selectedExtras,
      });

      const result = await fetchTransferQuote(body);

      if (requestId !== quoteRequestIdRef.current) {
        return;
      }

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
        searchSignature: buildSearchSignature(search),
        preserveStep: true,
      });
    },
    [
      locale,
      state.quote,
      state.search,
      state.selectedExtras,
      state.selectedVehicles,
    ],
  );

  const submitReservation = useCallback(async () => {
    if (!state.quote || state.selectedVehicles.length === 0) {
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

    const clientQuotedTotalMinor = buildOrderPricing(
      state.quote,
      state.selectedVehicles,
      state.selectedExtras,
    ).totalMinor;

    const body = {
      routeId: state.quote.routeId,
      originAirportId: state.search.originAirportId,
      destinationDistrictId: state.search.destinationDistrictId,
      isReverseDirection: state.search.isReverseDirection,
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
      passengerCount: getTotalPassengerCount(state.search),
      infantCount: state.search.infantCount,
      largeLuggageCount: state.search.largeLuggageCount,
      cabinLuggageCount: state.search.cabinLuggageCount,
      vehicles: state.selectedVehicles,
      extras: state.selectedExtras,
      customer: {
        firstName: state.customer.firstName,
        lastName: state.customer.lastName,
        email: state.customer.email,
        phone: formatInternationalPhone(
          state.customer.phoneCountryCode,
          state.customer.phone,
        ),
        whatsappPhone: state.customer.secondaryPhone.trim()
          ? formatInternationalPhone(
              state.customer.secondaryPhoneCountryCode,
              state.customer.secondaryPhone,
            )
          : undefined,
      },
      passengers: toReservationPassengerSnapshots(state.passengers),
      notes: state.notes.trim() || undefined,
      locale,
      clientQuotedTotalMinor,
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
      acceptedPaymentCurrencies,
      dispatch,
      requestQuote,
      setSelectedExtras,
      updateOutboundSchedule,
      updateLuggageCount,
      confirmVehicleSelection,
      submitReservation,
    }),
    [
      state,
      airports,
      cities,
      districts,
      acceptedPaymentCurrencies,
      requestQuote,
      setSelectedExtras,
      updateOutboundSchedule,
      updateLuggageCount,
      confirmVehicleSelection,
      submitReservation,
    ],
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

export function useBookingFlowOptional() {
  return useContext(BookingFlowContext);
}

export type { CustomerState, DestinationState, FlightState, SelectedExtra };
