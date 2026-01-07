/**
 * Rate Limit Middleware
 * 
 * Middleware wrapper for API routes with rate limiting.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 6.2
 * 
 * Usage:
 * ```ts
 * import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
 * 
 * export const GET = withRateLimit("storefront", async (request, context) => {
 *   // Your handler logic
 * });
 * ```
 */

import { type RateLimitType, type RateLimitConfig } from "@/config/rate-limits";
import { 
  getRateLimiter, 
  getClientIp, 
  buildRateLimitHeaders,
  type RateLimitResult 
} from "@/infrastructure/services/rate-limiter";
import { ErrorCodes } from "@/shared/errors";

/**
 * Rate limit identifier type
 */
export type RateLimitIdentifier = "ip" | "user" | "tenant" | "custom";

/**
 * Rate limit middleware options
 */
export interface RateLimitOptions {
  /** Override the default config for this endpoint */
  config?: Partial<RateLimitConfig>;
  
  /** 
   * How to identify the client (default: "ip")
   * - "ip": Use client IP address
   * - "user": Use user ID from context (requires auth)
   * - "tenant": Use tenant ID from context
   * - "custom": Use custom identifier from getIdentifier function
   */
  identifierType?: RateLimitIdentifier;
  
  /**
   * Custom function to extract identifier from request
   * Required when identifierType is "custom"
   */
  getIdentifier?: (request: Request, context: RouteContext) => string | string[] | null;
  
  /**
   * Skip rate limiting for certain requests
   */
  skip?: (request: Request, context: RouteContext) => boolean;
  
  /**
   * Custom handler when rate limit is exceeded
   */
  onRateLimited?: (
    request: Request, 
    context: RouteContext, 
    result: RateLimitResult
  ) => Response | Promise<Response>;
}

/**
 * Route context type (Next.js App Router)
 * Using generic Record to support any route params
 */
export interface RouteContext {
  params: Promise<Record<string, string>>;
}

/**
 * Route handler type - generic to support specific param types
 */
export type RouteHandler<TParams extends Record<string, string> = Record<string, string>> = (
  request: Request,
  context: { params: Promise<TParams> }
) => Response | Promise<Response>;

/**
 * Create a rate-limited route handler
 * 
 * @param type - The rate limit type (determines limits)
 * @param handler - The actual route handler
 * @param options - Additional options
 * 
 * @example
 * // Basic usage with IP-based limiting
 * export const GET = withRateLimit("storefront", async (request, context) => {
 *   return new Response("OK");
 * });
 * 
 * @example
 * // With custom options
 * export const POST = withRateLimit("checkout", handler, {
 *   config: { maxRequests: 5 }, // Override default
 *   skip: (req) => req.headers.get("x-internal") === "true",
 * });
 */
export function withRateLimit<TParams extends Record<string, string> = Record<string, string>>(
  type: RateLimitType,
  handler: RouteHandler<TParams>,
  options: RateLimitOptions = {}
): RouteHandler<TParams> {
  const {
    config,
    identifierType = "ip",
    getIdentifier,
    skip,
    onRateLimited,
  } = options;

  return async (request: Request, context: { params: Promise<TParams> }): Promise<Response> => {
    // Check if we should skip rate limiting
    if (skip?.(request, context as RouteContext)) {
      return handler(request, context);
    }

    // Get identifier(s) for rate limiting
    const identifiers = await resolveIdentifiers(
      request, 
      context as RouteContext, 
      identifierType, 
      getIdentifier
    );

    if (!identifiers || identifiers.length === 0) {
      // If we can't identify the client, allow the request but log it
      console.warn("[RateLimit] Could not identify client, allowing request");
      return handler(request, context);
    }

    // Check rate limit
    const limiter = getRateLimiter();
    const result = limiter.checkMultiple(type, identifiers, config);

    // Build rate limit headers
    const rateLimitHeaders = buildRateLimitHeaders(result);

    if (!result.allowed) {
      // Rate limit exceeded
      if (onRateLimited) {
        return onRateLimited(request, context as RouteContext, result);
      }

      return createRateLimitedResponse(result, rateLimitHeaders);
    }

    // Execute the handler
    const response = await handler(request, context);

    // Add rate limit headers to successful response
    return addHeadersToResponse(response, rateLimitHeaders);
  };
}

/**
 * Resolve identifiers based on identifier type
 */
async function resolveIdentifiers(
  request: Request,
  context: RouteContext,
  identifierType: RateLimitIdentifier,
  getIdentifier?: (request: Request, context: RouteContext) => string | string[] | null
): Promise<string[]> {
  switch (identifierType) {
    case "ip":
      const ip = getClientIp(request);
      return ip ? [ip] : [];

    case "user":
      // Extract user ID from auth header or session
      // This is a placeholder - implement based on your auth system
      const userId = request.headers.get("x-user-id");
      if (userId) return [userId];
      // Fallback to IP if no user
      const fallbackIp = getClientIp(request);
      return fallbackIp ? [fallbackIp] : [];

    case "tenant":
      // Extract tenant from params
      const params = await context.params;
      const tenantSlug = params.slug || params.tenantId;
      if (tenantSlug) return [tenantSlug];
      // Fallback to IP if no tenant
      const tenantFallbackIp = getClientIp(request);
      return tenantFallbackIp ? [tenantFallbackIp] : [];

    case "custom":
      if (!getIdentifier) {
        console.warn("[RateLimit] Custom identifier type requires getIdentifier function");
        return [];
      }
      const customId = getIdentifier(request, context);
      if (!customId) return [];
      return Array.isArray(customId) ? customId : [customId];

    default:
      return [];
  }
}

/**
 * Create rate limited error response
 */
function createRateLimitedResponse(
  result: RateLimitResult,
  headers: Record<string, string>
): Response {
  const body = {
    error: "Too many requests. Please try again later.",
    code: ErrorCodes.RATE_LIMITED,
    retryAfter: result.retryAfter,
    requestId: crypto.randomUUID(),
  };

  return new Response(JSON.stringify(body), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Add headers to an existing response
 */
function addHeadersToResponse(
  response: Response,
  headers: Record<string, string>
): Response {
  // Clone the response to make it mutable
  const newHeaders = new Headers(response.headers);
  
  for (const [key, value] of Object.entries(headers)) {
    newHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Higher-order function to create rate-limited handlers for specific types
 * 
 * @example
 * const withStorefrontRateLimit = createRateLimitMiddleware("storefront");
 * export const GET = withStorefrontRateLimit(handler);
 */
export function createRateLimitMiddleware(
  type: RateLimitType,
  defaultOptions: RateLimitOptions = {}
) {
  return <TParams extends Record<string, string> = Record<string, string>>(
    handler: RouteHandler<TParams>, 
    options: RateLimitOptions = {}
  ): RouteHandler<TParams> => {
    return withRateLimit(type, handler, { ...defaultOptions, ...options });
  };
}

/**
 * Pre-configured middleware for common endpoint types
 */
export const withStorefrontRateLimit = createRateLimitMiddleware("storefront");
export const withDashboardRateLimit = createRateLimitMiddleware("dashboard", { 
  identifierType: "user" 
});
export const withCheckoutRateLimit = createRateLimitMiddleware("checkout");
export const withCartRateLimit = createRateLimitMiddleware("cart");
export const withVisualEditorRateLimit = createRateLimitMiddleware("visualEditor", { 
  identifierType: "user" 
});
export const withAuthRateLimit = createRateLimitMiddleware("auth");
