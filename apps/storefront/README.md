# Indigo Storefront

Standalone storefront app extracted from the Indigo monolith. Renders tenant storefronts independently from the dashboard.

## Quick Start

```bash
cd apps/storefront
pnpm install
cp ../../.env.local .env.local  # reuse the same env vars
pnpm dev                        # runs on port 3001
```

## Architecture

```
apps/storefront/
├── src/app/store/[slug]/     → Storefront pages (home, products, checkout, etc.)
├── src/app/api/store/        → Storefront API (cart, checkout, products)
├── src/features/store/       → Storefront renderer, theme provider
├── src/features/cart/        → Cart system
├── src/features/editor/      → Block components (read-only, for rendering)
├── src/components/store/     → Store UI (header, footer, cart sheet)
├── src/components/ui/        → 17 shadcn components (subset of dashboard)
├── src/shared/renderer.ts    → Rendering bridge (resolver, breakpoints, animations)
├── src/db/schema/            → Drizzle schema (shared with dashboard)
└── src/infrastructure/       → Supabase client, DB, tenant resolution
```

## Deployment

Deploy independently from the dashboard:
- **Vercel**: Create a new project pointing to `apps/storefront`
- **Docker**: Build from this directory
- **Custom**: `pnpm build && pnpm start`

## Syncing with Dashboard

When shared code changes in the monolith:
1. UI components: Copy from `src/components/ui/` (only the 17 used)
2. DB schema: Copy from `src/db/schema/`
3. Editor blocks: Copy from `src/features/editor/blocks/`
4. Shared renderer: Copy from `src/shared/renderer.ts`

## Environment Variables

Same as the main app — needs:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
