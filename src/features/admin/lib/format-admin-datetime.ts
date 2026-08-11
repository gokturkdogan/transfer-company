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
