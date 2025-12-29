import "server-only"
import { cache } from "react";
import { auth } from "@/auth";
import { db, Transaction } from "./db";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";

type AuthorizedCallback<T> = (tx: Transaction, tenantId: string) => Promise<T>;

/**
 * Verified session type with required fields
 */
export interface VerifiedSession {
    user: {
        id: string;
        email: string;
        role: string;
        tenantId: string;
    };
}

/**
 * Memoized session verification using React cache.
 * 
 * This function is cached per request, so multiple calls within the same
 * render pass will only verify the session once. Use this in Server Components,
 * Server Actions, and Route Handlers.
 * 
 * @returns The verified session or redirects to login
 */
export const verifySession = cache(async (): Promise<VerifiedSession> => {
    const session = await auth();

    if (!session?.user?.id || !session.user.tenantId) {
        redirect("/login");
    }

    return {
        user: {
            id: session.user.id,
            email: session.user.email || "",
            role: session.user.role || "user",
            tenantId: session.user.tenantId,
        },
    };
});

/**
 * Get the current session without redirecting.
 * Returns null if not authenticated.
 * 
 * Use this when you need to check auth status without forcing a redirect.
 */
export const getSession = cache(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.tenantId) {
        return null;
    }

    return {
        user: {
            id: session.user.id,
            email: session.user.email || "",
            role: session.user.role || "user",
            tenantId: session.user.tenantId,
        },
    };
});

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
