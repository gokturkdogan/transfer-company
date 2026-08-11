import type {
  ExtraServiceRecord,
  RoutePriceRecord,
  RouteRecord,
  VehicleCategoryRecord,
} from "@/features/pricing/domain/guards";

export type VehicleOptionRecord = VehicleCategoryRecord & {
  code: string;
  defaultName: string;
  imageKey: string | null;
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
  sortOrder: number;
  translatedName: string | null;
  oneWayPriceMinor: number;
  roundTripPriceMinor: number | null;
  currency: string;
  priceIsActive: boolean;
};

export type VehiclePresentationRecord = {
  id: string;
  code: string;
  imageKey: string | null;
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
};

export type ExtraServiceWithTranslation = ExtraServiceRecord & {
  code: string;
  pricingMode: "FIXED" | "PER_UNIT";
  priceMinor: number;
  autoSuggested: boolean;
  luggageCapacityPerUnit: number | null;
  translatedName: string | null;
};

export type PricingReader = {
  findRouteById(routeId: string): Promise<RouteRecord | null>;
  findActiveRouteByAirportAndDistrict(
    originAirportId: string,
    destinationDistrictId: string,
  ): Promise<RouteRecord | null>;
  findRoutePrice(
    routeId: string,
    vehicleCategoryId: string,
    currency: string,
  ): Promise<RoutePriceRecord | null>;
  findVehicleCategoryById(
    vehicleCategoryId: string,
  ): Promise<VehicleCategoryRecord | null>;
  findVehicleCategoryTranslation(
    vehicleCategoryId: string,
    locale: string,
  ): Promise<{ name: string } | null>;
  findVehicleOptionsForRoute(
    routeId: string,
    locale: string,
    currency: string,
  ): Promise<VehicleOptionRecord[]>;
  findVehiclePresentationsByIds(
    vehicleCategoryIds: string[],
  ): Promise<VehiclePresentationRecord[]>;
  findExtraServiceById(extraServiceId: string): Promise<ExtraServiceWithTranslation | null>;
  findExtraServiceTranslation(
    extraServiceId: string,
    locale: string,
  ): Promise<{ name: string } | null>;
  findExtraServicesByIds(
    extraServiceIds: string[],
    locale: string,
  ): Promise<ExtraServiceWithTranslation[]>;
  findCustomerSelectableExtras(locale: string): Promise<ExtraServiceWithTranslation[]>;
  findLuggageVehicleExtras(locale: string): Promise<ExtraServiceWithTranslation[]>;
  findChildSeatExtra(locale: string): Promise<ExtraServiceWithTranslation | null>;
};
