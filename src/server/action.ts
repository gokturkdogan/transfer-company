import type { ZodType } from "zod";

import { logger } from "@/server/logger";
import { toPublicError } from "@/server/errors";
import { failure, success, type ActionResult } from "@/server/result";

export async function createAction<TInput, TOutput>(
  schema: ZodType<TInput>,
  handler: (input: TInput) => Promise<TOutput>,
  rawInput: unknown,
): Promise<ActionResult<TOutput>> {
  const parsed = schema.safeParse(rawInput);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<
      string,
      string[]
    >;

    return failure({
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      fieldErrors,
    });
  }

  try {
    const data = await handler(parsed.data);
    return success(data);
  } catch (error) {
    logger.error("Server action failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    const publicError = toPublicError(error);
    return failure(publicError);
  }
}
