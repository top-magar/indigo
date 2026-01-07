/**
 * Tenant Resolution Service
 * 
 * Provides tenant lookup by slug (subdomain) or custom domain.
 * These queries do NOT use RLS context as they are used for initial tenant identification.
 * 
 * Note: This module is imported dynamically by middleware to avoid Edge Runtime issues.
 * The actual database queries run in Node.js runtime via dynamic import.
 * 
 * Requirements: 1.1, 1.2, 2.1, 2.2
 */

import { eq } from "drizzle-orm";
import { tenants } from "../../db/schema/tenants";
import { tenantDomains } from "../../db/schema/domains";

// Lazy-load the database to avoid Edge Runtime issues
// The sudoDb is only accessed when the functions are called
async function getSudoDb() {
  const { sudoDb } = await import("@/infrastructure/db");
  return sudoDb;
}

/**
 * Tenant information returned by the resolver
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 5.2.1
 */
export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  plan: string;
  currency: string;
}

/**
 * Resolve a tenant by their subdomain slug.
 * 
 * @param slug - The subdomain slug (e.g., "acme" from "acme.indigo.com")
 * @returns TenantInfo if found, null otherwise
 * 
 * Requirements: 1.1, 1.2
 */
export async function resolveBySlug(slug: string): Promise<TenantInfo | null> {
  if (!slug || typeof slug !== "string") {
    return null;
  }

  const normalizedSlug = slug.toLowerCase().trim();
  
  if (!normalizedSlug) {
    return null;
  }

  try {
    const sudoDb = await getSudoDb();
    const result = await sudoDb
      .select({
        id: tenants.id,
        slug: tenants.slug,
        name: tenants.name,
        plan: tenants.plan,
        currency: tenants.currency,
      })
      .from(tenants)
      .where(eq(tenants.slug, normalizedSlug))
      .limit(1);

    if (result.length === 0 || !result[0].slug) {
      return null;
    }

    return {
      id: result[0].id,
      slug: result[0].slug,
      name: result[0].name,
      plan: result[0].plan,
      currency: result[0].currency || "NPR",
    };
  } catch (error) {
    console.error("Error resolving tenant by slug:", error);
    return null;
  }
}

/**
 * Resolve a tenant by their custom domain.
 * Only returns tenant info if the domain is verified or active.
 * 
 * @param domain - The custom domain (e.g., "acme-store.com")
 * @returns TenantInfo if found and verified, null otherwise
 * 
 * Requirements: 2.1, 2.2
 */
export async function resolveByDomain(domain: string): Promise<TenantInfo | null> {
  if (!domain || typeof domain !== "string") {
    return null;
  }

  const normalizedDomain = domain.toLowerCase().trim();
  
  if (!normalizedDomain) {
    return null;
  }

  try {
    const sudoDb = await getSudoDb();
    // Join tenant_domains with tenants to get tenant info
    // Only return if domain status is "verified" or "active"
    const result = await sudoDb
      .select({
        id: tenants.id,
        slug: tenants.slug,
        name: tenants.name,
        plan: tenants.plan,
        currency: tenants.currency,
        domainStatus: tenantDomains.status,
      })
      .from(tenantDomains)
      .innerJoin(tenants, eq(tenantDomains.tenantId, tenants.id))
      .where(eq(tenantDomains.domain, normalizedDomain))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const { domainStatus, slug, currency, ...tenantData } = result[0];

    // Only return tenant if domain is verified or active
    if (domainStatus !== "verified" && domainStatus !== "active") {
      return null;
    }

    // Ensure slug exists
    if (!slug) {
      return null;
    }

    return {
      ...tenantData,
      slug,
      currency: currency || "NPR",
    };
  } catch (error) {
    console.error("Error resolving tenant by domain:", error);
    return null;
  }
}

/**
 * TenantResolver interface for dependency injection and testing
 */
export interface TenantResolver {
  resolveBySlug(slug: string): Promise<TenantInfo | null>;
  resolveByDomain(domain: string): Promise<TenantInfo | null>;
}

/**
 * Default tenant resolver implementation
 */
export const tenantResolver: TenantResolver = {
  resolveBySlug,
  resolveByDomain,
};
