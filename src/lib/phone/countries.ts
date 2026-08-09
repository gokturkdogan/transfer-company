import type { Locale } from "@/config/constants";
import { PHONE_COUNTRY_DATA } from "@/lib/phone/phone-country-data";

export type PhoneCountryDefinition = {
  iso2: string;
  dialCode: string;
};

/** Dial codes for international phone input (ISO 3166-1 alpha-2). */
export const PHONE_COUNTRY_DEFINITIONS: PhoneCountryDefinition[] =
  PHONE_COUNTRY_DATA;

export const DEFAULT_PHONE_COUNTRY_CODE = "TR";

export const PHONE_COUNTRY_PRIORITY = [
  "TR",
  "DE",
  "GB",
  "RU",
  "US",
  "FR",
  "NL",
  "SA",
  "AE",
  "IT",
  "ES",
  "AT",
  "CH",
  "BE",
  "UA",
  "KZ",
  "AZ",
  "PL",
  "RO",
  "BG",
  "GR",
  "SE",
  "NO",
  "DK",
  "FI",
  "IE",
  "PT",
  "CZ",
  "HU",
  "IL",
  "EG",
  "QA",
  "KW",
  "BH",
  "OM",
  "IN",
  "CN",
  "JP",
  "KR",
  "AU",
  "CA",
] as const;

const LOCALE_DEFAULT_PHONE_COUNTRY: Record<Locale, string> = {
  tr: "TR",
  en: "GB",
  de: "DE",
  ru: "RU",
  ar: "SA",
};

export function getPhoneCountryByIso2(
  iso2: string,
): PhoneCountryDefinition | undefined {
  return PHONE_COUNTRY_DEFINITIONS.find(
    (country) => country.iso2 === iso2.toUpperCase(),
  );
}

export function getDefaultPhoneCountryForLocale(locale: string): string {
  return (
    LOCALE_DEFAULT_PHONE_COUNTRY[locale as Locale] ?? DEFAULT_PHONE_COUNTRY_CODE
  );
}

export function getPhoneCountryDisplayName(
  iso2: string,
  locale: string,
): string {
  return (
    new Intl.DisplayNames([locale], { type: "region" }).of(iso2) ?? iso2
  );
}

export function sortPhoneCountries(locale: string): PhoneCountryDefinition[] {
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });
  const priorityIndex = new Map(
    PHONE_COUNTRY_PRIORITY.map((iso2, index) => [iso2, index]),
  );

  return [...PHONE_COUNTRY_DEFINITIONS].sort((left, right) => {
    const leftPriority = priorityIndex.get(
      left.iso2 as (typeof PHONE_COUNTRY_PRIORITY)[number],
    );
    const rightPriority = priorityIndex.get(
      right.iso2 as (typeof PHONE_COUNTRY_PRIORITY)[number],
    );

    if (leftPriority !== undefined || rightPriority !== undefined) {
      if (leftPriority === undefined) {
        return 1;
      }

      if (rightPriority === undefined) {
        return -1;
      }

      return leftPriority - rightPriority;
    }

    const leftName = displayNames.of(left.iso2) ?? left.iso2;
    const rightName = displayNames.of(right.iso2) ?? right.iso2;

    return leftName.localeCompare(rightName, locale);
  });
}
