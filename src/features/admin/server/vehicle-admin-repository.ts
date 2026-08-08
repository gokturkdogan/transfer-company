import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { DEFAULT_LOCALE } from "@/config/constants";
import type { Database } from "@/db/client";
import {
  vehicleCategories,
  vehicleCategoryImages,
  vehicleCategoryTranslations,
} from "@/db/schema";
import type { LocaleTranslationMap } from "@/features/admin/server/translation-input";
import {
  AdminVehicleFeatureInput,
  VehicleFeatureRepository,
} from "@/features/vehicles/server/feature-repository";

type DbExecutor = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];

export type AdminVehicleRecord = {
  id: string;
  code: string;
  brand: string;
  model: string;
  defaultName: string;
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
  nameTranslations: LocaleTranslationMap;
  features: AdminVehicleFeatureInput[];
  coverImageKey: string | null;
  galleryImageKeys: string[];
  sortOrder: number;
  isActive: boolean;
};

export type UpsertAdminVehicleInput = {
  code: string;
  brand: string;
  model: string;
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
  nameTranslations: LocaleTranslationMap;
  features: AdminVehicleFeatureInput[];
  coverImageKey?: string | null;
  galleryImageKeys: string[];
  sortOrder: number;
  isActive: boolean;
};

export class VehicleAdminRepository {
  private readonly featureRepository: VehicleFeatureRepository;

  constructor(private readonly database: Database) {
    this.featureRepository = new VehicleFeatureRepository(database);
  }

  async list(includeInactive = true): Promise<AdminVehicleRecord[]> {
    const rows = await this.database
      .select({
        id: vehicleCategories.id,
        code: vehicleCategories.code,
        brand: vehicleCategories.brand,
        model: vehicleCategories.model,
        defaultName: vehicleCategories.defaultName,
        passengerCapacity: vehicleCategories.passengerCapacity,
        largeLuggageCapacity: vehicleCategories.largeLuggageCapacity,
        cabinLuggageCapacity: vehicleCategories.cabinLuggageCapacity,
        coverImageKey: vehicleCategories.imageKey,
        sortOrder: vehicleCategories.sortOrder,
        isActive: vehicleCategories.isActive,
      })
      .from(vehicleCategories)
      .where(includeInactive ? undefined : eq(vehicleCategories.isActive, true))
      .orderBy(asc(vehicleCategories.sortOrder), asc(vehicleCategories.code));

    if (rows.length === 0) {
      return [];
    }

    const vehicleIds = rows.map((row) => row.id);
    const [galleryRows, featuresByVehicle, nameTranslationsByVehicle] =
      await Promise.all([
      this.database
        .select({
          vehicleCategoryId: vehicleCategoryImages.vehicleCategoryId,
          imageKey: vehicleCategoryImages.imageKey,
          sortOrder: vehicleCategoryImages.sortOrder,
        })
        .from(vehicleCategoryImages)
        .where(inArray(vehicleCategoryImages.vehicleCategoryId, vehicleIds))
        .orderBy(asc(vehicleCategoryImages.sortOrder)),
      Promise.all(
        vehicleIds.map(async (vehicleId) => ({
          vehicleId,
          features:
            await this.featureRepository.listAdminFeaturesByVehicleId(vehicleId),
        })),
      ),
      this.loadNameTranslations(vehicleIds),
    ]);

    const galleryByVehicle = new Map<string, string[]>();
    for (const image of galleryRows) {
      const current = galleryByVehicle.get(image.vehicleCategoryId) ?? [];
      current.push(image.imageKey);
      galleryByVehicle.set(image.vehicleCategoryId, current);
    }

    const featuresMap = new Map(
      featuresByVehicle.map((entry) => [entry.vehicleId, entry.features]),
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      brand: row.brand,
      model: row.model,
      defaultName: row.defaultName,
      passengerCapacity: row.passengerCapacity,
      largeLuggageCapacity: row.largeLuggageCapacity,
      cabinLuggageCapacity: row.cabinLuggageCapacity,
      nameTranslations: nameTranslationsByVehicle.get(row.id) ?? {},
      features: featuresMap.get(row.id) ?? [],
      coverImageKey: row.coverImageKey,
      galleryImageKeys: galleryByVehicle.get(row.id) ?? [],
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    }));
  }

  async findById(id: string): Promise<AdminVehicleRecord | null> {
    const [row] = await this.database
      .select({
        id: vehicleCategories.id,
        code: vehicleCategories.code,
        brand: vehicleCategories.brand,
        model: vehicleCategories.model,
        defaultName: vehicleCategories.defaultName,
        passengerCapacity: vehicleCategories.passengerCapacity,
        largeLuggageCapacity: vehicleCategories.largeLuggageCapacity,
        cabinLuggageCapacity: vehicleCategories.cabinLuggageCapacity,
        coverImageKey: vehicleCategories.imageKey,
        sortOrder: vehicleCategories.sortOrder,
        isActive: vehicleCategories.isActive,
      })
      .from(vehicleCategories)
      .where(eq(vehicleCategories.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    const [galleryRows, features, nameTranslations] = await Promise.all([
      this.database
        .select({ imageKey: vehicleCategoryImages.imageKey })
        .from(vehicleCategoryImages)
        .where(eq(vehicleCategoryImages.vehicleCategoryId, id))
        .orderBy(asc(vehicleCategoryImages.sortOrder)),
      this.featureRepository.listAdminFeaturesByVehicleId(id),
      this.loadNameTranslations([id]),
    ]);

    return {
      id: row.id,
      code: row.code,
      brand: row.brand,
      model: row.model,
      defaultName: row.defaultName,
      passengerCapacity: row.passengerCapacity,
      largeLuggageCapacity: row.largeLuggageCapacity,
      cabinLuggageCapacity: row.cabinLuggageCapacity,
      nameTranslations: nameTranslations.get(id) ?? {},
      features,
      coverImageKey: row.coverImageKey,
      galleryImageKeys: galleryRows.map((image) => image.imageKey),
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    };
  }

  private async loadNameTranslations(
    vehicleCategoryIds: string[],
  ): Promise<Map<string, LocaleTranslationMap>> {
    if (vehicleCategoryIds.length === 0) {
      return new Map();
    }

    const rows = await this.database
      .select({
        vehicleCategoryId: vehicleCategoryTranslations.vehicleCategoryId,
        locale: vehicleCategoryTranslations.locale,
        name: vehicleCategoryTranslations.name,
      })
      .from(vehicleCategoryTranslations)
      .where(
        inArray(
          vehicleCategoryTranslations.vehicleCategoryId,
          vehicleCategoryIds,
        ),
      );

    const result = new Map<string, LocaleTranslationMap>();
    for (const row of rows) {
      const current = result.get(row.vehicleCategoryId) ?? {};
      current[row.locale] = row.name;
      result.set(row.vehicleCategoryId, current);
    }

    return result;
  }

  private async syncNameTranslations(
    executor: DbExecutor,
    vehicleCategoryId: string,
    translations: LocaleTranslationMap,
  ) {
    for (const [locale, name] of Object.entries(translations)) {
      const [existing] = await executor
        .select({ id: vehicleCategoryTranslations.id })
        .from(vehicleCategoryTranslations)
        .where(
          and(
            eq(vehicleCategoryTranslations.vehicleCategoryId, vehicleCategoryId),
            eq(vehicleCategoryTranslations.locale, locale),
          ),
        )
        .limit(1);

      if (existing) {
        await executor
          .update(vehicleCategoryTranslations)
          .set({ name })
          .where(eq(vehicleCategoryTranslations.id, existing.id));
        continue;
      }

      await executor.insert(vehicleCategoryTranslations).values({
        vehicleCategoryId,
        locale,
        name,
      });
    }
  }

  private async syncGalleryImages(
    executor: DbExecutor,
    vehicleCategoryId: string,
    galleryImageKeys: string[],
  ) {
    await executor
      .delete(vehicleCategoryImages)
      .where(eq(vehicleCategoryImages.vehicleCategoryId, vehicleCategoryId));

    const keys = galleryImageKeys
      .map((key) => key.trim())
      .filter(Boolean)
      .slice(0, 4);

    for (const [index, imageKey] of keys.entries()) {
      await executor.insert(vehicleCategoryImages).values({
        vehicleCategoryId,
        imageKey,
        sortOrder: index,
      });
    }
  }

  async create(input: UpsertAdminVehicleInput): Promise<AdminVehicleRecord> {
    const defaultName = input.nameTranslations[DEFAULT_LOCALE]!;

    const vehicleId = await this.database.transaction(async (tx) => {
      const [created] = await tx
        .insert(vehicleCategories)
        .values({
          code: input.code.toUpperCase(),
          defaultName,
          brand: input.brand.trim(),
          model: input.model.trim(),
          passengerCapacity: input.passengerCapacity,
          largeLuggageCapacity: input.largeLuggageCapacity,
          cabinLuggageCapacity: input.cabinLuggageCapacity,
          imageKey: input.coverImageKey?.trim() || null,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
        })
        .returning({ id: vehicleCategories.id });

      await this.syncNameTranslations(tx, created.id, input.nameTranslations);
      await this.featureRepository.syncFeatures(tx, created.id, input.features);
      await this.syncGalleryImages(tx, created.id, input.galleryImageKeys);
      return created.id;
    });

    const vehicle = await this.findById(vehicleId);
    if (!vehicle) {
      throw new Error("Failed to load created vehicle");
    }

    return vehicle;
  }

  async update(
    id: string,
    input: UpsertAdminVehicleInput,
  ): Promise<AdminVehicleRecord> {
    const defaultName = input.nameTranslations[DEFAULT_LOCALE]!;

    await this.database.transaction(async (tx) => {
      const [updated] = await tx
        .update(vehicleCategories)
        .set({
          code: input.code.toUpperCase(),
          defaultName,
          brand: input.brand.trim(),
          model: input.model.trim(),
          passengerCapacity: input.passengerCapacity,
          largeLuggageCapacity: input.largeLuggageCapacity,
          cabinLuggageCapacity: input.cabinLuggageCapacity,
          imageKey: input.coverImageKey?.trim() || null,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
        })
        .where(eq(vehicleCategories.id, id))
        .returning({ id: vehicleCategories.id });

      if (!updated) {
        throw new Error("Vehicle not found");
      }

      await this.syncNameTranslations(tx, id, input.nameTranslations);
      await this.featureRepository.syncFeatures(tx, id, input.features);
      await this.syncGalleryImages(tx, id, input.galleryImageKeys);
    });

    const vehicle = await this.findById(id);
    if (!vehicle) {
      throw new Error("Failed to load updated vehicle");
    }

    return vehicle;
  }

  async deactivate(id: string): Promise<void> {
    await this.database
      .update(vehicleCategories)
      .set({ isActive: false })
      .where(eq(vehicleCategories.id, id));
  }
}
