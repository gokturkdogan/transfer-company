import type { Locale } from "@/config/constants";

export type SupportedLocale = {
  code: Locale;
  label: string;
  shortLabel: string;
  emoji: string;
};

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  { code: "tr", label: "Türkçe", shortLabel: "TR", emoji: "🇹🇷" },
  { code: "en", label: "English", shortLabel: "EN", emoji: "🇬🇧" },
  { code: "de", label: "Deutsch", shortLabel: "DE", emoji: "🇩🇪" },
  { code: "ru", label: "Русский", shortLabel: "RU", emoji: "🇷🇺" },
  { code: "ar", label: "العربية", shortLabel: "AR", emoji: "🇸🇦" },
] as const;

export function findSupportedLocale(code: string): SupportedLocale | undefined {
  return SUPPORTED_LOCALES.find((locale) => locale.code === code);
}

export function getLocaleEmoji(code: string): string {
  return findSupportedLocale(code)?.emoji ?? "🌐";
}

export function isSupportedLocaleCode(code: string): code is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale.code === code);
}

export function resolveLocaleShortLabel(code: string): string {
  return findSupportedLocale(code)?.shortLabel ?? code.toUpperCase();
}
