import { requireUser } from "@/lib/auth"
import { createClient } from "@/infrastructure/supabase/server"
import { EditorShell } from "@/features/editor/components/editor-shell"
import { PuckEditorLoader } from "@/features/puck-editor/puck-editor-loader"

interface PuckData { content: unknown[]; root: unknown; zones?: unknown }

const editorVersion = process.env.NEXT_PUBLIC_EDITOR_VERSION ?? "craft"

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

  if (editorVersion === "puck") {
    return renderPuckEditor(layout, tenant)
  }

  // ── Craft.js path (unchanged) ──────────────────────────────────
  let craftJson: string | null = null
  const source = layout?.draft_blocks ?? layout?.blocks
  if (Array.isArray(source) && source.length > 0 && source[0]?._craftjs) {
    craftJson = source[0].json
  }

  const themeOverrides = (layout?.theme_overrides as Record<string, unknown>) ?? {}
  const seo = (themeOverrides?.seo as { title?: string; description?: string; ogImage?: string }) ?? {}

  return (
    <EditorShell
      craftJson={craftJson}
      tenantId={tenant.id}
      storeSlug={tenant.slug}
      themeOverrides={themeOverrides}
      seoInitial={{ title: seo.title ?? "", description: seo.description ?? "", ogImage: seo.ogImage ?? "" }}
      pageId={layout?.id ?? null}
      userRole={user.role}
    />
  )
}

// ── Puck editor rendering ────────────────────────────────────────

function renderPuckEditor(
  layout: { id: string; draft_blocks: unknown; blocks: unknown; theme_overrides: unknown } | null,
  tenant: { id: string; name: string; slug: string },
) {
  const source = layout?.draft_blocks ?? layout?.blocks
  let puckData: PuckData | null = null

  if (Array.isArray(source) && source.length > 0) {
    const block = source[0] as { _puck?: boolean; _craftjs?: boolean; json?: string }
    if (block._puck && block.json) {
      puckData = JSON.parse(block.json) as PuckData
    } else if (block._craftjs) {
      // Craft.js data exists but Puck editor is active — start fresh
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">
            This page was built with the previous editor. Starting with a blank Puck canvas.
          </p>
          <PuckEditorLoader tenantId={tenant.id} pageId={layout?.id ?? null} initialData={null} />
        </div>
      )
    }
  }

  return <PuckEditorLoader tenantId={tenant.id} pageId={layout?.id ?? null} initialData={puckData as never} />
}
