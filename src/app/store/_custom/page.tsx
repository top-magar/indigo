import { db } from "@/infrastructure/db";
import { tenantDomains } from "@/db/schema/domains";
import { tenants } from "@/db/schema/tenants";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, and, desc } from "drizzle-orm";
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

  // Get tenant slug to redirect to store
  const [tenant] = await db.select({ slug: tenants.slug })
    .from(tenants)
    .where(eq(tenants.id, domainRecord.tenantId))
    .limit(1);

  if (!tenant) notFound();

  // Check for published editor page
  const [editorPage] = await db.select({ publishedHtml: editorProjects.publishedHtml })
    .from(editorProjects)
    .where(and(eq(editorProjects.tenantId, domainRecord.tenantId), eq(editorProjects.published, true)))
    .orderBy(desc(editorProjects.updatedAt))
    .limit(1);

  if (editorPage?.publishedHtml) {
    return (
      <html>
        <body dangerouslySetInnerHTML={{ __html: editorPage.publishedHtml }} />
      </html>
    );
  }

  // Fallback to store page
  redirect(`/store/${tenant.slug}${params.path || ""}`);
}
