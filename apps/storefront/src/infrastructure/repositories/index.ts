/**
 * Base Repository Infrastructure
 * 
 * Provides base repository utilities and patterns.
 */

// Re-export base utilities from original location (temporary)
export { executeInTenantContext, assertExists, validateTenantId } from "@/infrastructure/repositories/base";
export type { QueryOptions, PaginatedResult } from "@/infrastructure/repositories/base";
