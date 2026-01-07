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
export * as inventory from "./inventory";
export * as categories from "./categories";
export * as collections from "./collections";
export * as analytics from "./analytics";
export * as attributes from "./attributes";
export * as discounts from "./discounts";
export * as payments from "./payments";
export * as editor from "./editor";
export * as notifications from "./notifications";
