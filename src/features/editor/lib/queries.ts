'use server';

import { db } from '@/infrastructure/db';
import { editorProjects } from '@/db/schema/editor-projects';
import { editorPages } from '@/db/schema/editor-pages';
import { eq, and, asc, desc } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';

async function getTenant() {
  const user = await requireUser();
  return user.tenantId;
}

export async function savePage(page: {
  id?: string;
  name: string;
  content?: string;
  activePageId?: string | null;
}) {
  if (!page.id) return null;
  const tenantId = await getTenant();

  // Verify project ownership
  const [project] = await db.select().from(editorProjects)
    .where(and(eq(editorProjects.id, page.id), eq(editorProjects.tenantId, tenantId)))
    .limit(1);
  if (!project) return null;

  // Save to editor_pages if we have an active page
  if (page.activePageId) {
    const [updated] = await db.update(editorPages)
      .set({ data: page.content ? JSON.parse(page.content) : [], name: page.name, updatedAt: new Date() })
      .where(and(eq(editorPages.id, page.activePageId), eq(editorPages.projectId, page.id)))
      .returning();
    // Also update project timestamp
    await db.update(editorProjects).set({ updatedAt: new Date() })
      .where(eq(editorProjects.id, page.id));
    return updated;
  }

  // Fallback: save to project directly (legacy)
  const [updated] = await db.update(editorProjects)
    .set({ name: page.name, data: page.content ? JSON.parse(page.content) : [], updatedAt: new Date() })
    .where(eq(editorProjects.id, page.id))
    .returning();
  return updated;
}

export async function publishPage(page: {
  id: string;
  name: string;
}) {
  const tenantId = await getTenant();

  const [project] = await db.select().from(editorProjects)
    .where(and(eq(editorProjects.id, page.id), eq(editorProjects.tenantId, tenantId)))
    .limit(1);
  if (!project) return page;

  // Get all pages for this project
  const pages = await db.select().from(editorPages)
    .where(eq(editorPages.projectId, page.id))
    .orderBy(asc(editorPages.order));

  const { generateHTML } = await import('../export/html');
  const projectSlug = project.slug || page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || project.id;

  // Publish each page
  for (const p of pages) {
    const elements = p.data as import('../core/types').El[];
    const html = generateHTML(elements, { title: p.name });
    await db.update(editorPages)
      .set({ publishedHtml: html, published: true, updatedAt: new Date() })
      .where(eq(editorPages.id, p.id));
  }

  // Mark project as published with slug
  await db.update(editorProjects)
    .set({ slug: projectSlug, published: true, updatedAt: new Date() })
    .where(eq(editorProjects.id, page.id));

  return { ...page, slug: projectSlug };
}

export async function savePageTemplate(template: {
  name: string;
  content: string;
  userId: string;
}) {
  const tenantId = await getTenant();
  const [created] = await db.insert(editorProjects)
    .values({ tenantId, name: `[Template] ${template.name}`, data: JSON.parse(template.content), createdAt: new Date(), updatedAt: new Date() })
    .returning();
  return created;
}

export async function getPageTemplates() {
  const tenantId = await getTenant();
  const all = await db.select().from(editorProjects).where(eq(editorProjects.tenantId, tenantId));
  return all
    .filter(t => t.name.startsWith('[Template]'))
    .map(t => ({ id: t.id, name: t.name.replace('[Template] ', ''), content: JSON.stringify(t.data) }));
}

export async function deletePageTemplate(id: string) {
  const tenantId = await getTenant();
  await db.delete(editorProjects).where(and(eq(editorProjects.id, id), eq(editorProjects.tenantId, tenantId)));
}

// ─── Multi-Page CRUD ────────────────────────────────────

export async function getProjectPages(projectId: string) {
  const tenantId = await getTenant();
  // Verify project belongs to tenant
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)))
    .limit(1);
  if (!project) return [];

  return db.select().from(editorPages)
    .where(eq(editorPages.projectId, projectId))
    .orderBy(asc(editorPages.order));
}

export async function createPage(projectId: string, name: string) {
  const tenantId = await getTenant();
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)))
    .limit(1);
  if (!project) return null;

  const existing = await db.select({ order: editorPages.order }).from(editorPages)
    .where(eq(editorPages.projectId, projectId))
    .orderBy(desc(editorPages.order)).limit(1);
  const nextOrder = (existing[0]?.order ?? -1) + 1;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const [page] = await db.insert(editorPages)
    .values({ projectId, name, slug, order: nextOrder, data: [], createdAt: new Date(), updatedAt: new Date() })
    .returning();
  return page;
}

export async function updatePage(pageId: string, data: { name?: string; slug?: string; data?: string }) {
  const tenantId = await getTenant();
  // Verify ownership via project
  const [page] = await db.select({ id: editorPages.id, projectId: editorPages.projectId }).from(editorPages)
    .where(eq(editorPages.id, pageId)).limit(1);
  if (!page) return null;
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, page.projectId), eq(editorProjects.tenantId, tenantId)))
    .limit(1);
  if (!project) return null;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name) updates.name = data.name;
  if (data.slug) updates.slug = data.slug;
  if (data.data) updates.data = JSON.parse(data.data);

  const [updated] = await db.update(editorPages).set(updates)
    .where(eq(editorPages.id, pageId)).returning();
  return updated;
}

export async function deletePage2(pageId: string) {
  const tenantId = await getTenant();
  const [page] = await db.select({ projectId: editorPages.projectId }).from(editorPages)
    .where(eq(editorPages.id, pageId)).limit(1);
  if (!page) return;
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, page.projectId), eq(editorProjects.tenantId, tenantId)))
    .limit(1);
  if (!project) return;
  await db.delete(editorPages).where(eq(editorPages.id, pageId));
}
