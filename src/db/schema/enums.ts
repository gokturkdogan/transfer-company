import { pgEnum } from "drizzle-orm/pg-core";

export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const reservationStatusEnum = pgEnum(
  "reservation_status",
  RESERVATION_STATUSES,
);

export const TRIP_TYPES = ["ONE_WAY", "ROUND_TRIP"] as const;

export type TripType = (typeof TRIP_TYPES)[number];

export const tripTypeEnum = pgEnum("trip_type", TRIP_TYPES);

export const LOCATION_TYPES = [
  "AIRPORT",
  "CITY",
  "DISTRICT",
  "REGION",
  "HOTEL",
  "TRANSFER_POINT",
  "MARINA",
  "CUSTOM_LOCATION",
] as const;

/** @deprecated Use DISTRICT. Kept for legacy rows and PG enum compatibility. */
export const DEPRECATED_LOCATION_TYPES = ["REGION"] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export const locationTypeEnum = pgEnum("location_type", LOCATION_TYPES);

export const EXTRA_PRICING_MODES = ["FIXED", "PER_UNIT"] as const;

export type ExtraPricingMode = (typeof EXTRA_PRICING_MODES)[number];

export const extraPricingModeEnum = pgEnum(
  "extra_pricing_mode",
  EXTRA_PRICING_MODES,
);

export const RESERVATION_ITEM_TYPES = [
  "TRANSFER_VEHICLE",
  "EXTRA_SERVICE",
] as const;

export type ReservationItemType = (typeof RESERVATION_ITEM_TYPES)[number];

export const reservationItemTypeEnum = pgEnum(
  "reservation_item_type",
  RESERVATION_ITEM_TYPES,
);

export const CONTACT_CHANNEL_TYPES = ["EMAIL", "PHONE", "WHATSAPP"] as const;

export type ContactChannelType = (typeof CONTACT_CHANNEL_TYPES)[number];

export const contactChannelTypeEnum = pgEnum(
  "contact_channel_type",
  CONTACT_CHANNEL_TYPES,
);

export const SOCIAL_MEDIA_PLATFORMS = [
  "INSTAGRAM",
  "FACEBOOK",
  "X",
  "YOUTUBE",
  "TIKTOK",
] as const;

export type SocialMediaPlatform = (typeof SOCIAL_MEDIA_PLATFORMS)[number];

export const socialMediaPlatformEnum = pgEnum(
  "social_media_platform",
  SOCIAL_MEDIA_PLATFORMS,
);
