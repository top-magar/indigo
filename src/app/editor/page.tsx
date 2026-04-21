import EditorClient from "@/features/editor/editor-client";
import type { EditorProps } from "@/features/editor/core/types";
import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { editorPages } from "@/db/schema/editor-pages";
import { eq, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ensureTenantSite } from "@/features/editor/lib/site";

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ project?: string; page?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;

  // Ensure tenant has a site, get its ID
  const siteId = params.project || await ensureTenantSite();
  if (!params.project) redirect(`/editor?project=${siteId}`);

  // Load project
  const [project] = await db.select().from(editorProjects)
    .where(eq(editorProjects.id, siteId)).limit(1);
  if (!project || project.tenantId !== user.tenantId) redirect('/dashboard/pages');

  // Load pages
  const pages = await db.select().from(editorPages)
    .where(eq(editorPages.projectId, siteId))
    .orderBy(asc(editorPages.order));

  // Find active page
  const activePage = params.page
    ? pages.find(p => p.id === params.page)
    : pages.find(p => p.isHomepage) || pages[0];

  const content = activePage && Array.isArray(activePage.data) && (activePage.data as unknown[]).length > 0
    ? JSON.stringify(activePage.data)
    : null;

  const props: EditorProps = {
    pageId: project.id,
    pageName: project.name,
    tenantId: user.tenantId,
    userId: user.id,
    initialContent: content,
    activePageId: activePage?.id ?? null,
    activePageName: activePage?.name ?? "Home",
  };

  return <EditorClient {...props} />;
}
