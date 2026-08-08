import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { DEFAULT_LOCALE } from "@/config/constants";
import type { Database } from "@/db/client";
import {
  vehicleCategoryFeatures,
  vehicleCategoryFeatureTranslations,
} from "@/db/schema";
import type { LocaleTranslationMap } from "@/features/admin/server/translation-input";

type DbExecutor = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];

export type AdminVehicleFeatureInput = {
  labels: LocaleTranslationMap;
};

export class VehicleFeatureRepository {
  constructor(private readonly database: Database) {}

  async listLabelsByVehicleIds(
    vehicleCategoryIds: string[],
    locale: string,
  ): Promise<Map<string, string[]>> {
    if (vehicleCategoryIds.length === 0) {
      return new Map();
    }

    const features = await this.database
      .select({
        id: vehicleCategoryFeatures.id,
        vehicleCategoryId: vehicleCategoryFeatures.vehicleCategoryId,
        sortOrder: vehicleCategoryFeatures.sortOrder,
      })
      .from(vehicleCategoryFeatures)
      .where(
        inArray(vehicleCategoryFeatures.vehicleCategoryId, vehicleCategoryIds),
      )
      .orderBy(asc(vehicleCategoryFeatures.sortOrder));

    if (features.length === 0) {
      return new Map();
    }

    const featureIds = features.map((feature) => feature.id);
    const translations = await this.database
      .select({
        featureId: vehicleCategoryFeatureTranslations.featureId,
        locale: vehicleCategoryFeatureTranslations.locale,
        label: vehicleCategoryFeatureTranslations.label,
      })
      .from(vehicleCategoryFeatureTranslations)
      .where(inArray(vehicleCategoryFeatureTranslations.featureId, featureIds));

    const labelByFeatureAndLocale = new Map<string, Map<string, string>>();
    for (const translation of translations) {
      const current =
        labelByFeatureAndLocale.get(translation.featureId) ?? new Map();
      current.set(translation.locale, translation.label);
      labelByFeatureAndLocale.set(translation.featureId, current);
    }

    const result = new Map<string, string[]>();

    for (const feature of features) {
      const labels = labelByFeatureAndLocale.get(feature.id);
      const label =
        labels?.get(locale) ?? labels?.get(DEFAULT_LOCALE) ?? null;

      if (!label) {
        continue;
      }

      const current = result.get(feature.vehicleCategoryId) ?? [];
      current.push(label);
      result.set(feature.vehicleCategoryId, current);
    }

    return result;
  }

  async listAdminFeaturesByVehicleId(
    vehicleCategoryId: string,
  ): Promise<AdminVehicleFeatureInput[]> {
    const features = await this.database
      .select({
        id: vehicleCategoryFeatures.id,
        sortOrder: vehicleCategoryFeatures.sortOrder,
      })
      .from(vehicleCategoryFeatures)
      .where(eq(vehicleCategoryFeatures.vehicleCategoryId, vehicleCategoryId))
      .orderBy(asc(vehicleCategoryFeatures.sortOrder));

    if (features.length === 0) {
      return [];
    }

    const translations = await this.database
      .select({
        featureId: vehicleCategoryFeatureTranslations.featureId,
        locale: vehicleCategoryFeatureTranslations.locale,
        label: vehicleCategoryFeatureTranslations.label,
      })
      .from(vehicleCategoryFeatureTranslations)
      .where(
        inArray(
          vehicleCategoryFeatureTranslations.featureId,
          features.map((feature) => feature.id),
        ),
      );

    const labelsByFeature = new Map<string, LocaleTranslationMap>();
    for (const translation of translations) {
      const current = labelsByFeature.get(translation.featureId) ?? {};
      current[translation.locale] = translation.label;
      labelsByFeature.set(translation.featureId, current);
    }

    return features.map((feature) => ({
      labels: labelsByFeature.get(feature.id) ?? {},
    }));
  }

  async syncFeatures(
    executor: DbExecutor,
    vehicleCategoryId: string,
    features: AdminVehicleFeatureInput[],
  ): Promise<void> {
    await executor
      .delete(vehicleCategoryFeatures)
      .where(eq(vehicleCategoryFeatures.vehicleCategoryId, vehicleCategoryId));

    for (const [index, feature] of features.entries()) {
      const defaultLabel = feature.labels[DEFAULT_LOCALE]?.trim();
      if (!defaultLabel) {
        continue;
      }

      const [created] = await executor
        .insert(vehicleCategoryFeatures)
        .values({
          vehicleCategoryId,
          sortOrder: index,
        })
        .returning({ id: vehicleCategoryFeatures.id });

      for (const [locale, label] of Object.entries(feature.labels)) {
        const trimmed = label.trim();
        if (!trimmed) {
          continue;
        }

        await executor.insert(vehicleCategoryFeatureTranslations).values({
          featureId: created.id,
          locale,
          label: trimmed,
        });
      }
    }
  }
}
