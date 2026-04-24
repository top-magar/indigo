# Multi-Zones Architecture Guide

This document outlines how to split the Indigo platform into multiple Next.js applications (zones) for improved scalability and independent deployments.

> **Note**: Multi-Zones is an advanced pattern. Only implement when you need independent deployments or have multiple teams working on different parts of the application.

## Current Architecture

The platform currently runs as a single Next.js application:

```
indigo/
├── src/app/
│   ├── (marketing)/     # Landing pages, blog
│   ├── (auth)/          # Login, signup
│   ├── dashboard/       # Admin dashboard
│   ├── store/[slug]/    # Tenant storefronts
│   ├── (editor)/        # Visual editor
│   └── api/             # API routes
```

## Proposed Multi-Zone Split

For large-scale deployments, consider splitting into these zones:

### Zone 1: Marketing (`marketing.indigo.com` → `indigo.com`)
- Landing pages (`/`)
- Blog (`/blog`)
- Documentation (`/docs`)
- Pricing (`/pricing`)

### Zone 2: Dashboard (`dashboard.indigo.com` → `indigo.com/dashboard`)
- Admin dashboard (`/dashboard/*`)
- Settings (`/dashboard/settings/*`)
- Analytics (`/dashboard/analytics/*`)

### Zone 3: Storefronts (`stores.indigo.com` → `indigo.com/store/*`)
- Tenant stores (`/store/[slug]/*`)
- Checkout (`/store/[slug]/checkout`)
- Products (`/store/[slug]/products/*`)

### Zone 4: Editor (`editor.indigo.com` → `indigo.com/storefront`)
- Visual editor (`/storefront`)
- Preview mode

## Implementation

### Step 1: Configure Asset Prefix

Each zone needs a unique `assetPrefix` to avoid conflicts:

```typescript
// apps/dashboard/next.config.ts
const nextConfig = {
  assetPrefix: '/dashboard',
  // ... other config
}
```

```typescript
// apps/stores/next.config.ts
const nextConfig = {
  assetPrefix: '/stores',
  // ... other config
}
```

### Step 2: Configure Rewrites in Main Zone

The main zone (marketing) routes requests to other zones:

```typescript
// apps/marketing/next.config.ts
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Dashboard zone
        {
          source: '/dashboard',
          destination: `${process.env.DASHBOARD_URL}/dashboard`,
        },
        {
          source: '/dashboard/:path*',
          destination: `${process.env.DASHBOARD_URL}/dashboard/:path*`,
        },
        // Stores zone
        {
          source: '/store/:path*',
          destination: `${process.env.STORES_URL}/store/:path*`,
        },
        // Editor zone
        {
          source: '/storefront',
          destination: `${process.env.EDITOR_URL}/storefront`,
        },
      ],
    }
  },
}
```

### Step 3: Configure Server Actions

Allow cross-zone Server Actions:

```typescript
// All zones need this
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['indigo.com', '*.indigo.com'],
    },
  },
}
```

### Step 4: Monorepo Structure

Recommended monorepo structure using Turborepo:

```
indigo/
├── apps/
│   ├── marketing/       # Zone 1: Landing, blog
│   ├── dashboard/       # Zone 2: Admin dashboard
│   ├── stores/          # Zone 3: Tenant storefronts
│   └── editor/          # Zone 4: Visual editor
├── packages/
│   ├── ui/              # Shared UI components
│   ├── db/              # Database schema & queries
│   ├── auth/            # Shared authentication
│   ├── config/          # Shared configuration
│   └── types/           # Shared TypeScript types
├── turbo.json
└── package.json
```

### Step 5: Shared Packages

Create shared packages for common code:

```typescript
// packages/ui/src/index.ts
export * from './components/button'
export * from './components/card'
// ... other shared components

// packages/db/src/index.ts
export * from './schema'
export * from './queries'
export * from './client'

// packages/auth/src/index.ts
export * from './session'
export * from './providers'
```

## Deployment

### Vercel Deployment

Each zone deploys as a separate Vercel project:

1. **marketing** → `indigo.com` (primary domain)
2. **dashboard** → `dashboard-indigo.vercel.app`
3. **stores** → `stores-indigo.vercel.app`
4. **editor** → `editor-indigo.vercel.app`

Environment variables for routing:
```env
# In marketing zone
DASHBOARD_URL=https://dashboard-indigo.vercel.app
STORES_URL=https://stores-indigo.vercel.app
EDITOR_URL=https://editor-indigo.vercel.app
```

### Local Development

Use different ports for each zone:

```bash
# Terminal 1 - Marketing (port 3000)
cd apps/marketing && pnpm dev

# Terminal 2 - Dashboard (port 3001)
cd apps/dashboard && pnpm dev --port 3001

# Terminal 3 - Stores (port 3002)
cd apps/stores && pnpm dev --port 3002

# Terminal 4 - Editor (port 3003)
cd apps/editor && pnpm dev --port 3003
```

## Navigation Between Zones

### Soft Navigation (Same Zone)
Use `<Link>` for navigation within the same zone:

```tsx
import Link from 'next/link'

// Within dashboard zone
<Link href="/dashboard/products">Products</Link>
```

### Hard Navigation (Cross Zone)
Use `<a>` tags for navigation between zones:

```tsx
// From dashboard to store (different zones)
<a href="/store/my-store">View Store</a>

// From store to dashboard (different zones)
<a href="/dashboard">Back to Dashboard</a>
```

## When to Use Multi-Zones

✅ **Good Use Cases:**
- Multiple teams working independently
- Different release cycles for different parts
- Very large codebases with slow build times
- Need to use different frameworks for different parts
- Gradual migration from another framework

❌ **Avoid When:**
- Small to medium applications
- Single team managing everything
- Heavy code sharing between sections
- Build times are acceptable
- No need for independent deployments

## Migration Path

1. **Phase 1**: Set up monorepo structure with shared packages
2. **Phase 2**: Extract marketing zone (lowest risk)
3. **Phase 3**: Extract dashboard zone
4. **Phase 4**: Extract stores zone
5. **Phase 5**: Extract editor zone

## Resources

- [Next.js Multi-Zones Documentation](https://nextjs.org/docs/app/guides/multi-zones)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Vercel Multi-Zone Example](https://github.com/vercel/next.js/tree/canary/examples/with-zones)
