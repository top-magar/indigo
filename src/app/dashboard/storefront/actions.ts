"use server";

import { requireTenantUser } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, and } from "drizzle-orm";
import type { ThemeConfig } from "@/features/editor/lib/theme-utils";
import { revalidatePath } from "next/cache";

export async function updateThemeSettings(projectId: string, theme: Partial<ThemeConfig>) {
  const user = await requireTenantUser();
  
  const [project] = await db.select({ themeConfig: editorProjects.themeConfig })
    .from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, user.tenantId)))
    .limit(1);
    
  if (!project) {
    throw new Error("Project not found");
  }

  const currentTheme = (project.themeConfig as Partial<ThemeConfig>) || {};
  const updatedTheme = { ...currentTheme, ...theme };

  await db.update(editorProjects)
    .set({ themeConfig: updatedTheme, updatedAt: new Date() })
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, user.tenantId)));

  revalidatePath("/dashboard/storefront");
  revalidatePath(`/store/[slug]`, "layout"); // Try to invalidate the store layout
  
  return { success: true };
}
