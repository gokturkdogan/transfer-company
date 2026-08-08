import { DEFAULT_LOCALE } from "@/config/constants";

export function resolveTranslatedValue(
  locale: string,
  translations: Map<string, string> | Record<string, string | undefined>,
  fallback: string,
): string {
  const map =
    translations instanceof Map
      ? translations
      : new Map(
          Object.entries(translations).filter(
            (entry): entry is [string, string] =>
              typeof entry[1] === "string" && entry[1].length > 0,
          ),
        );

  return (
    map.get(locale) ??
    map.get(DEFAULT_LOCALE) ??
    map.values().next().value ??
    fallback
  );
}

export function toTranslationMap(
  rows: Array<{ locale: string; value: string }>,
): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [row.locale, row.value]));
}
