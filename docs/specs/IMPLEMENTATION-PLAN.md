# Implementation Plan
## Multitenant SaaS E-Commerce Platform MVP

**Version:** 1.0  
**Date:** January 2025  
**Author:** Senior Full-Stack Engineer  
**Status:** Ready for Implementation  
**Confidence Score:** 0.91

---

## Table of Contents

1. [Implementation Plan](#1-implementation-plan)
2. [Data Models](#2-data-models)
3. [API Implementations](#3-api-implementations)
4. [Reusable Patterns](#4-reusable-patterns)
5. [Multitenancy Safeguards](#5-multitenancy-safeguards)
6. [Known Limitations](#6-known-limitations)
7. [JSON Summary](#7-json-summary)

---

## 1. Implementation Plan

### 1.1 Tech Stack Rationale

| Technology | Choice | Rationale |
|------------|--------|-----------|
| **Framework** | Next.js 16 App Router | Server Components, streaming, existing codebase |
| **Database** | PostgreSQL (Supabase) | RLS support, managed service, existing setup |
| **ORM** | Drizzle ORM | Type-safe, lightweight, existing implementation |
| **Auth** | NextAuth v5 + JWT | Tenant claim in token, stateless, existing setup |
| **Payments** | Stripe Connect (Standard) | Multi-merchant support, mature API |
| **File Storage** | Vercel Blob | Integrated, tenant-scoped paths |
| **State Management** | Zustand | Visual editor state, lightweight |
| **Validation** | Zod | Runtime type validation, form schemas |
| **Email** | Resend | Simple API, good deliverability |

### 1.2 Sprint Breakdown (8 Weeks)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MVP IMPLEMENTATION TIMELINE                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Week 1-2: Foundation (P0 Features)                                              │
│ ├── F001: Tenant Registration & Provisioning                                    │
│ ├── F002: Tenant-Scoped Data Access (RLS)                                       │
│ └── F003: Tenant-Specific Slugs                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Week 3-4: Core Commerce (P1 Features - Part 1)                                  │
│ ├── F005: Product Management CRUD                                               │
│ ├── F006: Shopping Cart                                                         │
│ └── API: Public storefront endpoints                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Week 5-6: Checkout & Orders (P1 Features - Part 2)                              │
│ ├── F007: Checkout & Payment (Stripe Connect)                                   │
│ ├── F008: Order Management                                                      │
│ └── Webhooks: Stripe payment events                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Week 7-8: Visual Editor & Polish (P1 Features - Part 3)                         │
│ ├── F004: Visual Store Editor                                                   │
│ ├── Integration testing                                                         │
│ └── Security audit & performance optimization                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Phase Details

#### Phase 1: Foundation (Weeks 1-2)

| Deliverable | Duration | Dependencies | Owner |
|-------------|----------|--------------|-------|
| RLS migration scripts | 2 days | Database access | Engineer 1 |
| Registration flow | 3 days | RLS policies | Engineer 1 |
| Tenant resolution middleware | 2 days | None | Engineer 2 |
| Auth JWT with tenant claim | 2 days | Registration | Engineer 2 |
| Security test suite | 1 day | All above | Both |

**Exit Criteria:**
- [ ] New tenant can register and receive isolated data space
- [ ] JWT contains valid `tenantId` claim
- [ ] Cross-tenant access tests pass (100% isolation)
- [ ] Store accessible via `/store/[slug]`

#### Phase 2: Core Commerce (Weeks 3-4)

| Deliverable | Duration | Dependencies | Owner |
|-------------|----------|--------------|-------|
| Product CRUD actions | 3 days | Phase 1 | Engineer 1 |
| Image upload to Vercel Blob | 2 days | Product CRUD | Engineer 1 |
| Cart persistence (DB) | 3 days | Phase 1 | Engineer 2 |
| Public storefront API | 2 days | Products, Cart | Engineer 2 |

**Exit Criteria:**
- [ ] Merchant can create/edit/delete products
- [ ] Product images upload to tenant-scoped paths
- [ ] Shopper can add items to cart
- [ ] Cart persists across sessions

#### Phase 3: Checkout & Orders (Weeks 5-6)

| Deliverable | Duration | Dependencies | Owner |
|-------------|----------|--------------|-------|
| Stripe Connect onboarding | 2 days | Phase 1 | Engineer 1 |
| Checkout flow | 4 days | Cart, Stripe | Engineer 1 |
| Webhook handlers | 2 days | Checkout | Engineer 2 |
| Order management UI | 2 days | Webhooks | Engineer 2 |

**Exit Criteria:**
- [ ] Merchant can connect Stripe account
- [ ] Shopper can complete purchase
- [ ] Order created on successful payment
- [ ] Merchant can view and update order status

#### Phase 4: Visual Editor & Polish (Weeks 7-8)

| Deliverable | Duration | Dependencies | Owner |
|-------------|----------|--------------|-------|
| Block-based editor | 4 days | Phase 1 | Engineer 1 |
| Editor persistence | 2 days | Editor | Engineer 1 |
| Integration tests | 2 days | All phases | Engineer 2 |
| Security audit | 1 day | All phases | Both |
| Performance optimization | 1 day | All phases | Both |

**Exit Criteria:**
- [ ] Merchant can customize store layout
- [ ] Changes persist and reflect on storefront
- [ ] All P0/P1 features functional
- [ ] Security audit passed

### 1.4 Feature-to-Code Mapping

| Feature | PM Priority | Components | Files |
|---------|-------------|------------|-------|
| F001: Tenant Registration | P0 | Auth, DB | `src/app/(auth)/register/*`, `src/lib/tenant/*` |
| F002: Tenant-Scoped Data | P0 | DB, Middleware | `src/lib/db.ts`, `src/lib/actions.ts` |
| F003: Tenant Slugs | P0 | Routing | `src/app/store/[slug]/*`, `src/middleware.ts` |
| F004: Visual Editor | P1 | Editor | `src/app/(editor)/storefront/*`, `src/lib/editor/*` |
| F005: Product CRUD | P1 | Dashboard | `src/app/dashboard/products/*` |
| F006: Shopping Cart | P1 | Store | `src/lib/store/*`, `src/lib/data/cart.ts` |
| F007: Checkout | P1 | Store, Stripe | `src/app/store/[slug]/checkout/*`, `src/lib/stripe*.ts` |
| F008: Order Management | P1 | Dashboard | `src/app/dashboard/orders/*` |

---

## 2. Data Models

### 2.1 Entity Definitions (Drizzle Schema)

The existing schema files in `src/db/schema/` provide a solid foundation. Below are the complete schemas with tenant scoping annotations.

#### 2.1.1 Tenants (Platform-Level - No RLS)

```typescript
// src/db/schema/tenants.ts - EXISTING, NO CHANGES NEEDED
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  currency: text("currency").default("NPR"),
  logoUrl: text("logo_url"),
  plan: text("plan").default("free").notNull(),
  // Stripe Connect fields - ADD THESE
  stripeAccountId: text("stripe_account_id"),
  stripeOnboardingComplete: boolean("stripe_onboarding_complete").default(false),
  settings: jsonb("settings").default({}).$type<TenantSettings>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("tenants_slug_idx").on(table.slug),
}));

// Note: tenants table does NOT have tenant_id - it IS the tenant
// RLS policy: Only platform admins or self-access
```

#### 2.1.2 Store Configuration (NEW - For Visual Editor)

```typescript
// src/db/schema/store-config.ts - NEW FILE
import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export interface StoreLayout {
  sections: Array<{
    id: string;
    type: string;
    props: Record<string, unknown>;
    children?: string[];
  }>;
  globalStyles?: {
    primaryColor?: string;
    fontFamily?: string;
    borderRadius?: string;
  };
}

export const storeConfigs = pgTable("store_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  pageType: text("page_type").notNull(), // 'home', 'product', 'category', 'checkout'
  layout: jsonb("layout").default({}).$type<StoreLayout>(),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantPageIdx: index("store_configs_tenant_page_idx").on(table.tenantId, table.pageType),
}));
```

#### 2.1.3 Orders Enhancement (Stripe Integration)

```typescript
// src/db/schema/orders.ts - ADD STRIPE FIELDS
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  status: text("status").default("pending").notNull(),
  totalAmount: text("total_amount").notNull(),
  // Customer Info
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  // Shipping Address
  shippingAddress: text("shipping_address"),
  shippingCity: text("shipping_city"),
  shippingArea: text("shipping_area"),
  // Stripe Integration - ADD THESE
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, failed, refunded
  // Order Notes
  notes: text("notes"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantCreatedIdx: index("orders_tenant_created_idx").on(table.tenantId, table.createdAt),
  statusIdx: index("orders_status_idx").on(table.status),
  stripePaymentIdx: index("orders_stripe_payment_idx").on(table.stripePaymentIntentId),
}));
```

### 2.2 RLS Policy Patterns

```sql
-- drizzle/migrations/XXXX_enable_rls.sql

-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================

-- Tenant-scoped tables
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
ALTER TABLE store_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_codes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STANDARD TENANT ISOLATION POLICY
-- ============================================

-- Template for all tenant-scoped tables:
CREATE POLICY tenant_isolation_policy ON products
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Apply to all tables (repeat for each):
CREATE POLICY tenant_isolation_policy ON users
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ... (repeat for all tenant-scoped tables)

-- ============================================
-- SPECIAL POLICIES
-- ============================================

-- Tenants table: Self-access only (or platform admin)
CREATE POLICY tenants_self_access ON tenants
  FOR ALL
  USING (
    id = current_setting('app.current_tenant', true)::uuid
    OR current_setting('app.is_platform_admin', true)::boolean = true
  );

-- Note: Inventory is tracked at multiple levels:
-- - products.quantity: Aggregate stock for simple products
-- - product_variants.quantity: Stock per variant  
-- - inventory_levels: Location-based inventory for multi-warehouse support
-- - stock_movements: Audit trail for all inventory changes

-- Cart items: Access via cart relationship (no direct tenant_id)
-- Note: cart_items doesn't have tenant_id, access controlled via carts table
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
-- Access controlled at application layer via cart ownership
```

### 2.3 Index Strategy

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| `tenants` | `tenants_slug_idx` | `(slug)` | Tenant resolution by slug |
| `products` | `products_tenant_slug_idx` | `(tenant_id, slug)` | Product lookup by slug |
| `products` | `products_status_idx` | `(status)` | Filter active products |
| `products` | `products_category_idx` | `(category_id)` | Category filtering |
| `orders` | `orders_tenant_created_idx` | `(tenant_id, created_at DESC)` | Order listing |
| `orders` | `orders_status_idx` | `(status)` | Status filtering |
| `orders` | `orders_stripe_payment_idx` | `(stripe_payment_intent_id)` | Webhook lookup |
| `carts` | `carts_tenant_customer_idx` | `(tenant_id, customer_id)` | Cart retrieval |
| `categories` | `categories_tenant_slug_idx` | `(tenant_id, slug)` | Category lookup |
| `store_configs` | `store_configs_tenant_page_idx` | `(tenant_id, page_type)` | Editor config lookup |

---

## 3. API Implementations

### 3.1 Tenant Safety Matrix

| Endpoint Type | Tenant Source | Validation Method | Example |
|---------------|---------------|-------------------|---------|
| **Storefront** | URL slug | DB lookup → 404 if not found | `/store/[slug]/products` |
| **Dashboard** | JWT claim | `auth()` → redirect if missing | `/dashboard/products` |
| **Public API** | URL slug | DB lookup → 404 if not found | `/api/store/[slug]/products` |
| **Server Actions** | JWT claim | `authorizedAction()` wrapper | `createProduct()` |
| **Webhooks** | Payload metadata | Signature verification | `/api/webhooks/stripe` |

### 3.2 Storefront API (Public)

#### GET `/api/store/[slug]/products`

```typescript
// src/app/api/store/[slug]/products/route.ts
import { NextResponse } from "next/server";
import { withTenant } from "@/lib/db";
import { resolveBySlug } from "@/lib/tenant";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  // 1. Resolve tenant from URL slug (NEVER trust client)
  const tenant = await resolveBySlug(slug);
  if (!tenant) {
    return NextResponse.json(
      { error: "Store not found", code: "TENANT_NOT_FOUND" },
      { status: 404 }
    );
  }
  
  // 2. Query with tenant context (RLS enforced)
  const productList = await withTenant(tenant.id, async (tx) => {
    return tx.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      images: products.images,
    })
    .from(products)
    .where(eq(products.status, "active")); // Only active products
  });
  
  return NextResponse.json({
    products: productList,
    tenant: { name: tenant.name, slug: tenant.slug }
  });
}
```

**Request:** `GET /api/store/acme-boutique/products`

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Summer Dress",
      "slug": "summer-dress",
      "price": "49.99",
      "compareAtPrice": "79.99",
      "images": ["https://..."]
    }
  ],
  "tenant": { "name": "Acme Boutique", "slug": "acme-boutique" }
}
```

#### POST `/api/store/[slug]/cart/items`

```typescript
// src/app/api/store/[slug]/cart/items/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withTenant } from "@/lib/db";
import { resolveBySlug } from "@/lib/tenant";
import { carts, cartItems, products, productVariants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const addToCartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().positive().max(99),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  // 1. Resolve tenant
  const tenant = await resolveBySlug(slug);
  if (!tenant) {
    return NextResponse.json(
      { error: "Store not found", code: "TENANT_NOT_FOUND" },
      { status: 404 }
    );
  }
  
  // 2. Validate input
  const body = await request.json();
  const validation = addToCartSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: validation.error.flatten() },
      { status: 400 }
    );
  }
  const { productId, variantId, quantity } = validation.data;
  
  // 3. Get or create cart
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart_id")?.value;
  
  const result = await withTenant(tenant.id, async (tx) => {
    // Verify product exists and is active
    const [product] = await tx.select()
      .from(products)
      .where(and(
        eq(products.id, productId),
        eq(products.status, "active")
      ));
    
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }
    
    // Get or create cart
    let cart;
    if (cartId) {
      [cart] = await tx.select().from(carts)
        .where(and(
          eq(carts.id, cartId),
          eq(carts.status, "active")
        ));
    }
    
    if (!cart) {
      [cart] = await tx.insert(carts).values({
        tenantId: tenant.id,
        status: "active",
        currency: tenant.currency || "USD",
      }).returning();
    }
    
    // Add item to cart
    const [item] = await tx.insert(cartItems).values({
      cartId: cart.id,
      productId,
      variantId,
      productName: product.name,
      productImage: product.images?.[0],
      quantity,
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
    }).returning();
    
    return { cart, item };
  });
  
  // Set cart cookie
  cookieStore.set("cart_id", result.cart.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  
  return NextResponse.json({ success: true, item: result.item });
}
```

### 3.3 Dashboard API (Authenticated)

#### Server Action: `createProduct`

```typescript
// src/app/dashboard/products/product-actions.ts
"use server";

import { authorizedAction } from "@/lib/actions";
import { products, productVariants, inventoryLevels } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),
  price: z.string().regex(/^\d+(\.\d{2})?$/),
  compareAtPrice: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  images: z.array(z.string().url()).max(10).default([]),
});

export async function createProduct(formData: FormData) {
  // Validate input at API boundary
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    categoryId: formData.get("categoryId"),
    status: formData.get("status") || "draft",
    images: JSON.parse(formData.get("images") as string || "[]"),
  };
  
  const validated = createProductSchema.parse(rawData);
  
  // Execute within tenant-scoped transaction
  return authorizedAction(async (tx, tenantId) => {
    // Check for duplicate slug within tenant
    const existing = await tx.select({ id: products.id })
      .from(products)
      .where(eq(products.slug, validated.slug))
      .limit(1);
    
    if (existing.length > 0) {
      throw new Error("Product with this slug already exists");
    }
    
    // Create product
    const [product] = await tx.insert(products).values({
      tenantId, // CRITICAL: Always set from session, never from input
      ...validated,
    }).returning();
    
    // Create default variant
    const [variant] = await tx.insert(productVariants).values({
      tenantId,
      productId: product.id,
      name: "Default",
      price: validated.price,
    }).returning();
    
    // Initialize inventory
    await tx.insert(inventoryLevels).values({
      tenantId,
      variantId: variant.id,
      quantity: 0,
      location: "default",
    });
    
    revalidatePath("/dashboard/products");
    return { success: true, product };
  });
}
```

#### Server Action: `updateOrderStatus`

```typescript
// src/app/dashboard/orders/order-actions.ts
"use server";

import { authorizedAction } from "@/lib/actions";
import { orders, orderStatusHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendOrderStatusEmail } from "@/lib/services/email";

const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: ["refunded"],
  refunded: [],
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  note?: string
) {
  return authorizedAction(async (tx, tenantId) => {
    // Get current order
    const [order] = await tx.select()
      .from(orders)
      .where(eq(orders.id, orderId));
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Validate status transition
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    }
    
    // Update order status
    await tx.update(orders)
      .set({ 
        status: newStatus, 
        updatedAt: new Date() 
      })
      .where(eq(orders.id, orderId));
    
    // Record status history
    await tx.insert(orderStatusHistory).values({
      tenantId,
      orderId,
      status: newStatus,
      note,
    });
    
    // Send customer notification (non-blocking)
    if (order.customerEmail) {
      sendOrderStatusEmail(order.customerEmail, order.id, newStatus).catch(console.error);
    }
    
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    
    return { success: true };
  });
}
```

### 3.4 Webhook Endpoints

#### POST `/api/webhooks/stripe`

```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { withTenant, sudoDb } from "@/lib/db";
import { orders, orderItems, carts, cartItems } from "@/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }
  
  // Handle payment success
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { tenant_id, cart_id } = paymentIntent.metadata;
    
    if (!tenant_id || !cart_id) {
      console.error("Missing metadata in payment intent");
      return NextResponse.json({ received: true });
    }
    
    await withTenant(tenant_id, async (tx) => {
      // Get cart with items
      const cart = await tx.query.carts.findFirst({
        where: eq(carts.id, cart_id),
        with: { items: true },
      });
      
      if (!cart) {
        throw new Error("Cart not found");
      }
      
      // Create order
      const [order] = await tx.insert(orders).values({
        tenantId: tenant_id,
        status: "pending",
        totalAmount: (paymentIntent.amount / 100).toFixed(2),
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "paid",
        customerEmail: cart.email,
        // ... other customer fields from cart
      }).returning();
      
      // Create order items from cart items
      for (const item of cart.items) {
        await tx.insert(orderItems).values({
          tenantId: tenant_id,
          orderId: order.id,
          variantId: item.variantId!,
          quantity: item.quantity,
          price: item.unitPrice,
        });
      }
      
      // Mark cart as completed
      await tx.update(carts)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(carts.id, cart_id));
      
      // TODO: Decrement inventory
      // TODO: Send confirmation email
    });
  }
  
  return NextResponse.json({ received: true });
}
```

---

## 4. Reusable Patterns

### 4.1 TenantScopedRepository Pattern

```typescript
// src/lib/repositories/base.ts
import { Transaction, withTenant } from "@/lib/db";
import { PgTable } from "drizzle-orm/pg-core";
import { eq, and, SQL } from "drizzle-orm";

/**
 * Base repository for tenant-scoped entities.
 * Ensures all operations are executed within tenant context.
 */
export abstract class TenantScopedRepository<T extends PgTable> {
  constructor(
    protected table: T,
    protected tenantIdColumn: keyof T["_"]["columns"]
  ) {}
  
  /**
   * Find all records for the tenant
   */
  async findAll(tenantId: string, where?: SQL): Promise<T["$inferSelect"][]> {
    return withTenant(tenantId, async (tx) => {
      const query = tx.select().from(this.table);
      if (where) {
        return query.where(where);
      }
      return query;
    });
  }
  
  /**
   * Find one record by ID
   */
  async findById(tenantId: string, id: string): Promise<T["$inferSelect"] | null> {
    return withTenant(tenantId, async (tx) => {
      const [result] = await tx.select()
        .from(this.table)
        .where(eq((this.table as any).id, id))
        .limit(1);
      return result || null;
    });
  }
  
  /**
   * Create a new record
   */
  async create(
    tenantId: string, 
    data: Omit<T["$inferInsert"], "id" | "tenantId" | "createdAt" | "updatedAt">
  ): Promise<T["$inferSelect"]> {
    return withTenant(tenantId, async (tx) => {
      const [result] = await tx.insert(this.table).values({
        ...data,
        [this.tenantIdColumn]: tenantId,
      } as any).returning();
      return result;
    });
  }
  
  /**
   * Update a record
   */
  async update(
    tenantId: string,
    id: string,
    data: Partial<T["$inferInsert"]>
  ): Promise<T["$inferSelect"]> {
    return withTenant(tenantId, async (tx) => {
      const [result] = await tx.update(this.table)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq((this.table as any).id, id))
        .returning();
      return result;
    });
  }
  
  /**
   * Delete a record
   */
  async delete(tenantId: string, id: string): Promise<void> {
    return withTenant(tenantId, async (tx) => {
      await tx.delete(this.table)
        .where(eq((this.table as any).id, id));
    });
  }
}

// Example usage:
// src/lib/repositories/products.ts
import { products } from "@/db/schema";

class ProductRepository extends TenantScopedRepository<typeof products> {
  constructor() {
    super(products, "tenantId");
  }
  
  async findBySlug(tenantId: string, slug: string) {
    return withTenant(tenantId, async (tx) => {
      const [result] = await tx.select()
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);
      return result || null;
    });
  }
  
  async findActive(tenantId: string) {
    return this.findAll(tenantId, eq(products.status, "active"));
  }
}

export const productRepository = new ProductRepository();
```

### 4.2 withTenant() Implementation (EXISTING - Enhanced)

```typescript
// src/lib/db.ts - ENHANCED VERSION
import "server-only";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { sql } from "drizzle-orm";
import { trace } from "@opentelemetry/api";

export type Database = PostgresJsDatabase<typeof schema>;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

const hasDatabaseUrl = !!process.env.DATABASE_URL;

// Regular DB client (RLS enforced)
const client = hasDatabaseUrl ? postgres(process.env.DATABASE_URL!) : null;
export const db: Database = client ? drizzle(client, { schema }) : (null as unknown as Database);

// Superuser DB client (Bypasses RLS) - Use ONLY for Auth or Admin tasks
const sudoClient = hasDatabaseUrl ? postgres(process.env.SUDO_DATABASE_URL || process.env.DATABASE_URL!) : null;
export const sudoDb: Database = sudoClient ? drizzle(sudoClient, { schema }) : (null as unknown as Database);

// OpenTelemetry tracer for observability
const tracer = trace.getTracer("tenant-operations");

/**
 * Execute a callback within a tenant-scoped transaction.
 * 
 * CRITICAL: This is the ONLY way to execute tenant-scoped queries.
 * - Sets the RLS context variable for the duration of the transaction
 * - Ensures all queries within the callback are filtered by tenant_id
 * - Provides observability via OpenTelemetry spans
 * 
 * @param tenantId - The tenant UUID (from JWT or URL resolution)
 * @param callback - The function to execute within the transaction
 * @returns The result of the callback
 * 
 * @example
 * ```typescript
 * const products = await withTenant(tenantId, async (tx) => {
 *   return tx.select().from(products).where(eq(products.status, "active"));
 * });
 * ```
 */
export async function withTenant<T>(
  tenantId: string,
  callback: (tx: Transaction) => Promise<T>
): Promise<T> {
  // Validate tenant ID format
  if (!tenantId || !/^[0-9a-f-]{36}$/i.test(tenantId)) {
    throw new Error("Invalid tenant ID format");
  }
  
  return tracer.startActiveSpan(`db.tenant.${tenantId.slice(0, 8)}`, async (span) => {
    span.setAttribute("tenant.id", tenantId);
    
    try {
      return await db.transaction(async (tx) => {
        // Set RLS context - this is LOCAL to the transaction
        await tx.execute(sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`);
        
        const result = await callback(tx);
        
        span.setAttribute("db.success", true);
        return result;
      });
    } catch (error) {
      span.setAttribute("db.success", false);
      span.setAttribute("error.message", error instanceof Error ? error.message : "Unknown error");
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Execute a callback with platform admin privileges.
 * 
 * WARNING: This bypasses RLS. Use ONLY for:
 * - Tenant creation/deletion
 * - Cross-tenant analytics (platform admin only)
 * - System maintenance tasks
 * 
 * @param callback - The function to execute
 * @returns The result of the callback
 */
export async function withPlatformAdmin<T>(
  callback: (db: Database) => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan("db.platform_admin", async (span) => {
    span.setAttribute("db.admin_mode", true);
    
    try {
      const result = await callback(sudoDb);
      span.setAttribute("db.success", true);
      return result;
    } catch (error) {
      span.setAttribute("db.success", false);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### 4.3 Auth Middleware Patterns

```typescript
// src/middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Dashboard routes require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Verify tenant claim exists
    if (!req.auth.user.tenantId) {
      console.error("User without tenant_id attempted dashboard access", {
        userId: req.auth.user.id,
        path: pathname,
      });
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  
  // Editor routes require authentication
  if (pathname.startsWith("/storefront")) {
    if (!req.auth?.user?.tenantId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  
  // API routes - handled by route handlers
  // Store routes - tenant resolved from URL slug
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/storefront/:path*",
    "/api/dashboard/:path*",
  ],
};
```

### 4.4 Form Validation Patterns

```typescript
// src/lib/validations/products.ts
import { z } from "zod";

/**
 * Product validation schemas
 * Used for both client-side and server-side validation
 */

export const productBaseSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(200, "Name must be less than 200 characters"),
  slug: z.string()
    .min(1, "Slug is required")
    .max(200, "Slug must be less than 200 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string()
    .max(5000, "Description must be less than 5000 characters")
    .optional(),
  price: z.string()
    .regex(/^\d+(\.\d{2})?$/, "Price must be a valid amount (e.g., 29.99)"),
  compareAtPrice: z.string()
    .regex(/^\d+(\.\d{2})?$/, "Compare at price must be a valid amount")
    .optional()
    .nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  images: z.array(z.string().url()).max(10).default([]),
});

export const createProductSchema = productBaseSchema;

export const updateProductSchema = productBaseSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/**
 * Validate and parse form data for product creation
 */
export function parseProductFormData(formData: FormData): CreateProductInput {
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    status: formData.get("status") || "draft",
    images: JSON.parse(formData.get("images") as string || "[]"),
  };
  
  return createProductSchema.parse(rawData);
}
```

### 4.5 Error Response Pattern

```typescript
// src/lib/errors.ts

/**
 * Standard API error response format
 */
export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, string[]>;
  requestId?: string;
}

/**
 * Error codes for consistent error handling
 */
export const ErrorCodes = {
  // Auth errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_SESSION: "INVALID_SESSION",
  
  // Tenant errors
  TENANT_NOT_FOUND: "TENANT_NOT_FOUND",
  TENANT_SUSPENDED: "TENANT_SUSPENDED",
  
  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  
  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  
  // Payment errors
  PAYMENT_FAILED: "PAYMENT_FAILED",
  STRIPE_NOT_CONFIGURED: "STRIPE_NOT_CONFIGURED",
  
  // System errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  code: keyof typeof ErrorCodes,
  status: number,
  details?: Record<string, string[]>
): Response {
  const body: ApiError = {
    error,
    code: ErrorCodes[code],
    details,
    requestId: crypto.randomUUID(),
  };
  
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Application error class for typed errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: keyof typeof ErrorCodes,
    public status: number = 500,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }
  
  toResponse(): Response {
    return createErrorResponse(this.message, this.code, this.status, this.details);
  }
}
```

---

## 5. Multitenancy Safeguards

### 5.1 Safeguard Matrix

| Safeguard | What It Prevents | Implementation | Test Strategy |
|-----------|------------------|----------------|---------------|
| **S1: RLS Policies** | Direct DB access to other tenants | PostgreSQL policies on all tables | SQL injection tests |
| **S2: withTenant() Wrapper** | Queries without tenant context | Mandatory wrapper for all DB ops | Code review, linting |
| **S3: JWT Tenant Claim** | Session hijacking across tenants | Tenant ID in signed JWT | Token manipulation tests |
| **S4: URL Slug Validation** | Accessing non-existent stores | DB lookup → 404 | Fuzzing tests |
| **S5: Server-Side Tenant Extraction** | Client-provided tenant_id | Never trust request body | Penetration testing |
| **S6: File Path Prefixing** | Cross-tenant file access | `/{tenant_id}/` prefix | Path traversal tests |
| **S7: Stripe Metadata Validation** | Payment to wrong merchant | Verify tenant_id in webhook | Webhook replay tests |

### 5.2 Safeguard Implementation Details

#### S1: RLS Policies

```sql
-- Every tenant-scoped table MUST have this policy
CREATE POLICY tenant_isolation ON [table_name]
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
```

**Test:**
```typescript
// tests/security/rls.test.ts
describe("RLS Policies", () => {
  it("should not return data from other tenants", async () => {
    // Create product for tenant A
    const productA = await createProduct(tenantA.id, { name: "Product A" });
    
    // Query as tenant B
    const results = await withTenant(tenantB.id, async (tx) => {
      return tx.select().from(products);
    });
    
    // Should not include tenant A's product
    expect(results.find(p => p.id === productA.id)).toBeUndefined();
  });
  
  it("should prevent INSERT with wrong tenant_id", async () => {
    await expect(
      withTenant(tenantA.id, async (tx) => {
        return tx.insert(products).values({
          tenantId: tenantB.id, // Wrong tenant!
          name: "Malicious Product",
          slug: "malicious",
          price: "0",
        });
      })
    ).rejects.toThrow(); // RLS WITH CHECK prevents this
  });
});
```

#### S2: withTenant() Wrapper

```typescript
// CORRECT: All queries go through withTenant
const products = await withTenant(tenantId, async (tx) => {
  return tx.select().from(products);
});

// WRONG: Direct query without tenant context
// This should be caught by code review and linting
const products = await db.select().from(products); // ❌ NEVER DO THIS
```

**ESLint Rule (Custom):**
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    "no-direct-db-access": {
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.object?.name === "db" &&
              ["select", "insert", "update", "delete"].includes(node.callee.property?.name)
            ) {
              context.report({
                node,
                message: "Direct db access detected. Use withTenant() wrapper instead.",
              });
            }
          },
        };
      },
    },
  },
};
```

#### S3: JWT Tenant Claim

```typescript
// src/auth.config.ts - Tenant claim in JWT
callbacks: {
  jwt({ token, user }) {
    if (user) {
      token.id = user.id as string;
      token.role = (user as { role: string }).role;
      token.tenantId = (user as { tenantId: string }).tenantId; // CRITICAL
    }
    return token;
  },
  session({ session, token }) {
    if (token) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.tenantId = token.tenantId as string; // CRITICAL
    }
    return session;
  },
},
```

**Test:**
```typescript
// tests/security/jwt.test.ts
describe("JWT Tenant Claim", () => {
  it("should include tenantId in JWT", async () => {
    const session = await signIn(testUser);
    expect(session.user.tenantId).toBe(testUser.tenantId);
  });
  
  it("should reject modified JWT", async () => {
    const token = await getToken(testUser);
    const modifiedToken = modifyTenantId(token, otherTenantId);
    
    const response = await fetch("/api/dashboard/products", {
      headers: { Authorization: `Bearer ${modifiedToken}` },
    });
    
    expect(response.status).toBe(401);
  });
});
```

#### S4: URL Slug Validation

```typescript
// src/app/store/[slug]/layout.tsx
export default async function StoreLayout({ params }) {
  const { slug } = await params;
  
  // Resolve tenant - returns null if not found
  const tenant = await resolveBySlug(slug);
  
  if (!tenant) {
    notFound(); // Returns 404, never leaks data
  }
  
  // Continue with valid tenant context
}
```

**Test:**
```typescript
// tests/security/slug-validation.test.ts
describe("URL Slug Validation", () => {
  it("should return 404 for non-existent slug", async () => {
    const response = await fetch("/store/non-existent-store-12345");
    expect(response.status).toBe(404);
  });
  
  it("should not leak tenant existence via timing", async () => {
    const existingTime = await measureResponseTime("/store/existing-store");
    const nonExistingTime = await measureResponseTime("/store/non-existing");
    
    // Response times should be similar (within 50ms)
    expect(Math.abs(existingTime - nonExistingTime)).toBeLessThan(50);
  });
});
```

#### S5: Server-Side Tenant Extraction

```typescript
// CORRECT: Extract tenant from session (server-side)
export async function createProduct(formData: FormData) {
  const session = await auth();
  const tenantId = session?.user?.tenantId; // From JWT
  
  if (!tenantId) throw new Error("Unauthorized");
  
  return withTenant(tenantId, async (tx) => {
    // tenantId is trusted because it came from the signed JWT
  });
}

// WRONG: Trust client-provided tenant_id
export async function createProduct(formData: FormData) {
  const tenantId = formData.get("tenantId"); // ❌ NEVER DO THIS
  // Attacker can provide any tenant_id!
}
```

#### S6: File Path Prefixing

```typescript
// src/lib/services/storage.ts
import { put, del } from "@vercel/blob";

/**
 * Upload a file to tenant-scoped storage
 */
export async function uploadTenantFile(
  tenantId: string,
  category: "products" | "store" | "editor",
  filename: string,
  file: File
): Promise<string> {
  // Validate tenant ID format
  if (!/^[0-9a-f-]{36}$/i.test(tenantId)) {
    throw new Error("Invalid tenant ID");
  }
  
  // Sanitize filename to prevent path traversal
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  
  // Construct tenant-scoped path
  const path = `${tenantId}/${category}/${sanitizedFilename}`;
  
  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: true,
  });
  
  return blob.url;
}

/**
 * Delete a tenant file (validates ownership)
 */
export async function deleteTenantFile(
  tenantId: string,
  fileUrl: string
): Promise<void> {
  // Verify the URL belongs to this tenant
  const url = new URL(fileUrl);
  if (!url.pathname.includes(`/${tenantId}/`)) {
    throw new Error("File does not belong to this tenant");
  }
  
  await del(fileUrl);
}
```

#### S7: Stripe Metadata Validation

```typescript
// src/app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  // ... signature verification ...
  
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { tenant_id, cart_id } = paymentIntent.metadata;
    
    // CRITICAL: Validate metadata exists
    if (!tenant_id || !cart_id) {
      console.error("Missing metadata in payment intent", {
        paymentIntentId: paymentIntent.id,
      });
      return NextResponse.json({ received: true }); // Acknowledge but don't process
    }
    
    // CRITICAL: Validate tenant_id format
    if (!/^[0-9a-f-]{36}$/i.test(tenant_id)) {
      console.error("Invalid tenant_id format in webhook", { tenant_id });
      return NextResponse.json({ received: true });
    }
    
    // Process within tenant context
    await withTenant(tenant_id, async (tx) => {
      // Verify cart belongs to this tenant (RLS will enforce this)
      const cart = await tx.query.carts.findFirst({
        where: eq(carts.id, cart_id),
      });
      
      if (!cart) {
        throw new Error("Cart not found for tenant");
      }
      
      // Continue with order creation...
    });
  }
}
```

### 5.3 Security Test Suite

```typescript
// tests/security/cross-tenant.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestTenant, createTestUser, createTestProduct } from "./helpers";

describe("Cross-Tenant Security", () => {
  let tenantA: { id: string; slug: string };
  let tenantB: { id: string; slug: string };
  let userA: { id: string; token: string };
  let userB: { id: string; token: string };
  let productA: { id: string };
  
  beforeAll(async () => {
    tenantA = await createTestTenant("tenant-a");
    tenantB = await createTestTenant("tenant-b");
    userA = await createTestUser(tenantA.id);
    userB = await createTestUser(tenantB.id);
    productA = await createTestProduct(tenantA.id);
  });
  
  describe("API Access", () => {
    it("should not allow tenant B to access tenant A products via API", async () => {
      const response = await fetch(`/api/dashboard/products/${productA.id}`, {
        headers: { Authorization: `Bearer ${userB.token}` },
      });
      
      expect(response.status).toBe(404); // Not 403, to avoid leaking existence
    });
    
    it("should not allow tenant B to update tenant A products", async () => {
      const response = await fetch(`/api/dashboard/products/${productA.id}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${userB.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Hacked Product" }),
      });
      
      expect(response.status).toBe(404);
    });
  });
  
  describe("Storefront Access", () => {
    it("should only show tenant A products on tenant A store", async () => {
      const response = await fetch(`/api/store/${tenantA.slug}/products`);
      const data = await response.json();
      
      // All products should belong to tenant A
      data.products.forEach((product: any) => {
        expect(product.tenantId).toBe(tenantA.id);
      });
    });
  });
  
  describe("Direct Database Access", () => {
    it("should enforce RLS on direct queries", async () => {
      const results = await withTenant(tenantB.id, async (tx) => {
        return tx.select().from(products).where(eq(products.id, productA.id));
      });
      
      expect(results).toHaveLength(0); // RLS filters out tenant A's product
    });
  });
});
```

---

## 6. Known Limitations

### 6.1 Architectural Limitations

| Limitation | Why We Accepted It | Impact | Future Improvement |
|------------|-------------------|--------|-------------------|
| **Shared DB noisy neighbor** | Cost-effective for MVP, 2-engineer team | Potential performance impact under load | Connection pooling, read replicas, eventual sharding |
| **No custom domains** | DNS complexity, SSL provisioning | Less professional URLs | Add Vercel domain API integration |
| **Single region** | Cost, operational simplicity | Higher latency for distant users | Multi-region deployment |
| **No background jobs** | Complexity, additional infrastructure | Webhook reliability, email delays | Add Inngest or similar |
| **Inline email sending** | Simplicity | Potential request timeouts | Queue-based email service |

### 6.2 Feature Limitations

| Limitation | Why We Accepted It | Workaround | Future Improvement |
|------------|-------------------|------------|-------------------|
| **No multi-currency** | Complexity, limited initial market | Single currency per tenant | Currency conversion service |
| **Basic search** | Full-text search complexity | Database LIKE queries | Algolia/Meilisearch integration |
| **No inventory reservations** | Complexity | Simple quantity tracking | Reservation system with TTL |
| **Single payment method** | Stripe-only simplifies integration | Stripe handles multiple methods | Additional payment providers |
| **No draft orders** | Scope reduction | Direct checkout only | Draft order workflow |

### 6.3 Technical Debt Register

| Debt Item | Reason | Payback Trigger | Estimated Effort | Priority |
|-----------|--------|-----------------|------------------|----------|
| No database migration versioning | MVP speed | First breaking schema change | 2 days | Medium |
| Inline email sending | Simplicity | 100+ orders/day | 3 days | Medium |
| No background job queue | Complexity | Webhook reliability issues | 5 days | High |
| Single region deployment | Cost | International expansion | 3 days | Low |
| No rate limiting | MVP scope | Abuse incidents | 2 days | High |
| No audit logging | MVP scope | Compliance requirements | 4 days | Medium |
| Hardcoded email templates | MVP speed | Branding requirements | 2 days | Low |

### 6.4 Deviations from Architecture

| Deviation | Architecture Spec | Implementation | Reason |
|-----------|------------------|----------------|--------|
| **[DEVIATION] Cart storage** | Cookie-based cart ID | Database cart with cookie reference | Better persistence, supports guest → user conversion |
| **[DEVIATION] File storage** | Supabase Storage | Vercel Blob | Simpler integration, better Next.js compatibility |
| **[DEVIATION] Tenant resolution** | Middleware sets headers | Layout fetches tenant | Simpler implementation, avoids Edge Runtime limitations |

### 6.5 Risk Mitigation Status

| Risk (from PRD) | Mitigation Status | Notes |
|-----------------|-------------------|-------|
| R001: Tenant data leak | ✅ Mitigated | RLS + withTenant() + security tests |
| R002: Visual editor performance | ⚠️ Partial | Zustand state, needs performance testing |
| R003: Stripe verification delays | ⚠️ Partial | Clear onboarding UI, needs monitoring |
| R004: Scope creep | ✅ Mitigated | Clear P0/P1/P2 prioritization |
| R005: Database scaling | ⚠️ Partial | Connection pooling ready, replicas planned |

---

## 7. JSON Summary

```json
{
  "document_metadata": {
    "version": "1.0",
    "date": "2025-01",
    "author": "Senior Full-Stack Engineer",
    "status": "Ready for Implementation"
  },
  "confidence_score": 0.91,
  "implementation_summary": {
    "total_duration": "8 weeks",
    "team_size": 2,
    "phases": [
      {
        "name": "Foundation",
        "weeks": "1-2",
        "features": ["F001", "F002", "F003"],
        "priority": "P0"
      },
      {
        "name": "Core Commerce",
        "weeks": "3-4",
        "features": ["F005", "F006"],
        "priority": "P1"
      },
      {
        "name": "Checkout & Orders",
        "weeks": "5-6",
        "features": ["F007", "F008"],
        "priority": "P1"
      },
      {
        "name": "Visual Editor & Polish",
        "weeks": "7-8",
        "features": ["F004"],
        "priority": "P1"
      }
    ]
  },
  "tech_stack": {
    "framework": "Next.js 16 App Router",
    "database": "PostgreSQL (Supabase)",
    "orm": "Drizzle ORM",
    "auth": "NextAuth v5 + JWT",
    "payments": "Stripe Connect (Standard)",
    "storage": "Vercel Blob",
    "state": "Zustand",
    "validation": "Zod"
  },
  "critical_patterns": {
    "tenant_isolation": {
      "method": "RLS + withTenant() wrapper",
      "enforcement_points": [
        "Database (RLS policies)",
        "Application (withTenant wrapper)",
        "Auth (JWT tenant claim)",
        "API (URL slug validation)",
        "Storage (path prefixing)"
      ]
    },
    "data_access": {
      "dashboard": "JWT claim → authorizedAction()",
      "storefront": "URL slug → resolveBySlug() → withTenant()",
      "webhooks": "Payload metadata → signature verification"
    }
  },
  "security_safeguards": [
    {
      "id": "S1",
      "name": "RLS Policies",
      "prevents": "Direct DB access to other tenants"
    },
    {
      "id": "S2",
      "name": "withTenant() Wrapper",
      "prevents": "Queries without tenant context"
    },
    {
      "id": "S3",
      "name": "JWT Tenant Claim",
      "prevents": "Session hijacking across tenants"
    },
    {
      "id": "S4",
      "name": "URL Slug Validation",
      "prevents": "Accessing non-existent stores"
    },
    {
      "id": "S5",
      "name": "Server-Side Tenant Extraction",
      "prevents": "Client-provided tenant_id"
    },
    {
      "id": "S6",
      "name": "File Path Prefixing",
      "prevents": "Cross-tenant file access"
    },
    {
      "id": "S7",
      "name": "Stripe Metadata Validation",
      "prevents": "Payment to wrong merchant"
    }
  ],
  "data_models": {
    "existing": [
      "tenants",
      "users",
      "products",
      "product_variants",
      "inventory_levels",
      "stock_movements",
      "categories",
      "orders",
      "order_items",
      "order_status_history",
      "carts",
      "cart_items",
      "discounts",
      "voucher_codes"
    ],
    "new": [
      "store_configs"
    ],
    "inventory_note": "Inventory tracked at multiple levels: products.quantity (aggregate), product_variants.quantity (per variant), inventory_levels (location-based), stock_movements (audit trail).",
    "modifications": [
      {
        "table": "tenants",
        "changes": ["Add stripe_account_id", "Add stripe_onboarding_complete"]
      },
      {
        "table": "orders",
        "changes": ["Add stripe_payment_intent_id", "Add stripe_charge_id", "Add payment_status"]
      }
    ]
  },
  "api_endpoints": {
    "storefront_public": [
      "GET /api/store/[slug]/products",
      "GET /api/store/[slug]/products/[id]",
      "GET /api/store/[slug]/categories",
      "POST /api/store/[slug]/cart",
      "PUT /api/store/[slug]/cart/items",
      "DELETE /api/store/[slug]/cart/items/[id]",
      "POST /api/store/[slug]/checkout"
    ],
    "dashboard_authenticated": [
      "GET /api/dashboard/products",
      "POST /api/dashboard/products",
      "PUT /api/dashboard/products/[id]",
      "DELETE /api/dashboard/products/[id]",
      "GET /api/dashboard/orders",
      "PUT /api/dashboard/orders/[id]/status",
      "POST /api/dashboard/upload"
    ],
    "webhooks": [
      "POST /api/webhooks/stripe"
    ]
  },
  "known_limitations": [
    {
      "limitation": "Shared DB noisy neighbor",
      "impact": "Medium",
      "future_fix": "Connection pooling, read replicas"
    },
    {
      "limitation": "No custom domains",
      "impact": "Low",
      "future_fix": "Vercel domain API integration"
    },
    {
      "limitation": "No background jobs",
      "impact": "Medium",
      "future_fix": "Inngest integration"
    },
    {
      "limitation": "Single region",
      "impact": "Low",
      "future_fix": "Multi-region deployment"
    }
  ],
  "technical_debt": [
    {
      "item": "No background job queue",
      "effort_days": 5,
      "priority": "High"
    },
    {
      "item": "No rate limiting",
      "effort_days": 2,
      "priority": "High"
    },
    {
      "item": "Inline email sending",
      "effort_days": 3,
      "priority": "Medium"
    },
    {
      "item": "No audit logging",
      "effort_days": 4,
      "priority": "Medium"
    }
  ],
  "exit_criteria": {
    "phase_1": [
      "New tenant can register and receive isolated data space",
      "JWT contains valid tenantId claim",
      "Cross-tenant access tests pass (100% isolation)",
      "Store accessible via /store/[slug]"
    ],
    "phase_2": [
      "Merchant can create/edit/delete products",
      "Product images upload to tenant-scoped paths",
      "Shopper can add items to cart",
      "Cart persists across sessions"
    ],
    "phase_3": [
      "Merchant can connect Stripe account",
      "Shopper can complete purchase",
      "Order created on successful payment",
      "Merchant can view and update order status"
    ],
    "phase_4": [
      "Merchant can customize store layout",
      "Changes persist and reflect on storefront",
      "All P0/P1 features functional",
      "Security audit passed"
    ]
  },
  "success_metrics_alignment": {
    "time_to_first_store": {
      "target": "< 10 minutes",
      "implementation": "Streamlined registration → template selection → publish"
    },
    "tenant_isolation": {
      "target": "100%",
      "implementation": "RLS + withTenant() + 7 safeguards + security tests"
    },
    "merchant_activation_rate": {
      "target": "> 40%",
      "implementation": "Visual editor + simple product CRUD"
    }
  }
}
```

---

## Appendix A: File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/          # F001: Tenant Registration
│   ├── (editor)/
│   │   └── storefront/        # F004: Visual Editor
│   ├── api/
│   │   ├── store/[slug]/      # Storefront API
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   └── checkout/
│   │   ├── dashboard/         # Dashboard API
│   │   │   ├── products/
│   │   │   └── orders/
│   │   └── webhooks/
│   │       └── stripe/        # F007: Stripe Webhooks
│   ├── dashboard/             # Merchant Dashboard
│   │   ├── products/          # F005: Product CRUD
│   │   ├── orders/            # F008: Order Management
│   │   └── settings/
│   └── store/[slug]/          # F003: Tenant Slugs
│       ├── checkout/          # F007: Checkout
│       └── products/
├── db/
│   └── schema/                # Data Models
│       ├── tenants.ts
│       ├── products.ts
│       ├── orders.ts
│       ├── cart.ts
│       └── store-config.ts    # NEW
├── lib/
│   ├── actions.ts             # authorizedAction()
│   ├── db.ts                  # withTenant()
│   ├── tenant/                # Tenant Resolution
│   ├── store/                 # F006: Cart Provider
│   ├── stripe.ts              # Stripe Client
│   ├── stripe-connect.ts      # Stripe Connect
│   └── validations/           # Zod Schemas
└── middleware.ts              # Auth Middleware
```

## Appendix B: Related Documents

- [Product Requirements Document](./PRODUCT-REQUIREMENTS.md)
- [System Architecture Document](./SYSTEM-ARCHITECTURE.md)
- [Visual Editor Analysis](../VISUAL-EDITOR-ANALYSIS.md)
- [Supabase Integration Guide](../SUPABASE-INTEGRATION.md)

---

**Document Status:** Complete  
**Next Step:** Begin Phase 1 implementation  
**Dependencies:** Product Requirements (approved), System Architecture (approved)
