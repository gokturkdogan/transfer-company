import { PROJECT_TIME_ZONE } from "@/config/constants";
import { zonedWallClockToUtc } from "@/lib/datetime";
import {
  parseIsoDate,
  toIsoDate,
} from "@/features/booking/lib/search-datetime";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ReservationDateRangeFilter = {
  outboundFrom: Date;
  outboundToExclusive: Date;
  fromIso: string;
  toIso: string;
};

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function addDaysToIsoDate(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function parseReservationDateRangeFilter(
  from?: string,
  to?: string,
): ReservationDateRangeFilter | null {
  if (!from || !isValidIsoDate(from)) {
    return null;
  }

  const toIso =
    to && isValidIsoDate(to) && to >= from ? to : from;

  const outboundFrom = zonedWallClockToUtc(`${from}T00:00`, PROJECT_TIME_ZONE);
  const outboundToExclusive = zonedWallClockToUtc(
    `${addDaysToIsoDate(toIso, 1)}T00:00`,
    PROJECT_TIME_ZONE,
  );

  return {
    outboundFrom,
    outboundToExclusive,
    fromIso: from,
    toIso,
  };
}

export function buildAdminReservationsHref(options: {
  status?: string;
  from?: string;
  to?: string;
}): string {
  const params = new URLSearchParams();

  if (options.status && options.status !== "all") {
    params.set("status", options.status);
  }

  if (options.from && isValidIsoDate(options.from)) {
    params.set("from", options.from);

    if (
      options.to &&
      isValidIsoDate(options.to) &&
      options.to >= options.from
    ) {
      params.set("to", options.to);
    }
  }

  const query = params.toString();
  return query ? `/admin/reservations?${query}` : "/admin/reservations";
}

export function formatAdminDateFilterLabel(
  fromIso: string,
  toIso: string,
  locale = "tr-TR",
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const fromLabel = formatter.format(parseIsoDate(fromIso));

  if (fromIso === toIso) {
    return fromLabel;
  }

  const toLabel = formatter.format(parseIsoDate(toIso));
  return `${fromLabel} – ${toLabel}`;
}
