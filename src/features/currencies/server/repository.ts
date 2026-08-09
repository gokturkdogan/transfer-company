import "server-only";

import { DEFAULT_CURRENCY } from "@/config/constants";
import type { Database } from "@/db/client";
import { enabledCurrencies } from "@/db/schema";

export type EnabledCurrencyRecord = {
  code: string;
  label: string;
  sortOrder: number;
};

const EUR_CURRENCY: EnabledCurrencyRecord = {
  code: DEFAULT_CURRENCY,
  label: "Euro (EUR)",
  sortOrder: 0,
};

export class CurrencyRepository {
  constructor(private readonly database: Database) {}

  async listEnabled(): Promise<EnabledCurrencyRecord[]> {
    return [EUR_CURRENCY];
  }

  async listEnabledCodes(): Promise<string[]> {
    return [DEFAULT_CURRENCY];
  }

  async setEnabled(
    currencies: Array<{ code: string; label: string }>,
  ): Promise<void> {
    await this.database.transaction(async (tx) => {
      await tx.delete(enabledCurrencies);

      await tx.insert(enabledCurrencies).values({
        code: DEFAULT_CURRENCY,
        label: "Euro (EUR)",
        sortOrder: 0,
      });
    });
  }
}

export async function resolveQuoteCurrency(
  _repository?: CurrencyRepository,
): Promise<string> {
  return DEFAULT_CURRENCY;
}
