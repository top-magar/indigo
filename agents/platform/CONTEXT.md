# Indigo Platform — Shared Agent Context

## Stack
- Next.js 16.1 (App Router, Turbopack), React 19, TypeScript strict
- Supabase (Postgres + Auth + Realtime + Storage), Drizzle ORM
- AWS (S3, SES, CloudFront, Rekognition, Bedrock)
- Stripe Connect (payments, payouts)
- Inngest (background jobs), Redis (cache)
- Tailwind CSS 4, shadcn/ui (81 components)

## Multi-Tenancy
- Every DB table has `tenant_id` column with Supabase RLS
- `verifyTenantOwnership(tenantId)` — every server action starts with this
- `requireUser()` → `{ id, email, tenantId, role, fullName, avatarUrl }`
- Roles: owner (full), admin (full), editor (edit/save, no publish/delete), viewer (read-only)
- Tenant resolution: middleware reads slug from URL or session

## DB Schema (20 tables via Drizzle)
tenants, users, products, orders, customers, collections, categories,
inventory, layouts (editor pages), media, reviews, discounts, campaigns,
cart, domains, audit-logs, notification-preferences, store-config,
dashboard-layouts, attributes

## Infrastructure Services (19)
ai, audit-logger, cache, email, error-handler, event-bus, factory,
forecast, notification-delivery, notification-emitter, observability,
rate-limiter, recommendation, search, storage, validation,
websocket-server, init, index

## API Routes (37)
External: stripe webhooks, public products/checkout/cart, newsletter
Internal: editor save, draft preview, health, inngest, upload, SSE notifications
AI: translate, audio, invoice scan, config/status/usage
Dashboard: stats, domains

## Dashboard Sections (16)
products, orders, customers, categories, collections, inventory,
marketing, analytics, reviews, media, pages, finances, gift-cards,
attributes, settings, bulk-actions

## Storefront Pages (11)
homepage (renders editor JSON), products/[id], category/[id], checkout,
account, search, wishlist, about, contact, faq, order-confirmation

## Server Action Pattern
Every mutation is a Server Action (`"use server"`). Pattern:
```typescript
export async function doSomethingAction(tenantId: string, ...args) {
  const user = await verifyTenantOwnership(tenantId)
  // validate input
  // perform mutation via Supabase client
  // audit(tenantId, "action.name", user.id, entityId, extra)
  // revalidatePath/revalidateTag if needed
  return { success: true, data }
}
```

## Known Patterns
- Dashboard pages: `page.tsx` (server) fetches data → `*-client.tsx` (client) renders
- `*-actions.ts` files contain domain-specific server actions
- `audit(tenantId, action, userId, entityId, extra)` — fire-and-forget audit logging
- `revalidatePath()` after mutations that affect rendered pages
- Optimistic UI via `useTransition` + `startTransition`
- Error boundaries at route level (`error.tsx`) and component level

## Known Recurring Issues
1. **Tenant leaks** — forgetting `verifyTenantOwnership` or `.eq("tenant_id", tenantId)` in queries
2. **N+1 queries** — dashboard list pages fetching related data in loops
3. **Stale cache** — mutations not invalidating Redis cache or Next.js cache
4. **Missing revalidation** — server action mutates data but doesn't `revalidatePath`
5. **Unvalidated input** — server actions accepting user input without Zod validation
6. **Missing error boundaries** — dashboard sections without `error.tsx`
7. **Stripe webhook idempotency** — processing the same event twice
