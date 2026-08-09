import { ACCOUNTING_CURRENCY } from "@/config/currencies";
import type { AcceptedPaymentCurrency } from "@/features/currencies/types";
import type { EnabledCurrencyRecord } from "@/features/currencies/server/repository";
import { getCurrencyEmoji } from "@/config/currencies";

export function buildAcceptedPaymentCurrencies(
  enabledCashCurrencies: EnabledCurrencyRecord[],
): AcceptedPaymentCurrency[] {
  const cash = enabledCashCurrencies.map((currency) => ({
    code: currency.code,
    label: currency.label,
    emoji: getCurrencyEmoji(currency.code),
  }));

  return [
    {
      code: ACCOUNTING_CURRENCY,
      label: "Euro (EUR)",
      emoji: getCurrencyEmoji(ACCOUNTING_CURRENCY),
    },
    ...cash.filter((currency) => currency.code !== ACCOUNTING_CURRENCY),
  ];
}
