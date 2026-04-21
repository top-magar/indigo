# Indigo — Project Instructions

## What is Indigo?

Multi-tenant e-commerce SaaS. Merchants manage products/orders in a dashboard and build their storefront with a visual page builder.

## Agent Team

| Agent | Role | Shortcut |
|-------|------|----------|
| **product-orchestrator** | Tech lead. Analyzes, plans, delegates, verifies. | Ctrl+O |
| **frontend-engineer** | React components, Zustand stores, editor canvas. | Ctrl+F |
| **backend-engineer** | API routes, Drizzle schemas, server actions, auth. | Ctrl+B |
| **product-designer** | UI/UX, design system, visual polish. | Ctrl+D |

## How to Work

1. **Read before writing.** Check existing code, match patterns.
2. **Type-check before committing.** `npx tsc --noEmit` must pass.
3. **One concern per commit.** Conventional commits (`feat:`, `fix:`, etc).
4. **Tenant isolation.** Every query scoped by `tenantId`.
5. **Minimal code.** No abstractions without justification.

## Key Paths

| What | Where |
|------|-------|
| Editor | `src/features/editor/` |
| Dashboard | `src/app/dashboard/` |
| Store | `src/app/store/[slug]/` |
| Published pages | `src/app/p/[...slug]/` |
| DB schemas | `src/db/schema/` |
| Server actions | `src/features/editor/lib/queries.ts` |
| Site setup | `src/features/editor/lib/site.ts` |
| Page templates | `src/features/editor/lib/page-templates.ts` |
| Element registry | `src/features/editor/core/registry/` |

## Current State

- 1 site per tenant with multi-page support
- 10 prebuilt page templates
- Shared header/footer across pages
- SEO per page (title, description, og:image)
- Image upload to Supabase Storage
- Page visit tracking
- Custom domain routing
- E-commerce components (product card, grid, pricing, etc)
- XSS-safe HTML export with CSP headers
- 0 TypeScript errors
