'use server';

import { db } from '@/infrastructure/db';
import { editorProjects } from '@/db/schema/editor-projects';
import { eq } from 'drizzle-orm';

export async function upsertFunnelPage(page: {
  id?: string;
  name: string;
  funnelId: string;
  order: number;
  content?: string;
  previewImage?: string;
}) {
  if (!page.id) return null;

  const existing = await db.select().from(editorProjects).where(eq(editorProjects.id, page.id)).limit(1);

  if (existing.length > 0) {
    const [updated] = await db.update(editorProjects)
      .set({ name: page.name, data: page.content ? JSON.parse(page.content) : [], updatedAt: new Date() })
      .where(eq(editorProjects.id, page.id))
      .returning();
    return updated;
  }

  const [created] = await db.insert(editorProjects)
    .values({ id: page.id, tenantId: page.funnelId, name: page.name, data: page.content ? JSON.parse(page.content) : [] })
    .returning();
  return created;
}

export async function upsertFunnel(funnel: {
  id: string;
  name: string;
  subAccountId: string;
  published?: boolean;
}) {
  // Publishing is a no-op for now — just update the project name
  await db.update(editorProjects)
    .set({ name: funnel.name, updatedAt: new Date() })
    .where(eq(editorProjects.id, funnel.id));
  return funnel;
}

export async function savePageTemplate(template: {
  name: string;
  content: string;
  userId: string;
}) {
  const [created] = await db.insert(editorProjects)
    .values({ tenantId: template.userId, name: `[Template] ${template.name}`, data: JSON.parse(template.content) })
    .returning();
  return created;
}

export async function getPageTemplates(userId: string) {
  const templates = await db.select()
    .from(editorProjects)
    .where(eq(editorProjects.tenantId, userId));
  return templates
    .filter(t => t.name.startsWith('[Template]'))
    .map(t => ({ id: t.id, name: t.name.replace('[Template] ', ''), content: JSON.stringify(t.data) }));
}

export async function deletePageTemplate(id: string) {
  await db.delete(editorProjects).where(eq(editorProjects.id, id));
}
