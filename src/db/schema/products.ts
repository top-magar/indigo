import { pgTable, uuid, text, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

/**
 * Categories table for organizing products
 */
export const categories = pgTable("categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    parentId: uuid("parent_id"), // Self-reference for nested categories
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantSlugIdx: index("categories_tenant_slug_idx").on(table.tenantId, table.slug),
    parentIdx: index("categories_parent_idx").on(table.parentId),
}));

/**
 * Products table with slug for SEO-friendly URLs
 */
export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    price: text("price").notNull(),
    compareAtPrice: text("compare_at_price"), // Original price for showing discounts
    images: jsonb("images").default([]).$type<string[]>(),
    status: text("status").default("draft").notNull(), // draft, active, archived
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantSlugIdx: index("products_tenant_slug_idx").on(table.tenantId, table.slug),
    categoryIdx: index("products_category_idx").on(table.categoryId),
    statusIdx: index("products_status_idx").on(table.status),
}));

export const productVariants = pgTable("product_variants", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    productId: uuid("product_id").references(() => products.id).notNull(),
    name: text("name").notNull(), // e.g. "Small / Red"
    sku: text("sku"),
    price: text("price"), // Override base price
    options: jsonb("options"), // { size: "S", color: "Red" }
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventoryLevels = pgTable("inventory_levels", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    variantId: uuid("variant_id").references(() => productVariants.id).notNull(),
    quantity: integer("quantity").default(0).notNull(),
    location: text("location").default("default").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
