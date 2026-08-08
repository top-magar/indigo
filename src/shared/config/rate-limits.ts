/**
 * Rate Limiting Configuration
 * 
 * Configurable rate limits for different endpoint types.
 * Easy to adjust limits without code changes.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 6.2
 */

/**
 * Rate limit configuration for an endpoint type
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Human-readable description */
  description: string;
}

/**
 * Endpoint types for rate limiting
 */
export type RateLimitType = 
  | "storefront"      // Public storefront API (products, categories)
  | "dashboard"       // Dashboard API (authenticated users)
  | "checkout"        // Checkout/Payment (stricter limits)
  | "cart"            // Cart operations
  | "visualEditor"    // Visual editor operations
  | "auth"            // Authentication endpoints
  | "webhook";        // Webhook endpoints (more lenient)

/**
 * Rate limit configurations by endpoint type
 * 
 * Limits are designed to:
 * - Prevent abuse while allowing legitimate traffic
 * - Be stricter for sensitive operations (checkout, auth)
 * - Be more lenient for read-heavy operations (storefront)
 */
export const rateLimitConfigs: Record<RateLimitType, RateLimitConfig> = {
  /**
   * Public storefront API
   * - Products listing, categories, search
   * - 100 requests per minute per IP
   */
  storefront: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    description: "Public storefront API",
  },

  /**
   * Dashboard API
   * - Authenticated admin operations
   * - 200 requests per minute per user
   */
  dashboard: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 1 minute
    description: "Dashboard API",
  },

  /**
   * Checkout/Payment API
   * - Stricter limits to prevent fraud
   * - 10 requests per minute per IP
   */
  checkout: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    description: "Checkout and payment API",
  },

  /**
   * Cart operations
   * - Add/update/remove items
   * - 60 requests per minute per IP
   */
  cart: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
    description: "Cart operations API",
  },

  /**
   * Visual Editor
   * - Layout/content edits
   * - 100 edits per minute per user
   */
  visualEditor: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    description: "Visual editor operations",
  },

  /**
   * Authentication endpoints
   * - Login, register, password reset
   * - 20 requests per minute per IP (prevent brute force)
   */
  auth: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    description: "Authentication endpoints",
  },

  /**
   * Webhook endpoints
   * - Stripe webhooks, etc.
   * - More lenient as these are server-to-server
   * - 500 requests per minute per IP
   */
  webhook: {
    maxRequests: 500,
    windowMs: 60 * 1000, // 1 minute
    description: "Webhook endpoints",
  },
};

/**
 * Get rate limit config for an endpoint type
 */
export function getRateLimitConfig(type: RateLimitType): RateLimitConfig {
  return rateLimitConfigs[type];
}

/**
 * Override rate limits via environment variables
 * Format: RATE_LIMIT_{TYPE}_MAX and RATE_LIMIT_{TYPE}_WINDOW_MS
 * 
 * @example
 * RATE_LIMIT_CHECKOUT_MAX=5
 * RATE_LIMIT_CHECKOUT_WINDOW_MS=60000
 */
export function getEffectiveRateLimitConfig(type: RateLimitType): RateLimitConfig {
  const baseConfig = rateLimitConfigs[type];
  const envPrefix = `RATE_LIMIT_${type.toUpperCase()}`;
  
  const maxRequests = process.env[`${envPrefix}_MAX`]
    ? parseInt(process.env[`${envPrefix}_MAX`]!, 10)
    : baseConfig.maxRequests;
    
  const windowMs = process.env[`${envPrefix}_WINDOW_MS`]
    ? parseInt(process.env[`${envPrefix}_WINDOW_MS`]!, 10)
    : baseConfig.windowMs;

  return {
    ...baseConfig,
    maxRequests,
    windowMs,
  };
}
