"use server";

import { db } from "@/infrastructure/db";
import { editorPages } from "@/db/schema/editor-pages";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deletePage(id: string) {
  const user = await requireUser();
  // Verify ownership via project
  const [page] = await db.select({ projectId: editorPages.projectId }).from(editorPages).where(eq(editorPages.id, id)).limit(1);
  if (!page) return;
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, page.projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return;
  await db.delete(editorPages).where(eq(editorPages.id, id));
  revalidatePath("/dashboard/pages");
}
