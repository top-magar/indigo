import { auth } from "@/auth";
import { db, Transaction } from "./db";
import { sql } from "drizzle-orm";

type AuthorizedCallback<T> = (tx: Transaction, tenantId: string) => Promise<T>;

/**
 * Execute an authorized action within a tenant-scoped transaction.
 * 
 * - Validates the user session
 * - Sets the RLS context variable for the tenant
 * - Executes the callback within a transaction
 * 
 * @throws Error if user is not authenticated
 */
export async function authorizedAction<T>(callback: AuthorizedCallback<T>): Promise<T> {
    const session = await auth();

    if (!session?.user || !session.user.id || !session.user.tenantId) {
        throw new Error("Unauthorized");
    }

    const tenantId = session.user.tenantId;

    // We perform the entire action within a transaction.
    // This ensures that the configuration parameter set for RLS `app.current_tenant`
    // applies to all queries within this transaction block and is reset/isolated afterwards.
    return db.transaction(async (tx) => {
        // 1. Set the RLS context variable
        await tx.execute(sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`);

        // 2. Run the actual business logic
        return callback(tx, tenantId);
    });
}
