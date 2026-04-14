// Store Layout Service — Read-only layout fetching for storefront rendering
//
// Write operations (save draft, publish, discard) are in features/editor/actions.ts
import { db } from "@/infrastructure/db"
import { sql } from "drizzle-orm"
import { createDefaultHomepageLayout } from "./default-layout"
import type { PageLayout, StoreBlock } from "@/types/blocks"
import { createLogger } from "@/lib/logger"
const log = createLogger("features:store-layout")

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
  try {
    const rows = await db.execute(
      sql`SELECT * FROM store_layouts WHERE tenant_id = ${tenantId} AND is_homepage = true LIMIT 1`
    )
    const data = rows[0] as unknown as StoreLayoutRow | undefined

    if (data?.blocks && Array.isArray(data.blocks) && data.blocks.length > 0) {
      return { layout: transformDbToLayout(data), isDefault: false }
    }
  } catch (error) {
    log.error("Error fetching layout:", error)
  }

  return { layout: createDefaultHomepageLayout(storeSlug), isDefault: true }
}

/**
 * Fetch draft layout for preview (Draft Mode).
 */
export async function getDraftLayout(
  tenantId: string,
  storeSlug: string
): Promise<{ layout: PageLayout; isDefault: boolean } | null> {
  try {
    const rows = await db.execute(
      sql`SELECT * FROM store_layouts WHERE tenant_id = ${tenantId} AND is_homepage = true LIMIT 1`
    )
    const data = rows[0] as unknown as StoreLayoutRow | undefined

    if (!data) {
      return { layout: createDefaultHomepageLayout(storeSlug), isDefault: true }
    }

    const blocksToUse = data.draft_blocks && data.draft_blocks.length > 0
      ? data.draft_blocks
      : data.blocks

    if (blocksToUse && Array.isArray(blocksToUse) && blocksToUse.length > 0) {
      return { layout: { ...transformDbToLayout(data), blocks: blocksToUse }, isDefault: false }
    }

    return { layout: createDefaultHomepageLayout(storeSlug), isDefault: true }
  } catch (error) {
    log.error("Error fetching draft layout:", error)
    return null
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
