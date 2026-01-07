import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, index, unique } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

/**
 * Widget Position Interface
 * 
 * Defines the position and size of a widget in the dashboard grid.
 */
export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Dashboard Widget Configuration
 * 
 * Stores the configuration for each widget in a layout.
 */
export interface DashboardWidget {
  id: string;
  type: string;
  position: WidgetPosition;
  visible: boolean;
  config?: Record<string, unknown>;
}

/**
 * Dashboard Layouts Table - User-scoped within tenant
 * 
 * Stores customizable dashboard layouts for each user.
 * Users can have multiple named layouts and set one as default.
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 * 
 * RLS Policy: tenant_id = current_setting('app.current_tenant')::uuid
 */
export const dashboardLayouts = pgTable("dashboard_layouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: text("user_id").notNull(),
  
  // Layout configuration
  layoutName: text("layout_name").notNull(),
  widgets: jsonb("widgets").default([]).$type<DashboardWidget[]>(),
  columns: integer("columns").default(12).notNull(),
  rowHeight: integer("row_height").default(100).notNull(),
  gap: integer("gap").default(16).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Index for efficient lookups by tenant
  tenantIdx: index("dashboard_layouts_tenant_idx").on(table.tenantId),
  // Index for efficient lookups by user within tenant
  tenantUserIdx: index("dashboard_layouts_tenant_user_idx").on(table.tenantId, table.userId),
  // Unique constraint: one layout name per user
  uniqueLayoutName: unique("dashboard_layouts_unique_name").on(table.tenantId, table.userId, table.layoutName),
}));

/**
 * Type exports for use in repositories and actions
 */
export type DashboardLayout = typeof dashboardLayouts.$inferSelect;
export type DashboardLayoutInsert = typeof dashboardLayouts.$inferInsert;
