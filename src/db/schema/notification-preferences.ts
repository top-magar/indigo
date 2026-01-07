import { pgTable, uuid, text, timestamp, boolean, integer, index, unique } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

/**
 * Notification Categories
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 */
export type NotificationCategory = 
  | "orders"      // New orders, order updates, cancellations
  | "inventory"   // Low stock alerts, restock notifications
  | "system"      // Platform updates, maintenance, security
  | "mentions";   // Team mentions, comments, assignments

/**
 * Notification Channels
 */
export type NotificationChannel = 
  | "in_app"      // In-app notification center
  | "email"       // Email notifications
  | "push";       // Push notifications (future)

/**
 * Notification Frequency
 */
export type NotificationFrequency = 
  | "realtime"    // Immediate delivery
  | "daily"       // Daily digest
  | "weekly";     // Weekly digest

/**
 * Notification Preferences Table - User-scoped within tenant
 * 
 * Stores per-user notification preferences for each category/channel combination.
 * 
 * RLS Policy: tenant_id = current_setting('app.current_tenant')::uuid
 */
export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  
  // Preference configuration
  category: text("category").notNull().$type<NotificationCategory>(),
  channel: text("channel").notNull().$type<NotificationChannel>(),
  enabled: boolean("enabled").default(true).notNull(),
  frequency: text("frequency").default("realtime").$type<NotificationFrequency>(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Index for efficient lookups
  tenantUserIdx: index("notification_prefs_tenant_user_idx").on(table.tenantId, table.userId),
  // Unique constraint: one preference per user/category/channel combination
  uniquePreference: unique("notification_prefs_unique").on(table.userId, table.category, table.channel),
}));

/**
 * Quiet Hours Settings Table - User-scoped within tenant
 * 
 * Stores quiet hours configuration per user.
 * During quiet hours, non-urgent notifications are held for later delivery.
 */
export const quietHoursSettings = pgTable("quiet_hours_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  
  // Quiet hours configuration
  enabled: boolean("enabled").default(false).notNull(),
  startTime: text("start_time").default("22:00"), // HH:MM format
  endTime: text("end_time").default("08:00"),     // HH:MM format
  timezone: text("timezone").default("UTC"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Index for efficient lookups
  tenantUserIdx: index("quiet_hours_tenant_user_idx").on(table.tenantId, table.userId),
  // Unique constraint: one quiet hours setting per user
  uniqueUser: unique("quiet_hours_unique_user").on(table.userId),
}));

/**
 * Type exports for use in repositories and actions
 */
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NotificationPreferenceInsert = typeof notificationPreferences.$inferInsert;
export type QuietHoursSetting = typeof quietHoursSettings.$inferSelect;
export type QuietHoursSettingInsert = typeof quietHoursSettings.$inferInsert;
