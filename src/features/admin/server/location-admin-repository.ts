import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { DEFAULT_LOCALE } from "@/config/constants";
import type { Database } from "@/db/client";
import type { LocationType } from "@/db/schema/enums";
import { locationFeaturedPrices, locationTranslations, locations } from "@/db/schema";
import type { LocaleTranslationMap } from "@/features/admin/server/translation-input";
import { assertValidParent } from "@/features/locations/domain/hierarchy";
import { LocationDomainError } from "@/features/locations/domain/errors";
import { DomainRuleError, NotFoundError } from "@/server/errors";

type DbExecutor = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];

export type FeaturedStartingPrices = Record<string, number>;

export type AdminLocationRecord = {
  id: string;
  type: LocationType;
  code: string;
  defaultName: string;
  parentId: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  imageKey: string | null;
  isFeaturedOnHomepage: boolean;
  featuredStartingPrices: FeaturedStartingPrices;
  sortOrder: number;
  isActive: boolean;
  translations?: LocaleTranslationMap;
};

export type CreateAdminLocationInput = {
  type: LocationType;
  code: string;
  translations: LocaleTranslationMap;
  parentId?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  imageKey?: string | null;
  isFeaturedOnHomepage?: boolean;
  featuredStartingPrices?: FeaturedStartingPrices;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateAdminLocationInput = Partial<CreateAdminLocationInput>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDomainError(error: unknown): never {
  if (error instanceof LocationDomainError) {
    throw new DomainRuleError(error.message);
  }

  throw error;
}

function mapLocationRow(
  row: {
    id: string;
    type: LocationType;
    code: string;
    defaultName: string;
    parentId: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    imageKey: string | null;
    isFeaturedOnHomepage: boolean;
    sortOrder: number;
    isActive: boolean;
  },
  featuredStartingPrices: FeaturedStartingPrices = {},
): AdminLocationRecord {
  return {
    ...row,
    featuredStartingPrices,
  };
}

export class LocationAdminRepository {
  constructor(private readonly database: Database) {}

  async findFeaturedPrices(locationId: string): Promise<FeaturedStartingPrices> {
    const rows = await this.database
      .select({
        currency: locationFeaturedPrices.currency,
        startingFromMinor: locationFeaturedPrices.startingFromMinor,
      })
      .from(locationFeaturedPrices)
      .where(eq(locationFeaturedPrices.locationId, locationId));

    return Object.fromEntries(
      rows.map((row) => [row.currency, row.startingFromMinor]),
    );
  }

  async findById(id: string): Promise<AdminLocationRecord | null> {
    const [row] = await this.database
      .select({
        id: locations.id,
        type: locations.type,
        code: locations.code,
        defaultName: locations.defaultName,
        parentId: locations.parentId,
        address: locations.address,
        latitude: locations.latitude,
        longitude: locations.longitude,
        imageKey: locations.imageKey,
        isFeaturedOnHomepage: locations.isFeaturedOnHomepage,
        sortOrder: locations.sortOrder,
        isActive: locations.isActive,
      })
      .from(locations)
      .where(eq(locations.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    const featuredStartingPrices = await this.findFeaturedPrices(id);

    return {
      ...mapLocationRow(row, featuredStartingPrices),
      translations: await this.findTranslations(id),
    };
  }

  async findTranslations(locationId: string): Promise<LocaleTranslationMap> {
    const rows = await this.database
      .select({
        locale: locationTranslations.locale,
        name: locationTranslations.name,
      })
      .from(locationTranslations)
      .where(eq(locationTranslations.locationId, locationId));

    return Object.fromEntries(rows.map((row) => [row.locale, row.name]));
  }

  async findByType(
    type: LocationType,
    options?: { includeInactive?: boolean; parentId?: string },
  ): Promise<AdminLocationRecord[]> {
    const conditions = [eq(locations.type, type)];

    if (!options?.includeInactive) {
      conditions.push(eq(locations.isActive, true));
    }

    if (options?.parentId) {
      conditions.push(eq(locations.parentId, options.parentId));
    }

    return this.database
      .select({
        id: locations.id,
        type: locations.type,
        code: locations.code,
        defaultName: locations.defaultName,
        parentId: locations.parentId,
        address: locations.address,
        latitude: locations.latitude,
        longitude: locations.longitude,
        imageKey: locations.imageKey,
        isFeaturedOnHomepage: locations.isFeaturedOnHomepage,
        sortOrder: locations.sortOrder,
        isActive: locations.isActive,
      })
      .from(locations)
      .where(and(...conditions))
      .orderBy(asc(locations.sortOrder), asc(locations.defaultName))
      .then((rows) => rows.map((row) => mapLocationRow(row)));
  }

  async findDistrictsForCity(cityId: string): Promise<AdminLocationRecord[]> {
    return this.findByType("DISTRICT", { parentId: cityId, includeInactive: true });
  }

  async findCities(): Promise<AdminLocationRecord[]> {
    return this.findByType("CITY", { includeInactive: true });
  }

  private async resolveParentType(
    parentId: string | null | undefined,
  ): Promise<LocationType | null> {
    if (!parentId) {
      return null;
    }

    const parent = await this.findById(parentId);

    if (!parent) {
      throw new NotFoundError("Parent location not found");
    }

    return parent.type;
  }

  private async validateParent(
    childType: LocationType,
    parentId: string | null | undefined,
  ): Promise<void> {
    try {
      const parentType = await this.resolveParentType(parentId ?? null);
      assertValidParent(childType, parentType);
    } catch (error) {
      toDomainError(error);
    }
  }

  private async syncLocationTranslations(
    locationId: string,
    code: string,
    translations: LocaleTranslationMap,
    executor: DbExecutor,
  ): Promise<void> {
    const slug = slugify(code);

    for (const [locale, name] of Object.entries(translations)) {
      const [existing] = await executor
        .select({ id: locationTranslations.id })
        .from(locationTranslations)
        .where(
          and(
            eq(locationTranslations.locationId, locationId),
            eq(locationTranslations.locale, locale),
          ),
        )
        .limit(1);

      if (existing) {
        await executor
          .update(locationTranslations)
          .set({ name, slug })
          .where(eq(locationTranslations.id, existing.id));
        continue;
      }

      await executor.insert(locationTranslations).values({
        locationId,
        locale,
        name,
        slug,
      });
    }
  }

  private async syncFeaturedPrices(
    locationId: string,
    prices: FeaturedStartingPrices | undefined,
    executor: DbExecutor,
  ): Promise<void> {
    await executor
      .delete(locationFeaturedPrices)
      .where(eq(locationFeaturedPrices.locationId, locationId));

    if (!prices) {
      return;
    }

    const entries = Object.entries(prices).filter(
      ([, amountMinor]) => amountMinor > 0,
    );

    if (entries.length === 0) {
      return;
    }

    await executor.insert(locationFeaturedPrices).values(
      entries.map(([currency, startingFromMinor]) => ({
        locationId,
        currency,
        startingFromMinor,
      })),
    );
  }

  async create(input: CreateAdminLocationInput): Promise<AdminLocationRecord> {
    await this.validateParent(input.type, input.parentId ?? null);
    const defaultName = input.translations[DEFAULT_LOCALE]!;

    const [created] = await this.database.transaction(async (tx) => {
      const [location] = await tx
        .insert(locations)
        .values({
          type: input.type,
          code: input.code,
          defaultName,
          parentId: input.parentId ?? null,
          address: input.address ?? null,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          imageKey: input.imageKey ?? null,
          isFeaturedOnHomepage: input.isFeaturedOnHomepage ?? false,
          sortOrder: input.sortOrder ?? 0,
          isActive: input.isActive ?? true,
        })
        .returning({
          id: locations.id,
          type: locations.type,
          code: locations.code,
          defaultName: locations.defaultName,
          parentId: locations.parentId,
          address: locations.address,
          latitude: locations.latitude,
          longitude: locations.longitude,
          imageKey: locations.imageKey,
          isFeaturedOnHomepage: locations.isFeaturedOnHomepage,
          sortOrder: locations.sortOrder,
          isActive: locations.isActive,
        });

      await this.syncLocationTranslations(
        location.id,
        input.code,
        input.translations,
        tx,
      );

      await this.syncFeaturedPrices(
        location.id,
        input.featuredStartingPrices,
        tx,
      );

      return [location];
    });

    const record = await this.findById(created.id);
    if (!record) {
      throw new Error("Failed to load created location");
    }

    return record;
  }

  async update(
    id: string,
    input: UpdateAdminLocationInput,
  ): Promise<AdminLocationRecord> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundError("Location not found");
    }

    const nextType = input.type ?? existing.type;
    const nextParentId =
      input.parentId !== undefined ? input.parentId : existing.parentId;
    const nextTranslations = input.translations ?? existing.translations ?? {};
    const nextDefaultName =
      nextTranslations[DEFAULT_LOCALE] ?? existing.defaultName;
    const nextCode = input.code ?? existing.code;

    await this.validateParent(nextType, nextParentId);

    const nextImageKey =
      input.imageKey !== undefined ? input.imageKey : existing.imageKey;
    const nextIsFeaturedOnHomepage =
      input.isFeaturedOnHomepage ?? existing.isFeaturedOnHomepage;

    await this.database.transaction(async (tx) => {
      const [location] = await tx
        .update(locations)
        .set({
          type: nextType,
          code: nextCode,
          defaultName: nextDefaultName,
          parentId: nextParentId,
          address:
            input.address !== undefined ? input.address : existing.address,
          latitude:
            input.latitude !== undefined ? input.latitude : existing.latitude,
          longitude:
            input.longitude !== undefined
              ? input.longitude
              : existing.longitude,
          imageKey: nextImageKey,
          isFeaturedOnHomepage: nextIsFeaturedOnHomepage,
          sortOrder: input.sortOrder ?? existing.sortOrder,
          isActive: input.isActive ?? existing.isActive,
          deletedAt:
            input.isActive === false && existing.isActive
              ? new Date()
              : input.isActive === true
                ? null
                : undefined,
        })
        .where(eq(locations.id, id))
        .returning({
          id: locations.id,
        });

      if (!location) {
        throw new NotFoundError("Location not found");
      }

      await this.syncLocationTranslations(
        id,
        nextCode,
        nextTranslations,
        tx,
      );

      if (input.featuredStartingPrices !== undefined) {
        await this.syncFeaturedPrices(id, input.featuredStartingPrices, tx);
      }
    });

    const record = await this.findById(id);
    if (!record) {
      throw new NotFoundError("Location not found");
    }

    return record;
  }

  async deactivate(id: string): Promise<void> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundError("Location not found");
    }

    await this.database
      .update(locations)
      .set({
        isActive: false,
        deletedAt: new Date(),
      })
      .where(eq(locations.id, id));
  }
}
