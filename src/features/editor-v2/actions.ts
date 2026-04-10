"use server"

import { requireUser } from "@/lib/auth"
import { createClient } from "@/infrastructure/supabase/server"
import { revalidatePath } from "next/cache"

interface Section { id: string; type: string; props: Record<string, unknown> }

export async function saveSectionsAction(
  tenantId: string,
  pageId: string,
  sections: Section[],
  theme: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser()
    if (user.tenantId !== tenantId) return { success: false, error: "Unauthorized" }

    const supabase = await createClient()
    const { error } = await supabase
      .from("store_layouts")
      .update({
        draft_blocks: [{ _v2: true, sections }],
        theme_overrides: theme,
      })
      .eq("id", pageId)
      .eq("tenant_id", tenantId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function publishSectionsAction(
  tenantId: string,
  pageId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser()
    if (user.tenantId !== tenantId) return { success: false, error: "Unauthorized" }
    if (user.role !== "owner" && user.role !== "admin") return { success: false, error: "Insufficient permissions" }

    const supabase = await createClient()

    // Copy draft_blocks → blocks
    const { data: layout } = await supabase
      .from("store_layouts")
      .select("draft_blocks, tenant_id")
      .eq("id", pageId)
      .eq("tenant_id", tenantId)
      .single()

    if (!layout) return { success: false, error: "Page not found" }

    const { error } = await supabase
      .from("store_layouts")
      .update({ blocks: layout.draft_blocks })
      .eq("id", pageId)
      .eq("tenant_id", tenantId)

    if (error) return { success: false, error: error.message }

    // Revalidate storefront
    const { data: tenant } = await supabase.from("tenants").select("slug").eq("id", tenantId).single()
    if (tenant?.slug) revalidatePath(`/store/${tenant.slug}`, "page")

    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function fetchProductsAction(tenantId: string, search?: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return { success: false as const, error: "Unauthorized", products: [] }
  const supabase = await createClient()
  let query = supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, images, status")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .order("name")
    .limit(50)
  if (search) query = query.ilike("name", `%${search}%`)
  const { data, error } = await query
  if (error) return { success: false as const, error: error.message, products: [] }
  return { success: true as const, products: data ?? [] }
}

export async function fetchCollectionsAction(tenantId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return { success: false as const, error: "Unauthorized", collections: [] }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, image_url")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order")
    .limit(50)
  if (error) return { success: false as const, error: error.message, collections: [] }
  return { success: true as const, collections: data ?? [] }
}

export async function fetchCategoriesAction(tenantId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return { success: false as const, error: "Unauthorized", categories: [] }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("tenant_id", tenantId)
    .order("sort_order")
    .limit(50)
  if (error) return { success: false as const, error: error.message, categories: [] }
  return { success: true as const, categories: data ?? [] }
}

export async function fetchTenantSettingsAction(tenantId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return { success: false as const, error: "Unauthorized", tenant: null }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tenants")
    .select("name, slug, logo_url, currency, description")
    .eq("id", tenantId)
    .single()
  if (error) return { success: false as const, error: error.message, tenant: null }
  return { success: true as const, tenant: data }
}
