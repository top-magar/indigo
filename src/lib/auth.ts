import "server-only"
import { cache } from "react"
import { createClient } from "@/infrastructure/supabase/server"
import { redirect } from "next/navigation"

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

  if (!data?.tenant_id) return null

  return {
    id: user.id,
    email: user.email || "",
    tenantId: data.tenant_id,
    role: data.role || "owner",
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
  }
})

/**
 * Require authenticated user with tenant context.
 * Redirects to /login if not authenticated.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getUser()
  if (!user) redirect("/login")
  return user
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
