import type { CustomerState } from "@/features/booking/lib/types";
import { parseFullName } from "@/features/booking/lib/parse-full-name";
import { sanitizeNationalPhoneNumber } from "@/lib/phone/format";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CustomerFieldHighlight = "fullName" | "email" | "phone";

export function normalizeCustomerNameForApi(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const { firstName, lastName } = parseFullName(trimmed);
  const normalizedFirst = firstName.trim();
  const normalizedLast = lastName.trim();

  return {
    firstName: normalizedFirst,
    lastName: normalizedLast || normalizedFirst,
  };
}

export function getCustomerValidationIssue(
  customer: CustomerState,
): { errorKey: string; field: CustomerFieldHighlight } | null {
  if (!customer.fullName.trim()) {
    return { errorKey: "errors.customerName", field: "fullName" };
  }

  const email = customer.email.trim();

  if (!email || !EMAIL_PATTERN.test(email)) {
    return { errorKey: "errors.customerEmail", field: "email" };
  }

  if (sanitizeNationalPhoneNumber(customer.phone).length < 5) {
    return { errorKey: "errors.customerPhone", field: "phone" };
  }

  return null;
}

export function areCustomerDetailsValid(customer: CustomerState): boolean {
  return getCustomerValidationIssue(customer) === null;
}
