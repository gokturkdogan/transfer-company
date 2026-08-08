import { describe, expect, it } from "vitest";

import {
  assertHotelInDistrict,
  assertPriceableEndpoints,
  assertValidParent,
} from "@/features/locations/domain/hierarchy";
import { LocationDomainError } from "@/features/locations/domain/errors";

describe("location hierarchy", () => {
  it("allows city with null parent", () => {
    expect(() => assertValidParent("CITY", null)).not.toThrow();
  });

  it("allows district under city", () => {
    expect(() => assertValidParent("DISTRICT", "CITY")).not.toThrow();
  });

  it("allows hotel under district", () => {
    expect(() => assertValidParent("HOTEL", "DISTRICT")).not.toThrow();
  });

  it("rejects invalid hierarchy such as hotel under airport", () => {
    expect(() => assertValidParent("HOTEL", "AIRPORT")).toThrow(
      LocationDomainError,
    );
  });

  it("rejects district under hotel", () => {
    expect(() => assertValidParent("DISTRICT", "HOTEL")).toThrow(
      LocationDomainError,
    );
  });

  it("asserts hotel belongs to district", () => {
    expect(() =>
      assertHotelInDistrict(
        {
          id: "hotel-1",
          type: "HOTEL",
          parentId: "district-1",
          isActive: true,
        },
        "district-1",
      ),
    ).not.toThrow();
  });

  it("rejects hotel from another district", () => {
    expect(() =>
      assertHotelInDistrict(
        {
          id: "hotel-1",
          type: "HOTEL",
          parentId: "district-2",
          isActive: true,
        },
        "district-1",
      ),
    ).toThrow(LocationDomainError);
  });

  it("requires airport to district for priceable routes", () => {
    expect(() =>
      assertPriceableEndpoints(
        {
          id: "airport-1",
          type: "AIRPORT",
          parentId: "city-1",
          isActive: true,
        },
        {
          id: "district-1",
          type: "DISTRICT",
          parentId: "city-1",
          isActive: true,
        },
      ),
    ).not.toThrow();
  });

  it("rejects hotel as pricing destination", () => {
    expect(() =>
      assertPriceableEndpoints(
        {
          id: "airport-1",
          type: "AIRPORT",
          parentId: null,
          isActive: true,
        },
        {
          id: "hotel-1",
          type: "HOTEL",
          parentId: "district-1",
          isActive: true,
        },
      ),
    ).toThrow(LocationDomainError);
  });
});
