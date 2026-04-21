import EditorClient from "@/features/editor/editor-client";
import type { EditorProps } from "@/features/editor/core/types";
import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

async function getOrCreateProject(projectId: string, tenantId: string) {
  const [existing] = await db.select().from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)))
    .limit(1);
  if (existing) return existing;

  const now = new Date();
  const [created] = await db.insert(editorProjects)
    .values({ id: projectId, tenantId, name: "Untitled Page", data: [], createdAt: now, updatedAt: now })
    .returning()
    .catch((e) => { console.error("[editor] create project failed:", e); return [null]; });
  return created;
}

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;

  if (!params.project) {
    // Find most recent project for this tenant, or create a new one
    const [latest] = await db.select({ id: editorProjects.id }).from(editorProjects)
      .where(eq(editorProjects.tenantId, user.tenantId))
      .orderBy(desc(editorProjects.updatedAt))
      .limit(1);
    redirect(`/editor?project=${latest?.id ?? crypto.randomUUID()}`);
  }

  const project = await getOrCreateProject(params.project, user.tenantId);
  if (!project) redirect('/dashboard/pages');

  const content = Array.isArray(project.data) && (project.data as unknown[]).length > 0
    ? JSON.stringify(project.data)
    : null;

  const props: EditorProps = {
    pageId: project.id,
    pageName: project.name,
    tenantId: user.tenantId,
    
    userId: user.id,
    initialContent: content,
  };

  return <EditorClient {...props} />;
}
