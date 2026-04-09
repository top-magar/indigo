/**
 * Tenant Context Helper for Server Components
 * 
 * Provides utilities to read tenant context from headers set by middleware.
 * This enables server components to access tenant information without
 * relying on URL parameters.
 * 
 * Requirements: 5.3
 */

import { headers } from "next/headers";

/**
 * Tenant context information extracted from request headers
 */
export interface TenantContext {
  id: string;
  slug: string;
  name?: string;
}

/**
 * Header names used for tenant context
 */
const TENANT_HEADERS = {
  ID: "x-tenant-id",
  SLUG: "x-tenant-slug",
  NAME: "x-tenant-name",
} as const;

/**
 * Get tenant context from request headers set by middleware.
 * 
 * This function reads the tenant headers that were set by the middleware
 * during tenant resolution. It should be used in server components and
 * server actions to access the current tenant context.
 * 
 * @returns TenantContext if headers are present, null otherwise
 * 
 * @example
 * ```tsx
 * // In a server component
 * const tenant = await getTenantFromHeaders();
 * if (!tenant) {
 *   notFound();
 * }
 * // Use tenant.id, tenant.slug, tenant.name
 * ```
 */
export async function getTenantFromHeaders(): Promise<TenantContext | null> {
  const headersList = await headers();
  
  const id = headersList.get(TENANT_HEADERS.ID);
  const slug = headersList.get(TENANT_HEADERS.SLUG);
  const name = headersList.get(TENANT_HEADERS.NAME);
  
  // Both id and slug are required for a valid tenant context
  if (!id || !slug) {
    return null;
  }
  
  return {
    id,
    slug,
    name: name || undefined,
  };
}

/**
 * Get tenant ID from request headers.
 * 
 * Convenience function when only the tenant ID is needed.
 * 
 * @returns Tenant ID string or null if not present
 */
export async function getTenantIdFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get(TENANT_HEADERS.ID);
}

/**
 * Get tenant slug from request headers.
 * 
 * Convenience function when only the tenant slug is needed.
 * 
 * @returns Tenant slug string or null if not present
 */
export async function getTenantSlugFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get(TENANT_HEADERS.SLUG);
}

/**
 * Require tenant context from headers.
 * 
 * Similar to getTenantFromHeaders but throws an error if tenant context
 * is not available. Useful when tenant context is mandatory.
 * 
 * @throws Error if tenant context is not available
 * @returns TenantContext
 */
export async function requireTenantFromHeaders(): Promise<TenantContext> {
  const tenant = await getTenantFromHeaders();
  
  if (!tenant) {
    throw new Error("Tenant context not available in headers");
  }
  
  return tenant;
}
