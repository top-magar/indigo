'use server';

import { authorizedAction, requireTenantUser } from '@/infrastructure/auth';
import { editorProjects } from '@/db/schema/editor-projects';
import { editorPages } from '@/db/schema/editor-pages';
import { editorReusableComponents } from '@/db/schema/editor-reusable-components';
import { pageTemplates } from '@/db/schema/layouts';
import { products } from '@/db/schema/products';
import { collectionProducts, collections } from '@/db/schema/collections';
import { plans, subscriptions } from '@/db/schema/billing';
import { eq, and, asc, desc, sql, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { uniquePageSlug } from '@/features/editor/lib/page-utils';

function safeJsonParse(str: string, fallback: unknown = []): unknown {
  try { return JSON.parse(str); } catch { return fallback; }
}

export async function savePageTemplate(template: {
  name: string;
  content: string;
  userId: string;
}) {
  const user = await requireTenantUser();
  return authorizedAction(async (tx, tenantId) => {
    const [created] = await tx.insert(pageTemplates)
      .values({ tenantId, name: template.name, data: safeJsonParse(template.content), createdAt: new Date() })
      .returning();
    return { ...created, userId: user.id };
  });
}

export async function getPageTemplates() {
  return authorizedAction(async (tx, tenantId) => {
    const all = await tx.select().from(pageTemplates).where(eq(pageTemplates.tenantId, tenantId));
    return all.map(t => ({ id: t.id, name: t.name, content: JSON.stringify(t.data) }));
  });
}

export async function deletePageTemplate(id: string) {
  await authorizedAction(async (tx, tenantId) => {
    await tx.delete(pageTemplates).where(and(eq(pageTemplates.id, id), eq(pageTemplates.tenantId, tenantId)));
  });
}

// ─── Multi-Page CRUD ────────────────────────────────────

export async function getProjectPages(projectId: string) {
  return authorizedAction(async (tx, tenantId) => tx.select().from(editorPages)
    .where(and(eq(editorPages.projectId, projectId), eq(editorPages.tenantId, tenantId)))
    .orderBy(asc(editorPages.order)));
}

export async function updatePage(pageId: string, data: { name?: string; slug?: string; data?: string }) {
  return authorizedAction(async (tx, tenantId) => {
    const [page] = await tx.select({ projectId: editorPages.projectId }).from(editorPages)
      .where(and(eq(editorPages.id, pageId), eq(editorPages.tenantId, tenantId))).limit(1);
    if (!page) return null;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    
    if (data.name) {
      updates.name = data.name;
      if (!data.slug) {
        const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        updates.slug = await uniquePageSlug(page.projectId, tenantId, slugify(data.name), pageId);
      }
    }
    if (data.slug) {
      updates.slug = await uniquePageSlug(page.projectId, tenantId, data.slug, pageId);
    }
    
    if (data.data) updates.data = safeJsonParse(data.data);
    const [updated] = await tx.update(editorPages).set(updates)
      .where(and(eq(editorPages.id, pageId), eq(editorPages.tenantId, tenantId))).returning();
    revalidatePath('/dashboard/pages');
    return updated ?? null;
  });
}

export async function setHomepage(projectId: string, pageId: string) {
  await authorizedAction(async (tx, tenantId) => {
    const owned = and(eq(editorPages.projectId, projectId), eq(editorPages.tenantId, tenantId));
    await tx.update(editorPages).set({ isHomepage: false }).where(owned);
    await tx.update(editorPages).set({ isHomepage: true, slug: '', updatedAt: new Date() })
      .where(and(eq(editorPages.id, pageId), owned));
    revalidatePath('/dashboard/pages');
  });
}

export async function setPageVisibility(pageId: string, visible: boolean) {
  await authorizedAction(async (tx, tenantId) => {
    await tx.update(editorPages).set({ visible, updatedAt: new Date() })
      .where(and(eq(editorPages.id, pageId), eq(editorPages.tenantId, tenantId)));
  });
}

export async function reorderProjectPages(projectId: string, orderedPageIds: string[]) {
  await authorizedAction(async (tx, tenantId) => {
    const ownedPages = await tx.select({ id: editorPages.id }).from(editorPages).where(and(
      eq(editorPages.projectId, projectId),
      eq(editorPages.tenantId, tenantId),
    ));
    const ownedIds = new Set(ownedPages.map((page) => page.id));
    if (orderedPageIds.length !== ownedIds.size || orderedPageIds.some((id) => !ownedIds.has(id))) {
      throw new Error("Invalid page order");
    }
    for (const [order, id] of orderedPageIds.entries()) {
      await tx.update(editorPages).set({ order, updatedAt: new Date() }).where(and(
        eq(editorPages.id, id),
        eq(editorPages.tenantId, tenantId),
      ));
    }
  });
}

// ─── SEO + Navigation ───────────────────────────────────

export async function updatePageSeo(pageId: string, seo: { seoTitle?: string; seoDescription?: string; ogImage?: string }) {
  await authorizedAction(async (tx, tenantId) => {
    await tx.update(editorPages).set({ ...seo, updatedAt: new Date() })
      .where(and(eq(editorPages.id, pageId), eq(editorPages.tenantId, tenantId)));
  });
}

export type NavItem = { id: string; label: string; pageId?: string; href?: string; children?: NavItem[] };

export async function saveNavConfig(projectId: string, navConfig: NavItem[]) {
  await authorizedAction(async (tx, tenantId) => {
    await tx.update(editorProjects).set({ navConfig, updatedAt: new Date() })
      .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)));
  });
}

export async function getNavConfig(projectId: string): Promise<NavItem[]> {
  return authorizedAction(async (tx, tenantId) => {
    const [project] = await tx.select({ navConfig: editorProjects.navConfig }).from(editorProjects)
      .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId))).limit(1);
    return (project?.navConfig as NavItem[] | null) ?? [];
  });
}

// ─── Theme / Design Tokens ──────────────────────────────

import { type ThemeConfig, defaultThemeConfig } from "./theme-utils";

export async function getThemeConfig(projectId: string): Promise<ThemeConfig> {
  return authorizedAction(async (tx, tenantId) => {
    const [project] = await tx.select({ themeConfig: editorProjects.themeConfig }).from(editorProjects)
      .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId))).limit(1);
    return { ...defaultThemeConfig, ...(project?.themeConfig as Partial<ThemeConfig> | null) };
  });
}

export async function saveThemeConfig(projectId: string, theme: Partial<ThemeConfig>) {
  await authorizedAction(async (tx, tenantId) => {
    const [project] = await tx.select({ themeConfig: editorProjects.themeConfig }).from(editorProjects)
      .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId))).limit(1);
    const current = { ...defaultThemeConfig, ...(project?.themeConfig as Partial<ThemeConfig> | null) };
    await tx.update(editorProjects).set({ themeConfig: { ...current, ...theme }, updatedAt: new Date() })
      .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)));
  });
}

// ─── Global Header / Footer ─────────────────────────────

export async function saveHeaderFooter(projectId: string, which: 'header' | 'footer', data: string) {
  await authorizedAction(async (tx, tenantId) => {
    const field = which === 'header' ? { headerData: safeJsonParse(data) } : { footerData: safeJsonParse(data) };
    await tx.update(editorProjects).set({ ...field, updatedAt: new Date() })
      .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)));
  });
}

export async function getHeaderFooter(projectId: string): Promise<{ header: unknown[] | null; footer: unknown[] | null }> {
  return authorizedAction(async (tx, tenantId) => {
    const [project] = await tx.select({ headerData: editorProjects.headerData, footerData: editorProjects.footerData })
      .from(editorProjects).where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId))).limit(1);
    return { header: project?.headerData as unknown[] | null, footer: project?.footerData as unknown[] | null };
  });
}

export async function getProjectVersions(projectId: string) {
  return authorizedAction(async (tx, tenantId) => {
    const { editorProjectVersions } = await import("@/db/schema/editor-project-versions");
    const { desc } = await import("drizzle-orm");
    return tx.select({
      id: editorProjectVersions.id,
      version: editorProjectVersions.version,
      label: editorProjectVersions.label,
      createdAt: editorProjectVersions.createdAt,
    })
      .from(editorProjectVersions)
      .where(and(eq(editorProjectVersions.projectId, projectId), eq(editorProjectVersions.tenantId, tenantId)))
      .orderBy(desc(editorProjectVersions.version));
  });
}

export async function saveComponent(data: { name: string; element: string }) {
  const user = await requireTenantUser();
  return authorizedAction(async (tx, tenantId) => {
    const [created] = await tx.insert(editorReusableComponents)
      .values({ tenantId, name: data.name, data: safeJsonParse(data.element), createdBy: user.id })
      .returning();
    return created;
  });
}

export async function getSavedComponents() {
  return authorizedAction(async (tx, tenantId) => {
    const all = await tx.select().from(editorReusableComponents)
      .where(eq(editorReusableComponents.tenantId, tenantId)).orderBy(desc(editorReusableComponents.updatedAt));
    return all.map(t => ({ id: t.id, name: t.name, element: JSON.stringify(t.data) }));
  });
}

export async function deleteSavedComponent(id: string) {
  await authorizedAction(async (tx, tenantId) => {
    await tx.delete(editorReusableComponents).where(and(eq(editorReusableComponents.id, id), eq(editorReusableComponents.tenantId, tenantId)));
  });
}

// ─── Product Data for Editor Binding ─────────────────────

export async function getEditorProducts(opts?: { collectionId?: string; limit?: number; search?: string }) {
  return authorizedAction(async (tx, tenantId) => {
    const conditions = [eq(products.tenantId, tenantId)];
    if (opts?.search) conditions.push(sql`${products.name} ILIKE ${'%' + opts.search + '%'}`);
    const selection = {
      id: products.id, name: products.name, slug: products.slug,
      price: products.price, compareAtPrice: products.compareAtPrice,
      description: products.description, images: products.images,
    };
    if (opts?.collectionId) {
      return tx.select(selection).from(products)
        .innerJoin(collectionProducts, and(eq(collectionProducts.productId, products.id), eq(collectionProducts.tenantId, tenantId)))
        .where(and(...conditions, eq(collectionProducts.collectionId, opts.collectionId))).limit(opts.limit ?? 50);
    }
    return tx.select(selection).from(products).where(and(...conditions)).limit(opts?.limit ?? 50);
  });
}

export async function getEditorCollections() {
  return authorizedAction(async (tx, tenantId) => tx.select({ id: collections.id, name: collections.name, slug: collections.slug })
    .from(collections).where(eq(collections.tenantId, tenantId)).limit(50));
}

export async function getEditorCollectionProducts() {
  return authorizedAction(async (tx, tenantId) => tx.select({
    collectionId: collectionProducts.collectionId,
    productId: collectionProducts.productId,
  }).from(collectionProducts).where(eq(collectionProducts.tenantId, tenantId)));
}
