import { createMoney, formatMoney } from "@/lib/money";

export function formatPrice(
  amountMinor: number,
  currency: string,
  locale: string,
): string {
  return formatMoney(createMoney(amountMinor, currency), locale);
}
