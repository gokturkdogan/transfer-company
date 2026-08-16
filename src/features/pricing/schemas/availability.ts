import { z } from "zod";

import { MIN_BOOKING_LEAD_MINUTES } from "@/config/constants";
import { TRIP_TYPES } from "@/db/schema/enums";
import { quoteExtraSelectionSchema, quoteVehicleSelectionSchema } from "@/features/pricing/schemas/quote";
import { addMinutes } from "@/lib/datetime";
import { wallClockDateTimeSchema } from "@/lib/schemas/datetime";

const positiveInt = z.number().int().positive();
const nonNegativeInt = z.number().int().min(0);
const MAX_PASSENGER_COUNT = 50;
const MAX_LUGGAGE_COUNT = 50;

export const quoteSelectionInputSchema = z.object({
  vehicles: z.array(quoteVehicleSelectionSchema).min(1),
  extras: z.array(quoteExtraSelectionSchema).default([]),
});

export const transferAvailabilityInputSchema = z
  .object({
    originAirportId: z.string().uuid(),
    destinationDistrictId: z.string().uuid(),
    isReverseDirection: z.boolean().optional(),
    tripType: z.enum(TRIP_TYPES),
    outboundAt: wallClockDateTimeSchema,
    returnAt: wallClockDateTimeSchema.optional(),
    passengerCount: positiveInt.max(MAX_PASSENGER_COUNT),
    infantCount: nonNegativeInt.max(MAX_PASSENGER_COUNT).optional().default(0),
    largeLuggageCount: nonNegativeInt.max(MAX_LUGGAGE_COUNT),
    cabinLuggageCount: nonNegativeInt.max(MAX_LUGGAGE_COUNT).default(0),
    locale: z.string().min(2).max(5),
    selection: quoteSelectionInputSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
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

    const minimumOutboundAt = addMinutes(new Date(), MIN_BOOKING_LEAD_MINUTES);

    if (value.outboundAt < minimumOutboundAt) {
      ctx.addIssue({
        code: "custom",
        message: "Outbound date must be at least the minimum booking lead time",
        path: ["outboundAt"],
      });
    }
  });

export type TransferAvailabilityInputDto = z.infer<
  typeof transferAvailabilityInputSchema
>;
