export const ADMIN_LOCATION_TYPES = [
  "AIRPORT",
  "CITY",
  "DISTRICT",
  "HOTEL",
] as const;

export type AdminLocationType = (typeof ADMIN_LOCATION_TYPES)[number];

export function isAdminLocationType(value: string): value is AdminLocationType {
  return (ADMIN_LOCATION_TYPES as readonly string[]).includes(value);
}

export function isAdminLocationSlug(
  value: string,
): value is "airports" | "cities" | "districts" | "hotels" {
  return (
    value === "airports" ||
    value === "cities" ||
    value === "districts" ||
    value === "hotels"
  );
}
