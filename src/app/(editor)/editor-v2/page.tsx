import { requireUser } from "@/lib/auth"
import { createClient } from "@/infrastructure/supabase/server"
import { EditorLoader } from "@/features/editor-v2/components/shell/editor-loader"

export default async function EditorV2Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireUser()
  const { page: pageId } = await searchParams
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, slug")
    .eq("id", user.tenantId)
    .single()

  if (!tenant) return <div className="flex h-screen items-center justify-center">Tenant not found</div>

  let layoutQuery = supabase
    .from("store_layouts")
    .select("id, draft_blocks, theme_overrides, page_name")
    .eq("tenant_id", tenant.id)

  if (pageId) {
    layoutQuery = layoutQuery.eq("id", pageId)
  } else {
    layoutQuery = layoutQuery.eq("is_homepage", true)
  }

  const { data: layout } = await layoutQuery.maybeSingle()

  // Parse sections from draft_blocks
  let sections: unknown[] = []
  const source = layout?.draft_blocks
  if (Array.isArray(source) && source.length > 0) {
    const block = source[0] as Record<string, unknown>
    if (block._v2 && Array.isArray(block.sections)) {
      sections = block.sections
    }
  }

  const themeOverrides = (layout?.theme_overrides as Record<string, unknown>) ?? {}

  return (
    <EditorLoader
      tenantId={tenant.id}
      pageId={layout?.id ?? ""}
      initialSections={sections as { id: string; type: string; props: Record<string, unknown> }[]}
      initialTheme={themeOverrides}
      pageName={(layout as Record<string, unknown>)?.page_name as string ?? "Homepage"}
    />
  )
}
