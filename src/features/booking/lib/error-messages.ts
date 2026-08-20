import type { ApiError } from "@/features/booking/lib/types";
import type { BookingSearchState } from "@/features/booking/lib/types";
import { getDefaultDestinationState } from "@/features/booking/lib/types";

export function mapApiErrorToKey(
  error: ApiError,
  status: number,
): string {
  if (status === 429) {
    return "errors.rateLimit";
  }

  if (status === 409) {
    return "errors.quoteChanged";
  }

  if (error.code === "VALIDATION_ERROR") {
    const fieldErrors = error.fieldErrors ?? {};

    if (fieldErrors.customer?.length) {
      return "errors.customerDetails";
    }

    if (fieldErrors.passengers?.length) {
      return "errors.passengerDetails";
    }

    if (fieldErrors.outboundAt?.length || fieldErrors.returnAt?.length) {
      return "errors.schedule";
    }

    if (fieldErrors.returnFlightNumber?.length) {
      return "errors.returnFlightNumber";
    }

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

export function mapErrorKeyToFieldHighlight(
  errorKey: string,
): "customer.fullName" | "customer.email" | "customer.phone" | "passengers" | null {
  switch (errorKey) {
    case "errors.customerName":
    case "errors.customerDetails":
      return "customer.fullName";
    case "errors.customerEmail":
      return "customer.email";
    case "errors.customerPhone":
      return "customer.phone";
    case "errors.passengerDetails":
      return "passengers";
    default:
      return null;
  }
}

export function getDefaultSearchState(): BookingSearchState {
  return {
    originAirportId: "",
    cityId: "",
    destinationDistrictId: "",
    isReverseDirection: false,
    tripType: "ONE_WAY",
    outboundDate: "",
    outboundTime: "10:00",
    returnDate: "",
    returnTime: "10:00",
    passengerCount: 2,
    childCount: 0,
    infantCount: 0,
    largeLuggageCount: 0,
    cabinLuggageCount: 0,
  };
}

export { getDefaultDestinationState };
