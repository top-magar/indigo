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
      .set({ data: page.content ? JSON.parse(page.content) : [], updatedAt: new Date() })
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
  const projectSlug = project.slug || project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || project.id;
  const navConfig = (project.navConfig as NavItem[] | null) ?? [];
  const theme = project.themeConfig as Record<string, string> | null;

  // Build theme CSS
  const themeCss = theme ? `<style>:root{--primary:${theme.primaryColor || '#10b981'};--bg:${theme.backgroundColor || '#fff'};--text:${theme.textColor || '#111827'};--heading-font:${theme.headingFont || 'Inter'},sans-serif;--body-font:${theme.bodyFont || 'Inter'},sans-serif;--radius:${theme.borderRadius || '8px'}}body{background:var(--bg);color:var(--text);font-family:var(--body-font)}h1,h2,h3,h4,h5,h6{font-family:var(--heading-font)}</style>` : '';

  // Build nav HTML from config
  const navHtml = navConfig.length > 0
    ? `<nav style="display:flex;gap:24px;padding:12px 24px;background:#fff;border-bottom:1px solid #eee;font-family:Inter,system-ui,sans-serif;font-size:14px">${navConfig.map(item => {
        const href = item.pageId
          ? `/p/${projectSlug}${pages.find(p => p.id === item.pageId)?.isHomepage ? '' : `/${pages.find(p => p.id === item.pageId)?.slug || ''}`}`
          : (item.href || '#');
        return `<a href="${href}" style="color:#333;text-decoration:none">${item.label}</a>`;
      }).join('')}</nav>`
    : (pages.length > 1
      ? `<nav style="display:flex;gap:24px;padding:12px 24px;background:#fff;border-bottom:1px solid #eee;font-family:Inter,system-ui,sans-serif;font-size:14px">${pages.map(p => `<a href="/p/${projectSlug}${p.isHomepage ? '' : `/${p.slug}`}" style="color:#333;text-decoration:none">${p.name}</a>`).join('')}</nav>`
      : '');

  // Publish each page with SEO + nav
  for (const p of pages) {
    const elements = p.data as import('../core/types').El[];
    const html = generateHTML(elements, {
      title: p.seoTitle || p.name,
      description: p.seoDescription || undefined,
      ogImage: p.ogImage || undefined,
    });
    // Inject nav + theme after <body>, resolve page links
    let finalHtml = html.replace(/<head[^>]*>/, (m) => `${m}${themeCss}`);
    if (navHtml) finalHtml = finalHtml.replace(/<body[^>]*>/, (m) => `${m}${navHtml}`);
    // Resolve #page:slug → /p/{projectSlug}/{pageSlug}
    finalHtml = finalHtml.replace(/#page:([a-z0-9-]+)/g, (_, slug) => {
      const target = pages.find(pg => pg.slug === slug);
      return target?.isHomepage ? `/p/${projectSlug}` : `/p/${projectSlug}/${slug}`;
    });
    await db.update(editorPages)
      .set({ publishedHtml: finalHtml, published: true, updatedAt: new Date() })
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
  if (data.name) {
    updates.name = data.name;
    // Auto-generate slug from name unless explicitly provided
    if (!data.slug) updates.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
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

// ─── SEO + Navigation ───────────────────────────────────

export async function updatePageSeo(pageId: string, seo: { seoTitle?: string; seoDescription?: string; ogImage?: string }) {
  const tenantId = await getTenant();
  const [page] = await db.select({ projectId: editorPages.projectId }).from(editorPages).where(eq(editorPages.id, pageId)).limit(1);
  if (!page) return;
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, page.projectId), eq(editorProjects.tenantId, tenantId))).limit(1);
  if (!project) return;
  await db.update(editorPages).set({ ...seo, updatedAt: new Date() }).where(eq(editorPages.id, pageId));
}

export type NavItem = { id: string; label: string; pageId?: string; href?: string; children?: NavItem[] };

export async function saveNavConfig(projectId: string, navConfig: NavItem[]) {
  const tenantId = await getTenant();
  await db.update(editorProjects).set({ navConfig, updatedAt: new Date() })
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)));
}

export async function getNavConfig(projectId: string): Promise<NavItem[]> {
  const tenantId = await getTenant();
  const [project] = await db.select({ navConfig: editorProjects.navConfig }).from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId))).limit(1);
  return (project?.navConfig as NavItem[] | null) ?? [];
}

// ─── Theme / Design Tokens ──────────────────────────────

export type ThemeConfig = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  mode: 'light' | 'dark';
};

const defaultTheme: ThemeConfig = {
  primaryColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  borderRadius: '8px',
  mode: 'light',
};

export async function getThemeConfig(projectId: string): Promise<ThemeConfig> {
  const tenantId = await getTenant();
  const [project] = await db.select({ themeConfig: editorProjects.themeConfig }).from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId))).limit(1);
  return { ...defaultTheme, ...(project?.themeConfig as Partial<ThemeConfig> | null) };
}

export async function saveThemeConfig(projectId: string, theme: Partial<ThemeConfig>) {
  const tenantId = await getTenant();
  const current = await getThemeConfig(projectId);
  await db.update(editorProjects).set({ themeConfig: { ...current, ...theme }, updatedAt: new Date() })
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)));
}
