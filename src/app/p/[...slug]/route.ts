import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Legacy /p/[slug] route — redirects to /store/[slug] for backward compatibility.
 * Editor pages now serve through /store/[slug]/[pageSlug] via the catchAll route.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const segments = (await params).slug;
  const projectSlug = segments[0];
  const pageSlug = segments[1];

  // Find the tenant slug for this project
  const [project] = await db.select({ id: editorProjects.id, tenantId: editorProjects.tenantId })
    .from(editorProjects)
    .where(and(eq(editorProjects.slug, projectSlug), eq(editorProjects.published, true)))
    .limit(1);

  if (!project) return new NextResponse("Site not found", { status: 404 });

  // Look up tenant slug
  const { tenants } = await import("@/db/schema/tenants");
  const [tenant] = await db.select({ slug: tenants.slug })
    .from(tenants).where(eq(tenants.id, project.tenantId)).limit(1);

  if (!tenant) return new NextResponse("Site not found", { status: 404 });

  const destination = pageSlug
    ? `/store/${tenant.slug}/${pageSlug}`
    : `/store/${tenant.slug}`;

  return NextResponse.redirect(new URL(destination, _req.url), 301);
}
