import { describe, expect, it } from "vitest";

import {
  areCustomerDetailsValid,
  getCustomerValidationIssue,
  normalizeCustomerNameForApi,
} from "@/features/booking/lib/customer-details";
import type { CustomerState } from "@/features/booking/lib/types";

const baseCustomer: CustomerState = {
  fullName: "Ayşe Yılmaz",
  email: "ayse@example.com",
  phoneCountryCode: "TR",
  phone: "5321234567",
  secondaryPhoneCountryCode: "TR",
  secondaryPhone: "",
};

describe("normalizeCustomerNameForApi", () => {
  it("duplicates first name when only one word is provided", () => {
    expect(normalizeCustomerNameForApi("Ali")).toEqual({
      firstName: "Ali",
      lastName: "Ali",
    });
  });

  it("splits on the first space", () => {
    expect(normalizeCustomerNameForApi("Ayşe Yılmaz")).toEqual({
      firstName: "Ayşe",
      lastName: "Yılmaz",
    });
  });
});

describe("getCustomerValidationIssue", () => {
  it("flags missing full name", () => {
    expect(
      getCustomerValidationIssue({ ...baseCustomer, fullName: "" })?.errorKey,
    ).toBe("errors.customerName");
  });

  it("accepts valid customer details", () => {
    expect(areCustomerDetailsValid(baseCustomer)).toBe(true);
  });
});
