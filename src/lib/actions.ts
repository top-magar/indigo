import "server-only"
import { cache } from "react";
import { createClient } from "@/infrastructure/supabase/server";
import { db, Transaction } from "@/infrastructure/db";
import { sql, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { tenants, users } from "@/db/schema";

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
 * Get tenant ID for a Supabase user
 * Users are linked to tenants via the users table (tenant_id)
 */
async function getTenantIdForUser(userId: string): Promise<string | null> {
    const [user] = await db
        .select({ tenantId: users.tenantId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    
    return user?.tenantId || null;
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
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    // Get tenant ID for this user
    const tenantId = await getTenantIdForUser(user.id);
    
    if (!tenantId) {
        // User exists but has no tenant - redirect to onboarding
        redirect("/onboarding");
    }

    // Get role from user metadata or default to "owner"
    const role = (user.user_metadata?.role as string) || "owner";

    return {
        user: {
            id: user.id,
            email: user.email || "",
            role,
            tenantId,
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
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    // Get tenant ID for this user
    const tenantId = await getTenantIdForUser(user.id);
    
    if (!tenantId) {
        return null;
    }

    const role = (user.user_metadata?.role as string) || "owner";

    return {
        user: {
            id: user.id,
            email: user.email || "",
            role,
            tenantId,
        },
    };
});

/**
 * Execute an authorized action within a tenant-scoped transaction.
 * 
 * - Validates the user session via Supabase Auth
 * - Sets the RLS context variable for the tenant
 * - Executes the callback within a transaction
 * 
 * @throws Error if user is not authenticated
 */
export async function authorizedAction<T>(callback: AuthorizedCallback<T>): Promise<T> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized");
    }

    const tenantId = await getTenantIdForUser(user.id);

    if (!tenantId) {
        throw new Error("No tenant found for user");
    }

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
