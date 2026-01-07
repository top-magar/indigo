// Re-export all schema tables for convenience
// This maintains backward compatibility with existing imports from "db/schema"

// Core
export * from "./tenants";
export * from "./users";

// Products & Catalog (includes categories)
export * from "./products";

// Customers (must be before orders due to dependency)
export * from "./customers";

// Collections & Attributes
export * from "./collections";
export * from "./attributes";

// Orders & Fulfillment (depends on customers, products)
export * from "./orders";

// Inventory
export * from "./inventory";

// Cart & Checkout
export * from "./cart";

// Discounts & Marketing
export * from "./discounts";
export * from "./campaigns";

// Store Configuration
export * from "./store-config";
export * from "./domains";
export * from "./media";

// Audit Logging
export * from "./audit-logs";

// Notification Preferences
export * from "./notification-preferences";

// Dashboard Layouts
export * from "./dashboard-layouts";
