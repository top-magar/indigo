"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/infrastructure/supabase/server"
import { requireUser } from "@/lib/auth"

/** Verify the current user owns the tenant before mutating */
async function verifyTenantOwnership(tenantId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) {
    throw new Error("Unauthorized: tenant mismatch")
  }
  return user
}

// ============================================================================
// PAGE CRUD
// ============================================================================

/** List all pages for a tenant */
export async function listPagesAction(tenantId: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("store_layouts")
    .select("id, name, slug, is_homepage, status, updated_at")
    .eq("tenant_id", tenantId)
    .order("is_homepage", { ascending: false })
    .order("name")

  if (error) return { success: false as const, error: error.message, pages: [] }
  return { success: true as const, pages: data ?? [] }
}

/** Create a new page */
export async function createPageAction(tenantId: string, name: string, slug: string, initialJson?: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`

  const draftBlocks = initialJson ? [{ _craftjs: true, json: initialJson }] : null

  const { data, error } = await supabase
    .from("store_layouts")
    .insert({
      tenant_id: tenantId,
      name,
      slug: normalizedSlug,
      is_homepage: false,
      status: "draft",
      blocks: [],
      draft_blocks: draftBlocks,
    })
    .select("id")
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, pageId: data.id }
}

/** Delete a non-homepage page */
export async function deletePageAction(tenantId: string, pageId: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  // Prevent deleting homepage
  const { data: page } = await supabase
    .from("store_layouts")
    .select("is_homepage")
    .eq("id", pageId)
    .eq("tenant_id", tenantId)
    .single()

  if (page?.is_homepage) return { success: false, error: "Cannot delete homepage" }

  const { error } = await supabase
    .from("store_layouts")
    .delete()
    .eq("id", pageId)
    .eq("tenant_id", tenantId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ============================================================================
// SAVE / PUBLISH (now page-aware)
// ============================================================================

/** Save Craft.js serialized JSON as draft for a specific page */
export async function saveDraftAction(tenantId: string, craftJson: string, pageId?: string) {
  await verifyTenantOwnership(tenantId)

  if (!craftJson || typeof craftJson !== "string") {
    return { success: false, error: "Invalid layout data" }
  }
  try { JSON.parse(craftJson) } catch {
    return { success: false, error: "Malformed layout JSON" }
  }

  const supabase = await createClient()

  // Find the target page
  let query = supabase.from("store_layouts").select("id").eq("tenant_id", tenantId)
  if (pageId) {
    query = query.eq("id", pageId)
  } else {
    query = query.eq("is_homepage", true)
  }
  const { data: existing } = await query.maybeSingle()

  const draftData = [{ _craftjs: true, json: craftJson }]

  if (existing) {
    const { error } = await supabase
      .from("store_layouts")
      .update({ draft_blocks: draftData, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from("store_layouts")
      .insert({
        tenant_id: tenantId,
        name: "Homepage",
        slug: "/",
        is_homepage: true,
        draft_blocks: draftData,
        status: "draft",
        blocks: [],
      })
    if (error) return { success: false, error: error.message }
  }

  revalidatePath("/store/[slug]", "page")
  return { success: true }
}

/** Publish: copy draft_blocks → blocks for a specific page */
export async function publishAction(tenantId: string, pageId?: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  let query = supabase.from("store_layouts").select("id, draft_blocks, blocks").eq("tenant_id", tenantId)
  if (pageId) {
    query = query.eq("id", pageId)
  } else {
    query = query.eq("is_homepage", true)
  }
  const { data: existing, error: fetchError } = await query.maybeSingle()

  if (fetchError || !existing) return { success: false, error: "Layout not found" }

  const blocksToPublish = existing.draft_blocks
  if (!blocksToPublish || !Array.isArray(blocksToPublish) || blocksToPublish.length === 0) {
    return { success: false, error: "No draft to publish" }
  }

  // Snapshot current published blocks before overwriting
  if (existing.blocks && Array.isArray(existing.blocks) && existing.blocks.length > 0) {
    await supabase.from("layout_versions").insert({
      layout_id: existing.id,
      tenant_id: tenantId,
      blocks: existing.blocks,
      label: `Before publish ${new Date().toLocaleString()}`,
    })
    // Keep only last 20 versions
    const { data: versions } = await supabase
      .from("layout_versions")
      .select("id")
      .eq("layout_id", existing.id)
      .order("created_at", { ascending: false })
    if (versions && versions.length > 20) {
      const toDelete = versions.slice(20).map((v: any) => v.id)
      await supabase.from("layout_versions").delete().in("id", toDelete)
    }
  }

  const { error } = await supabase
    .from("store_layouts")
    .update({
      blocks: blocksToPublish,
      draft_blocks: null,
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/store/[slug]", "page")
  return { success: true }
}

// ============================================================================
// THEME / SEO (now page-aware)
// ============================================================================

export async function saveThemeAction(tenantId: string, theme: Record<string, unknown>, pageId?: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  let query = supabase
    .from("store_layouts")
    .update({ theme_overrides: theme, updated_at: new Date().toISOString() })
    .eq("tenant_id", tenantId)

  if (pageId) {
    query = query.eq("id", pageId)
  } else {
    query = query.eq("is_homepage", true)
  }

  const { error } = await query
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function saveSeoAction(tenantId: string, seo: { title: string; description: string; ogImage: string }, pageId?: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  let selectQuery = supabase.from("store_layouts").select("theme_overrides").eq("tenant_id", tenantId)
  if (pageId) {
    selectQuery = selectQuery.eq("id", pageId)
  } else {
    selectQuery = selectQuery.eq("is_homepage", true)
  }
  const { data: existing } = await selectQuery.maybeSingle()

  const merged = { ...(existing?.theme_overrides as Record<string, unknown> ?? {}), seo }

  let updateQuery = supabase
    .from("store_layouts")
    .update({ theme_overrides: merged, updated_at: new Date().toISOString() })
    .eq("tenant_id", tenantId)

  if (pageId) {
    updateQuery = updateQuery.eq("id", pageId)
  } else {
    updateQuery = updateQuery.eq("is_homepage", true)
  }

  const { error } = await updateQuery
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ============================================================================
// VERSION HISTORY
// ============================================================================

export async function listVersionsAction(tenantId: string, pageId: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("layout_versions")
    .select("id, label, created_at")
    .eq("layout_id", pageId)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) return { success: false as const, error: error.message, versions: [] }
  return { success: true as const, versions: data ?? [] }
}

export async function restoreVersionAction(tenantId: string, versionId: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  const { data: version, error: fetchError } = await supabase
    .from("layout_versions")
    .select("layout_id, blocks")
    .eq("id", versionId)
    .eq("tenant_id", tenantId)
    .single()

  if (fetchError || !version) return { success: false, error: "Version not found" }

  const { error } = await supabase
    .from("store_layouts")
    .update({ draft_blocks: version.blocks, updated_at: new Date().toISOString() })
    .eq("id", version.layout_id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ============================================================================
// DATA FETCHING (unchanged)
// ============================================================================

export async function fetchProductsAction(tenantId: string, search?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("products")
    .select("id, name, slug, price, images, status")
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
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, image_url, products_count")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name")
    .limit(50)
  if (error) return { success: false as const, error: error.message, collections: [] }
  return { success: true as const, collections: data ?? [] }
}

/** Save global header/footer settings (shared across all pages) */
export async function saveGlobalSectionsAction(
  tenantId: string,
  sections: { headerEnabled: boolean; footerEnabled: boolean; headerJson?: string; footerJson?: string }
) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", tenantId)
    .single()

  const settings = (tenant?.settings as Record<string, unknown>) ?? {}
  settings.globalHeader = { enabled: sections.headerEnabled, json: sections.headerJson ?? null }
  settings.globalFooter = { enabled: sections.footerEnabled, json: sections.footerJson ?? null }

  const { error } = await supabase
    .from("tenants")
    .update({ settings, updated_at: new Date().toISOString() })
    .eq("id", tenantId)

  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}

/** Get global header/footer settings */
export async function getGlobalSectionsAction(tenantId: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", tenantId)
    .single()

  const settings = (tenant?.settings as Record<string, unknown>) ?? {}
  return {
    success: true as const,
    headerEnabled: (settings.globalHeader as any)?.enabled ?? false,
    footerEnabled: (settings.globalFooter as any)?.enabled ?? false,
    headerJson: (settings.globalHeader as any)?.json ?? null,
    footerJson: (settings.globalFooter as any)?.json ?? null,
  }
}
