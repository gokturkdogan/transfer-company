import { MIN_BOOKING_LEAD_MINUTES, PROJECT_TIME_ZONE } from "@/config/constants";
import { parseWallClock, utcToZonedWallClock } from "@/lib/datetime";

export const TIME_SLOT_INTERVAL_MINUTES = 15 as const;

const DAY_END_MINUTES = 24 * 60 - TIME_SLOT_INTERVAL_MINUTES;

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIsoDateInProjectZone(): string {
  return utcToZonedWallClock(new Date(), PROJECT_TIME_ZONE).slice(0, 10);
}

export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function ceilMinutesToInterval(minutes: number, interval: number): number {
  return Math.ceil(minutes / interval) * interval;
}

export function getMinimumTimeMinutesForDate(
  dateIso: string,
  minDateIso: string,
): number | null {
  if (dateIso > minDateIso) {
    return null;
  }

  const nowWall = utcToZonedWallClock(new Date(), PROJECT_TIME_ZONE);
  const { hour, minute } = parseWallClock(nowWall);
  const withLead =
    hour * 60 + minute + MIN_BOOKING_LEAD_MINUTES;
  const ceiled = ceilMinutesToInterval(
    withLead,
    TIME_SLOT_INTERVAL_MINUTES,
  );

  if (ceiled > DAY_END_MINUTES) {
    return DAY_END_MINUTES + 1;
  }

  return ceiled;
}

export function buildTimeSlots(dateIso: string, minDateIso: string): string[] {
  const minimumMinutes = getMinimumTimeMinutesForDate(dateIso, minDateIso);
  const startMinutes = minimumMinutes ?? 0;

  if (startMinutes > DAY_END_MINUTES) {
    return [];
  }

  const slots: string[] = [];

  for (
    let minutes = startMinutes;
    minutes <= DAY_END_MINUTES;
    minutes += TIME_SLOT_INTERVAL_MINUTES
  ) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
}

export function getEffectiveMinDateIso(minDateIso: string): string {
  let candidate = minDateIso;

  for (let attempt = 0; attempt < 366; attempt += 1) {
    if (buildTimeSlots(candidate, minDateIso).length > 0) {
      return candidate;
    }

    const nextDate = parseIsoDate(candidate);
    nextDate.setDate(nextDate.getDate() + 1);
    candidate = toIsoDate(nextDate);
  }

  return minDateIso;
}

export function sanitizeTimeForDate(
  dateIso: string,
  time: string,
  minDateIso: string,
): string {
  const slots = buildTimeSlots(dateIso, minDateIso);

  if (slots.length === 0) {
    return time;
  }

  if (slots.includes(time)) {
    return time;
  }

  return slots[0]!;
}

export function formatDateTimeLabel(
  dateIso: string,
  time: string,
  locale: string,
): string {
  if (!dateIso || !time) {
    return "";
  }

  const datePart = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseIsoDate(dateIso));

  return `${datePart}, ${time}`;
}
