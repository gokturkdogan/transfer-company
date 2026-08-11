"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  bookingFlowReducer,
  createInitialBookingFlowState,
  type BookingFlowAction,
} from "@/features/booking/lib/booking-flow-reducer";
import { fetchReservation, fetchTransferQuote } from "@/features/booking/lib/api";
import { mapApiErrorToKey } from "@/features/booking/lib/error-messages";
import { appendPassengerDetailsToNotes } from "@/features/booking/lib/passenger-details";
import { formatInternationalPhone } from "@/lib/phone/format";
import { getTotalPassengerCount } from "@/features/booking/lib/passenger-count";
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
  requestRequote: (extras: SelectedExtra[]) => Promise<void>;
  updateOutboundSchedule: (
    outboundDate: string,
    outboundTime: string,
  ) => Promise<void>;
  updateLuggageCount: (largeLuggageCount: number) => Promise<void>;
  submitReservation: () => Promise<void>;
};

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

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
  const tPassengers = useTranslations("booking.passengers");
  const [state, dispatch] = useReducer(
    bookingFlowReducer,
    createInitialBookingFlowState(initialSearch),
  );

  const requestQuote = useCallback(
    async (
      searchOverride?: Partial<BookingSearchState>,
      options?: { preserveStep?: boolean },
    ) => {
      const search = { ...state.search, ...searchOverride };

      if (searchOverride) {
        dispatch({ type: "UPDATE_SEARCH", search: searchOverride });
      }

      dispatch({ type: "QUOTE_LOADING" });
      track({ name: "booking_search" });

      const body = buildQuoteRequest(search, locale);
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
        searchSignature: buildSearchSignature(search),
        preserveStep: options?.preserveStep,
      });
    },
    [locale, state.search],
  );

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
        preserveStep: true,
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

  const updateOutboundSchedule = useCallback(
    async (outboundDate: string, outboundTime: string) => {
      const search = { ...state.search, outboundDate, outboundTime };

      if (!state.selectedVehicleCategoryId) {
        dispatch({ type: "UPDATE_SEARCH", search });
        return;
      }

      dispatch({
        type: "UPDATE_SEARCH",
        search: { outboundDate, outboundTime },
        preserveFlow: true,
      });
      dispatch({ type: "QUOTE_LOADING" });

      const body = buildQuoteRequest(search, locale, {
        vehicleCategoryId: state.selectedVehicleCategoryId,
        quantity: state.selectedQuantity,
        extras: state.selectedExtras,
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
        searchSignature: buildSearchSignature(search),
        preserveStep: true,
      });
    },
    [
      locale,
      state.search,
      state.selectedExtras,
      state.selectedQuantity,
      state.selectedVehicleCategoryId,
    ],
  );

  const updateLuggageCount = useCallback(
    async (largeLuggageCount: number) => {
      const search = {
        ...state.search,
        largeLuggageCount,
        cabinLuggageCount: 0,
      };

      if (!state.selectedVehicleCategoryId) {
        dispatch({ type: "UPDATE_SEARCH", search, preserveFlow: true });
        return;
      }

      dispatch({
        type: "UPDATE_SEARCH",
        search: { largeLuggageCount, cabinLuggageCount: 0 },
        preserveFlow: true,
      });
      dispatch({ type: "QUOTE_LOADING" });

      const body = buildQuoteRequest(search, locale, {
        vehicleCategoryId: state.selectedVehicleCategoryId,
        quantity: state.selectedQuantity,
        extras: state.selectedExtras,
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
        searchSignature: buildSearchSignature(search),
        preserveStep: true,
      });
    },
    [
      locale,
      state.search,
      state.selectedExtras,
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
      notes: appendPassengerDetailsToNotes(
        state.passengers,
        (passenger) =>
          passenger.kind === "adult"
            ? tPassengers("adultLabel", { index: passenger.index })
            : tPassengers("childLabel", { index: passenger.index }),
        tPassengers("notesSectionTitle"),
        state.notes,
      ),
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
  }, [locale, state, tPassengers]);

  const value = useMemo(
    () => ({
      state,
      airports,
      cities,
      districts,
      acceptedPaymentCurrencies,
      dispatch,
      requestQuote,
      requestRequote,
      updateOutboundSchedule,
      updateLuggageCount,
      submitReservation,
    }),
    [
      state,
      airports,
      cities,
      districts,
      acceptedPaymentCurrencies,
      requestQuote,
      requestRequote,
      updateOutboundSchedule,
      updateLuggageCount,
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

export type { CustomerState, DestinationState, FlightState, SelectedExtra };
