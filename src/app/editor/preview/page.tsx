import { notFound } from "next/navigation"
import { getEditorCollectionProducts, getEditorProducts } from "@/features/editor/lib/queries"
import { loadEditorSession } from "@/features/editor/lib/session-actions"
import { StorefrontRenderer } from "@/features/editor/renderer/storefront-renderer"

export default async function EditorPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; page?: string }>
}) {
  const params = await searchParams
  if (!params.project) notFound()
  const [session, products, collectionRows] = await Promise.all([
    loadEditorSession({ projectId: params.project, pageId: params.page }),
    getEditorProducts({ limit: 50 }),
    getEditorCollectionProducts(),
  ])
  if (!session.ok) notFound()
  const collections = collectionRows.reduce<Record<string, string[]>>((result, item) => {
    ;(result[item.collectionId] ??= []).push(item.productId)
    return result
  }, {})

  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 flex h-10 items-center justify-between border-b bg-background/95 px-4 text-xs backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <span className="font-medium">Previewing {session.page.name}</span>
        <span className="text-muted-foreground">Draft revision {session.page.serverRevision}</span>
      </div>
      <StorefrontRenderer
        document={session.page.document}
        context={{
          store: { name: session.project.name, slug: session.project.slug || "preview" },
          currency: session.page.document.settings.currency,
          products,
          collections,
          navigation: session.pages.filter((page) => page.visible).map((page) => ({
            id: page.id,
            label: page.name,
            href: page.isHomepage ? "#" : `#page:${page.slug}`,
          })),
        }}
        mode="preview"
      />
    </main>
  )
}
