import "server-only";

import { DEFAULT_LOCALE } from "@/config/constants";
import { DomainRuleError } from "@/server/errors";

export type LocaleTranslationMap = Record<string, string>;

export function normalizeLocaleTranslations(
  translations: LocaleTranslationMap,
  enabledLocaleCodes: string[],
): LocaleTranslationMap {
  const normalized: LocaleTranslationMap = {};

  for (const code of enabledLocaleCodes) {
    const value = translations[code]?.trim();
    if (value) {
      normalized[code] = value;
    }
  }

  const defaultValue = translations[DEFAULT_LOCALE]?.trim();
  if (!defaultValue) {
    throw new DomainRuleError("Varsayılan dil için çeviri zorunludur");
  }

  normalized[DEFAULT_LOCALE] = defaultValue;
  return normalized;
}

export function buildEmptyTranslationMap(
  enabledLocaleCodes: string[],
  seed?: LocaleTranslationMap,
): LocaleTranslationMap {
  return Object.fromEntries(
    enabledLocaleCodes.map((code) => [code, seed?.[code] ?? ""]),
  );
}
