import { assessVehicleCapacity } from "./assess-capacity";
import type {
  VehicleCategoryCapacity,
  VehicleRecommendation,
} from "../types";

export type RecommendVehiclesInput = {
  passengerCount: number;
  largeLuggageCount: number;
  cabinLuggageCount: number;
  vehicleCategories: VehicleCategoryCapacity[];
};

function minimumVehicleQuantity(
  passengerCount: number,
  passengerCapacity: number,
): number {
  return Math.ceil(passengerCount / passengerCapacity);
}

export type RecommendVehiclesOptions = {
  includeIneligible?: boolean;
};

export function recommendVehicles(
  input: RecommendVehiclesInput,
  options: RecommendVehiclesOptions = {},
): VehicleRecommendation[] {
  const { includeIneligible = false } = options;
  const recommendations: VehicleRecommendation[] = [];

  for (const category of input.vehicleCategories) {
    if (!category.isActive) {
      continue;
    }

    const quantity = minimumVehicleQuantity(
      input.passengerCount,
      category.passengerCapacity,
    );

    const assessment = assessVehicleCapacity({
      vehicleQuantity: quantity,
      passengerCount: input.passengerCount,
      largeLuggageCount: input.largeLuggageCount,
      cabinLuggageCount: input.cabinLuggageCount,
      passengerCapacity: category.passengerCapacity,
      largeLuggageCapacity: category.largeLuggageCapacity,
      cabinLuggageCapacity: category.cabinLuggageCapacity,
    });

    if (assessment.eligibility === "INELIGIBLE" && !includeIneligible) {
      continue;
    }

    recommendations.push({
      vehicleCategoryId: category.id,
      vehicleCategoryName: category.name,
      quantity,
      assessment,
    });
  }

  return recommendations.sort((a, b) => {
    if (a.assessment.eligibility === "INELIGIBLE" && b.assessment.eligibility !== "INELIGIBLE") {
      return 1;
    }

    if (b.assessment.eligibility === "INELIGIBLE" && a.assessment.eligibility !== "INELIGIBLE") {
      return -1;
    }

    if (a.quantity !== b.quantity) {
      return a.quantity - b.quantity;
    }

    return a.vehicleCategoryName.localeCompare(b.vehicleCategoryName);
  });
}
