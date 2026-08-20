import type { BookingFlowState } from "@/features/booking/lib/types";
import { getCustomerValidationIssue } from "@/features/booking/lib/customer-details";
import { arePassengerDetailsValid } from "@/features/booking/lib/passenger-details";
import { getTransferValidationIssue } from "@/features/booking/lib/transfer-step-validation";

export function getCustomerStepValidationIssue(
  state: Pick<BookingFlowState, "customer" | "passengers" | "search" | "flight">,
): {
  errorKey: string;
  fieldHighlight:
    | "customer.fullName"
    | "customer.email"
    | "customer.phone"
    | "passengers"
    | "transfer.returnSchedule"
    | "transfer.returnFlightNumber";
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

  const transferIssue = getTransferValidationIssue(state);

  if (transferIssue) {
    return transferIssue;
  }

  return null;
}

export function canProceedFromCustomerStep(
  state: Pick<BookingFlowState, "customer" | "passengers" | "search" | "flight">,
): boolean {
  return getCustomerStepValidationIssue(state) === null;
}
