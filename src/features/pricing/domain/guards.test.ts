import { describe, expect, it } from "vitest";

import {
  assertRouteActive,
  assertRouteBookable,
} from "./guards";
import { PricingDomainError } from "./errors";

describe("route guards", () => {
  it("rejects invalid route", () => {
    expect(() =>
      assertRouteBookable(null, "origin", "destination"),
    ).toThrow(PricingDomainError);
  });

  it("rejects inactive route", () => {
    expect(() =>
      assertRouteActive({
        id: "route-1",
        originLocationId: "a",
        destinationLocationId: "b",
        isActive: false,
      }),
    ).toThrow(PricingDomainError);
  });

  it("rejects route that does not match locations", () => {
    expect(() =>
      assertRouteBookable(
        {
          id: "route-1",
          originLocationId: "a",
          destinationLocationId: "b",
          isActive: true,
        },
        "x",
        "y",
      ),
    ).toThrow(PricingDomainError);
  });
});
