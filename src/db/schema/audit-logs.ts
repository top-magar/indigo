import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

/**
 * Audit action types supported by the system
 * Format: entity.action
 */
export type AuditAction =
    // Product actions
    | "product.create"
    | "product.update"
    | "product.delete"
    // Order actions
    | "order.create"
    | "order.update"
    | "order.status_change"
    // Customer actions
    | "customer.create"
    | "customer.update"
    // Checkout actions
    | "checkout.start"
    | "checkout.complete"
    | "checkout.fail"
    // Auth actions
    | "auth.login"
    | "auth.logout"
    | "auth.register"
    // Settings actions
    | "settings.update"
    // Store config actions
    | "store_config.update"
    | "store_config.publish"
    // Generic for extensibility
    | string;

/**
 * Entity types that can be audited
 */
export type AuditEntityType =
    | "product"
    | "order"
    | "customer"
    | "checkout"
    | "auth"
    | "settings"
    | "store_config"
    | string;

/**
 * Metadata stored with audit logs
 */
export interface AuditMetadata {
    /** Client IP address */
    ipAddress?: string;
    /** User agent string */
    userAgent?: string;
    /** Unique request identifier */
    requestId?: string;
    /** Session identifier */
    sessionId?: string;
    /** Additional context-specific data */
    [key: string]: unknown;
}

/**
 * Audit logs table - Comprehensive audit trail for all tenant actions
 * 
 * @see scripts/supabase/020-audit-logs.sql
 * @see SYSTEM-ARCHITECTURE.md Security & Compliance
 * 
 * Tracks:
 * - Entity creates, updates, and deletes
 * - Authentication events
 * - Configuration changes
 * - Checkout and order events
 */
export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id"), // nullable for anonymous/system actions
    
    // Action identification
    action: text("action").notNull().$type<AuditAction>(),
    entityType: text("entity_type").notNull().$type<AuditEntityType>(),
    entityId: uuid("entity_id"), // nullable for actions not tied to specific entity
    
    // Change tracking
    oldValues: jsonb("old_values").$type<Record<string, unknown> | null>(),
    newValues: jsonb("new_values").$type<Record<string, unknown> | null>(),
    
    // Request context
    metadata: jsonb("metadata").default({}).$type<AuditMetadata>(),
    
    // Timestamp
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    // Primary lookup: tenant + time range
    tenantCreatedIdx: index("idx_audit_logs_tenant_created").on(table.tenantId, table.createdAt),
    // Filter by action type
    actionIdx: index("idx_audit_logs_action").on(table.action),
    // Lookup by entity
    entityIdx: index("idx_audit_logs_entity").on(table.entityType, table.entityId),
    // Filter by user
    userIdx: index("idx_audit_logs_user").on(table.userId),
}));

/**
 * Type for inserting new audit log entries
 */
export type NewAuditLog = typeof auditLogs.$inferInsert;

/**
 * Type for selecting audit log entries
 */
export type AuditLog = typeof auditLogs.$inferSelect;
