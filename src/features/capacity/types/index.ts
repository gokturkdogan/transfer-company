export const ELIGIBILITY_STATUSES = [
  "ELIGIBLE",
  "ELIGIBLE_WITH_EXTRAS",
  "INELIGIBLE",
] as const;

export type EligibilityStatus = (typeof ELIGIBILITY_STATUSES)[number];

export type CapacityWarningCode =
  | "PASSENGER_OVERFLOW"
  | "LARGE_LUGGAGE_OVERFLOW"
  | "CABIN_LUGGAGE_OVERFLOW"
  | "LUGGAGE_VEHICLE_REQUIRED"
  | "LUGGAGE_VEHICLE_UNAVAILABLE"
  | "LUGGAGE_VEHICLE_MAX_EXCEEDED";

export type CapacityWarning = {
  code: CapacityWarningCode;
  message: string;
};

export type LuggageVehicleExtra = {
  id: string;
  isActive: boolean;
  luggageCapacityPerUnit: number;
  maxQuantity: number | null;
};

export type VehicleCapacityInput = {
  vehicleQuantity: number;
  passengerCount: number;
  largeLuggageCount: number;
  cabinLuggageCount: number;
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
  luggageVehicleExtra: LuggageVehicleExtra | null;
};

export type CapacityAssessment = {
  eligibility: EligibilityStatus;
  passengerOverflow: number;
  largeLuggageOverflow: number;
  cabinLuggageOverflow: number;
  requiredLuggageVehicles: number;
  warnings: CapacityWarning[];
};

export type VehicleCategoryCapacity = {
  id: string;
  name: string;
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
  isActive: boolean;
  sortOrder: number;
};

export type VehicleRecommendation = {
  vehicleCategoryId: string;
  vehicleCategoryName: string;
  quantity: number;
  assessment: CapacityAssessment;
};
