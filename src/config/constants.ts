export const APP_NAME = "Royal Rhein Transfers" as const;

export const LOCALES = ["tr", "en", "de", "ru", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";

export const ARABIC_LOCALE: Locale = "ar";

export const RTL_LOCALES: readonly Locale[] = ["ar"] as const;

export const DEFAULT_CURRENCY = "EUR" as const;

export const PROJECT_TIME_ZONE = "Europe/Istanbul" as const;

export const MIN_BOOKING_LEAD_MINUTES = 60 as const;

export const RESERVATION_REFERENCE_PREFIX = "TR" as const;

export const RESERVATION_REFERENCE_LENGTH = 6 as const;

export function isRtlLocale(locale: string): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale);
}
