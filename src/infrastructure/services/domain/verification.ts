/**
 * Domain Verification Service - DNS verification for custom domains
 */

import { promises as dns } from "dns";
import { getDomainById, updateDomainStatus } from "./index";
import {
  addDomainToVercel,
  getDomainStatus,
  withRetry,
  VercelAPIError,
} from "./vercel-api";

// Types
export interface VerificationResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  dnsRecords?: DNSRecord[];
}

export interface DNSRecord {
  type: "CNAME" | "TXT" | "A";
  value: string;
}

// Constants
const VERCEL_CNAME_TARGET = "cname.vercel-dns.com";
const TXT_RECORD_PREFIX = "_vercel";

// Error codes for specific failure scenarios
export const VerificationErrorCodes = {
  DNS_NOT_FOUND: "DNS_NOT_FOUND",
  WRONG_VALUE: "WRONG_VALUE",
  PROPAGATION_PENDING: "PROPAGATION_PENDING",
  DOMAIN_NOT_FOUND: "DOMAIN_NOT_FOUND",
  VERIFICATION_FAILED: "VERIFICATION_FAILED",
  VERCEL_API_ERROR: "VERCEL_API_ERROR",
  SSL_PENDING: "SSL_PENDING",
} as const;


/**
 * Verify a domain's DNS configuration
 */
export async function verifyDomain(domainId: string): Promise<VerificationResult> {
  if (!domainId) {
    return {
      success: false,
      error: "Domain ID is required",
      errorCode: VerificationErrorCodes.DOMAIN_NOT_FOUND,
    };
  }

  const domain = await getDomainById(domainId);
  
  if (!domain) {
    return {
      success: false,
      error: "Domain not found",
      errorCode: VerificationErrorCodes.DOMAIN_NOT_FOUND,
    };
  }

  const dnsResult = domain.verificationMethod === "txt"
    ? await verifyTxtRecord(domain.domain, domain.verificationToken)
    : await verifyCnameRecord(domain.domain);

  if (!dnsResult.success) {
    await updateDomainStatus(domainId, "failed", dnsResult.error);
    return dnsResult;
  }

  try {
    const vercelResult = await withRetry(() => addDomainToVercel(domain.domain));
    
    await updateDomainStatus(domainId, "verified", null, vercelResult.name);
    await checkSslStatus(domain.domain, domainId);
    
    return { success: true, dnsRecords: dnsResult.dnsRecords };
  } catch (error) {
    if (error instanceof VercelAPIError) {
      if (error.code === "domain_already_exists" || error.statusCode === 409) {
        await updateDomainStatus(domainId, "verified", null, domain.domain);
        await checkSslStatus(domain.domain, domainId);
        return { success: true, dnsRecords: dnsResult.dnsRecords };
      }

      await updateDomainStatus(domainId, "failed", `Vercel API error: ${error.message}`);
      return {
        success: false,
        error: `Failed to add domain to Vercel: ${error.message}`,
        errorCode: VerificationErrorCodes.VERCEL_API_ERROR,
        dnsRecords: dnsResult.dnsRecords,
      };
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await updateDomainStatus(domainId, "failed", errorMessage);
    return {
      success: false,
      error: `Failed to complete verification: ${errorMessage}`,
      errorCode: VerificationErrorCodes.VERIFICATION_FAILED,
      dnsRecords: dnsResult.dnsRecords,
    };
  }
}


async function checkSslStatus(domain: string, domainId: string): Promise<boolean> {
  try {
    const status = await getDomainStatus(domain);
    if (status.sslReady) {
      await updateDomainStatus(domainId, "active", null);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to check SSL status:", error);
    return false;
  }
}

export async function refreshDomainStatus(domainId: string): Promise<VerificationResult> {
  const domain = await getDomainById(domainId);
  
  if (!domain) {
    return { success: false, error: "Domain not found", errorCode: VerificationErrorCodes.DOMAIN_NOT_FOUND };
  }

  if (domain.status !== "verified" && domain.status !== "active") {
    return { success: false, error: "Domain must be verified before checking status", errorCode: VerificationErrorCodes.VERIFICATION_FAILED };
  }

  try {
    const status = await getDomainStatus(domain.domain);
    
    if (status.sslReady) {
      await updateDomainStatus(domainId, "active", null);
      return { success: true };
    }

    if (!status.verified) {
      await updateDomainStatus(domainId, "failed", "Domain verification lost in Vercel");
      return { success: false, error: "Domain is no longer verified in Vercel", errorCode: VerificationErrorCodes.VERIFICATION_FAILED };
    }

    return { success: true, error: "SSL certificate is still being provisioned", errorCode: VerificationErrorCodes.SSL_PENDING };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to check domain status: ${errorMessage}`, errorCode: VerificationErrorCodes.VERCEL_API_ERROR };
  }
}

async function verifyCnameRecord(domain: string): Promise<VerificationResult> {
  try {
    const records = await dns.resolveCname(domain);
    const dnsRecords: DNSRecord[] = records.map(value => ({ type: "CNAME" as const, value }));
    const hasVercelCname = records.some(record => record.toLowerCase() === VERCEL_CNAME_TARGET);

    if (hasVercelCname) {
      return { success: true, dnsRecords };
    }

    return {
      success: false,
      error: `CNAME record found but points to "${records[0]}" instead of "${VERCEL_CNAME_TARGET}".`,
      errorCode: VerificationErrorCodes.WRONG_VALUE,
      dnsRecords,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ENODATA") || error.message.includes("ENOTFOUND")) {
        return { success: false, error: `No CNAME record found for ${domain}.`, errorCode: VerificationErrorCodes.DNS_NOT_FOUND };
      }
      if (error.message.includes("ETIMEOUT")) {
        return { success: false, error: "DNS lookup timed out.", errorCode: VerificationErrorCodes.PROPAGATION_PENDING };
      }
    }
    return { success: false, error: "Failed to verify CNAME record.", errorCode: VerificationErrorCodes.VERIFICATION_FAILED };
  }
}

/**
 * Verify TXT record contains verification token
 */
async function verifyTxtRecord(domain: string, verificationToken: string): Promise<VerificationResult> {
  const txtDomain = `${TXT_RECORD_PREFIX}.${domain}`;

  try {
    const records = await dns.resolveTxt(txtDomain);
    const flatRecords = records.map(r => r.join(""));
    
    const dnsRecords: DNSRecord[] = flatRecords.map(value => ({
      type: "TXT" as const,
      value,
    }));

    const hasValidToken = flatRecords.some(record => record.includes(verificationToken));

    if (hasValidToken) {
      return { success: true, dnsRecords };
    }

    return {
      success: false,
      error: `TXT record found but does not contain the verification token. Please add a TXT record at ${txtDomain} with value "${verificationToken}".`,
      errorCode: VerificationErrorCodes.WRONG_VALUE,
      dnsRecords,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ENODATA") || error.message.includes("ENOTFOUND")) {
        return {
          success: false,
          error: `No TXT record found at ${txtDomain}. Please add a TXT record with value "${verificationToken}".`,
          errorCode: VerificationErrorCodes.DNS_NOT_FOUND,
        };
      }
      if (error.message.includes("ETIMEOUT")) {
        return {
          success: false,
          error: "DNS lookup timed out. DNS propagation may still be in progress.",
          errorCode: VerificationErrorCodes.PROPAGATION_PENDING,
        };
      }
    }
    return {
      success: false,
      error: "Failed to verify TXT record.",
      errorCode: VerificationErrorCodes.VERIFICATION_FAILED,
    };
  }
}

/**
 * Get DNS instructions for domain verification
 */
export function getDnsInstructions(domain: string, verificationToken: string, method: "cname" | "txt" = "cname"): {
  method: string;
  records: Array<{ type: string; name: string; value: string }>;
  instructions: string;
} {
  if (method === "txt") {
    return {
      method: "TXT Record",
      records: [
        {
          type: "TXT",
          name: `${TXT_RECORD_PREFIX}.${domain}`,
          value: verificationToken,
        },
      ],
      instructions: `Add a TXT record at ${TXT_RECORD_PREFIX}.${domain} with the verification token as the value.`,
    };
  }

  return {
    method: "CNAME Record",
    records: [
      {
        type: "CNAME",
        name: domain,
        value: VERCEL_CNAME_TARGET,
      },
    ],
    instructions: `Add a CNAME record for ${domain} pointing to ${VERCEL_CNAME_TARGET}.`,
  };
}
