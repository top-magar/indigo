---
inclusion: always
---

# Indigo — Coding Patterns

Actual patterns used in this codebase. Follow these when writing new code.

---

## Auth Pattern

Canonical auth module: `src/lib/auth.ts`

```typescript
// In server components / server actions:
import { requireUser, getUser, getAuthenticatedClient } from "@/lib/auth"

// Get user (redirects to /login if not authenticated)
const user = await requireUser()  // returns AuthUser with tenantId

// Get user + supabase client together
const { user, supabase } = await getAuthenticatedClient()

// Nullable check (no redirect)
const user = await getUser()  // returns AuthUser | null
```

There is also `src/infrastructure/auth/session.ts` with `requireAuth()` and `requireTenant()` — but `src/lib/auth.ts` is the primary one used in dashboard pages and actions.

## Dashboard Page Pattern

Every dashboard page follows: `page.tsx` (server) → `{module}-client.tsx` (client) → `actions.ts` (server actions)

```
src/app/dashboard/products/
├── page.tsx                # Server component — fetches data, passes to client
├── products-client.tsx     # "use client" — all interactivity
├── actions.ts              # "use server" — data fetching actions
├── product-actions.ts      # "use server" — mutation actions (CRUD)
├── types.ts                # Types (server files can't export types)
├── loading.tsx             # Suspense loading skeleton
└── error.tsx               # Error boundary
```

## Server Action Pattern

```typescript
"use server"

import { requireUser } from "@/lib/auth"
import { createClient } from "@/infrastructure/supabase/server"
import { revalidatePath } from "next/cache"

// Always verify tenant ownership before mutations
async function verifyTenantOwnership(tenantId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) {
    throw new Error("Unauthorized: tenant mismatch")
  }
  return user
}

// Return { success, error } shape — not throw
export async function createProductAction(tenantId: string, data: CreateProductInput) {
  await verifyTenantOwnership(tenantId)
  const supabase = await createClient()

  const { data: result, error } = await supabase
    .from("products")
    .insert({ tenant_id: tenantId, ...data })
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath("/dashboard/products")
  return { success: true as const, product: result }
}
```

## Repository Pattern

Repositories use `withTenant()` for RLS-scoped queries via Drizzle ORM.

```typescript
import "server-only"
import { withTenant } from "@/infrastructure/db"

class ProductRepository {
  async findAll(tenantId: string) {
    return withTenant(tenantId, async (tx) => {
      return tx.select().from(products)
    })
  }
}

export const productRepository = new ProductRepository()
```

Helper from `src/infrastructure/repositories/base.ts`:
- `executeInTenantContext(tenantId, callback)` — wraps `withTenant`
- `assertExists(result, entityName)` — throws NOT_FOUND if null

## Tenant Resolution

Tenant is resolved in middleware from subdomain slug or custom domain:

```typescript
import { resolveBySlug, resolveByDomain } from "@/infrastructure/tenant/resolver"

// Returns TenantInfo { id, slug, name, plan, currency } or null
const tenant = await resolveBySlug("acme")
const tenant = await resolveByDomain("acme-store.com")
```

Tenant resolver uses `sudoDb` (no RLS) because it runs before auth context exists.

## Feature Module Structure

Each feature in `src/features/` follows:

```
src/features/{name}/
├── index.ts            # Public API — re-exports types, repositories, components
├── types.ts            # Type definitions
├── components/         # Feature-specific React components
├── repositories/       # Data access (Drizzle + withTenant)
└── actions.ts          # Server actions (if feature has its own)
```

Features export through barrel files. Import as: `import { productRepository } from "@/features/products"`

## Infrastructure Services

`src/infrastructure/services/` contains cross-cutting business logic:
- `ai.ts` — Bedrock AI integration
- `email.ts` — SES email service
- `storage.ts` — S3 file storage
- `cache.ts` — Caching layer
- `search.ts` — OpenSearch integration
- `factory.ts` — Service factory pattern
- `error-handler.ts` — Centralized error handling
- `rate-limiter.ts` — Rate limiting
- `validation.ts` — Input validation

AWS wrappers live in `src/infrastructure/aws/` — one file per service.

## Supabase Client Usage

```typescript
// Server-side (in server components, actions, API routes)
import { createClient } from "@/infrastructure/supabase/server"
const supabase = await createClient()

// Client-side (in "use client" components)
import { createClient } from "@/infrastructure/supabase/client"
const supabase = createClient()

// Admin (bypasses RLS — use sparingly)
import { createAdminClient } from "@/infrastructure/supabase/admin"
```

## Error Handling

```typescript
import { AppError } from "@/shared/errors"

// Throw typed errors
throw new AppError("Product not found", "NOT_FOUND")
throw new AppError("Unauthorized: tenant mismatch", "UNAUTHORIZED")

// In server actions, return error shape instead of throwing
return { success: false as const, error: error.message }
```

## File Conventions

- `"use server"` files cannot export types → put types in sibling `types.ts`
- `"use client"` components named `{module}-client.tsx`
- All imports use `@/` path alias (maps to `src/`)
- Verify after changes: `npx tsc --noEmit`
