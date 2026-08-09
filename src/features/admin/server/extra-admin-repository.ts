import "server-only";

import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";

import { DEFAULT_LOCALE } from "@/config/constants";
import type { LocaleTranslationMap } from "@/features/admin/server/translation-input";
import type { Database } from "@/db/client";
import type { ExtraPricingMode } from "@/db/schema/enums";
import {
  extraServicePrices,
  extraServices,
  extraServiceTranslations,
  reservationItems,
} from "@/db/schema";
import { NotFoundError } from "@/server/errors";

type DbExecutor = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];

export type AdminExtraPriceRecord = {
  currency: string;
  priceMinor: number;
};

export type AdminExtraRecord = {
  id: string;
  code: string;
  name: string;
  pricingMode: ExtraPricingMode;
  customerSelectable: boolean;
  autoSuggested: boolean;
  minQuantity: number;
  maxQuantity: number | null;
  includedQuantity: number;
  luggageCapacityPerUnit: number | null;
  sortOrder: number;
  isActive: boolean;
  prices: AdminExtraPriceRecord[];
  translations: LocaleTranslationMap;
};

export type UpsertAdminExtraInput = {
  code: string;
  translations: LocaleTranslationMap;
  pricingMode: ExtraPricingMode;
  customerSelectable: boolean;
  autoSuggested: boolean;
  minQuantity: number;
  maxQuantity?: number | null;
  includedQuantity: number;
  luggageCapacityPerUnit?: number | null;
  sortOrder: number;
  isActive: boolean;
  prices: Array<{ currency: string; priceMinor: number }>;
};

export class ExtraAdminRepository {
  constructor(private readonly database: Database) {}

  async list(includeInactive = true): Promise<AdminExtraRecord[]> {
    const rows = await this.database
      .select({
        id: extraServices.id,
        code: extraServices.code,
        pricingMode: extraServices.pricingMode,
        customerSelectable: extraServices.customerSelectable,
        autoSuggested: extraServices.autoSuggested,
        minQuantity: extraServices.minQuantity,
        maxQuantity: extraServices.maxQuantity,
        includedQuantity: extraServices.includedQuantity,
        luggageCapacityPerUnit: extraServices.luggageCapacityPerUnit,
        sortOrder: extraServices.sortOrder,
        isActive: extraServices.isActive,
      })
      .from(extraServices)
      .where(
        and(
          isNull(extraServices.deletedAt),
          includeInactive ? undefined : eq(extraServices.isActive, true),
        ),
      )
      .orderBy(asc(extraServices.sortOrder), asc(extraServices.code));

    if (rows.length === 0) {
      return [];
    }

    const extraIds = rows.map((row) => row.id);
    const priceRows = await this.database
      .select({
        extraServiceId: extraServicePrices.extraServiceId,
        currency: extraServicePrices.currency,
        priceMinor: extraServicePrices.priceMinor,
      })
      .from(extraServicePrices)
      .where(
        and(
          inArray(extraServicePrices.extraServiceId, extraIds),
          eq(extraServicePrices.isActive, true),
        ),
      );

    const pricesByExtra = new Map<string, AdminExtraPriceRecord[]>();

    for (const price of priceRows) {
      const current = pricesByExtra.get(price.extraServiceId) ?? [];
      current.push({
        currency: price.currency,
        priceMinor: price.priceMinor,
      });
      pricesByExtra.set(price.extraServiceId, current);
    }

    const translationRows = await this.database
      .select({
        extraServiceId: extraServiceTranslations.extraServiceId,
        locale: extraServiceTranslations.locale,
        name: extraServiceTranslations.name,
      })
      .from(extraServiceTranslations)
      .where(inArray(extraServiceTranslations.extraServiceId, extraIds));

    const translationsByExtra = new Map<string, LocaleTranslationMap>();
    for (const translation of translationRows) {
      const current = translationsByExtra.get(translation.extraServiceId) ?? {};
      current[translation.locale] = translation.name;
      translationsByExtra.set(translation.extraServiceId, current);
    }

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: translationsByExtra.get(row.id)?.[DEFAULT_LOCALE] ?? row.code,
      pricingMode: row.pricingMode,
      customerSelectable: row.customerSelectable,
      autoSuggested: row.autoSuggested,
      minQuantity: row.minQuantity,
      maxQuantity: row.maxQuantity,
      includedQuantity: row.includedQuantity,
      luggageCapacityPerUnit: row.luggageCapacityPerUnit,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      prices: pricesByExtra.get(row.id) ?? [],
      translations: translationsByExtra.get(row.id) ?? {},
    }));
  }

  async findTranslations(extraServiceId: string): Promise<LocaleTranslationMap> {
    const rows = await this.database
      .select({
        locale: extraServiceTranslations.locale,
        name: extraServiceTranslations.name,
      })
      .from(extraServiceTranslations)
      .where(eq(extraServiceTranslations.extraServiceId, extraServiceId));

    return Object.fromEntries(rows.map((row) => [row.locale, row.name]));
  }

  async findById(id: string): Promise<AdminExtraRecord | null> {
    const [row] = await this.database
      .select({
        id: extraServices.id,
        code: extraServices.code,
        pricingMode: extraServices.pricingMode,
        customerSelectable: extraServices.customerSelectable,
        autoSuggested: extraServices.autoSuggested,
        minQuantity: extraServices.minQuantity,
        maxQuantity: extraServices.maxQuantity,
        includedQuantity: extraServices.includedQuantity,
        luggageCapacityPerUnit: extraServices.luggageCapacityPerUnit,
        sortOrder: extraServices.sortOrder,
        isActive: extraServices.isActive,
      })
      .from(extraServices)
      .where(and(eq(extraServices.id, id), isNull(extraServices.deletedAt)))
      .limit(1);

    if (!row) {
      return null;
    }

    const priceRows = await this.database
      .select({
        currency: extraServicePrices.currency,
        priceMinor: extraServicePrices.priceMinor,
      })
      .from(extraServicePrices)
      .where(
        and(
          eq(extraServicePrices.extraServiceId, id),
          eq(extraServicePrices.isActive, true),
        ),
      );

    const translations = await this.findTranslations(id);

    return {
      id: row.id,
      code: row.code,
      name: translations[DEFAULT_LOCALE] ?? row.code,
      pricingMode: row.pricingMode,
      customerSelectable: row.customerSelectable,
      autoSuggested: row.autoSuggested,
      minQuantity: row.minQuantity,
      maxQuantity: row.maxQuantity,
      includedQuantity: row.includedQuantity,
      luggageCapacityPerUnit: row.luggageCapacityPerUnit,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      prices: priceRows,
      translations,
    };
  }

  private async syncTranslations(
    executor: DbExecutor,
    extraServiceId: string,
    translations: LocaleTranslationMap,
  ) {
    for (const [locale, name] of Object.entries(translations)) {
      const [existing] = await executor
        .select({ id: extraServiceTranslations.id })
        .from(extraServiceTranslations)
        .where(
          and(
            eq(extraServiceTranslations.extraServiceId, extraServiceId),
            eq(extraServiceTranslations.locale, locale),
          ),
        )
        .limit(1);

      if (existing) {
        await executor
          .update(extraServiceTranslations)
          .set({ name })
          .where(eq(extraServiceTranslations.id, existing.id));
        continue;
      }

      await executor.insert(extraServiceTranslations).values({
        extraServiceId,
        locale,
        name,
      });
    }
  }

  private async upsertPrices(
    executor: DbExecutor,
    extraServiceId: string,
    prices: Array<{ currency: string; priceMinor: number }>,
  ) {
    for (const price of prices) {
      const [existing] = await executor
        .select({ id: extraServicePrices.id })
        .from(extraServicePrices)
        .where(
          and(
            eq(extraServicePrices.extraServiceId, extraServiceId),
            eq(extraServicePrices.currency, price.currency),
          ),
        )
        .limit(1);

      if (existing) {
        await executor
          .update(extraServicePrices)
          .set({
            priceMinor: price.priceMinor,
            isActive: true,
            deletedAt: null,
          })
          .where(eq(extraServicePrices.id, existing.id));
        continue;
      }

      await executor.insert(extraServicePrices).values({
        extraServiceId,
        currency: price.currency,
        priceMinor: price.priceMinor,
      });
    }
  }

  async create(input: UpsertAdminExtraInput): Promise<AdminExtraRecord> {
    const extraId = await this.database.transaction(async (tx) => {
      const [created] = await tx
        .insert(extraServices)
        .values({
          code: input.code.toUpperCase(),
          pricingMode: input.pricingMode,
          priceMinor: input.prices[0]?.priceMinor ?? 0,
          currency: input.prices[0]?.currency ?? "EUR",
          customerSelectable: input.customerSelectable,
          autoSuggested: input.autoSuggested,
          minQuantity: input.minQuantity,
          maxQuantity: input.maxQuantity ?? null,
          includedQuantity: input.includedQuantity,
          luggageCapacityPerUnit: input.luggageCapacityPerUnit ?? null,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
        })
        .returning({ id: extraServices.id });

      await this.syncTranslations(tx, created.id, input.translations);
      await this.upsertPrices(tx, created.id, input.prices);
      return created.id;
    });

    const extra = await this.findById(extraId);

    if (!extra) {
      throw new Error("Failed to load created extra");
    }

    return extra;
  }

  async update(
    id: string,
    input: UpsertAdminExtraInput,
  ): Promise<AdminExtraRecord> {
    await this.database.transaction(async (tx) => {
      const [updated] = await tx
        .update(extraServices)
        .set({
          code: input.code.toUpperCase(),
          pricingMode: input.pricingMode,
          priceMinor: input.prices[0]?.priceMinor ?? 0,
          currency: input.prices[0]?.currency ?? "EUR",
          customerSelectable: input.customerSelectable,
          autoSuggested: input.autoSuggested,
          minQuantity: input.minQuantity,
          maxQuantity: input.maxQuantity ?? null,
          includedQuantity: input.includedQuantity,
          luggageCapacityPerUnit: input.luggageCapacityPerUnit ?? null,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
        })
        .where(eq(extraServices.id, id))
        .returning({ id: extraServices.id });

      if (!updated) {
        throw new Error("Extra not found");
      }

      await this.syncTranslations(tx, id, input.translations);
      await this.upsertPrices(tx, id, input.prices);
    });

    const extra = await this.findById(id);

    if (!extra) {
      throw new Error("Failed to load updated extra");
    }

    return extra;
  }

  private async countReservationReferences(extraServiceId: string): Promise<number> {
    const [row] = await this.database
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(reservationItems)
      .where(eq(reservationItems.extraServiceId, extraServiceId));

    return row?.count ?? 0;
  }

  async delete(id: string): Promise<"deleted" | "archived"> {
    const extra = await this.findById(id);

    if (!extra) {
      throw new NotFoundError("Extra not found");
    }

    const reservationCount = await this.countReservationReferences(id);

    if (reservationCount > 0) {
      await this.database
        .update(extraServices)
        .set({
          isActive: false,
          deletedAt: new Date(),
        })
        .where(eq(extraServices.id, id));

      return "archived";
    }

    await this.database.delete(extraServices).where(eq(extraServices.id, id));

    return "deleted";
  }
}
