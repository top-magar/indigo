# Deep Technical Comparison: MedusaJS vs Indigo

## Executive Summary

This document provides a comprehensive architectural analysis comparing MedusaJS patterns with Indigo's current implementation. The goal is to identify opportunities for systematic improvement by adapting MedusaJS's proven patterns while maintaining Indigo's Next.js-first approach.

| Aspect | MedusaJS | Indigo | Status |
|--------|----------|--------|--------|
| Architecture | Modular monolith with DI | Next.js + DI container | ✅ Implemented |
| Workflows | Saga-based with compensation | Saga-based workflows | ✅ Implemented |
| Events | Module-based event bus | In-memory event bus | ✅ Implemented |
| Type Safety | Full DTO/Entity separation | Full typing | ✅ Implemented |
| Testing | Built-in mocking via DI | DI-based mocking | ✅ Ready |

### Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| DI Container | ✅ Done | `lib/container/index.ts` |
| Workflow Engine | ✅ Done | `lib/workflows/engine.ts` |
| Product Workflows | ✅ Done | `lib/workflows/product/` |
| Order Workflows | ✅ Done | `lib/workflows/order/` |
| Event Bus | ✅ Done | `lib/services/event-bus.ts` |

---

## 1. High-Level Architecture Comparison

### MedusaJS Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Express)                     │
├─────────────────────────────────────────────────────────────┤
│                    Workflow Engine                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Step   │→ │  Step   │→ │  Step   │→ │  Step   │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Module Services                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Product  │ │  Order   │ │ Payment  │ │ Customer │       │
│  │ Module   │ │  Module  │ │  Module  │ │  Module  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│              Dependency Injection Container                  │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer (MikroORM)                     │
└─────────────────────────────────────────────────────────────┘
```

### Indigo Current Architecture (Post-Implementation)
```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js App Router                         │
├─────────────────────────────────────────────────────────────┤
│                    Server Actions                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Thin orchestration layer calling workflows          │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Workflow Engine                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Step   │→ │  Step   │→ │  Step   │→ │  Step   │        │
│  │ +comp   │  │ +comp   │  │ +comp   │  │ +comp   │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
├─────────────────────────────────────────────────────────────┤
│                 Service Layer + DI Container                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Product  │ │  Order   │ │ Payment  │ │  Email   │       │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│                    Event Bus                                 │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Client                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Breakdown by Category

### 2.1 Features

#### Core Domain Features

| Feature | MedusaJS | Indigo | Recommendation |
|---------|----------|--------|----------------|
| Products | Full variant/option system | Basic with metadata variants | Adopt variant model |
| Orders | State machine with changes | Simple status field | Add order changes |
| Payments | Multi-provider abstraction | Stripe-only | Add provider interface |
| Inventory | Multi-location tracking | Single quantity field | Add location support |
| Pricing | Rule-based with contexts | Fixed pricing | Add price lists |
| Promotions | Condition-based engine | Basic discount codes | Enhance conditions |

#### MedusaJS Product Module Structure
```typescript
// MedusaJS: Separate entities for variants, options, option values
Product → ProductVariant → ProductOptionValue
       → ProductOption → ProductOptionValue
       → ProductImage
       → ProductTag
       → ProductType
       → ProductCollection
```

#### Indigo Current Structure
```typescript
// Indigo: Flat product with JSON metadata
Product {
  id, name, slug, price, quantity,
  metadata: { variants: [...], tags: [...] }
}
```

### 2.2 Functions & Services

#### MedusaJS Service Pattern
```typescript
// MedusaJS: Dependency injection with decorators
export default class ProductModuleService extends MedusaService<...> {
  protected readonly productService_: ModulesSdkTypes.IMedusaInternalService<Product>
  protected readonly productVariantService_: ModulesSdkTypes.IMedusaInternalService<ProductVariant>
  
  constructor(
    { productService, productVariantService, ...deps }: InjectedDependencies,
    protected readonly moduleDeclaration: InternalModuleDeclaration
  ) {
    super(...arguments)
    this.productService_ = productService
    this.productVariantService_ = productVariantService
  }

  @InjectManager()
  @EmitEvents()
  async createProductVariants(
    data: CreateProductVariantDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductVariantDTO[]> {
    // Transaction-safe with automatic event emission
    const variants = await this.createVariants_(data, sharedContext)
    return this.baseRepository_.serialize(variants)
  }
}
```

#### Indigo Current Pattern
```typescript
// Indigo: Direct server actions
export async function createProduct(input: CreateProductInput) {
  const { supabase, tenantId } = await getAuthenticatedTenant()
  
  const { data, error } = await supabase
    .from("products")
    .insert({ tenant_id: tenantId, ...input })
    .select()
    .single()
    
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/products")
  return { product: data }
}
```

#### Key Differences

| Aspect | MedusaJS | Indigo |
|--------|----------|--------|
| Dependency Injection | Awilix container | None (direct imports) |
| Transaction Management | Decorator-based | Manual |
| Event Emission | Automatic via decorators | Manual eventBus calls |
| Context Propagation | MedusaContext decorator | None |
| Serialization | Repository-based | Direct return |

### 2.3 Workflows

#### MedusaJS Workflow Pattern
```typescript
// MedusaJS: Saga-based workflow with compensation
export const createProductsWorkflow = createWorkflow(
  createProductsWorkflowId,
  (input: WorkflowData<CreateProductsWorkflowInput>) => {
    // Step 1: Validate input
    validateProductInputStep({ products: input.products })
    
    // Step 2: Create products (with automatic rollback)
    const createdProducts = createProductsStep(productWithoutExternalRelations)
    
    // Step 3: Link to sales channels
    associateProductsWithSalesChannelsStep({ links: salesChannelLinks })
    
    // Step 4: Create variants (nested workflow)
    const createdVariants = createProductVariantsWorkflow.runAsStep(variantsInput)
    
    // Step 5: Emit events
    emitEventStep({
      eventName: ProductWorkflowEvents.CREATED,
      data: productIdEvents,
    })
    
    // Hook for extensions
    const productsCreated = createHook("productsCreated", {
      products: response,
      additional_data: input.additional_data,
    })
    
    return new WorkflowResponse(response, { hooks: [productsCreated] })
  }
)
```

#### Indigo Workflow Pattern (✅ Implemented)
```typescript
// Indigo: Saga-based workflow with compensation (lib/workflows/product/create-product.ts)
export async function createProductWorkflow(
  tenantId: string,
  input: CreateProductInput
): Promise<CreateProductWorkflowResult> {
  const supabase = await createClient();

  const context: WorkflowContext = {
    tenantId,
    supabase,
    completedSteps: [],
  };

  const steps = [
    validateProductStep,      // Step 1: Validate input
    createProductStep,        // Step 2: Create product (with compensation)
    createVariantsStep,       // Step 3: Create variants (with compensation)
    linkCollectionsStep,      // Step 4: Link collections (with compensation)
    emitProductCreatedStep,   // Step 5: Emit event
  ];

  return runWorkflow<CreateProductInput, CreateProductWorkflowResult>(
    steps,
    input,
    context
  );
}
```

#### Indigo Step Pattern (✅ Implemented)
```typescript
// Each step has forward and compensation logic (lib/workflows/product/steps.ts)
export const createProductStep = createStepWithCompensation<
  CreateProductInput,
  { product: Product; input: CreateProductInput },
  string // compensation data is the product ID
>(
  "create-product",
  // Forward execution
  async (input, context) => {
    const { supabase, tenantId } = context;
    const { data: product, error } = await supabase
      .from("products")
      .insert({ tenant_id: tenantId, ...input })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      data: { product, input },
      compensationData: product.id,
    };
  },
  // Compensation (rollback)
  async (productId, context) => {
    const { supabase, tenantId } = context;
    await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("tenant_id", tenantId);
  }
);
```

### 2.4 Implementations

#### Folder Structure Comparison

**MedusaJS Module Structure:**
```
packages/modules/product/src/
├── index.ts              # Module registration
├── joiner-config.ts      # Cross-module linking config
├── migrations/           # Database migrations
├── models/               # Entity definitions
├── repositories/         # Data access layer
├── schema/               # Validation schemas
├── services/             # Business logic
│   ├── product-module-service.ts
│   └── product-category.ts
├── types/                # TypeScript types
└── utils/                # Helper functions
```

**Indigo Current Structure (✅ Updated):**
```
lib/
├── container/
│   └── index.ts              # DI container ✅
├── workflows/
│   ├── engine.ts             # Workflow engine with compensation ✅
│   ├── index.ts              # Re-exports
│   ├── product/
│   │   ├── index.ts
│   │   ├── steps.ts          # Reusable product steps ✅
│   │   ├── create-product.ts # Create workflow ✅
│   │   ├── update-product.ts # Update workflow ✅
│   │   └── delete-product.ts # Delete workflow ✅
│   └── order/
│       ├── index.ts
│       ├── create-order.ts   # Create with inventory reservation ✅
│       ├── update-status.ts  # Status transitions ✅
│       └── cancel-order.ts   # Cancel with inventory restore ✅
├── services/
│   ├── index.ts              # Re-exports
│   ├── event-bus.ts          # Event system ✅
│   ├── product/
│   │   └── actions.ts
│   ├── order/
│   │   └── actions.ts
│   └── ...
└── supabase/
    └── ...

app/dashboard/products/
├── page.tsx                  # UI
├── actions.ts                # Server actions (can use workflows)
└── products-client.tsx
```

---

## 3. Concrete Improvement Recommendations

### 3.1 DI Container ✅ IMPLEMENTED

**Location:** `lib/container/index.ts`

```typescript
// Lightweight DI container with singleton support
import { container, ServiceKeys } from '@/lib/container'

// Register services
container.register('productService', (c) => 
  new ProductService({
    supabase: c.resolve('supabase'),
    eventBus: c.resolve('eventBus'),
  })
)

// Resolve services
const productService = container.resolve<ProductService>(ServiceKeys.PRODUCT_SERVICE)
```

### 3.2 Workflow Engine ✅ IMPLEMENTED

**Location:** `lib/workflows/engine.ts`

```typescript
// Saga-based workflow with automatic compensation
import { createStep, createStepWithCompensation, runWorkflow } from '@/lib/workflows'

// Create a step with compensation
const myStep = createStepWithCompensation(
  "step-id",
  async (input, context) => {
    // Forward execution
    const result = await doSomething(input)
    return { data: result, compensationData: result.id }
  },
  async (compensationData, context) => {
    // Rollback on failure
    await undoSomething(compensationData)
  }
)
```

### 3.3 Event System ✅ IMPLEMENTED

**Location:** `lib/services/event-bus.ts`

```typescript
// Extended event types for all domains
export type EventType =
  | 'order.created' | 'order.confirmed' | 'order.shipped' | 'order.cancelled'
  | 'product.created' | 'product.updated' | 'product.deleted'
  | 'variant.created' | 'variant.updated' | 'variant.deleted'
  | 'stock.updated' | 'stock.reserved' | 'stock.released'
  | 'customer.created' | 'customer.updated'
  // ... more events
```

---

## 4. Migration Strategy

### ✅ Phase 1: Foundation (COMPLETED)
1. ✅ Created DI container (`lib/container/index.ts`)
2. ✅ Created workflow engine (`lib/workflows/engine.ts`)
3. ✅ Extended event bus with more event types
4. ✅ Added events table migration (`scripts/supabase/016-events-and-history.sql`)

### ✅ Phase 2: Core Workflows (COMPLETED)
1. ✅ Product workflows (create, update, delete)
2. ✅ Order workflows (create, update-status, cancel)
3. ✅ Inventory reservation in order workflow
4. ✅ Automatic compensation on failure

### ✅ Phase 3: Integration (COMPLETED)
1. ✅ Updated `app/dashboard/products/actions.ts` to use workflows
2. ✅ Updated `app/dashboard/orders/actions.ts` to use workflows
3. ✅ Created return workflow (`lib/workflows/order/create-return.ts`)
4. ✅ Created refund workflow (`lib/workflows/order/process-refund.ts`)

### ✅ Phase 4: Advanced Features (COMPLETED)
1. ✅ Batch product operations (`lib/workflows/batch/batch-products.ts`)
2. ✅ Batch inventory operations (`lib/workflows/batch/batch-inventory.ts`)
3. ✅ Batch order operations (`lib/workflows/batch/batch-orders.ts`)
4. ✅ Order status history table
5. ✅ Inventory history table
6. ✅ Workflow executions table

### 📋 Phase 5: Testing & Optimization (PLANNED)
1. Add unit tests with mocked dependencies
2. Add integration tests for workflows
3. Performance optimization
4. Documentation

---

## 5. Implemented Workflows Reference

### 5.1 Product Workflows

#### Create Product Workflow
**Location:** `lib/workflows/product/create-product.ts`

```typescript
import { createProductWorkflow } from '@/lib/workflows/product'

// Usage in server action
const result = await createProductWorkflow(tenantId, {
  name: "Product Name",
  price: 29.99,
  variants: [
    { title: "Small", sku: "PROD-S", price: 29.99 },
    { title: "Large", sku: "PROD-L", price: 34.99 },
  ],
  collectionIds: ["col_123"],
})
// Returns: { product, variants }
// On failure: automatically rolls back all steps
```

**Steps:**
1. `validate-product-input` - Validates name, price, variants
2. `create-product` - Creates product record (with compensation)
3. `create-variants` - Creates variant records (with compensation)
4. `link-collections` - Links to collections (with compensation)
5. `emit-product-created` - Emits event

#### Update Product Workflow
**Location:** `lib/workflows/product/update-product.ts`

```typescript
import { updateProductWorkflow } from '@/lib/workflows/product'

const result = await updateProductWorkflow(tenantId, {
  productId: "prod_123",
  name: "Updated Name",
  price: 39.99,
  collectionIds: ["col_456"],
})
```

**Steps:**
1. `fetch-product-snapshot` - Captures current state for rollback
2. `update-product` - Updates product (with compensation)
3. `sync-collections` - Syncs collection links (with compensation)
4. `emit-product-updated` - Emits event

#### Delete Product Workflow
**Location:** `lib/workflows/product/delete-product.ts`

```typescript
import { deleteProductWorkflow } from '@/lib/workflows/product'

const result = await deleteProductWorkflow(tenantId, {
  productId: "prod_123",
})
```

**Steps:**
1. `validate-delete` - Checks for active orders
2. `delete-collection-links` - Removes collection associations
3. `delete-variants` - Removes variants
4. `delete-product` - Removes product
5. `emit-product-deleted` - Emits event

### 5.2 Order Workflows

#### Create Order Workflow
**Location:** `lib/workflows/order/create-order.ts`

```typescript
import { createOrderWorkflow } from '@/lib/workflows/order'

const result = await createOrderWorkflow(tenantId, {
  customerEmail: "customer@example.com",
  items: [
    { productId: "prod_123", quantity: 2, price: 29.99, title: "Product" },
  ],
  shippingAddress: {
    line1: "123 Main St",
    city: "New York",
    postalCode: "10001",
    country: "US",
  },
})
// Returns: { order }
// On failure: inventory is automatically restored
```

**Steps:**
1. `validate-order` - Validates items and checks inventory
2. `reserve-inventory` - Decrements stock (with compensation to restore)
3. `create-order-record` - Creates order (with compensation)
4. `create-order-items` - Creates line items (with compensation)
5. `emit-order-created` - Emits event

#### Update Order Status Workflow
**Location:** `lib/workflows/order/update-status.ts`

```typescript
import { updateOrderStatusWorkflow } from '@/lib/workflows/order'

const result = await updateOrderStatusWorkflow(tenantId, {
  orderId: "ord_123",
  status: "shipped",
  note: "Shipped via FedEx",
})
```

**Valid Transitions:**
- `pending` → `confirmed`, `cancelled`
- `confirmed` → `processing`, `cancelled`
- `processing` → `shipped`, `cancelled`
- `shipped` → `delivered`, `returned`
- `delivered` → `returned`, `completed`

#### Cancel Order Workflow
**Location:** `lib/workflows/order/cancel-order.ts`

```typescript
import { cancelOrderWorkflow } from '@/lib/workflows/order'

const result = await cancelOrderWorkflow(tenantId, {
  orderId: "ord_123",
  reason: "Customer requested cancellation",
})
// Automatically restores inventory
```

**Steps:**
1. `validate-cancellation` - Checks if order can be cancelled
2. `restore-inventory` - Restores stock quantities
3. `cancel-order` - Updates status to cancelled
4. `emit-cancellation-event` - Emits event

---

## 6. Key Takeaways

### ✅ Adopted from MedusaJS
1. **Workflow Engine** - Saga pattern with compensation for complex operations
2. **Step Pattern** - Reusable, testable units of work with rollback
3. **Event System** - Extended event types for all domains
4. **DI Container** - Clean dependency injection for services
5. **Context Propagation** - Tenant and Supabase context through workflows

### ✅ Kept from Indigo
1. **Next.js Server Actions** - Thin orchestration layer calling workflows
2. **Supabase Integration** - Continue using for data layer
3. **Multi-tenant Pattern** - Current tenant isolation works well
4. **Simple Actions** - Not everything needs workflows (simple CRUD)

### Hybrid Approach in Practice
```typescript
// Simple operation - direct action
export async function updateProductStatus(productId: string, status: string) {
  const { supabase, tenantId } = await getAuthenticatedTenant()
  await supabase.from("products").update({ status }).eq("id", productId)
  revalidatePath("/dashboard/products")
}

// Complex operation - use workflow
export async function createProductWithVariants(formData: FormData) {
  const { tenantId } = await getAuthenticatedTenant()
  const input = parseFormData(formData)
  
  try {
    const result = await createProductWorkflow(tenantId, input)
    revalidatePath("/dashboard/products")
    return { success: true, productId: result.product.id }
  } catch (error) {
    // Workflow automatically compensated
    return { error: error.message }
  }
}
```

### Next Steps
1. **UI/UX Improvements** - See [MEDUSA-VS-INDIGO-UI-COMPARISON.md](./MEDUSA-VS-INDIGO-UI-COMPARISON.md)
2. **Add workflow hooks** - Allow extensions at key points
3. **Event persistence** - Optional database-backed event log
4. **Reusable DataTable** - URL-based state management component

---

## 7. UI/UX Comparison

For a detailed UI/UX comparison between MedusaJS Admin and Indigo Dashboard, see:
**[MEDUSA-VS-INDIGO-UI-COMPARISON.md](./MEDUSA-VS-INDIGO-UI-COMPARISON.md)**

Key findings:
- **Layout**: Both use sidebar + main content, Indigo has command palette (⌘K)
- **Data Tables**: MedusaJS has more built-in features, Indigo needs abstraction
- **Empty States**: Both have good patterns, Indigo more flexible
- **Forms**: MedusaJS uses react-hook-form, Indigo uses manual state
- **Modals**: MedusaJS has route-based modals (better UX)
- **Design Tokens**: Indigo's chart-1 through chart-5 pattern is cleaner

---

## Appendix: File References

### Indigo Implemented Files
- `lib/container/index.ts` - DI container ✅
- `lib/workflows/engine.ts` - Workflow engine with compensation ✅
- `lib/workflows/product/steps.ts` - Reusable product steps ✅
- `lib/workflows/product/create-product.ts` - Create product workflow ✅
- `lib/workflows/product/update-product.ts` - Update product workflow ✅
- `lib/workflows/product/delete-product.ts` - Delete product workflow ✅
- `lib/workflows/order/create-order.ts` - Create order with inventory ✅
- `lib/workflows/order/update-status.ts` - Status transitions ✅
- `lib/workflows/order/cancel-order.ts` - Cancel with inventory restore ✅
- `lib/workflows/order/create-return.ts` - Return request workflow ✅
- `lib/workflows/order/process-refund.ts` - Refund processing workflow ✅
- `lib/workflows/batch/batch-products.ts` - Bulk product operations ✅
- `lib/workflows/batch/batch-inventory.ts` - Bulk inventory operations ✅
- `lib/workflows/batch/batch-orders.ts` - Bulk order operations ✅
- `lib/services/event-bus.ts` - Extended event system ✅
- `scripts/supabase/016-events-and-history.sql` - Events & history tables ✅

### Integrated Server Actions
- `app/dashboard/products/actions.ts` - Now uses product workflows ✅
- `app/dashboard/orders/actions.ts` - Now uses order workflows ✅

### MedusaJS Reference Files
- `resources/medusa-develop/packages/modules/product/src/services/product-module-service.ts`
- `resources/medusa-develop/packages/core/core-flows/src/product/workflows/create-products.ts`
- `resources/medusa-develop/packages/core/core-flows/src/product/steps/create-products.ts`
- `resources/medusa-develop/packages/core/modules-sdk/src/medusa-module.ts`
