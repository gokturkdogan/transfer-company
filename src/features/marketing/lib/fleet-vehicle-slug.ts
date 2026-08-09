export function toFleetVehiclePath(code: string): `/fleet/${string}` {
  return `/fleet/${code.trim().toLowerCase()}`;
}

export function normalizeFleetVehicleCode(slug: string): string {
  return slug.trim().toUpperCase();
}
