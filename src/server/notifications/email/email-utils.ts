import { PROJECT_TIME_ZONE } from "@/config/constants";
import { resolveIntlLocale } from "@/lib/intl-locale";

export function formatReservationDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    timeZone: PROJECT_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
