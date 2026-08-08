import { z } from "zod";

import { PROJECT_TIME_ZONE } from "@/config/constants";
import { zonedWallClockToUtc } from "@/lib/datetime";

export const wallClockDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, {
    message: "Expected wall-clock datetime format YYYY-MM-DDTHH:mm",
  })
  .transform((value, ctx) => {
    try {
      return zonedWallClockToUtc(value, PROJECT_TIME_ZONE);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message:
          error instanceof Error
            ? error.message
            : "Invalid wall-clock datetime",
      });

      return z.NEVER;
    }
  });
