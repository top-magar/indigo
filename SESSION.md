# Session — 2026-04-21

## What We Built

### Editor → Application Wiring
- Auth integration (requireUser + tenantId scoping)
- Dashboard pages list → editor opens in new tab
- Image upload to Supabase Storage (MIME allowlist, 5MB limit)
- Publish to live URLs (/p/{slug})
- CSP headers on published pages

### Site Architecture
- 1 site per tenant (editor_projects) with multi-page (editor_pages)
- Auto-create site with 4 default pages (Home, About, Contact, Shop)
- 10 prebuilt page templates
- Shared header/footer across pages
- Page visit tracking
- Custom domain routing (middleware rewrite)

### Editor Features
- Pages panel in left sidebar (add, rename, delete, switch)
- Page settings (SEO title/description, og:image, homepage toggle)
- Page link picker (#page:slug → resolved on publish)
- E-commerce components (8 new: product card/grid, pricing, cart, etc)
- Position settings in design panel
- Image upload button in content tab

### Security Fixes (from 3-agent audit)
- XSS: esc() function for all user content in HTML export
- Embed element disabled (raw HTML injection vector)
- Auto-save race condition fixed (reads fresh store state)
- Duplicated dirty state removed (uses store only)
- Upload file type + size validation
- Slug collision detection

### Cleanup
- Removed apps/storefront/ (143K lines dead code)
- Removed editor-v2, editor-v3, craft.js references
- Removed 27 TypeScript errors → 0 errors
- Restructured dashboard sidebar navigation
- Disabled Sentry in dev

## Bugs Found & Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| savePage overwrites page name | Was setting `name: page.name` (project name) on every auto-save | Only save `data` + `updatedAt` |
| Publish used wrong ID | `funnelId` (tenantId) passed instead of `pageId` | Pass `pageId` to publishPage |
| CSP blocks images | `img-src` only allowed supabase/amazonaws | Changed to `https:` |
| Empty canvas on new project | No default __body element created | Auto-create body in provider |
| Store not showing editor pages | Editor check was after section-renderer early return | Moved editor check first |
| Page selector duplicate homepage | Fake project entry + real editor_pages entry | Use editor_pages only |
| Auto-generated nav overlaps user nav | Injected <nav> on top of user-built navbar | Removed auto-nav injection |

## Patterns Established

1. **Element registry**: `register()` in `elements/*.ts`, renderer in `renderers.tsx`, group in `componentGroups()` order array
2. **Server actions**: `'use server'`, `getTenant()`, tenant-scoped queries
3. **Page lifecycle**: create → edit → save (to editor_pages) → publish (generates HTML) → serve (/p/{slug})
4. **Site setup**: `ensureTenantSite()` creates site + default pages + header/footer + nav config

## What's Next

- [ ] Product data integration (connect catalog to editor elements)
- [ ] Responsive design (per-device style overrides)
- [ ] Forms (contact form → submissions to DB)
- [ ] Pipeline/Kanban board for orders
- [ ] Inline text editing on canvas
