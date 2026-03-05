import "server-only";
import { requireUser, type AuthUser } from "@/lib/auth";
import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Context passed to every dashboard action.
 * Eliminates the per-file `getAuthenticatedTenant()` boilerplate.
 */
export interface ActionContext {
    user: AuthUser;
    tenantId: string;
    supabase: SupabaseClient;
}

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Wrap a dashboard server action with auth + error handling.
 *
 * Before (repeated 134× across 29 files):
 *   async function getAuthenticatedTenant() {
 *     const { user, supabase } = await getAuthenticatedClient();
 *     return { supabase, tenantId: user.tenantId, userId: user.id };
 *   }
 *   export async function doThing(id: string) {
 *     const { tenantId } = await getAuthenticatedTenant();
 *     try { ... } catch (e) { console.error(e); throw ... }
 *   }
 *
 * After:
 *   export const doThing = action(async (ctx, id: string) => {
 *     ...
 *     return result;
 *   });
 */
export function action<TArgs extends unknown[], TReturn>(
    fn: (ctx: ActionContext, ...args: TArgs) => Promise<TReturn>,
    opts?: { revalidate?: string | string[] }
): (...args: TArgs) => Promise<ActionResult<TReturn>> {
    return async (...args: TArgs) => {
        const user = await requireUser();
        const supabase = await createClient();
        const ctx: ActionContext = { user, tenantId: user.tenantId, supabase };

        try {
            const data = await fn(ctx, ...args);

            if (opts?.revalidate) {
                const paths = Array.isArray(opts.revalidate) ? opts.revalidate : [opts.revalidate];
                paths.forEach((p) => revalidatePath(p));
            }

            return { success: true, data };
        } catch (e) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            console.error(`[action] ${fn.name || "anonymous"}:`, e);
            return { success: false, error: message };
        }
    };
}

/**
 * Same as `action` but throws on failure instead of returning { success, error }.
 * Use for form actions and cases where the caller expects throws.
 */
export function actionThrow<TArgs extends unknown[], TReturn>(
    fn: (ctx: ActionContext, ...args: TArgs) => Promise<TReturn>,
    opts?: { revalidate?: string | string[] }
): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs) => {
        const user = await requireUser();
        const supabase = await createClient();
        const ctx: ActionContext = { user, tenantId: user.tenantId, supabase };

        try {
            const data = await fn(ctx, ...args);

            if (opts?.revalidate) {
                const paths = Array.isArray(opts.revalidate) ? opts.revalidate : [opts.revalidate];
                paths.forEach((p) => revalidatePath(p));
            }

            return data;
        } catch (e) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            console.error(`[action] ${fn.name || "anonymous"}:`, e);
            throw new Error(message);
        }
    };
}
