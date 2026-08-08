import { z } from "zod";

export const bookingDraftSchema = z.object({
  tripType: z.enum(["ONE_WAY", "ROUND_TRIP"]),
  passengerCount: z.number().int().positive(),
  luggageCount: z.number().int().min(0),
});

export type BookingDraftInput = z.infer<typeof bookingDraftSchema>;
