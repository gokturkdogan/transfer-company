/**
 * Admin UI-facing enum re-exports.
 * Prefer this module over importing `@/db/schema/enums` from React components
 * so client bundles stay decoupled from Drizzle schema modules.
 */
export {
  CONTACT_CHANNEL_TYPES,
  EXTRA_PRICING_MODES,
  RESERVATION_STATUSES,
  type ContactChannelType,
  type ExtraPricingMode,
  type ReservationStatus,
  type TripType,
} from "@/db/schema/enums";
