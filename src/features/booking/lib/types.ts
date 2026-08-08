import type { TripType } from "@/db/schema/enums";
import type { TransferAvailabilityResponseDto } from "@/features/pricing/types/dto";
import type { ReservationResponseDto } from "@/features/pricing/types/dto";
import type { ActionResult } from "@/server/result";

export type BookingStep =
  | "search"
  | "vehicle"
  | "extras"
  | "customer"
  | "review"
  | "success";

export type BookingSearchState = {
  originAirportId: string;
  cityId: string;
  destinationDistrictId: string;
  tripType: TripType;
  outboundDate: string;
  outboundTime: string;
  returnDate: string;
  returnTime: string;
  passengerCount: number;
  childCount: number;
  largeLuggageCount: number;
  cabinLuggageCount: number;
};

export type DestinationState = {
  hotelLocationId: string;
  hotelName: string;
  useCustomDestination: boolean;
  customName: string;
  customAddress: string;
};

export type CustomerState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappPhone: string;
};

export type FlightState = {
  outboundFlightNumber: string;
  returnFlightNumber: string;
};

export type SelectedExtra = {
  extraServiceId: string;
  quantity: number;
};

export type BookingFlowState = {
  step: BookingStep;
  search: BookingSearchState;
  destination: DestinationState;
  quote: TransferAvailabilityResponseDto | null;
  searchSignature: string | null;
  selectedVehicleCategoryId: string | null;
  selectedQuantity: number;
  selectedExtras: SelectedExtra[];
  customer: CustomerState;
  flight: FlightState;
  notes: string;
  idempotencyKey: string | null;
  reservation: ReservationResponseDto | null;
  isLoadingQuote: boolean;
  isSubmitting: boolean;
  errorKey: string | null;
  formStartedAt: number;
};

export type QuoteRequestBody = {
  originAirportId: string;
  destinationDistrictId: string;
  tripType: TripType;
  outboundAt: string;
  returnAt?: string;
  passengerCount: number;
  largeLuggageCount: number;
  cabinLuggageCount: number;
  locale: string;
  selection?: {
    vehicleCategoryId: string;
    quantity: number;
    extras: SelectedExtra[];
  };
};

export type ReservationRequestBody = {
  routeId: string;
  originAirportId: string;
  destinationDistrictId: string;
  hotelLocationId?: string;
  customDestination?: {
    name: string;
    address?: string;
  };
  tripType: TripType;
  outboundAt: string;
  returnAt?: string;
  outboundFlightNumber?: string;
  returnFlightNumber?: string;
  passengerCount: number;
  largeLuggageCount: number;
  cabinLuggageCount: number;
  vehicles: Array<{ vehicleCategoryId: string; quantity: number }>;
  extras: SelectedExtra[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsappPhone?: string;
  };
  notes?: string;
  locale: string;
  clientQuotedTotalMinor?: number;
  website?: string;
  formStartedAt?: number;
};

export type ApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type FetchResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError; status: number };

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<FetchResult<T>> {
  try {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const body = (await response.json()) as ActionResult<T>;

    if (!body.success) {
      return {
        success: false,
        error: body.error,
        status: response.status,
      };
    }

    return { success: true, data: body.data };
  } catch {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Network error" },
      status: 0,
    };
  }
}

export function getDefaultDestinationState(): DestinationState {
  return {
    hotelLocationId: "",
    hotelName: "",
    useCustomDestination: false,
    customName: "",
    customAddress: "",
  };
}
