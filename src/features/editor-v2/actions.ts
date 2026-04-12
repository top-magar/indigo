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
): Promise<{ success: boolean; error?: string; updatedAt?: string }> {
  try {
    const user = await requireUser()
    if (user.tenantId !== tenantId) return { success: false, error: "Unauthorized" }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("store_layouts")
      .update({
        draft_blocks: [{ _v2: true, sections }],
        theme_overrides: theme,
      })
      .eq("id", pageId)
      .eq("tenant_id", tenantId)
      .select("updated_at")
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, updatedAt: data?.updated_at }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function fetchUpdatedAtAction(
  tenantId: string,
  pageId: string,
): Promise<{ updatedAt: string | null }> {
  try {
    const user = await requireUser()
    if (user.tenantId !== tenantId) return { updatedAt: null }
    const supabase = await createClient()
    const { data } = await supabase
      .from("store_layouts")
      .select("updated_at")
      .eq("id", pageId)
      .eq("tenant_id", tenantId)
      .single()
    return { updatedAt: data?.updated_at ?? null }
  } catch {
    return { updatedAt: null }
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

export async function listPagesAction(tenantId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return { pages: [] }
  const supabase = await createClient()
  const { data } = await supabase
    .from("store_layouts")
    .select("id, page_name, is_homepage, updated_at")
    .eq("tenant_id", tenantId)
    .order("is_homepage", { ascending: false })
    .order("page_name")
  return { pages: data ?? [] }
}

export async function createPageAction(tenantId: string, pageName: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return { success: false, error: "Unauthorized" }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("store_layouts")
    .insert({ tenant_id: tenantId, page_name: pageName, draft_blocks: [{ _v2: true, sections: [] }], theme_overrides: {} })
    .select("id")
    .single()
  if (error) return { success: false, error: error.message }
  return { success: true, pageId: data.id }
}

export async function deletePageAction(tenantId: string, pageId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return { success: false }
  const supabase = await createClient()
  const { data: page } = await supabase.from("store_layouts").select("is_homepage").eq("id", pageId).single()
  if (page?.is_homepage) return { success: false, error: "Cannot delete homepage" }
  await supabase.from("store_layouts").delete().eq("id", pageId).eq("tenant_id", tenantId)
  return { success: true }
}

export async function renamePageAction(tenantId: string, pageId: string, name: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return { success: false }
  const supabase = await createClient()
  await supabase.from("store_layouts").update({ page_name: name }).eq("id", pageId).eq("tenant_id", tenantId)
  return { success: true }
}

// ---------------------------------------------------------------------------
// Version History (named checkpoints)
// Requires `page_versions` table:
//   id          uuid PK default gen_random_uuid()
//   tenant_id   uuid NOT NULL references tenants(id)
//   page_id     uuid NOT NULL references store_layouts(id)
//   name        text NOT NULL
//   sections_json text NOT NULL
//   theme_json    text NOT NULL
//   created_at  timestamptz default now()
// ---------------------------------------------------------------------------

export async function saveVersionAction(
  tenantId: string,
  pageId: string,
  name: string,
  data: { sections: Section[]; theme: Record<string, unknown> },
) {
  const supabase = await createClient()
  const { error } = await supabase.from("page_versions").insert({
    tenant_id: tenantId,
    page_id: pageId,
    name,
    sections_json: JSON.stringify(data.sections),
    theme_json: JSON.stringify(data.theme),
  })
  if (error) throw new Error(error.message)
}

export async function listVersionsAction(tenantId: string, pageId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("page_versions")
    .select("id, name, created_at")
    .eq("tenant_id", tenantId)
    .eq("page_id", pageId)
    .order("created_at", { ascending: false })
    .limit(20)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function restoreVersionAction(tenantId: string, pageId: string, versionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("page_versions")
    .select("sections_json, theme_json")
    .eq("id", versionId)
    .single()
  if (error) throw new Error(error.message)
  return {
    sections: JSON.parse(data.sections_json) as Section[],
    theme: JSON.parse(data.theme_json) as Record<string, unknown>,
  }
}