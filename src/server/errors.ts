export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "DOMAIN_RULE_VIOLATION"
  | "UNAUTHORIZED"
  | "INFRASTRUCTURE_ERROR"
  | "UNKNOWN_ERROR";

export type PublicErrorPayload = {
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly expose: boolean;

  constructor(
    message: string,
    options: {
      code: ErrorCode;
      statusCode: number;
      fieldErrors?: Record<string, string[]>;
      expose?: boolean;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = this.constructor.name;
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.fieldErrors = options.fieldErrors;
    this.expose = options.expose ?? true;
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      fieldErrors,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, {
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }
}

export class DomainRuleError extends AppError {
  constructor(message: string) {
    super(message, {
      code: "DOMAIN_RULE_VIOLATION",
      statusCode: 422,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, {
      code: "UNAUTHORIZED",
      statusCode: 401,
    });
  }
}

export class InfrastructureError extends AppError {
  constructor(message = "Internal server error", cause?: unknown) {
    super(message, {
      code: "INFRASTRUCTURE_ERROR",
      statusCode: 500,
      expose: false,
      cause,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, {
      code: "DOMAIN_RULE_VIOLATION",
      statusCode: 409,
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toPublicError(error: unknown): PublicErrorPayload {
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.expose ? error.message : "An unexpected error occurred",
      fieldErrors: error.fieldErrors,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
  };
}
