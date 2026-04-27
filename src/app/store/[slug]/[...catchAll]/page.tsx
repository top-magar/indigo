import { createClient } from "@/infrastructure/supabase/server"
import { db } from "@/infrastructure/db"
import { editorProjects } from "@/db/schema/editor-projects"
import { editorPages } from "@/db/schema/editor-pages"
import { tenants } from "@/db/schema/tenants"
import { eq, and, sql } from "drizzle-orm"
import { redirect, notFound } from "next/navigation"
import DOMPurify from "isomorphic-dompurify"

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug: string; catchAll: string[] }>
}) {
  const { slug, catchAll } = await params
  const pageSlug = catchAll[0]
  const path = "/" + catchAll.join("/")

  // Resolve tenant
  const [tenant] = await db.select({ id: tenants.id })
    .from(tenants).where(eq(tenants.slug, slug)).limit(1)
  if (!tenant) notFound()

  // Try to resolve as an editor page
  const [project] = await db.select({ id: editorProjects.id })
    .from(editorProjects)
    .where(and(eq(editorProjects.tenantId, tenant.id), eq(editorProjects.published, true)))
    .limit(1)

  if (project) {
    const [page] = await db.select({
      id: editorPages.id,
      publishedHtml: editorPages.publishedHtml,
    }).from(editorPages)
      .where(and(
        eq(editorPages.projectId, project.id),
        eq(editorPages.slug, pageSlug),
        eq(editorPages.published, true),
      ))
      .limit(1)

    if (page?.publishedHtml) {
      // Increment views (fire-and-forget)
      db.update(editorPages)
        .set({ views: sql`COALESCE(${editorPages.views}, 0) + 1` })
        .where(eq(editorPages.id, page.id))
        .then(() => {}).catch(() => {})

      // Extract body content — render inside store layout, not raw <html>
      const bodyMatch = page.publishedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      const bodyContent = DOMPurify.sanitize(bodyMatch ? bodyMatch[1] : page.publishedHtml, { ADD_TAGS: ['style'], ADD_ATTR: ['target'] })
      const headMatch = page.publishedHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
      const styles = headMatch ? headMatch[1].match(/<style[^>]*>[\s\S]*?<\/style>/gi) : null
      const headStyles = styles ? styles.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n') : null

      return (
        <>
          {headStyles && <style dangerouslySetInnerHTML={{ __html: headStyles }} />}
          <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
        </>
      )
    }
  }

  // Check for redirects
  const supabase = await createClient()
  const { data: layout } = await supabase
    .from("store_layouts")
    .select("theme_overrides")
    .eq("tenant_id", tenant.id)
    .eq("is_homepage", true)
    .maybeSingle()

  const redirects = (layout?.theme_overrides as Record<string, unknown>)
    ?.redirects as string | undefined

  if (redirects) {
    for (const line of redirects.split("\n")) {
      const parts = line.split("->").map((s) => s.trim())
      if (parts[0] === path && parts[1]) {
        redirect(`/store/${slug}${parts[1]}`)
      }
    }
  }

  notFound()
}
