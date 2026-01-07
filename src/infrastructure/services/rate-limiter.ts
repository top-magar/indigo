/**
 * Rate Limiter Service
 * 
 * In-memory rate limiting using sliding window algorithm.
 * Supports per-IP, per-tenant, and per-user limits.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 6.2
 * 
 * Design Notes:
 * - Uses sliding window for smooth rate limiting
 * - In-memory Map for MVP (easy to swap to Redis later)
 * - Automatic cleanup of expired entries
 * - Thread-safe for single-process Node.js
 */

import { 
  type RateLimitType, 
  type RateLimitConfig,
  getEffectiveRateLimitConfig 
} from "@/config/rate-limits";

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Maximum requests allowed in the window */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Unix timestamp (seconds) when the limit resets */
  resetTime: number;
  /** Seconds until the limit resets (for Retry-After header) */
  retryAfter: number;
}

/**
 * Sliding window entry
 */
interface WindowEntry {
  /** Request timestamps within the window */
  timestamps: number[];
  /** When this entry was last accessed (for cleanup) */
  lastAccess: number;
}

/**
 * Rate limiter storage interface
 * Allows easy swap to Redis or other backends
 */
export interface RateLimiterStorage {
  get(key: string): WindowEntry | undefined;
  set(key: string, entry: WindowEntry): void;
  delete(key: string): void;
  keys(): IterableIterator<string>;
}


/**
 * In-memory storage implementation
 */
class InMemoryStorage implements RateLimiterStorage {
  private store = new Map<string, WindowEntry>();

  get(key: string): WindowEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, entry: WindowEntry): void {
    this.store.set(key, entry);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  keys(): IterableIterator<string> {
    return this.store.keys();
  }
}

/**
 * Rate Limiter Service
 * 
 * Implements sliding window rate limiting algorithm.
 * 
 * @example
 * const limiter = new RateLimiter();
 * const result = limiter.check("storefront", "192.168.1.1");
 * if (!result.allowed) {
 *   return new Response("Too Many Requests", { status: 429 });
 * }
 */
export class RateLimiter {
  private storage: RateLimiterStorage;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  
  /** How often to run cleanup (default: 1 minute) */
  private readonly cleanupIntervalMs: number;
  
  /** How long to keep entries after last access (default: 5 minutes) */
  private readonly entryTtlMs: number;

  constructor(options?: {
    storage?: RateLimiterStorage;
    cleanupIntervalMs?: number;
    entryTtlMs?: number;
  }) {
    this.storage = options?.storage ?? new InMemoryStorage();
    this.cleanupIntervalMs = options?.cleanupIntervalMs ?? 60 * 1000;
    this.entryTtlMs = options?.entryTtlMs ?? 5 * 60 * 1000;
    
    // Start cleanup interval
    this.startCleanup();
  }


  /**
   * Check if a request is allowed under rate limits
   * 
   * @param type - The endpoint type for rate limit config
   * @param identifier - Unique identifier (IP, user ID, or tenant ID)
   * @param config - Optional custom config (overrides default)
   */
  check(
    type: RateLimitType,
    identifier: string,
    config?: Partial<RateLimitConfig>
  ): RateLimitResult {
    const effectiveConfig = {
      ...getEffectiveRateLimitConfig(type),
      ...config,
    };
    
    const { maxRequests, windowMs } = effectiveConfig;
    const key = this.buildKey(type, identifier);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create entry
    let entry = this.storage.get(key);
    if (!entry) {
      entry = { timestamps: [], lastAccess: now };
    }

    // Filter timestamps within the current window (sliding window)
    const validTimestamps = entry.timestamps.filter(ts => ts > windowStart);
    
    // Calculate remaining requests
    const requestCount = validTimestamps.length;
    const remaining = Math.max(0, maxRequests - requestCount);
    const allowed = requestCount < maxRequests;

    // Calculate reset time
    const oldestTimestamp = validTimestamps[0] || now;
    const resetTime = Math.ceil((oldestTimestamp + windowMs) / 1000);
    const retryAfter = Math.max(0, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

    // If allowed, add current timestamp
    if (allowed) {
      validTimestamps.push(now);
    }

    // Update storage
    this.storage.set(key, {
      timestamps: validTimestamps,
      lastAccess: now,
    });

    return {
      allowed,
      limit: maxRequests,
      remaining: allowed ? remaining - 1 : 0,
      resetTime,
      retryAfter,
    };
  }


  /**
   * Check rate limit with multiple identifiers (e.g., IP + tenant)
   * Returns the most restrictive result
   */
  checkMultiple(
    type: RateLimitType,
    identifiers: string[],
    config?: Partial<RateLimitConfig>
  ): RateLimitResult {
    const results = identifiers.map(id => this.check(type, id, config));
    
    // Return the most restrictive result (lowest remaining)
    return results.reduce((most, current) => {
      if (!current.allowed) return current;
      if (!most.allowed) return most;
      return current.remaining < most.remaining ? current : most;
    });
  }

  /**
   * Reset rate limit for an identifier
   * Useful for testing or admin override
   */
  reset(type: RateLimitType, identifier: string): void {
    const key = this.buildKey(type, identifier);
    this.storage.delete(key);
  }

  /**
   * Get current usage for an identifier without incrementing
   */
  getUsage(type: RateLimitType, identifier: string): RateLimitResult {
    const config = getEffectiveRateLimitConfig(type);
    const { maxRequests, windowMs } = config;
    const key = this.buildKey(type, identifier);
    const now = Date.now();
    const windowStart = now - windowMs;

    const entry = this.storage.get(key);
    if (!entry) {
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests,
        resetTime: Math.ceil((now + windowMs) / 1000),
        retryAfter: 0,
      };
    }

    const validTimestamps = entry.timestamps.filter(ts => ts > windowStart);
    const requestCount = validTimestamps.length;
    const remaining = Math.max(0, maxRequests - requestCount);
    const oldestTimestamp = validTimestamps[0] || now;

    return {
      allowed: requestCount < maxRequests,
      limit: maxRequests,
      remaining,
      resetTime: Math.ceil((oldestTimestamp + windowMs) / 1000),
      retryAfter: Math.max(0, Math.ceil((oldestTimestamp + windowMs - now) / 1000)),
    };
  }


  /**
   * Build storage key
   */
  private buildKey(type: RateLimitType, identifier: string): string {
    return `ratelimit:${type}:${identifier}`;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalMs);

    // Don't prevent process exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredBefore = now - this.entryTtlMs;

    for (const key of this.storage.keys()) {
      const entry = this.storage.get(key);
      if (entry && entry.lastAccess < expiredBefore) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Stop the cleanup interval
   * Call this when shutting down
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * Singleton rate limiter instance
 * Use this for most cases
 */
let globalRateLimiter: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter();
  }
  return globalRateLimiter;
}


/**
 * Helper to extract client IP from request
 * Handles various proxy headers
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP (client IP)
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Cloudflare
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Vercel
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  // Fallback - this won't work in production but helps in development
  return "unknown";
}

/**
 * Build rate limit headers for response
 */
export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetTime.toString(),
    ...(result.allowed ? {} : { "Retry-After": result.retryAfter.toString() }),
  };
}
