import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

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
      })
      .from(vehicleCategoryImages)
      .where(
        and(
          inArray(vehicleCategoryImages.vehicleCategoryId, vehicleCategoryIds),
          eq(vehicleCategoryImages.isBookingPreview, true),
        ),
      )
      .orderBy(asc(vehicleCategoryImages.sortOrder));

    const result = new Map<string, string[]>();

    for (const vehicleId of vehicleCategoryIds) {
      result.set(vehicleId, []);
    }

    for (const row of galleryRows) {
      const trimmed = row.imageKey.trim();

      if (!trimmed) {
        continue;
      }

      const current = result.get(row.vehicleCategoryId) ?? [];

      if (current.includes(trimmed)) {
        continue;
      }

      current.push(trimmed);
      result.set(
        row.vehicleCategoryId,
        current.slice(0, MAX_VEHICLE_BOOKING_PREVIEW_IMAGES),
      );
    }

    return result;
  }
}
