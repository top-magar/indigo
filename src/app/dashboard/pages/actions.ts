"use server";

import { db } from "@/infrastructure/db";
import { editorPages } from "@/db/schema/editor-pages";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, and, count } from "drizzle-orm";
import { requireTenantUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function renamePage(id: string, name: string): Promise<{ success: boolean; error?: string }> {
  try {
  const user = await requireTenantUser();
  const [page] = await db.select({ projectId: editorPages.projectId }).from(editorPages).where(eq(editorPages.id, id)).limit(1);
  if (!page) return { success: false, error: "Page not found" };
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, page.projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return { success: false, error: "Not authorized" };
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await db.update(editorPages).set({ name, slug, updatedAt: new Date() }).where(eq(editorPages.id, id));
  revalidatePath("/dashboard/pages");
  return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to rename page" };
  }
}

export async function deletePage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
  const user = await requireTenantUser();
  const [page] = await db.select({ projectId: editorPages.projectId, isHomepage: editorPages.isHomepage }).from(editorPages).where(eq(editorPages.id, id)).limit(1);
  if (!page) return { success: false, error: "Page not found" };
  if (page.isHomepage) return { success: false, error: "Cannot delete homepage" };
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, page.projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return { success: false, error: "Not authorized" };
  await db.delete(editorPages).where(eq(editorPages.id, id));
  revalidatePath("/dashboard/pages");
  return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete page" };
  }
}

export async function createPage(projectId: string, pageName?: string): Promise<{ success?: boolean; id?: string; error?: string }> {
  try {
  const user = await requireTenantUser();
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return { success: false, error: "Project not found" };

  // Page limit: Free = 2, Growth = 10, Pro = unlimited
  const { getTenantPlanLimits } = await import("@/lib/plan-limits");
  const limits = await getTenantPlanLimits(user.tenantId);
  const maxPages = limits.planName === "Free" ? 2 : limits.planName === "Growth" ? 10 : 999;
  const [{ value: pageCount }] = await db.select({ value: count() }).from(editorPages).where(eq(editorPages.projectId, projectId));
  if (pageCount >= maxPages) {
    return { success: false, error: `Page limit reached (${maxPages}). Upgrade your plan to create more pages.` };
  }

  const name = pageName?.trim() || "Untitled Page";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `page-${Date.now().toString(36)}`;
  const [page] = await db.insert(editorPages).values({
    projectId, tenantId: user.tenantId, name, slug, data: [], isHomepage: false,
  }).returning({ id: editorPages.id });

  revalidatePath("/dashboard/pages");
  return { id: page.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create page" };
  }
}
