import "server-only";

import { and, asc, eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import type { LocationType } from "@/db/schema/enums";
import { locationTranslations, locations } from "@/db/schema";
import { assertValidParent } from "@/features/locations/domain/hierarchy";
import { LocationDomainError } from "@/features/locations/domain/errors";
import { DomainRuleError, NotFoundError } from "@/server/errors";

type DbExecutor = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];

export type AdminLocationRecord = {
  id: string;
  type: LocationType;
  code: string;
  defaultName: string;
  parentId: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  sortOrder: number;
  isActive: boolean;
};

export type CreateAdminLocationInput = {
  type: LocationType;
  code: string;
  defaultName: string;
  parentId?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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

export class LocationAdminRepository {
  constructor(private readonly database: Database) {}

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
        sortOrder: locations.sortOrder,
        isActive: locations.isActive,
      })
      .from(locations)
      .where(eq(locations.id, id))
      .limit(1);

    return row ?? null;
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
        sortOrder: locations.sortOrder,
        isActive: locations.isActive,
      })
      .from(locations)
      .where(and(...conditions))
      .orderBy(asc(locations.sortOrder), asc(locations.defaultName));
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

  private async upsertEnglishTranslation(
    locationId: string,
    name: string,
    code: string,
    executor: DbExecutor,
  ): Promise<void> {
    const slug = slugify(code);

    const [existing] = await executor
      .select({ id: locationTranslations.id })
      .from(locationTranslations)
      .where(
        and(
          eq(locationTranslations.locationId, locationId),
          eq(locationTranslations.locale, "en"),
        ),
      )
      .limit(1);

    if (existing) {
      await executor
        .update(locationTranslations)
        .set({ name, slug })
        .where(eq(locationTranslations.id, existing.id));
      return;
    }

    await executor.insert(locationTranslations).values({
      locationId,
      locale: "en",
      name,
      slug,
    });
  }

  async create(input: CreateAdminLocationInput): Promise<AdminLocationRecord> {
    await this.validateParent(input.type, input.parentId ?? null);

    const [created] = await this.database.transaction(async (tx) => {
      const [location] = await tx
        .insert(locations)
        .values({
          type: input.type,
          code: input.code,
          defaultName: input.defaultName,
          parentId: input.parentId ?? null,
          address: input.address ?? null,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
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
          sortOrder: locations.sortOrder,
          isActive: locations.isActive,
        });

      await this.upsertEnglishTranslation(
        location.id,
        input.defaultName,
        input.code,
        tx,
      );

      return [location];
    });

    return created;
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

    await this.validateParent(nextType, nextParentId);

    const [updated] = await this.database.transaction(async (tx) => {
      const [location] = await tx
        .update(locations)
        .set({
          type: nextType,
          code: input.code ?? existing.code,
          defaultName: input.defaultName ?? existing.defaultName,
          parentId: nextParentId,
          address:
            input.address !== undefined ? input.address : existing.address,
          latitude:
            input.latitude !== undefined ? input.latitude : existing.latitude,
          longitude:
            input.longitude !== undefined
              ? input.longitude
              : existing.longitude,
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
          type: locations.type,
          code: locations.code,
          defaultName: locations.defaultName,
          parentId: locations.parentId,
          address: locations.address,
          latitude: locations.latitude,
          longitude: locations.longitude,
          sortOrder: locations.sortOrder,
          isActive: locations.isActive,
        });

      await this.upsertEnglishTranslation(
        location.id,
        location.defaultName,
        location.code,
        tx,
      );

      return [location];
    });

    return updated;
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
