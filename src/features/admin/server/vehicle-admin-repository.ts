import "server-only";

import { and, asc, count, eq, inArray, isNull } from "drizzle-orm";

import { DEFAULT_LOCALE } from "@/config/constants";
import type { Database } from "@/db/client";
import {
  reservationItems,
  routePrices,
  vehicleCategories,
  vehicleCategoryImages,
  vehicleCategoryTranslations,
  vehicleDisplayPrices,
} from "@/db/schema";
import type { LocaleTranslationMap } from "@/features/admin/server/translation-input";
import {
  MAX_VEHICLE_BOOKING_PREVIEW_IMAGES,
  MAX_VEHICLE_GALLERY_IMAGES,
} from "@/features/vehicles/domain/constants";
import {
  AdminVehicleFeatureInput,
  VehicleFeatureRepository,
} from "@/features/vehicles/server/feature-repository";
import { NotFoundError } from "@/server/errors";

type DbExecutor = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];

export type AdminVehicleGalleryImage = {
  imageKey: string;
  showInBookingPreview: boolean;
};

export type VehicleDisplayStartingPrices = Record<string, number>;

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
  galleryImages: AdminVehicleGalleryImage[];
  sortOrder: number;
  isActive: boolean;
  displayStartingPrices: VehicleDisplayStartingPrices;
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
  galleryImages: AdminVehicleGalleryImage[];
  sortOrder: number;
  isActive: boolean;
  displayStartingPrices?: VehicleDisplayStartingPrices;
};

export class VehicleAdminRepository {
  private readonly featureRepository: VehicleFeatureRepository;

  constructor(private readonly database: Database) {
    this.featureRepository = new VehicleFeatureRepository(database);
  }

  async findDisplayStartingPrices(
    vehicleCategoryId: string,
  ): Promise<VehicleDisplayStartingPrices> {
    const rows = await this.database
      .select({
        currency: vehicleDisplayPrices.currency,
        startingFromMinor: vehicleDisplayPrices.startingFromMinor,
      })
      .from(vehicleDisplayPrices)
      .where(eq(vehicleDisplayPrices.vehicleCategoryId, vehicleCategoryId));

    return Object.fromEntries(
      rows.map((row) => [row.currency, row.startingFromMinor]),
    );
  }

  private async loadDisplayStartingPrices(
    vehicleCategoryIds: string[],
  ): Promise<Map<string, VehicleDisplayStartingPrices>> {
    if (vehicleCategoryIds.length === 0) {
      return new Map();
    }

    const rows = await this.database
      .select({
        vehicleCategoryId: vehicleDisplayPrices.vehicleCategoryId,
        currency: vehicleDisplayPrices.currency,
        startingFromMinor: vehicleDisplayPrices.startingFromMinor,
      })
      .from(vehicleDisplayPrices)
      .where(inArray(vehicleDisplayPrices.vehicleCategoryId, vehicleCategoryIds));

    const result = new Map<string, VehicleDisplayStartingPrices>();
    for (const row of rows) {
      const current = result.get(row.vehicleCategoryId) ?? {};
      current[row.currency] = row.startingFromMinor;
      result.set(row.vehicleCategoryId, current);
    }

    return result;
  }

  private async syncDisplayStartingPrices(
    executor: DbExecutor,
    vehicleCategoryId: string,
    prices: VehicleDisplayStartingPrices | undefined,
  ): Promise<void> {
    await executor
      .delete(vehicleDisplayPrices)
      .where(eq(vehicleDisplayPrices.vehicleCategoryId, vehicleCategoryId));

    if (!prices) {
      return;
    }

    const entries = Object.entries(prices).filter(
      ([, amountMinor]) => amountMinor > 0,
    );

    if (entries.length === 0) {
      return;
    }

    await executor.insert(vehicleDisplayPrices).values(
      entries.map(([currency, startingFromMinor]) => ({
        vehicleCategoryId,
        currency,
        startingFromMinor,
      })),
    );
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
      .where(
        includeInactive
          ? isNull(vehicleCategories.deletedAt)
          : and(
              eq(vehicleCategories.isActive, true),
              isNull(vehicleCategories.deletedAt),
            ),
      )
      .orderBy(asc(vehicleCategories.sortOrder), asc(vehicleCategories.code));

    if (rows.length === 0) {
      return [];
    }

    const vehicleIds = rows.map((row) => row.id);
    const [galleryRows, featuresByVehicle, nameTranslationsByVehicle, displayPricesByVehicle] =
      await Promise.all([
        this.database
          .select({
            vehicleCategoryId: vehicleCategoryImages.vehicleCategoryId,
            imageKey: vehicleCategoryImages.imageKey,
            isBookingPreview: vehicleCategoryImages.isBookingPreview,
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
        this.loadDisplayStartingPrices(vehicleIds),
      ]);

    const galleryByVehicle = new Map<string, AdminVehicleGalleryImage[]>();
    for (const image of galleryRows) {
      const current = galleryByVehicle.get(image.vehicleCategoryId) ?? [];
      current.push({
        imageKey: image.imageKey,
        showInBookingPreview: image.isBookingPreview,
      });
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
      galleryImages: galleryByVehicle.get(row.id) ?? [],
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      displayStartingPrices: displayPricesByVehicle.get(row.id) ?? {},
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
      .where(
        and(eq(vehicleCategories.id, id), isNull(vehicleCategories.deletedAt)),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    const [galleryRows, features, nameTranslations, displayStartingPrices] =
      await Promise.all([
      this.database
        .select({
          imageKey: vehicleCategoryImages.imageKey,
          isBookingPreview: vehicleCategoryImages.isBookingPreview,
        })
        .from(vehicleCategoryImages)
        .where(eq(vehicleCategoryImages.vehicleCategoryId, id))
        .orderBy(asc(vehicleCategoryImages.sortOrder)),
      this.featureRepository.listAdminFeaturesByVehicleId(id),
      this.loadNameTranslations([id]),
      this.findDisplayStartingPrices(id),
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
      galleryImages: galleryRows.map((image) => ({
        imageKey: image.imageKey,
        showInBookingPreview: image.isBookingPreview,
      })),
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      displayStartingPrices,
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
    galleryImages: AdminVehicleGalleryImage[],
  ) {
    await executor
      .delete(vehicleCategoryImages)
      .where(eq(vehicleCategoryImages.vehicleCategoryId, vehicleCategoryId));

    const images = galleryImages
      .map((image) => ({
        imageKey: image.imageKey.trim(),
        showInBookingPreview: image.showInBookingPreview,
      }))
      .filter((image) => image.imageKey.length > 0)
      .slice(0, MAX_VEHICLE_GALLERY_IMAGES);

    for (const [index, image] of images.entries()) {
      await executor.insert(vehicleCategoryImages).values({
        vehicleCategoryId,
        imageKey: image.imageKey,
        isBookingPreview: image.showInBookingPreview,
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
          coverInBookingPreview: false,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
        })
        .returning({ id: vehicleCategories.id });

      await this.syncNameTranslations(tx, created.id, input.nameTranslations);
      await this.featureRepository.syncFeatures(tx, created.id, input.features);
      await this.syncGalleryImages(tx, created.id, input.galleryImages);
      await this.syncDisplayStartingPrices(
        tx,
        created.id,
        input.displayStartingPrices,
      );
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
          coverInBookingPreview: false,
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
      await this.syncGalleryImages(tx, id, input.galleryImages);
      await this.syncDisplayStartingPrices(
        tx,
        id,
        input.displayStartingPrices,
      );
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

  private async countReservationReferences(
    vehicleCategoryId: string,
  ): Promise<number> {
    const [row] = await this.database
      .select({ count: count() })
      .from(reservationItems)
      .where(
        and(
          eq(reservationItems.vehicleCategoryId, vehicleCategoryId),
          eq(reservationItems.itemType, "TRANSFER_VEHICLE"),
        ),
      );

    return Number(row?.count ?? 0);
  }

  async delete(id: string): Promise<"deleted" | "archived"> {
    const vehicle = await this.findById(id);

    if (!vehicle) {
      throw new NotFoundError("Vehicle not found");
    }

    const reservationCount = await this.countReservationReferences(id);

    if (reservationCount > 0) {
      await this.database
        .update(vehicleCategories)
        .set({
          isActive: false,
          deletedAt: new Date(),
        })
        .where(eq(vehicleCategories.id, id));

      return "archived";
    }

    await this.database.transaction(async (tx) => {
      await tx
        .delete(routePrices)
        .where(eq(routePrices.vehicleCategoryId, id));
      await tx.delete(vehicleCategories).where(eq(vehicleCategories.id, id));
    });

    return "deleted";
  }
}
