import { createClient } from "@/infrastructure/supabase/server"
import { redirect } from "next/navigation"
import { BlockBuilder } from "@/features/block-builder"
import { getLayoutForEditing } from "@/features/store/layout-service"
import { createDefaultHomepageLayout } from "@/features/store/default-layout"
import type { BlockBuilderDocument } from "@/features/block-builder/types"

export default async function StorefrontEditorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Get tenant via users table
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id, tenants(id, slug, name)")
    .eq("id", user.id)
    .single()

  const tenantData =
    userData?.tenants && !Array.isArray(userData.tenants)
      ? (userData.tenants as { id: string; slug: string; name: string })
      : null

  if (!tenantData) redirect("/dashboard")

  // Fetch existing layout with status
  const { layout: existingLayout, layoutStatus } = await getLayoutForEditing(
    tenantData.id,
    tenantData.slug
  )

  // Convert existing blocks to block builder format or create default
  const blocks = existingLayout?.blocks ?? createDefaultHomepageLayout(tenantData.slug).blocks
  
  const builderDocument: BlockBuilderDocument = {
    version: "1.0",
    time: Date.now(),
    blocks: blocks.map((block, index) => ({
      id: block.id,
      type: block.type,
      variant: block.variant,
      data: block.settings || {},
      order: index,
      visible: block.visible,
    })),
    metadata: {
      storeId: tenantData.slug,
      tenantId: tenantData.id,
      status: layoutStatus?.status === "published" ? "published" : "draft",
      lastPublishedAt: layoutStatus?.lastPublishedAt || undefined,
    }
  }

  return (
    <BlockBuilder
      tenantId={tenantData.id}
      storeSlug={tenantData.slug}
      storeName={tenantData.name}
      initialDocument={builderDocument}
    />
  )
}
