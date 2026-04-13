# AGENTS.md

> Instructions for AI coding agents working on Indigo — a multi-tenant e-commerce SaaS platform.

## Product

Multi-tenant e-commerce platform for Nepal. Merchants get a dashboard to manage products, orders, customers, and a visual storefront editor to build their store pages.

**Stack**: Next.js 16.1 · React 19 · Supabase (DB + Auth + Storage + Realtime) · Drizzle ORM · Tailwind CSS 4 · shadcn/ui · Zustand 5 · Lucide icons

## Architecture

```
src/
├── app/
│   ├── (auth)/              # Login, signup, onboarding
│   ├── (editor)/editor-v2/  # V2 section-based editor (active storefront editor)
│   ├── (marketing)/         # Landing page, blog
│   ├── api/                 # REST API routes (20+ endpoints)
│   ├── dashboard/           # Admin panel (products, orders, settings, 25+ pages)
│   ├── editor-v3/           # V3 visual builder (Webstudio-style, in development)
│   └── store/[slug]/        # Customer-facing storefront (SSR)
├── components/ui/           # shadcn components (70+ installed)
├── db/schema/               # Drizzle ORM schemas (22 tables)
├── features/                # Domain modules (see below)
└── infrastructure/          # DB client, auth, cache, services
```

## Feature Modules

```
features/
├── editor/        # V1 editor (Craft.js) — legacy
├── editor-v2/     # V2 editor — section-based, 35 blocks, active for storefront
├── editor-v3/     # V3 editor — Webstudio-style flat normalized data model, 79 files
├── products/      # Product CRUD, variants, images, pricing, shipping
├── orders/        # Order management, fulfillment, invoices, refunds
├── customers/     # Customer profiles, addresses, tags, timeline
├── collections/   # Product collections
├── categories/    # Category tree with subcategories
├── discounts/     # Discount codes, vouchers, sales
├── cart/          # Shopping cart
├── inventory/     # Stock tracking, forecasting
├── analytics/     # Dashboard analytics, revenue charts
├── media/         # Image/video upload, folders, bulk actions
├── attributes/    # Product attributes and values
├── reviews/       # Product reviews, sentiment
├── notifications/ # In-app notification preferences
├── store/         # Storefront theme, cart provider, renderer
├── marketing/     # Campaigns
├── stores/        # Store configuration
└── dashboard/     # Dashboard layouts
```

## Database (22 Drizzle schemas)

`src/db/schema/`: products, orders, customers, collections, categories, discounts, cart, inventory, attributes, reviews, media, campaigns, tenants, users, domains, store-config, dashboard-layouts, notification-preferences, audit-logs, layouts, editor-projects, editor-project-versions

## Commands

```bash
pnpm dev              # Dev server (Turbopack)
pnpm build            # Production build
pnpm db:push          # Push schema to DB
npx tsc --noEmit      # Type check — MUST pass before commit
```

## Key Patterns

### Auth & Multi-Tenancy
```typescript
const { user, supabase } = await getAuthenticatedClient()
const tenantId = user.user_metadata.tenant_id
// EVERY query must filter by tenantId
```

### Server Components + Client Components
```
page.tsx        → Server component (data fetching)
*-client.tsx    → Client component (interactivity)
actions.ts      → Server actions (mutations)
```

### Database
- Drizzle ORM — never raw SQL
- All queries filter by `tenantId`
- Repositories in `features/*/repositories/`

### Editor V2 (storefront builder — active)
- Zustand store with `sections[]` array + `theme{}` tokens
- 35 blocks across 7 categories, registered via `registerBlock()`
- Canvas: direct DOM with dnd-kit drag-drop
- Theme: 17 CSS variables via `var(--store-color-primary)`
- Storefront renders same blocks at `/store/[slug]/`

### Editor V3 (visual builder — in development)
- Flat normalized data: `Map<id, Instance>`, `Map<id, Prop>`, `Map<key, StyleDeclaration>`
- 3-layer style system: StyleSource → StyleSourceSelection → StyleDeclaration
- Iframe-isolated canvas with `createPortal`
- 13 components, 18 templates, 6 breakpoints
- **Critical**: UI components must use `useStore()` hook, NOT Zustand selectors (Map reference issues)
- Class-based CSS export with responsive @media
- PostgreSQL persistence + version history

### Storefront
- SSR at `/store/[slug]/`
- Uses V2 `RenderSections` for live rendering
- Theme CSS vars injected from page data

## Code Style

- TypeScript strict — no `any`, no `unknown`
- Functional components, hooks only
- shadcn/ui for all UI, Lucide for icons
- Tailwind for styling — no CSS modules
- Files: kebab-case. Components: PascalCase. Functions: camelCase. DB: snake_case.

## Git

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Single-line messages
- `npx tsc --noEmit` must pass before commit

## Don'ts

- Don't add tests unless asked
- Don't use `any` or `unknown`
- Don't add CSS `dark:` variants
- Don't use emoji as icons in UI
- Don't commit secrets or .env files
- Don't rewrite unrelated code
- Don't add dependencies without asking
- Don't use OOP — prefer functions

## Dashboard Conventions

- Page titles: `text-xl font-semibold tracking-[-0.4px]`
- Buttons: `size="sm"`
- Tables: shadcn DataTable with server-side pagination
- Forms: react-hook-form + zod
- Toasts: sonner
- Loading: skeleton components
