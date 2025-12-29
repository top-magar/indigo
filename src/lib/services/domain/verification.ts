/**
 * Domain Verification Service - DNS verification for custom domains
 * 
 * Requirements: 2.6, 2.7, 6.3, 8.1, 8.2, 8.5
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
 * Supports both CNAME and TXT record verification methods
 * After DNS verification succeeds, adds domain to Vercel and checks SSL status
 * 
 * @param domainId - The domain ID to verify
 * @returns Verification result with success status and any errors
 */
export async function verifyDomain(domainId: string): Promise<VerificationResult> {
  if (!domainId) {
    return {
      success: false,
      error: "Domain ID is required",
      errorCode: VerificationErrorCodes.DOMAIN_NOT_FOUND,
    };
  }

  // Get domain record
  const domain = await getDomainById(domainId);
  
  if (!domain) {
    return {
      success: false,
      error: "Domain not found",
      errorCode: VerificationErrorCodes.DOMAIN_NOT_FOUND,
    };
  }

  // Try DNS verification based on method
  const dnsResult = domain.verificationMethod === "txt"
    ? await verifyTxtRecord(domain.domain, domain.verificationToken)
    : await verifyCnameRecord(domain.domain);

  // If DNS verification failed, update status and return
  if (!dnsResult.success) {
    await updateDomainStatus(domainId, "failed", dnsResult.error);
    return dnsResult;
  }

  // DNS verification succeeded - now add to Vercel
  try {
    const vercelResult = await withRetry(() => addDomainToVercel(domain.domain));
    
    // Store the Vercel domain info and update status to verified
    await updateDomainStatus(
      domainId,
      "verified",
      null,
      vercelResult.name // Store domain name as vercel_domain_id
    );

    // Check if SSL is already provisioned
    const sslStatus = await checkSslStatus(domain.domain, domainId);
    
    return {
      success: true,
      dnsRecords: dnsResult.dnsRecords,
    };
  } catch (error) {
    // Handle Vercel API errors gracefully
    if (error instanceof VercelAPIError) {
      // If domain already exists in Vercel, treat as success
      if (error.code === "domain_already_exists" || error.statusCode === 409) {
        await updateDomainStatus(domainId, "verified", null, domain.domain);
        
        // Check SSL status
        await checkSslStatus(domain.domain, domainId);
        
        return {
          success: true,
          dnsRecords: dnsResult.dnsRecords,
        };
      }

      await updateDomainStatus(
        domainId,
        "failed",
        `Vercel API error: ${error.message}`
      );

      return {
        success: false,
        error: `Failed to add domain to Vercel: ${error.message}`,
        errorCode: VerificationErrorCodes.VERCEL_API_ERROR,
        dnsRecords: dnsResult.dnsRecords,
      };
    }

    // Unknown error
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

/**
 * Check SSL status and update domain to "active" if ready
 * 
 * @param domain - The domain name
 * @param domainId - The domain ID in our database
 */
async function checkSslStatus(domain: string, domainId: string): Promise<boolean> {
  try {
    const status = await getDomainStatus(domain);
    
    if (status.sslReady) {
      await updateDomainStatus(domainId, "active", null);
      return true;
    }
    
    return false;
  } catch (error) {
    // SSL check failure is not critical - domain is still verified
    console.error("Failed to check SSL status:", error);
    return false;
  }
}

/**
 * Refresh domain status from Vercel
 * Useful for checking if SSL has been provisioned after initial verification
 * 
 * @param domainId - The domain ID to refresh
 * @returns Updated verification result
 */
export async function refreshDomainStatus(domainId: string): Promise<VerificationResult> {
  const domain = await getDomainById(domainId);
  
  if (!domain) {
    return {
      success: false,
      error: "Domain not found",
      errorCode: VerificationErrorCodes.DOMAIN_NOT_FOUND,
    };
  }

  // Only refresh if domain is already verified
  if (domain.status !== "verified" && domain.status !== "active") {
    return {
      success: false,
      error: "Domain must be verified before checking status",
      errorCode: VerificationErrorCodes.VERIFICATION_FAILED,
    };
  }

  try {
    const status = await getDomainStatus(domain.domain);
    
    if (status.sslReady) {
      await updateDomainStatus(domainId, "active", null);
      return { success: true };
    }

    if (!status.verified) {
      await updateDomainStatus(domainId, "failed", "Domain verification lost in Vercel");
      return {
        success: false,
        error: "Domain is no longer verified in Vercel",
        errorCode: VerificationErrorCodes.VERIFICATION_FAILED,
      };
    }

    // Still waiting for SSL
    return {
      success: true,
      error: "SSL certificate is still being provisioned",
      errorCode: VerificationErrorCodes.SSL_PENDING,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to check domain status: ${errorMessage}`,
      errorCode: VerificationErrorCodes.VERCEL_API_ERROR,
    };
  }
}


/**
 * Verify CNAME record points to Vercel
 * Checks if the domain has a CNAME record pointing to cname.vercel-dns.com
 */
async function verifyCnameRecord(domain: string): Promise<VerificationResult> {
  try {
    const records = await dns.resolveCname(domain);
    const dnsRecords: DNSRecord[] = records.map(value => ({
      type: "CNAME" as const,
      value,
    }));

    // Check if any CNAME points to Vercel
    const hasVercelCname = records.some(
      record => record.toLowerCase() === VERCEL_CNAME_TARGET
    );

    if (hasVercelCname) {
      return {
        success: true,
        dnsRecords,
      };
    }

    return {
      success: false,
      error: `CNAME record found but points to "${records[0]}" instead of "${VERCEL_CNAME_TARGET}". Please update your DNS settings.`,
      errorCode: VerificationErrorCodes.WRONG_VALUE,
      dnsRecords,
    };
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific DNS errors
      if (error.message.includes("ENODATA") || error.message.includes("ENOTFOUND")) {
        return {
          success: false,
          error: `No CNAME record found for ${domain}. Please add a CNAME record pointing to ${VERCEL_CNAME_TARGET}.`,
          errorCode: VerificationErrorCodes.DNS_NOT_FOUND,
        };
      }

      if (error.message.includes("ETIMEOUT")) {
        return {
          success: false,
          error: "DNS lookup timed out. This may indicate DNS propagation is still in progress. Please try again in a few minutes.",
          errorCode: VerificationErrorCodes.PROPAGATION_PENDING,
        };
      }
    }

    return {
      success: false,
      error: "Failed to verify CNAME record. Please ensure your DNS is configured correctly.",
      errorCode: VerificationErrorCodes.VERIFICATION_FAILED,
    };
  }
}

/**
 * Verify TXT record contains verification token
 * Checks for a TXT record at _vercel.{domain} containing the verification token
 */
async function verifyTxtRecord(domain: string, verificationToken: string): Promise<VerificationResult> {
  const txtDomain = `${TXT_RECORD_PREFIX}.${domain}`;

  try {
    const records = await dns.resolveTxt(txtDomain);
    // TXT records come as arrays of strings, flatten them
    const flatRecords = records.map(r => r.join(""));
    
    const dnsRecords: DNSRecord[] = flatRecords.map(value => ({
      type: "TXT" as const,
      value,
    }));

    // Check if any TXT record contains the verification token
    const hasValidToken = flatRecords.some(
      record => record.includes(verificationToken)
    );

    if (hasValidToken) {
      return {
        success: true,
        dnsRecords,
      };
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
          error: "DNS lookup timed out. This may indicate DNS propagation is still in progress. Please try again in a few minutes.",
          errorCode: VerificationErrorCodes.PROPAGATION_PENDING,
        };
      }
    }

    return {
      success: false,
      error: "Failed to verify TXT record. Please ensure your DNS is configured correctly.",
      errorCode: VerificationErrorCodes.VERIFICATION_FAILED,
    };
  }
}

/**
 * Get DNS instructions for domain verification
 * Returns human-readable instructions for setting up DNS
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
