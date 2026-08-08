import { Building2, Hotel, MapPin, Plane, type LucideIcon } from "lucide-react";

import type { AdminLocationType } from "@/features/admin/types/location";

export const LOCATION_TYPE_ICONS: Record<AdminLocationType, LucideIcon> = {
  AIRPORT: Plane,
  CITY: Building2,
  DISTRICT: MapPin,
  HOTEL: Hotel,
};
