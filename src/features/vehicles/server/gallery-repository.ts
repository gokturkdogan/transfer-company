import "server-only";

import { asc, inArray } from "drizzle-orm";

import type { Database } from "@/db/client";
import { vehicleCategoryImages } from "@/db/schema";
import {
  MAX_VEHICLE_BOOKING_PREVIEW_IMAGES,
} from "@/features/vehicles/domain/constants";

export type VehicleGalleryImageRecord = {
  imageKey: string;
  showInBookingPreview: boolean;
};

export class VehicleGalleryRepository {
  constructor(private readonly database: Database) {}

  async listImageKeysByVehicleIds(
    vehicleCategoryIds: string[],
  ): Promise<Map<string, string[]>> {
    if (vehicleCategoryIds.length === 0) {
      return new Map();
    }

    const rows = await this.database
      .select({
        vehicleCategoryId: vehicleCategoryImages.vehicleCategoryId,
        imageKey: vehicleCategoryImages.imageKey,
        sortOrder: vehicleCategoryImages.sortOrder,
      })
      .from(vehicleCategoryImages)
      .where(inArray(vehicleCategoryImages.vehicleCategoryId, vehicleCategoryIds))
      .orderBy(asc(vehicleCategoryImages.sortOrder));

    const result = new Map<string, string[]>();

    for (const row of rows) {
      const trimmed = row.imageKey.trim();

      if (!trimmed) {
        continue;
      }

      const current = result.get(row.vehicleCategoryId) ?? [];
      current.push(trimmed);
      result.set(row.vehicleCategoryId, current);
    }

    return result;
  }

  async listBookingPreviewImageKeysByVehicleIds(
    vehicleCategoryIds: string[],
  ): Promise<Map<string, string[]>> {
    if (vehicleCategoryIds.length === 0) {
      return new Map();
    }

    const galleryRows = await this.database
      .select({
        vehicleCategoryId: vehicleCategoryImages.vehicleCategoryId,
        imageKey: vehicleCategoryImages.imageKey,
        sortOrder: vehicleCategoryImages.sortOrder,
        isBookingPreview: vehicleCategoryImages.isBookingPreview,
      })
      .from(vehicleCategoryImages)
      .where(inArray(vehicleCategoryImages.vehicleCategoryId, vehicleCategoryIds))
      .orderBy(asc(vehicleCategoryImages.sortOrder));

    const selectedByVehicle = new Map<string, string[]>();
    const allByVehicle = new Map<string, string[]>();

    for (const vehicleId of vehicleCategoryIds) {
      selectedByVehicle.set(vehicleId, []);
      allByVehicle.set(vehicleId, []);
    }

    for (const row of galleryRows) {
      const trimmed = row.imageKey.trim();

      if (!trimmed) {
        continue;
      }

      const allImages = allByVehicle.get(row.vehicleCategoryId) ?? [];

      if (!allImages.includes(trimmed)) {
        allImages.push(trimmed);
        allByVehicle.set(row.vehicleCategoryId, allImages);
      }

      if (!row.isBookingPreview) {
        continue;
      }

      const selected = selectedByVehicle.get(row.vehicleCategoryId) ?? [];

      if (selected.includes(trimmed)) {
        continue;
      }

      selected.push(trimmed);
      selectedByVehicle.set(
        row.vehicleCategoryId,
        selected.slice(0, MAX_VEHICLE_BOOKING_PREVIEW_IMAGES),
      );
    }

    const result = new Map<string, string[]>();

    for (const vehicleId of vehicleCategoryIds) {
      const selected = selectedByVehicle.get(vehicleId) ?? [];
      const fallback = (allByVehicle.get(vehicleId) ?? []).slice(
        0,
        MAX_VEHICLE_BOOKING_PREVIEW_IMAGES,
      );

      result.set(vehicleId, selected.length > 0 ? selected : fallback);
    }

    return result;
  }
}
