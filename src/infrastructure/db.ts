import "server-only"
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { sql } from "drizzle-orm";
import { trace } from "@opentelemetry/api";

/**
 * Database Configuration
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.2
 * @see SYSTEM-ARCHITECTURE.md Section 3.3.1
 * 
 * Note: Next.js automatically loads .env.local - no need for dotenv
 * This file may be imported in Edge Runtime (middleware), so we avoid Node.js-only APIs
 */

// Database type with schema
export type Database = PostgresJsDatabase<typeof schema>;

// Make Drizzle DB optional - allows running with Supabase only
const hasDatabaseUrl = !!process.env.DATABASE_URL;

// Regular DB client (RLS enforced)
// CI-8: Use POOLER_DATABASE_URL (Supabase connection pooler) for serverless;
// falls back to DATABASE_URL for local dev
const client = hasDatabaseUrl ? postgres(process.env.POOLER_DATABASE_URL || process.env.DATABASE_URL!, {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
}) : null;

// Superuser DB client (Bypasses RLS) - Use ONLY for Auth or Admin tasks
const sudoClient = hasDatabaseUrl ? postgres(process.env.SUDO_DATABASE_URL || process.env.DATABASE_URL!, {
  max: 2,
  idle_timeout: 20,
  connect_timeout: 10,
}) : null;

function getDb(): Database {
  if (!client) {
    throw new Error(
      "DATABASE_URL is not set. Either configure it in .env.local or use Supabase client instead of Drizzle."
    );
  }
  return drizzle(client, { schema });
}

function getSudoDb(): Database {
  if (!sudoClient) {
    throw new Error(
      "DATABASE_URL is not set. Either configure it in .env.local or use Supabase client instead of Drizzle."
    );
  }
  return drizzle(sudoClient, { schema });
}

// Lazy-initialized singletons
let _db: Database | null = null;
let _sudoDb: Database | null = null;

export const db: Database = new Proxy({} as Database, {
  get(_, prop) {
    if (!_db) _db = getDb();
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const sudoDb: Database = new Proxy({} as Database, {
  get(_, prop) {
    if (!_sudoDb) _sudoDb = getSudoDb();
    return (_sudoDb as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Transaction type for callbacks
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

// OpenTelemetry tracer for observability
const tracer = trace.getTracer("tenant-operations");

/**
 * Execute a callback within a tenant-scoped transaction.
 * 
 * CRITICAL: This is the ONLY way to execute tenant-scoped queries.
 * - Sets the RLS context variable for the duration of the transaction
 * - Ensures all queries within the callback are filtered by tenant_id
 * - Provides observability via OpenTelemetry spans
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.2
 * @see SYSTEM-ARCHITECTURE.md Section 2.4 (RLS Policy Pattern)
 * 
 * @param tenantId - The tenant UUID (from JWT or URL resolution)
 * @param callback - The function to execute within the transaction
 * @returns The result of the callback
 * 
 * @example
 * ```typescript
 * const products = await withTenant(tenantId, async (tx) => {
 *   return tx.select().from(products).where(eq(products.status, "active"));
 * });
 * ```
 */
export async function withTenant<T>(
    tenantId: string,
    callback: (tx: Transaction) => Promise<T>
): Promise<T> {
    // Validate tenant ID format
    if (!tenantId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
        throw new Error("Invalid tenant ID format");
    }

    return tracer.startActiveSpan(`db.tenant.${tenantId.slice(0, 8)}`, async (span) => {
        span.setAttribute("tenant.id", tenantId);
        
        try {
            const result = await db.transaction(async (tx) => {
                // Set RLS context - this is LOCAL to the transaction
                await tx.execute(sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`);
                return callback(tx);
            });
            
            span.setAttribute("db.success", true);
            return result;
        } catch (error) {
            span.setAttribute("db.success", false);
            span.setAttribute("error.message", error instanceof Error ? error.message : "Unknown error");
            throw error;
        } finally {
            span.end();
        }
    });
}

/**
 * Execute a callback with platform admin privileges.
 * 
 * WARNING: This bypasses RLS. Use ONLY for:
 * - Tenant creation/deletion
 * - Cross-tenant analytics (platform admin only)
 * - System maintenance tasks
 * - Stripe webhook handlers that need to find tenant by stripe_account_id
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.2
 * 
 * @param callback - The function to execute
 * @returns The result of the callback
 */
export async function withPlatformAdmin<T>(
    callback: (db: Database) => Promise<T>
): Promise<T> {
    return tracer.startActiveSpan("db.platform_admin", async (span) => {
        span.setAttribute("db.admin_mode", true);
        
        try {
            const result = await callback(sudoDb);
            span.setAttribute("db.success", true);
            return result;
        } catch (error) {
            span.setAttribute("db.success", false);
            span.setAttribute("error.message", error instanceof Error ? error.message : "Unknown error");
            throw error;
        } finally {
            span.end();
        }
    });
}
