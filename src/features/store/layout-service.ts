// Store Layout Service — Read-only layout fetching for storefront rendering
//
// Write operations (save draft, publish, discard) are in features/editor/actions.ts
import { createClient } from "@/infrastructure/supabase/server"
import { createDefaultHomepageLayout } from "./default-layout"
import type { PageLayout, StoreBlock } from "@/types/blocks"
import { createLogger } from "@/lib/logger";
const log = createLogger("features:store-layout");

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
 * Fetch the homepage layout for a tenant (public storefront).
 * Only returns published content.
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
    log.error("Error fetching layout:", error)
  }

  if (data?.blocks && Array.isArray(data.blocks) && data.blocks.length > 0) {
    return {
      layout: transformDbToLayout(data as StoreLayoutRow),
      isDefault: false,
    }
  }

  return {
    layout: createDefaultHomepageLayout(storeSlug),
    isDefault: true,
  }
}

/**
 * Fetch draft layout for preview (Draft Mode).
 * Returns draft_blocks if available, otherwise falls back to published blocks.
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
    log.error("Error fetching draft layout:", error)
    return null
  }

  if (!data) {
    return {
      layout: createDefaultHomepageLayout(storeSlug),
      isDefault: true,
    }
  }

  const row = data as StoreLayoutRow
  const blocksToUse = row.draft_blocks && row.draft_blocks.length > 0
    ? row.draft_blocks
    : row.blocks

  if (blocksToUse && Array.isArray(blocksToUse) && blocksToUse.length > 0) {
    return {
      layout: { ...transformDbToLayout(row), blocks: blocksToUse },
      isDefault: false,
    }
  }

  return {
    layout: createDefaultHomepageLayout(storeSlug),
    isDefault: true,
  }
}

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
