import "server-only";

import { resolveLocaleShortLabel } from "@/config/locales";
import { SUPPORTED_LOCALES } from "@/config/locales";
import type { SiteLocaleOption } from "@/features/locales/types";
import type { LocaleRepository } from "@/features/locales/server/repository";

export type { SiteLocaleOption };

export async function resolveSiteLocales(
  repository: LocaleRepository,
): Promise<SiteLocaleOption[]> {
  const enabledLocales = await repository.listActive();

  if (enabledLocales.length > 0) {
    return enabledLocales.map((locale) => ({
      code: locale.code,
      label: locale.label,
      shortLabel: resolveLocaleShortLabel(locale.code),
    }));
  }

  return SUPPORTED_LOCALES.map((locale) => ({
    code: locale.code,
    label: locale.label,
    shortLabel: locale.shortLabel,
  }));
}
