/**
 * Upstash Redis Cache — server-side tenant-scoped caching
 *
 * Replaces in-memory CacheService. Works across serverless instances.
 * Falls back to no-op when UPSTASH_REDIS_REST_URL is not set.
 */

import { Redis } from "@upstash/redis"

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

/** Build a tenant-scoped cache key */
function tenantKey(tenantId: string, key: string): string {
  return `t:${tenantId}:${key}`
}

/**
 * Get a cached value. Returns null on miss or when Redis is unavailable.
 */
export async function cacheGet<T>(tenantId: string, key: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null
  try {
    return await redis.get<T>(tenantKey(tenantId, key))
  } catch {
    return null
  }
}

/**
 * Set a cached value with TTL in seconds.
 */
export async function cacheSet<T>(tenantId: string, key: string, value: T, ttlSeconds = 300): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await redis.set(tenantKey(tenantId, key), value, { ex: ttlSeconds })
  } catch {
    // Cache write failure is non-fatal
  }
}

/**
 * Delete a specific cached key.
 */
export async function cacheDel(tenantId: string, key: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await redis.del(tenantKey(tenantId, key))
  } catch {
    // Ignore
  }
}

/**
 * Invalidate all cache keys for a tenant (pattern delete).
 */
export async function cacheInvalidateTenant(tenantId: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    const keys = await redis.keys(`t:${tenantId}:*`)
    if (keys.length > 0) await redis.del(...keys)
  } catch {
    // Ignore
  }
}

/**
 * Cache-aside helper: get from cache, or fetch + cache.
 */
export async function cacheFetch<T>(
  tenantId: string,
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = await cacheGet<T>(tenantId, key)
  if (cached !== null) return cached
  const fresh = await fetcher()
  await cacheSet(tenantId, key, fresh, ttlSeconds)
  return fresh
}
