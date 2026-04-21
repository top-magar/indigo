# Indigo Platform — Architecture

Rules for all code across the platform.

## Domain Map

```
Commerce:  products, orders, customers, inventory, categories, collections, discounts, gift-cards, cart, checkout
Storefront: editor, store rendering, published pages, custom domains, themes
Dashboard:  home, analytics, reviews, marketing, media, settings (10 sub-pages)
Infra:      auth, DB, storage, inngest, middleware, rate-limiting
```

## File Structure

| Domain | Location |
|--------|----------|
| Dashboard pages | `src/app/dashboard/{feature}/` |
| Store pages | `src/app/store/[slug]/` |
| Editor | `src/features/editor/` |
| API routes | `src/app/api/` |
| Feature modules | `src/features/{domain}/` |
| DB schemas | `src/db/schema/` |
| Shared UI | `src/components/ui/` |
| Infrastructure | `src/infrastructure/` |

## Patterns

### Server Components (Dashboard)
```tsx
// page.tsx — server component fetches data
export default async function Page() {
  const user = await requireUser();
  const data = await db.select()...where(eq(table.tenantId, user.tenantId));
  return <ClientComponent data={data} />;
}
```

### Server Actions
```tsx
'use server';
import { requireUser } from '@/lib/auth';
export async function doThing(input: Input) {
  const user = await requireUser();
  // Always scope by tenantId
  await db.update(table).set(data).where(eq(table.tenantId, user.tenantId));
  revalidatePath('/dashboard/...');
}
```

### Client Components
```tsx
'use client';
// Use shadcn/ui, Lucide icons, Tailwind
// Forms: react-hook-form + zod validation
// State: Zustand for complex state, useState for simple
```

## Auth Flow

```
Supabase Auth → users table (tenant_id, role) → requireUser() → { id, tenantId, email, role }
Roles: owner | admin | staff
```

## Key Infrastructure

| Service | Purpose | Location |
|---------|---------|----------|
| Supabase Auth | Login, signup, sessions | `src/infrastructure/supabase/` |
| Supabase Storage | Image/file uploads | bucket: `editor-assets` |
| Drizzle ORM | Type-safe queries | `src/infrastructure/db.ts` |
| Inngest | Background jobs | `src/infrastructure/inngest/` |
| Middleware | Auth, CSP, rate-limit, custom domains | `src/middleware.ts` |
