import "server-only";

import { asc, inArray } from "drizzle-orm";

import type { Database } from "@/db/client";
import { vehicleCategoryImages } from "@/db/schema";

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
}
