import { PROJECT_TIME_ZONE } from "@/config/constants";
import { clientEnv } from "@/config/env";
import { resolveIntlLocale } from "@/lib/intl-locale";

export function toAbsoluteAssetUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const base = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;

  return `${base}${path}`;
}

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

/** Escape HTML then preserve line breaks for email clients. */
export function formatMultilineHtml(value: string): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br />");
}
