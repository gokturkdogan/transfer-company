import type {
  BookingFlowState,
  BookingSearchState,
  BookingStep,
  CustomerState,
  DestinationState,
  FlightState,
  SelectedExtra,
  SelectedVehicle,
} from "@/features/booking/lib/types";
import { adjustVehicleSelectionQuantity } from "@/features/booking/lib/vehicle-selection";
import type { PassengerDetails } from "@/features/booking/lib/passenger-details";
import type { TransferAvailabilityResponseDto } from "@/features/pricing/types/dto";
import type { ReservationResponseDto } from "@/features/pricing/types/dto";
import { buildSearchSignature } from "@/features/booking/lib/search-signature";
import { isLauncherSearchComplete } from "@/features/booking/lib/launcher-search";
import {
  buildPassengerSlots,
  syncPassengersWithSearch,
} from "@/features/booking/lib/passenger-details";
import {
  getDefaultDestinationState,
  getDefaultSearchState,
} from "@/features/booking/lib/error-messages";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone/countries";

export type BookingFlowAction =
  | { type: "SET_STEP"; step: BookingStep; idempotencyKey?: string }
  | {
      type: "UPDATE_SEARCH";
      search: Partial<BookingSearchState>;
      preserveFlow?: boolean;
    }
  | { type: "SET_AIRPORT"; airportId: string; cityId?: string }
  | { type: "SET_CITY"; cityId: string }
  | { type: "SET_DISTRICT"; districtId: string }
  | { type: "SWAP_ROUTE_DIRECTION" }
  | { type: "SET_TRIP_TYPE"; tripType: BookingSearchState["tripType"] }
  | { type: "SET_HOTEL"; hotelLocationId: string; hotelName: string }
  | { type: "SET_CUSTOM_DESTINATION"; destination: Partial<DestinationState> }
  | { type: "QUOTE_LOADING" }
  | {
      type: "QUOTE_SUCCESS";
      quote: TransferAvailabilityResponseDto;
      searchSignature: string;
      preserveStep?: boolean;
    }
  | { type: "QUOTE_ERROR"; errorKey: string }
  | { type: "SELECT_VEHICLE"; vehicleCategoryId: string; quantity: number }
  | {
      type: "ADJUST_VEHICLE_SELECTION";
      vehicleCategoryId: string;
      delta: number;
    }
  | { type: "CONFIRM_VEHICLE_SELECTION" }
  | { type: "SET_EXTRAS"; extras: SelectedExtra[] }
  | {
      type: "UPDATE_LUGGAGE";
      largeLuggageCount: number;
      cabinLuggageCount?: number;
    }
  | { type: "UPDATE_CUSTOMER"; customer: Partial<CustomerState> }
  | {
      type: "UPDATE_PASSENGER";
      kind: PassengerDetails["kind"];
      index: number;
      passenger: Partial<Pick<PassengerDetails, "fullName" | "idDocument">>;
    }
  | { type: "UPDATE_FLIGHT"; flight: Partial<FlightState> }
  | { type: "SET_NOTES"; notes: string }
  | { type: "ENSURE_IDEMPOTENCY_KEY"; key: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; reservation: ReservationResponseDto }
  | { type: "SUBMIT_ERROR"; errorKey: string }
  | { type: "CLEAR_ERROR" }
  | { type: "INVALIDATE_QUOTE" }
  | {
      type: "RESTORE_SEARCH_DRAFT";
      snapshot: {
        search: BookingSearchState;
        destination: DestinationState;
        quote: TransferAvailabilityResponseDto | null;
        searchSignature: string | null;
        selectedVehicles: SelectedVehicle[];
        selectedExtras: SelectedExtra[];
        passengers: PassengerDetails[];
        step?: BookingStep;
        customer?: CustomerState;
        flight?: FlightState;
        notes?: string;
        idempotencyKey?: string | null;
      };
    };

function clearQuoteState(state: BookingFlowState): BookingFlowState {
  return {
    ...state,
    quote: null,
    searchSignature: null,
    selectedVehicles: [],
    selectedExtras: [],
    idempotencyKey: null,
  };
}

function clearDestination(state: BookingFlowState): BookingFlowState {
  return {
    ...state,
    destination: getDefaultDestinationState(),
  };
}

function resolveInitialStep(search: BookingSearchState): BookingStep {
  if (isLauncherSearchComplete(search)) {
    return "vehicle";
  }

  if (search.originAirportId && search.destinationDistrictId) {
    return "vehicle";
  }

  return "search";
}

export function createInitialBookingFlowState(
  search?: Partial<BookingSearchState>,
): BookingFlowState {
  const mergedSearch = { ...getDefaultSearchState(), ...search };

  return {
    step: resolveInitialStep(mergedSearch),
    search: mergedSearch,
    destination: getDefaultDestinationState(),
    quote: null,
    searchSignature: null,
    selectedVehicles: [],
    selectedExtras: [],
    customer: {
      firstName: "",
      lastName: "",
      email: "",
      phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
      phone: "",
      secondaryPhoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
      secondaryPhone: "",
    },
    passengers: buildPassengerSlots(
      mergedSearch.passengerCount,
      mergedSearch.childCount,
      mergedSearch.infantCount,
    ),
    flight: {
      outboundFlightNumber: "",
      returnFlightNumber: "",
    },
    notes: "",
    idempotencyKey: null,
    reservation: null,
    isLoadingQuote: false,
    isSubmitting: false,
    errorKey: null,
    formStartedAt: Date.now(),
  };
}

function withSyncedPassengers(
  state: BookingFlowState,
  search: BookingSearchState,
): BookingFlowState {
  return {
    ...state,
    search,
    passengers: syncPassengersWithSearch(
      state.passengers,
      search.passengerCount,
      search.childCount,
      search.infantCount,
    ),
  };
}

function applySearchChange(
  state: BookingFlowState,
  search: BookingSearchState,
  _preserveFlow = false,
): BookingFlowState {
  // Draft search edits must not clear an existing quote. Results stay visible
  // until the user explicitly runs search (`requestQuote` → QUOTE_SUCCESS).
  return withSyncedPassengers({ ...state, errorKey: null }, search);
}

export function bookingFlowReducer(
  state: BookingFlowState,
  action: BookingFlowAction,
): BookingFlowState {
  switch (action.type) {
    case "SET_STEP": {
      const resolvedStep = action.step === "extras" ? "customer" : action.step;
      const next: BookingFlowState = {
        ...state,
        step: resolvedStep,
        errorKey: null,
      };

      if (
        resolvedStep === "review" &&
        next.idempotencyKey === null &&
        action.idempotencyKey
      ) {
        next.idempotencyKey = action.idempotencyKey;
      }

      return next;
    }

    case "UPDATE_SEARCH":
      return applySearchChange(
        state,
        { ...state.search, ...action.search },
        action.preserveFlow ?? false,
      );

    case "SET_AIRPORT": {
      const search: BookingSearchState = {
        ...state.search,
        originAirportId: action.airportId,
        cityId: action.cityId ?? "",
        destinationDistrictId: "",
      };

      return clearDestination(applySearchChange(state, search));
    }

    case "SET_CITY": {
      const search: BookingSearchState = {
        ...state.search,
        cityId: action.cityId,
        destinationDistrictId: "",
      };

      return clearDestination(applySearchChange(state, search));
    }

    case "SET_DISTRICT": {
      const search: BookingSearchState = {
        ...state.search,
        destinationDistrictId: action.districtId,
      };

      return clearDestination(applySearchChange(state, search));
    }

    case "SWAP_ROUTE_DIRECTION":
      return {
        ...state,
        search: {
          ...state.search,
          isReverseDirection: !state.search.isReverseDirection,
        },
      };

    case "SET_TRIP_TYPE": {
      const search: BookingSearchState = {
        ...state.search,
        tripType: action.tripType,
        returnDate: action.tripType === "ONE_WAY" ? "" : state.search.returnDate,
        returnTime: action.tripType === "ONE_WAY" ? "10:00" : state.search.returnTime,
      };

      return applySearchChange(state, search);
    }

    case "SET_HOTEL":
      return {
        ...state,
        destination: {
          hotelLocationId: action.hotelLocationId,
          hotelName: action.hotelName,
          useCustomDestination: false,
          customName: "",
          customAddress: "",
        },
      };

    case "SET_CUSTOM_DESTINATION":
      return {
        ...state,
        destination: {
          ...state.destination,
          ...action.destination,
          useCustomDestination: true,
          hotelLocationId: "",
        },
      };

    case "QUOTE_LOADING":
      return { ...state, isLoadingQuote: true, errorKey: null };

    case "QUOTE_SUCCESS":
      return {
        ...state,
        quote: action.quote,
        searchSignature: action.searchSignature,
        isLoadingQuote: false,
        step: action.preserveStep ? state.step : "vehicle",
        errorKey: null,
      };

    case "QUOTE_ERROR":
      return {
        ...state,
        isLoadingQuote: false,
        errorKey: action.errorKey,
      };

    case "SELECT_VEHICLE":
      return {
        ...state,
        selectedVehicles: [
          {
            vehicleCategoryId: action.vehicleCategoryId,
            quantity: action.quantity,
          },
        ],
        selectedExtras: [],
        step: "customer",
        errorKey: null,
      };

    case "ADJUST_VEHICLE_SELECTION":
      return {
        ...state,
        selectedVehicles: adjustVehicleSelectionQuantity(
          state.selectedVehicles,
          action.vehicleCategoryId,
          action.delta,
        ),
        selectedExtras: [],
        errorKey: null,
      };

    case "CONFIRM_VEHICLE_SELECTION":
      return {
        ...state,
        selectedExtras: [],
        step: "customer",
        errorKey: null,
      };

    case "SET_EXTRAS":
      return { ...state, selectedExtras: action.extras };

    case "UPDATE_LUGGAGE": {
      const search: BookingSearchState = {
        ...state.search,
        largeLuggageCount: action.largeLuggageCount,
        cabinLuggageCount: action.cabinLuggageCount ?? 0,
      };

      return {
        ...state,
        search,
        // Keep the current quote visible; capacity-safe luggage edits do not
        // need a requote. Overflow paths requote explicitly afterward.
        searchSignature: state.searchSignature
          ? buildSearchSignature(search)
          : null,
      };
    }

    case "UPDATE_CUSTOMER":
      return {
        ...state,
        customer: { ...state.customer, ...action.customer },
      };

    case "UPDATE_PASSENGER":
      return {
        ...state,
        passengers: state.passengers.map((passenger) =>
          passenger.kind === action.kind && passenger.index === action.index
            ? { ...passenger, ...action.passenger }
            : passenger,
        ),
      };

    case "UPDATE_FLIGHT":
      return {
        ...state,
        flight: { ...state.flight, ...action.flight },
      };

    case "SET_NOTES":
      return { ...state, notes: action.notes };

    case "ENSURE_IDEMPOTENCY_KEY":
      return {
        ...state,
        idempotencyKey: state.idempotencyKey ?? action.key,
      };

    case "SUBMIT_START":
      return { ...state, isSubmitting: true, errorKey: null };

    case "SUBMIT_SUCCESS":
      return {
        ...state,
        isSubmitting: false,
        reservation: action.reservation,
        step: "success",
        errorKey: null,
      };

    case "SUBMIT_ERROR":
      return {
        ...state,
        isSubmitting: false,
        errorKey: action.errorKey,
      };

    case "CLEAR_ERROR":
      return { ...state, errorKey: null };

    case "INVALIDATE_QUOTE":
      return {
        ...clearQuoteState(state),
        step: "vehicle",
      };

    case "RESTORE_SEARCH_DRAFT":
      return {
        ...state,
        step: action.snapshot.step ?? state.step,
        search: action.snapshot.search,
        destination: action.snapshot.destination,
        quote: action.snapshot.quote,
        searchSignature: action.snapshot.searchSignature,
        selectedVehicles: action.snapshot.selectedVehicles,
        selectedExtras: action.snapshot.selectedExtras,
        passengers: action.snapshot.passengers,
        customer: action.snapshot.customer ?? state.customer,
        flight: action.snapshot.flight ?? state.flight,
        notes: action.snapshot.notes ?? state.notes,
        idempotencyKey: action.snapshot.idempotencyKey ?? state.idempotencyKey,
        isLoadingQuote: false,
        isSubmitting: false,
        errorKey: null,
      };

    default:
      return state;
  }
}
