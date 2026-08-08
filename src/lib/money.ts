import { DEFAULT_CURRENCY } from "@/config/constants";

export type Money = {
  amountMinor: number;
  currency: string;
};

const MINOR_UNIT_FACTOR = 100;

export function createMoney(
  amountMinor: number,
  currency: string = DEFAULT_CURRENCY,
): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new Error("Money amount must be an integer in minor units");
  }

  return { amountMinor, currency };
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return createMoney(a.amountMinor + b.amountMinor, a.currency);
}

export function multiplyMoney(money: Money, multiplier: number): Money {
  if (!Number.isInteger(multiplier) || multiplier < 0) {
    throw new Error("Multiplier must be a non-negative integer");
  }

  return createMoney(money.amountMinor * multiplier, money.currency);
}

export function sumMoney(values: Money[]): Money {
  if (values.length === 0) {
    return createMoney(0, DEFAULT_CURRENCY);
  }

  return values.reduce((total, current) => addMoney(total, current));
}

export function formatMoney(
  money: Money,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    ...options,
  }).format(money.amountMinor / MINOR_UNIT_FACTOR);
}

export function minorToMajor(amountMinor: number): number {
  return amountMinor / MINOR_UNIT_FACTOR;
}

export function majorToMinor(amountMajor: number): number {
  if (!Number.isFinite(amountMajor)) {
    throw new Error("Amount must be a finite number");
  }

  return Math.round(amountMajor * MINOR_UNIT_FACTOR);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error("Cannot operate on money with different currencies");
  }
}
