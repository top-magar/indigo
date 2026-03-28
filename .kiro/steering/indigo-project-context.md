---
inclusion: always
---

# Indigo — Project Context

Multi-tenant e-commerce SaaS for Nepal. Merchants get isolated stores with visual editor, local payments (eSewa, Khalti, FonePay), and a Vercel-inspired admin dashboard.

## Stack
Next.js 16 (App Router) · TypeScript (strict) · Supabase (PostgreSQL + Auth + RLS) · Drizzle ORM · Tailwind CSS v4 · shadcn/ui (radix-mira style, neutral base) · Zustand · Inngest · Recharts · Lucide icons

## Design System
**Source of truth:** `design-system/indigo/MASTER.md`
Page-specific overrides: `design-system/indigo/pages/{page}.md`

Key rules:
- Flat design, achromatic neutral base. Color only from semantic tokens.
- Font: Inter → system stack (`font-sans`). Mono: Geist Mono (`font-mono`).
- Page titles: `text-xl font-semibold tracking-[-0.4px]`
- Dashboard buttons: always `size="sm"`
- Cards: `p-4`, no shadow, `gap-3` between cards
- All spacing: 4px base grid
- No emoji icons, no decorative animations, no `dark:` overrides (tokens handle it)

## Architecture
```
src/app/           → Pages: (auth), (editor), api, dashboard, store/[slug]
src/components/    → ui/ (shadcn), dashboard/, store/, landing/
src/features/      → Domain: products, orders, customers, inventory, editor
src/infrastructure/→ Cross-cutting: db, auth, cache, inngest, services
src/db/schema/     → Drizzle ORM schemas
```

## Conventions
- Auth: `const { user, supabase } = await getAuthenticatedClient()`
- Server files can't export types → sibling `types.ts`
- Verify after changes: `npx tsc --noEmit`
- Dashboard page pattern: `page.tsx` (server) → `{module}-client.tsx` (client) → `actions.ts` (server actions)

## Commands
```bash
pnpm dev              # Dev server
pnpm build            # Production build
pnpm db:push          # Drizzle migrations
npx tsc --noEmit      # Type check
```
