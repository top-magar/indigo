import { pgTable, uuid, text, timestamp, jsonb, integer, index, varchar, decimal, boolean } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

/**
 * Product status types
 */
export type ProductStatus = "draft" | "active" | "archived";

/**
 * Categories table for organizing products
 * 
 * @see scripts/supabase/002-products-categories.sql
 */
export const categories = pgTable("categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    parentId: uuid("parent_id"), // Self-reference for nested categories
    imageUrl: text("image_url"),
    imageAlt: text("image_alt"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantSlugIdx: index("categories_tenant_slug_idx").on(table.tenantId, table.slug),
    parentIdx: index("categories_parent_idx").on(table.parentId),
}));

/**
 * Products table with full inventory and pricing support
 * 
 * @see scripts/supabase/002-products-categories.sql
 */
export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    
    // Basic Info
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    
    // Pricing
    price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
    
    // Inventory
    sku: varchar("sku", { length: 100 }),
    barcode: varchar("barcode", { length: 100 }),
    quantity: integer("quantity").default(0),
    trackQuantity: boolean("track_quantity").default(true),
    allowBackorder: boolean("allow_backorder").default(false),
    
    // Physical
    weight: decimal("weight", { precision: 10, scale: 2 }),
    weightUnit: varchar("weight_unit", { length: 10 }).default("kg"),
    
    // Status & Organization
    status: varchar("status", { length: 20 }).default("draft").notNull().$type<ProductStatus>(),
    hasVariants: boolean("has_variants").default(false),
    vendor: varchar("vendor", { length: 255 }),
    productType: varchar("product_type", { length: 100 }),
    
    // Media & Metadata
    images: jsonb("images").default([]).$type<{ url: string; alt?: string }[]>(),
    metadata: jsonb("metadata").default({}),
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantSlugIdx: index("products_tenant_slug_idx").on(table.tenantId, table.slug),
    categoryIdx: index("products_category_idx").on(table.categoryId),
    statusIdx: index("products_status_idx").on(table.tenantId, table.status),
    skuIdx: index("products_sku_idx").on(table.tenantId, table.sku),
}));

/**
 * Product variants for products with multiple options
 */
export const productVariants = pgTable("product_variants", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(), // e.g. "Small / Red"
    sku: varchar("sku", { length: 100 }),
    barcode: varchar("barcode", { length: 100 }),
    price: decimal("price", { precision: 10, scale: 2 }), // Override base price
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
    quantity: integer("quantity").default(0),
    weight: decimal("weight", { precision: 10, scale: 2 }),
    weightUnit: varchar("weight_unit", { length: 10 }),
    options: jsonb("options").$type<Record<string, string>>(), // { size: "S", color: "Red" }
    imageUrl: text("image_url"),
    position: integer("position").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    productIdx: index("product_variants_product_idx").on(table.productId),
    skuIdx: index("product_variants_sku_idx").on(table.tenantId, table.sku),
}));

/**
 * Inventory levels for variant-based inventory tracking
 */
export const inventoryLevels = pgTable("inventory_levels", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }).notNull(),
    quantity: integer("quantity").default(0).notNull(),
    location: varchar("location", { length: 100 }).default("default").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    variantIdx: index("inventory_levels_variant_idx").on(table.variantId),
    locationIdx: index("inventory_levels_location_idx").on(table.tenantId, table.location),
}));
