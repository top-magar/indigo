"use server";

import { db } from "@/infrastructure/db";
import { editorPages } from "@/db/schema/editor-pages";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function renamePage(id: string, name: string) {
  const user = await requireUser();
  const [page] = await db.select({ projectId: editorPages.projectId }).from(editorPages).where(eq(editorPages.id, id)).limit(1);
  if (!page) return;
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, page.projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await db.update(editorPages).set({ name, slug, updatedAt: new Date() }).where(eq(editorPages.id, id));
  revalidatePath("/dashboard/pages");
}

export async function deletePage(id: string) {
  const user = await requireUser();
  const [page] = await db.select({ projectId: editorPages.projectId, isHomepage: editorPages.isHomepage }).from(editorPages).where(eq(editorPages.id, id)).limit(1);
  if (!page) return;
  if (page.isHomepage) return; // Cannot delete homepage
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, page.projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return;
  await db.delete(editorPages).where(eq(editorPages.id, id));
  revalidatePath("/dashboard/pages");
}

export async function createPage(projectId: string): Promise<{ id?: string; error?: string }> {
  const user = await requireUser();
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return { error: "Project not found" };

  const name = "Untitled Page";
  const slug = `untitled-${Date.now().toString(36)}`;
  const [page] = await db.insert(editorPages).values({
    projectId, tenantId: user.tenantId, name, slug, data: [], isHomepage: false,
  }).returning({ id: editorPages.id });

  revalidatePath("/dashboard/pages");
  return { id: page.id };
}
