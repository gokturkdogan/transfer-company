import { z } from "zod";

import { TRIP_TYPES } from "@/db/schema/enums";

const positiveInt = z.number().int().positive();
const nonNegativeInt = z.number().int().min(0);

export const quoteVehicleSelectionSchema = z.object({
  vehicleCategoryId: z.string().uuid(),
  quantity: positiveInt,
});

export const quoteExtraSelectionSchema = z.object({
  extraServiceId: z.string().uuid(),
  quantity: positiveInt,
});

export const transferQuoteInputSchema = z
  .object({
    routeId: z.string().uuid(),
    tripType: z.enum(TRIP_TYPES),
    passengerCount: positiveInt,
    largeLuggageCount: nonNegativeInt,
    cabinLuggageCount: nonNegativeInt.default(0),
    vehicles: z.array(quoteVehicleSelectionSchema).min(1),
    extras: z.array(quoteExtraSelectionSchema).default([]),
    locale: z.string().min(2).max(5),
  })
  .strict();

export type TransferQuoteInputDto = z.infer<typeof transferQuoteInputSchema>;
