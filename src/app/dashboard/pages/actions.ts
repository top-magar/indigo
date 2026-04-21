"use server";

import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deletePage(id: string) {
  const user = await requireUser();
  await db.delete(editorProjects)
    .where(and(eq(editorProjects.id, id), eq(editorProjects.tenantId, user.tenantId)));
  revalidatePath("/dashboard/pages");
}
