import type { PricingReader } from "@/features/pricing/server/reader";

export function createPricingReaderFake(
  overrides: Partial<PricingReader> = {},
): PricingReader {
  const route = {
    id: "route-1",
    originLocationId: "pickup-1",
    destinationLocationId: "dropoff-1",
    isActive: true,
  };

  const vehicle = {
    id: "vehicle-1",
    code: "SEDAN",
    isActive: true,
    defaultName: "Sedan",
    imageKey: null,
    passengerCapacity: 4,
    largeLuggageCapacity: 4,
    cabinLuggageCapacity: 2,
  };

  const price = {
    routeId: "route-1",
    vehicleCategoryId: "vehicle-1",
    oneWayPriceMinor: 10_000,
    roundTripPriceMinor: 18_000,
    currency: "EUR",
    isActive: true,
  };

  const luggageExtra = {
    id: "luggage-extra-1",
    code: "LUGGAGE_VAN",
    pricingMode: "PER_UNIT" as const,
    priceMinor: 2_500,
    currency: "EUR",
    customerSelectable: false,
    autoSuggested: true,
    minQuantity: 1,
    maxQuantity: 5,
    includedQuantity: 0,
    luggageCapacityPerUnit: 10,
    isActive: true,
    translatedName: "Luggage Van",
  };

  const optionalExtra = {
    id: "child-seat-1",
    code: "CHILD_SEAT",
    pricingMode: "PER_UNIT" as const,
    priceMinor: 500,
    currency: "EUR",
    customerSelectable: true,
    autoSuggested: false,
    minQuantity: 0,
    maxQuantity: 3,
    includedQuantity: 1,
    luggageCapacityPerUnit: null,
    isActive: true,
    translatedName: "Child Seat",
  };

  return {
    findRouteById: async () => route,
    findActiveRouteByAirportAndDistrict: async () => route,
    findRoutePrice: async () => price,
    findVehicleCategoryById: async () => vehicle,
    findVehicleCategoryTranslation: async () => ({ name: "Sedan" }),
    findVehiclePresentationsByIds: async (ids) =>
      ids.includes(vehicle.id)
        ? [
            {
              id: vehicle.id,
              code: vehicle.code,
              imageKey: vehicle.imageKey,
              passengerCapacity: vehicle.passengerCapacity,
              largeLuggageCapacity: vehicle.largeLuggageCapacity,
              cabinLuggageCapacity: vehicle.cabinLuggageCapacity,
            },
          ]
        : [],
    findVehicleOptionsForRoute: async () => [
      {
        ...vehicle,
        sortOrder: 0,
        translatedName: "Sedan",
        oneWayPriceMinor: 10_000,
        roundTripPriceMinor: 18_000,
        currency: "EUR",
        priceIsActive: true,
      },
    ],
    findExtraServiceById: async (id) => {
      if (id === luggageExtra.id) {
        return luggageExtra;
      }

      if (id === optionalExtra.id) {
        return optionalExtra;
      }

      return null;
    },
    findExtraServiceTranslation: async () => ({ name: "Extra" }),
    findExtraServicesByIds: async (ids) =>
      [luggageExtra, optionalExtra].filter((extra) => ids.includes(extra.id)),
    findCustomerSelectableExtras: async () => [optionalExtra],
    findLuggageVehicleExtras: async (_locale: string) => [luggageExtra],
    findChildSeatExtra: async () => optionalExtra,
    ...overrides,
  };
}
