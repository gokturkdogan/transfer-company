import type { BookingSearchState } from "@/features/booking/lib/types";
import { getDefaultDestinationState } from "@/features/booking/lib/types";

export function mapApiErrorToKey(
  error: { code: string; message: string },
  status: number,
): string {
  if (status === 429) {
    return "errors.rateLimit";
  }

  if (status === 409) {
    return "errors.quoteChanged";
  }

  if (error.code === "VALIDATION_ERROR") {
    return "errors.validation";
  }

  if (error.message.includes("No vehicle options")) {
    return "errors.noVehicles";
  }

  if (error.message.includes("Route not found") || error.message.includes("not active")) {
    return "errors.noRoute";
  }

  if (error.message.includes("not eligible") || error.message.includes("not active")) {
    return "errors.vehicleUnavailable";
  }

  if (error.code === "NETWORK_ERROR") {
    return "errors.network";
  }

  return "errors.generic";
}

export function getDefaultSearchState(): BookingSearchState {
  return {
    originAirportId: "",
    cityId: "",
    destinationDistrictId: "",
    tripType: "ONE_WAY",
    outboundDate: "",
    outboundTime: "10:00",
    returnDate: "",
    returnTime: "10:00",
    passengerCount: 2,
    childCount: 0,
    largeLuggageCount: 0,
    cabinLuggageCount: 0,
  };
}

export { getDefaultDestinationState };
