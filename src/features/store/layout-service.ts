// Store Layout Service - Production-ready layout management
import { createClient } from "@/infrastructure/supabase/server"
import { createDefaultHomepageLayout } from "./default-layout"
import type { PageLayout, StoreBlock } from "@/types/blocks"

export interface StoreLayoutRow {
  id: string
  tenant_id: string
  name: string
  slug: string
  is_homepage: boolean
  status: "draft" | "published"
  template_id: string | null
  blocks: StoreBlock[]
  draft_blocks: StoreBlock[] | null
  theme_overrides: Record<string, unknown> | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface LayoutStatus {
  status: "draft" | "published"
  hasDraft: boolean
  hasPublished: boolean
  lastPublishedAt: string | null
  lastUpdatedAt: string
}

/**
 * Fetch the homepage layout for a tenant (public storefront)
 * Only returns published content
 */
export async function getHomepageLayout(
  tenantId: string,
  storeSlug: string
): Promise<{ layout: PageLayout; isDefault: boolean }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("store_layouts")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_homepage", true)
    .maybeSingle()

  if (error) {
    console.error("Error fetching layout:", error)
  }

  // Return published blocks if available
  if (data?.blocks && Array.isArray(data.blocks) && data.blocks.length > 0) {
    return {
      layout: transformDbToLayout(data as StoreLayoutRow),
      isDefault: false,
    }
  }

  // Return default layout
  return {
    layout: createDefaultHomepageLayout(storeSlug),
    isDefault: true,
  }
}

/**
 * Fetch draft layout for preview (Draft Mode)
 * Returns draft_blocks if available, otherwise falls back to published blocks
 * 
 * @see https://nextjs.org/docs/app/guides/draft-mode
 */
export async function getDraftLayout(
  tenantId: string,
  storeSlug: string
): Promise<{ layout: PageLayout; isDefault: boolean } | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("store_layouts")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_homepage", true)
    .maybeSingle()

  if (error) {
    console.error("Error fetching draft layout:", error)
    return null
  }

  if (!data) {
    // No layout exists, return default
    return {
      layout: createDefaultHomepageLayout(storeSlug),
      isDefault: true,
    }
  }

  const row = data as StoreLayoutRow

  // Prefer draft blocks if they exist
  const blocksToUse = row.draft_blocks && row.draft_blocks.length > 0
    ? row.draft_blocks
    : row.blocks

  if (blocksToUse && Array.isArray(blocksToUse) && blocksToUse.length > 0) {
    return {
      layout: {
        ...transformDbToLayout(row),
        blocks: blocksToUse,
      },
      isDefault: false,
    }
  }

  // Fall back to default layout
  return {
    layout: createDefaultHomepageLayout(storeSlug),
    isDefault: true,
  }
}

/**
 * Fetch layout for dashboard editing (includes draft content)
 */
export async function getLayoutForEditing(
  tenantId: string,
  _storeSlug: string
): Promise<{
  layout: PageLayout | null
  templateId: string | null
  layoutStatus: LayoutStatus | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("store_layouts")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_homepage", true)
    .maybeSingle()

  if (error) {
    console.error("Error fetching layout for editing:", error)
    return { layout: null, templateId: null, layoutStatus: null }
  }

  if (!data) {
    return { layout: null, templateId: null, layoutStatus: null }
  }

  const row = data as StoreLayoutRow

  // Prefer draft blocks if they exist, otherwise use published blocks
  const blocksToEdit = row.draft_blocks && row.draft_blocks.length > 0
    ? row.draft_blocks
    : row.blocks

  const layoutStatus: LayoutStatus = {
    status: row.status,
    hasDraft: !!(row.draft_blocks && row.draft_blocks.length > 0),
    hasPublished: !!(row.blocks && row.blocks.length > 0),
    lastPublishedAt: row.published_at,
    lastUpdatedAt: row.updated_at,
  }

  if (blocksToEdit && Array.isArray(blocksToEdit) && blocksToEdit.length > 0) {
    return {
      layout: {
        ...transformDbToLayout(row),
        blocks: blocksToEdit,
      },
      templateId: row.template_id,
      layoutStatus,
    }
  }

  return { layout: null, templateId: null, layoutStatus }
}

/**
 * Save layout as draft (doesn't affect live store)
 */
export async function saveDraft(
  tenantId: string,
  blocks: StoreBlock[],
  options?: {
    templateId?: string | null
  }
): Promise<{ success: boolean; error?: string; layoutId?: string }> {
  const supabase = await createClient()

  // Check if layout exists
  const { data: existing } = await supabase
    .from("store_layouts")
    .select("id, blocks")
    .eq("tenant_id", tenantId)
    .eq("is_homepage", true)
    .maybeSingle()

  const layoutData = {
    tenant_id: tenantId,
    name: "Homepage",
    slug: "/",
    is_homepage: true,
    template_id: options?.templateId ?? null,
    draft_blocks: blocks,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { error } = await supabase
      .from("store_layouts")
      .update(layoutData)
      .eq("id", existing.id)

    if (error) {
      console.error("Failed to save draft:", error)
      return { success: false, error: error.message }
    }

    return { success: true, layoutId: existing.id }
  }

  // Create new layout with draft
  const { data, error } = await supabase
    .from("store_layouts")
    .insert({
      ...layoutData,
      status: "draft",
      blocks: [], // Empty published blocks
    })
    .select("id")
    .single()

  if (error) {
    console.error("Failed to create draft:", error)
    return { success: false, error: error.message }
  }

  return { success: true, layoutId: data.id }
}

/**
 * Publish draft to live store
 */
export async function publishLayout(
  tenantId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get current layout with draft
  const { data: existing, error: fetchError } = await supabase
    .from("store_layouts")
    .select("id, draft_blocks, blocks")
    .eq("tenant_id", tenantId)
    .eq("is_homepage", true)
    .maybeSingle()

  if (fetchError || !existing) {
    return { success: false, error: "Layout not found" }
  }

  // Use draft blocks if available, otherwise keep current blocks
  const blocksToPublish = existing.draft_blocks && existing.draft_blocks.length > 0
    ? existing.draft_blocks
    : existing.blocks

  if (!blocksToPublish || blocksToPublish.length === 0) {
    return { success: false, error: "No content to publish" }
  }

  const { error } = await supabase
    .from("store_layouts")
    .update({
      blocks: blocksToPublish,
      draft_blocks: null, // Clear draft after publishing
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)

  if (error) {
    console.error("Failed to publish layout:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Discard draft and revert to published version
 */
export async function discardDraft(
  tenantId: string
): Promise<{ success: boolean; error?: string; blocks?: StoreBlock[] }> {
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from("store_layouts")
    .select("id, blocks")
    .eq("tenant_id", tenantId)
    .eq("is_homepage", true)
    .maybeSingle()

  if (fetchError || !existing) {
    return { success: false, error: "Layout not found" }
  }

  const { error } = await supabase
    .from("store_layouts")
    .update({
      draft_blocks: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)

  if (error) {
    console.error("Failed to discard draft:", error)
    return { success: false, error: error.message }
  }

  return { success: true, blocks: existing.blocks as StoreBlock[] }
}

/**
 * Save or update a layout (legacy - publishes immediately)
 */
export async function saveLayout(
  tenantId: string,
  blocks: StoreBlock[],
  options?: {
    templateId?: string | null
    status?: "draft" | "published"
  }
): Promise<{ success: boolean; error?: string; layoutId?: string }> {
  const supabase = await createClient()

  // Check if layout exists
  const { data: existing } = await supabase
    .from("store_layouts")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("is_homepage", true)
    .maybeSingle()

  const layoutData = {
    tenant_id: tenantId,
    name: "Homepage",
    slug: "/",
    is_homepage: true,
    status: options?.status || "published",
    template_id: options?.templateId ?? null,
    blocks: blocks,
    draft_blocks: null, // Clear draft when saving directly
    updated_at: new Date().toISOString(),
    published_at: options?.status === "published" ? new Date().toISOString() : null,
  }

  if (existing) {
    const { error } = await supabase
      .from("store_layouts")
      .update(layoutData)
      .eq("id", existing.id)

    if (error) {
      console.error("Failed to update layout:", error)
      return { success: false, error: error.message }
    }

    return { success: true, layoutId: existing.id }
  }

  const { data, error } = await supabase
    .from("store_layouts")
    .insert(layoutData)
    .select("id")
    .single()

  if (error) {
    console.error("Failed to create layout:", error)
    return { success: false, error: error.message }
  }

  return { success: true, layoutId: data.id }
}

/**
 * Transform database row to PageLayout
 */
function transformDbToLayout(row: StoreLayoutRow): PageLayout {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    isHomepage: row.is_homepage,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    blocks: row.blocks,
  }
}

/**
 * Verify user has access to tenant
 */
export async function verifyTenantAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", userId)
    .single()

  return data?.tenant_id === tenantId
}
