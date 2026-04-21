import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [page] = await db.select().from(editorProjects)
    .where(and(eq(editorProjects.slug, slug), eq(editorProjects.published, true)))
    .limit(1);

  if (!page?.publishedHtml) {
    return new NextResponse("Page not found", { status: 404 });
  }

  return new NextResponse(page.publishedHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'self'; script-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src * data:; frame-src https://maps.google.com https://www.youtube.com",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
