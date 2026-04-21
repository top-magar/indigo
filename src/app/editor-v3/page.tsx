import dynamic from "next/dynamic";
import type { EditorProps } from "@/features/editor/core/types";
import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const FunnelEditor = dynamic(() => import("@/features/editor/editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen text-sm text-gray-400">
      Loading editor...
    </div>
  ),
});

async function getOrCreateProject(projectId: string) {
  const existing = await db.select().from(editorProjects).where(eq(editorProjects.id, projectId)).limit(1);
  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(editorProjects)
    .values({ id: projectId, tenantId: "default", name: "Untitled Page", data: [] })
    .returning();
  return created;
}

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const params = await searchParams;

  // No project ID — create one and redirect
  if (!params.project) {
    const id = crypto.randomUUID();
    redirect(`/editor-v3?project=${id}`);
  }

  const project = await getOrCreateProject(params.project);

  const content = Array.isArray(project.data) && (project.data as unknown[]).length > 0
    ? JSON.stringify(project.data)
    : null;

  const props: EditorProps = {
    pageId: project.id,
    pageName: project.name,
    funnelId: project.tenantId,
    subAccountId: "default",
    agencyId: "default",
    initialContent: content,
  };

  return <FunnelEditor {...props} />;
}
