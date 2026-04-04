import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants"; // Assuming tenants schema is available

/**
 * Layouts Table
 * Stores the current state (draft) and published state of a page layout.
 * Supports Atomic Publishing pattern.
 */
export const layouts = pgTable("layouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  
  // Page Identification
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  pageType: text("page_type").default("custom"), // home, product, landing, etc.
  
  // State
  status: text("status").default("draft"), // draft, published, archived
  isLocked: boolean("is_locked").default(false),
  
  // Draft State (Authoritative for Editor)
  draftLayout: jsonb("draft_layout").default({}), 
  draftVersion: integer("draft_version").default(0),
  
  // Published State (Authoritative for Storefront)
  publishedLayout: jsonb("published_layout"),
  publishedVersion: integer("published_version").default(0),
  publishedAt: timestamp("published_at"),
  
  // Metadata
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("layouts_tenant_idx").on(table.tenantId),
  slugIdx: index("layouts_slug_idx").on(table.tenantId, table.slug),
}));

/**
 * Layout Versions Table
 * Immutable history of published versions (and optionally major draft snapshots).
 */
export const layoutVersions = pgTable("layout_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  layoutId: uuid("layout_id").references(() => layouts.id, { onDelete: 'cascade' }).notNull(),
  
  version: integer("version").notNull(),
  name: text("name"), // Optional label for the version (e.g., "Holiday Sale V1")
  
  data: jsonb("data").notNull(), // Full snapshot of the layout
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"), // User ID or System
}, (table) => ({
  tenantIdx: index("layout_versions_tenant_idx").on(table.tenantId),
  layoutVersionIdx: index("layout_versions_idx").on(table.layoutId, table.version),
}));

/**
 * Layout Operations Log (for OT/Collaboration)
 * Stores atomic operations applied to a layout for conflict resolution.
 */
export const layoutOperations = pgTable("layout_operations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  layoutId: uuid("layout_id").references(() => layouts.id, { onDelete: 'cascade' }).notNull(),
  
  version: integer("version").notNull(), // The base version this op was applied to
  operation: jsonb("operation").notNull(), // The OT operation (insert, delete, move, update)
  
  userId: text("user_id"),
  sessionId: text("session_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("layout_ops_tenant_idx").on(table.tenantId),
  layoutOpIdx: index("layout_ops_idx").on(table.layoutId, table.version),
}));

/**
 * Block Locks (for Collaboration)
 * Prevents concurrent editing of the same block.
 */
export const blockLocks = pgTable("block_locks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  layoutId: uuid("layout_id").references(() => layouts.id, { onDelete: 'cascade' }).notNull(),
  blockId: text("block_id").notNull(),
  
  userId: text("user_id").notNull(),
  username: text("username"),
  color: text("color"),
  
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("block_locks_tenant_idx").on(table.tenantId),
  layoutBlockIdx: index("block_locks_layout_idx").on(table.layoutId, table.blockId),
}));

/**
 * Editor Sessions (Presence)
 * Tracks who is currently active in a layout.
 */
export const editorSessions = pgTable("editor_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  layoutId: uuid("layout_id").references(() => layouts.id, { onDelete: 'cascade' }).notNull(),
  
  userId: text("user_id").notNull(),
  sessionId: text("session_id").notNull(),
  
  cursorPosition: jsonb("cursor_position"), // { x, y, blockId }
  
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("editor_sessions_tenant_idx").on(table.tenantId),
}));

/**
 * Page Templates Table
 * User-saved page templates (Craft.js JSON snapshots).
 */
export const pageTemplates = pgTable("page_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  data: jsonb("data").notNull(), // Craft.js serialized JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("page_templates_tenant_idx").on(table.tenantId),
}));
