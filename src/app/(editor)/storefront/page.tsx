import { requireUser } from "@/lib/auth"
import { createClient } from "@/infrastructure/supabase/server"
import { EditorShell } from "@/features/editor/components/editor-shell"
import { isEditorV2 } from "@/features/editor-v2/feature-flag"
import { EditorShellV2 } from "@/features/editor-v2"

export default async function StorefrontEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const user = await requireUser()
  const { page: pageId } = await searchParams
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("id", user.tenantId)
    .single()

  if (!tenant) {
    return <div className="flex h-screen items-center justify-center">Tenant not found</div>
  }

  // Fetch specific page or homepage
  let layoutQuery = supabase
    .from("store_layouts")
    .select("id, draft_blocks, blocks, theme_overrides")
    .eq("tenant_id", tenant.id)

  if (pageId) {
    layoutQuery = layoutQuery.eq("id", pageId)
  } else {
    layoutQuery = layoutQuery.eq("is_homepage", true)
  }

  const { data: layout } = await layoutQuery.maybeSingle()

  // Extract Craft.js JSON from stored data
  let craftJson: string | null = null
  const source = layout?.draft_blocks ?? layout?.blocks
  if (Array.isArray(source) && source.length > 0 && source[0]?._craftjs) {
    craftJson = source[0].json
  }

  const themeOverrides = (layout?.theme_overrides as Record<string, unknown>) ?? {}
  const seo = (themeOverrides?.seo as { title?: string; description?: string; ogImage?: string }) ?? {}

  if (isEditorV2()) {
    return <EditorShellV2 theme={themeOverrides} />
  }

  return (
    <EditorShell
      craftJson={craftJson}
      tenantId={tenant.id}
      storeSlug={tenant.slug}
      themeOverrides={themeOverrides}
      seoInitial={{ title: seo.title ?? "", description: seo.description ?? "", ogImage: seo.ogImage ?? "" }}
      pageId={layout?.id ?? null}
    />
  )
}
