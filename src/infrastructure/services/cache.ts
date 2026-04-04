// Cache Service — pass-through stub
//
// In-memory caching is ineffective in serverless (each invocation is isolated).
// When ready, replace with Redis/ElastiCache using the CacheStorage interface.
//
// The withCache wrapper is kept as a no-op so callers don't need to change
// when a real cache backend is added.

export type CacheDataType = "products" | "categories" | "store-config" | "storeConfig" | "analytics" | "general"

/** No-op cache wrapper. Replace with Redis implementation when ready. */
export async function withCache<T>(
  _key: string,
  _dataType: CacheDataType,
  factory: () => Promise<T>
): Promise<T> {
  return factory()
}

/** Stub — returns a no-op cache service. */
export function getCacheService() {
  return {
    invalidate: (_pattern: string) => { /* no-op */ },
    invalidateByType: (_type: CacheDataType) => { /* no-op */ },
  }
}
