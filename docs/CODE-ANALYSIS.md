# Indigo — Comprehensive Code Analysis

**Date:** 2026-04-15
**Scope:** Infrastructure, data layer (Drizzle schemas + SQL migrations), frontend (dashboard + storefront + landing)
**Auditors:** Automated multi-stage analysis — infrastructure, data layer, frontend

---

## 1. Executive Summary

Indigo is a multi-tenant e-commerce SaaS with a partially-completed migration from Supabase to Drizzle ORM. The codebase has **two critical security vulnerabilities** in the middleware (privilege escalation via client-settable role metadata and default "owner" role fallback) and **significant schema drift** between Drizzle definitions and SQL migrations (17 SQL tables missing Drizzle schemas, 9 Drizzle tables missing SQL migrations). Payment processing has silent failures — tenant-specific credentials never load due to an RLS context bug, and eSewa payment verification sends hardcoded `total_amount=0`. The frontend is functional but inconsistent: 4 files still query via Supabase, currency symbols are hardcoded in 3 places, and several storefront components have keyboard accessibility gaps.

---

## 2. Scorecard

| Area | Score | Key Finding |
|------|-------|-------------|
| **Auth & RBAC** | 3/10 | Privilege escalation — role from client-settable `user_metadata`, default `"owner"` |
| **Tenant Isolation** | 5/10 | RLS well-designed but 9 tables lack RLS; payment config query bypasses RLS silently |
| **Payment Processing** | 4/10 | eSewa verification broken (`total_amount=0`); tenant credentials never load |
| **Schema Integrity** | 4/10 | 17 SQL tables missing from ORM; cart schema fundamentally diverged |
| **Data Layer (Drizzle)** | 6/10 | Good patterns but missing UNIQUE constraints, FK cascades, and CHECK constraints |
| **API Security** | 5/10 | SMS token over HTTP; CSP `unsafe-eval`; no CSRF on checkout; CSS injection vector |
| **Frontend Consistency** | 6/10 | Mixed Supabase/Drizzle data fetching; Supabase types used in Drizzle-fed components |
| **Performance** | 6/10 | No caching on dashboard/tenant resolution; `redis.keys()` O(N); duplicate queries |
| **Accessibility** | 5/10 | Add-to-cart not keyboard accessible; carousel has no ARIA; good skip-link on dashboard |
| **Code Hygiene** | 7/10 | Clean dependency graph, no circular deps; some dead code and `"use server"` misuse |

---

## 3. Critical Bugs

These are broken or will break in production.

| # | File | Line | Bug | Impact |
|---|------|------|-----|--------|
| 1 | `src/infrastructure/payments/nepal-providers.ts` | 12–17 | `getTenantPaymentConfig()` queries RLS-enforced `db` without setting tenant context via `withTenant()`. RLS blocks the query → returns no rows → always falls back to env vars. | Tenant-specific payment credentials never load. All tenants share one set of credentials. |
| 2 | `src/infrastructure/payments/nepal-providers.ts` | 63 | eSewa `getStatus()` sends `total_amount: "0"` hardcoded. eSewa requires actual transaction amount for verification. | Payment confirmations silently fail or return incorrect status. Orders may stay "pending" forever. |
| 3 | `src/app/dashboard/settings/storefront/actions.ts` | 128–130 | `revalidateCacheTag("store-tenant", "hours")` — `revalidateTag` accepts one string arg. `"hours"` is silently ignored. | Store cache never revalidates on settings save. Merchants see stale storefronts. |
| 4 | `src/app/dashboard/settings/storefront/actions.ts` | 79 | `JSON.parse((formData.get("socialLinks") as string) \|\| "[]")` — no try/catch. | Malformed JSON crashes the server action. Unhandled exception on save. |
| 5 | `src/infrastructure/services/notification-delivery.ts` | 218–219 | `deliverNotification` hardcodes channels as `["in_app", "email", "push"]` — excludes `"whatsapp"` and `"sms"`. | WhatsApp/SMS notifications are unreachable through the main delivery path despite being implemented. |
| 6 | `src/components/store/store-header.tsx` | 37, 42 | Uses `tenant.logo_url` / `tenant.primary_color` (snake_case Supabase) but layout passes Drizzle camelCase data. `as any` cast in layout masks the mismatch. | Header renders with undefined logo and colors. Silent runtime failure. |
| 7 | `src/components/store/store-footer.tsx` | 14, 18 | Same snake_case vs camelCase mismatch as header. | Footer renders with undefined logo and colors. |
| 8 | `src/components/store/store-footer.tsx` | 38 | Links to `/store/{slug}/contact` — route does not exist. | 404 for every store's "Contact Us" link. |

---

## 4. Security Issues

| # | Severity | File | Line | Issue |
|---|----------|------|------|-------|
| 1 | **CRITICAL** | `src/middleware.ts` | 56 | RBAC role read from `user.user_metadata?.role` — client-settable via Supabase SDK. Users can set their own role to `"owner"`. |
| 2 | **CRITICAL** | `src/middleware.ts` | 57 | Default role is `"owner"` when metadata is missing. Any authenticated user without metadata gets full admin privileges. |
| 3 | **HIGH** | `src/infrastructure/services/messaging.ts` | 96 | Sparrow SMS API called over HTTP (not HTTPS). Token sent as URL query parameter — interceptable by any network observer, logged by proxies. |
| 4 | **HIGH** | `src/infrastructure/payments/nepal-providers.ts` | 20 | Fallback merchant code `"EPAYTEST"` — if `ESEWA_MERCHANT_CODE` env var missing in production, real payments go to eSewa test environment. |
| 5 | **HIGH** | 9 Drizzle-only tables | — | `notification_preferences`, `quiet_hours_settings`, `layouts`, `layout_operations`, `block_locks`, `editor_sessions`, `page_templates`, `editor_projects`, `editor_project_versions` have no RLS policies. Cross-tenant data leakage possible. |
| 6 | **MEDIUM** | `src/middleware.ts` | 18 | CSP includes `'unsafe-eval'` for scripts — completely undermines XSS protection. |
| 7 | **MEDIUM** | `src/app/store/[slug]/layout.tsx` | 88 | `dangerouslySetInnerHTML` injects CSS variables from tenant settings (user input). Malicious CSS values could exfiltrate data. |
| 8 | **MEDIUM** | `src/app/store/[slug]/checkout/checkout-form.tsx` | — | No CSRF token on checkout POST to `/api/store/${slug}/checkout`. |
| 9 | **MEDIUM** | `src/infrastructure/services/notification-delivery.ts` | 168 | Email HTML built via string interpolation — XSS if title contains user-generated content. |
| 10 | **LOW** | `src/infrastructure/payments/provider.ts` | 1 | `"use server"` directive on class exports — exposes factory as callable server action from client. Same in `nepal-providers.ts:1`, `messaging.ts:1`. |

---

## 5. Performance Issues

| # | Impact | File | Line | Issue | Fix |
|---|--------|------|------|-------|-----|
| 1 | **HIGH** | `src/infrastructure/tenant/resolver.ts` | — | Every request resolves tenant from DB. No caching on this hot path. | Add `cacheFetch` with 30–60s TTL. |
| 2 | **HIGH** | `src/middleware.ts` | 50 | `supabase.auth.getUser()` called on every request including public routes — network call to Supabase. | Short-circuit for public routes before creating Supabase client. |
| 3 | **HIGH** | `src/infrastructure/cache/upstash.ts` | 52 | `redis.keys()` is O(N) and blocks Redis. Causes latency spikes with many keys. | Replace with `SCAN` iterator. |
| 4 | **MEDIUM** | `src/app/store/[slug]/page.tsx` | 30–45 | Fetches tenant data twice — once for basic fields, once for settings. | Combine into single query. |
| 5 | **MEDIUM** | `src/app/dashboard/_data/queries.ts` | — | No caching on dashboard data. Fresh DB queries every page load. | Add `unstable_cache` for non-real-time metrics. |
| 6 | **MEDIUM** | `src/features/store/section-renderer.tsx` | 68, 93, 120, 133 | Raw `<img>` tags throughout — no `next/image` optimization. | Replace with `next/image`. |
| 7 | **MEDIUM** | `src/components/landing/hero.tsx` | — | Heavy client component: framer-motion + 3 Aceternity UI components loaded eagerly. | Lazy-load below-fold animations. |
| 8 | **LOW** | `src/app/dashboard/page.tsx` | 83 | `<Suspense>` wraps synchronous `EnhancedMetricCard` — boundary is ineffective. | Wrap async data-fetching components instead. |
| 9 | **LOW** | `src/app/dashboard/_data/queries.ts` | 89–99 | `generateSparkline` is O(n×d) — iterates orders N×7 times. | Pre-bucket by date. |
| 10 | **LOW** | `src/infrastructure/services/rate-limiter.ts` | 47 | Custom config limiters never cached — new `Ratelimit` instance per call. | Cache custom config limiters. |

---

## 6. Dead Code & Unused Imports

| File | Line | Item | Action |
|------|------|------|--------|
| `src/features/store/section-renderer.tsx` | 5 | Unused imports: `Mail`, `Input` | Remove |
| `src/features/store/section-registry.ts` | 38 | `hero-video` variant — no renderer implementation | Remove or implement |
| `src/features/store/section-registry.ts` | 47 | `products-featured` variant — no renderer | Remove or implement |
| `src/features/store/section-registry.ts` | 52 | `categories-icons` variant — no renderer | Remove or implement |
| `src/features/store/section-registry.ts` | 57 | `banner-minimal` variant — no renderer | Remove or implement |
| `src/features/store/section-registry.ts` | 61 | `testimonials-single` variant — no renderer | Remove or implement |
| `src/features/store/section-registry.ts` | 64–65 | `footer-columns`, `footer-newsletter` variants — footer handled by layout | Remove |
| `src/infrastructure/services/init.ts` | 42–43 | Empty AI providers and forecast providers sections | Remove placeholders |
| `src/infrastructure/services/factory.ts` | 133 | `clearProviders()` — only used in tests | Keep but document |
| `src/infrastructure/auth/session.ts` | entire | Deprecated re-export shim — 1 consumer remains (`src/app/api/ws/route.ts`) | Migrate consumer, delete file |
| `src/components/landing/hero.tsx` | 120 | "Watch demo" `<Button>` — no `onClick` or `href` | Wire up or remove |
| `src/components/store/store-footer.tsx` | — | `socialLinks` prop accepted but never rendered | Implement or remove prop |

---

## 7. Schema Drift

### Column Name / Structure Mismatches

| Table | Drizzle | SQL | Impact |
|-------|---------|-----|--------|
| `product_variants` | `name` | `title` | Drizzle queries generate `WHERE name = ...` but column is `title` — **queries fail** |
| `order_status_history` | `status`, `note`, `created_by` | `from_status`, `to_status`, `changed_by` | Column mismatch — **queries fail** |
| `carts` | `shipping_address` (text), separate `shipping_city`/`shipping_area`/etc. | `shipping_address` (JSONB), `shipping_method_id`, `discount_codes text[]`, `completed_at`, `metadata` | **Major structural divergence** — Drizzle generates incorrect SQL |

### Missing Columns in Drizzle (exist in SQL)

| Table | Columns | Migration |
|-------|---------|-----------|
| `tenants` | `primary_color`, `secondary_color` | 001 |
| `orders` | `stripe_charge_id` | 015 |
| `carts` | `shipping_method_id`, `discount_codes`, `completed_at`, `metadata` | 006 |
| `cart_items` | `subtotal` (computed), `metadata` | 006 |
| `product_variants` | `requires_shipping`, `is_default`, `metadata` | 013 |

### Default Value Mismatches

| Table | Column | SQL | Drizzle |
|-------|--------|-----|---------|
| `tenants` | `currency` | `'USD'` | `'NPR'` |

### Enum Value Mismatches

| Table | Column | SQL | Drizzle |
|-------|--------|-----|---------|
| `voucher_codes` | `status` | `'disabled'` | `'deactivated'` |

### Type Mismatches

| Table | Column | Drizzle Type | Should Be |
|-------|--------|-------------|-----------|
| `carts` | `customerId` | `text` | `uuid` |
| `block_locks` | `userId` | `text` | `uuid` |
| `editor_sessions` | `userId` | `text` | `uuid` |
| `editor_project_versions` | `tenantId` | `text` | `uuid` |

### Missing UNIQUE Constraints in Drizzle (exist in SQL)

- `products(tenant_id, slug)`
- `categories(tenant_id, slug)`
- `product_variants(tenant_id, sku)`
- `customers(tenant_id, email)`
- `orders(tenant_id, order_number)`
- `cart_items(cart_id, product_id, variant_id)`

---

## 8. Supabase → Drizzle Migration Status

### Data Fetching

| File | Status | Details |
|------|--------|---------|
| `src/app/dashboard/_data/queries.ts` | ✅ Done | Fully Drizzle with `withTenant` |
| `src/app/store/[slug]/layout.tsx` | ✅ Done | Drizzle + `unstable_cache` (raw SQL for `store_layouts`) |
| `src/app/store/[slug]/page.tsx` | ✅ Done | Drizzle + raw SQL |
| `src/app/dashboard/page.tsx` | ⚠️ Mixed | Auth via Supabase, data via Drizzle |
| `src/app/dashboard/layout.tsx` | ❌ Supabase | All 5 queries use Supabase client — **priority migration** |
| `src/components/store/default-homepage.tsx` | ❌ Supabase | Only store component still querying via Supabase — **priority migration** |
| `src/app/dashboard/settings/storefront/actions.ts` | ❌ Supabase | All mutations via Supabase |
| `src/app/dashboard/settings/payments/` (actions) | ❌ Supabase | Mutations via Supabase |

### Type Imports (Supabase types used with Drizzle data)

| File | Line | Import | Fix |
|------|------|--------|-----|
| `src/components/store/store-header.tsx` | 5 | `Tenant`, `Category` from Supabase types | Create shared DTO or use Drizzle `InferSelectModel` |
| `src/components/store/store-footer.tsx` | 1 | `Tenant` from Supabase types | Same |
| `src/components/store/product-card.tsx` | 7 | `Product` from Supabase types | Same |

### SQL Tables Missing Drizzle Schemas (17 tables)

`product_options`, `product_option_values`, `variant_option_values`, `product_tags`, `product_tag_assignments`, `shipping_zones`, `shipping_zone_countries`, `shipping_rates`, `returns`, `return_items`, `store_credits`, `store_credit_transactions`, `events`, `inventory_history`, `workflow_executions`, `exchange_rates`, `store_layouts`

### Drizzle Tables Missing SQL Migrations (9 tables)

`notification_preferences`, `quiet_hours_settings`, `layouts`, `layout_operations`, `block_locks`, `editor_sessions`, `page_templates`, `editor_projects`, `editor_project_versions`

---

## 9. Accessibility Issues

| # | Severity | File | Line | Issue |
|---|----------|------|------|-------|
| 1 | **HIGH** | `src/components/store/product-card.tsx` | 74–84 | Add-to-cart button hidden via `translate-y-full`, only appears on `group-hover`. Keyboard users cannot reach it. |
| 2 | **HIGH** | `src/features/store/section-renderer.tsx` | 82 | Carousel is CSS-only (`overflow-x-auto snap-x`) — no keyboard navigation, no prev/next buttons, no ARIA roles. |
| 3 | **MEDIUM** | `src/app/store/[slug]/checkout/checkout-form.tsx` | 107 | Error alert not linked to form fields via `aria-describedby`. No focus management on error. |
| 4 | **MEDIUM** | `src/components/landing/hero.tsx` | — | Decorative gradient meshes and grid visible to screen readers. Missing `aria-hidden="true"`. |
| 5 | **MEDIUM** | `src/components/store/default-homepage.tsx` | — | Hero background image via inline `backgroundImage` — no alt text or accessible alternative. |
| 6 | **LOW** | `src/components/store/product-card.tsx` | — | Product link has no `aria-label` — screen readers get no context. |
| 7 | **LOW** | `src/components/store/store-footer.tsx` | 14 | Logo `<img>` missing `alt` attribute. |
| 8 | ✅ Good | `src/app/dashboard/layout.tsx` | 59, 79 | Skip-to-content link and `aria-label` on main content area. |
| 9 | ✅ Good | `src/components/store/store-header.tsx` | 63, 72 | `aria-label` on cart and menu buttons. Mobile menu has `SheetTitle`. |

---

## 10. Recommended Fixes

### P0 — Critical (fix before next deploy)

| # | File | Line | Fix | Effort |
|---|------|------|-----|--------|
| 1 | `src/middleware.ts` | 56–57 | Read role from `users` table (server-side query), not `user_metadata`. Remove `"owner"` default — use `"staff"` or deny access. | 2h |
| 2 | `src/infrastructure/payments/nepal-providers.ts` | 12–17 | Replace `db` with `sudoDb` (or `withPlatformAdmin`) in `getTenantPaymentConfig()`. Tenant config is cross-tenant data. | 30m |
| 3 | `src/infrastructure/payments/nepal-providers.ts` | 63 | Pass actual `order.totalAmount` to eSewa `getStatus()` instead of `"0"`. | 30m |
| 4 | `src/app/dashboard/settings/storefront/actions.ts` | 128–130 | Fix `revalidateCacheTag` call — remove `"hours"` arg, pass only the tag string. | 10m |
| 5 | `src/app/dashboard/settings/storefront/actions.ts` | 79 | Wrap `JSON.parse(socialLinks)` in try/catch with fallback to `[]`. | 10m |

### P1 — High (fix this sprint)

| # | File | Line | Fix | Effort |
|---|------|------|-----|--------|
| 6 | `src/infrastructure/services/messaging.ts` | 96 | Change Sparrow SMS URL to HTTPS. Move token from query param to POST body or Authorization header. | 1h |
| 7 | `src/infrastructure/payments/nepal-providers.ts` | 20 | Remove `"EPAYTEST"` fallback. Throw if `ESEWA_MERCHANT_CODE` is missing in production. | 15m |
| 8 | `src/components/store/store-header.tsx` | 37, 42 | Fix snake_case → camelCase: `tenant.logoUrl`, `tenant.primaryColor`. Remove `as any` cast in `store/[slug]/layout.tsx:82-83`. | 1h |
| 9 | `src/components/store/store-footer.tsx` | 14, 18, 38 | Same camelCase fix. Remove dead `/contact` link or create the route. | 1h |
| 10 | Schema drift: `product_variants` | — | Rename Drizzle column `name` → `title` to match SQL, or add migration to rename SQL column. | 1h |
| 11 | Schema drift: `order_status_history` | — | Align Drizzle columns (`status`/`created_by`) with SQL (`from_status`/`to_status`/`changed_by`). | 2h |
| 12 | Schema drift: `carts` | — | Reconcile Drizzle schema with SQL — adopt JSONB `shipping_address`, add missing columns. | 4h |
| 13 | 9 Drizzle-only tables | — | Write SQL migrations for `notification_preferences`, `quiet_hours_settings`, `layouts`, `layout_operations`, `block_locks`, `editor_sessions`, `page_templates`, `editor_projects`, `editor_project_versions`. Add RLS policies. | 4h |

### P2 — Medium (fix this cycle)

| # | File | Line | Fix | Effort |
|---|------|------|-----|--------|
| 14 | `src/middleware.ts` | 18 | Replace CSP `'unsafe-eval'` with nonce-based script loading. | 4h |
| 15 | `src/app/store/[slug]/layout.tsx` | 88 | Sanitize CSS variable values (validate hex color format) before `dangerouslySetInnerHTML`. | 1h |
| 16 | `src/infrastructure/tenant/resolver.ts` | — | Add `cacheFetch` with 30–60s TTL for tenant resolution. | 1h |
| 17 | `src/infrastructure/cache/upstash.ts` | 52 | Replace `redis.keys()` with `SCAN` in `cacheInvalidateTenant`. | 1h |
| 18 | `src/middleware.ts` | 50 | Short-circuit public routes before `supabase.auth.getUser()`. | 1h |
| 19 | `src/app/dashboard/layout.tsx` | 30–55 | Migrate all 5 Supabase queries to Drizzle with `withTenant`. | 3h |
| 20 | `src/components/store/default-homepage.tsx` | 1, 19–33 | Migrate from Supabase client to Drizzle `withTenant`. | 2h |
| 21 | `src/components/store/product-card.tsx` | 74–84 | Make add-to-cart button always visible (or visible on focus). Add `aria-label` to product link. | 1h |
| 22 | `src/features/store/section-renderer.tsx` | 82 | Add keyboard navigation + ARIA roles to carousel. | 2h |
| 23 | `src/components/store/product-card.tsx` | 100 | Replace hardcoded `$` with tenant currency. Same in `section-renderer.tsx:90` (`Rs`) and `checkout-form.tsx:112`. | 1h |
| 24 | `src/components/landing/hero.tsx` | 131 | Replace `₹` with `Rs` or `रू`. | 5m |
| 25 | Drizzle schemas | — | Add missing UNIQUE constraints: `products(tenant_id, slug)`, `customers(tenant_id, email)`, `orders(tenant_id, order_number)`, `product_variants(tenant_id, sku)`, `cart_items(cart_id, product_id, variant_id)`. | 2h |

### P3 — Low (backlog)

| # | File | Fix | Effort |
|---|------|-----|--------|
| 26 | `src/infrastructure/payments/provider.ts:1` | Remove `"use server"` from class-exporting files (also `nepal-providers.ts:1`, `messaging.ts:1`). | 15m |
| 27 | `src/infrastructure/auth/session.ts` | Migrate last consumer (`src/app/api/ws/route.ts`), delete deprecated shim. | 30m |
| 28 | `src/lib/auth.ts:50` | Refactor `authorizedAction` to call `withTenant()` instead of duplicating RLS logic. | 1h |
| 29 | `src/features/store/section-renderer.tsx:5` | Remove unused `Mail`, `Input` imports. | 5m |
| 30 | `src/features/store/section-registry.ts` | Remove 7 unimplemented variants or implement them. | 2–8h |
| 31 | 17 SQL-only tables | Create Drizzle schemas for `product_options`, `shipping_zones`, `returns`, `store_credits`, etc. | 8h |
| 32 | `src/components/landing/hero.tsx:120` | Wire "Watch demo" button to a handler or remove it. | 15m |
| 33 | `src/infrastructure/services/notification-delivery.ts:218` | Add `"whatsapp"` and `"sms"` to default channels array. | 15m |
| 34 | Type mismatches | Fix `carts.customerId` text→uuid, `block_locks.userId` text→uuid, `editor_project_versions.tenantId` text→uuid. | 1h |
| 35 | `src/app/page.tsx:52` | Remove or substantiate `aggregateRating` in JSON-LD (4.8 from 12,000 reviews). | 10m |

---

**Total estimated effort:** ~45–55 hours
**P0 fixes:** ~3.5 hours — do these before the next deploy.
