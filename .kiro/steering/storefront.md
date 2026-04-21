# Storefront Conventions

Rules for the customer-facing store and published pages.

## Store Rendering Priority

```
/store/{slug} checks in order:
1. Published editor pages (editor_pages with published_html)
2. Section-based renderer (dashboard storefront settings)
3. Default homepage (fallback)
```

## Published Pages

- Route: `/p/{site-slug}` (homepage), `/p/{site-slug}/{page-slug}` (sub-pages)
- Served as raw HTML from `editor_pages.published_html`
- Header/footer injected from `editor_projects.header_data/footer_data`
- Theme CSS vars injected into `<head>`
- Page links (`#page:slug`) resolved to real URLs on publish
- CSP: `script-src 'none'` — no JS execution on published pages
- `X-Frame-Options: SAMEORIGIN`
- View count incremented on each visit (fire-and-forget)

## Custom Domains

- `tenant_domains` table: domain, tenant_id, status (pending/verified/active)
- Middleware: non-platform hostname → rewrite to `/store/_custom?domain=xxx`
- `/store/_custom/page.tsx` resolves domain → tenant → serves editor pages or store

## Store Layout

- Header: `src/components/store/store-header.tsx`
- Footer: `src/components/store/store-footer.tsx`
- Shell: `src/components/store/store-shell.tsx`
- Cart: `src/features/store/cart-provider.tsx`

## SEO

- Per-page: seo_title, seo_description, og_image on editor_pages
- Store-level: meta tags generated in store layout
- Sitemap: TODO — generate from published pages
- robots.txt: `src/app/robots.ts`
