/**
 * Features Layer
 * 
 * Business domain modules containing feature-specific logic,
 * components, and data access.
 * 
 * Each feature is self-contained and exports its public API
 * through its index.ts file.
 */

// Feature modules
export * as products from "./products";
export * as orders from "./orders";
export * as customers from "./customers";
export * as categories from "./categories";

