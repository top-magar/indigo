# AGENTS.md

> Instructions for AI coding agents working on Indigo.

## Quick Start
1. Read `design-system/indigo/MASTER.md` — design tokens, component patterns, anti-patterns
2. Read `.cursorrules` — quick-reference coding rules
3. Check `design-system/indigo/pages/{page}.md` for page-specific overrides

## Project
Multi-tenant e-commerce SaaS for Nepal.
Stack: Next.js 16 · Supabase · Drizzle ORM · Tailwind CSS v4 · shadcn/ui (radix-mira) · Lucide icons

## Structure
```
src/app/dashboard/     → Admin pages (page.tsx → *-client.tsx → actions.ts)
src/app/(editor)/      → Visual storefront editor
src/app/store/[slug]/  → Customer-facing storefront
src/components/ui/     → shadcn components (70 installed, all v4)
src/components/dashboard/ → Dashboard-specific components
src/features/          → Domain modules (products, orders, customers, editor)
src/infrastructure/    → DB, auth, cache, services
src/db/schema/         → Drizzle ORM schemas
```

## Commands
```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm db:push      # DB migrations
npx tsc --noEmit  # Type check (must pass)
```

## Key Conventions
- Auth: `const { user, supabase } = await getAuthenticatedClient()`
- Server files can't export types → put in sibling `types.ts`
- Dashboard buttons: always `size="sm"`
- Page titles: `text-xl font-semibold tracking-[-0.4px]`
- No emoji icons, no decorative animations, no `dark:` overrides
