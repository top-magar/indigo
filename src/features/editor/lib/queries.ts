'use server';

import { db } from '@/infrastructure/db';
import { editorProjects } from '@/db/schema/editor-projects';
import { eq, and } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';

async function getTenant() {
  const user = await requireUser();
  return user.tenantId;
}

export async function savePage(page: {
  id?: string;
  name: string;
  content?: string;
}) {
  if (!page.id) return null;
  const tenantId = await getTenant();

  const [existing] = await db.select().from(editorProjects)
    .where(and(eq(editorProjects.id, page.id), eq(editorProjects.tenantId, tenantId)))
    .limit(1);

  if (existing) {
    const [updated] = await db.update(editorProjects)
      .set({ name: page.name, data: page.content ? JSON.parse(page.content) : [], updatedAt: new Date() })
      .where(and(eq(editorProjects.id, page.id), eq(editorProjects.tenantId, tenantId)))
      .returning();
    return updated;
  }

  const [created] = await db.insert(editorProjects)
    .values({ id: page.id, tenantId, name: page.name, data: page.content ? JSON.parse(page.content) : [], createdAt: new Date(), updatedAt: new Date() })
    .returning();
  return created;
}

export async function publishPage(page: {
  id: string;
  name: string;
}) {
  const tenantId = await getTenant();

  // Load the project data to generate HTML
  const [project] = await db.select().from(editorProjects)
    .where(and(eq(editorProjects.id, page.id), eq(editorProjects.tenantId, tenantId)))
    .limit(1);

  if (!project) return page;

  // Generate HTML from element tree
  const { generateHTML } = await import('../export/html');
  const elements = project.data as import('../core/types').El[];
  const baseSlug = project.slug || page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || project.id;

  // Check for slug collisions
  let slug = baseSlug;
  const [collision] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.slug, slug), eq(editorProjects.published, true)))
    .limit(1);
  if (collision && collision.id !== page.id) {
    slug = `${baseSlug}-${project.id.slice(0, 8)}`;
  }
  const html = generateHTML(elements, { title: page.name });

  await db.update(editorProjects)
    .set({ name: page.name, slug, publishedHtml: html, published: true, updatedAt: new Date() })
    .where(and(eq(editorProjects.id, page.id), eq(editorProjects.tenantId, tenantId)));

  return { ...page, slug };
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
