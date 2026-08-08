import { DEFAULT_LOCALE, type Locale } from "@/config/constants";

const INTL_LOCALE_BY_APP_LOCALE: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-GB",
  de: "de-DE",
  ru: "ru-RU",
  ar: "ar-SA",
};

export function resolveIntlLocale(locale?: string): string {
  if (!locale) {
    return INTL_LOCALE_BY_APP_LOCALE[DEFAULT_LOCALE];
  }

  if (locale in INTL_LOCALE_BY_APP_LOCALE) {
    return INTL_LOCALE_BY_APP_LOCALE[locale as Locale];
  }

  return locale;
}
