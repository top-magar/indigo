/**
 * Rate Limiter Service — Upstash Redis backed
 *
 * Replaces the in-memory sliding window with Upstash Ratelimit.
 * Works correctly on Vercel serverless (shared state across instances).
 *
 * Falls back to a permissive no-op when UPSTASH_REDIS_REST_URL is not set (local dev).
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import {
  type RateLimitType,
  type RateLimitConfig,
  getEffectiveRateLimitConfig,
} from "@/config/rate-limits"

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter: number
}

// ── Redis client (lazy init) ──

let _redis: Redis | null = null
function getRedis(): Redis | null {
  if (_redis) return _redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  _redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return _redis
}

// ── Limiter cache (one per type) ──

const limiters = new Map<string, Ratelimit>()

function getLimiter(type: RateLimitType, configOverride?: Partial<RateLimitConfig>): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null

  const key = configOverride ? `${type}:custom` : type
  if (limiters.has(key)) return limiters.get(key)!

  const cfg = getEffectiveRateLimitConfig(type)
  const maxRequests = configOverride?.maxRequests ?? cfg.maxRequests
  const windowMs = configOverride?.windowMs ?? cfg.windowMs
  const windowSec = Math.max(1, Math.round(windowMs / 1000))

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSec} s`),
    prefix: `rl:${type}`,
    analytics: true,
  })
  if (!configOverride) limiters.set(key, limiter)
  return limiter
}

// ── Public API (same interface as before) ──

export class RateLimiter {
  async check(type: RateLimitType, identifier: string, config?: Partial<RateLimitConfig>): Promise<RateLimitResult> {
    const limiter = getLimiter(type, config)
    if (!limiter) return allowAll(type, config) // No Redis → allow (local dev)

    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    const now = Math.floor(Date.now() / 1000)
    const resetSec = Math.floor(reset / 1000)
    return {
      allowed: success,
      limit,
      remaining,
      resetTime: resetSec,
      retryAfter: success ? 0 : Math.max(0, resetSec - now),
    }
  }

  checkMultiple(type: RateLimitType, identifiers: string[], config?: Partial<RateLimitConfig>): Promise<RateLimitResult> {
    // Use the most specific identifier (last one)
    const id = identifiers[identifiers.length - 1]
    return this.check(type, id, config)
  }
}

function allowAll(type: RateLimitType, config?: Partial<RateLimitConfig>): RateLimitResult {
  const cfg = getEffectiveRateLimitConfig(type)
  const max = config?.maxRequests ?? cfg.maxRequests
  return { allowed: true, limit: max, remaining: max - 1, resetTime: Math.floor(Date.now() / 1000) + 60, retryAfter: 0 }
}

// ── Singleton ──

let _instance: RateLimiter | null = null
export function getRateLimiter(): RateLimiter {
  if (!_instance) _instance = new RateLimiter()
  return _instance
}

// ── Helpers (unchanged interface) ──

export function getClientIp(request: Request): string {
  return (
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetTime),
  }
  if (!result.allowed) {
    headers["Retry-After"] = String(result.retryAfter)
  }
  return headers
}
