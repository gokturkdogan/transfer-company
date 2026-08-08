import { PricingDomainError } from "./errors";

export type RouteRecord = {
  id: string;
  originLocationId: string;
  destinationLocationId: string;
  isActive: boolean;
};

export type RoutePriceRecord = {
  routeId: string;
  vehicleCategoryId: string;
  oneWayPriceMinor: number;
  roundTripPriceMinor: number | null;
  currency: string;
  isActive: boolean;
};

export type VehicleCategoryRecord = {
  id: string;
  isActive: boolean;
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
  defaultName: string;
};

export type ExtraServiceRecord = {
  id: string;
  isActive: boolean;
  currency: string;
  minQuantity: number;
  maxQuantity: number | null;
  customerSelectable: boolean;
};

export function assertRouteActive(
  route: RouteRecord | null | undefined,
): asserts route is RouteRecord {
  if (!route) {
    throw new PricingDomainError("Route not found");
  }

  if (!route.isActive) {
    throw new PricingDomainError("Route is not active");
  }
}

export function assertRouteBookable(
  route: RouteRecord | null | undefined,
  originLocationId: string,
  destinationLocationId: string,
): asserts route is RouteRecord {
  if (!route) {
    throw new PricingDomainError("Route not found for the selected locations");
  }

  if (!route.isActive) {
    throw new PricingDomainError("Route is not active");
  }

  if (
    route.originLocationId !== originLocationId ||
    route.destinationLocationId !== destinationLocationId
  ) {
    throw new PricingDomainError("Route does not match selected locations");
  }
}

export function assertVehicleBookable(
  vehicle: VehicleCategoryRecord | null | undefined,
): asserts vehicle is VehicleCategoryRecord {
  if (!vehicle) {
    throw new PricingDomainError("Vehicle category not found");
  }

  if (!vehicle.isActive) {
    throw new PricingDomainError("Vehicle category is not active");
  }
}

export function assertRoutePriceBookable(
  price: RoutePriceRecord | null | undefined,
  routeId: string,
  vehicleCategoryId: string,
): asserts price is RoutePriceRecord {
  if (!price) {
    throw new PricingDomainError(
      "No price configured for this route and vehicle category",
    );
  }

  if (!price.isActive) {
    throw new PricingDomainError("Route price is not active");
  }

  if (price.routeId !== routeId || price.vehicleCategoryId !== vehicleCategoryId) {
    throw new PricingDomainError("Route price does not match selection");
  }
}

export function assertExtraCustomerSelectable(
  extra: ExtraServiceRecord | null | undefined,
): asserts extra is ExtraServiceRecord {
  if (!extra) {
    throw new PricingDomainError("Extra service not found");
  }

  if (!extra.customerSelectable) {
    throw new PricingDomainError("Extra service is not customer selectable");
  }
}

export function assertExtraBookable(
  extra: ExtraServiceRecord | null | undefined,
  quantity: number,
): asserts extra is ExtraServiceRecord {
  if (!extra) {
    throw new PricingDomainError("Extra service not found");
  }

  if (!extra.isActive) {
    throw new PricingDomainError("Extra service is not active");
  }

  if (quantity < extra.minQuantity) {
    throw new PricingDomainError(
      `Extra service quantity must be at least ${extra.minQuantity}`,
    );
  }

  if (extra.maxQuantity !== null && quantity > extra.maxQuantity) {
    throw new PricingDomainError(
      `Extra service quantity cannot exceed ${extra.maxQuantity}`,
    );
  }
}

export function assertCurrencyConsistency(
  expectedCurrency: string,
  actualCurrency: string,
  context: string,
): void {
  if (expectedCurrency !== actualCurrency) {
    throw new PricingDomainError(
      `Currency mismatch for ${context}: expected ${expectedCurrency}, got ${actualCurrency}`,
    );
  }
}
