import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { VisualEditor } from "./visual-editor"
import { getLayoutForEditing } from "@/lib/store/layout-service"
import { createDefaultHomepageLayout } from "@/lib/store/default-layout"

export default async function StorefrontEditorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

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
  const { layout: existingLayout, templateId, layoutStatus } = await getLayoutForEditing(
    tenantData.id,
    tenantData.slug
  )

  // Use existing layout blocks or default
  const blocks =
    existingLayout?.blocks ?? createDefaultHomepageLayout(tenantData.slug).blocks

  return (
    <VisualEditor
      tenantId={tenantData.id}
      storeSlug={tenantData.slug}
      storeName={tenantData.name}
      initialBlocks={blocks}
      initialTemplateId={templateId ?? undefined}
      initialLayoutStatus={layoutStatus ?? undefined}
    />
  )
}
