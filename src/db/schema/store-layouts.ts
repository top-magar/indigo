import { pgTable, uuid, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

/**
 * Store Layouts Table
 *
 * Stores theme overrides and layout configuration for storefront pages.
 * Referenced by store/[slug]/layout.tsx and store/[slug]/page.tsx.
 *
 * RLS Policy: tenant_id = current_setting('app.current_tenant')::uuid
 */
export const storeLayouts = pgTable("store_layouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),

  name: text("name").default("Default"),
  isHomepage: boolean("is_homepage").default(false).notNull(),

  /** Theme overrides — colors, fonts, cookie consent, custom CSS */
  themeOverrides: jsonb("theme_overrides").default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("store_layouts_tenant_idx").on(table.tenantId),
  homepageIdx: index("store_layouts_homepage_idx").on(table.tenantId, table.isHomepage),
}));

export type StoreLayoutRow = typeof storeLayouts.$inferSelect;
export type StoreLayoutInsert = typeof storeLayouts.$inferInsert;
