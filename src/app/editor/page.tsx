import EditorClient from "@/features/editor/editor-client";
import type { EditorProps } from "@/features/editor/core/types";
import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { editorPages } from "@/db/schema/editor-pages";
import { eq, and, asc, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

/** Ensure project has at least one page. Migrates old project.data if needed. */
async function ensurePages(projectId: string) {
  const existing = await db.select({ id: editorPages.id }).from(editorPages)
    .where(eq(editorPages.projectId, projectId)).limit(1);
  if (existing.length > 0) return;

  // Check if project has data to migrate
  const [project] = await db.select({ data: editorProjects.data, name: editorProjects.name })
    .from(editorProjects).where(eq(editorProjects.id, projectId)).limit(1);
  if (!project) return;

  const hasData = Array.isArray(project.data) && (project.data as unknown[]).length > 0;
  const now = new Date();

  await db.insert(editorPages).values({
    projectId,
    name: "Home",
    slug: "home",
    order: 0,
    data: hasData ? project.data : [],
    isHomepage: true,
    createdAt: now,
    updatedAt: now,
  });
}

async function getOrCreateProject(projectId: string, tenantId: string) {
  const [existing] = await db.select().from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)))
    .limit(1);
  if (existing) return existing;

  const now = new Date();
  const [created] = await db.insert(editorProjects)
    .values({ id: projectId, tenantId, name: "My Site", data: [], createdAt: now, updatedAt: now })
    .returning()
    .catch((e) => { console.error("[editor] create project failed:", e); return [null]; });
  return created;
}

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ project?: string; page?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;

  if (!params.project) {
    const [latest] = await db.select({ id: editorProjects.id }).from(editorProjects)
      .where(eq(editorProjects.tenantId, user.tenantId))
      .orderBy(desc(editorProjects.updatedAt))
      .limit(1);
    redirect(`/editor?project=${latest?.id ?? crypto.randomUUID()}`);
  }

  const project = await getOrCreateProject(params.project, user.tenantId);
  if (!project) redirect('/dashboard/pages');

  // Ensure project has pages (migrates old data if needed)
  await ensurePages(project.id);

  // Load the requested page, or the homepage
  const pages = await db.select().from(editorPages)
    .where(eq(editorPages.projectId, project.id))
    .orderBy(asc(editorPages.order));

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
