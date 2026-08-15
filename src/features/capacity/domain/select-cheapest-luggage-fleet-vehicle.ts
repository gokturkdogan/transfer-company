import type { TripType } from "@/features/pricing/types";

export type LuggageFleetVehicleCandidate = {
  vehicleCategoryId: string;
  vehicleCategoryName: string;
  largeLuggageCapacity: number;
  oneWayPriceMinor: number;
  roundTripPriceMinor: number | null;
  priceIsActive: boolean;
};

export type LuggageFleetVehicleSelection = {
  vehicleCategoryId: string;
  vehicleCategoryName: string;
  quantity: number;
  largeLuggageCapacity: number;
  unitPriceMinor: number;
  totalPriceMinor: number;
};

function resolveUnitPriceMinor(
  candidate: LuggageFleetVehicleCandidate,
  tripType: TripType,
): number | null {
  if (tripType === "ONE_WAY") {
    return candidate.oneWayPriceMinor;
  }

  return candidate.roundTripPriceMinor;
}

/**
 * Picks the cheapest route-priced fleet vehicle(s) that can carry luggage overflow.
 * Cost = route matrix price × quantity needed (ceil(overflow / large luggage capacity)).
 */
export function selectCheapestLuggageFleetVehicle(
  overflow: number,
  candidates: LuggageFleetVehicleCandidate[],
  tripType: TripType,
): LuggageFleetVehicleSelection | null {
  if (overflow <= 0) {
    return null;
  }

  let best: LuggageFleetVehicleSelection | null = null;

  for (const candidate of candidates) {
    if (!candidate.priceIsActive || candidate.largeLuggageCapacity <= 0) {
      continue;
    }

    const unitPriceMinor = resolveUnitPriceMinor(candidate, tripType);
    if (unitPriceMinor === null) {
      continue;
    }

    const quantity = Math.ceil(overflow / candidate.largeLuggageCapacity);
    const totalPriceMinor = unitPriceMinor * quantity;

    if (
      !best ||
      totalPriceMinor < best.totalPriceMinor ||
      (totalPriceMinor === best.totalPriceMinor && quantity < best.quantity)
    ) {
      best = {
        vehicleCategoryId: candidate.vehicleCategoryId,
        vehicleCategoryName: candidate.vehicleCategoryName,
        quantity,
        largeLuggageCapacity: candidate.largeLuggageCapacity,
        unitPriceMinor,
        totalPriceMinor,
      };
    }
  }

  return best;
}
