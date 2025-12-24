# Implementation Plan: Multi-Tenant Vercel Platforms

## Overview

This plan implements multi-tenant architecture with subdomain and custom domain routing for the Indigo platform. Tasks are ordered to build incrementally: schema first, then tenant resolution, then middleware, then domain management, and finally Vercel API integration.

## Tasks

- [x] 1. Extend tenant schema and create domain tables
  - [x] 1.1 Add slug, plan, settings, updated_at columns to tenants table
    - Create migration file `drizzle/0003_multi_tenant_domains.sql`
    - Add unique constraint and index on slug
    - Update `db/schema/tenants.ts` with new columns
    - _Requirements: 10.1, 1.4_

  - [x] 1.2 Create tenant_domains table with all required fields
    - Add to migration: id, tenant_id, domain, verification_token, verification_method, status, vercel_domain_id, error_message, created_at, verified_at
    - Create `db/schema/domains.ts` with table definition
    - Add RLS policy for tenant isolation
    - Add indexes on domain and tenant_id
    - _Requirements: 10.2, 10.3, 10.5_

  - [x] 1.3 Update schema exports and run migration
    - Update `db/schema/index.ts` to export domains
    - Update `db/schema.ts` re-export
    - Test migration with `pnpm drizzle-kit push`
    - _Requirements: 10.1, 10.2_

- [x] 2. Implement tenant resolution service
  - [x] 2.1 Create tenant resolver with slug and domain lookup
    - Create `lib/tenant/resolver.ts`
    - Implement `resolveBySlug(slug: string): Promise<TenantInfo | null>`
    - Implement `resolveByDomain(domain: string): Promise<TenantInfo | null>`
    - Use edge-compatible queries (no RLS context needed for lookup)
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [ ] 2.2 Write property test for subdomain resolution consistency
    - **Property 1: Subdomain Resolution Consistency**
    - **Validates: Requirements 1.1, 1.2, 3.3**

  - [ ]* 2.3 Write property test for custom domain resolution consistency
    - **Property 2: Custom Domain Resolution Consistency**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 2.4 Create slug validation utility
    - Create `lib/tenant/slug.ts`
    - Implement `isValidSlug(slug: string): boolean` - URL-safe, lowercase, no reserved words
    - Implement `generateSlug(name: string): string` - convert name to valid slug
    - Reserved slugs: www, api, app, admin, dashboard, login, store, etc.
    - _Requirements: 1.5_

  - [ ]* 2.5 Write property test for domain uniqueness
    - **Property 4: Domain Uniqueness Invariant**
    - **Validates: Requirements 1.4, 10.3**

- [x] 3. Implement multi-tenant middleware
  - [x] 3.1 Create hostname parsing utilities
    - Create `lib/tenant/hostname.ts`
    - Implement `extractSubdomain(hostname: string, platformDomain: string): string | null`
    - Implement `isPlatformHost(hostname: string): boolean`
    - Implement `isValidHostname(hostname: string): boolean`
    - _Requirements: 3.4, 7.1_

  - [x] 3.2 Rewrite middleware.ts for multi-tenant routing
    - Parse hostname from request
    - Check platform host → pass through to NextAuth
    - Check subdomain → resolve tenant → set headers → rewrite to /store/[domain]
    - Check custom domain → resolve tenant → set headers → rewrite to /store/[domain]
    - Return 404 for unknown hosts
    - Strip any incoming x-tenant-* headers (security)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.2, 3.3, 3.5, 7.3_

  - [ ]* 3.3 Write property test for host header validation
    - **Property 6: Host Header Validation**
    - **Validates: Requirements 7.1, 7.2, 3.5**

  - [ ]* 3.4 Write property test for header injection prevention
    - **Property 7: Middleware Header Injection Prevention**
    - **Validates: Requirements 3.3, 7.3**

- [x] 4. Update storefront routes to use tenant context from headers
  - [x] 4.1 Create tenant context helper for server components
    - Create `lib/tenant/context.ts`
    - Implement `getTenantFromHeaders(): TenantContext | null`
    - Read x-tenant-id and x-tenant-slug from headers
    - _Requirements: 5.3_

  - [x] 4.2 Update store routes to use header-based tenant context
    - Update `app/store/[domain]/page.tsx` to read tenant from headers
    - Update `app/store/[domain]/layout.tsx` if exists
    - Remove tenantId from URL params, use headers instead
    - _Requirements: 5.2, 5.4_

  - [x] 4.3 Update public actions to accept tenant from context
    - Update `lib/public-actions.ts` to optionally read tenant from headers
    - Maintain backward compatibility with explicit tenantId parameter
    - _Requirements: 4.3_

  - [ ]* 4.4 Write property test for tenant data isolation
    - **Property 3: Tenant Isolation Invariant**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 5. Checkpoint - Core multi-tenant routing
  - Ensure all tests pass
  - Test subdomain routing locally with hosts file
  - Verify tenant isolation works correctly
  - Ask the user if questions arise

- [x] 6. Implement domain management service
  - [x] 6.1 Create domain service with CRUD operations
    - Create `lib/services/domain/index.ts`
    - Implement `addDomain(tenantId: string, domain: string): Promise<DomainRecord>`
    - Implement `getDomains(tenantId: string): Promise<DomainRecord[]>`
    - Implement `getDomainById(domainId: string): Promise<DomainRecord | null>`
    - Implement `removeDomain(domainId: string): Promise<void>`
    - Generate cryptographically secure verification tokens
    - _Requirements: 2.5, 6.1_

  - [ ]* 6.2 Write property test for verification token unpredictability
    - **Property 5: Verification Token Unpredictability**
    - **Validates: Requirements 2.5, 7.4**

  - [x] 6.3 Implement DNS verification logic
    - Create `lib/services/domain/verification.ts`
    - Implement `verifyDomain(domainId: string): Promise<VerificationResult>`
    - Support CNAME verification (check for cname.vercel-dns.com)
    - Support TXT record verification (check for verification token)
    - Return detailed error messages for failures
    - _Requirements: 2.6, 2.7, 6.3_

  - [x] 6.4 Create domain management API routes
    - Create `app/api/dashboard/domains/route.ts` - GET (list), POST (add)
    - Create `app/api/dashboard/domains/[id]/route.ts` - GET, DELETE
    - Create `app/api/dashboard/domains/[id]/verify/route.ts` - POST
    - Use authorizedAction for tenant scoping
    - _Requirements: 6.1, 6.3, 6.6_

- [x] 7. Implement Vercel API integration
  - [x] 7.1 Create Vercel API client
    - Create `lib/services/domain/vercel-api.ts`
    - Implement `addDomainToVercel(domain: string): Promise<VercelDomainResponse>`
    - Implement `removeDomainFromVercel(domain: string): Promise<void>`
    - Implement `getDomainStatus(domain: string): Promise<DomainStatus>`
    - Add retry logic with exponential backoff
    - _Requirements: 8.1, 8.3, 8.4_

  - [x] 7.2 Integrate Vercel API with domain verification flow
    - After DNS verification succeeds, call Vercel API to add domain
    - Store vercel_domain_id in tenant_domains table
    - Update domain status to "active" when SSL is provisioned
    - Handle Vercel API errors gracefully
    - _Requirements: 8.1, 8.2, 8.5_

  - [x] 7.3 Implement domain removal with Vercel cleanup
    - When domain is removed, call Vercel API to remove
    - Handle case where domain doesn't exist in Vercel
    - _Requirements: 8.3_

- [x] 8. Create domain management UI
  - [x] 8.1 Create domains settings page
    - Create `app/dashboard/settings/domains/page.tsx`
    - List all domains for current tenant
    - Show status badges (pending, verified, active, failed)
    - _Requirements: 6.1_

  - [x] 8.2 Create add domain dialog
    - Create `components/dashboard/domains/add-domain-dialog.tsx`
    - Form to enter custom domain
    - Display DNS instructions after submission
    - Show CNAME and A record options
    - _Requirements: 6.1, 6.2_

  - [x] 8.3 Create domain verification UI
    - Create `components/dashboard/domains/domain-card.tsx`
    - Show verification status and instructions
    - "Verify" button to trigger DNS check
    - Display error messages with remediation steps
    - _Requirements: 6.3, 6.5, 6.6_

- [x] 9. Add environment configuration and documentation
  - [x] 9.1 Update environment variables
    - Add NEXT_PUBLIC_PLATFORM_DOMAIN to .env.example
    - Add VERCEL_API_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID
    - Document all required variables
    - _Requirements: 9.1_

  - [x] 9.2 Update next.config.ts for multi-tenant support
    - Add allowed hosts configuration if needed
    - Configure image domains for tenant assets
    - _Requirements: 9.3_

  - [x] 9.3 Create deployment documentation
    - Document Vercel project settings (wildcard domain, env vars)
    - Document DNS setup for platform domain
    - Document preview deployment behavior
    - _Requirements: 9.5_

- [x] 10. Final checkpoint - Complete multi-tenant platform
  - Ensure all tests pass
  - Test full domain onboarding flow
  - Verify Vercel API integration works
  - Test preview deployments
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests
- The existing RLS infrastructure is leveraged - no changes needed to core data isolation
- Middleware changes are the most critical - test thoroughly with various hostname patterns
- Vercel API integration requires API token with domain management permissions
- Local testing requires hosts file modification or use of localhost subdomains
