import { DEFAULT_CURRENCY } from "@/config/constants";

export type SupportedCurrency = {
  code: string;
  label: string;
  emoji: string;
};

/** Quote and accounting currency — always EUR. */
export const ACCOUNTING_CURRENCY = DEFAULT_CURRENCY;

/** Cash payment options at the vehicle (admin enable/disable). Pricing is unaffected. */
export const CASH_PAYMENT_CURRENCIES: readonly SupportedCurrency[] = [
  { code: "TRY", label: "Türk Lirası (TRY)", emoji: "🇹🇷" },
  { code: "USD", label: "ABD Doları (USD)", emoji: "🇺🇸" },
  { code: "GBP", label: "İngiliz Sterlini (GBP)", emoji: "🇬🇧" },
  { code: "RUB", label: "Rus Rublesi (RUB)", emoji: "🇷🇺" },
  { code: "AED", label: "BAE Dirhemi (AED)", emoji: "🇦🇪" },
] as const;

export const SUPPORTED_CURRENCIES: readonly SupportedCurrency[] = [
  { code: ACCOUNTING_CURRENCY, label: "Euro (EUR)", emoji: "🇪🇺" },
  ...CASH_PAYMENT_CURRENCIES,
] as const;

export function findSupportedCurrency(code: string): SupportedCurrency | undefined {
  return SUPPORTED_CURRENCIES.find(
    (currency) => currency.code === code.toUpperCase(),
  );
}

export function findCashPaymentCurrency(
  code: string,
): SupportedCurrency | undefined {
  return CASH_PAYMENT_CURRENCIES.find(
    (currency) => currency.code === code.toUpperCase(),
  );
}

export function getCurrencyEmoji(code: string): string {
  return findSupportedCurrency(code)?.emoji ?? "💱";
}

export function isCashPaymentCurrencyCode(code: string): boolean {
  return CASH_PAYMENT_CURRENCIES.some(
    (currency) => currency.code === code.toUpperCase(),
  );
}

export function isSupportedCurrencyCode(code: string): boolean {
  return isCashPaymentCurrencyCode(code);
}
