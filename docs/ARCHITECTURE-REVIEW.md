# Indigo Platform — Architecture Review

**Date:** 2026-04-14 | **Score:** 5.8/10 | **Verdict:** Not production-ready

---

## 1. Executive Summary

Indigo has strong multi-tenancy primitives (RLS via `withTenant()`, provider abstraction, clean feature modules) but is not production-ready and cannot deliver any P0 feature without foundational work. All three P0 features (WhatsApp notifications, COD reconciliation, Nepali i18n) are blocked by missing infrastructure — no messaging provider abstraction, no COD data model, and Nepali locale not configured. Production infrastructure scores 4/10: no error tracking, non-functional rate limiting/caching on Vercel serverless, no log aggregation, and payment providers claimed as "Built" in PRODUCT-DISCOVERY.md do not exist in the codebase.

---

## 2. Architecture Scorecard

| Area | Score | Key Finding |
|---|---|---|
| Multi-tenancy | 8/10 | RLS via `withTenant()` in `src/infrastructure/db.ts:79-100` is correct; dual pool architecture limits sudo blast radius |
| Module structure | 8/10 | Clean domain separation in `src/features/index.ts`; provider abstraction via `src/infrastructure/services/factory.ts` |
| Data model | 7/10 | 22+ tables, good normalization; missing unique constraints, unscoped indexes, no `updatedAt` triggers |
| Security | 6/10 | RLS works but editor-v3 routes are public (`src/middleware.ts:13-20`), no RBAC enforcement, no CSP header |
| Scalability | 5/10 | In-memory rate limiter/cache are no-ops on serverless; N+1 in dashboard; no query pagination |
| Code quality | 5/10 | Dashboard God Component (280 lines, `src/app/dashboard/page.tsx`); mixed Supabase+Drizzle data access; duplicated `withTenant` logic |
| Infrastructure | 4/10 | No Sentry, no APM, no log aggregation, non-functional rate limiting, no automated migrations |
| V1.1 readiness | 3/10 | All 3 P0 features blocked; 3/4 P1 features partially blocked; payment providers don't exist |

---

## 3. Critical Issues

Must fix before any production traffic.

### CI-1: Editor-v3 routes bypass authentication
- **File:** `src/middleware.ts:13-20`
- **Risk:** Unauthenticated users can modify store content via `/editor-v3` and `/api/editor-v3/` routes
- **Fix:** Remove editor routes from public skip list; add tenant ownership + RBAC check (`owner`/`editor` roles only)
- **Effort:** S (2-3 days)

### CI-2: In-memory rate limiter and cache are non-functional on Vercel
- **Files:** `src/infrastructure/services/rate-limiter.ts`, `src/infrastructure/cache/`
- **Risk:** Zero rate limiting in production; zero cache hits; every request hits DB
- **Fix:** Replace with Upstash Redis. Add `@upstash/redis` + `@upstash/ratelimit`
- **Effort:** S (3-4 days)

### CI-3: No error tracking
- **File:** `src/infrastructure/services/error-handler.ts`
- **Risk:** Production errors are invisible — logged to stdout, lost on Vercel
- **Fix:** Add Sentry (`@sentry/nextjs`). Wire into error handler and Next.js `instrumentation.ts`
- **Effort:** S (1-2 days)

### CI-4: Mixed data access creates tenant isolation risk
- **Files:** `src/app/dashboard/page.tsx:120-170` (Supabase client), `src/lib/auth.ts:62-70` (duplicated `withTenant`)
- **Risk:** Supabase client queries rely on manual `.eq("tenant_id", ...)` — one missed filter leaks data across tenants
- **Fix:** Migrate all tenant-scoped queries to Drizzle `withTenant()` from `src/infrastructure/db.ts`. Delete duplicated `authorizedAction` in `src/lib/auth.ts:62-70`
- **Effort:** M (1 week)

### CI-5: No RBAC enforcement in middleware
- **File:** `src/middleware.ts`
- **Risk:** Any authenticated user can access any dashboard route including admin/settings
- **Fix:** Check `role` from `src/lib/auth.ts` against route-level permission map. Gate `/dashboard/settings/*` to `owner`/`admin`
- **Effort:** S (2-3 days)

### CI-6: `withPlatformAdmin()` ungated
- **File:** `src/infrastructure/db.ts:108-125`
- **Risk:** Any server-side code can execute queries with full DB access, no role check, no audit trail
- **Fix:** Add caller role verification + write to `audit_logs` table on every sudo operation
- **Effort:** S (2-3 days)

### CI-7: Missing Content-Security-Policy header
- **File:** `src/middleware.ts:52-54`
- **Risk:** No XSS protection on payment pages — enables payment skimming attacks
- **Fix:** Add CSP header with strict `script-src`, `connect-src` allowlists for payment/analytics domains
- **Effort:** S (1 day)

### CI-8: No database connection pooling for serverless
- **File:** `src/infrastructure/db.ts:28-29`
- **Risk:** `max: 10` per serverless instance × concurrent functions will exhaust Supabase connection limit
- **Fix:** Switch to Supabase connection pooler URL (`pooler.supabase.com:6543`) for the regular client
- **Effort:** S (1 day)

---

## 4. Technical Debt (Ranked by Impact)

| Rank | Item | File/Module | Impact | Effort |
|---|---|---|---|---|
| 1 | Replace in-memory rate limiter + cache with Upstash Redis | `src/infrastructure/services/rate-limiter.ts`, `src/infrastructure/cache/` | Blocks all API protection + storefront performance | S |
| 2 | Unify data access on Drizzle `withTenant()` | `src/app/dashboard/page.tsx`, `src/lib/auth.ts:62-70` | Prevents tenant data leaks; must standardize before adding COD/notification queries | M |
| 3 | Fix unscoped indexes + add unique constraints | `src/db/schema/orders.ts:56-57`, `src/db/schema/customers.ts:28` | `(tenant_id, payment_status, created_at)` composite needed for COD reconciliation; `(tenant_id, email)` unique prevents duplicate customers | S |
| 4 | Add ISR/caching to storefront | `src/app/store/[slug]/layout.tsx`, `src/app/store/[slug]/page.tsx` | 3-4 uncached DB queries per page load; Nepal 3G/4G users get 3-5s load times | M |
| 5 | Decompose dashboard God Component | `src/app/dashboard/page.tsx` (280 lines, 10 queries) | Blocks mobile dashboard (P1); has N+1 and no-pagination issues | M |
| 6 | Fix ServiceFactory init race condition | `src/infrastructure/services/factory.ts` | Static Maps start empty; no lazy-init fallback; blocks adding WhatsApp/SMS/catalog providers | S |
| 7 | Add `updatedAt` database triggers | All tables in `src/db/schema/` | COD reconciliation + order tracking depend on accurate timestamps; currently stays at creation time | S |
| 8 | Fix payment provider singleton | `src/infrastructure/payments/provider.ts:60-61` | Mutable module variable resets on cold start; must use ServiceFactory before adding eSewa/Khalti | S |

---

## 5. V1.1 Readiness Assessment

**Verdict: Cannot build P0/P1 features on current architecture without foundational fixes.**

### P0 Features — All BLOCKED

| Feature | Status | Blocker |
|---|---|---|
| WhatsApp notifications | 🔴 BLOCKED | No `MessagingProvider` in `src/infrastructure/providers/types.ts`; `notification-delivery.ts` only supports `in_app`/`email`; no Inngest function for WhatsApp |
| COD reconciliation | 🔴 BLOCKED | No `cod_collections`/`delivery_attempts` tables; payment provider singleton resets on cold start; no Inngest job for COD tracking |
| Nepali i18n | 🔴 BLOCKED | `src/shared/i18n/config.ts` has no `ne` locale; no `ne.json` dictionary; no NPR currency mapping |

### P1 Features — 3/4 Partially Blocked

| Feature | Status | Blocker |
|---|---|---|
| FB/Instagram catalog sync | 🟡 No foundation | No `CatalogSyncProvider` in ServiceFactory; no Inngest job |
| SMS (Sparrow SMS) | 🟡 No foundation | Same gap as WhatsApp — no `SMSProvider`, no messaging channel |
| Store themes | 🟡 Security blocker | Editor-v3 routes are public (`src/middleware.ts:13-20`) |
| Mobile dashboard | 🟡 Needs refactor | Dashboard God Component blocks mobile layout; nav touch targets 32px < 44px minimum |

### P2 Features

| Feature | Status |
|---|---|
| SEO tools | 🟡 Needs storefront caching + `generateMetadata` first |
| Discount engine | 🟢 Mostly ready — schema and feature module exist |

### ⚠️ Payment Providers: Immediate Investigation Required

PRODUCT-DISCOVERY.md claims eSewa, Khalti, IME Pay, ConnectIPS, Visa/Mastercard are "✅ Built". Audit found only `ManualPaymentProvider` in `src/infrastructure/payments/provider.ts`. If these don't exist elsewhere, the entire platform is blocked — not just V1.1.

---

## 6. Recommended Changes

### RC-1: Add MessagingProvider to ServiceFactory [M — 2 weeks]
```
src/infrastructure/providers/types.ts    → Add MessagingProvider interface
src/infrastructure/notification-delivery.ts → Add 'whatsapp' | 'sms' to NotificationChannel
src/inngest/functions/send-whatsapp.ts   → New: async delivery with retry
src/inngest/functions/send-sms.ts        → New: async delivery with retry
src/inngest/functions/process-cod.ts     → New: COD status polling/webhook
```

### RC-2: Add Nepali locale [S config + M translation — 3 weeks total]
```
src/shared/i18n/config.ts  → Add 'ne' to locales, 'नेपाली' to localeNames, 'NPR' to localeCurrency
src/shared/i18n/dictionaries/ne.json → New: full translation file
```
Add Nepali number formatting and "रू 1,500" NPR display format.

### RC-3: Add COD reconciliation data model [M — 2-3 weeks]
```
src/db/schema/cod.ts → New: cod_collections (order_id, collected_amount, collected_at, collector, status)
src/db/schema/cod.ts → New: delivery_attempts (order_id, attempt_number, status, timestamp)
src/infrastructure/payments/provider.ts → Refactor singleton to ServiceFactory pattern
```

### RC-4: Decompose dashboard [M — 1 week]
```
src/app/dashboard/_data/queries.ts           → Extract all 10 queries; use SQL aggregation
src/app/dashboard/_components/metrics.tsx     → Server component
src/app/dashboard/_components/revenue-chart.tsx → Server component
src/app/dashboard/_components/activity-feed.tsx → Server component
src/app/dashboard/page.tsx                    → Composition only, <50 lines
```

### RC-5: Add caching layer [M — 1 week]
```
src/infrastructure/cache/upstash.ts      → Upstash Redis client
src/infrastructure/cache/tenant-cache.ts → Tenant-scoped keys + revalidation tags
src/app/store/[slug]/layout.tsx          → Wrap tenant/categories in unstable_cache()
```
Target: 0 DB queries on cache hit, <100ms TTFB. Revalidate via `revalidateTag(`tenant:${id}`)` on mutations.

### RC-6: Secure editor-v3 routes [S — 2-3 days]
```
src/middleware.ts:13-20 → Remove /editor-v3 and /api/editor-v3/ from public skip list
src/app/editor-v3/      → Add tenant ownership verification + RBAC (owner/editor roles)
```

### RC-7: Unify data access [M — 1 week]
Migrate all `supabase.from()` calls in `src/app/dashboard/` to `withTenant()` from `src/infrastructure/db.ts`. Delete duplicated `authorizedAction` in `src/lib/auth.ts:62-70`.

### RC-8: Fix ServiceFactory initialization [S — 2 days]
```
src/infrastructure/services/factory.ts → Add lazy-init fallback per provider type
src/infrastructure/services/init.ts    → Ensure import in instrumentation.ts or root layout
```

---

## 7. Infrastructure Checklist

### Launch Blockers

- [ ] Sentry error tracking — `@sentry/nextjs` in `instrumentation.ts`
- [ ] Upstash Redis — replace `src/infrastructure/services/rate-limiter.ts` and `src/infrastructure/cache/`
- [ ] Supabase connection pooler — switch `src/infrastructure/db.ts:28` to `pooler.supabase.com:6543`
- [ ] CSP header — add to `src/middleware.ts:52-54`
- [ ] RBAC in middleware — gate dashboard routes by role in `src/middleware.ts`
- [ ] Audit logging on `withPlatformAdmin()` — `src/infrastructure/db.ts:108-125`
- [ ] Automated Drizzle migrations in CI/CD — replace manual `scripts/supabase/` SQL

### Within 2 Weeks of Launch

- [ ] Structured logging — Axiom or Datadog; replace stdout-only `createLogger()`
- [ ] APM — connect OpenTelemetry exporter (already initialized in `src/infrastructure/db.ts`, goes nowhere)
- [ ] Deep health checks — DB, Supabase Auth, S3, payment gateways, WhatsApp API, Sparrow SMS
- [ ] DB-backed feature flags — replace code-defined flags in `src/infrastructure/feature-flags/`
- [ ] Database backup verification — confirm Supabase PITR; test restore

### Month 1

- [ ] CSRF protection on server actions — origin checking on checkout/editor mutations
- [ ] Customer password hashing audit — verify bcrypt/argon2 for `src/db/schema/customers.ts:14`
- [ ] JSONB CHECK constraints — `settings` in `src/db/schema/tenants.ts:72`, `shipping_address` in `src/db/schema/orders.ts:36-37`

---

## 8. Data Model Recommendations

| # | Issue | File | Fix | Effort |
|---|---|---|---|---|
| 1 | `(tenant_id, email)` not unique for customers | `src/db/schema/customers.ts:28` | Add unique constraint; prevents duplicate accounts, critical for WhatsApp/SMS delivery | S |
| 2 | `paymentStatusIdx` not tenant-scoped | `src/db/schema/orders.ts:56` | Replace with composite `(tenant_id, payment_status, created_at)` | S |
| 3 | `fulfillmentStatusIdx` not tenant-scoped | `src/db/schema/orders.ts:57` | Replace with composite `(tenant_id, fulfillment_status, created_at)` | S |
| 4 | No `updatedAt` trigger | All tables in `src/db/schema/` | Add PostgreSQL trigger: `CREATE TRIGGER set_updated_at BEFORE UPDATE ... SET NEW.updated_at = NOW()` | S |
| 5 | Categories `parentId` has no FK | `src/db/schema/products.ts:18` | Add `.references(() => categories.id)` with `ON DELETE SET NULL` | S |
| 6 | Decimal prices returned as strings | `src/db/schema/products.ts:36` | Standardize with a `toMoney()` utility; stop using `Number(o.total)` in `src/app/dashboard/page.tsx` | S |
| 7 | Order addresses untyped JSONB | `src/db/schema/orders.ts:36-37` | Add TypeScript type annotation + Zod validation on write path | S |
| 8 | Missing COD tables | N/A | Add `cod_collections` and `delivery_attempts` tables for V1.1 | M |

---

## 9. Security Hardening

| Priority | Issue | File | Action |
|---|---|---|---|
| P0 | Editor-v3 routes public | `src/middleware.ts:13-20` | Remove from public skip list; add auth + tenant ownership check |
| P0 | No RBAC enforcement | `src/middleware.ts` | Add role-based route gating; map routes → required roles |
| P0 | `withPlatformAdmin()` ungated | `src/infrastructure/db.ts:108-125` | Add role verification + audit log entry on every call |
| P0 | No CSP header | `src/middleware.ts:52-54` | Add `Content-Security-Policy` with strict allowlists for payment/analytics domains |
| P1 | Duplicated tenant isolation logic | `src/lib/auth.ts:62-70` | Delete `authorizedAction`; use `withTenant()` from `db.ts` exclusively |
| P1 | Manual `.eq("tenant_id")` in dashboard | `src/app/dashboard/page.tsx:120-170` | Migrate to `withTenant()` — eliminates forgotten-filter class of bugs |
| P2 | No CSRF on server actions | `src/app/store/[slug]/checkout/actions.ts` | Add origin header validation or token-based CSRF protection |
| P2 | Customer `passwordHash` field | `src/db/schema/customers.ts:14` | Audit hashing algorithm; if using Supabase Auth for customers, remove field |
| P2 | JSONB columns unvalidated | `src/db/schema/tenants.ts:72`, `src/db/schema/orders.ts:36-37` | Add PostgreSQL CHECK constraints for required keys |

---

## 10. Performance Optimization

| Priority | Issue | File | Fix | Expected Impact |
|---|---|---|---|---|
| P0 | Storefront: 3-4 uncached DB queries per page | `src/app/store/[slug]/layout.tsx`, `page.tsx` | Wrap in `unstable_cache()` with tenant-scoped tags; `revalidateTag()` on mutations | 0 DB queries on cache hit; TTFB < 100ms |
| P0 | Store layout: 3 sequential DB calls | `src/app/store/[slug]/layout.tsx:20-45` | Restructure to `Promise.all([tenant, categories, cart, layouts])` | ~60% faster layout resolution |
| P0 | Dashboard: N+1 aggregation in JS | `src/app/dashboard/page.tsx:175-210` | Move to SQL: `GROUP BY date`, `SUM(total)` in `_data/queries.ts` | Orders of magnitude faster at scale |
| P0 | Dashboard: no pagination on order queries | `src/app/dashboard/page.tsx:130-140` | Add `.limit(1000)` + SQL aggregation; paginate activity feed | Prevents OOM at 10K+ orders/month |
| P1 | Tenant settings fetched on every storefront request | `src/app/store/[slug]/layout.tsx:22-25` | Cache with `unstable_cache()`, 5-min TTL, revalidate on settings change | Eliminates most frequent query |
| P1 | No composite indexes for dashboard queries | `src/db/schema/orders.ts` | Add `(tenant_id, payment_status, created_at)` composite index | 10-100x faster revenue/COD queries |
| P2 | In-memory cache zero hits on serverless | `src/infrastructure/cache/` | Replace with Upstash Redis | Actual cache hits across function instances |

---

## Execution Sequence

**Week 1-2: Foundation** — Upstash Redis, Sentry, secure editor-v3, fix ServiceFactory + payment singleton, add `ne` locale config, connection pooler, CSP header, RBAC middleware

**Week 3-4: P0 foundations** — MessagingProvider interface + WhatsApp API, COD schema + Inngest jobs, unify on `withTenant()`, fix indexes + constraints, `updatedAt` triggers

**Week 5-6: P0 completion** — Nepali translations QA, WhatsApp e2e delivery, COD reconciliation dashboard, decompose dashboard God Component

**Week 7-8: P1 features** — Sparrow SMS, mobile dashboard, storefront ISR/caching, store themes

---

*Reviewed by: Staff Engineering — 2026-04-14*
