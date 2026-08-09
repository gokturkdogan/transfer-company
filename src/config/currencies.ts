import { DEFAULT_CURRENCY } from "@/config/constants";

export type SupportedCurrency = {
  code: string;
  label: string;
  emoji: string;
};

export const SUPPORTED_CURRENCIES: readonly SupportedCurrency[] = [
  { code: DEFAULT_CURRENCY, label: "Euro (EUR)", emoji: "🇪🇺" },
] as const;

export function findSupportedCurrency(code: string): SupportedCurrency | undefined {
  return SUPPORTED_CURRENCIES.find((currency) => currency.code === code);
}

export function getCurrencyEmoji(code: string): string {
  return findSupportedCurrency(code)?.emoji ?? "💱";
}

export function isSupportedCurrencyCode(code: string): boolean {
  return code.toUpperCase() === DEFAULT_CURRENCY;
}
