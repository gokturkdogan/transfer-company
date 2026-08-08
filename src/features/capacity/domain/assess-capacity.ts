import type {
  CapacityAssessment,
  CapacityWarning,
  VehicleCapacityInput,
} from "../types";

function ceilDivision(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    throw new Error("Denominator must be positive");
  }

  return Math.ceil(numerator / denominator);
}

export function assessVehicleCapacity(
  input: VehicleCapacityInput,
): CapacityAssessment {
  const warnings: CapacityWarning[] = [];

  const totalPassengerCapacity = input.passengerCapacity * input.vehicleQuantity;
  const totalLargeLuggageCapacity =
    input.largeLuggageCapacity * input.vehicleQuantity;
  const totalCabinLuggageCapacity =
    input.cabinLuggageCapacity * input.vehicleQuantity;

  const passengerOverflow = Math.max(
    0,
    input.passengerCount - totalPassengerCapacity,
  );
  const largeLuggageOverflow = Math.max(
    0,
    input.largeLuggageCount - totalLargeLuggageCapacity,
  );
  const cabinLuggageOverflow = Math.max(
    0,
    input.cabinLuggageCount - totalCabinLuggageCapacity,
  );

  if (passengerOverflow > 0) {
    warnings.push({
      code: "PASSENGER_OVERFLOW",
      message: `Passenger count exceeds vehicle capacity by ${passengerOverflow}`,
    });

    return {
      eligibility: "INELIGIBLE",
      passengerOverflow,
      largeLuggageOverflow,
      cabinLuggageOverflow,
      requiredLuggageVehicles: 0,
      warnings,
    };
  }

  if (cabinLuggageOverflow > 0) {
    warnings.push({
      code: "CABIN_LUGGAGE_OVERFLOW",
      message: `Cabin luggage exceeds vehicle capacity by ${cabinLuggageOverflow}`,
    });

    return {
      eligibility: "INELIGIBLE",
      passengerOverflow,
      largeLuggageOverflow,
      cabinLuggageOverflow,
      requiredLuggageVehicles: 0,
      warnings,
    };
  }

  if (largeLuggageOverflow === 0) {
    return {
      eligibility: "ELIGIBLE",
      passengerOverflow,
      largeLuggageOverflow,
      cabinLuggageOverflow,
      requiredLuggageVehicles: 0,
      warnings,
    };
  }

  warnings.push({
    code: "LARGE_LUGGAGE_OVERFLOW",
    message: `Large luggage exceeds vehicle capacity by ${largeLuggageOverflow}`,
  });

  const luggageExtra = input.luggageVehicleExtra;

  if (!luggageExtra || !luggageExtra.isActive) {
    warnings.push({
      code: "LUGGAGE_VEHICLE_UNAVAILABLE",
      message: "No active luggage vehicle extra is available to resolve overflow",
    });

    return {
      eligibility: "INELIGIBLE",
      passengerOverflow,
      largeLuggageOverflow,
      cabinLuggageOverflow,
      requiredLuggageVehicles: 0,
      warnings,
    };
  }

  const requiredLuggageVehicles = ceilDivision(
    largeLuggageOverflow,
    luggageExtra.luggageCapacityPerUnit,
  );

  if (
    luggageExtra.maxQuantity !== null &&
    requiredLuggageVehicles > luggageExtra.maxQuantity
  ) {
    warnings.push({
      code: "LUGGAGE_VEHICLE_MAX_EXCEEDED",
      message: `Required luggage vehicles (${requiredLuggageVehicles}) exceed maximum allowed (${luggageExtra.maxQuantity})`,
    });

    return {
      eligibility: "INELIGIBLE",
      passengerOverflow,
      largeLuggageOverflow,
      cabinLuggageOverflow,
      requiredLuggageVehicles,
      warnings,
    };
  }

  warnings.push({
    code: "LUGGAGE_VEHICLE_REQUIRED",
    message: `${requiredLuggageVehicles} luggage vehicle(s) required for overflow`,
  });

  return {
    eligibility: "ELIGIBLE_WITH_EXTRAS",
    passengerOverflow,
    largeLuggageOverflow,
    cabinLuggageOverflow,
    requiredLuggageVehicles,
    warnings,
  };
}
