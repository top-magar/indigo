"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "./client"
import type { Tenant, User } from "./types"

interface TenantContextType {
  tenant: Tenant | null
  user: User | null
  isLoading: boolean
  refetch: () => Promise<void>
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  user: null,
  isLoading: true,
  refetch: async () => {},
})

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTenantData = async () => {
    const supabase = createClient()

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      setTenant(null)
      setUser(null)
      setIsLoading(false)
      return
    }

    // Get user profile with tenant
    const { data: userData } = await supabase
      .from("users")
      .select("*, tenant:tenants(*)")
      .eq("id", authUser.id)
      .single()

    if (userData) {
      setUser({
        id: userData.id,
        tenant_id: userData.tenant_id,
        email: userData.email,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        role: userData.role,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      })
      setTenant(userData.tenant as Tenant)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchTenantData()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchTenantData()
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <TenantContext.Provider value={{ tenant, user, isLoading, refetch: fetchTenantData }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
