"use client";

import type {
  CacheEntry,
  CacheConfig,
  CacheInvalidationStrategy,
} from "@/components/dashboard/offline/offline-types";

const DB_NAME = "indigo-offline-cache";
const DB_VERSION = 1;
const STORE_NAME = "cache";

const DEFAULT_CONFIG: CacheConfig = {
  defaultTtl: 1000 * 60 * 60,
  maxEntries: 1000,
  invalidationStrategy: "time_based",
  persistToIndexedDB: true,
};


async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(new Error("Failed to open IndexedDB"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
        store.createIndex("expiresAt", "expiresAt", { unique: false });
        store.createIndex("cachedAt", "cachedAt", { unique: false });
      }
    };
  });
}


export class CacheManager {
  private config: CacheConfig;
  private memoryCache: Map<string, CacheEntry>;
  private db: IDBDatabase | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.memoryCache = new Map();
  }

  async init(): Promise<void> {
    if (this.config.persistToIndexedDB) {
      try {
        this.db = await openDatabase();
      } catch (error) {
        console.warn("IndexedDB not available, using memory cache only:", error);
      }
    }
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const memoryEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memoryEntry) {
      if (this.isExpired(memoryEntry)) {
        await this.delete(key);
        return null;
      }
      return { ...memoryEntry, isStale: this.isStale(memoryEntry) };
    }
    if (this.db) {
      try {
        const entry = await this.getFromIndexedDB<T>(key);
        if (entry) {
          if (this.isExpired(entry)) {
            await this.delete(key);
            return null;
          }
          this.memoryCache.set(key, entry);
          return { ...entry, isStale: this.isStale(entry) };
        }
      } catch (error) {
        console.warn("Failed to get from IndexedDB:", error);
      }
    }
    return null;
  }

  async set<T>(
    key: string,
    data: T,
    options: { ttl?: number; version?: number; etag?: string } = {}
  ): Promise<void> {
    const now = new Date();
    const ttl = options.ttl ?? this.config.defaultTtl;
    const entry: CacheEntry<T> = {
      data,
      cachedAt: now,
      expiresAt: ttl > 0 ? new Date(now.getTime() + ttl) : null,
      version: options.version ?? 1,
      etag: options.etag,
      isStale: false,
    };
    this.memoryCache.set(key, entry);
    if (this.db) {
      try {
        await this.setInIndexedDB(key, entry);
      } catch (error) {
        console.warn("Failed to persist to IndexedDB:", error);
      }
    }
    await this.enforceMaxEntries();
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (this.db) {
      try {
        await this.deleteFromIndexedDB(key);
      } catch (error) {
        console.warn("Failed to delete from IndexedDB:", error);
      }
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.db) {
      try {
        await this.clearIndexedDB();
      } catch (error) {
        console.warn("Failed to clear IndexedDB:", error);
      }
    }
  }

  async invalidateByPattern(pattern: string | RegExp): Promise<void> {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    const keysToDelete: string[] = [];
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) keysToDelete.push(key);
    }
    for (const key of keysToDelete) {
      await this.delete(key);
    }
  }

  async invalidateByEntityType(entityType: string): Promise<void> {
    await this.invalidateByPattern(`^${entityType}:`);
  }

  async markStale(key: string): Promise<void> {
    const entry = this.memoryCache.get(key);
    if (entry) {
      entry.isStale = true;
      this.memoryCache.set(key, entry);
    }
  }

  async keys(): Promise<string[]> {
    const memoryKeys = Array.from(this.memoryCache.keys());
    if (this.db) {
      try {
        const dbKeys = await this.getKeysFromIndexedDB();
        return [...new Set([...memoryKeys, ...dbKeys])];
      } catch (error) {
        console.warn("Failed to get keys from IndexedDB:", error);
      }
    }
    return memoryKeys;
  }


  async getStats(): Promise<{
    totalEntries: number;
    memoryEntries: number;
    staleEntries: number;
    expiredEntries: number;
  }> {
    const keys = await this.keys();
    let staleCount = 0;
    let expiredCount = 0;
    for (const key of keys) {
      const entry = await this.get(key);
      if (entry) {
        if (entry.isStale) staleCount++;
        if (this.isExpired(entry)) expiredCount++;
      }
    }
    return {
      totalEntries: keys.length,
      memoryEntries: this.memoryCache.size,
      staleEntries: staleCount,
      expiredEntries: expiredCount,
    };
  }

  async cleanup(): Promise<number> {
    const keys = await this.keys();
    let deletedCount = 0;
    for (const key of keys) {
      const entry = await this.get(key);
      if (!entry || this.isExpired(entry)) {
        await this.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  private isExpired(entry: CacheEntry): boolean {
    if (!entry.expiresAt) return false;
    return new Date() > entry.expiresAt;
  }

  private isStale(entry: CacheEntry): boolean {
    if (entry.isStale) return true;
    if (entry.expiresAt) {
      const halfLife = (entry.expiresAt.getTime() - entry.cachedAt.getTime()) / 2;
      return new Date().getTime() > entry.cachedAt.getTime() + halfLife;
    }
    return false;
  }

  private async enforceMaxEntries(): Promise<void> {
    const keys = await this.keys();
    if (keys.length <= this.config.maxEntries) return;
    const entries: { key: string; cachedAt: Date }[] = [];
    for (const key of keys) {
      const entry = await this.get(key);
      if (entry) entries.push({ key, cachedAt: entry.cachedAt });
    }
    entries.sort((a, b) => a.cachedAt.getTime() - b.cachedAt.getTime());
    const toDelete = entries.slice(0, entries.length - this.config.maxEntries);
    for (const { key } of toDelete) {
      await this.delete(key);
    }
  }

  private async getFromIndexedDB<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.db) return null;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            ...result.entry,
            cachedAt: new Date(result.entry.cachedAt),
            expiresAt: result.entry.expiresAt ? new Date(result.entry.expiresAt) : null,
          });
        } else {
          resolve(null);
        }
      };
    });
  }


  private async setInIndexedDB<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ key, entry });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async getKeysFromIndexedDB(): Promise<string[]> {
    if (!this.db) return [];
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string[]);
    });
  }
}

let cacheManagerInstance: CacheManager | null = null;

export function getCacheManager(config?: Partial<CacheConfig>): CacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager(config);
  }
  return cacheManagerInstance;
}

export async function initCacheManager(config?: Partial<CacheConfig>): Promise<CacheManager> {
  const manager = getCacheManager(config);
  await manager.init();
  return manager;
}

export function createCacheKey(
  entityType: string,
  id?: string,
  params?: Record<string, unknown>
): string {
  let key = entityType;
  if (id) key += `:${id}`;
  if (params && Object.keys(params).length > 0) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((k) => `${k}=${JSON.stringify(params[k])}`)
      .join("&");
    key += `?${sortedParams}`;
  }
  return key;
}

export type { CacheEntry, CacheConfig, CacheInvalidationStrategy };
