import type { BookingFlowState } from "@/features/booking/lib/types";
import { getCustomerValidationIssue } from "@/features/booking/lib/customer-details";
import { arePassengerDetailsValid } from "@/features/booking/lib/passenger-details";

export function getCustomerStepValidationIssue(
  state: Pick<BookingFlowState, "customer" | "passengers">,
): {
  errorKey: string;
  fieldHighlight:
    | "customer.fullName"
    | "customer.email"
    | "customer.phone"
    | "passengers";
} | null {
  const customerIssue = getCustomerValidationIssue(state.customer);

  if (customerIssue) {
    return {
      errorKey: customerIssue.errorKey,
      fieldHighlight: `customer.${customerIssue.field}`,
    };
  }

  if (!arePassengerDetailsValid(state.passengers)) {
    return {
      errorKey: "errors.passengerDetails",
      fieldHighlight: "passengers",
    };
  }

  return null;
}

export function canProceedFromCustomerStep(
  state: Pick<BookingFlowState, "customer" | "passengers">,
): boolean {
  return getCustomerStepValidationIssue(state) === null;
}
