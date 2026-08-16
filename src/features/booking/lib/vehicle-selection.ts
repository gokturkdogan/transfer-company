import { resolveCapacityPassengerCount } from "@/features/capacity/domain/capacity-passenger-count";
import { getTotalPassengerCount } from "@/features/booking/lib/passenger-count";
import type { BookingSearchState, SelectedVehicle } from "@/features/booking/lib/types";
import type { TransferVehicleOptionDto } from "@/features/pricing/types/dto";

export function getMaxSingleVehiclePassengerCapacity(
  options: TransferVehicleOptionDto[],
): number {
  if (options.length === 0) {
    return 0;
  }

  return Math.max(...options.map((option) => option.passengerCapacity));
}

export function getRequiredCapacityPassengerCount(
  search: Pick<BookingSearchState, "passengerCount" | "childCount" | "infantCount">,
): number {
  return resolveCapacityPassengerCount(
    getTotalPassengerCount(search),
    search.infantCount,
  );
}

export function requiresMultiVehicleSelection(
  requiredPassengers: number,
  options: TransferVehicleOptionDto[],
): boolean {
  const maxCapacity = getMaxSingleVehiclePassengerCapacity(options);

  return maxCapacity > 0 && requiredPassengers > maxCapacity;
}

export function sumSelectedPassengerCapacity(
  selectedVehicles: SelectedVehicle[],
  options: TransferVehicleOptionDto[],
): number {
  return selectedVehicles.reduce((sum, selection) => {
    const option = options.find(
      (item) => item.vehicleCategoryId === selection.vehicleCategoryId,
    );

    if (!option) {
      return sum;
    }

    return sum + option.passengerCapacity * selection.quantity;
  }, 0);
}

export function hasSufficientPassengerCapacity(
  selectedVehicles: SelectedVehicle[],
  options: TransferVehicleOptionDto[],
  requiredPassengers: number,
): boolean {
  return (
    sumSelectedPassengerCapacity(selectedVehicles, options) >= requiredPassengers
  );
}

export function isPassengerCapacityFilled(
  selectedVehicles: SelectedVehicle[],
  options: TransferVehicleOptionDto[],
  requiredPassengers: number,
): boolean {
  return hasSufficientPassengerCapacity(
    selectedVehicles,
    options,
    requiredPassengers,
  );
}

export function getSelectedVehicleQuantity(
  selectedVehicles: SelectedVehicle[],
  vehicleCategoryId: string,
): number {
  const match = selectedVehicles.find(
    (selection) => selection.vehicleCategoryId === vehicleCategoryId,
  );

  return match?.quantity ?? 0;
}

export function adjustVehicleSelectionQuantity(
  selectedVehicles: SelectedVehicle[],
  vehicleCategoryId: string,
  delta: number,
  options?: TransferVehicleOptionDto[],
  requiredPassengers?: number,
): SelectedVehicle[] {
  if (delta === 0) {
    return selectedVehicles;
  }

  if (
    delta > 0 &&
    options &&
    requiredPassengers !== undefined &&
    isPassengerCapacityFilled(selectedVehicles, options, requiredPassengers)
  ) {
    return selectedVehicles;
  }

  const existing = selectedVehicles.find(
    (selection) => selection.vehicleCategoryId === vehicleCategoryId,
  );

  if (!existing) {
    if (delta <= 0) {
      return selectedVehicles;
    }

    return [...selectedVehicles, { vehicleCategoryId, quantity: delta }];
  }

  const nextQuantity = existing.quantity + delta;

  if (nextQuantity <= 0) {
    return selectedVehicles.filter(
      (selection) => selection.vehicleCategoryId !== vehicleCategoryId,
    );
  }

  return selectedVehicles.map((selection) =>
    selection.vehicleCategoryId === vehicleCategoryId
      ? { ...selection, quantity: nextQuantity }
      : selection,
  );
}

export function getSelectedVehicleOptions(
  selectedVehicles: SelectedVehicle[],
  options: TransferVehicleOptionDto[],
): TransferVehicleOptionDto[] {
  return selectedVehicles
    .map((selection) =>
      options.find(
        (option) => option.vehicleCategoryId === selection.vehicleCategoryId,
      ),
    )
    .filter((option): option is TransferVehicleOptionDto => option !== undefined);
}
