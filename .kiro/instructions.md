# Indigo — Project Instructions

## What is Indigo?

Multi-tenant e-commerce SaaS for Nepal. Merchants manage products, orders, customers in a dashboard and build their storefront with a visual page builder.

## Compound Engineering

Every session follows the loop: **Plan → Work → Review → Compound**.
After each session, update `SESSION.md` with bugs found, patterns learned, and what's next.

## Agent Team

| Shortcut | Agent | Owns |
|----------|-------|------|
| `Ctrl+O` | **Product Orchestrator** | Planning, architecture, delegation |
| `Ctrl+F` | **Frontend Engineer** | Editor, dashboard UI, React components |
| `Ctrl+B` | **Backend Engineer** | DB schemas, server actions, API routes, auth |
| `Ctrl+D` | **Product Designer** | UI/UX, design system, visual polish |

## Steering Files

| File | Scope |
|------|-------|
| `architecture.md` | Platform-wide patterns, file structure, auth flow |
| `editor-patterns.md` | Editor data model, stores, registry, drag, export |
| `database-conventions.md` | Tenant isolation, schemas, migrations |
| `commerce.md` | Products, orders, customers, checkout, payments |
| `storefront.md` | Store rendering, published pages, custom domains, SEO |
| `ui-conventions.md` | shadcn, spacing, overlay colors, accessibility |

## Hooks

| Hook | Trigger | Action |
|------|---------|--------|
| `type-check.md` | Save .ts/.tsx | Run `tsc --noEmit` |
| `schema-migration-reminder.md` | Save schema file | Remind to create migration |
| `tenant-isolation-check.md` | Save server action | Verify tenantId in queries |

## Key Commands

```bash
pnpm dev                # Dev server (port 3000)
npx tsc --noEmit        # Type-check (must be 0 errors)
npx supabase db push    # Push migrations
git log --oneline -10   # Recent commits
```

## Current Priorities

1. 🔴 **Checkout flow** — cart → payment → order creation
2. 🔴 **Payment integration** — eSewa/Khalti testing
3. 🟡 **Product ↔ Editor** — editor product grid pulls real catalog
4. 🟡 **Order notifications** — email on order events
5. 🟢 **Editor polish** — responsive design, inline text editing
6. 🟢 **Analytics** — real revenue data
