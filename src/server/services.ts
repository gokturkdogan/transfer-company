import "server-only";

import { db } from "@/db/client";
import { BookingRepository } from "@/features/booking/server/repository";
import { BookingService } from "@/features/booking/server/service";
import { LocationRepository } from "@/features/locations/server/repository";
import { AvailabilityService } from "@/features/pricing/server/availability-service";
import { PricingRepository } from "@/features/pricing/server/repository";
import { QuoteService } from "@/features/pricing/server/quote-service";
import { notificationService } from "@/server/notifications/logging-notification-service";

const pricingRepository = new PricingRepository(db);
const bookingRepository = new BookingRepository(db);
const locationRepository = new LocationRepository(db);

export const quoteService = new QuoteService(pricingRepository);
export const availabilityService = new AvailabilityService(
  pricingRepository,
  quoteService,
  locationRepository,
);
export const bookingService = new BookingService(
  bookingRepository,
  quoteService,
  pricingRepository,
  locationRepository,
  notificationService,
);

export { locationRepository };
