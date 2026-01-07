import "server-only"
import { db, Transaction } from "@/infrastructure/db";
import { sql } from "drizzle-orm";
import { getTenantIdFromHeaders } from "@/infrastructure/tenant/context";

type PublicCallback<T> = (tx: Transaction) => Promise<T>;

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Execute a public storefront action within a tenant-scoped transaction.
 * 
 * - Validates the tenant ID format (UUID)
 * - Sets the RLS context variable for the tenant
 * - Executes the callback within a transaction
 * 
 * @param tenantId - The tenant ID to scope the action to
 * @param callback - The callback to execute within the tenant context
 * @throws Error if tenant ID is invalid
 */
export async function publicStorefrontAction<T>(
    tenantId: string,
    callback: PublicCallback<T>
): Promise<T> {
    // Basic validation of UUID format to prevent SQL injection or bad config
    if (!tenantId || !UUID_REGEX.test(tenantId)) {
        throw new Error("Invalid Tenant ID");
    }

    // We perform the entire action within a transaction.
    // This ensures that the configuration parameter set for RLS `app.current_tenant`
    // applies to all queries within this transaction block and is reset/isolated afterwards.
    return db.transaction(async (tx) => {
        // 1. Set the RLS context variable for the Public Request
        await tx.execute(sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`);

        // 2. Run the actual business logic
        return callback(tx);
    });
}

/**
 * Execute a public storefront action using tenant context from headers.
 * 
 * This is a convenience wrapper that reads the tenant ID from request headers
 * set by the middleware. Use this when you don't have the tenant ID explicitly
 * but know the request has been processed by the multi-tenant middleware.
 * 
 * - Reads tenant ID from x-tenant-id header
 * - Falls back to explicit tenantId if provided
 * - Validates the tenant ID format (UUID)
 * - Sets the RLS context variable for the tenant
 * - Executes the callback within a transaction
 * 
 * @param callback - The callback to execute within the tenant context
 * @param explicitTenantId - Optional explicit tenant ID (for backward compatibility)
 * @throws Error if tenant ID is not available or invalid
 * 
 * Requirements: 4.3
 */
export async function publicStorefrontActionFromContext<T>(
    callback: PublicCallback<T>,
    explicitTenantId?: string
): Promise<T> {
    // Try to get tenant ID from headers first, fall back to explicit parameter
    let tenantId = explicitTenantId;
    
    if (!tenantId) {
        tenantId = await getTenantIdFromHeaders() || undefined;
    }
    
    if (!tenantId) {
        throw new Error("Tenant context not available");
    }
    
    // Delegate to the main function
    return publicStorefrontAction(tenantId, callback);
}
