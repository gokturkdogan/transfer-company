export type FleetCapacitySlice = {
  quantity: number;
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
};

export function sumFleetCapacityTotals(slices: FleetCapacitySlice[]): {
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
} {
  return {
    passengerCapacity: slices.reduce(
      (sum, slice) => sum + slice.passengerCapacity * slice.quantity,
      0,
    ),
    largeLuggageCapacity: slices.reduce(
      (sum, slice) => sum + slice.largeLuggageCapacity * slice.quantity,
      0,
    ),
    cabinLuggageCapacity: slices.reduce(
      (sum, slice) => sum + slice.cabinLuggageCapacity * slice.quantity,
      0,
    ),
  };
}
