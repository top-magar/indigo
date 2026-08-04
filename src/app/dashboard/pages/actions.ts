"use server";

import { db } from "@/infrastructure/db";
import { editorPages } from "@/db/schema/editor-pages";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, and, count } from "drizzle-orm";
import { requireTenantUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function renamePage(id: string, name: string): Promise<{ success?: boolean; error?: string }> {
  const user = await requireTenantUser();
  const [page] = await db.select({ projectId: editorPages.projectId, slug: editorPages.slug }).from(editorPages).where(eq(editorPages.id, id)).limit(1);
  if (!page) return { success: false, error: "Page not found" };
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, page.projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return { success: false, error: "Project not found or access denied" };
  if (page.slug === "template-product") return { success: false, error: "Cannot rename reserved templates" };
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await db.update(editorPages).set({ name, slug, updatedAt: new Date() }).where(eq(editorPages.id, id));
  revalidatePath("/dashboard/pages");
  return { success: true };
}

export async function deletePage(id: string): Promise<{ success?: boolean; error?: string }> {
  const user = await requireTenantUser();
  const [page] = await db.select({ projectId: editorPages.projectId, isHomepage: editorPages.isHomepage, slug: editorPages.slug }).from(editorPages).where(eq(editorPages.id, id)).limit(1);
  if (!page) return { success: false, error: "Page not found" };
  if (page.isHomepage || page.slug === "template-product") return { success: false, error: "Cannot delete homepage or reserved templates" };
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, page.projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return { success: false, error: "Project not found or access denied" };
  await db.delete(editorPages).where(eq(editorPages.id, id));
  revalidatePath("/dashboard/pages");
  return { success: true };
}

export async function createPage(projectId: string, pageName?: string): Promise<{ success?: boolean; id?: string; error?: string }> {
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
}

export async function createProductTemplate(projectId: string): Promise<{ success?: boolean; id?: string; error?: string }> {
  const user = await requireTenantUser();
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return { success: false, error: "Project not found" };

  // Check if it already exists
  const [existing] = await db.select({ id: editorPages.id }).from(editorPages)
    .where(and(eq(editorPages.projectId, projectId), eq(editorPages.slug, "template-product"))).limit(1);
  
  if (existing) {
    return { id: existing.id };
  }

  // Create default product template
  const defaultData = [
    {
      id: "product-template-container",
      type: "__body",
      name: "Product Page Layout",
      styles: { padding: "40px 20px", display: "flex", flexDirection: "column", gap: "40px" },
      content: [
        {
          id: "product-name",
          type: "heading",
          name: "Product Name",
          styles: { fontSize: "36px", fontWeight: "700" },
          binding: { source: "product", field: "name" },
        },
        {
          id: "product-price",
          type: "text",
          name: "Product Price",
          styles: { fontSize: "24px", fontWeight: "600", color: "var(--foreground)" },
          binding: { source: "product", field: "price" },
        }
      ]
    }
  ];

  const [page] = await db.insert(editorPages).values({
    projectId, tenantId: user.tenantId, name: "Product Template", slug: "template-product", data: defaultData, isHomepage: false,
  }).returning({ id: editorPages.id });

  revalidatePath("/dashboard/pages");
  return { id: page.id };
}

export async function createCollectionTemplate(projectId: string): Promise<{ success?: boolean; id?: string; error?: string }> {
  const user = await requireTenantUser();
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, user.tenantId))).limit(1);
  if (!project) return { success: false, error: "Project not found" };

  // Check if it already exists
  const [existing] = await db.select({ id: editorPages.id }).from(editorPages)
    .where(and(eq(editorPages.projectId, projectId), eq(editorPages.slug, "template-collection"))).limit(1);
  
  if (existing) {
    return { id: existing.id };
  }

  // Create default collection template
  const defaultData = [
    {
      id: "collection-template-container",
      type: "__body",
      name: "Collection Page Layout",
      styles: { padding: "40px 20px", display: "flex", flexDirection: "column", gap: "40px" },
      content: [
        {
          id: "collection-name",
          type: "heading",
          name: "Collection Name",
          styles: { fontSize: "36px", fontWeight: "700" },
          binding: { source: "collection", field: "name" },
        },
        {
          id: "collection-description",
          type: "text",
          name: "Collection Description",
          styles: { fontSize: "16px", color: "var(--muted-foreground)" },
          binding: { source: "collection", field: "description" },
        },
        {
          id: "collection-products",
          type: "productGrid",
          name: "Collection Products",
          styles: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" },
          repeat: { source: "collection", limit: 12 },
        }
      ]
    }
  ];

  const [page] = await db.insert(editorPages).values({
    projectId, tenantId: user.tenantId, name: "Collection Template", slug: "template-collection", data: defaultData, isHomepage: false,
  }).returning({ id: editorPages.id });

  revalidatePath("/dashboard/pages");
  return { id: page.id };
}
