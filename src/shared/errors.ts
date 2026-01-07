/**
 * Standardized Error Handling
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.5
 * @see SYSTEM-ARCHITECTURE.md Section 6.2.4
 * 
 * Provides consistent error responses across all API endpoints
 */

/**
 * Standard API error response format
 */
export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, string[]>;
  requestId?: string;
}

/**
 * Error codes for consistent error handling
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.5
 */
export const ErrorCodes = {
  // Auth errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_SESSION: "INVALID_SESSION",
  
  // Tenant errors
  TENANT_NOT_FOUND: "TENANT_NOT_FOUND",
  TENANT_SUSPENDED: "TENANT_SUSPENDED",
  INVALID_TENANT: "INVALID_TENANT",
  
  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",
  
  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  
  // Payment errors
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_CANCELLED: "PAYMENT_CANCELLED",
  STRIPE_NOT_CONFIGURED: "STRIPE_NOT_CONFIGURED",
  STRIPE_WEBHOOK_ERROR: "STRIPE_WEBHOOK_ERROR",
  
  // Cart errors
  CART_NOT_FOUND: "CART_NOT_FOUND",
  CART_EMPTY: "CART_EMPTY",
  PRODUCT_NOT_AVAILABLE: "PRODUCT_NOT_AVAILABLE",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  
  // Order errors
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  
  // System errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  RATE_LIMITED: "RATE_LIMITED",
} as const;

export type ErrorCode = keyof typeof ErrorCodes;

/**
 * HTTP status codes for each error type
 */
const ErrorStatusMap: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_SESSION: 401,
  TENANT_NOT_FOUND: 404,
  TENANT_SUSPENDED: 403,
  INVALID_TENANT: 400,
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  CONFLICT: 409,
  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  PAYMENT_FAILED: 402,
  PAYMENT_CANCELLED: 400,
  STRIPE_NOT_CONFIGURED: 400,
  STRIPE_WEBHOOK_ERROR: 400,
  CART_NOT_FOUND: 404,
  CART_EMPTY: 400,
  PRODUCT_NOT_AVAILABLE: 400,
  INSUFFICIENT_STOCK: 400,
  ORDER_NOT_FOUND: 404,
  INVALID_STATUS_TRANSITION: 400,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  RATE_LIMITED: 429,
};

/**
 * Application error class for typed errors
 * 
 * @example
 * throw new AppError("Product not found", "NOT_FOUND");
 * throw new AppError("Invalid email format", "VALIDATION_ERROR", { email: ["Invalid format"] });
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, string[]>;
  public readonly requestId: string;

  constructor(
    message: string,
    code: ErrorCode,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = ErrorStatusMap[code];
    this.details = details;
    this.requestId = crypto.randomUUID();
  }

  /**
   * Convert to API response
   */
  toResponse(): Response {
    return createErrorResponse(this.message, this.code, this.details);
  }

  /**
   * Convert to JSON object
   */
  toJSON(): ApiError {
    return {
      error: this.message,
      code: ErrorCodes[this.code],
      details: this.details,
      requestId: this.requestId,
    };
  }
}

/**
 * Create a standardized error response
 * 
 * @example
 * return createErrorResponse("Not found", "NOT_FOUND");
 * return createErrorResponse("Validation failed", "VALIDATION_ERROR", { name: ["Required"] });
 */
export function createErrorResponse(
  error: string,
  code: ErrorCode,
  details?: Record<string, string[]>
): Response {
  const status = ErrorStatusMap[code];
  const body: ApiError = {
    error,
    code: ErrorCodes[code],
    details,
    requestId: crypto.randomUUID(),
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Create a success response with data
 */
export function createSuccessResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Handle unknown errors and convert to AppError
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Log the original error for debugging
    console.error("[Unhandled Error]", error);
    return new AppError(
      process.env.NODE_ENV === "production" 
        ? "An unexpected error occurred" 
        : error.message,
      "INTERNAL_ERROR"
    );
  }

  return new AppError("An unexpected error occurred", "INTERNAL_ERROR");
}

/**
 * Validate tenant ID format
 * 
 * @see IMPLEMENTATION-PLAN.md Section 5.2 (S6)
 */
export function validateTenantId(tenantId: string | null | undefined): string {
  if (!tenantId) {
    throw new AppError("Tenant ID is required", "INVALID_TENANT");
  }
  
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
    throw new AppError("Invalid tenant ID format", "INVALID_TENANT");
  }
  
  return tenantId;
}
