import { db } from "@/infrastructure/db";
import { tenantDomains } from "@/db/schema/domains";
import { tenants } from "@/db/schema/tenants";
import { editorProjects } from "@/db/schema/editor-projects";
import { editorPages } from "@/db/schema/editor-pages";
import { eq, and, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

export default async function CustomDomainPage({ searchParams }: { searchParams: Promise<{ domain?: string; path?: string }> }) {
  const params = await searchParams;
  if (!params.domain) notFound();

  // Resolve domain → tenant
  const [domainRecord] = await db.select({ tenantId: tenantDomains.tenantId, status: tenantDomains.status })
    .from(tenantDomains)
    .where(eq(tenantDomains.domain, params.domain))
    .limit(1);

  if (!domainRecord || domainRecord.status !== "active") notFound();

  // Find published editor project
  const [project] = await db.select({ id: editorProjects.id })
    .from(editorProjects)
    .where(and(eq(editorProjects.tenantId, domainRecord.tenantId), eq(editorProjects.published, true)))
    .limit(1);

  if (project) {
    // Load published pages
    const pages = await db.select({
      slug: editorPages.slug, isHomepage: editorPages.isHomepage, publishedHtml: editorPages.publishedHtml,
    }).from(editorPages)
      .where(and(eq(editorPages.projectId, project.id), eq(editorPages.published, true)))
      .orderBy(asc(editorPages.order));

    // Match path to page slug
    const path = (params.path || "").replace(/^\//, "");
    const page = path
      ? pages.find(p => p.slug === path)
      : pages.find(p => p.isHomepage) || pages[0];

    if (page?.publishedHtml) {
      // Redirect to store route so the page renders inside the store shell
      // with proper header/footer/cart instead of raw HTML
      const [tenant] = await db.select({ slug: tenants.slug })
        .from(tenants).where(eq(tenants.id, domainRecord.tenantId)).limit(1);
      if (tenant) {
        const storePath = page.isHomepage ? `/store/${tenant.slug}` : `/store/${tenant.slug}/${page.slug}`;
        redirect(storePath);
      }
    }
  }

  // Fallback to store page
  const [tenant] = await db.select({ slug: tenants.slug })
    .from(tenants).where(eq(tenants.id, domainRecord.tenantId)).limit(1);

  if (!tenant) notFound();
  redirect(`/store/${tenant.slug}${params.path || ""}`);
}
