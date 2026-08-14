export function toFleetVehiclePath(code: string): `/fleet/${string}` {
  return `/fleet/${code.trim().toLowerCase()}`;
}

export function normalizeFleetVehicleCode(slug: string): string {
  return slug.trim().toUpperCase();
}

/** Turns stored codes like LUGGAGE_VAN into readable labels (Luggage Van). */
export function formatFleetDisplayLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.includes("_")) {
    return trimmed;
  }

  return trimmed
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
