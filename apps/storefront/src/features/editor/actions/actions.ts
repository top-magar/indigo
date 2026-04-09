"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/infrastructure/supabase/server"
import { requireUser } from "@/lib/auth"
import { auditLogger } from "@/infrastructure/services/audit-logger"
import { defaultPageJson } from "../lib/default-page"

/** Verify the current user owns the tenant before mutating */
async function verifyTenantOwnership(tenantId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) {
    throw new Error("Unauthorized: tenant mismatch")
  }
  return user
}

/** Fire-and-forget audit log — never blocks the action */
function audit(tenantId: string, action: string, userId: string, entityId?: string, extra?: Record<string, unknown>) {
  auditLogger.log(tenantId, action, { userId, entityType: "layout", entityId, newValues: extra }).catch(() => {})
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


/** Load a single page's craft_json from draft_blocks */
export async function loadPageAction(tenantId: string, pageId: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("store_layouts")
    .select("id, draft_blocks")
    .eq("tenant_id", tenantId)
    .eq("id", pageId)
    .maybeSingle()

  if (error) return { success: false as const, error: error.message, craftJson: null }
  if (!data) return { success: false as const, error: "Page not found", craftJson: null }

  const block = Array.isArray(data.draft_blocks)
    ? (data.draft_blocks as { _craftjs?: boolean; json?: string }[]).find((b) => b._craftjs)
    : null

  return { success: true as const, craftJson: block?.json ?? null }
}

/** Create a new page */
export async function createPageAction(tenantId: string, name: string, slug: string, initialJson?: string) {
  const validTenantId = z.string().min(1).parse(tenantId)
  const validName = z.string().min(1).max(100).parse(name)
  const validSlug = z.string().min(1).max(200).parse(slug)
  const user = await verifyTenantOwnership(validTenantId)
  const supabase = await createClient()

  const normalizedSlug = validSlug.startsWith("/") ? validSlug : `/${validSlug}`

  // Every page gets header + footer by default
  const json = initialJson || defaultPageJson()
  const draftBlocks = [{ _craftjs: true, json }]

  const { data, error } = await supabase
    .from("store_layouts")
    .insert({
      tenant_id: validTenantId,
      name: validName,
      slug: normalizedSlug,
      is_homepage: false,
      status: "draft",
      blocks: [],
      draft_blocks: draftBlocks,
    })
    .select("id")
    .single()

  if (error) return { success: false as const, error: error.message }
  audit(validTenantId, "page.create", user.id, data.id, { name: validName, slug: normalizedSlug })
  return { success: true as const, pageId: data.id }
}

/** Delete a non-homepage page */
export async function deletePageAction(tenantId: string, pageId: string) {
  const validTenantId = z.string().min(1).parse(tenantId)
  const validPageId = z.string().uuid().parse(pageId)
  const user = await verifyTenantOwnership(validTenantId)
  if (user.role !== "owner" && user.role !== "admin") return { success: false, error: "Insufficient permissions" }
  const supabase = await createClient()

  // Prevent deleting homepage
  const { data: page } = await supabase
    .from("store_layouts")
    .select("is_homepage")
    .eq("id", validPageId)
    .eq("tenant_id", validTenantId)
    .single()

  if (page?.is_homepage) return { success: false, error: "Cannot delete homepage" }

  const { error } = await supabase
    .from("store_layouts")
    .delete()
    .eq("id", validPageId)
    .eq("tenant_id", validTenantId)

  if (error) return { success: false, error: error.message }
  audit(validTenantId, "page.delete", user.id, validPageId)
  return { success: true }
}

// ============================================================================
// SAVE / PUBLISH (now page-aware)
// ============================================================================

/** Save Craft.js serialized JSON as draft for a specific page */
export async function saveDraftAction(tenantId: string, craftJson: string, pageId?: string, expectedUpdatedAt?: string | null, force?: boolean) {
  const validTenantId = z.string().min(1).parse(tenantId)
  const validPageId = z.string().uuid().optional().parse(pageId)
  const user = await verifyTenantOwnership(validTenantId)
  if (user.role === "viewer") return { success: false as const, error: "Insufficient permissions" }

  if (!craftJson || typeof craftJson !== "string") {
    return { success: false as const, error: "Invalid layout data" }
  }
  try { JSON.parse(craftJson) } catch {
    return { success: false as const, error: "Malformed layout JSON" }
  }

  const supabase = await createClient()

  // Find the target page
  let query = supabase.from("store_layouts").select("id, updated_at").eq("tenant_id", validTenantId)
  if (validPageId) {
    query = query.eq("id", validPageId)
  } else {
    query = query.eq("is_homepage", true)
  }
  const { data: existing } = await query.maybeSingle()

  const draftData = [{ _craftjs: true, json: craftJson }]
  const now = new Date().toISOString()

  if (existing) {
    // Conflict check: if caller provided expectedUpdatedAt and it doesn't match, another tab saved
    if (!force && expectedUpdatedAt && existing.updated_at && existing.updated_at !== expectedUpdatedAt) {
      return { success: false as const, error: "conflict", serverUpdatedAt: existing.updated_at }
    }
    const { error } = await supabase
      .from("store_layouts")
      .update({ draft_blocks: draftData, updated_at: now })
      .eq("id", existing.id)
    if (error) return { success: false as const, error: error.message }
  } else {
    const { error } = await supabase
      .from("store_layouts")
      .insert({
        tenant_id: validTenantId,
        name: "Homepage",
        slug: "/",
        is_homepage: true,
        draft_blocks: draftData,
        status: "draft",
        blocks: [],
      })
    if (error) return { success: false as const, error: error.message }
  }

  revalidatePath("/store/[slug]", "page")
  audit(validTenantId, "layout.save_draft", user.id, validPageId)
  return { success: true as const, updatedAt: now }
}

/** Publish: copy draft_blocks → blocks for a specific page */
export async function publishAction(tenantId: string, pageId?: string) {
  const validTenantId = z.string().min(1).parse(tenantId)
  const validPageId = z.string().uuid().optional().parse(pageId)
  const user = await verifyTenantOwnership(validTenantId)
  if (user.role !== "owner" && user.role !== "admin") return { success: false, error: "Insufficient permissions" }
  const supabase = await createClient()

  let query = supabase.from("store_layouts").select("id, draft_blocks, blocks").eq("tenant_id", validTenantId)
  if (validPageId) {
    query = query.eq("id", validPageId)
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
      tenant_id: validTenantId,
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
  audit(validTenantId, "layout.publish", user.id, existing.id)
  return { success: true }
}

// ============================================================================
// THEME / SEO (now page-aware)
// ============================================================================

export async function saveThemeAction(tenantId: string, theme: Record<string, unknown>, pageId?: string) {
  const user = await verifyTenantOwnership(tenantId)
  if (user.role !== "owner" && user.role !== "admin") return { success: false as const, error: "Insufficient permissions" }
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
  audit(tenantId, "layout.theme_change", user.id, pageId, theme)
  return { success: true }
}

export async function saveSeoAction(tenantId: string, seo: { title: string; description: string; ogImage: string }, pageId?: string) {
  const validTenantId = z.string().min(1).parse(tenantId)
  const validSeo = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(500),
    ogImage: z.string(),
  }).parse(seo)
  const validPageId = z.string().uuid().optional().parse(pageId)
  const user = await verifyTenantOwnership(validTenantId)
  if (user.role !== "owner" && user.role !== "admin") return { success: false as const, error: "Insufficient permissions" }
  const supabase = await createClient()

  let selectQuery = supabase.from("store_layouts").select("theme_overrides").eq("tenant_id", validTenantId)
  if (validPageId) {
    selectQuery = selectQuery.eq("id", validPageId)
  } else {
    selectQuery = selectQuery.eq("is_homepage", true)
  }
  const { data: existing } = await selectQuery.maybeSingle()

  const merged = { ...(existing?.theme_overrides as Record<string, unknown> ?? {}), seo: validSeo }

  let updateQuery = supabase
    .from("store_layouts")
    .update({ theme_overrides: merged, updated_at: new Date().toISOString() })
    .eq("tenant_id", validTenantId)

  if (validPageId) {
    updateQuery = updateQuery.eq("id", validPageId)
  } else {
    updateQuery = updateQuery.eq("is_homepage", true)
  }

  const { error } = await updateQuery
  if (error) return { success: false, error: error.message }
  audit(validTenantId, "layout.seo_update", user.id, validPageId, validSeo)
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
  const validTenantId = z.string().min(1).parse(tenantId)
  const validVersionId = z.string().uuid().parse(versionId)
  const user = await verifyTenantOwnership(validTenantId)
  const supabase = await createClient()

  const { data: version, error: fetchError } = await supabase
    .from("layout_versions")
    .select("layout_id, blocks")
    .eq("id", validVersionId)
    .eq("tenant_id", validTenantId)
    .single()

  if (fetchError || !version) return { success: false, error: "Version not found" }

  const { error } = await supabase
    .from("store_layouts")
    .update({ draft_blocks: version.blocks, updated_at: new Date().toISOString() })
    .eq("id", version.layout_id)

  if (error) return { success: false, error: error.message }
  audit(validTenantId, "layout.restore_version", user.id, validVersionId)
  return { success: true }
}

// ============================================================================
// DATA FETCHING (unchanged)
// ============================================================================

export async function fetchProductsAction(tenantId: string, search?: string) {
  await verifyTenantOwnership(tenantId)
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

/** Save global header/footer settings (shared across all pages) */
export async function saveGlobalSectionsAction(
  tenantId: string,
  sections: { headerEnabled: boolean; footerEnabled: boolean; headerJson?: string; footerJson?: string }
) {
  const user = await verifyTenantOwnership(tenantId)
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
  audit(tenantId, "tenant.global_sections_update", user.id)
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

// ── Page Templates ──────────────────────────────────────────────

export async function saveAsTemplateAction(tenantId: string, name: string, craftJson: string, description?: string) {
  const validTenantId = z.string().min(1).parse(tenantId)
  const validName = z.string().min(1).max(100).parse(name)
  const user = await verifyTenantOwnership(validTenantId)
  const supabase = await createClient()
  const { error } = await supabase.from("page_templates").insert({
    tenant_id: validTenantId, name: validName, description: description ?? null, data: JSON.parse(craftJson),
  })
  if (error) return { success: false as const, error: error.message }
  audit(validTenantId, "template.create", user.id, undefined, { name: validName })
  return { success: true as const }
}

export async function listTemplatesAction(tenantId: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()
  const { data, error } = await supabase.from("page_templates")
    .select("id, name, description, created_at")
    .eq("tenant_id", tenantId).order("created_at", { ascending: false })
  if (error) return { success: false as const, templates: [], error: error.message }
  return { success: true as const, templates: data ?? [] }
}

export async function deleteTemplateAction(tenantId: string, templateId: string) {
  const validTenantId = z.string().min(1).parse(tenantId)
  const validTemplateId = z.string().uuid().parse(templateId)
  const user = await verifyTenantOwnership(validTenantId)
  const supabase = await createClient()
  const { error } = await supabase.from("page_templates").delete()
    .eq("id", validTemplateId).eq("tenant_id", validTenantId)
  if (error) return { success: false as const, error: error.message }
  audit(validTenantId, "template.delete", user.id, validTemplateId)
  return { success: true as const }
}

export async function getTemplateAction(tenantId: string, templateId: string) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()
  const { data, error } = await supabase.from("page_templates")
    .select("*").eq("id", templateId).eq("tenant_id", tenantId).single()
  if (error) return { success: false as const, error: error.message }
  return { success: true as const, template: data }
}


