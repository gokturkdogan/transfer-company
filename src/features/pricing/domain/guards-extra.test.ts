import { describe, expect, it } from "vitest";

import {
  assertExtraBookable,
  assertExtraCustomerSelectable,
} from "./guards";
import { PricingDomainError } from "./errors";

const baseExtra = {
  id: "extra-1",
  isActive: true,
  currency: "EUR",
  minQuantity: 1,
  maxQuantity: 5,
  includedQuantity: 0,
  customerSelectable: true,
};

describe("extra guards", () => {
  it("rejects non-customer-selectable extras", () => {
    expect(() =>
      assertExtraCustomerSelectable({
        ...baseExtra,
        customerSelectable: false,
      }),
    ).toThrow(PricingDomainError);
  });

  it("rejects invalid extra quantity", () => {
    expect(() => assertExtraBookable(baseExtra, 10)).toThrow(
      PricingDomainError,
    );
  });
});
