import type { VehicleOptionRecord } from "@/features/pricing/server/reader";
import type { LuggageFleetVehicleCandidate } from "@/features/capacity/domain/select-cheapest-luggage-fleet-vehicle";

export function mapVehicleOptionsToLuggageFleetCandidates(
  options: VehicleOptionRecord[],
): LuggageFleetVehicleCandidate[] {
  return options.map((option) => ({
    vehicleCategoryId: option.id,
    vehicleCategoryName: option.translatedName ?? option.defaultName,
    largeLuggageCapacity: option.largeLuggageCapacity,
    oneWayPriceMinor: option.oneWayPriceMinor,
    roundTripPriceMinor: option.roundTripPriceMinor,
    priceIsActive: option.priceIsActive,
  }));
}
