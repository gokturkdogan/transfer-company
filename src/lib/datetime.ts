import { PROJECT_TIME_ZONE } from "@/config/constants";

const WALL_CLOCK_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export type WallClockDateTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export type ZonedWallClock = WallClockDateTime & {
  timeZone: string;
};

export function parseWallClock(value: string): WallClockDateTime {
  const match = WALL_CLOCK_PATTERN.exec(value);

  if (!match) {
    throw new Error(
      "Invalid wall-clock datetime. Expected format YYYY-MM-DDTHH:mm",
    );
  }

  const [, year, month, day, hour, minute] = match.map(Number);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59
  ) {
    throw new Error("Invalid wall-clock datetime components");
  }

  return { year, month, day, hour, minute };
}

function formatWallClockParts(parts: WallClockDateTime): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  });

  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((part) => part.type === "timeZoneName")?.value;

  if (!offsetPart || offsetPart === "GMT") {
    return 0;
  }

  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(offsetPart);

  if (!match) {
    throw new Error(`Unable to parse timezone offset for ${timeZone}`);
  }

  const sign = match[1] === "+" ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");

  return sign * (hours * 60 + minutes);
}

export function zonedWallClockToUtc(
  wallClock: string,
  timeZone: string = PROJECT_TIME_ZONE,
): Date {
  const parts = parseWallClock(wallClock);
  const utcGuess = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute),
  );

  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, timeZone);

  return new Date(utcGuess.getTime() - offsetMinutes * 60_000);
}

export function utcToZonedWallClock(
  date: Date,
  timeZone: string = PROJECT_TIME_ZONE,
): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return formatWallClockParts({
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  });
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
