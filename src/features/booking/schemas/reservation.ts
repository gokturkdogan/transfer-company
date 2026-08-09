import { z } from "zod";

import { MIN_BOOKING_LEAD_MINUTES } from "@/config/constants";
import { TRIP_TYPES } from "@/db/schema/enums";
import {
  quoteExtraSelectionSchema,
  quoteVehicleSelectionSchema,
} from "@/features/pricing/schemas/quote";
import { addMinutes } from "@/lib/datetime";
import { wallClockDateTimeSchema } from "@/lib/schemas/datetime";

const positiveInt = z.number().int().positive();
const nonNegativeInt = z.number().int().min(0);

export const customerInputSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(5).max(32),
  whatsappPhone: z.string().min(5).max(32).optional(),
});

export const antiSpamInputSchema = z.object({
  website: z.string().max(0).optional(),
  formStartedAt: z.number().int().positive().optional(),
});

export const customDestinationInputSchema = z.object({
  name: z.string().min(2).max(255),
  address: z.string().max(1000).optional(),
});

export const createReservationInputSchema = z
  .object({
    routeId: z.string().uuid(),
    originAirportId: z.string().uuid(),
    destinationDistrictId: z.string().uuid(),
    isReverseDirection: z.boolean().optional(),
    hotelLocationId: z.string().uuid().optional(),
    customDestination: customDestinationInputSchema.optional(),
    tripType: z.enum(TRIP_TYPES),
    outboundAt: wallClockDateTimeSchema,
    returnAt: wallClockDateTimeSchema.optional(),
    outboundFlightNumber: z.string().max(16).optional(),
    returnFlightNumber: z.string().max(16).optional(),
    passengerCount: positiveInt,
    largeLuggageCount: nonNegativeInt,
    cabinLuggageCount: nonNegativeInt.default(0),
    vehicles: z.array(quoteVehicleSelectionSchema).min(1),
    extras: z.array(quoteExtraSelectionSchema).default([]),
    customer: customerInputSchema,
    notes: z.string().max(2000).optional(),
    locale: z.string().min(2).max(5),
    clientQuotedTotalMinor: z.number().int().min(0).optional(),
    ...antiSpamInputSchema.shape,
  })
  .strict()
  .superRefine((value, ctx) => {
    const minimumOutboundAt = addMinutes(new Date(), MIN_BOOKING_LEAD_MINUTES);

    if (value.outboundAt < minimumOutboundAt) {
      ctx.addIssue({
        code: "custom",
        message: `Outbound transfer must be at least ${MIN_BOOKING_LEAD_MINUTES} minutes from now`,
        path: ["outboundAt"],
      });
    }

    if (value.tripType === "ROUND_TRIP" && !value.returnAt) {
      ctx.addIssue({
        code: "custom",
        message: "Return date is required for round trips",
        path: ["returnAt"],
      });
    }

    if (value.returnAt && value.returnAt <= value.outboundAt) {
      ctx.addIssue({
        code: "custom",
        message: "Return date must be after outbound date",
        path: ["returnAt"],
      });
    }

    if (value.hotelLocationId && value.customDestination) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either a hotel or a custom destination, not both",
        path: ["hotelLocationId"],
      });
    }
  });

export type CreateReservationInputDto = z.infer<
  typeof createReservationInputSchema
>;
