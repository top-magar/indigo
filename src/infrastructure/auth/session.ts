import "server-only"
import { createClient } from "@/infrastructure/supabase/server"
import { cache } from "react"

export interface UserSession {
  user: {
    id: string
    email: string
    tenantId: string | null
    role: string | null
    fullName: string | null
  } | null
}

/**
 * Get the current user session from Supabase Auth
 * Cached per request to avoid multiple DB calls
 */
export const getSession = cache(async (): Promise<UserSession> => {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null }
  }
  
  // Get user profile with tenant info
  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id, role, full_name")
    .eq("id", user.id)
    .single()
  
  return {
    user: {
      id: user.id,
      email: user.email || "",
      tenantId: profile?.tenant_id || null,
      role: profile?.role || null,
      fullName: profile?.full_name || null,
    }
  }
})

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()
  
  if (!session.user) {
    throw new Error("Unauthorized")
  }
  
  return session.user
}

/**
 * Require tenant context - throws if no tenant
 */
export async function requireTenant() {
  const user = await requireAuth()
  
  if (!user.tenantId) {
    throw new Error("No tenant context")
  }
  
  return { ...user, tenantId: user.tenantId }
}
