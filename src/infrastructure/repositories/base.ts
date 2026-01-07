import "server-only";
import { Transaction, withTenant } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";

/**
 * TenantScopedRepository - Base class for tenant-scoped data access
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 * @see SYSTEM-ARCHITECTURE.md Section 5.2 (Multitenancy Safeguards)
 * 
 * Provides a pattern for ensuring all database operations are executed 
 * within tenant context via withTenant().
 * 
 * Note: Due to Drizzle ORM's complex generic types, concrete repositories
 * should implement their own methods using withTenant() directly.
 * This base class provides the pattern and helper methods.
 * 
 * @example
 * ```typescript
 * class ProductRepository {
 *   async findAll(tenantId: string) {
 *     return withTenant(tenantId, async (tx) => {
 *       return tx.select().from(products);
 *     });
 *   }
 * }
 * ```
 */

/**
 * Execute a query within tenant context
 * 
 * This is the core pattern all repositories should use.
 */
export async function executeInTenantContext<T>(
  tenantId: string,
  callback: (tx: Transaction) => Promise<T>
): Promise<T> {
  return withTenant(tenantId, callback);
}

/**
 * Validate that a result exists, throw NOT_FOUND if not
 */
export function assertExists<T>(
  result: T | null | undefined,
  entityName: string
): asserts result is T {
  if (!result) {
    throw new AppError(`${entityName} not found`, "NOT_FOUND");
  }
}

/**
 * Validate tenant ID format
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

/**
 * Base interface for repository options
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    direction: "asc" | "desc";
  };
}

/**
 * Pagination result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
