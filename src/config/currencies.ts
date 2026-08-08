export type SupportedCurrency = {
  code: string;
  label: string;
  emoji: string;
};

export const SUPPORTED_CURRENCIES: readonly SupportedCurrency[] = [
  { code: "EUR", label: "Euro (EUR)", emoji: "🇪🇺" },
  { code: "TRY", label: "Türk Lirası (TRY)", emoji: "🇹🇷" },
  { code: "USD", label: "ABD Doları (USD)", emoji: "🇺🇸" },
  { code: "GBP", label: "İngiliz Sterlini (GBP)", emoji: "🇬🇧" },
  { code: "RUB", label: "Rus Rublesi (RUB)", emoji: "🇷🇺" },
  { code: "AED", label: "BAE Dirhemi (AED)", emoji: "🇦🇪" },
] as const;

export function findSupportedCurrency(code: string): SupportedCurrency | undefined {
  return SUPPORTED_CURRENCIES.find((currency) => currency.code === code);
}

export function getCurrencyEmoji(code: string): string {
  return findSupportedCurrency(code)?.emoji ?? "💱";
}

export function isSupportedCurrencyCode(code: string): boolean {
  return SUPPORTED_CURRENCIES.some((currency) => currency.code === code);
}
