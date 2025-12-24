# Design Document: Multi-Tenant Vercel Platforms

## Overview

This design transforms Indigo from a URL-path-based tenant routing (`/store/[tenantId]`) to a production-grade multi-tenant platform using subdomain and custom domain routing. The architecture leverages Vercel's edge middleware for tenant resolution, PostgreSQL RLS for data isolation, and Vercel's Domain API for custom domain management.

### Current State Analysis

**Strengths (Already Implemented):**
- PostgreSQL RLS with `app.current_tenant` context variable
- `authorizedAction()` wrapper for authenticated tenant-scoped operations
- `publicStorefrontAction()` wrapper for public tenant-scoped operations
- Tenant-scoped schema with `tenant_id` foreign keys on all tables
- NextAuth with tenant context in JWT/session

**Gaps to Address:**
- No subdomain-based tenant resolution
- No custom domain support
- Middleware only handles auth, not tenant routing
- Tenant schema lacks `slug` field for subdomain routing
- No domain verification or Vercel API integration

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DNS Layer                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  *.indigo.com (Wildcard)  →  Vercel                                         │
│  custom-domain.com        →  Vercel (CNAME/A Record)                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Vercel Edge Network                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  SSL Termination (Automatic)                                                │
│  Request Routing                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Edge Middleware                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Parse hostname                                                          │
│  2. Check if platform domain → pass through to marketing/dashboard          │
│  3. Check if subdomain → resolve tenant by slug                             │
│  4. Check if custom domain → resolve tenant by domain lookup                │
│  5. Set x-tenant-id, x-tenant-slug headers                                  │
│  6. Rewrite to /store/[domain] with tenant context                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  /(marketing)  → Landing page (indigo.com)                                  │
│  /(auth)       → Login/Register (indigo.com/login)                          │
│  /dashboard    → Merchant dashboard (indigo.com/dashboard)                  │
│  /store/[domain] → Tenant storefront (rewritten from subdomain/custom)      │
│  /api          → API routes                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Data Layer                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL with RLS                                                        │
│  - app.current_tenant set per transaction                                   │
│  - All queries filtered by tenant_id                                        │
│  - Tenant lookup cached at edge (KV or in-memory)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Architecture

### Single Vercel Project Model

The platform uses a **single Vercel project** with wildcard subdomain support. This is the recommended approach because:

1. **Shared codebase**: All tenants run the same application version
2. **Simplified deployment**: One deployment updates all storefronts
3. **Cost efficiency**: Single project, shared edge network
4. **Wildcard SSL**: Vercel handles `*.indigo.com` automatically

### Request Flow

1. **DNS Resolution**: Request arrives at Vercel via wildcard DNS or custom domain CNAME
2. **Edge Middleware**: Parses hostname, resolves tenant, sets headers
3. **URL Rewrite**: Rewrites `acme.indigo.com/products` → `/store/acme/products`
4. **App Router**: Renders storefront with tenant context from headers
5. **Data Access**: RLS enforces tenant isolation at database level

## Components and Interfaces

### 1. Tenant Resolution Service

```typescript
// lib/tenant/resolver.ts

export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  plan: string;
}

export interface TenantResolver {
  resolveBySlug(slug: string): Promise<TenantInfo | null>;
  resolveByDomain(domain: string): Promise<TenantInfo | null>;
}
```

**Implementation Strategy:**
- Use edge-compatible database client (Neon serverless driver or Vercel Postgres)
- Cache tenant lookups in Vercel KV or edge cache (TTL: 5 minutes)
- Invalidate cache on tenant update via webhook

### 2. Middleware Tenant Resolution

```typescript
// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "indigo.com";
const PLATFORM_HOSTS = [
  PLATFORM_DOMAIN,
  `www.${PLATFORM_DOMAIN}`,
  "localhost:3000",
];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // 1. Platform routes (marketing, dashboard, auth)
  if (isPlatformHost(hostname)) {
    return handlePlatformRequest(request);
  }

  // 2. Subdomain resolution
  const subdomain = extractSubdomain(hostname, PLATFORM_DOMAIN);
  if (subdomain) {
    return handleSubdomainRequest(request, subdomain);
  }

  // 3. Custom domain resolution
  return handleCustomDomainRequest(request, hostname);
}

function isPlatformHost(hostname: string): boolean {
  return PLATFORM_HOSTS.some(h => hostname.includes(h));
}

function extractSubdomain(hostname: string, platformDomain: string): string | null {
  if (!hostname.endsWith(platformDomain)) return null;
  const subdomain = hostname.replace(`.${platformDomain}`, "").split(":")[0];
  if (subdomain === "www" || subdomain === platformDomain) return null;
  return subdomain;
}
```

### 3. Domain Management Service

```typescript
// lib/services/domain/types.ts

export interface DomainService {
  addDomain(tenantId: string, domain: string): Promise<DomainRecord>;
  verifyDomain(domainId: string): Promise<VerificationResult>;
  removeDomain(domainId: string): Promise<void>;
  getDomainStatus(domainId: string): Promise<DomainStatus>;
}

export interface DomainRecord {
  id: string;
  tenantId: string;
  domain: string;
  verificationToken: string;
  verificationMethod: "cname" | "txt";
  status: "pending" | "verified" | "active" | "failed";
  vercelDomainId?: string;
  createdAt: Date;
  verifiedAt?: Date;
}

export interface VerificationResult {
  success: boolean;
  error?: string;
  dnsRecords?: DNSRecord[];
}
```

### 4. Vercel API Integration

```typescript
// lib/services/domain/vercel-api.ts

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;

export async function addDomainToVercel(domain: string): Promise<VercelDomainResponse> {
  const response = await fetch(
    `${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new VercelAPIError(error.error.message, error.error.code);
  }

  return response.json();
}

export async function removeDomainFromVercel(domain: string): Promise<void> {
  const response = await fetch(
    `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}?teamId=${VERCEL_TEAM_ID}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const error = await response.json();
    throw new VercelAPIError(error.error.message, error.error.code);
  }
}
```

## Data Models

### Extended Tenant Schema

```typescript
// db/schema/tenants.ts

import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").default("free").notNull(),
  settings: jsonb("settings").default({}).$type<TenantSettings>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("tenants_slug_idx").on(table.slug),
}));

export interface TenantSettings {
  theme?: {
    primaryColor?: string;
    logo?: string;
  };
  features?: {
    customDomain?: boolean;
    analytics?: boolean;
  };
}
```

### Tenant Domains Schema

```typescript
// db/schema/domains.ts

import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const tenantDomains = pgTable("tenant_domains", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  domain: text("domain").notNull().unique(),
  verificationToken: text("verification_token").notNull(),
  verificationMethod: text("verification_method").default("cname").notNull(),
  status: text("status").default("pending").notNull(), // pending, verified, active, failed
  vercelDomainId: text("vercel_domain_id"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
}, (table) => ({
  domainIdx: index("tenant_domains_domain_idx").on(table.domain),
  tenantIdx: index("tenant_domains_tenant_idx").on(table.tenantId),
}));
```

### Migration SQL

```sql
-- Add slug to tenants
ALTER TABLE tenants ADD COLUMN slug TEXT UNIQUE;
ALTER TABLE tenants ADD COLUMN plan TEXT DEFAULT 'free' NOT NULL;
ALTER TABLE tenants ADD COLUMN settings JSONB DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN updated_at TIMESTAMP DEFAULT NOW() NOT NULL;

-- Create index for slug lookups
CREATE INDEX tenants_slug_idx ON tenants(slug);

-- Create tenant_domains table
CREATE TABLE tenant_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  verification_token TEXT NOT NULL,
  verification_method TEXT DEFAULT 'cname' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  vercel_domain_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  verified_at TIMESTAMP
);

-- Create indexes for domain lookups
CREATE INDEX tenant_domains_domain_idx ON tenant_domains(domain);
CREATE INDEX tenant_domains_tenant_idx ON tenant_domains(tenant_id);

-- RLS policy for tenant_domains
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_domains_isolation ON tenant_domains
  USING (tenant_id::text = current_setting('app.current_tenant', true));
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Subdomain Resolution Consistency

*For any* valid tenant slug, resolving the subdomain `{slug}.{platform_domain}` SHALL always return the same tenant ID, and that tenant's data SHALL be accessible.

**Validates: Requirements 1.1, 1.2**

### Property 2: Custom Domain Resolution Consistency

*For any* verified custom domain, resolving the domain SHALL always return the associated tenant ID, and the resolution SHALL be idempotent.

**Validates: Requirements 2.1, 2.2**

### Property 3: Tenant Isolation Invariant

*For any* database query executed within a tenant context, the results SHALL only contain records where `tenant_id` matches the current tenant, regardless of the query structure.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 4: Domain Uniqueness Invariant

*For any* domain (subdomain slug or custom domain), there SHALL exist at most one tenant mapping, ensuring no domain collision.

**Validates: Requirements 1.4, 2.4, 10.3**

### Property 5: Verification Token Unpredictability

*For any* domain verification token generated by the system, the token SHALL be cryptographically random and not derivable from tenant or domain information.

**Validates: Requirements 2.5, 7.4**

### Property 6: Host Header Validation

*For any* incoming request, the middleware SHALL only process requests where the Host header matches either the platform domain pattern, a valid subdomain pattern, or a verified custom domain.

**Validates: Requirements 7.1, 7.2**

### Property 7: Middleware Header Injection Prevention

*For any* request processed by middleware, tenant context headers (`x-tenant-id`, `x-tenant-slug`) SHALL only be set by the middleware itself, never accepted from incoming requests.

**Validates: Requirements 3.3, 7.3**

## Error Handling

### Middleware Error Scenarios

| Scenario | Response | User Message |
|----------|----------|--------------|
| Unknown subdomain | 404 | "Store not found" |
| Unknown custom domain | 404 | "Store not found" |
| Unverified custom domain | 404 | "Store not found" |
| Invalid host header | 400 | "Bad request" |
| Database connection error | 503 | "Service temporarily unavailable" |

### Domain Verification Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `DNS_NOT_FOUND` | No DNS record exists | Add CNAME/A record |
| `WRONG_VALUE` | Record exists but wrong value | Update record value |
| `PROPAGATION_PENDING` | Record added but not propagated | Wait 24-48 hours |
| `DOMAIN_TAKEN` | Domain already registered | Contact support |

### Vercel API Error Handling

```typescript
export class VercelAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "VercelAPIError";
  }
}

const RETRYABLE_CODES = ["rate_limited", "internal_error"];

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof VercelAPIError && RETRYABLE_CODES.includes(error.code)) {
        lastError = error;
        await sleep(Math.pow(2, i) * 1000); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}
```

## Testing Strategy

### Unit Tests

1. **Hostname parsing**: Test `extractSubdomain()` with various inputs
2. **Tenant resolution**: Test resolver with valid/invalid slugs and domains
3. **Header injection**: Verify middleware strips incoming tenant headers
4. **Verification token generation**: Test randomness and format

### Property-Based Tests

Using a property-based testing library (e.g., fast-check for TypeScript):

1. **Subdomain extraction property**: For any valid subdomain string, extraction and reconstruction should be identity
2. **Tenant isolation property**: For any generated tenant ID and query, results only contain matching tenant_id
3. **Domain uniqueness property**: For any set of domain registrations, no two tenants share a domain

### Integration Tests

1. **End-to-end subdomain flow**: Create tenant → Access via subdomain → Verify data isolation
2. **Custom domain flow**: Add domain → Verify DNS → Activate → Access storefront
3. **Cross-tenant isolation**: Attempt to access Tenant A data from Tenant B context

### Test Configuration

```typescript
// Property tests should run minimum 100 iterations
// Tag format: Feature: multi-tenant-vercel-platforms, Property N: {property_text}

describe("Tenant Resolution", () => {
  // Feature: multi-tenant-vercel-platforms, Property 1: Subdomain Resolution Consistency
  it.prop([fc.string().filter(isValidSlug)])("subdomain resolution is consistent", async (slug) => {
    const tenant = await createTestTenant({ slug });
    const result1 = await resolver.resolveBySlug(slug);
    const result2 = await resolver.resolveBySlug(slug);
    expect(result1?.id).toBe(tenant.id);
    expect(result2?.id).toBe(tenant.id);
  });
});
```

## Environment Variables

```bash
# Platform Configuration
NEXT_PUBLIC_PLATFORM_DOMAIN=indigo.com
NEXT_PUBLIC_APP_URL=https://indigo.com

# Vercel API (for domain management)
VERCEL_API_TOKEN=xxx
VERCEL_PROJECT_ID=prj_xxx
VERCEL_TEAM_ID=team_xxx

# Database
DATABASE_URL=postgres://...
SUDO_DATABASE_URL=postgres://...  # Bypasses RLS

# Edge Cache (optional, for tenant resolution caching)
KV_REST_API_URL=xxx
KV_REST_API_TOKEN=xxx
```

## Vercel Project Configuration

1. **Wildcard Domain**: Add `*.indigo.com` to project domains
2. **Environment Variables**: Set all required env vars in Vercel dashboard
3. **Edge Middleware**: Ensure middleware runs at edge (default in Next.js 13+)
4. **Preview Domains**: Configure preview branch domain pattern
