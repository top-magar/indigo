/**
 * Hostname Parsing Utilities
 * 
 * Provides utilities for parsing and validating hostnames in multi-tenant routing.
 * Used by middleware to extract subdomains and validate incoming requests.
 * 
 * Requirements: 3.4, 7.1
 */

/**
 * Default platform domain from environment or fallback
 */
const DEFAULT_PLATFORM_DOMAIN = "indigo.com";

/**
 * Get the platform domain from environment
 */
export function getPlatformDomain(): string {
  return process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || DEFAULT_PLATFORM_DOMAIN;
}

/**
 * Platform hosts that should be routed to marketing/dashboard (not tenant storefronts)
 */
export function getPlatformHosts(): string[] {
  const platformDomain = getPlatformDomain();
  return [
    platformDomain,
    `www.${platformDomain}`,
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
  ];
}

/**
 * Extract the subdomain from a hostname.
 * 
 * @param hostname - The full hostname (e.g., "acme.indigo.com" or "acme.indigo.com:3000")
 * @param platformDomain - The platform domain (e.g., "indigo.com")
 * @returns The subdomain if found (e.g., "acme"), null otherwise
 * 
 * Examples:
 * - extractSubdomain("acme.indigo.com", "indigo.com") → "acme"
 * - extractSubdomain("www.indigo.com", "indigo.com") → null (www is not a tenant)
 * - extractSubdomain("indigo.com", "indigo.com") → null (no subdomain)
 * - extractSubdomain("acme.indigo.com:3000", "indigo.com") → "acme"
 * - extractSubdomain("custom-domain.com", "indigo.com") → null (not a subdomain)
 * 
 * Requirements: 3.4
 */
export function extractSubdomain(hostname: string, platformDomain: string): string | null {
  if (!hostname || !platformDomain) {
    return null;
  }

  // Normalize: lowercase and remove port
  const normalizedHostname = hostname.toLowerCase().split(":")[0];
  const normalizedPlatformDomain = platformDomain.toLowerCase();

  // Check if hostname ends with platform domain
  if (!normalizedHostname.endsWith(`.${normalizedPlatformDomain}`)) {
    return null;
  }

  // Extract the subdomain part
  const subdomain = normalizedHostname.slice(0, -(normalizedPlatformDomain.length + 1));

  // Validate subdomain is not empty and not "www"
  if (!subdomain || subdomain === "www") {
    return null;
  }

  // Ensure subdomain doesn't contain additional dots (no nested subdomains)
  if (subdomain.includes(".")) {
    return null;
  }

  return subdomain;
}

/**
 * Check if a hostname is a platform host (marketing site, dashboard, etc.)
 * 
 * @param hostname - The hostname to check
 * @returns true if this is a platform host, false otherwise
 * 
 * Examples:
 * - isPlatformHost("indigo.com") → true
 * - isPlatformHost("www.indigo.com") → true
 * - isPlatformHost("localhost:3000") → true
 * - isPlatformHost("acme.indigo.com") → false (tenant subdomain)
 * - isPlatformHost("custom-domain.com") → false (custom domain)
 * 
 * Requirements: 3.4
 */
export function isPlatformHost(hostname: string): boolean {
  if (!hostname) {
    return false;
  }

  // Normalize: lowercase
  const normalizedHostname = hostname.toLowerCase();
  const platformHosts = getPlatformHosts();

  // Check exact match (with or without port)
  for (const platformHost of platformHosts) {
    if (normalizedHostname === platformHost) {
      return true;
    }
    // Also check without port for hosts that include port
    const hostnameWithoutPort = normalizedHostname.split(":")[0];
    const platformHostWithoutPort = platformHost.split(":")[0];
    if (hostnameWithoutPort === platformHostWithoutPort) {
      return true;
    }
  }

  return false;
}

/**
 * Validate if a hostname is well-formed and safe to process.
 * 
 * This prevents host header injection attacks by validating:
 * - Hostname is not empty
 * - Hostname doesn't contain invalid characters
 * - Hostname doesn't contain path traversal attempts
 * - Hostname length is reasonable
 * 
 * @param hostname - The hostname to validate
 * @returns true if valid, false otherwise
 * 
 * Requirements: 7.1
 */
export function isValidHostname(hostname: string): boolean {
  if (!hostname || typeof hostname !== "string") {
    return false;
  }

  // Remove port for validation
  const hostnameWithoutPort = hostname.split(":")[0];
  const port = hostname.split(":")[1];

  // Validate port if present
  if (port !== undefined) {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535 || port !== portNum.toString()) {
      return false;
    }
  }

  // Check length (max 253 characters for hostname per RFC 1035)
  if (hostnameWithoutPort.length === 0 || hostnameWithoutPort.length > 253) {
    return false;
  }

  // Check for invalid characters (only allow alphanumeric, hyphens, dots)
  // This prevents path traversal and injection attacks
  const validHostnamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  if (!validHostnamePattern.test(hostnameWithoutPort)) {
    // Special case for localhost and IP addresses
    if (hostnameWithoutPort === "localhost") {
      return true;
    }
    // Check for valid IPv4
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(hostnameWithoutPort)) {
      const parts = hostnameWithoutPort.split(".");
      return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }
    return false;
  }

  // Check each label (part between dots) is valid
  const labels = hostnameWithoutPort.split(".");
  for (const label of labels) {
    // Each label must be 1-63 characters
    if (label.length === 0 || label.length > 63) {
      return false;
    }
    // Labels cannot start or end with hyphen
    if (label.startsWith("-") || label.endsWith("-")) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a hostname is a potential custom domain (not platform or subdomain)
 * 
 * @param hostname - The hostname to check
 * @param platformDomain - The platform domain
 * @returns true if this could be a custom domain
 */
export function isCustomDomain(hostname: string, platformDomain: string): boolean {
  if (!hostname || !platformDomain) {
    return false;
  }

  // Not a platform host
  if (isPlatformHost(hostname)) {
    return false;
  }

  // Not a subdomain of platform
  const subdomain = extractSubdomain(hostname, platformDomain);
  if (subdomain !== null) {
    return false;
  }

  // Must be a valid hostname
  if (!isValidHostname(hostname)) {
    return false;
  }

  return true;
}
