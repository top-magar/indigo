# System Architecture Document
## Multitenant SaaS E-Commerce Platform

**Version:** 1.0  
**Date:** January 2025  
**Author:** System Architect Agent  
**Status:** Draft for Review  
**Confidence Score:** 0.89

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Multitenancy Strategy](#2-multitenancy-strategy)
3. [System Components](#3-system-components)
4. [API Boundaries](#4-api-boundaries)
5. [Data Model](#5-data-model)
6. [Security Considerations](#6-security-considerations)
7. [Scalability Analysis](#7-scalability-analysis)
8. [Trade-offs](#8-trade-offs)
9. [Feature Mapping](#9-feature-mapping)
10. [JSON Summary](#10-json-summary)

---

## 1. Architecture Overview

### 1.1 Summary

This architecture implements a **shared-database, shared-schema multitenancy model** with PostgreSQL Row-Level Security (RLS) as the primary isolation mechanism. The system uses Next.js 16 as a full-stack framework with server components for optimal performance, Supabase/PostgreSQL for data persistence with RLS enforcement, and Stripe Connect for multi-merchant payment processing. Tenant resolution occurs at the edge via URL slug matching, with tenant context propagated through JWT claims and database session variables.

### 1.2 Component Diagram (Text Description)


```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET / CDN                                      │
│                         (Vercel Edge Network)                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
        ┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
        │   Storefront      │ │   Dashboard   │ │   Public API      │
        │   /store/[slug]   │ │   /dashboard  │ │   /api/store/*    │
        │   (Shopper)       │ │   (Merchant)  │ │   (Integrations)  │
        └─────────┬─────────┘ └───────┬───────┘ └─────────┬─────────┘
                  │                   │                   │
                  └───────────────────┼───────────────────┘
                                      │
                    ┌─────────────────▼─────────────────┐
                    │        TENANT RESOLUTION          │
                    │   (Middleware + Layout Context)   │
                    │   - URL slug → tenant_id          │
                    │   - JWT validation                │
                    │   - Session tenant binding        │
                    └─────────────────┬─────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌─────────────────┐           ┌───────────────┐
│  Server       │           │   Server        │           │   External    │
│  Actions      │           │   Components    │           │   Services    │
│  (Mutations)  │           │   (Queries)     │           │               │
└───────┬───────┘           └────────┬────────┘           │  - Stripe     │
        │                            │                    │  - Resend     │
        └────────────────────────────┤                    │  - Vercel     │
                                     │                    │    Blob       │
                    ┌────────────────▼────────────────┐   └───────┬───────┘
                    │         DATA ACCESS LAYER       │           │
                    │   withTenant(tenantId, tx => {  │           │
                    │     // RLS context set          │           │
                    │   })                            │           │
                    └────────────────┬────────────────┘           │
                                     │                            │
                    ┌────────────────▼────────────────┐           │
                    │         PostgreSQL + RLS        │◄──────────┘
                    │   - Shared schema               │
                    │   - tenant_id on all tables     │
                    │   - RLS policies enforced       │
                    └─────────────────────────────────┘
```

### 1.3 Key Architectural Decisions

| Decision | Choice | Rationale | Confidence | Alternatives Considered |
|----------|--------|-----------|------------|------------------------|
| **Isolation Model** | Shared DB + RLS | Cost-effective for MVP, 2-engineer team, sufficient isolation | 0.92 | Schema-per-tenant (rejected: migration complexity), DB-per-tenant (rejected: cost) |
| **Tenant Resolution** | URL Slug in Path | SEO-friendly, no DNS complexity, works with free tier | 0.88 | Subdomain (future), Custom domain (post-MVP) |
| **Framework** | Next.js 16 App Router | Server components, streaming, existing codebase | 0.95 | Remix (rejected: migration cost) |
| **Database** | PostgreSQL (Supabase) | RLS support, managed service, existing setup | 0.94 | PlanetScale (rejected: no RLS) |
| **Auth** | NextAuth v5 + JWT | Tenant claim in token, stateless, existing setup | 0.90 | Supabase Auth (considered for future) |
| **Payments** | Stripe Connect | Multi-merchant support, mature API | 0.93 | PayPal (rejected: worse DX) |
| **File Storage** | Vercel Blob | Integrated, tenant-scoped paths | 0.85 | Supabase Storage (alternative) |

---

## 2. Multitenancy Strategy

### 2.1 Isolation Model: Shared Database with Row-Level Security

**Choice:** Single PostgreSQL database with shared schema, tenant isolation via RLS policies.

**Justification:**
- **Cost Efficiency:** Single database instance, no per-tenant infrastructure overhead
- **Operational Simplicity:** One schema to migrate, one connection pool to manage
- **Team Capacity:** 2 engineers can maintain without DevOps complexity
- **Sufficient Isolation:** RLS provides strong data isolation at the database level
- **Existing Implementation:** Current codebase already uses this pattern

**Trade-offs Accepted:**
- Noisy neighbor risk (mitigated by connection pooling, query timeouts)
- Single point of failure (mitigated by managed service HA)
- Schema changes affect all tenants (mitigated by careful migrations)

### 2.2 Tenant Resolution Flow


```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TENANT RESOLUTION MATRIX                             │
├─────────────────┬───────────────────┬───────────────────┬───────────────────┤
│ Context         │ Resolution Method │ Tenant Source     │ Validation        │
├─────────────────┼───────────────────┼───────────────────┼───────────────────┤
│ Storefront      │ URL Path Slug     │ /store/[slug]/*   │ DB lookup         │
│ Dashboard       │ JWT Claim         │ session.tenantId  │ Auth middleware   │
│ Public API      │ URL Path Slug     │ /api/store/[slug] │ DB lookup         │
│ Server Actions  │ JWT Claim         │ auth() session    │ Auth + RLS        │
│ Webhooks        │ Payload + Secret  │ Stripe metadata   │ Signature verify  │
└─────────────────┴───────────────────┴───────────────────┴───────────────────┘
```

#### 2.2.1 Storefront Resolution (Shopper Context)

```typescript
// src/app/store/[slug]/layout.tsx
export default async function StoreLayout({ params }) {
  const { slug } = await params;
  
  // 1. Resolve tenant from URL slug
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug)
  });
  
  if (!tenant) notFound(); // 404, never leak other tenant data
  
  // 2. Provide tenant context to children
  return (
    <TenantProvider tenantId={tenant.id}>
      {children}
    </TenantProvider>
  );
}
```

#### 2.2.2 Dashboard Resolution (Merchant Context)

```typescript
// src/middleware.ts
export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  if (pathname.startsWith('/dashboard')) {
    // Tenant ID comes from JWT, not URL
    const tenantId = req.auth?.user?.tenantId;
    if (!tenantId) {
      return NextResponse.redirect('/login');
    }
    // Tenant context available via auth() in server components
  }
});
```

### 2.3 Data Isolation Enforcement Points

| Layer | Enforcement Mechanism | Failure Mode |
|-------|----------------------|--------------|
| **URL Routing** | Slug validation in layout | 404 Not Found |
| **Authentication** | JWT tenant claim validation | 401 Unauthorized |
| **API Gateway** | Middleware tenant extraction | 403 Forbidden |
| **Data Access** | `withTenant()` wrapper | Transaction rollback |
| **Database** | RLS policies | Query returns empty |
| **File Storage** | Tenant-prefixed paths | 403 Access Denied |

### 2.4 RLS Policy Pattern

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their tenant's data
CREATE POLICY tenant_isolation ON products
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Application sets context before queries
SELECT set_config('app.current_tenant', $tenant_id, true);
```

**Critical Rule:** The `withTenant()` function MUST be used for all database operations:

```typescript
// CORRECT: Tenant context set via transaction
await withTenant(tenantId, async (tx) => {
  return tx.select().from(products); // RLS filters automatically
});

// WRONG: Never trust client-provided tenant_id
const products = await db.select().from(products)
  .where(eq(products.tenantId, req.body.tenantId)); // SECURITY VIOLATION
```

---

## 3. System Components

### 3.1 Frontend Layer

#### 3.1.1 Storefront Application

| Attribute | Value |
|-----------|-------|
| **Name** | Storefront |
| **Responsibility** | Public-facing store for shoppers |
| **Technology** | Next.js 16 App Router, React Server Components |
| **Tenant Awareness** | URL slug resolution, TenantProvider context |
| **Routes** | `/store/[slug]/*` |
| **Scaling Strategy** | Edge caching, ISR for product pages |

**Key Features:**
- Server-rendered product pages for SEO
- Client-side cart management with optimistic updates
- Streaming for checkout flow
- Mobile-first responsive design

#### 3.1.2 Merchant Dashboard

| Attribute | Value |
|-----------|-------|
| **Name** | Dashboard |
| **Responsibility** | Merchant store management |
| **Technology** | Next.js 16, React Server Components, TanStack Table |
| **Tenant Awareness** | JWT session, auth() helper |
| **Routes** | `/dashboard/*` |
| **Scaling Strategy** | Stateless, session-based auth |

**Key Features:**
- Product CRUD with image upload
- Order management with status workflow
- Visual store editor (inline, no iframe)
- Analytics dashboard (P2)


#### 3.1.3 Visual Store Editor

| Attribute | Value |
|-----------|-------|
| **Name** | Visual Editor |
| **Responsibility** | WYSIWYG store customization |
| **Technology** | React, Zustand, DnD Kit |
| **Tenant Awareness** | Inherits from Dashboard session |
| **Routes** | `/storefront/*` (editor routes) |
| **Scaling Strategy** | Client-side state, server persistence |

**Key Features:**
- Inline editing (no iframe preview)
- Block-based layout system
- Real-time preview (<100ms updates)
- Template system with presets

### 3.2 Backend Layer

#### 3.2.1 Server Actions

| Attribute | Value |
|-----------|-------|
| **Name** | Server Actions |
| **Responsibility** | Mutations (create, update, delete) |
| **Technology** | Next.js Server Actions |
| **Tenant Awareness** | `auth()` session extraction |
| **Interfaces** | Form submissions, client invocations |
| **Scaling Strategy** | Stateless, serverless functions |

**Pattern:**
```typescript
// src/app/dashboard/products/actions.ts
"use server"

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");
  
  return withTenant(session.user.tenantId, async (tx) => {
    return tx.insert(products).values({
      tenantId: session.user.tenantId, // Explicit, matches RLS
      name: formData.get("name"),
      // ...
    });
  });
}
```

#### 3.2.2 API Routes

| Attribute | Value |
|-----------|-------|
| **Name** | API Routes |
| **Responsibility** | Public API for integrations, webhooks |
| **Technology** | Next.js Route Handlers |
| **Tenant Awareness** | URL slug or webhook signature |
| **Interfaces** | REST endpoints |
| **Scaling Strategy** | Edge runtime where possible |

**Endpoints:**
- `/api/store/[slug]/products` - Public product listing
- `/api/store/[slug]/cart` - Cart operations
- `/api/webhooks/stripe` - Payment webhooks

### 3.3 Data Layer

#### 3.3.1 PostgreSQL Database

| Attribute | Value |
|-----------|-------|
| **Name** | Primary Database |
| **Responsibility** | Persistent data storage |
| **Technology** | PostgreSQL 15+ (Supabase) |
| **Tenant Awareness** | RLS policies, session variables |
| **Interfaces** | Drizzle ORM |
| **Scaling Strategy** | Connection pooling, read replicas |

**Configuration:**
- Connection pooling via PgBouncer (Supabase)
- RLS enabled on all tenant-scoped tables
- Indexes on `tenant_id` + common query columns

#### 3.3.2 File Storage

| Attribute | Value |
|-----------|-------|
| **Name** | Blob Storage |
| **Responsibility** | Product images, store assets |
| **Technology** | Vercel Blob |
| **Tenant Awareness** | Path prefix: `/{tenant_id}/products/` |
| **Interfaces** | Vercel Blob SDK |
| **Scaling Strategy** | CDN-backed, automatic |

**Path Convention:**
```
/{tenant_id}/
  ├── products/
  │   └── {product_id}/
  │       ├── main.jpg
  │       └── gallery-{n}.jpg
  ├── store/
  │   ├── logo.png
  │   └── favicon.ico
  └── editor/
      └── blocks/
          └── {block_id}.json
```

### 3.4 External Services

#### 3.4.1 Stripe Connect

| Attribute | Value |
|-----------|-------|
| **Name** | Payment Processing |
| **Responsibility** | Multi-merchant payments |
| **Technology** | Stripe Connect (Standard) |
| **Tenant Awareness** | Connected account per tenant |
| **Interfaces** | Stripe SDK, Webhooks |

**Flow:**
1. Merchant onboards via Stripe Connect OAuth
2. Platform stores `stripe_account_id` in tenant record
3. Checkout creates PaymentIntent with `transfer_data.destination`
4. Funds flow: Customer → Platform → Merchant (minus fees)

#### 3.4.2 Email Service

| Attribute | Value |
|-----------|-------|
| **Name** | Transactional Email |
| **Responsibility** | Order confirmations, notifications |
| **Technology** | Resend |
| **Tenant Awareness** | From address per tenant (future) |
| **Interfaces** | Resend SDK |

---

## 4. API Boundaries

### 4.1 Storefront API (Public)

| Method | Path | Tenant Context | Description |
|--------|------|----------------|-------------|
| GET | `/api/store/[slug]/products` | URL slug | List active products |
| GET | `/api/store/[slug]/products/[id]` | URL slug | Get product details |
| GET | `/api/store/[slug]/categories` | URL slug | List categories |
| POST | `/api/store/[slug]/cart` | URL slug + cookie | Create/get cart |
| PUT | `/api/store/[slug]/cart/items` | URL slug + cookie | Add/update cart item |
| DELETE | `/api/store/[slug]/cart/items/[id]` | URL slug + cookie | Remove cart item |
| POST | `/api/store/[slug]/checkout` | URL slug + cookie | Create checkout session |


### 4.2 Dashboard API (Authenticated)

| Method | Path | Tenant Context | Description |
|--------|------|----------------|-------------|
| GET | `/api/dashboard/products` | JWT claim | List merchant's products |
| POST | `/api/dashboard/products` | JWT claim | Create product |
| PUT | `/api/dashboard/products/[id]` | JWT claim | Update product |
| DELETE | `/api/dashboard/products/[id]` | JWT claim | Delete product |
| GET | `/api/dashboard/orders` | JWT claim | List orders |
| PUT | `/api/dashboard/orders/[id]/status` | JWT claim | Update order status |
| POST | `/api/dashboard/upload` | JWT claim | Upload file to tenant path |

### 4.3 Webhook Endpoints

| Method | Path | Validation | Description |
|--------|------|------------|-------------|
| POST | `/api/webhooks/stripe` | Signature | Payment events |
| POST | `/api/webhooks/resend` | Signature | Email delivery events |

### 4.4 Request/Response Patterns

#### 4.4.1 Tenant Context Extraction

```typescript
// Storefront: Extract from URL
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  // Use tenant.id for all queries
  const products = await withTenant(tenant.id, async (tx) => {
    return tx.select().from(products).where(eq(products.status, "active"));
  });
  
  return NextResponse.json(products);
}

// Dashboard: Extract from JWT
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const products = await withTenant(session.user.tenantId, async (tx) => {
    return tx.select().from(products);
  });
  
  return NextResponse.json(products);
}
```

#### 4.4.2 Error Response Format

```typescript
interface ApiError {
  error: string;
  code: string;
  details?: Record<string, string[]>;
}

// Examples:
{ "error": "Not found", "code": "TENANT_NOT_FOUND" }
{ "error": "Unauthorized", "code": "INVALID_SESSION" }
{ "error": "Validation failed", "code": "VALIDATION_ERROR", "details": { "name": ["Required"] } }
```

---

## 5. Data Model

### 5.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TENANT BOUNDARY                                 │
│  ┌─────────────┐                                                            │
│  │   tenants   │ ◄─────────────────────────────────────────────────────┐    │
│  │─────────────│                                                       │    │
│  │ id (PK)     │                                                       │    │
│  │ name        │                                                       │    │
│  │ slug (UQ)   │                                                       │    │
│  │ stripe_id   │                                                       │    │
│  │ settings    │                                                       │    │
│  └──────┬──────┘                                                       │    │
│         │                                                              │    │
│         │ 1:N                                                          │    │
│         ▼                                                              │    │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐            │    │
│  │    users    │      │  products   │      │   orders    │            │    │
│  │─────────────│      │─────────────│      │─────────────│            │    │
│  │ id (PK)     │      │ id (PK)     │      │ id (PK)     │            │    │
│  │ tenant_id   │──┐   │ tenant_id   │──┐   │ tenant_id   │────────────┘    │
│  │ email (UQ)  │  │   │ name        │  │   │ status      │                 │
│  │ password    │  │   │ slug        │  │   │ total       │                 │
│  │ role        │  │   │ price       │  │   │ customer_*  │                 │
│  └─────────────┘  │   │ quantity    │  │   └──────┬──────┘                 │
│                   │   │ status      │  │          │                        │
│                   │   │ category_id │  │          │ 1:N                    │
│                   │   └──────┬──────┘  │          ▼                        │
│                   │          │         │   ┌─────────────┐                 │
│                   │          │ 1:N     │   │ order_items │                 │
│                   │          ▼         │   │─────────────│                 │
│                   │   ┌─────────────┐  │   │ id (PK)     │                 │
│                   │   │  variants   │  │   │ tenant_id   │─────────────────┘
│                   │   │─────────────│  │   │ order_id    │
│                   │   │ id (PK)     │  │   │ variant_id  │
│                   │   │ tenant_id   │──┘   │ quantity    │
│                   │   │ product_id  │      │ price       │
│                   │   │ sku         │      └─────────────┘
│                   │   │ price       │
│                   │   │ quantity    │◄── Inventory on variant
│                   │   └──────┬──────┘
│                   │          │
│                   │          │ 1:N (audit trail)
│                   │          ▼
│                   │   ┌─────────────────┐   ┌─────────────┐
│                   │   │ stock_movements │   │    carts    │
│                   │   │─────────────────│   │─────────────│
│                   │   │ id (PK)         │   │ id (PK)     │
│                   │   │ tenant_id       │   │ tenant_id   │
│                   │   │ product_id      │   │ customer_id │
│                   │   │ type            │   │ status      │
│                   │   │ quantity_change │   │ total       │
│                   │   │ reason          │   └──────┬──────┘
│                   │   └─────────────────┘          │
│                   │                                │ 1:N
│                   │                                ▼
│                   │                         ┌─────────────┐
│                   │                         │ cart_items  │
│                   │                         │─────────────│
│                   │                         │ id (PK)     │
│                   └─────────────────────────│ cart_id     │
│                                             │ product_id  │
│                                             │ variant_id  │
│                                             │ quantity    │
│                                             └─────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
```

**Inventory Model:**
- `products.quantity` - Stock count for simple products
- `product_variants.quantity` - Stock count for variant-based products
- `stock_movements` - Audit trail for all inventory changes (add, remove, sale, return, etc.)


### 5.2 Core Entities

#### 5.2.1 Tenants (Platform-Level)

```typescript
// src/db/schema/tenants.ts
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  currency: text("currency").default("USD"),
  logoUrl: text("logo_url"),
  plan: text("plan").default("free").notNull(),
  stripeAccountId: text("stripe_account_id"), // Stripe Connect
  stripeOnboardingComplete: boolean("stripe_onboarding_complete").default(false),
  settings: jsonb("settings").default({}).$type<TenantSettings>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Note: tenants table does NOT have tenant_id - it IS the tenant
// RLS policy: Only platform admins can query all tenants
```

#### 5.2.2 Users (Tenant-Scoped)

```typescript
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("owner").notNull(), // owner, admin, staff
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RLS: Users can only see users in their tenant
```

#### 5.2.3 Products (Tenant-Scoped)

```typescript
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  compareAtPrice: text("compare_at_price"),
  images: jsonb("images").default([]).$type<string[]>(),
  status: text("status").default("draft").notNull(), // draft, active, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantSlugIdx: index("products_tenant_slug_idx").on(table.tenantId, table.slug),
  statusIdx: index("products_status_idx").on(table.status),
}));

// RLS: Merchants see all their products, shoppers see only active
```

#### 5.2.4 Orders (Tenant-Scoped)

```typescript
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  status: text("status").default("pending").notNull(),
  // pending → processing → shipped → delivered | cancelled | refunded
  totalAmount: text("total_amount").notNull(),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address"),
  shippingCity: text("shipping_city"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 5.3 RLS Policy Definitions

```sql
-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Standard tenant isolation policy (template)
CREATE POLICY tenant_isolation_policy ON products
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Repeat for all tenant-scoped tables...

-- Special policy for tenants table (platform admin only)
CREATE POLICY tenants_admin_policy ON tenants
  FOR ALL
  USING (
    current_setting('app.is_platform_admin', true)::boolean = true
    OR id = current_setting('app.current_tenant', true)::uuid
  );
```

**Note:** Inventory is tracked at multiple levels:
- `products.quantity` - Aggregate stock for simple products
- `product_variants.quantity` - Stock per variant
- `inventory_levels` - Location-based inventory for multi-warehouse support
- `stock_movements` - Audit trail for all inventory changes

### 5.4 Index Strategy

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| products | tenant_slug_idx | (tenant_id, slug) | Product lookup by slug |
| products | status_idx | (status) | Filter active products |
| orders | tenant_created_idx | (tenant_id, created_at DESC) | Order listing |
| order_items | order_idx | (order_id) | Order details |
| carts | tenant_customer_idx | (tenant_id, customer_id) | Cart retrieval |
| categories | tenant_slug_idx | (tenant_id, slug) | Category lookup |

---

## 6. Security Considerations

### 6.1 Threat Model

| Threat | Severity | Attack Vector | Mitigation |
|--------|----------|---------------|------------|
| **T001: Cross-Tenant Data Access** | CRITICAL | Manipulated tenant_id in request | RLS policies, never trust client tenant_id |
| **T002: JWT Token Theft** | HIGH | XSS, session hijacking | HttpOnly cookies, short expiry, CSRF tokens |
| **T003: SQL Injection** | HIGH | Malformed input | Parameterized queries (Drizzle ORM) |
| **T004: Privilege Escalation** | HIGH | Role manipulation | Server-side role validation |
| **T005: Payment Fraud** | HIGH | Manipulated amounts | Server-side price calculation |
| **T006: File Upload Attacks** | MEDIUM | Malicious files | File type validation, virus scanning |
| **T007: Rate Limiting Bypass** | MEDIUM | Distributed attacks | Edge rate limiting, CAPTCHA |
| **T008: Enumeration Attacks** | LOW | Slug guessing | Rate limiting, no existence hints |


### 6.2 Security Controls

#### 6.2.1 Authentication & Authorization

```typescript
// Middleware: Protect dashboard routes
export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Dashboard requires authentication
  if (pathname.startsWith('/dashboard')) {
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Verify tenant claim exists
    if (!req.auth.user.tenantId) {
      console.error('User without tenant_id attempted dashboard access');
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  return NextResponse.next();
});
```

#### 6.2.2 Tenant Isolation Checklist

- [x] **Never accept tenant_id from request body** - Always extract from JWT or URL slug
- [x] **Use withTenant() for all DB operations** - Sets RLS context
- [x] **Validate tenant exists before operations** - Return 404, not empty results
- [x] **Tenant-prefix all file uploads** - `/{tenant_id}/products/{file}`
- [x] **Include tenant_id in all INSERT statements** - Even with RLS
- [x] **Log tenant context in all operations** - For audit trail
- [x] **Test cross-tenant access in CI** - Automated security tests

#### 6.2.3 Payment Security

```typescript
// CORRECT: Server-side price calculation
async function createCheckout(cartId: string, tenantId: string) {
  const cart = await withTenant(tenantId, async (tx) => {
    return tx.query.carts.findFirst({
      where: eq(carts.id, cartId),
      with: { items: { with: { variant: true } } }
    });
  });
  
  // Calculate total server-side, never trust client
  const total = cart.items.reduce((sum, item) => {
    return sum + (parseFloat(item.variant.price) * item.quantity);
  }, 0);
  
  // Get merchant's Stripe account
  const tenant = await getTenant(tenantId);
  
  return stripe.paymentIntents.create({
    amount: Math.round(total * 100), // Server-calculated
    currency: tenant.currency,
    transfer_data: {
      destination: tenant.stripeAccountId, // Funds go to merchant
    },
    metadata: {
      tenant_id: tenantId,
      cart_id: cartId,
    }
  });
}
```

#### 6.2.4 Input Validation

```typescript
// Zod schemas for all inputs
const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.string().regex(/^\d+(\.\d{2})?$/),
  description: z.string().max(5000).optional(),
  status: z.enum(['draft', 'active', 'archived']),
  images: z.array(z.string().url()).max(10),
});

// Server action with validation
export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");
  
  const validated = createProductSchema.parse({
    name: formData.get('name'),
    price: formData.get('price'),
    // ...
  });
  
  return withTenant(session.user.tenantId, async (tx) => {
    return tx.insert(products).values({
      ...validated,
      tenantId: session.user.tenantId,
    });
  });
}
```

### 6.3 Security Audit Requirements

| Requirement | Frequency | Method |
|-------------|-----------|--------|
| Cross-tenant access testing | Every PR | Automated tests |
| RLS policy verification | Weekly | SQL audit script |
| Dependency vulnerability scan | Daily | Dependabot |
| Penetration testing | Quarterly | External firm |
| Access log review | Weekly | Automated alerts |

---

## 7. Scalability Analysis

### 7.1 Scaling Vectors

| Component | Current Capacity | 10x Trigger | 100x Trigger | Scaling Strategy |
|-----------|-----------------|-------------|--------------|------------------|
| **Database** | 100 tenants, 10K products | 1K tenants | 10K tenants | Read replicas, connection pooling |
| **API** | 100 req/s | 1K req/s | 10K req/s | Edge caching, serverless scaling |
| **File Storage** | 10GB | 100GB | 1TB | CDN, lazy loading |
| **Search** | DB queries | 10K products | 100K products | Dedicated search (Algolia/Meilisearch) |
| **Background Jobs** | Inline | 100 orders/day | 1K orders/day | Queue system (Inngest) |

### 7.2 Bottleneck Analysis

#### 7.2.1 Database Connection Pool

**Problem:** PostgreSQL has limited connections (~100 default).

**Mitigation:**
```typescript
// Use connection pooling (Supabase PgBouncer)
const connectionString = process.env.DATABASE_URL; // Pooled connection

// Configure pool size
const client = postgres(connectionString, {
  max: 10, // Per-instance limit
  idle_timeout: 20,
  connect_timeout: 10,
});
```

**Scaling Path:**
1. **10x:** Increase pool size, add read replicas
2. **100x:** Dedicated connection pooler, sharding consideration

#### 7.2.2 Product Image Delivery

**Problem:** Large images slow page loads.

**Mitigation:**
```typescript
// Use Next.js Image optimization
<Image
  src={product.images[0]}
  width={400}
  height={400}
  placeholder="blur"
  blurDataURL={product.blurHash}
/>

// Configure remote patterns
// next.config.ts
images: {
  remotePatterns: [
    { hostname: '*.public.blob.vercel-storage.com' }
  ]
}
```

**Scaling Path:**
1. **10x:** Image optimization, lazy loading
2. **100x:** Dedicated image CDN, WebP/AVIF conversion


#### 7.2.3 Checkout Performance

**Problem:** Checkout must be fast to prevent abandonment.

**Mitigation:**
```typescript
// Parallel data fetching
const [cart, tenant, shippingRates] = await Promise.all([
  getCart(cartId),
  getTenant(tenantId),
  getShippingRates(tenantId),
]);

// Optimistic UI updates
const { mutate, isPending } = useMutation({
  mutationFn: submitOrder,
  onMutate: () => {
    // Show loading state immediately
  },
  onSuccess: (order) => {
    router.push(`/store/${slug}/order-confirmation/${order.id}`);
  },
});
```

**Scaling Path:**
1. **10x:** Edge caching for static checkout elements
2. **100x:** Dedicated checkout service, payment optimization

### 7.3 Caching Strategy

| Layer | Cache Type | TTL | Invalidation |
|-------|-----------|-----|--------------|
| **CDN** | Edge cache | 1 hour | On publish |
| **API** | Response cache | 5 min | On mutation |
| **Database** | Query cache | 1 min | On write |
| **Session** | JWT | 24 hours | On logout |

```typescript
// Next.js caching
export const revalidate = 300; // 5 minutes

// Manual revalidation on mutation
export async function updateProduct(id: string, data: ProductUpdate) {
  await withTenant(tenantId, async (tx) => {
    await tx.update(products).set(data).where(eq(products.id, id));
  });
  
  // Invalidate cached pages
  revalidatePath(`/store/${tenant.slug}/products/${product.slug}`);
  revalidateTag(`products-${tenantId}`);
}
```

### 7.4 Monitoring & Observability

```typescript
// OpenTelemetry instrumentation
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerOTel } = await import('@vercel/otel');
    registerOTel({
      serviceName: 'indigo-platform',
      attributes: {
        'deployment.environment': process.env.NODE_ENV,
      },
    });
  }
}

// Custom spans for tenant operations
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('tenant-operations');

export async function withTenant<T>(tenantId: string, callback: (tx: Transaction) => Promise<T>): Promise<T> {
  return tracer.startActiveSpan(`db.tenant.${tenantId}`, async (span) => {
    span.setAttribute('tenant.id', tenantId);
    try {
      return await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`);
        return callback(tx);
      });
    } finally {
      span.end();
    }
  });
}
```

---

## 8. Trade-offs

### 8.1 Architecture Trade-offs

| Trade-off | What We're Trading | Benefit | Cost | Reversibility |
|-----------|-------------------|---------|------|---------------|
| **Shared DB vs DB-per-tenant** | Stronger isolation | Lower cost, simpler ops | Noisy neighbor risk | Medium (migration required) |
| **URL Slug vs Subdomain** | Custom branding | No DNS complexity | Less professional URLs | Easy (add subdomain support) |
| **Server Components vs SPA** | Client interactivity | Better SEO, faster initial load | More server load | Hard (architectural change) |
| **Stripe Connect Standard vs Custom** | Platform control | Faster onboarding | Less customization | Medium (account migration) |
| **Vercel Blob vs S3** | Flexibility | Simpler integration | Vendor lock-in | Easy (storage abstraction) |

### 8.2 MVP Scope Trade-offs

| Feature | MVP Approach | Full Approach | Upgrade Path |
|---------|-------------|---------------|--------------|
| **Custom Domains** | Slug-based URLs only | Full custom domain | Add domain verification service |
| **Search** | Database LIKE queries | Full-text search engine | Integrate Algolia/Meilisearch |
| **Analytics** | Basic order counts | Full funnel analytics | Add analytics service |
| **Email** | Single template | Per-tenant branding | Template system |
| **Inventory** | Simple quantity | Multi-location, reservations | Inventory service |

### 8.3 Technical Debt Accepted

| Debt Item | Reason | Payback Trigger | Estimated Effort |
|-----------|--------|-----------------|------------------|
| No database migrations versioning | MVP speed | First breaking change | 2 days |
| Inline email sending | Simplicity | 100+ orders/day | 3 days |
| No background job queue | Complexity | Webhook reliability issues | 5 days |
| Single region deployment | Cost | International expansion | 3 days |

---

## 9. Feature Mapping

### 9.1 P0 Features (Tenant Isolation)

#### F001: Tenant Registration & Provisioning

| Component | Implementation |
|-----------|----------------|
| **UI** | `/app/(auth)/register/page.tsx` - Registration form |
| **Server Action** | `registerTenant()` - Creates tenant + user in transaction |
| **Database** | `tenants` table + `users` table |
| **Auth** | NextAuth session with `tenantId` claim |

```typescript
// Registration flow
async function registerTenant(data: RegisterData) {
  return sudoDb.transaction(async (tx) => {
    // 1. Create tenant
    const [tenant] = await tx.insert(tenants).values({
      name: data.storeName,
      slug: generateSlug(data.storeName),
    }).returning();
    
    // 2. Create owner user
    const [user] = await tx.insert(users).values({
      tenantId: tenant.id,
      email: data.email,
      password: await hash(data.password, 12),
      role: 'owner',
    }).returning();
    
    // 3. Initialize store settings
    await tx.insert(storeSettings).values({
      tenantId: tenant.id,
      // Default settings...
    });
    
    return { tenant, user };
  });
}
```


#### F002: Tenant-Scoped Data Access

| Component | Implementation |
|-----------|----------------|
| **Data Layer** | `withTenant()` wrapper in `src/lib/db.ts` |
| **Database** | RLS policies on all tables |
| **Validation** | Middleware tenant extraction |

**Implementation Pattern:**
```typescript
// Every data operation uses withTenant
export async function getProducts(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    return tx.select().from(products);
    // RLS automatically filters by tenant_id
  });
}

// Server actions extract tenant from session
export async function createProduct(formData: FormData) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) throw new Error("Unauthorized");
  
  return withTenant(tenantId, async (tx) => {
    return tx.insert(products).values({
      tenantId, // Explicit for clarity
      name: formData.get('name'),
      // ...
    });
  });
}
```

#### F003: Tenant-Specific Subdomains/Slugs

| Component | Implementation |
|-----------|----------------|
| **Routing** | `/app/store/[slug]/*` - Dynamic route |
| **Resolution** | Layout fetches tenant by slug |
| **Validation** | 404 if slug not found |

**Implementation:**
```typescript
// src/app/store/[slug]/layout.tsx
export default async function StoreLayout({ params, children }) {
  const { slug } = await params;
  
  // Resolve tenant from slug
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  });
  
  if (!tenant) {
    notFound(); // Returns 404, never leaks data
  }
  
  return (
    <TenantProvider tenant={tenant}>
      {children}
    </TenantProvider>
  );
}
```

### 9.2 P1 Features (MVP Critical)

#### F004: Visual Store Editor

| Component | Implementation |
|-----------|----------------|
| **UI** | `/app/(editor)/storefront/*` - Editor routes |
| **State** | Zustand store (`layout-store.ts`) |
| **Persistence** | Server action saves to tenant's store config |
| **Preview** | Inline rendering, no iframe |

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Visual Editor                             │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Layers Panel   │  Live Preview   │  Properties Panel       │
│  - Block tree   │  - Real render  │  - Block settings       │
│  - DnD reorder  │  - <100ms       │  - Style controls       │
│  - Add/remove   │  - Mobile view  │  - Content editing      │
└────────┬────────┴────────┬────────┴────────────┬────────────┘
         │                 │                     │
         └─────────────────┼─────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Layout Store │
                    │  (Zustand)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Save Action  │
                    │ (Server)     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Database   │
                    │ store_config│
                    └─────────────┘
```

#### F005: Product Management CRUD

| Component | Implementation |
|-----------|----------------|
| **UI** | `/app/dashboard/products/*` |
| **Server Actions** | `createProduct`, `updateProduct`, `deleteProduct` |
| **Image Upload** | Vercel Blob with tenant-prefixed paths |
| **Validation** | Zod schemas |

**File Upload Pattern:**
```typescript
export async function uploadProductImage(formData: FormData) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) throw new Error("Unauthorized");
  
  const file = formData.get('file') as File;
  const productId = formData.get('productId') as string;
  
  // Tenant-scoped path
  const path = `${tenantId}/products/${productId}/${file.name}`;
  
  const blob = await put(path, file, {
    access: 'public',
    addRandomSuffix: true,
  });
  
  return blob.url;
}
```

#### F006: Shopping Cart

| Component | Implementation |
|-----------|----------------|
| **Storage** | Database (`carts`, `cart_items` tables) |
| **Identity** | Cookie-based cart ID for guests |
| **State** | React Context + Server State |
| **Persistence** | Survives browser sessions |

**Cart Flow:**
```typescript
// Get or create cart
export async function getOrCreateCart(tenantId: string, customerId?: string) {
  const cartId = cookies().get('cart_id')?.value;
  
  if (cartId) {
    const cart = await withTenant(tenantId, async (tx) => {
      return tx.query.carts.findFirst({
        where: and(
          eq(carts.id, cartId),
          eq(carts.status, 'active')
        ),
        with: { items: true }
      });
    });
    if (cart) return cart;
  }
  
  // Create new cart
  const [cart] = await withTenant(tenantId, async (tx) => {
    return tx.insert(carts).values({
      tenantId,
      customerId,
      status: 'active',
    }).returning();
  });
  
  cookies().set('cart_id', cart.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  
  return cart;
}
```


#### F007: Checkout & Payment (Stripe)

| Component | Implementation |
|-----------|----------------|
| **UI** | `/app/store/[slug]/checkout/*` |
| **Payment** | Stripe Connect (Standard accounts) |
| **Flow** | Cart → Checkout → Payment → Confirmation |
| **Webhooks** | `/api/webhooks/stripe` |

**Stripe Connect Architecture:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Shopper   │────▶│  Platform   │────▶│  Merchant   │
│             │     │  (Indigo)   │     │  (Stripe)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    PaymentIntent
                    with transfer_data
                           │
                    ┌──────▼──────┐
                    │   Stripe    │
                    │   Connect   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        Platform Fee   Merchant     Processing
        (optional)     Payout       Fee
```

**Implementation:**
```typescript
// Checkout action
export async function createCheckoutSession(cartId: string) {
  const session = await auth();
  const tenantId = /* from URL slug or session */;
  
  const [cart, tenant] = await Promise.all([
    getCart(cartId, tenantId),
    getTenant(tenantId),
  ]);
  
  if (!tenant.stripeAccountId) {
    throw new Error("Merchant has not completed Stripe onboarding");
  }
  
  // Calculate total server-side
  const total = calculateCartTotal(cart);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: tenant.currency.toLowerCase(),
    transfer_data: {
      destination: tenant.stripeAccountId,
    },
    metadata: {
      tenant_id: tenantId,
      cart_id: cartId,
    },
  });
  
  return { clientSecret: paymentIntent.client_secret };
}

// Webhook handler
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { tenant_id, cart_id } = paymentIntent.metadata;
    
    await withTenant(tenant_id, async (tx) => {
      // Create order
      const [order] = await tx.insert(orders).values({
        tenantId: tenant_id,
        status: 'pending',
        totalAmount: (paymentIntent.amount / 100).toString(),
        stripePaymentIntentId: paymentIntent.id,
        // ... customer info from cart
      }).returning();
      
      // Create order items from cart
      // Update inventory
      // Mark cart as completed
      // Send confirmation email
    });
  }
  
  return NextResponse.json({ received: true });
}
```

#### F008: Order Management

| Component | Implementation |
|-----------|----------------|
| **UI** | `/app/dashboard/orders/*` |
| **Status Flow** | pending → processing → shipped → delivered |
| **History** | `order_status_history` table |
| **Notifications** | Email on status change |

**Status Workflow:**
```typescript
const ORDER_STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: ['refunded'],
  refunded: [],
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  note?: string
) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  
  return withTenant(tenantId, async (tx) => {
    const [order] = await tx.select().from(orders)
      .where(eq(orders.id, orderId));
    
    // Validate transition
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    }
    
    // Update order
    await tx.update(orders)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    
    // Record history
    await tx.insert(orderStatusHistory).values({
      tenantId,
      orderId,
      status: newStatus,
      note,
    });
    
    // Send notification
    await sendOrderStatusEmail(order.customerEmail, newStatus);
    
    return { success: true };
  });
}
```

### 9.3 P2 Features (Fast-Follow)

#### F009: Category Management

| Component | Implementation |
|-----------|----------------|
| **Database** | `categories` table with `parent_id` for nesting |
| **UI** | `/app/dashboard/categories/*` |
| **Storefront** | `/app/store/[slug]/category/[categorySlug]` |

#### F010: Discount Codes

| Component | Implementation |
|-----------|----------------|
| **Database** | `discounts` table with rules |
| **Application** | Cart-level discount calculation |
| **Validation** | Server-side code validation |

#### F011: Customer Accounts

| Component | Implementation |
|-----------|----------------|
| **Auth** | Separate customer auth (not merchant) |
| **Database** | `customers` table (tenant-scoped) |
| **Features** | Order history, saved addresses |

---


## 10. JSON Summary

```json
{
  "document_metadata": {
    "version": "1.0",
    "date": "2025-01",
    "author": "System Architect Agent",
    "status": "Draft for Review"
  },
  "confidence_score": 0.89,
  "architecture_summary": {
    "pattern": "Shared Database with Row-Level Security",
    "framework": "Next.js 16 App Router",
    "database": "PostgreSQL (Supabase)",
    "auth": "NextAuth v5 with JWT",
    "payments": "Stripe Connect (Standard)",
    "storage": "Vercel Blob"
  },
  "key_decisions": [
    {
      "decision": "Shared DB + RLS isolation",
      "confidence": 0.92,
      "rationale": "Cost-effective for MVP, sufficient isolation"
    },
    {
      "decision": "URL slug tenant resolution",
      "confidence": 0.88,
      "rationale": "No DNS complexity, SEO-friendly"
    },
    {
      "decision": "Server Components first",
      "confidence": 0.95,
      "rationale": "Better SEO, faster initial load"
    },
    {
      "decision": "Stripe Connect Standard",
      "confidence": 0.93,
      "rationale": "Faster merchant onboarding"
    }
  ],
  "security_posture": {
    "tenant_isolation": "RLS + withTenant() wrapper",
    "auth_method": "JWT with tenant claim",
    "payment_security": "Server-side price calculation",
    "critical_threats_mitigated": [
      "Cross-tenant data access",
      "Payment amount manipulation",
      "SQL injection"
    ]
  },
  "scalability_limits": {
    "current_capacity": {
      "tenants": 100,
      "products_per_tenant": 1000,
      "orders_per_day": 100
    },
    "10x_triggers": [
      "Database connection pooling",
      "Read replicas",
      "CDN optimization"
    ],
    "100x_triggers": [
      "Dedicated search service",
      "Background job queue",
      "Multi-region deployment"
    ]
  },
  "feature_mapping": {
    "P0": {
      "F001_tenant_registration": ["tenants", "users", "auth"],
      "F002_tenant_scoped_access": ["withTenant", "RLS"],
      "F003_tenant_slugs": ["routing", "layout"]
    },
    "P1": {
      "F004_visual_editor": ["editor", "zustand", "blocks"],
      "F005_product_crud": ["products", "variants", "images"],
      "F006_shopping_cart": ["carts", "cart_items", "cookies"],
      "F007_checkout": ["stripe", "webhooks", "orders"],
      "F008_order_management": ["orders", "status_history", "email"]
    },
    "P2": {
      "F009_categories": ["categories", "navigation"],
      "F010_discounts": ["discounts", "cart_calculation"],
      "F011_customer_accounts": ["customers", "auth"]
    }
  },
  "risks_addressed": {
    "R001_tenant_data_leak": {
      "severity": "HIGH",
      "mitigations": [
        "RLS policies on all tables",
        "withTenant() wrapper mandatory",
        "Never trust client tenant_id",
        "Automated cross-tenant tests"
      ]
    },
    "R004_scope_creep": {
      "severity": "MEDIUM",
      "mitigations": [
        "Clear P0/P1/P2 prioritization",
        "Feature mapping to components",
        "Technical debt tracking"
      ]
    }
  },
  "technical_debt": [
    {
      "item": "No background job queue",
      "payback_trigger": "100+ orders/day",
      "effort_days": 5
    },
    {
      "item": "Inline email sending",
      "payback_trigger": "Delivery reliability issues",
      "effort_days": 3
    },
    {
      "item": "Single region deployment",
      "payback_trigger": "International expansion",
      "effort_days": 3
    }
  ],
  "next_steps": [
    "Review with engineering team",
    "Create RLS migration scripts",
    "Set up Stripe Connect test accounts",
    "Implement withTenant() wrapper tests",
    "Create security test suite"
  ]
}
```

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Tenant** | A merchant's store instance on the platform |
| **RLS** | Row-Level Security - PostgreSQL feature for row-based access control |
| **Slug** | URL-safe identifier for a tenant (e.g., `maya-boutique`) |
| **withTenant()** | Wrapper function that sets RLS context for database operations |
| **Stripe Connect** | Stripe's multi-party payment platform |
| **Server Action** | Next.js feature for server-side mutations |

## Appendix B: Related Documents

- [Product Requirements Document](./PRODUCT-REQUIREMENTS.md)
- [Visual Editor Architecture](../VISUAL-EDITOR-ANALYSIS.md)
- [Supabase Integration Guide](../SUPABASE-INTEGRATION.md)

---

**Document Status:** Complete  
**Next Step:** Engineering review and implementation planning  
**Dependencies:** Product Requirements Document (approved)
