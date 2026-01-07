/**
 * Query Optimization Utilities
 * 
 * Helpers for efficient database queries:
 * - Cursor-based pagination
 * - Field selection (column limiting)
 * - Batch loading for N+1 prevention
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 6.3
 */

import { sql, SQL, and, gt, lt, eq, desc, asc } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";

/**
 * Cursor-based pagination options
 */
export interface CursorPaginationOptions {
  /** Number of items to fetch */
  limit: number;
  /** Cursor value (typically an ID or timestamp) */
  cursor?: string | null;
  /** Direction of pagination */
  direction?: "forward" | "backward";
}

/**
 * Cursor-based pagination result
 */
export interface CursorPaginationResult<T> {
  /** The fetched items */
  data: T[];
  /** Cursor for the next page (null if no more items) */
  nextCursor: string | null;
  /** Cursor for the previous page (null if at start) */
  prevCursor: string | null;
  /** Whether there are more items */
  hasMore: boolean;
}

/**
 * Offset-based pagination options
 */
export interface OffsetPaginationOptions {
  /** Page number (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
}

/**
 * Offset-based pagination result
 */
export interface OffsetPaginationResult<T> {
  /** The fetched items */
  data: T[];
  /** Total number of items */
  total: number;
  /** Current page number */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there's a next page */
  hasNextPage: boolean;
  /** Whether there's a previous page */
  hasPrevPage: boolean;
}

/**
 * Build cursor pagination SQL conditions
 * 
 * @param cursorColumn - The column to use for cursor (typically id or created_at)
 * @param options - Pagination options
 * @returns SQL condition for WHERE clause
 * 
 * @example
 * const condition = buildCursorCondition(products.id, { limit: 10, cursor: "abc123" });
 * const results = await tx.select().from(products).where(condition);
 */
export function buildCursorCondition<T extends PgColumn>(
  cursorColumn: T,
  options: CursorPaginationOptions
): SQL | undefined {
  if (!options.cursor) {
    return undefined;
  }

  const { cursor, direction = "forward" } = options;

  // Forward pagination: get items after cursor
  // Backward pagination: get items before cursor
  return direction === "forward"
    ? gt(cursorColumn, cursor)
    : lt(cursorColumn, cursor);
}

/**
 * Build cursor pagination result from query results
 * 
 * @param data - Query results
 * @param options - Pagination options
 * @param getCursor - Function to extract cursor value from an item
 * @returns Pagination result with cursors
 */
export function buildCursorResult<T>(
  data: T[],
  options: CursorPaginationOptions,
  getCursor: (item: T) => string
): CursorPaginationResult<T> {
  const { limit, direction = "forward" } = options;
  const hasMore = data.length > limit;

  // Remove extra item used for hasMore check
  const items = hasMore ? data.slice(0, limit) : data;

  // For backward pagination, reverse the results
  const finalItems = direction === "backward" ? items.reverse() : items;

  return {
    data: finalItems,
    nextCursor: hasMore && finalItems.length > 0 
      ? getCursor(finalItems[finalItems.length - 1]) 
      : null,
    prevCursor: options.cursor && finalItems.length > 0 
      ? getCursor(finalItems[0]) 
      : null,
    hasMore,
  };
}

/**
 * Calculate offset pagination metadata
 * 
 * @param total - Total number of items
 * @param options - Pagination options
 * @returns Pagination metadata
 */
export function calculateOffsetPagination(
  total: number,
  options: OffsetPaginationOptions
): Omit<OffsetPaginationResult<unknown>, "data"> {
  const { page, pageSize } = options;
  const totalPages = Math.ceil(total / pageSize);

  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Build offset and limit from pagination options
 */
export function buildOffsetLimit(options: OffsetPaginationOptions): {
  offset: number;
  limit: number;
} {
  const { page, pageSize } = options;
  return {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}

/**
 * Batch loader for preventing N+1 queries
 * Groups multiple single-item requests into batch queries
 * 
 * @example
 * const loader = createBatchLoader<string, Product>(
 *   async (ids) => {
 *     const products = await tx.select().from(products).where(inArray(products.id, ids));
 *     return new Map(products.map(p => [p.id, p]));
 *   }
 * );
 * 
 * // These will be batched into a single query
 * const [product1, product2] = await Promise.all([
 *   loader.load("id1"),
 *   loader.load("id2"),
 * ]);
 */
export function createBatchLoader<K, V>(
  batchFn: (keys: K[]) => Promise<Map<K, V>>,
  options?: {
    /** Maximum batch size */
    maxBatchSize?: number;
    /** Delay before executing batch (ms) */
    batchDelayMs?: number;
  }
): BatchLoader<K, V> {
  return new BatchLoader(batchFn, options);
}

/**
 * Batch loader class
 */
export class BatchLoader<K, V> {
  private queue: Array<{
    key: K;
    resolve: (value: V | undefined) => void;
    reject: (error: Error) => void;
  }> = [];
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private cache = new Map<K, V>();

  private readonly maxBatchSize: number;
  private readonly batchDelayMs: number;

  constructor(
    private batchFn: (keys: K[]) => Promise<Map<K, V>>,
    options?: {
      maxBatchSize?: number;
      batchDelayMs?: number;
    }
  ) {
    this.maxBatchSize = options?.maxBatchSize ?? 100;
    this.batchDelayMs = options?.batchDelayMs ?? 0;
  }

  /**
   * Load a single item (will be batched with other loads)
   */
  async load(key: K): Promise<V | undefined> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      // Execute immediately if batch is full
      if (this.queue.length >= this.maxBatchSize) {
        this.executeBatch();
      } else if (!this.timeout) {
        // Schedule batch execution
        this.timeout = setTimeout(() => {
          this.executeBatch();
        }, this.batchDelayMs);
      }
    });
  }

  /**
   * Load multiple items
   */
  async loadMany(keys: K[]): Promise<Array<V | undefined>> {
    return Promise.all(keys.map((key) => this.load(key)));
  }

  /**
   * Prime the cache with a value
   */
  prime(key: K, value: V): void {
    this.cache.set(key, value);
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Execute the current batch
   */
  private async executeBatch(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.maxBatchSize);
    const keys = batch.map((item) => item.key);

    try {
      const results = await this.batchFn(keys);

      // Cache and resolve
      for (const item of batch) {
        const value = results.get(item.key);
        if (value !== undefined) {
          this.cache.set(item.key, value);
        }
        item.resolve(value);
      }
    } catch (error) {
      // Reject all items in batch
      for (const item of batch) {
        item.reject(error instanceof Error ? error : new Error(String(error)));
      }
    }

    // Process remaining items if any
    if (this.queue.length > 0) {
      this.executeBatch();
    }
  }
}

/**
 * Select only specified columns from a table
 * Reduces data transfer and memory usage
 * 
 * @example
 * const columns = selectColumns(products, ["id", "name", "price"]);
 * const results = await tx.select(columns).from(products);
 */
export function selectColumns<
  T extends PgTable,
  K extends keyof T["_"]["columns"]
>(
  table: T,
  columnNames: K[]
): Pick<T["_"]["columns"], K> {
  const columns = {} as Pick<T["_"]["columns"], K>;
  
  for (const name of columnNames) {
    const column = (table as Record<string, unknown>)[name as string];
    if (column) {
      (columns as Record<string, unknown>)[name as string] = column;
    }
  }
  
  return columns;
}

/**
 * Build ORDER BY clause for cursor pagination
 * 
 * @param column - Column to order by
 * @param direction - Sort direction
 * @returns SQL ORDER BY expression
 */
export function buildCursorOrderBy<T extends PgColumn>(
  column: T,
  direction: "asc" | "desc" = "desc"
): SQL {
  return direction === "desc" ? desc(column) : asc(column);
}

/**
 * Combine multiple SQL conditions with AND
 * Filters out undefined conditions
 */
export function combineConditions(...conditions: (SQL | undefined)[]): SQL | undefined {
  const validConditions = conditions.filter((c): c is SQL => c !== undefined);
  
  if (validConditions.length === 0) return undefined;
  if (validConditions.length === 1) return validConditions[0];
  
  return and(...validConditions);
}

/**
 * Create a deferred query that can be executed later
 * Useful for building complex queries conditionally
 */
export interface DeferredQuery<T> {
  /** Add a condition to the query */
  where(condition: SQL | undefined): DeferredQuery<T>;
  /** Set the limit */
  limit(n: number): DeferredQuery<T>;
  /** Set the offset */
  offset(n: number): DeferredQuery<T>;
  /** Set the order */
  orderBy(column: PgColumn, direction?: "asc" | "desc"): DeferredQuery<T>;
  /** Get the built conditions */
  getConditions(): SQL | undefined;
  /** Get pagination options */
  getPagination(): { limit?: number; offset?: number };
  /** Get order options */
  getOrder(): { column: PgColumn; direction: "asc" | "desc" } | undefined;
}

/**
 * Create a deferred query builder
 */
export function createDeferredQuery<T>(): DeferredQuery<T> {
  const conditions: SQL[] = [];
  let queryLimit: number | undefined;
  let queryOffset: number | undefined;
  let orderColumn: PgColumn | undefined;
  let orderDirection: "asc" | "desc" = "desc";

  const builder: DeferredQuery<T> = {
    where(condition) {
      if (condition) {
        conditions.push(condition);
      }
      return builder;
    },
    limit(n) {
      queryLimit = n;
      return builder;
    },
    offset(n) {
      queryOffset = n;
      return builder;
    },
    orderBy(column, direction = "desc") {
      orderColumn = column;
      orderDirection = direction;
      return builder;
    },
    getConditions() {
      return combineConditions(...conditions);
    },
    getPagination() {
      return { limit: queryLimit, offset: queryOffset };
    },
    getOrder() {
      return orderColumn ? { column: orderColumn, direction: orderDirection } : undefined;
    },
  };

  return builder;
}
