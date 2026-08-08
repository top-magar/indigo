import "server-only"
import { cache } from "react"
import { createClient } from "@/infrastructure/supabase/server"
import { redirect } from "next/navigation"
import { db, type Transaction } from "@/infrastructure/db"
import { sql } from "drizzle-orm"

export interface AuthUser {
  id: string
  email: string
  tenantId: string
  role: string
  fullName: string | null
  avatarUrl: string | null
}

/**
 * Get the current authenticated user with tenant context.
 * Cached per request — safe to call multiple times.
 * Returns null if not authenticated or no tenant.
 */
export const getUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data } = await supabase
    .from("users")
    .select("tenant_id, role, full_name, avatar_url")
    .eq("id", user.id)
    .single()

  if (!data?.tenant_id && data?.role !== "platform_admin") return null

  return {
    id: user.id,
    email: user.email || "",
    tenantId: data.tenant_id || "",
    role: data.role || "owner",
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
  }
})

/**
 * Require authenticated user with tenant context.
 * Redirects to /login if not authenticated.
 * Redirects to /auth/onboarding if authenticated but no tenant.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getUser()
  if (!user) {
    // Check if user is authenticated but missing tenant
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      // Authenticated but no tenant — send to onboarding
      redirect("/auth/onboarding")
    }
    redirect("/login")
  }
  return user
}

/**
 * Require authenticated user WITH a valid tenant context.
 * Use for all merchant dashboard pages and actions.
 * Redirects platform-only admins to /admin.
 */
export async function requireTenantUser(): Promise<AuthUser & { tenantId: string }> {
  const user = await requireUser()
  if (!user.tenantId) redirect("/admin")
  return user as AuthUser & { tenantId: string }
}

/**
 * Get the Supabase client for the current request.
 * Use when you need both auth user AND supabase client for queries.
 */
export async function getAuthenticatedClient() {
  const user = await requireUser()
  const supabase = await createClient()
  return { user, supabase }
}

/**
 * Execute a callback within an authenticated, tenant-scoped Drizzle transaction.
 * Sets RLS context (app.current_tenant) for the transaction.
 *
 * Use for mutations that need Drizzle ORM with tenant isolation.
 */
export async function authorizedAction<T>(
  callback: (tx: Transaction, tenantId: string) => Promise<T>
): Promise<T> {
  const user = await requireUser()
  if (!user.tenantId) throw new Error("Tenant context required")
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_tenant', ${user.tenantId}, true)`)
    return callback(tx, user.tenantId)
  })
}
