import type { LocationType } from "@/db/schema/enums";

import { LocationDomainError } from "@/features/locations/domain/errors";

export type LocationHierarchyRecord = {
  id: string;
  type: LocationType;
  parentId: string | null;
  isActive: boolean;
};

const ALLOWED_PARENTS: Record<
  LocationType,
  readonly (LocationType | null)[]
> = {
  CITY: [null],
  DISTRICT: ["CITY"],
  HOTEL: ["DISTRICT"],
  AIRPORT: ["CITY", null],
  MARINA: ["DISTRICT", "CITY", null],
  TRANSFER_POINT: ["DISTRICT", "CITY", null],
  CUSTOM_LOCATION: [null],
  REGION: [null],
};

export function assertValidParent(
  childType: LocationType,
  parentType: LocationType | null,
): void {
  const allowed = ALLOWED_PARENTS[childType];

  if (!allowed.includes(parentType)) {
    throw new LocationDomainError(
      `Invalid parent type ${parentType ?? "null"} for ${childType}`,
    );
  }
}

export function assertHotelInDistrict(
  hotel: LocationHierarchyRecord,
  districtId: string,
): void {
  if (hotel.type !== "HOTEL") {
    throw new LocationDomainError("Expected a hotel location");
  }

  if (!hotel.isActive) {
    throw new LocationDomainError("Hotel is not active");
  }

  if (hotel.parentId !== districtId) {
    throw new LocationDomainError("Hotel does not belong to the selected district");
  }
}

export function assertPriceableEndpoints(
  origin: LocationHierarchyRecord,
  destination: LocationHierarchyRecord,
): void {
  if (origin.type !== "AIRPORT" || !origin.isActive) {
    throw new LocationDomainError("Origin must be an active airport");
  }

  if (destination.type !== "DISTRICT" || !destination.isActive) {
    throw new LocationDomainError("Destination must be an active district");
  }
}

export function isDeprecatedLocationType(type: LocationType): boolean {
  return type === "REGION";
}
