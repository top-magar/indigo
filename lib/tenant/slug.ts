/**
 * Slug Validation and Generation Utilities
 * 
 * Provides utilities for validating and generating URL-safe tenant slugs.
 * Slugs are used for subdomain routing (e.g., "acme" in "acme.indigo.com").
 * 
 * Requirements: 1.5
 */

/**
 * Reserved slugs that cannot be used by tenants.
 * These are reserved for platform functionality.
 */
export const RESERVED_SLUGS = [
  // Platform routes
  "www",
  "api",
  "app",
  "admin",
  "dashboard",
  "login",
  "logout",
  "register",
  "signup",
  "signin",
  "store",
  "stores",
  
  // Common subdomains
  "mail",
  "email",
  "ftp",
  "cdn",
  "static",
  "assets",
  "images",
  "img",
  "media",
  "files",
  
  // Infrastructure
  "ns1",
  "ns2",
  "dns",
  "mx",
  "smtp",
  "pop",
  "imap",
  
  // Security & Auth
  "auth",
  "oauth",
  "sso",
  "security",
  
  // Support & Help
  "help",
  "support",
  "docs",
  "documentation",
  "status",
  "blog",
  "news",
  
  // Business
  "billing",
  "payment",
  "payments",
  "checkout",
  "account",
  "accounts",
  "settings",
  "profile",
  
  // Development
  "dev",
  "staging",
  "test",
  "demo",
  "preview",
  "sandbox",
  "local",
  "localhost",
  
  // Marketing
  "marketing",
  "promo",
  "landing",
  "home",
  "about",
  "contact",
  "pricing",
  "features",
  
  // Legal
  "legal",
  "terms",
  "privacy",
  "tos",
  "gdpr",
  "cookies",
] as const;

/**
 * Minimum and maximum slug length constraints
 */
export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 63; // DNS label limit

/**
 * Regex pattern for valid slugs:
 * - Starts with a lowercase letter
 * - Contains only lowercase letters, numbers, and hyphens
 * - Does not end with a hyphen
 * - No consecutive hyphens
 */
const SLUG_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * Check if a slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as typeof RESERVED_SLUGS[number]);
}

/**
 * Validate if a string is a valid tenant slug.
 * 
 * Rules:
 * - Must be lowercase
 * - Must be URL-safe (letters, numbers, hyphens only)
 * - Must start with a letter
 * - Must not end with a hyphen
 * - Must not contain consecutive hyphens
 * - Must be between 3 and 63 characters
 * - Must not be a reserved word
 * 
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 * 
 * Requirements: 1.5
 */
export function isValidSlug(slug: string): boolean {
  // Check type and basic constraints
  if (!slug || typeof slug !== "string") {
    return false;
  }

  // Check length constraints
  if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
    return false;
  }

  // Check if lowercase
  if (slug !== slug.toLowerCase()) {
    return false;
  }

  // Check pattern (URL-safe, starts with letter, no trailing hyphen, no consecutive hyphens)
  if (!SLUG_PATTERN.test(slug)) {
    return false;
  }

  // Check if reserved
  if (isReservedSlug(slug)) {
    return false;
  }

  return true;
}

/**
 * Generate a URL-safe slug from a name.
 * 
 * Transformation rules:
 * - Convert to lowercase
 * - Replace spaces and underscores with hyphens
 * - Remove non-alphanumeric characters (except hyphens)
 * - Collapse consecutive hyphens
 * - Remove leading/trailing hyphens
 * - Ensure starts with a letter (prepend 'store-' if needed)
 * - Truncate to max length
 * 
 * @param name - The name to convert to a slug
 * @returns A valid slug string
 * 
 * Requirements: 1.5
 */
export function generateSlug(name: string): string {
  if (!name || typeof name !== "string") {
    return "store";
  }

  let slug = name
    // Convert to lowercase
    .toLowerCase()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Remove non-alphanumeric characters (except hyphens)
    .replace(/[^a-z0-9-]/g, "")
    // Collapse consecutive hyphens
    .replace(/-+/g, "-")
    // Remove leading hyphens
    .replace(/^-+/, "")
    // Remove trailing hyphens
    .replace(/-+$/, "");

  // Ensure starts with a letter
  if (slug.length === 0 || !/^[a-z]/.test(slug)) {
    slug = "store-" + slug;
  }

  // Remove any leading hyphens that might have been created
  slug = slug.replace(/^-+/, "");

  // Truncate to max length, ensuring we don't cut in the middle of a word
  if (slug.length > SLUG_MAX_LENGTH) {
    slug = slug.substring(0, SLUG_MAX_LENGTH);
    // Remove trailing hyphen if truncation created one
    slug = slug.replace(/-+$/, "");
  }

  // Ensure minimum length
  if (slug.length < SLUG_MIN_LENGTH) {
    slug = slug.padEnd(SLUG_MIN_LENGTH, "0");
  }

  // If the generated slug is reserved, append a suffix
  if (isReservedSlug(slug)) {
    slug = slug + "-store";
    // Truncate again if needed
    if (slug.length > SLUG_MAX_LENGTH) {
      slug = slug.substring(0, SLUG_MAX_LENGTH).replace(/-+$/, "");
    }
  }

  return slug;
}

/**
 * Validation result with detailed error information
 */
export interface SlugValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a slug and return detailed error information.
 * 
 * @param slug - The slug to validate
 * @returns Validation result with error message if invalid
 */
export function validateSlug(slug: string): SlugValidationResult {
  if (!slug || typeof slug !== "string") {
    return { valid: false, error: "Slug is required" };
  }

  if (slug.length < SLUG_MIN_LENGTH) {
    return { valid: false, error: `Slug must be at least ${SLUG_MIN_LENGTH} characters` };
  }

  if (slug.length > SLUG_MAX_LENGTH) {
    return { valid: false, error: `Slug must be at most ${SLUG_MAX_LENGTH} characters` };
  }

  if (slug !== slug.toLowerCase()) {
    return { valid: false, error: "Slug must be lowercase" };
  }

  if (!/^[a-z]/.test(slug)) {
    return { valid: false, error: "Slug must start with a letter" };
  }

  if (/-$/.test(slug)) {
    return { valid: false, error: "Slug must not end with a hyphen" };
  }

  if (/--/.test(slug)) {
    return { valid: false, error: "Slug must not contain consecutive hyphens" };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: "Slug must only contain lowercase letters, numbers, and hyphens" };
  }

  if (isReservedSlug(slug)) {
    return { valid: false, error: "This slug is reserved and cannot be used" };
  }

  return { valid: true };
}
