import { z } from "zod";

import { TRIP_TYPES } from "@/db/schema/enums";
import { quoteExtraSelectionSchema } from "@/features/pricing/schemas/quote";
import { wallClockDateTimeSchema } from "@/lib/schemas/datetime";

const positiveInt = z.number().int().positive();
const nonNegativeInt = z.number().int().min(0);

export const quoteSelectionInputSchema = z.object({
  vehicleCategoryId: z.string().uuid(),
  quantity: positiveInt,
  extras: z.array(quoteExtraSelectionSchema).default([]),
});

export const transferAvailabilityInputSchema = z
  .object({
    originAirportId: z.string().uuid(),
    destinationDistrictId: z.string().uuid(),
    tripType: z.enum(TRIP_TYPES),
    outboundAt: wallClockDateTimeSchema,
    returnAt: wallClockDateTimeSchema.optional(),
    passengerCount: positiveInt,
    largeLuggageCount: nonNegativeInt,
    cabinLuggageCount: nonNegativeInt.default(0),
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
  });

export type TransferAvailabilityInputDto = z.infer<
  typeof transferAvailabilityInputSchema
>;
