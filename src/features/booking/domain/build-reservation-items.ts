import type { QuoteLineItem } from "@/features/pricing/types";

export type ReservationItemInsert = {
  itemType: "TRANSFER_VEHICLE" | "EXTRA_SERVICE";
  vehicleCategoryId: string | null;
  extraServiceId: string | null;
  snapshotName: string;
  quantity: number;
  unitPriceMinor: number;
  totalPriceMinor: number;
  currency: string;
  sortOrder: number;
};

export function buildReservationItems(
  items: QuoteLineItem[],
  currency: string,
): ReservationItemInsert[] {
  return items.map((item, index) => ({
    itemType: item.type,
    vehicleCategoryId:
      item.type === "TRANSFER_VEHICLE" ? item.referenceId : null,
    extraServiceId: item.type === "EXTRA_SERVICE" ? item.referenceId : null,
    snapshotName: item.name,
    quantity: item.quantity,
    unitPriceMinor: item.unitPriceMinor,
    totalPriceMinor: item.totalPriceMinor,
    currency,
    sortOrder: index,
  }));
}
