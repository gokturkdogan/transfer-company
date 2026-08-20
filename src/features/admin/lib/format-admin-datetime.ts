import { PROJECT_TIME_ZONE } from "@/config/constants";
import { ADMIN_LOCALE } from "@/features/admin/copy";

export function formatReservationOutboundDate(date: Date): string {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    timeZone: PROJECT_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatPdfFilenameDateStamp(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: PROJECT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function sanitizePdfFilenameSegment(value: string): string {
  return value
    .trim()
    .replace(/[/\\:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\.+/g, ".");
}
