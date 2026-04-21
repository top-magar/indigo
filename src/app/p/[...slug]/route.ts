import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { editorPages } from "@/db/schema/editor-pages";
import { eq, and, asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const segments = (await params).slug;
  const projectSlug = segments[0];
  const pageSlug = segments[1];

  const [project] = await db.select({ id: editorProjects.id })
    .from(editorProjects)
    .where(and(eq(editorProjects.slug, projectSlug), eq(editorProjects.published, true)))
    .limit(1);

  if (!project) return new NextResponse("Site not found", { status: 404 });

  const pages = await db.select({
    id: editorPages.id, slug: editorPages.slug,
    isHomepage: editorPages.isHomepage, publishedHtml: editorPages.publishedHtml,
  }).from(editorPages)
    .where(and(eq(editorPages.projectId, project.id), eq(editorPages.published, true)))
    .orderBy(asc(editorPages.order));

  const page = pageSlug
    ? pages.find(p => p.slug === pageSlug)
    : pages.find(p => p.isHomepage) || pages[0];

  if (!page?.publishedHtml) return new NextResponse("Page not found", { status: 404 });

  // Increment views (fire-and-forget)
  db.update(editorPages).set({ views: sql`COALESCE(${editorPages.views}, 0) + 1` })
    .where(eq(editorPages.id, page.id)).then(() => {}).catch(() => {});

  return new NextResponse(page.publishedHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'self'; script-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src * data:; frame-src https://maps.google.com https://www.youtube.com",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
