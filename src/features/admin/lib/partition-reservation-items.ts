import type { AdminReservationDetail } from "@/features/admin/server/reservation-admin-repository";

export type PartitionedReservationItem =
  AdminReservationDetail["items"][number];

export type PartitionedExtraLine = PartitionedReservationItem & {
  isLuggageOverflowVehicle: boolean;
};

export function partitionReservationLineItems(
  items: PartitionedReservationItem[],
): {
  transferVehicles: PartitionedReservationItem[];
  extraLines: PartitionedExtraLine[];
} {
  const vehicleItems = items.filter(
    (item) => item.itemType === "TRANSFER_VEHICLE",
  );
  const extraServices = items.filter(
    (item) => item.itemType === "EXTRA_SERVICE",
  );

  const flaggedLuggage = vehicleItems.filter(
    (item) => item.isLuggageOverflowVehicle,
  );
  const flaggedPrimary = vehicleItems.filter(
    (item) => !item.isLuggageOverflowVehicle,
  );

  let transferVehicles: PartitionedReservationItem[];
  let luggageVehicles: PartitionedReservationItem[];

  if (flaggedLuggage.length > 0) {
    transferVehicles = flaggedPrimary;
    luggageVehicles = flaggedLuggage;
  } else if (vehicleItems.length > 1) {
    transferVehicles = vehicleItems.slice(0, -1);
    luggageVehicles = vehicleItems.slice(-1);
  } else {
    transferVehicles = vehicleItems;
    luggageVehicles = [];
  }

  const extraLines: PartitionedExtraLine[] = [
    ...extraServices.map((item) => ({
      ...item,
      isLuggageOverflowVehicle: false,
    })),
    ...luggageVehicles.map((item) => ({
      ...item,
      isLuggageOverflowVehicle: true,
    })),
  ];

  return { transferVehicles, extraLines };
}

export function resolveReservationLuggageCount(
  largeLuggageCount: number,
  cabinLuggageCount: number,
): number {
  return largeLuggageCount + cabinLuggageCount;
}
