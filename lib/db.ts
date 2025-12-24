import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { sql } from "drizzle-orm";

// Note: Next.js automatically loads .env.local - no need for dotenv
// This file may be imported in Edge Runtime (middleware), so we avoid Node.js-only APIs

// Database type with schema
export type Database = PostgresJsDatabase<typeof schema>;

// Make Drizzle DB optional - allows running with Supabase only
const hasDatabaseUrl = !!process.env.DATABASE_URL;

// Regular DB client (RLS enforced)
const client = hasDatabaseUrl ? postgres(process.env.DATABASE_URL!) : null;
export const db: Database = client ? drizzle(client, { schema }) : (null as unknown as Database);

// Superuser DB client (Bypasses RLS) - Use ONLY for Auth or Admin tasks
const sudoClient = hasDatabaseUrl ? postgres(process.env.SUDO_DATABASE_URL || process.env.DATABASE_URL!) : null;
export const sudoDb: Database = sudoClient ? drizzle(sudoClient, { schema }) : (null as unknown as Database);

// Transaction type for callbacks
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

/**
 * Execute a callback within a tenant-scoped transaction.
 * Sets the RLS context variable for the duration of the transaction.
 */
export async function withTenant<T>(
    tenantId: string,
    callback: (tx: Transaction) => Promise<T>
): Promise<T> {
    return db.transaction(async (tx) => {
        await tx.execute(sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`);
        return callback(tx);
    });
}
