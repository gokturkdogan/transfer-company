import "server-only";

import { asc, eq, notInArray } from "drizzle-orm";

import type { Database } from "@/db/client";
import { enabledLocales } from "@/db/schema";

export type EnabledLocaleRecord = {
  code: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
};

export type UpsertEnabledLocaleInput = {
  code: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
};

export class LocaleRepository {
  constructor(private readonly database: Database) {}

  async listAll(): Promise<EnabledLocaleRecord[]> {
    return this.database
      .select({
        code: enabledLocales.code,
        label: enabledLocales.label,
        sortOrder: enabledLocales.sortOrder,
        isActive: enabledLocales.isActive,
      })
      .from(enabledLocales)
      .orderBy(asc(enabledLocales.sortOrder), asc(enabledLocales.code));
  }

  async listActive(): Promise<EnabledLocaleRecord[]> {
    return this.database
      .select({
        code: enabledLocales.code,
        label: enabledLocales.label,
        sortOrder: enabledLocales.sortOrder,
        isActive: enabledLocales.isActive,
      })
      .from(enabledLocales)
      .where(eq(enabledLocales.isActive, true))
      .orderBy(asc(enabledLocales.sortOrder), asc(enabledLocales.code));
  }

  async listActiveCodes(): Promise<string[]> {
    const rows = await this.listActive();
    return rows.map((row) => row.code);
  }

  async sync(locales: UpsertEnabledLocaleInput[]): Promise<EnabledLocaleRecord[]> {
    const keptCodes = locales.map((locale) => locale.code);

    await this.database.transaction(async (tx) => {
      if (keptCodes.length === 0) {
        await tx.delete(enabledLocales);
      } else {
        await tx
          .delete(enabledLocales)
          .where(notInArray(enabledLocales.code, keptCodes));
      }

      for (const locale of locales) {
        const [existing] = await tx
          .select({ code: enabledLocales.code })
          .from(enabledLocales)
          .where(eq(enabledLocales.code, locale.code))
          .limit(1);

        if (existing) {
          await tx
            .update(enabledLocales)
            .set({
              label: locale.label,
              sortOrder: locale.sortOrder,
              isActive: locale.isActive,
            })
            .where(eq(enabledLocales.code, locale.code));
          continue;
        }

        await tx.insert(enabledLocales).values({
          code: locale.code,
          label: locale.label,
          sortOrder: locale.sortOrder,
          isActive: locale.isActive,
        });
      }
    });

    return this.listAll();
  }
}
