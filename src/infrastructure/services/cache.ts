/**
 * Cache Service
 * 
 * In-memory caching with TTL support and tenant isolation.
 * Redis-ready interface for easy migration to distributed cache.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 6.3
 * 
 * Design Notes:
 * - In-memory Map for MVP (easy to swap to Redis later)
 * - Tenant-scoped cache keys for isolation
 * - Automatic cleanup of expired entries
 * - Pattern-based invalidation support
 */

import { getEffectiveCacheTTL, type CacheDataType } from "@/config/cache";

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  /** Cached value */
  value: T;
  /** Expiration timestamp (ms since epoch) */
  expiresAt: number;
  /** When this entry was created */
  createdAt: number;
}

/**
 * Cache storage interface
 * Allows easy swap to Redis or other backends
 */
export interface CacheStorage {
  get<T>(key: string): CacheEntry<T> | undefined;
  set<T>(key: string, entry: CacheEntry<T>): void;
  delete(key: string): boolean;
  keys(): IterableIterator<string>;
  clear(): void;
  size(): number;
}

/**
 * In-memory storage implementation
 */
class InMemoryStorage implements CacheStorage {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): CacheEntry<T> | undefined {
    return this.store.get(key) as CacheEntry<T> | undefined;
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    this.store.set(key, entry);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  keys(): IterableIterator<string> {
    return this.store.keys();
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

/**
 * Cache get result
 */
export interface CacheGetResult<T> {
  /** Whether the value was found and not expired */
  hit: boolean;
  /** The cached value (undefined if miss) */
  value: T | undefined;
  /** Time remaining until expiration (ms) */
  ttlRemaining?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Total number of entries */
  size: number;
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Hit rate percentage */
  hitRate: number;
}

/**
 * Cache Service
 * 
 * Provides tenant-scoped caching with TTL support.
 * 
 * @example
 * const cache = new CacheService();
 * 
 * // Set with data type TTL
 * cache.set("tenant:products:list", products, "products");
 * 
 * // Get with type safety
 * const result = cache.get<Product[]>("tenant:products:list");
 * if (result.hit) {
 *   return result.value;
 * }
 * 
 * // Invalidate by pattern
 * cache.invalidate("tenant:products:*");
 */
export class CacheService {
  private storage: CacheStorage;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private hits = 0;
  private misses = 0;

  /** How often to run cleanup (default: 1 minute) */
  private readonly cleanupIntervalMs: number;

  constructor(options?: {
    storage?: CacheStorage;
    cleanupIntervalMs?: number;
  }) {
    this.storage = options?.storage ?? new InMemoryStorage();
    this.cleanupIntervalMs = options?.cleanupIntervalMs ?? 60 * 1000;

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Get a value from cache
   * 
   * @param key - Cache key (should include tenant_id prefix)
   * @returns Cache result with hit status and value
   */
  get<T>(key: string): CacheGetResult<T> {
    const entry = this.storage.get<T>(key);
    const now = Date.now();

    if (!entry) {
      this.misses++;
      return { hit: false, value: undefined };
    }

    // Check if expired
    if (entry.expiresAt <= now) {
      this.storage.delete(key);
      this.misses++;
      return { hit: false, value: undefined };
    }

    this.hits++;
    return {
      hit: true,
      value: entry.value,
      ttlRemaining: entry.expiresAt - now,
    };
  }

  /**
   * Set a value in cache
   * 
   * @param key - Cache key (should include tenant_id prefix)
   * @param value - Value to cache
   * @param dataType - Data type for TTL lookup
   * @param customTtlMs - Optional custom TTL (overrides data type TTL)
   */
  set<T>(key: string, value: T, dataType: CacheDataType, customTtlMs?: number): void {
    const ttlMs = customTtlMs ?? getEffectiveCacheTTL(dataType);
    const now = Date.now();

    this.storage.set(key, {
      value,
      expiresAt: now + ttlMs,
      createdAt: now,
    });
  }

  /**
   * Set a value with explicit TTL (no data type)
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlMs - Time-to-live in milliseconds
   */
  setWithTTL<T>(key: string, value: T, ttlMs: number): void {
    const now = Date.now();

    this.storage.set(key, {
      value,
      expiresAt: now + ttlMs,
      createdAt: now,
    });
  }

  /**
   * Delete a specific cache entry
   * 
   * @param key - Cache key to delete
   * @returns Whether the key existed
   */
  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  /**
   * Invalidate cache entries by pattern
   * Supports glob-style patterns with * wildcard
   * 
   * @param pattern - Pattern to match (e.g., "tenant:products:*")
   * @returns Number of entries invalidated
   */
  invalidate(pattern: string): number {
    let count = 0;
    const regex = this.patternToRegex(pattern);

    for (const key of this.storage.keys()) {
      if (regex.test(key)) {
        this.storage.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Invalidate all cache entries for a tenant
   * 
   * @param tenantId - Tenant ID
   * @returns Number of entries invalidated
   */
  invalidateTenant(tenantId: string): number {
    return this.invalidate(`${tenantId}:*`);
  }

  /**
   * Check if a key exists and is not expired
   * 
   * @param key - Cache key
   * @returns Whether the key exists and is valid
   */
  has(key: string): boolean {
    const result = this.get(key);
    // Undo the hit/miss count since this is just a check
    if (result.hit) {
      this.hits--;
    } else {
      this.misses--;
    }
    return result.hit;
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   * 
   * @param key - Cache key
   * @param dataType - Data type for TTL
   * @param factory - Function to compute value if not cached
   * @returns Cached or computed value
   */
  async getOrSet<T>(
    key: string,
    dataType: CacheDataType,
    factory: () => Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached.hit) {
      return cached.value!;
    }

    const value = await factory();
    this.set(key, value, dataType);
    return value;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.storage.size(),
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Convert glob pattern to regex
   */
  private patternToRegex(pattern: string): RegExp {
    // Escape special regex characters except *
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    // Convert * to regex .*
    const regexPattern = escaped.replace(/\*/g, ".*");
    return new RegExp(`^${regexPattern}$`);
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

    for (const key of this.storage.keys()) {
      const entry = this.storage.get(key);
      if (entry && entry.expiresAt <= now) {
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
 * Singleton cache service instance
 * Use this for most cases
 */
let globalCacheService: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!globalCacheService) {
    globalCacheService = new CacheService();
  }
  return globalCacheService;
}

/**
 * Helper to build tenant-scoped cache key
 */
export function buildCacheKey(tenantId: string, ...parts: string[]): string {
  return [tenantId, ...parts].join(":");
}

/**
 * Decorator-style cache wrapper for repository methods
 * 
 * @example
 * const cachedProducts = await withCache(
 *   cacheKeyPatterns.productList(tenantId),
 *   "products",
 *   () => productRepository.findAll(tenantId)
 * );
 */
export async function withCache<T>(
  key: string,
  dataType: CacheDataType,
  factory: () => Promise<T>
): Promise<T> {
  return getCacheService().getOrSet(key, dataType, factory);
}
