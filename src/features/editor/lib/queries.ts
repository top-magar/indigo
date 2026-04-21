'use server';

/**
 * Editor page queries — adapter for Indigo's infrastructure.
 * Replace these implementations with your actual DB calls (Drizzle + Supabase).
 * For now, uses localStorage as a stub so the editor works immediately.
 */

// TODO: Replace with Drizzle schema + Supabase queries
// import { db } from '@/db';
// import { editorPages } from '@/db/schema/editor-pages';

export async function upsertFunnelPage(page: {
  id?: string;
  name: string;
  funnelId: string;
  order: number;
  content?: string;
  previewImage?: string;
}) {
  // Stub: log the save. Replace with actual DB upsert.
  console.log('[editor] save page:', page.id, page.name, `${(page.content?.length ?? 0)} chars`);
  return page;
}

export async function upsertFunnel(funnel: {
  id: string;
  name: string;
  subAccountId: string;
  published?: boolean;
}) {
  console.log('[editor] publish funnel:', funnel.id, funnel.published);
  return funnel;
}

export async function savePageTemplate(template: {
  name: string;
  content: string;
  userId: string;
}) {
  console.log('[editor] save template:', template.name);
  return { id: crypto.randomUUID(), ...template };
}

export async function getPageTemplates(userId: string) {
  console.log('[editor] get templates for:', userId);
  return [] as { id: string; name: string; content: string }[];
}

export async function deletePageTemplate(id: string) {
  console.log('[editor] delete template:', id);
}
