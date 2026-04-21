'use server';

import { db } from '@/infrastructure/db';
import { editorProjects } from '@/db/schema/editor-projects';
import { editorPages } from '@/db/schema/editor-pages';
import { tenants } from '@/db/schema/tenants';
import { eq, asc } from 'drizzle-orm';
import { v4 } from 'uuid';
import { requireUser } from '@/lib/auth';

/** Ensure tenant has exactly one site. Creates default pages if new. */
export async function ensureTenantSite() {
  const user = await requireUser();
  const tenantId = user.tenantId;

  // Check for existing site
  const [existing] = await db.select({ id: editorProjects.id })
    .from(editorProjects)
    .where(eq(editorProjects.tenantId, tenantId))
    .limit(1);

  if (existing) return existing.id;

  // Create site with tenant name
  const [tenant] = await db.select({ name: tenants.name }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const siteName = tenant?.name || 'My Store';
  const siteSlug = siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const now = new Date();
  const siteId = v4();
  await db.insert(editorProjects).values({
    id: siteId, tenantId, name: siteName, slug: siteSlug, data: [], createdAt: now, updatedAt: now,
  });

  // Create default pages
  const body = (children: unknown[]) => [{ id: v4(), type: '__body', name: 'Body', styles: { display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', fontFamily: 'Inter, system-ui, sans-serif' }, content: children }];

  const pages = [
    {
      name: 'Home', slug: 'home', order: 0, isHomepage: true,
      data: body([
        { id: v4(), type: 'hero', name: 'Hero', styles: { display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', padding: '96px 24px', textAlign: 'center', width: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }, content: [
          { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '48px', fontWeight: '800', lineHeight: '1.1', color: '#ffffff', maxWidth: '640px' }, content: { innerText: 'Welcome to Our Store' } },
          { id: v4(), type: 'text', name: 'Subtitle', styles: { fontSize: '18px', opacity: '0.7', color: '#ffffff', maxWidth: '480px' }, content: { innerText: 'Discover amazing products at great prices.' } },
          { id: v4(), type: 'button', name: 'CTA', styles: { padding: '14px 36px', backgroundColor: '#10b981', color: '#ffffff', fontSize: '16px', fontWeight: '600', borderRadius: '8px', width: 'fit-content' }, content: { innerText: 'Shop Now', href: '#' } },
        ] },
        { id: v4(), type: 'shippingInfo', name: 'Trust Badges', styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '48px 24px', width: '100%', maxWidth: '960px', margin: '0 auto' }, content: [
          { id: v4(), type: 'container', name: 'Free Shipping', styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', textAlign: 'center' }, content: [
            { id: v4(), type: 'text', name: 'Icon', styles: { fontSize: '24px' }, content: { innerText: '🚚' } },
            { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '14px', fontWeight: '600' }, content: { innerText: 'Free Shipping' } },
            { id: v4(), type: 'text', name: 'Desc', styles: { fontSize: '12px', color: '#6b7280' }, content: { innerText: 'On orders over $50' } },
          ] },
          { id: v4(), type: 'container', name: 'Returns', styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', textAlign: 'center' }, content: [
            { id: v4(), type: 'text', name: 'Icon', styles: { fontSize: '24px' }, content: { innerText: '↩️' } },
            { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '14px', fontWeight: '600' }, content: { innerText: '30-Day Returns' } },
            { id: v4(), type: 'text', name: 'Desc', styles: { fontSize: '12px', color: '#6b7280' }, content: { innerText: 'Hassle-free returns' } },
          ] },
          { id: v4(), type: 'container', name: 'Secure', styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', textAlign: 'center' }, content: [
            { id: v4(), type: 'text', name: 'Icon', styles: { fontSize: '24px' }, content: { innerText: '🔒' } },
            { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '14px', fontWeight: '600' }, content: { innerText: 'Secure Payment' } },
            { id: v4(), type: 'text', name: 'Desc', styles: { fontSize: '12px', color: '#6b7280' }, content: { innerText: 'SSL encrypted' } },
          ] },
        ] },
      ]),
    },
    {
      name: 'About', slug: 'about', order: 1, isHomepage: false,
      data: body([
        { id: v4(), type: 'container', name: 'About Section', styles: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '64px 24px', maxWidth: '720px', margin: '0 auto', width: '100%' }, content: [
          { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '36px', fontWeight: '800', lineHeight: '1.2' }, content: { innerText: 'About Us' } },
          { id: v4(), type: 'text', name: 'Story', styles: { fontSize: '16px', lineHeight: '1.8', color: '#4b5563' }, content: { innerText: 'We started with a simple idea: make great products accessible to everyone. Our team is passionate about quality, sustainability, and customer satisfaction. Every product in our store is carefully selected to meet our high standards.' } },
          { id: v4(), type: 'text', name: 'Mission', styles: { fontSize: '16px', lineHeight: '1.8', color: '#4b5563' }, content: { innerText: 'Our mission is to provide an exceptional shopping experience with products you\'ll love, prices you\'ll appreciate, and service you can count on.' } },
        ] },
      ]),
    },
    {
      name: 'Contact', slug: 'contact', order: 2, isHomepage: false,
      data: body([
        { id: v4(), type: 'container', name: 'Contact Section', styles: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '64px 24px', maxWidth: '720px', margin: '0 auto', width: '100%' }, content: [
          { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '36px', fontWeight: '800', lineHeight: '1.2' }, content: { innerText: 'Contact Us' } },
          { id: v4(), type: 'text', name: 'Intro', styles: { fontSize: '16px', lineHeight: '1.8', color: '#4b5563' }, content: { innerText: 'Have a question or need help? We\'d love to hear from you. Reach out using any of the methods below.' } },
          { id: v4(), type: 'text', name: 'Email', styles: { fontSize: '16px', color: '#111827' }, content: { innerText: '📧 support@yourstore.com' } },
          { id: v4(), type: 'text', name: 'Phone', styles: { fontSize: '16px', color: '#111827' }, content: { innerText: '📞 +1 (555) 123-4567' } },
          { id: v4(), type: 'text', name: 'Hours', styles: { fontSize: '14px', color: '#6b7280', marginTop: '8px' }, content: { innerText: 'Monday – Friday, 9am – 5pm EST' } },
        ] },
      ]),
    },
    {
      name: 'Shop', slug: 'shop', order: 3, isHomepage: false,
      data: body([
        { id: v4(), type: 'container', name: 'Shop Header', styles: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '48px 24px 24px', width: '100%' }, content: [
          { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '36px', fontWeight: '800' }, content: { innerText: 'All Products' } },
          { id: v4(), type: 'text', name: 'Subtitle', styles: { fontSize: '16px', color: '#6b7280' }, content: { innerText: 'Browse our full collection' } },
        ] },
        { id: v4(), type: 'productGrid', name: 'Products', styles: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', padding: '24px', width: '100%' }, content: [
          ...[['Classic T-Shirt', '$29.99'], ['Denim Jacket', '$89.99'], ['Running Shoes', '$119.99'], ['Leather Bag', '$149.99']].map(([name, price]) => ({
            id: v4(), type: 'container', name: name as string, styles: { display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundColor: '#ffffff' }, content: [
              { id: v4(), type: 'image', name: 'Image', styles: { width: '100%', height: '200px', objectFit: 'cover', backgroundColor: '#f3f4f6' }, content: { src: '', alt: name as string } },
              { id: v4(), type: 'container', name: 'Info', styles: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px' }, content: [
                { id: v4(), type: 'text', name: 'Name', styles: { fontSize: '14px', fontWeight: '600' }, content: { innerText: name as string } },
                { id: v4(), type: 'text', name: 'Price', styles: { fontSize: '16px', fontWeight: '700', color: '#10b981' }, content: { innerText: price as string } },
              ] },
            ] })),
        ] },
      ]),
    },
  ];

  const insertedPageIds: string[] = [];
  for (const p of pages) {
    const [inserted] = await db.insert(editorPages).values({
      projectId: siteId, name: p.name, slug: p.slug, order: p.order,
      data: p.data, isHomepage: p.isHomepage, createdAt: now, updatedAt: now,
    }).returning({ id: editorPages.id });
    insertedPageIds.push(inserted.id);
  }

  // Set nav config with real page IDs
  await db.update(editorProjects).set({
    navConfig: pages.map((p, i) => ({ id: v4(), label: p.name, pageId: insertedPageIds[i] })),
    headerData: [{
      id: v4(), type: 'container', name: 'Header', styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', backgroundColor: '#000000', color: '#ffffff', width: '100%' }, content: [
        { id: v4(), type: 'text', name: 'Logo', styles: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em', color: '#ffffff' }, content: { innerText: siteName } },
        { id: v4(), type: 'container', name: 'Nav Links', styles: { display: 'flex', gap: '32px', alignItems: 'center' }, content:
          pages.map(p => ({ id: v4(), type: 'link', name: p.name, styles: { fontSize: '14px', fontWeight: '500', color: '#ffffff', opacity: '0.7', textDecoration: 'none' }, content: { innerText: p.name, href: `#page:${p.slug}` } }))
        },
      ]
    }],
    footerData: [{
      id: v4(), type: 'container', name: 'Footer', styles: { display: 'flex', flexDirection: 'column', gap: '24px', padding: '48px 32px', backgroundColor: '#000000', color: '#ffffff', width: '100%', marginTop: 'auto' }, content: [
        { id: v4(), type: 'container', name: 'Footer Top', styles: { display: 'flex', justifyContent: 'space-between', gap: '48px' }, content: [
          { id: v4(), type: 'container', name: 'Brand', styles: { display: 'flex', flexDirection: 'column', gap: '12px', flex: '1.5' }, content: [
            { id: v4(), type: 'text', name: 'Logo', styles: { fontSize: '20px', fontWeight: '700', color: '#ffffff' }, content: { innerText: siteName } },
            { id: v4(), type: 'text', name: 'Tagline', styles: { fontSize: '14px', opacity: '0.5', lineHeight: '1.6', maxWidth: '280px', color: '#ffffff' }, content: { innerText: 'Building the future, one product at a time.' } },
          ] },
          { id: v4(), type: 'container', name: 'Links', styles: { display: 'flex', flexDirection: 'column', gap: '10px', flex: '1' }, content:
            pages.map(p => ({ id: v4(), type: 'link', name: p.name, styles: { fontSize: '14px', opacity: '0.6', color: '#ffffff', textDecoration: 'none' }, content: { innerText: p.name, href: `#page:${p.slug}` } }))
          },
        ] },
        { id: v4(), type: 'divider', name: 'Divider', styles: { borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%' }, content: {} },
        { id: v4(), type: 'text', name: 'Copyright', styles: { fontSize: '13px', opacity: '0.35', textAlign: 'center', color: '#ffffff' }, content: { innerText: `© ${new Date().getFullYear()} ${siteName}. All rights reserved.` } },
      ]
    }],
  }).where(eq(editorProjects.id, siteId));

  return siteId;
}

/** Get the tenant's site ID */
export async function getTenantSiteId() {
  const user = await requireUser();
  const [site] = await db.select({ id: editorProjects.id })
    .from(editorProjects)
    .where(eq(editorProjects.tenantId, user.tenantId))
    .limit(1);
  return site?.id ?? null;
}

/** Get all pages for the tenant's site */
export async function getTenantSitePages() {
  const user = await requireUser();
  const [site] = await db.select({ id: editorProjects.id, name: editorProjects.name, published: editorProjects.published, slug: editorProjects.slug })
    .from(editorProjects)
    .where(eq(editorProjects.tenantId, user.tenantId))
    .limit(1);
  if (!site) return { site: null, pages: [] };

  const pages = await db.select().from(editorPages)
    .where(eq(editorPages.projectId, site.id))
    .orderBy(asc(editorPages.order));

  return { site, pages };
}
