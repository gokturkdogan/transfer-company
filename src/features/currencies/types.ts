export type AcceptedPaymentCurrency = {
  code: string;
  label: string;
  emoji: string;
};

export function formatAcceptedPaymentCurrencyList(
  currencies: AcceptedPaymentCurrency[],
): string {
  return currencies.map((currency) => `${currency.emoji} ${currency.code}`).join(" · ");
}
