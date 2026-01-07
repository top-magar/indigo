# Directory Structure Guide

## Overview

This project uses a **Feature-First Hybrid Architecture** that organizes code by business domain while maintaining shared infrastructure and UI layers.

## Architecture Layers

```
src/
├── app/                    # Next.js App Router (pages & API routes)
├── features/               # Business domain modules
├── shared/                 # Cross-feature shared code
├── infrastructure/         # Technical infrastructure
├── config/                 # Application configuration
├── db/                     # Database schema definitions
├── types/                  # Root-level TypeScript types
└── styles/                 # Global styles
```

## Layer Descriptions

### 1. Features (`src/features/`)

Business domain modules containing feature-specific logic, components, and data access.

```
features/
├── products/               # Product management
│   ├── components/         # Product-specific UI
│   ├── repositories/       # Product data access
│   ├── services/           # Product business logic
│   ├── workflows/          # Product workflows
│   ├── actions.ts          # Server actions
│   └── index.ts            # Public API
├── orders/                 # Order management
├── customers/              # Customer management
├── inventory/              # Inventory management
├── categories/             # Category management
├── collections/            # Collection management
├── analytics/              # Analytics & reporting
├── discounts/              # Discount engine
├── payments/               # Payment processing
├── editor/                 # Visual storefront editor
├── notifications/          # Notification system
└── attributes/             # Product attributes
```

### 2. Shared (`src/shared/`)

Cross-feature code used by multiple features.

```
shared/
├── components/             # Shared UI components
│   ├── ui/                 # Base UI primitives (shadcn)
│   ├── dashboard/          # Dashboard components
│   ├── store/              # Storefront components
│   ├── landing/            # Landing page components
│   └── media/              # Media picker
├── hooks/                  # Shared React hooks
├── types/                  # Shared TypeScript types
├── utils/                  # Utility functions
├── validations/            # Zod validation schemas
├── currency/               # Multi-currency support
├── i18n/                   # Internationalization
├── seo/                    # SEO utilities
├── offline/                # Offline support
├── store/                  # State management
└── data/                   # Shared data utilities
```

### 3. Infrastructure (`src/infrastructure/`)

Technical concerns and platform integrations.

```
infrastructure/
├── db/                     # Database connection & utilities
├── supabase/               # Supabase client & server
├── auth/                   # Authentication
├── services/               # Core services
│   ├── cache/              # Caching layer
│   ├── email/              # Email service
│   ├── domain/             # Domain management
│   ├── websocket/          # WebSocket server
│   └── ...
├── middleware/             # HTTP middleware
├── cache/                  # Cache layer
├── workflows/              # Workflow engine
├── inngest/                # Background jobs
├── feature-flags/          # Feature flag system
├── tenant/                 # Multi-tenancy
├── repositories/           # Base repository utilities
└── actions/                # Core server actions
```

## Import Path Aliases

```typescript
// Features (business domains)
import { productRepository } from "@/features/products/repositories";
import { OrderService } from "@/features/orders/services";

// Shared (cross-feature)
import { Button } from "@/shared/components/ui/button";
import { useOnboarding } from "@/shared/hooks";

// Infrastructure (technical)
import { CacheService } from "@/infrastructure/services/cache";
import { withTenant } from "@/infrastructure/db";

// Config & Types
import { cacheKeyPatterns } from "@/config/cache";
import type { BlockType } from "@/types/blocks";
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Directories | `kebab-case` | `feature-flags/` |
| Components | `PascalCase.tsx` | `ProductForm.tsx` |
| Hooks | `use-*.ts` | `use-currency.ts` |
| Types | `*.types.ts` | `order.types.ts` |
| Tests | `*.test.ts` | `cache.test.ts` |
| Stories | `*.stories.tsx` | `Button.stories.tsx` |

## Feature Module Structure

Each feature follows this structure:

```
features/[feature-name]/
├── components/             # Feature-specific UI
│   ├── [Component].tsx
│   └── index.ts
├── repositories/           # Data access layer
│   ├── [entity].ts
│   └── index.ts
├── services/               # Business logic
│   ├── actions.ts
│   └── index.ts
├── workflows/              # Complex operations (optional)
├── hooks/                  # Feature-specific hooks (optional)
├── types.ts                # Feature types
├── actions.ts              # Server actions
└── index.ts                # Public API (barrel export)
```

## Import Rules

1. **Features** can import from:
   - `@/shared/*`
   - `@/infrastructure/*`
   - `@/config/*`
   - `@/types/*`
   - Other features via their public API (`index.ts`)

2. **Shared** can import from:
   - `@/infrastructure/*`
   - `@/config/*`
   - `@/types/*`
   - Other shared modules

3. **Infrastructure** can import from:
   - `@/config/*`
   - `@/types/*`
   - `@/db/*`
   - Other infrastructure modules

4. **App Router** (`src/app/`) can import from:
   - `@/features/*`
   - `@/shared/*`
   - `@/config/*`
   - `@/types/*`

## Migration Status

This structure is being implemented incrementally. See:
- `RESTRUCTURING_ANALYSIS.md` - Current state analysis
- `IMPORT_MAPPING_GUIDE.md` - Import path changes
- `DETAILED_FILE_MAPPING.md` - File-by-file migration plan

---

**Last Updated:** January 2026
