"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { StoreBlock } from "@/types/blocks"
import type { TemplateId } from "@/components/store/blocks/templates"
import { getTemplateById, templateToLayout } from "@/components/store/blocks/templates"
import { 
  saveLayout, 
  saveDraft, 
  publishLayout, 
  discardDraft, 
  verifyTenantAccess 
} from "@/lib/store/layout-service"

export type ActionResult<T = void> = 
  | { success: true; data?: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Save the complete store layout
 */
export async function saveStoreLayout(
  tenantId: string,
  storeSlug: string,
  data: {
    templateId?: TemplateId | null
    blocks: StoreBlock[]
  }
): Promise<ActionResult<{ layoutId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Verify tenant access
  const hasAccess = await verifyTenantAccess(user.id, tenantId)
  if (!hasAccess) {
    return { success: false, error: "You don't have access to this store" }
  }

  // Validate blocks
  if (!Array.isArray(data.blocks) || data.blocks.length === 0) {
    return { success: false, error: "Invalid layout: blocks are required" }
  }

  // Save layout
  const result = await saveLayout(tenantId, data.blocks, {
    templateId: data.templateId,
    status: "published",
  })

  if (!result.success) {
    return { success: false, error: result.error || "Failed to save layout" }
  }

  // Revalidate both editor and store pages
  revalidatePath("/storefront")
  revalidatePath(`/store/${storeSlug}`)

  return { success: true, data: { layoutId: result.layoutId! } }
}

/**
 * Apply a template preset
 */
export async function applyTemplate(
  tenantId: string,
  storeSlug: string,
  templateId: TemplateId
): Promise<ActionResult<{ blocks: StoreBlock[] }>> {
  const template = getTemplateById(templateId)
  if (!template) {
    return { success: false, error: "Template not found" }
  }

  const layout = templateToLayout(template, storeSlug)
  
  const result = await saveStoreLayout(tenantId, storeSlug, {
    templateId,
    blocks: layout.blocks,
  })

  if (!result.success) {
    return { success: false, error: result.error }
  }

  return { success: true, data: { blocks: layout.blocks } }
}

/**
 * Update a single block's visibility
 */
export async function updateBlockVisibility(
  tenantId: string,
  storeSlug: string,
  blockId: string,
  visible: boolean,
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const updatedBlocks = currentBlocks.map((block) =>
    block.id === blockId ? { ...block, visible } : block
  )

  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: updatedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

/**
 * Update a single block's variant
 */
export async function updateBlockVariant(
  tenantId: string,
  storeSlug: string,
  blockId: string,
  variant: string,
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const updatedBlocks = currentBlocks.map((block) =>
    block.id === blockId ? { ...block, variant } : block
  ) as StoreBlock[]

  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: updatedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

/**
 * Reorder blocks
 */
export async function reorderBlocks(
  tenantId: string,
  storeSlug: string,
  blockIds: string[],
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const blockMap = new Map(currentBlocks.map((b) => [b.id, b]))
  const reorderedBlocks = blockIds
    .map((id, index) => {
      const block = blockMap.get(id)
      if (block) {
        return { ...block, order: index }
      }
      return null
    })
    .filter((b): b is StoreBlock => b !== null)

  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: reorderedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

/**
 * Update block settings
 */
export async function updateBlockSettings(
  tenantId: string,
  storeSlug: string,
  blockId: string,
  settings: Record<string, unknown>,
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const updatedBlocks = currentBlocks.map((block) =>
    block.id === blockId
      ? { ...block, settings: { ...block.settings, ...settings } }
      : block
  ) as StoreBlock[]

  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: updatedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

/**
 * Add a new block
 */
export async function addBlock(
  tenantId: string,
  storeSlug: string,
  block: StoreBlock,
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const updatedBlocks = [...currentBlocks, block]
  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: updatedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

/**
 * Remove a block
 */
export async function removeBlock(
  tenantId: string,
  storeSlug: string,
  blockId: string,
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const updatedBlocks = currentBlocks
    .filter((b) => b.id !== blockId)
    .map((b, i) => ({ ...b, order: i }))

  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: updatedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

/**
 * Reset to default layout
 */
export async function resetToDefault(
  tenantId: string,
  storeSlug: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const hasAccess = await verifyTenantAccess(user.id, tenantId)
  if (!hasAccess) {
    return { success: false, error: "You don't have access to this store" }
  }

  // Delete existing layout to reset to default
  const { error } = await supabase
    .from("store_layouts")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("is_homepage", true)

  if (error) {
    return { success: false, error: "Failed to reset layout" }
  }

  revalidatePath("/storefront")
  revalidatePath(`/store/${storeSlug}`)

  return { success: true }
}

// ============================================================================
// DRAFT/PUBLISH WORKFLOW ACTIONS
// ============================================================================

/**
 * Save current blocks as draft (doesn't affect live store)
 */
export async function saveAsDraft(
  tenantId: string,
  storeSlug: string,
  data: {
    templateId?: TemplateId | null
    blocks: StoreBlock[]
  }
): Promise<ActionResult<{ layoutId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const hasAccess = await verifyTenantAccess(user.id, tenantId)
  if (!hasAccess) {
    return { success: false, error: "You don't have access to this store" }
  }

  if (!Array.isArray(data.blocks) || data.blocks.length === 0) {
    return { success: false, error: "Invalid layout: blocks are required" }
  }

  const result = await saveDraft(tenantId, data.blocks, {
    templateId: data.templateId,
  })

  if (!result.success) {
    return { success: false, error: result.error || "Failed to save draft" }
  }

  // Only revalidate editor page (draft doesn't affect live store)
  revalidatePath("/storefront")

  return { success: true, data: { layoutId: result.layoutId! } }
}

/**
 * Publish draft changes to live store
 */
export async function publishChanges(
  tenantId: string,
  storeSlug: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const hasAccess = await verifyTenantAccess(user.id, tenantId)
  if (!hasAccess) {
    return { success: false, error: "You don't have access to this store" }
  }

  const result = await publishLayout(tenantId)

  if (!result.success) {
    return { success: false, error: result.error || "Failed to publish" }
  }

  // Revalidate both editor and live store
  revalidatePath("/storefront")
  revalidatePath(`/store/${storeSlug}`)

  return { success: true }
}

/**
 * Discard draft and revert to published version
 */
export async function discardChanges(
  tenantId: string,
  storeSlug: string
): Promise<ActionResult<{ blocks: StoreBlock[] }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const hasAccess = await verifyTenantAccess(user.id, tenantId)
  if (!hasAccess) {
    return { success: false, error: "You don't have access to this store" }
  }

  const result = await discardDraft(tenantId)

  if (!result.success) {
    return { success: false, error: result.error || "Failed to discard draft" }
  }

  revalidatePath("/storefront")

  return { success: true, data: { blocks: result.blocks || [] } }
}

/**
 * Get draft preview URL with secret token
 * This allows authenticated users to preview draft content
 */
export async function getDraftPreviewUrl(
  tenantId: string,
  storeSlug: string
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const hasAccess = await verifyTenantAccess(user.id, tenantId)
  if (!hasAccess) {
    return { success: false, error: "You don't have access to this store" }
  }

  const secret = process.env.DRAFT_MODE_SECRET
  if (!secret) {
    return { success: false, error: "Draft mode not configured" }
  }

  const url = `/api/draft?secret=${encodeURIComponent(secret)}&slug=${encodeURIComponent(storeSlug)}&redirect=/store/${encodeURIComponent(storeSlug)}`
  
  return { success: true, data: { url } }
}
