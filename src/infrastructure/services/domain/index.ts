/**
 * Domain Service - Handles custom domain management for tenants
 * 
 * Requirements: 2.5, 6.1, 8.3
 */

import { authorizedAction } from "@/lib/actions";
import { tenantDomains, TenantDomain } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { removeDomainFromVercel, VercelAPIError } from "./vercel-api";

// Types
export interface DomainRecord {
  id: string;
  tenantId: string;
  domain: string;
  verificationToken: string;
  verificationMethod: string;
  status: string;
  vercelDomainId: string | null;
  errorMessage: string | null;
  createdAt: Date;
  verifiedAt: Date | null;
}

/**
 * Generate a cryptographically secure verification token
 * Uses 32 bytes of random data encoded as hex (64 characters)
 */
function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Validate domain format
 */
function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Convert database record to DomainRecord
 */
function toDomainRecord(record: TenantDomain): DomainRecord {
  return {
    id: record.id,
    tenantId: record.tenantId,
    domain: record.domain,
    verificationToken: record.verificationToken,
    verificationMethod: record.verificationMethod,
    status: record.status,
    vercelDomainId: record.vercelDomainId,
    errorMessage: record.errorMessage,
    createdAt: record.createdAt,
    verifiedAt: record.verifiedAt,
  };
}


/**
 * Add a custom domain for a tenant
 */
export async function addDomain(domain: string): Promise<DomainRecord> {
  if (!domain) {
    throw new Error("Domain is required");
  }

  const normalizedDomain = domain.toLowerCase().trim();

  if (!isValidDomain(normalizedDomain)) {
    throw new Error("Invalid domain format");
  }

  const result = await authorizedAction(async (tx, tenantId) => {
    const existing = await tx
      .select()
      .from(tenantDomains)
      .where(eq(tenantDomains.domain, normalizedDomain))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Domain is already registered");
    }

    const verificationToken = generateVerificationToken();

    const [record] = await tx
      .insert(tenantDomains)
      .values({
        tenantId,
        domain: normalizedDomain,
        verificationToken,
        verificationMethod: "cname",
        status: "pending",
      })
      .returning();

    return toDomainRecord(record);
  });

  revalidatePath("/dashboard/settings/domains");
  return result;
}

/**
 * Get all domains for the current tenant
 */
export async function getDomains(): Promise<DomainRecord[]> {
  return authorizedAction(async (tx, tenantId) => {
    const records = await tx
      .select()
      .from(tenantDomains)
      .where(eq(tenantDomains.tenantId, tenantId))
      .orderBy(tenantDomains.createdAt);

    return records.map(toDomainRecord);
  });
}


/**
 * Get a domain by ID (must belong to current tenant)
 */
export async function getDomainById(domainId: string): Promise<DomainRecord | null> {
  if (!domainId) {
    throw new Error("Domain ID is required");
  }

  return authorizedAction(async (tx, tenantId) => {
    const [record] = await tx
      .select()
      .from(tenantDomains)
      .where(
        and(
          eq(tenantDomains.id, domainId),
          eq(tenantDomains.tenantId, tenantId)
        )
      )
      .limit(1);

    return record ? toDomainRecord(record) : null;
  });
}

/**
 * Remove a domain (must belong to current tenant)
 */
export async function removeDomain(domainId: string): Promise<void> {
  if (!domainId) {
    throw new Error("Domain ID is required");
  }

  await authorizedAction(async (tx, tenantId) => {
    const [existing] = await tx
      .select()
      .from(tenantDomains)
      .where(
        and(
          eq(tenantDomains.id, domainId),
          eq(tenantDomains.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new Error("Domain not found");
    }

    if (existing.vercelDomainId || existing.status === "verified" || existing.status === "active") {
      try {
        await removeDomainFromVercel(existing.domain);
      } catch (error) {
        if (error instanceof VercelAPIError) {
          console.warn(`Failed to remove domain from Vercel: ${error.message} (code: ${error.code})`);
        } else {
          console.warn("Failed to remove domain from Vercel:", error);
        }
      }
    }

    await tx
      .delete(tenantDomains)
      .where(eq(tenantDomains.id, domainId));
  });

  revalidatePath("/dashboard/settings/domains");
}


/**
 * Update domain status (internal use)
 */
export async function updateDomainStatus(
  domainId: string,
  status: string,
  errorMessage?: string | null,
  vercelDomainId?: string | null
): Promise<DomainRecord | null> {
  return authorizedAction(async (tx, tenantId) => {
    const updateData: Partial<TenantDomain> = {
      status,
      errorMessage: errorMessage ?? null,
    };

    if (vercelDomainId !== undefined) {
      updateData.vercelDomainId = vercelDomainId;
    }

    if (status === "verified" || status === "active") {
      updateData.verifiedAt = new Date();
    }

    const [record] = await tx
      .update(tenantDomains)
      .set(updateData)
      .where(
        and(
          eq(tenantDomains.id, domainId),
          eq(tenantDomains.tenantId, tenantId)
        )
      )
      .returning();

    return record ? toDomainRecord(record) : null;
  });
}

// Re-export verification functions
export {
  verifyDomain,
  refreshDomainStatus,
  getDnsInstructions,
  VerificationErrorCodes,
  type VerificationResult,
  type DNSRecord,
} from "./verification";

// Re-export Vercel API functions
export {
  addDomainToVercel,
  removeDomainFromVercel,
  getDomainStatus as getVercelDomainStatus,
  isDomainReady,
  withRetry,
  VercelAPIError,
  type VercelDomainResponse,
  type DomainStatus as VercelDomainStatus,
} from "./vercel-api";
