import "server-only";

import { asc } from "drizzle-orm";

import { DEFAULT_CURRENCY } from "@/config/constants";
import type { Database } from "@/db/client";
import { enabledCurrencies } from "@/db/schema";

export type EnabledCurrencyRecord = {
  code: string;
  label: string;
  sortOrder: number;
};

export class CurrencyRepository {
  constructor(private readonly database: Database) {}

  async listEnabled(): Promise<EnabledCurrencyRecord[]> {
    return this.database
      .select({
        code: enabledCurrencies.code,
        label: enabledCurrencies.label,
        sortOrder: enabledCurrencies.sortOrder,
      })
      .from(enabledCurrencies)
      .orderBy(asc(enabledCurrencies.sortOrder));
  }

  async listEnabledCodes(): Promise<string[]> {
    const rows = await this.listEnabled();
    return rows.map((row) => row.code);
  }

  async setEnabled(
    currencies: Array<{ code: string; label: string }>,
  ): Promise<void> {
    await this.database.transaction(async (tx) => {
      await tx.delete(enabledCurrencies);

      if (currencies.length === 0) {
        return;
      }

      await tx.insert(enabledCurrencies).values(
        currencies.map((currency, index) => ({
          code: currency.code,
          label: currency.label,
          sortOrder: index,
        })),
      );
    });
  }
}

export async function resolveQuoteCurrency(
  repository: CurrencyRepository,
): Promise<string> {
  const enabled = await repository.listEnabledCodes();

  if (enabled.length === 0) {
    return DEFAULT_CURRENCY;
  }

  if (enabled.includes(DEFAULT_CURRENCY)) {
    return DEFAULT_CURRENCY;
  }

  return enabled[0]!;
}
