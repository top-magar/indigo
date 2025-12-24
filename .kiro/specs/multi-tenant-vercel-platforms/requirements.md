# Requirements Document

## Introduction

This specification defines the requirements for upgrading the Indigo e-commerce platform to a full multi-tenant architecture using Vercel Platforms. The system will support subdomain-based routing (tenant.indigo.com), custom domain mapping (tenant.com), and secure tenant isolation while maintaining a single codebase deployment.

## Glossary

- **Tenant**: A customer/merchant using the Indigo platform with isolated data and storefront
- **Platform_Domain**: The primary domain (e.g., indigo.com) hosting the marketing site and dashboard
- **Subdomain_Store**: A tenant storefront accessed via subdomain (e.g., acme.indigo.com)
- **Custom_Domain**: A tenant's own domain mapped to their storefront (e.g., acme-store.com)
- **Middleware**: Edge function that intercepts requests to resolve tenant context
- **RLS**: Row-Level Security - PostgreSQL feature for tenant data isolation
- **Tenant_Context**: The resolved tenant information passed through the request lifecycle

## Requirements

### Requirement 1: Tenant Identification via Subdomain

**User Story:** As a tenant, I want my storefront accessible via a subdomain, so that my customers can easily find my store at a memorable URL.

#### Acceptance Criteria

1. WHEN a request arrives at `{slug}.{platform_domain}` THEN THE Middleware SHALL extract the subdomain and resolve it to a tenant ID
2. WHEN the subdomain matches a valid tenant slug THEN THE Middleware SHALL set the tenant context in request headers
3. WHEN the subdomain does not match any tenant THEN THE Middleware SHALL return a 404 response with a "Store not found" page
4. THE Tenant_Schema SHALL include a unique `slug` field for subdomain routing
5. WHEN a tenant is created THEN THE System SHALL validate the slug is URL-safe and unique

### Requirement 2: Custom Domain Support

**User Story:** As a tenant, I want to connect my own domain to my storefront, so that I can maintain my brand identity.

#### Acceptance Criteria

1. WHEN a request arrives at a custom domain THEN THE Middleware SHALL look up the domain in the tenant_domains table
2. WHEN the custom domain is verified and active THEN THE Middleware SHALL resolve it to the associated tenant ID
3. WHEN the custom domain is not found or unverified THEN THE Middleware SHALL return a 404 response
4. THE Tenant_Domains_Schema SHALL store domain, tenant_id, verification_status, and verified_at
5. WHEN a tenant adds a custom domain THEN THE System SHALL generate a verification token
6. WHEN DNS verification succeeds THEN THE System SHALL mark the domain as verified
7. THE System SHALL support both CNAME and A record verification methods

### Requirement 3: Middleware-Based Request Resolution

**User Story:** As a platform operator, I want all tenant resolution to happen at the edge, so that requests are fast and secure.

#### Acceptance Criteria

1. THE Middleware SHALL execute at the edge for all storefront requests
2. WHEN resolving a tenant THEN THE Middleware SHALL check subdomains before custom domains
3. THE Middleware SHALL set `x-tenant-id` and `x-tenant-slug` headers for downstream use
4. WHEN the request is for the platform domain (no subdomain) THEN THE Middleware SHALL route to marketing/dashboard
5. THE Middleware SHALL prevent host header spoofing by validating against known domains
6. WHEN tenant resolution fails THEN THE Middleware SHALL NOT expose internal error details

### Requirement 4: Data Isolation

**User Story:** As a tenant, I want my data completely isolated from other tenants, so that my business information is secure.

#### Acceptance Criteria

1. THE Database SHALL enforce RLS policies on all tenant-scoped tables
2. WHEN a query executes THEN THE RLS_Policy SHALL filter results by the current tenant context
3. THE System SHALL set `app.current_tenant` configuration before any tenant-scoped query
4. WHEN a request lacks valid tenant context THEN THE System SHALL reject data access attempts
5. THE System SHALL use separate database roles for public (RLS-enforced) and admin (bypass) operations

### Requirement 5: Storefront Routing Architecture

**User Story:** As a developer, I want clear separation between platform routes and tenant storefronts, so that the codebase is maintainable.

#### Acceptance Criteria

1. THE App_Router SHALL use route groups to separate platform and storefront concerns
2. WHEN a request is for a tenant storefront THEN THE System SHALL rewrite to `/store/[domain]` routes
3. THE Storefront_Routes SHALL access tenant context from headers set by middleware
4. WHEN rendering a storefront THEN THE System SHALL NOT require the tenant ID in the URL path
5. THE Dashboard_Routes SHALL remain protected and tenant-scoped via session

### Requirement 6: Domain Onboarding Flow

**User Story:** As a tenant, I want a guided process to connect my custom domain, so that I can complete setup without technical expertise.

#### Acceptance Criteria

1. WHEN a tenant initiates domain connection THEN THE System SHALL display required DNS records
2. THE System SHALL provide both CNAME and A record options for DNS configuration
3. WHEN a tenant requests verification THEN THE System SHALL check DNS records via API
4. WHEN verification succeeds THEN THE System SHALL call Vercel API to add the domain
5. IF verification fails THEN THE System SHALL display specific error messages with remediation steps
6. THE System SHALL support re-verification for failed attempts

### Requirement 7: Security Protections

**User Story:** As a platform operator, I want protection against multi-tenant security threats, so that the platform remains trustworthy.

#### Acceptance Criteria

1. THE Middleware SHALL validate the Host header against allowed domain patterns
2. WHEN a domain is not in the allowed list THEN THE System SHALL reject the request
3. THE System SHALL prevent tenant ID injection via URL parameters or headers
4. WHEN a custom domain is added THEN THE System SHALL verify ownership before activation
5. THE System SHALL rate-limit domain verification attempts per tenant
6. THE System SHALL log all domain-related operations for audit purposes

### Requirement 8: Vercel Platform Integration

**User Story:** As a platform operator, I want seamless integration with Vercel's domain management, so that SSL and routing work automatically.

#### Acceptance Criteria

1. WHEN a domain is verified THEN THE System SHALL add it to the Vercel project via API
2. THE System SHALL store the Vercel API response for domain status tracking
3. WHEN a domain is removed THEN THE System SHALL remove it from Vercel via API
4. THE System SHALL handle Vercel API errors gracefully with retry logic
5. WHEN Vercel provisions SSL THEN THE System SHALL update domain status to "active"

### Requirement 9: Environment and Deployment Strategy

**User Story:** As a developer, I want consistent behavior across preview and production environments, so that testing is reliable.

#### Acceptance Criteria

1. THE System SHALL use environment variables for platform domain configuration
2. WHEN in preview deployment THEN THE System SHALL use preview-specific domain patterns
3. THE System SHALL support wildcard subdomains in both preview and production
4. WHEN deploying THEN THE System SHALL NOT require code changes for domain configuration
5. THE System SHALL document required Vercel project settings for multi-tenant support

### Requirement 10: Tenant Schema Extensions

**User Story:** As a platform operator, I want the tenant model to support all multi-tenant features, so that the system is complete.

#### Acceptance Criteria

1. THE Tenant_Schema SHALL include: id, name, slug, plan, settings (JSONB), created_at, updated_at
2. THE Tenant_Domains_Schema SHALL include: id, tenant_id, domain, verification_token, verification_method, verified_at, vercel_domain_id, status, created_at
3. THE System SHALL enforce unique constraints on tenant.slug and tenant_domains.domain
4. WHEN a tenant is deleted THEN THE System SHALL cascade delete associated domains
5. THE System SHALL index tenant_domains.domain for fast lookup performance
